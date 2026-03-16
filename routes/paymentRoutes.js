console.log("Payment Routes Loaded");
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Order = require("../models/OrderModel");
const Counter = require("../models/CounterModel");
const Fuser = require("../models/FuserModel");
const Cart = require("../models/CartModel");
const sendOrderConfirmationEmail = require("../utils/emailService");
const debugLog = require("../utils/logger");

const optionalAuth = require("../middleware/optionalAuth");
const { validateOrder } = require("../middleware/orderValidator");

// 1. Create Razorpay Order
router.post("/create-order", optionalAuth, async (req, res) => {
    try {
        const { amount } = req.body;

        const options = {
            amount: Math.round(amount * 100), // Razorpay works in paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        
        res.status(200).json({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: process.env.RAZORPAY_KEY_ID
        });
    } catch (err) {
        console.error("Razorpay Order Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// 2. Verify Payment and Save Order (ONLINE)
router.post("/verify-payment", optionalAuth, ...validateOrder, async (req, res) => {
    debugLog(`--- VERIFY PAYMENT START ---`);
    debugLog(`Headers: ${JSON.stringify(req.headers)}`);
    debugLog(`Body: ${JSON.stringify(req.body)}`);
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            items,
            shippingAddress,
            billingAddress,
            subtotal,
            shippingFee,
            discount,
            tax,
            total
        } = req.body;

        const userId = req.user ? req.user.id : null;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: "Missing required payment parameters!" });
        }

        if (!process.env.RAZORPAY_SECRET) {
            debugLog.error("ERROR: RAZORPAY_SECRET is missing from .env");
            return res.status(500).json({ message: "Payment configuration error (Missing Secret)" });
        }

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature !== expectedSign) {
            debugLog(`Signature Mismatch! Expected: ${expectedSign}, Received: ${razorpay_signature}`);
            return res.status(400).json({ message: "Invalid payment signature!" });
        }

        // Atomic ID
        const currentYear = new Date().getFullYear();
        const counter = await Counter.findOneAndUpdate(
            { id: `order_${currentYear}` },
            { $inc: { seq: 1 } },
            { upsert: true, new: true }
        );
        const customOrderId = `KB-${currentYear}-${counter.seq.toString().padStart(6, '0')}`;

        const newOrder = new Order({
            customOrderId,
            userId,
            items: items.map(t => ({
                productId: t.productId || t._id,
                name: t.name || t.title,
                price: t.price,
                qty: t.qty || t.quantity,
                image: t.image
            })),
            shippingAddress,
            billingAddress: billingAddress || shippingAddress,
            subtotal,
            shippingFee,
            discount,
            tax,
            totalAmount: total,
            paymentMode: "Online Payment",
            paymentStatus: "Paid",
            orderStatus: "Processing",
            paymentDetails: {
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
            },
            statusHistory: [{ status: "Processing", updatedAt: new Date() }]
        });

        await newOrder.save();
        if (userId) {
            await Cart.updateOne({ userId }, { $set: { items: [], updatedAt: Date.now() } });
        }

        // Email Notification
        const email = userId ? (await Fuser.findById(userId))?.email : (shippingAddress?.email);
        if (email) {
            try {
                await sendOrderConfirmationEmail(email, newOrder);
            } catch (emailErr) {
                console.error("Email Sending Error (non-blocking):", emailErr);
            }
        }

        debugLog(`Verification success: ${customOrderId}`);
        res.status(200).json({ message: "Payment verified and order placed successfully", orderId: newOrder._id, customOrderId });
    } catch (err) {
        debugLog.error(`Verification Error: ${err.message}`);
        console.error("Verification Error:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
});

// 3. Process COD Order
router.post("/cod", optionalAuth, ...validateOrder, async (req, res) => {
    debugLog(`Processing COD order for user: ${req.user ? req.user.id : "Guest"}`);
    try {
        const userId = req.user ? req.user.id : null;
        const { 
            items, 
            shippingAddress, 
            billingAddress, 
            subtotal,
            shippingFee,
            discount,
            tax,
            total 
        } = req.body;

        // Atomic ID
        const currentYear = new Date().getFullYear();
        const counter = await Counter.findOneAndUpdate(
            { id: `order_${currentYear}` },
            { $inc: { seq: 1 } },
            { upsert: true, new: true }
        );
        const customOrderId = `KB-${currentYear}-${counter.seq.toString().padStart(6, '0')}`;

        const newOrder = new Order({
            customOrderId,
            userId,
            items: items.map(t => ({
                productId: t.productId || t._id,
                name: t.name || t.title,
                price: t.price,
                qty: t.qty || t.quantity,
                image: t.image
            })),
            shippingAddress,
            billingAddress: billingAddress || shippingAddress,
            subtotal,
            shippingFee,
            discount,
            tax,
            totalAmount: total,
            paymentMode: "Cash on Delivery",
            paymentStatus: "Pending",
            orderStatus: "Pending",
            statusHistory: [{ status: "Pending", updatedAt: new Date() }]
        });

        await newOrder.save();
        if (userId) {
            await Cart.updateOne({ userId }, { $set: { items: [], updatedAt: Date.now() } });
        }

        const email = userId ? (await Fuser.findById(userId))?.email : (shippingAddress?.email);
        if (email) {
            try {
                await sendOrderConfirmationEmail(email, newOrder);
            } catch (emailErr) {
                console.error("Email Sending Error (non-blocking):", emailErr);
            }
        }

        debugLog(`COD Order placed successfully: ${customOrderId}`);
        res.status(201).json({ message: "Order placed successfully (COD)", orderId: newOrder._id, customOrderId });
    } catch (err) {
        debugLog.error(`COD Order Error: ${err.message}`);
        console.error("COD Order Error:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
});

// 4. Razorpay Webhook (Production Security)
router.post("/webhook", async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    if (!secret || !signature) {
        return res.status(400).send("Webhook configuration error");
    }

    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");

    if (signature !== expectedSignature) {
        debugLog.error("Webhook Signature Mismatch!");
        return res.status(400).send("Invalid signature");
    }

    const { event, payload } = req.body;

    if (event === "payment.captured") {
        const orderId = payload.payment.entity.order_id;
        debugLog(`Webhook: Payment captured for order ${orderId}`);
        
        // Update order status in DB
        try {
            const order = await Order.findOne({ "paymentDetails.razorpayOrderId": orderId });
            if (order && order.paymentStatus !== "Paid") {
                order.paymentStatus = "Paid";
                order.orderStatus = "Processing";
                order.statusHistory.push({ status: "Paid (via Webhook)", updatedAt: new Date() });
                await order.save();
                debugLog(`Webhook: Order ${order.customOrderId} updated to Paid`);
            }
        } catch (err) {
            debugLog.error(`Webhook Processing Error: ${err.message}`);
        }
    }

    res.status(200).send("Webhook received");
});

module.exports = router;

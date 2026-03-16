const express = require("express");
const router = express.Router();
const Order = require("../models/OrderModel");
const verifyToken = require("../middleware/routeAuth");
const adminAuth = require("../middleware/adminAuth");

// ✅ Place Order
router.post("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { items, address, paymentMode, total } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "No items in order" });
        }

        // Ensure we store a snapshot
        const snapshotItems = items.map(item => ({
            productId: item._id || item.productId,
            name: item.title || item.name,
            price: item.price,
            qty: item.quantity || item.qty || 1,
            image: item.image
        }));

        const newOrder = new Order({
            userId,
            items: snapshotItems,
            address,
            paymentMode,
            total,
            orderStatus: "Pending",
            statusHistory: [{ status: "Pending", updatedAt: new Date() }]
        });

        const savedOrder = await newOrder.save();
        res.json({ message: "Order placed successfully", order: savedOrder });
    } catch (err) {
        console.error("Order error:", err);
        res.status(500).json({ message: "Failed to place order" });
    }
});

// ✅ Fetch User Orders (User only sees their own)
router.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching user orders" });
    }
});

// ✅ Fetch All Orders (Admin only)
router.get("/all", adminAuth, async (req, res) => {
    console.log("Admin fetching all orders...");
    try {
        // Find all orders first
        const allOrders = await Order.find().sort({ createdAt: -1 });
        
        // Manually populate to handle cases where userId might be invalid/missing
        const populatedOrders = await Promise.all(allOrders.map(async (order) => {
            try {
                const orderObj = order.toObject();
                if (orderObj.userId) {
                    try {
                        const Fuser = require("../models/FuserModel");
                        // Ensure userId is a valid ObjectId before querying
                        const user = await Fuser.findById(orderObj.userId).select("name email");
                        orderObj.userId = user || { name: "Removed User", email: "N/A" };
                    } catch (err) {
                        console.error(`Failed to populate user for order ${order._id}:`, err.message);
                        orderObj.userId = { name: "Invalid User", email: "N/A" };
                    }
                } else {
                    orderObj.userId = { name: "Guest/Anonymous", email: "N/A" };
                }
                return orderObj;
            } catch (err) {
                console.error(`CRITICAL: Failed to process order object for ${order._id}:`, err.message);
                return null; // Filtered out below
            }
        }));

        const filteredPopulatedOrders = populatedOrders.filter(o => o !== null);
        console.log(`Found ${allOrders.length} orders, successfully processed ${filteredPopulatedOrders.length}`);
        res.json(filteredPopulatedOrders);
    } catch (err) {
        console.error("Error in GET /order/all:", err);
        res.status(500).json({ message: "Error fetching all orders", error: err.message });
    }
});

// ✅ Fetch Single Order
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate("userId", "name email");
        if (!order) return res.status(404).json({ message: "Order not found" });

        // Security check: User can only see their own order unless they are admin
        if (order.userId._id.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }

        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Update Order Status (Admin only)
router.patch("/:id/status", adminAuth, async (req, res) => {
    try {
        const orderStatus = req.body.orderStatus || req.body.status;
        const estimatedDelivery = req.body.estimatedDelivery;
        const validStatuses = [
            "Pending", "Confirmed", "Processing", 
            "Shipped", "Out for Delivery", "Delivered", 
            "Cancelled", "Returned"
        ];
        
        if (!validStatuses.includes(orderStatus)) {
            console.warn(`Invalid status rejected: "${orderStatus}"`);
            return res.status(400).json({ message: "Invalid status", received: orderStatus });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        order.orderStatus = orderStatus;
        order.statusHistory.push({ status: orderStatus, updatedAt: new Date() });

        if (estimatedDelivery) {
            order.estimatedDelivery = estimatedDelivery;
        }

        await order.save();

        res.json({ message: "Order status updated", order });
    } catch (err) {
        console.error("Error updating status:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Delete Order
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        // Security: Users can only delete their own orders
        if (order.userId && order.userId.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }

        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: "Order deleted successfully" });
    } catch (err) {
        console.error("Delete order error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

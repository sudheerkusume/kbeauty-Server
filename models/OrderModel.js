const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    customOrderId: { type: String, unique: true }, // Format: KB-YYYY-XXXXXX
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Fuser", required: false }, // Optional for Guest Checkout
    guestEmail: { type: String },
    guestPhone: { type: String },
    
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            qty: { type: Number, required: true },
            image: { type: String }
        }
    ],
    
    shippingAddress: {
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        address: String,
        apartment: String,
        city: String,
        state: String,
        pincode: String
    },
    
    billingAddress: {
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        address: String,
        apartment: String,
        city: String,
        state: String,
        pincode: String
    },
    
    paymentMode: { 
        type: String, 
        enum: ["Cash on Delivery", "Online Payment"], 
        default: "Cash on Delivery" 
    },
    
    paymentStatus: { 
        type: String, 
        enum: ["Pending", "Paid", "Failed"], 
        default: "Pending",
        index: true 
    },
    
    // Financial Snapshots
    subtotal: { type: Number, required: true, default: 0 },
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    
    currency: { type: String, default: "INR" },
    
    orderStatus: { 
        type: String, 
        enum: ["Pending", "Confirmed", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"], 
        default: "Pending",
        index: true
    },
    estimatedDelivery: { type: Date },
    
    paymentDetails: {
        razorpayOrderId: String,
        razorpayPaymentId: String,
        razorpaySignature: String
    },
    
    statusHistory: [
        {
            status: { type: String, required: true },
            updatedAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

// Compound index for admin filtering
orderSchema.index({ orderStatus: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);

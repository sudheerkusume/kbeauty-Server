require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/OrderModel');

async function checkOrders() {
    await mongoose.connect('mongodb://localhost:27017/kbeautymart');
    console.log("Connected to DB");
    
    const orders = await Order.find().sort({ createdAt: -1 }).limit(3);
    console.log("Last 3 orders:");
    orders.forEach(o => {
        console.log(`ID: ${o._id}, User: ${o.userId}, Mode: ${o.paymentMode}, Date: ${o.createdAt}`);
    });
    
    await mongoose.disconnect();
}

checkOrders();

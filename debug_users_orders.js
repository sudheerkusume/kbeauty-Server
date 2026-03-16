require('dotenv').config();
const mongoose = require('mongoose');
const Fuser = require('./models/FuserModel');
const Order = require('./models/OrderModel');

async function debugData() {
    await mongoose.connect('mongodb://localhost:27017/kbeautymart');
    
    console.log("--- Users ---");
    const users = await Fuser.find().limit(5);
    users.forEach(u => console.log(`ID: ${u._id}, Email: ${u.email}, Name: ${u.name}`));
    
    console.log("\n--- Recent Orders ---");
    const orders = await Order.find().sort({ createdAt: -1 }).limit(5);
    for (const o of orders) {
        console.log(`Order: ${o._id}, UserRef: ${o.userId}, Mode: ${o.paymentMode}`);
        if (o.userId) {
            const user = await Fuser.findById(o.userId);
            console.log(`   -> Found User: ${user ? user.email : "NOT FOUND"}`);
        }
    }
    
    await mongoose.disconnect();
}

debugData();

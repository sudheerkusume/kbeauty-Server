const mongoose = require('mongoose');
const Order = require('./models/OrderModel');
require('./db');

async function checkOrders() {
    try {
        const count = await Order.countDocuments();
        console.log('Total orders in DB:', count);
        const orders = await Order.find().limit(5);
        console.log('Sample orders:', JSON.stringify(orders, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error checking orders:', err);
        process.exit(1);
    }
}

setTimeout(checkOrders, 2000); // Wait for DB connection

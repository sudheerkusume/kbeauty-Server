require('dotenv').config();
const { sendOrderConfirmationEmail } = require('./utils/emailService');

const testOrder = {
    _id: "TEST_ORDER_12345",
    items: [
        {
            name: "Test Product 1",
            price: 1500,
            qty: 2,
            image: "https://via.placeholder.com/150"
        },
        {
            name: "Test Product 2",
            price: 2500,
            qty: 1,
            image: "https://via.placeholder.com/150"
        }
    ],
    totalAmount: 5500,
    shippingAddress: "123 Test Street, Debug City, 560001",
    paymentMode: "Mock Test",
    paymentStatus: "paid"
};

// Replace with your personal email to test the inbox delivery
const testRecipient = "test@example.com"; 

console.log(`Attempting to send test email to: ${testRecipient}...`);

sendOrderConfirmationEmail(testRecipient, testOrder)
    .then(() => {
        console.log("✅ Test email script finished!");
        console.log("Please check your 'Sent' folder and the recipient's inbox.");
    })
    .catch((err) => {
        console.error("❌ Email test failed:", err);
    });

const sendOrderConfirmationEmail = require("./emailService");

/**
 * Legacy wrapper for sendEmail to use Resend
 */
const sendEmail = async (to, subject, text) => {
    // Note: This is an simplified version for the old sendEmail interface
    // Since we are using Resend primarily for order confirmations, 
    // this wrapper exists for compatibility.
    console.log(`Legacy sendEmail called for ${to}. Redirecting to Resend logic (if implemented).`);
    // If you need general text emails via Resend, add a method in emailService.js
};

module.exports = sendEmail;
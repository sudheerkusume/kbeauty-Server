const { Resend } = require("resend");
const debugLog = require("./logger");

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send Order Confirmation Email (HTML Formatted) using Resend
 * @param {string} userEmail 
 * @param {object} order 
 */
const sendOrderConfirmationEmail = async (userEmail, order) => {
    try {
        const productListHtml = order.items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                    <img src="${item.image}" alt="${item.name}" width="50" style="vertical-align: middle; margin-right: 10px;">
                    ${item.name}
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.qty}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toLocaleString()}</td>
            </tr>
        `).join("");

        const emailBody = `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #D4AF37; margin: 0;">K Beauty Mart</h1>
                    <p style="color: #666; font-size: 14px;">Your Premium K-Beauty Destination</p>
                </div>
                
                <h2 style="color: #333;">Order Confirmed!</h2>
                <p>Hello,</p>
                <p>Thank you for shopping with us. Your order has been successfully placed.</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order._id}</p>
                    <p style="margin: 5px 0;"><strong>Payment Mode:</strong> ${order.paymentMode}</p>
                    <p style="margin: 5px 0;"><strong>Status:</strong> ${order.paymentStatus === 'paid' ? 'Paid' : 'Pending (COD)'}</p>
                </div>

                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #f3f3f3;">
                            <th style="padding: 10px; text-align: left;">Product</th>
                            <th style="padding: 10px; text-align: center;">Qty</th>
                            <th style="padding: 10px; text-align: right;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productListHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 18px;">Total Amount:</td>
                            <td style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 18px; color: #D4AF37;">₹${order.totalAmount.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="margin-bottom: 5px;"><strong>Shipping Address:</strong></p>
                    <p style="color: #555; margin: 0;">${order.shippingAddress}</p>
                </div>

                <div style="text-align: center; margin-top: 40px; color: #888; font-size: 12px;">
                    <p>If you have any questions, contact us at support@kglowmart.in</p>
                    <p>&copy; ${new Date().getFullYear()} K Beauty Mart. All rights reserved.</p>
                </div>
            </div>
        `;

        const { data, error } = await resend.emails.send({
            from: "K Beauty Mart <noreply@kglowmart.in>",
            to: userEmail,
            subject: `Order Confirmation - #${order._id}`,
            html: emailBody,
        });

        if (error) {
            debugLog(`Resend API Error: ${JSON.stringify(error)}`);
        } else {
            debugLog(`Resend Success: Email sent to ${userEmail}. ID: ${data.id}`);
        }
    } catch (err) {
        debugLog(`Resend Exception: ${err.message}`);
    }
};

module.exports = sendOrderConfirmationEmail;
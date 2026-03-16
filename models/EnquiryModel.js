const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema({
    user: String,
    mobile: String,
    email: String,
    matter: String,
    message: String,
    status: {
        type: String,
        default: "Pending",
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Enquiry", enquirySchema);

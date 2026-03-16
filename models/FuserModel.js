const mongoose = require("mongoose");

const fuserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobile: { type: String },
    firebaseUid: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    address: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    cart: {
        type: Array,
        default: []
    },
    lastLogin: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
    lastActiveAt: { type: Date, default: Date.now },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Fuser", fuserSchema);
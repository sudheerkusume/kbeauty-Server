const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Fuser", required: true },
    items: { type: Array, default: [] },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Wishlist", wishlistSchema);

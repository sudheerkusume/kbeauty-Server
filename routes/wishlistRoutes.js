const express = require("express");
const router = express.Router();
const Wishlist = require("../models/WishlistModel");
const verifyToken = require("../middleware/routeAuth");

// ✅ Add/Update Wishlist
router.post("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { items } = req.body;
        console.log(`Updating wishlist for user ${userId}, items count: ${items?.length}`);

        let wishlist = await Wishlist.findOne({ userId });

        if (wishlist) {
            wishlist.items = items;
            wishlist.updatedAt = Date.now();
            await wishlist.save();
        } else {
            wishlist = new Wishlist({ userId, items });
            await wishlist.save();
        }

        res.json({ message: "Wishlist updated successfully", wishlist });
    } catch (err) {
        console.error("Wishlist update error:", err);
        res.status(500).json({ message: "Wishlist update failed" });
    }
});

// ✅ Fetch Wishlist
router.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const wishlist = await Wishlist.findOne({ userId });
        console.log(`Fetched wishlist for user ${userId}, items count: ${wishlist?.items?.length || 0}`);
        res.json({ items: wishlist?.items || [] });
    } catch (error) {
        console.error("Fetch Wishlist Error:", error);
        res.status(500).json({ message: "Error fetching wishlist" });
    }
});

module.exports = router;

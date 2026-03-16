const express = require("express");
const router = express.Router();
const Cart = require("../models/CartModel");
const verifyToken = require("../middleware/routeAuth");

// ✅ Add/Update cart
router.post("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { items } = req.body;

        let cart = await Cart.findOne({ userId });

        if (cart) {
            cart.items = items;
            cart.updatedAt = Date.now();
            await cart.save();
        } else {
            cart = new Cart({ userId, items });
            await cart.save();
        }

        res.json({ message: "Cart updated successfully", cart });
    } catch (err) {
        console.error("Cart update error:", err);
        res.status(500).json({ message: "Cart update failed" });
    }
});

// ✅ Fetch cart
router.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({ userId });
        res.json({ items: cart?.items || [] });
    } catch (error) {
        console.error("Fetch Cart Error:", error);
        res.status(500).json({ message: "Error fetching cart" });
    }
});

// ✅ Remove item from cart
router.post("/remove-item", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.items = cart.items.filter(
            item => (item.productId !== productId && item._id?.toString() !== productId)
        );
        await cart.save();

        res.json({ message: "Item removed", items: cart.items });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;

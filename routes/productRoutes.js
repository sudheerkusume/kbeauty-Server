const express = require("express");
const router = express.Router();

const Product = require("../models/ProductModel");
const adminAuth = require("../middleware/adminAuth");
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");


// GET all products (with optional filtering)
router.get("/", async (req, res) => {
    try {
        const { category, type, brand, bestseller } = req.query;
        let filter = {};

        if (category) filter.category = { $regex: new RegExp(`^${category}$`, "i") };
        if (type) filter.type = { $regex: new RegExp(`^${type}$`, "i") };
        if (brand) filter.brand = { $regex: new RegExp(`^${brand}$`, "i") };
        if (bestseller) filter.bestseller = bestseller === "true";

        const products = await Product.find(filter);
        res.send(products);
    } catch (err) {
        res.status(500).send({ message: "Error fetching products", error: err.message });
    }
});

// GET single product by ID
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send({ message: "Product not found" });
        }
        res.send(product);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(404).send({ message: "Invalid Product ID format" });
        }
        res.status(500).send({ message: "Error fetching product", error: err.message });
    }
});

// ADD product (Admin Only)
router.post("/", adminAuth, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
    try {
        const { title, price, brand, category } = req.body;
        if (!title || !price || !brand || !category) {
            return res.status(400).send({ message: "Title, Price, Brand, and Category are required" });
        }
        const productData = { ...req.body };

        // Handle Images
        if (req.files && req.files['images']) {
            productData.images = req.files['images'].map(file => file.path);
        }

        // Handle Video
        if (req.files && req.files['video']) {
            productData.videoUrl = req.files['video'][0].path;
        }

        const product = new Product(productData);
        const result = await product.save();
        res.send(result);
    } catch (err) {
        console.error("Add product error:", err);
        res.status(500).send({ message: "Failed to add product", error: err.message });
    }
});


// UPDATE product (Admin Only)
router.put("/:id", adminAuth, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
    try {
        const { title, price, brand, category } = req.body;
        if (!title || !price || !brand || !category) {
            return res.status(400).send({ message: "Title, Price, Brand, and Category are required" });
        }
        const updateData = { ...req.body };

        // Handle New Images (if any)
        if (req.files && req.files['images']) {
            const newImages = req.files['images'].map(file => file.path);
            // If images were already present in body (as strings), merge them
            const existingImages = updateData.images ? (Array.isArray(updateData.images) ? updateData.images : [updateData.images]) : [];
            updateData.images = [...existingImages, ...newImages];
        }

        // Handle New Video
        if (req.files && req.files['video']) {
            updateData.videoUrl = req.files['video'][0].path;
        }

        const result = await Product.updateOne(
            { _id: req.params.id },
            { $set: updateData }
        );

        res.send(result);
    } catch (err) {
        console.error("Update product error:", err);
        res.status(500).send({ message: "Failed to update product", error: err.message });
    }
});


// DELETE product (Admin Only)
router.delete("/:id", adminAuth, async (req, res) => {

    const result = await Product.deleteOne({ _id: req.params.id });
    res.send(result);

});


module.exports = router;
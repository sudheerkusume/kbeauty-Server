const express = require("express");
const router = express.Router();

const Brand = require("../models/BrandModel");
const adminAuth = require("../middleware/adminAuth");
const upload = require("../middleware/upload");


// GET all brands
router.get("/", async (req, res) => {
    try {
        const brands = await Brand.find();
        res.send(brands);
    } catch (err) {
        res.status(500).send({ message: "Error fetching brands", error: err.message });
    }
});


// ADD brand (Admin Only)
router.post("/", adminAuth, upload.single("img"), async (req, res) => {
    try {
        const { name, slug } = req.body;
        if (!name || !slug) {
            return res.status(400).send({ message: "Name and Slug are required" });
        }
        const brandData = { ...req.body };

        if (req.file) {
            brandData.img = req.file.path; // Cloudinary URL
        }

        const brand = new Brand(brandData);
        const result = await brand.save();
        res.send(result);
    } catch (err) {
        console.error("Add brand error:", err);
        res.status(500).send({ message: "Failed to add brand", error: err.message });
    }
});


// UPDATE brand (Admin Only)
router.put("/:id", adminAuth, upload.single("img"), async (req, res) => {
    try {
        const { name, slug } = req.body;
        if (!name || !slug) {
            return res.status(400).send({ message: "Name and Slug are required" });
        }
        const updateData = { ...req.body };

        if (req.file) {
            updateData.img = req.file.path; // New Cloudinary URL
        }

        const result = await Brand.updateOne(
            { _id: req.params.id },
            { $set: updateData }
        );

        res.send(result);
    } catch (err) {
        console.error("Update brand error:", err);
        res.status(500).send({ message: "Failed to update brand", error: err.message });
    }
});


// DELETE brand (Admin Only)
router.delete("/:id", adminAuth, async (req, res) => {
    try {
        const result = await Brand.deleteOne({ _id: req.params.id });
        res.send(result);
    } catch (err) {
        res.status(500).send({ message: "Failed to delete brand", error: err.message });
    }
});

module.exports = router;
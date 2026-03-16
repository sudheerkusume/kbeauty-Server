const express = require("express");
const router = express.Router();

const Blog = require("../models/BlogModel");
const adminAuth = require("../middleware/adminAuth");
const upload = require("../middleware/upload");


// GET all blogs
router.get("/", async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.send(blogs);
    } catch (err) {
        res.status(500).send({ message: "Error fetching blogs", error: err.message });
    }
});


// GET single blog
router.get("/:id", async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).send({ message: "Blog not found" });
        res.send(blog);
    } catch (err) {
        res.status(500).send({ message: "Error fetching blog", error: err.message });
    }
});


// ADD blog (Admin Only)
router.post("/", adminAuth, upload.single("img"), async (req, res) => {
    try {
        const blogData = { ...req.body };

        if (req.file) {
            blogData.img = req.file.path; // Cloudinary URL
        }

        const blog = new Blog(blogData);
        const result = await blog.save();
        res.send(result);
    } catch (err) {
        console.error("Add blog error:", err);
        res.status(500).send({ message: "Failed to add blog", error: err.message });
    }
});


// UPDATE blog (Admin Only)
router.put("/:id", adminAuth, upload.single("img"), async (req, res) => {
    try {
        const updateData = { ...req.body };

        if (req.file) {
            updateData.img = req.file.path; // New Cloudinary URL
        }

        const result = await Blog.updateOne(
            { _id: req.params.id },
            { $set: updateData }
        );

        res.send(result);
    } catch (err) {
        console.error("Update blog error:", err);
        res.status(500).send({ message: "Failed to update blog", error: err.message });
    }
});


// DELETE blog (Admin Only)
router.delete("/:id", adminAuth, async (req, res) => {
    try {
        const result = await Blog.deleteOne({ _id: req.params.id });
        res.send(result);
    } catch (err) {
        res.status(500).send({ message: "Failed to delete blog", error: err.message });
    }
});


module.exports = router;
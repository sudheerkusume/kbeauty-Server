const express = require("express");
const router = express.Router();

const Category = require("../models/CategoryModel");


// GET all categories
router.get("/", async (req, res) => {

    const categories = await Category.find();
    res.send(categories);

});


// ADD category
router.post("/", async (req, res) => {

    const category = new Category(req.body);
    const result = await category.save();

    res.send(result);

});


// UPDATE category
router.put("/:id", async (req, res) => {

    const result = await Category.updateOne(
        { _id: req.params.id },
        { $set: req.body }
    );

    res.send(result);

});


// DELETE category
router.delete("/:id", async (req, res) => {

    const result = await Category.deleteOne({ _id: req.params.id });

    res.send(result);

});

module.exports = router;
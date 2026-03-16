const express = require("express");
const router = express.Router();
const Ingredient = require("../models/IngredientModel");

// GET all ingredients for discovery section
router.get("/", async (req, res) => {
    try {
        const ingredients = await Ingredient.find();
        res.send(ingredients);
    } catch (err) {
        res.status(500).send({ message: "Error fetching ingredients", error: err.message });
    }
});

// ADD ingredient (Admin/Seeding)
router.post("/", async (req, res) => {
    try {
        const ingredient = new Ingredient(req.body);
        const result = await ingredient.save();
        res.status(201).send(result);
    } catch (err) {
        res.status(400).send({ message: "Error adding ingredient", error: err.message });
    }
});

module.exports = router;

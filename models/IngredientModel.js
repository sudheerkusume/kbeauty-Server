const mongoose = require("mongoose");

const IngredientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    img: { type: String, required: true },
    concern: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Ingredient", IngredientSchema);

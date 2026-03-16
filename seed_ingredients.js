const mongoose = require("mongoose");
const Ingredient = require("./models/IngredientModel");
require("./db");

const ingredients = [
    { name: "Rice", img: "rice.avif", concern: "Brightening & Smoothing" },
    { name: "Snail Mucin", img: "snail.avif", concern: "Repairing & Hydrating" },
    { name: "Centella", img: "centella.avif", concern: "Calming & Soothing" },
    { name: "Mugwort", img: "mugwort.avif", concern: "Purifying & Detox" },
    { name: "Ginseng", img: "ginseng.avif", concern: "Anti-Aging & Vitality" },
    { name: "Green Tea", img: "greentea.avif", concern: "Antioxidant & Oil Control" }
];

async function seed() {
    try {
        console.log("Connecting to database...");
        // db.js handles connection, but we wait a bit for it to be ready
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log("Cleaning existing ingredients...");
        await Ingredient.deleteMany({});

        console.log("Seeding ingredients...");
        const result = await Ingredient.insertMany(ingredients);
        console.log(`Successfully seeded ${result.length} ingredients.`);
        
    } catch (err) {
        console.error("Seeding failed:", err);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
}

seed();

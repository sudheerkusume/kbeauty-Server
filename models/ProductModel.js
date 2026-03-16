const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({

    title: String,
    brand: String,
    category: String,
    type: String,
    slug: String,

    price: Number,
    offerPrice: Number,
    size: String,

    stockQuantity: Number,
    rating: Number,

    description: String,
    bestseller: Boolean,

    Country: String,
    images: [String],
    videoUrl: String,

    skinType: [String],
    skinConcern: [String],

    benefits: [String],
    keyIngredients: [String],
    howToUse: [String],

    shippingInfo: String,
    faqs: [String]
}, { timestamps: true });

module.exports = mongoose.model("Product", ProductSchema);
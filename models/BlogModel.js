const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({

    title: String,
    category: String,
    img: String,
    Question: String,
    Answer: String
}, { timestamps: true });

module.exports = mongoose.model("BlogPost", BlogSchema);
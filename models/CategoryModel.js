const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({

    name: String,
    slug: String

});

module.exports = mongoose.model("Category", CategorySchema);
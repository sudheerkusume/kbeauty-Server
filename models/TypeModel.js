const mongoose = require("mongoose");

const TypeSchema = new mongoose.Schema({

    name: String,
    category: String,
    slug: String

});

module.exports = mongoose.model("Type", TypeSchema);
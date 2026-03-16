const mongoose = require("mongoose");

const BrandSchema = new mongoose.Schema({

    name: String,
    img: String,
    slug: String

});

module.exports = mongoose.model("Brand", BrandSchema);
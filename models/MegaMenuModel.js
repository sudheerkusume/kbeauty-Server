const mongoose = require("mongoose");

const MegaMenuSchema = new mongoose.Schema({

    category: String,
    columns: Array,
    promo: Object

});

module.exports = mongoose.model("MegaMenu", MegaMenuSchema);
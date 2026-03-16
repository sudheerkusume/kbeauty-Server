const express = require("express");
const router = express.Router();

const MegaMenu = require("../models/MegaMenuModel");


// GET menu
router.get("/", async (req, res) => {

    const menu = await MegaMenu.find();
    res.send(menu);

});


// ADD menu
router.post("/", async (req, res) => {

    const menu = new MegaMenu(req.body);
    const result = await menu.save();

    res.send(result);

});


// UPDATE menu
router.put("/:id", async (req, res) => {

    const result = await MegaMenu.updateOne(
        { _id: req.params.id },
        { $set: req.body }
    );

    res.send(result);

});


// DELETE menu
router.delete("/:id", async (req, res) => {

    const result = await MegaMenu.deleteOne({ _id: req.params.id });

    res.send(result);

});

module.exports = router;
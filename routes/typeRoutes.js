const express = require("express");
const router = express.Router();

const Type = require("../models/TypeModel");


// GET all types
router.get("/", async (req, res) => {

    const types = await Type.find();
    res.send(types);

});


// ADD type
router.post("/", async (req, res) => {

    const type = new Type(req.body);
    const result = await type.save();

    res.send(result);

});


// UPDATE type
router.put("/:id", async (req, res) => {

    const result = await Type.updateOne(
        { _id: req.params.id },
        { $set: req.body }
    );

    res.send(result);

});


// DELETE type
router.delete("/:id", async (req, res) => {

    const result = await Type.deleteOne({ _id: req.params.id });

    res.send(result);

});

module.exports = router;
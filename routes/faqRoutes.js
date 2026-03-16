const express = require("express");
const router = express.Router();

const Faq = require("../models/FaqModel");


// GET all FAQ
router.get("/", async (req, res) => {

    const faqs = await Faq.find();
    res.send(faqs);

});


// ADD FAQ
router.post("/", async (req, res) => {

    const faq = new Faq(req.body);
    const result = await faq.save();

    res.send(result);

});


// UPDATE FAQ
router.put("/:id", async (req, res) => {

    const result = await Faq.updateOne(
        { _id: req.params.id },
        { $set: req.body }
    );

    res.send(result);

});


// DELETE FAQ
router.delete("/:id", async (req, res) => {

    const result = await Faq.deleteOne({ _id: req.params.id });

    res.send(result);

});

module.exports = router;
const express = require("express");
const router = express.Router();

const Enquiry = require("../models/EnquiryModel");
const adminAuth = require("../middleware/adminAuth");


// create
router.post("/", async (req, res) => {

    const enquiry = new Enquiry(req.body);
    const result = await enquiry.save();

    res.send(result);

});


// read (Admin Only)
router.get("/", adminAuth, async (req, res) => {

    const data = await Enquiry.find();
    res.send(data);

});


// delete (Admin Only)
router.delete("/:id", adminAuth, async (req, res) => {

    const result = await Enquiry.deleteOne({ _id: req.params.id });
    res.send(result);

});


module.exports = router;
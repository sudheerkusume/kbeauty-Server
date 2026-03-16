require("dotenv").config();
const mongoose = require("mongoose")

const dburl = process.env.MONGO_URL;
mongoose.connect(dburl)
    .then(() => {
        console.log('Mongodb Atlas Connected')
    })
    .catch((err) => {
        console.log("Db Connection Error:", err)
    });
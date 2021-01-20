const mongoose = require("mongoose");

const orderschema = new mongoose.Schema({
    fullname: String,
    total: String,
    email: String,
    address: String,
    numphone: String,
    note: String,
    date: String,
    product: []
});

const order = mongoose.model("order", orderschema);

module.exports = order


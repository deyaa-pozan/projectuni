
const mongoose = require("mongoose");

const Categoryschema = new mongoose.Schema({
  nameCategory: {
    type: String,
    required: true
  }
});

const category = new mongoose.model("category", Categoryschema);

module.exports = category
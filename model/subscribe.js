
const mongoose = require("mongoose");

const subscribeschema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  }
});

const subscribe = new mongoose.model("subscribe", subscribeschema);

module.exports = subscribe
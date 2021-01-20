
const mongoose = require("mongoose");

const adminschema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

const admin = new mongoose.model("admin", adminschema);

module.exports = admin
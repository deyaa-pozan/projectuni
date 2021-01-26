
const mongoose = require("mongoose");

const feedbackschema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }
});

const feedback = new mongoose.model("feedback", feedbackschema);

module.exports = feedback
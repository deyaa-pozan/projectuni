
const mongoose = require("mongoose");

const userschema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  username: { type: String },
  email: {
    type: String,
    unique: true

  },
  password: { type: String },
  date: {
    type: Date,
    default: Date.now
  },
  isVerified: { type: Boolean, default: false },
  passwordResetToken: String,
  passwordResetExpires: Date,
  productitem: []
});

const user = new mongoose.model("user", userschema);

module.exports = user
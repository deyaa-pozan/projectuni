const mongoose = require("mongoose");


 const tokenschema = new mongoose.Schema({
    _userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },
    token: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now, expires: 43200 }
});
const token = new mongoose.model("token" ,tokenschema);

module.exports = token
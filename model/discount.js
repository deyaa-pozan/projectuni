const mongoose = require("mongoose");

const discountschema = new mongoose.Schema({
	_productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'product' },
    discountproduct: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now}
});

const discount = mongoose.model("discount", discountschema);

module.exports = discount


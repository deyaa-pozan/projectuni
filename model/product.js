const mongoose = require("mongoose");

const productschema = new mongoose.Schema({
	_id:String,
	captiond : String,
	priced:String,
	descriptiond:String,
	departmentd:String,
	stored : String,
	countshop : Number,
	review : Number,
	img:  [String] 
    
        
        
    
});

const product = mongoose.model("product", productschema);
module.exports = product


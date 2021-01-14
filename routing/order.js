const express = require("express");
const order = require("../model/order");
const user = require("../model/user");

const app = express();
const session = require("express-session");
const passport = require("passport");
const passportlocalmongoose = require("passport-local-mongoose");
const { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } = require("constants");
const product = require("../model/product");
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

 

app.get('/checkout',ensureAuthenticated,(req, res) =>{
  res.render('checkout', { cart:req.session.cart})
});


  


app.post("/send" , function(req,res){
 var email = req.session.passport.user.email;
 var fullName = req.body.fullname ;
 var address = req.body.address ;
 var numphone = req.body.numphone;
 var note = req.body.note ;
 var cart = req.session.cart;
 var total =0;
 cart.forEach(function(product){ 
 
 total = (product.price*product.qy)+total
  });


 var newOrder = new order({
    email:email,
    fullname :fullName,
    address : address,
    numphone : numphone,
    note :note ,
    total :total,
    date:new Date(),
    product : req.session.cart

});
newOrder.save(function(error){
  if(!error){
    console.log(fullName)
  }else{
    console.log(error)
  }
});
var c =req.session.cart;
var arr=[];
c.forEach(element => {
  product.findById(element.barcode,function(err,pro){
    if (!err) {
     pro.stored = pro.stored - element.qy;
     pro.countshop = pro.countshop + element.qy;
     pro.save(function(error){
       if (error)
       {
          console.log(error);
       }
     });
    }


  });

 arr.push(element.barcode)


});


user.findOneAndUpdate({email:email}, {$addToSet:{productitem:arr}},function(err,found){
if(err){
    console.log(err);
}
else{

}
});




req.session.cart=[];
res.redirect("/");
 });

   
        

module.exports = app ;


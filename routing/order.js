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
 var x =0;
 cart.forEach(function(product){ 
 
 x = (product.price*product.qy)+x
  });


 var newOrder = new order({
    email:email,
    fullname :fullName,
    address : address,
    numphone : numphone,
    note :note ,
    total :x,
    date:new Date(),
    product : req.session.cart

});
newOrder.save(function(error){
  if(!error){
   
    console.log(fullName)

  }
  else{
    console.log(error)
    

  }

});
var c =req.session.cart;
var arr=[];
c.forEach(element => {
  

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

    // user.find({username:"maher"} , function(error,result){
        
        
    //        var a = result[0].productitem;
     
    //     a.forEach(element2 => {
    //        if (element2.price=="0.35") {
    //            console.log(element2)

    //        }
    //     });
    //     product.findById{itemprodct[0]}
        
        
       
      
    // });
        

module.exports = app ;


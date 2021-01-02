const express = require("express");
const admin = require("../model/admin");
const user = require("../model/user");
const _ = require("lodash");
const bodyParser = require("body-parser");

const app = express();
const session = require("express-session");
const passport = require("passport");
const passportlocalmongoose = require("passport-local-mongoose");
const product = require("../model/product");
const { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } = require("constants");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json())



  
app.get("/",function(req,res){
  product.find().countDocuments(function (err, count) {
    product.find({},function(err,found){
      res.render("indexpublic",{count:count , found:found, lastseen:req.session.lastseen});
     
 
       
      
    });
 
});
 });
 app.get("/",function(req,res){
  res.send("headerpublic", {cart:req.session.cart});
  
 });
 app.get("/blog-details",function(req,res){
  res.render("blog-details");

 });
 
 app.get("/blog",function(req,res){
  res.render("blog");

 });
      
 app.get("/contact",function(req,res){
  res.render("contact");

 });
 app.get("/main",function(req,res){
  res.render("main");

 });
           
            
    
  
  
  
  
  
  
  app.get('/shop-details/:product', function(req, res){
    
    product.findOne({_id:req.params.product},function(err,p){
      
      console.log(p);
      if(err){
        console.log(err);
      }
      if(typeof req.session.lastseen == "undefined"){
        req.session.lastseen = [];
        req.session.lastseen.push({
        barcode : p._id,
      caption : p.captiond,
      price:parseFloat(p.priced).toFixed(2),
      image:p.img[0]
        });
      }else{
        var lastseen = req.session.lastseen;
        var newitem = true;
        var item = 0;
        for (var i = 0; i < lastseen.length; i++) {
          if (lastseen[i].barcode == req.params.product) {
            
            newitem = false
            break;
          }
          
        }
        if (newitem) {
          
          lastseen.push({
            barcode : p._id,
            
            caption : p.captiond,
            
            price:parseFloat(p.priced).toFixed(2),
            image:p.img[0]
              });
        } 
      }
      product.find({departmentd : p.departmentd}).countDocuments(function (err, count) {
        product.find({departmentd : p.departmentd},function(err,foundrelated){
          console.log(foundrelated);
      res.render("shop-details",{ found:p , count:count , foundrelated:foundrelated , lastseen:req.session.lastseen }); 
    });
  });
      

     
   });
    
  });
  app.get('/shop-grid/:dep', function(req, res){
    const a = (req.params.dep).replace("-",' ');
    console.log(a)
    product.find({departmentd:a}).count(function (err, count) {
    product.find({departmentd:a},function(err,found){

      res.render("shop-grid",{ found:found , count:count}); 
      
      

      console.log(found)
     
   });
  });
  });
  
  app.get('/add/:product', function(req, res){
    total = 0;
    product.findOne({_id:req.params.product} ,function(err ,p){
if(err){
  console.log(err);
}
if(typeof req.session.cart == "undefined"){
  req.session.cart = [];
  
  req.session.cart.push({
  barcode : p._id,
caption : p.captiond,
department:p.departmentd,
qy:1,
price:parseFloat(p.priced).toFixed(2),
image:p.img[0]

  });
}else{
  var cart = req.session.cart;
  var newitem = true;
  var item = 0;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].barcode == req.params.product) {
      cart[i].qy++;
      newitem = false
      break;
    }
    
  }
  if (newitem) {
    
    cart.push({
      barcode : p._id,
      department:p.departmentd,
      caption : p.captiond,
      qy:1,
      price:parseFloat(p.priced).toFixed(2),
      image:p.img[0]
        });
  } 
}
cart = req.session.cart;
 cart.forEach(function(product){
  var qty =product.qy * product.price ;
  total = qty+total;
   });
res.locals.total = total;
res.locals.cartlength1 = req.session.cart.length;
console.log(res.locals.total + "gg")
console.log(res.locals.cartlength1+"uyuy")
var w = req.session.cart.length;

res.redirect("/")

    });


  });
  app.get('/shoping-cart', function(req, res){
    
    res.render('shoping-cart' , {cart:req.session.cart });
  });
  app.get('/delete-cart', function(req, res){
    
    req.session.cart =[];
    res.redirect('/shoping-cart' );
  });
  app.get('/delete-item/:item', function(req, res){
    var cart = req.session.cart ;
    var i =0;
    cart.forEach(function(item){
      i++;
      if (item.barcode===req.params.item) {
        res.locals.total  =  res.locals.total - parseFloat(item.price).toFixed(2);
        cart.splice(i-1, 1);
      }
      
      
    });
    console.log(req.session.cart);
    
   
    res.redirect("/shoping-cart");
  });
  
             module.exports = app;
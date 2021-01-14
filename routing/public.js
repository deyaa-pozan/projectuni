const express = require("express");
const admin = require("../model/admin");
const subscribe = require("../model/subscribe");
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
       product.find({}).sort({"countshop" : -1}).limit(9).exec(function(err, Top){
        product.find({}).sort({"date" : -1}).limit(9).exec(function(err, latest){
          
          res.render("indexpublic",{count:count , found:found, lastseen:req.session.lastseen,topsale:Top,latest:latest,heart:req.session.heart});

        });
      });
    });
  });
});

 app.get("/",function(req,res){
  res.send("headerpublic", {cart:req.session.cart});
  
 });
 app.get("/blog-details",function(req,res){
  
  res.render("blog-details");

 });

 app.post("/subscribeform",function(req,res){
  const emailsubscribe = req.body.email;
  subscribe.findOne({ email: emailsubscribe }).then(usersubscribe => {
    if (!usersubscribe) {
      
    
 const newsubscribe = new subscribe({
   email:emailsubscribe

 });
 newsubscribe.save(function(err){
  if (err) {
      console.log(err)
  }else{
      res.redirect("/")
  }

  });
  }else{
    res.redirect("/")
  }

});
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
  app.get('/addheart/:product', function(req, res){
    product.findOne({_id:req.params.product} ,function(err ,p){
      if(err){
        console.log(err);
        res.redirect("/")
      }
      if(typeof req.session.heart == "undefined"){
        req.session.heart = [];
        req.session.heart.push({
        barcode : p._id,
      caption : p.captiond,
      image:p.img[0]
      
        });
      }else{
        var heart = req.session.heart;
        var newitem = true;
        for (var i = 0; i < heart.length; i++) {
          if (heart[i].barcode == req.params.product) {
            newitem = false
            break;
          }
          
        }
        if (newitem) {
          
          heart.push({
            barcode : p._id,
            caption : p.captiond,
            image:p.img[0]
              });
        } 
      }
      console.log(req.session.heart);
      res.redirect("/")
    });

  });

  app.get('/add/:product', function(req, res){
    total = 0;
    cartlength1 = 0;
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
cartlength1 = req.session.cart.length;

res.locals.total = total;




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
      total  =  total- parseFloat(item.price).toFixed(2);
      cartlength1-- ;
        cart.splice(i-1, 1);
      }
      
      
    });
    console.log(req.session.cart);
    
   
    res.redirect("/shoping-cart");
  });
  
             module.exports = app;
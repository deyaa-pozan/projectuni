const express = require("express");
const admin = require("../model/admin");
const product = require("../model/product");
const bcrypt = require('bcryptjs');
const bodyParser = require("body-parser");

const _ = require("lodash");

const app = express();
const session = require("express-session");
const passport = require("passport");
const passportlocalmongoose = require("passport-local-mongoose");
const { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } = require("constants");
const { adminensureAuthenticated, adminforwardAuthenticated } = require('../config/auth');
app.use(bodyParser.urlencoded({extended: true}));





// Login Page
app.get('/login', adminforwardAuthenticated, (req, res) => res.render('login'));

// Register Page
app.get('/register', adminensureAuthenticated,  (req, res) => res.render('register'));

// Register
app.post('/register', (req, res) => {
  
  const {username,email, password} = req.body;
  let errors = [];

  if ( !username ||!email || !password ) {
    errors.push({ msg: 'Please enter all fields' });
  }

  
  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    console.log(errors);
    res.render('register', {
      errors,
      email,
      password,
      username
      
    });
    
   

  } else {
    admin.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        console.log(errors);

        res.render('register', {
          errors,
         username,
          email,
          password,
          
        });
        
      } else {
        const newUser = new admin({
          
          email,
          password,
          username,
          type:"admin"
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/register');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
   
  }
});



// Login
app.post('/login', (req, res, next) => {
  passport.authenticate('admin', {
    successRedirect: '/dashbord',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});

  // Logout
app.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/login');
});
  app.get("/adminpage",adminensureAuthenticated,function(req,res){

		 admin.find().countDocuments(function (err, count1) {
		  
		  admin.find({},function(err,found1){
			 res.render("adminpage",{count1:count1 , found1:found1});  
			 
			  
		  });
	   
	  });
	
	});
	
	  
		
			app.get("/table",adminensureAuthenticated,function(req,res){
				
				  res.render("table");
			
				});
			  app.get("/forget",function(req,res){
			  
			  
			  res.render("forget-pass");
              });
              
      
        app.get("/deleteadmin/:id" ,function(req,res){
            console.log(req.params.id)
            admin.findByIdAndRemove(req.params.id, function(err){
              if (!err) {
                console.log("Successfully deleted checked item.");
                res.redirect("/adminpage");
              }
              else{
                          console.log(err);
              res.redirect("/adminpage")
              }
            });
        });
        
        app.get("/calendar",function(req,res){
  
  
            if (req.isAuthenticated()) {
              res.render("calendar");
              
            }
            else{
              res.redirect("/login");
            }
            });
          
          
          app.get("/chart",adminensureAuthenticated,function(req,res){
          
            
              res.render("chart");
            
            });
          app.get("/form",adminensureAuthenticated,function(req,res){
          
              res.render("form");
            
            });
          app.get("/inbox",adminensureAuthenticated,function(req,res){
          
            
              res.render("inbox");
            
            });
          
          
          
            
            
           
          app.get("/map",adminensureAuthenticated,function(req,res){
          
          
              res.render("map");
           
            });
            app.get("/dashbord",adminensureAuthenticated, function(req,res){
              admin.findOne({ email: req.session.passport.user.email},function(err,adminau){
     if (err) {
       console.log(err);
       res.redirect("/login")
     }
     
                if (adminau ) {
                  
                  product.find().count(function (err, count) {
                    res.render("index",{count:count});  
                   
                });
                }else{
                  req.flash('error_msg', 'this email no admin');
                  res.render("login")
                  
                 
                }
              
             });
                    
                });
                
              module.exports = app
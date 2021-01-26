const express = require("express");
const mongoose = require("mongoose");
const admin = require("../model/admin");
const User = require("../model/user");
const order = require("../model/order");
const product = require("../model/product");
const bcrypt = require('bcryptjs');
const _ = require("lodash");
const app = express();
const session = require("express-session");
const passport = require("passport");
const passportlocalmongoose = require("passport-local-mongoose");
const { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } = require("constants");
const { adminensureAuthenticated, adminforwardAuthenticated } = require('../config/auth');


// Login Page
app.get('/login', adminforwardAuthenticated, (req, res) => res.render('login'));

// Register Page
app.get('/register', adminensureAuthenticated, (req, res) => {
  if (adminpage.__v === 1) {
    res.render('register');
  } else {
    res.redirect("/dashbord")
  }
});

// Register
app.post('/register', (req, res) => {

  const { username, email, password } = req.body;
  let errors = [];

  if (!username || !email || !password) {
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
          type: "admin"
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
//show admin
app.get("/adminpage", adminensureAuthenticated, function (req, res) {
  if (adminpage.__v === 1) {
    admin.find().countDocuments(function (err, count1) {
      admin.find({}, function (err, found1) {
        res.render("adminpage", { count1: count1, found1: found1 });
      });
    });
  } else {
    res.redirect("/dashbord")
  }
});

//Delete item
app.get("/delete/:id", function (req, res) {
  product.findByIdAndRemove(req.params.id, function (err) {
    if (!err) {
      console.log("Successfully deleted checked item.");
      res.redirect("/addproduct");
    }
    else {
      console.log(err);
      res.redirect("/addproduct")
    }
  });
});

//Delete Admin
app.get("/deleteadmin/:id", function (req, res) {

  admin.findByIdAndRemove(req.params.id, function (err) {
    if (!err) {

      console.log("Successfully deleted checked item.");
      res.redirect("/adminpage");
    }
    else {
      console.log(err);
      res.redirect("/adminpage")
    }
  });
});


// DataTable Order
app.get("/order", adminensureAuthenticated, function (req, res) {
  order.find({}, function (err, orderfound) {
    res.render("order", { foundorder: orderfound, countorder: orderfound.length });
  });
});

//DataTable User
app.get("/userdata", adminensureAuthenticated, function (req, res) {
  User.find({}, function (err, userfound) {
    res.render("userdata", { founduser: userfound, countuser: userfound.length });
  });
});

//Analysis page
app.get("/dashbord", adminensureAuthenticated, function (req, res) {
  admin.findOne({ email: req.session.passport.user.email }, function (err, adminau) {
    if (err) {
      console.log(err);
      res.redirect("/login")
    }

    if (adminau) {
      adminpage = adminau;
      console.log(adminpage);
      product.find().count(function (err, count) {
        User.find().count(function (err, usercount) {

          order.aggregate([
            {
              $group:
              {
                _id: null,
                totalsales: { $sum: "$total" },
                count: { $sum: 1 }
              }


            }
          ]).exec(function (err, results) {
            if (err) {
              console.log(err);
            } else {
              order.find({ __v: 0 }, function (ordererror, neworder) {

                Neworder = neworder;
                if (results.length != 0) {

                  res.render("index", { count: count, usercount: usercount, totalsales: results[0].totalsales, countorder: results[0].count  });

                } else {
                  console.log(results.length);
                  res.render("index", { count: count, usercount: usercount, totalsales: results.length, countorder: results.length });
                }
              });
            }

          });
        });
      });
    } else {
      req.flash('error_msg', 'this email no admin');
      res.render("login")
    }
  });
});
// Delete Order
app.get("/deleteorder/:id", function (req, res) {
  console.log(req.params.id)

  order.findByIdAndRemove(req.params.id, function (err) {
    if (!err) {
      console.log("Successfully deleted checked item.");
      res.redirect("/order");
    }
    else {
      console.log(err);
      res.redirect("/order")
    }
  });

});
// Delete user
app.get("/deleteuser/:id", function (req, res) {
  console.log(req.params.id)

  User.findByIdAndRemove(req.params.id, function (err, founduser) {
    if (!err) {
      console.log("Successfully deleted checked item.");
      order.deleteMany({ email: founduser.email }, function (erruser) {
        if (!erruser) {
          res.redirect("/userdata");
        } else {
          console.log(erruser);
          res.redirect("/userdata");
        }
      });

    }
    else {

      console.log(err);
      res.redirect("/userdata")
    }
  });

});

app.post("/editrole/:id", function (req, res) {
  var obj_select = req.body;
  var val_first_key = obj_select[Object.keys(obj_select)[0]];
  admin.updateOne({ _id: req.params.id }, { __v: val_first_key }, function (err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/adminpage");
    }

  })


});

app.get("/discount/:id", adminensureAuthenticated, function (req, res) {
  product.findById(req.params.id, { new: true }, function (err, founddis) {
    if (err) {
      console.log(err);
    } else {
      res.render("discount", { productId: founddis })
    }
  });
});

app.post("/discount/:id", function (req, res) {
  product.findByIdAndUpdate({ _id: req.params.id }, { $set: { discount: parseInt(req.body.selectdiscount) / 100 } }, { upsert: true, strict: false }, function (err, decs) {
    if (err) {
      console.log(err)
    } else {
      console.log(req.body);
      User.updateMany({ productitem: req.params.id }, { $addToSet: { noti: req.body.message + decs.captiond + " لمدة 24 ساعة " } }, function (err, found) {
        res.redirect("/addproduct")
      });

    }
  });

});



module.exports = app
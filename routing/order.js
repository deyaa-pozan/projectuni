const express = require("express");
const order = require("../model/order");
const user = require("../model/user");
const app = express();
const session = require("express-session");
const { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } = require("constants");
const product = require("../model/product");
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
app.get('/checkout', ensureAuthenticated, (req, res) => {
  res.render('checkout', { cart: req.session.cart })
});

//Send order to Database
app.post("/send", function (req, res) {
  var email = req.session.passport.user.email;
  var fullName = req.body.fullname;
  var address = req.body.address;
  var numphone = req.body.numphone;
  var note = req.body.note;
  var cart = req.session.cart;
  var total = 0;
  cart.forEach(function (product) {
    total = (product.price * product.qy) + total
  });
  var newOrder = new order({
    email: email,
    fullname: fullName,
    address: address,
    numphone: numphone,
    note: note,
    total: total,
    date: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
    product: req.session.cart
  });
  newOrder.save(function (error) {
    if (!error) {
      console.log(fullName)
    } else {
      console.log(error)
    }
  });
  var c = req.session.cart;
  var arr = [];
  c.forEach(element => {
    product.findById(element.barcode, function (err, pro) {
      if (!err) {
        pro.stored = pro.stored - element.qy;
        pro.countshop = pro.countshop + element.qy;
        pro.save(function (error) {
          if (error) {
            console.log(error);
          }
        });
      }
    });
    arr.push(element.barcode)
  });
  user.findOneAndUpdate({ email: email }, { $addToSet: { productitem: arr } }, function (err, found) {
    if (err) {
      console.log(err);
    }
    else {

    }
  });
  cartlength1 = 0;
  req.session.cart = [];
  res.redirect("/");
});
app.get("/status/:id", function (req, res) {
  var stat = req.params.id;
  var id = stat.substr(0, stat.indexOf('-'));
  var numstatus = stat.substring(stat.lastIndexOf("-") + 1)
  order.findByIdAndUpdate(id, { __v: numstatus }, { new: true }, function (err, changestat) {
    if (err) {
      console.log(err);
    } else {
      console.log(changestat);
      res.redirect("/order")
    }
  });
});

module.exports = app;


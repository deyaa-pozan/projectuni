const express = require("express");
const subscribe = require("../model/subscribe");
const bodyParser = require("body-parser");
const app = express();
const session = require("express-session");
const product = require("../model/product");
const feedback = require("../model/feedback");
const Category = require("../model/Category");
const { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } = require("constants");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

//Public page for store
app.get("/", function (req, res) {
  product.find().countDocuments(function (err, count) {
    product.find({}, function (err, found) {
      product.find({}).sort({ "countshop": -1 }).limit(9).exec(function (err, Top) {
        product.find({}).sort({ "date": -1 }).limit(9).exec(function (err, latest) {
          Category.find({}, function (errcate, foundcategory) {
            allcategory = foundcategory;
            res.render("indexpublic", { count: count, found: found, lastseen: req.session.lastseen, topsale: Top, latest: latest });
          });
        });
      });
    });
  });
});

//blog details
app.get("/blog-details", function (req, res) {
  res.render("blog-details");
});

//subscribe by email 
app.post("/subscribeform", function (req, res) {
  const emailsubscribe = req.body.email;
  subscribe.findOne({ email: emailsubscribe }).then(usersubscribe => {
    if (!usersubscribe) {
      const newsubscribe = new subscribe({
        email: emailsubscribe
      });
      newsubscribe.save(function (err) {
        if (err) {
          console.log(err)
        } else {
          res.redirect("/")
        }
      });
    } else {
      res.redirect("/")
    }
  });
});


//contact
app.get("/contact", function (req, res) {
  Category.find({}, function (errcate, foundcategory) {
    allcategory = foundcategory;
    res.render("contact");
  });
});
// shop-details page
app.get('/shop-details/:product', function (req, res) {
  product.findOne({ _id: req.params.product }, function (err, p) {
    if (err) {
      console.log(err);
    }
    if (typeof req.session.lastseen == "undefined") {
      req.session.lastseen = [];
      req.session.lastseen.push({
        barcode: p._id,
        caption: p.captiond,
        price: parseFloat(p.priced).toFixed(2),
        image: p.img[0]
      });
    } else {
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
          barcode: p._id,
          caption: p.captiond,
          price: parseFloat(p.priced).toFixed(2),
          image: p.img[0]
        });
      }
    }
    product.find({ departmentd: p.departmentd }).countDocuments(function (err, count) {
      product.find({ departmentd: p.departmentd }, function (err, foundrelated) {
        Category.find({}, function (errcate, foundcategory) {
          allcategory = foundcategory;
          res.render("shop-details", { found: p, count: count, foundrelated: foundrelated, lastseen: req.session.lastseen });
        });
      });
    });
  });
});
//shop-grid page
app.get('/shop-grid/:dep', function (req, res) {
  const a = (req.params.dep).replace("-", ' ');
  product.find({ departmentd: a }).count(function (err, count) {
    product.find({ departmentd: a }, function (err, found) {
      Category.find({}, function (errcate, foundcategory) {
        allcategory = foundcategory;
        res.render("shop-grid", { found: found, count: count });
      });
    });
  });
});

//add heart product in session
// app.get('/addheart/:product', function (req, res) {
//   product.findOne({ _id: req.params.product }, function (err, ph) {
//     if (err) {
//       console.log(err);
//       res.redirect("/")
//     }
//     if (typeof req.session.heart == "undefined") {
//       req.session.heart = [];
//       req.session.heart.push({
//         barcode: ph._id,
//         caption: ph.captiond,
//         image: ph.img[0]
//       });
//     } else {
//       var heart = req.session.heart;
//       var newitem = true;
//       for (var i = 0; i < heart.length; i++) {
//         if (heart[i].barcode == req.params.product) {
//           newitem = false
//           break;
//         }
//       }
//       if (newitem) {
//         heart.push({
//           barcode: ph._id,
//           caption: ph.captiond,
//           image: ph.img[0]
//         });
//       }
//     }
//     heart = req.session.heart;
//     res.redirect("/")
//   });
// });

//add to cart product in session
app.get('/add/:product', function (req, res) {
  total = 0;
  cartlength1 = 0;
  product.findOne({ _id: req.params.product }, function (err, p) {
    if (err) {
      console.log(err);
    }
    if (typeof req.session.cart == "undefined") {
      req.session.cart = [];
      req.session.cart.push({
        barcode: p._id,
        caption: p.captiond,
        department: p.departmentd,
        qy: 1,
        price: parseFloat(p.priced * (1 - p.discount)).toFixed(2),
        image: p.img[0]
      });
    } else {
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
          barcode: p._id,
          department: p.departmentd,
          caption: p.captiond,
          qy: 1,
          price: parseFloat(p.priced * (1 - p.discount)).toFixed(2),
          image: p.img[0]
        });
      }
    }
    cart = req.session.cart;
    cart.forEach(function (product) {
      var qty = product.qy * product.price;
      total = qty + total;
    });
    cartlength1 = req.session.cart.length;
    res.locals.total = total;
    res.redirect("/")
  });
});

//shoping-cart page
app.get('/shoping-cart', function (req, res) {
  Category.find({}, function (errcate, foundcategory) {
    allcategory = foundcategory;
    res.render('shoping-cart', { cart: req.session.cart });
  });
});

//delete all product in session
app.get('/delete-cart', function (req, res) {
  req.session.cart = [];
  res.redirect('/shoping-cart');
});

//delete item in session
app.get('/delete-item/:item', function (req, res) {
  var cart = req.session.cart;
  var i = 0;
  cart.forEach(function (item) {
    i++;
    if (item.barcode === req.params.item) {
      total = total - parseFloat(item.price).toFixed(2);
      cartlength1--;
      cart.splice(i - 1, 1);
    }
  });
  res.redirect("/shoping-cart");
});

//quantity checkout
app.get('/quantity/:id', function (req, res) {
  var addy = req.params.id;
  var id = addy.substr(0, addy.indexOf('-'));
  var qty = addy.substring(addy.lastIndexOf("-") + 1)
  var cart = req.session.cart;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].barcode == id && qty != 0) {
      cart[i].qy = parseInt(qty);

      break;
    }
  }

  res.redirect("/shoping-cart");
});

//Add feedback
app.post("/feedback", function (req, res) {
  const newfeedback = new feedback({
    name: req.body.name,
    email: req.body.email,
    message: req.body.message
  });
  newfeedback.save(function (err) {
    if (!err) {
      res.redirect("/");
    }
  })
});


module.exports = app;
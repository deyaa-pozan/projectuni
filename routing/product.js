const express = require("express");
const _ = require("lodash");
const app = express();
const product = require("../model/product");
const category = require("../model/Category");
const { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } = require("constants");
const admin = require("../model/admin");

//Add product show data
app.get("/addproduct", function (req, res) {
  if (req.isAuthenticated()) {
    product.find().count(function (err, count) {
      product.find({}, function (err, found) {
        category.find({}, function (err, category) {
        res.render("addproduct", { count: count, found: found, category:category });
      });
      });
    });
  }
  else {
    res.redirect("/login");
  }
});
//Add product to database
app.post("/addproduct", function (req, res) {
  const caption = req.body.caption;
  const price = req.body.price;
  const barcode = req.body.barcode;
  const stored = req.body.stored;
  const description = req.body.description;
  const department = req.body.select;
  var ar = [];
  req.files.forEach(function (e) {
    ar.push(e.filename);
  });
  const newproduct = new product({
    _id: barcode,
    captiond: caption,
    priced: price,
    stored: stored,
    descriptiond: description,
    departmentd: department,
    img: ar,
    countshop: 0,
    reveiw: 3
  });
  newproduct.save(function (err) {
    if (err) {
      console.log(err)
    } else {
      res.redirect("/addproduct")
    }
  });
});

//Edit item page
app.get("/edit/:id", function (req, res) {
  product.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }, function (err, decs) {
    if (err) {
      console.log(err)
    } else {
      res.render("edit", { decs: decs });
    }
  });
});

//Edit item in database
app.post("/edit/:id", function (req, res) {
  product.updateMany({ _id: req.params.id }, { $set: { priced: req.body.price, captiond: req.body.caption1, id: req.body.barcode, stored: req.body.stored, descriptiond: req.body.description, departmentd: req.body.select } }, function (err, decs) {
    if (err) {
      console.log(err)
    } else {
      res.redirect("/addproduct")
    }
  });
});


//Add Category
app.post("/addcategory", function (req, res) {
  const newCategory = new category({
    nameCategory : req.body.category
  });
  newCategory.save(function(err){
    if (!err) {
      res.redirect("/addproduct");
    }
  })
});

//Category item
app.get("/deletecategory/:id", function (req, res) {
  category.findByIdAndRemove(req.params.id, function (err,foundcategory) {
    if (!err) {
      console.log("Successfully deleted checked item.");
       product.deleteMany({departmentd:foundcategory.nameCategory},function(error){
         if (!error) {
          res.redirect("/addproduct");
         }else{
           console.log(error);
         }
       })
      
    }
    else {
      console.log(err);
      res.redirect("/addproduct")
    }
  });
});


module.exports = app;
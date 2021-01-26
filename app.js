const express = require("express");
const public = require("./routing/public");
const user = require("./routing/user");
const admin = require("./routing/admin");
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongodb = require("mongodb");
const mongoose = require("mongoose");
const path = require('path');
const multer = require('multer');
require('dotenv/config');
const fs = require('fs');
const session = require("express-session");
const passport = require("passport");
const passportlocalmongoose = require("passport-local-mongoose");
const product = require("./routing/product");
const order = require("./routing/order");
const app = express();

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = "mongodb+srv://admin2017:29238016@cluster0.apome.mongodb.net/ecommerce?retryWrites=true&w=majority";

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});
app.use(function (req, res, next) {
  if (req.isAuthenticated()) {
    res.locals.userhedar = req.session.passport.user.email;
  }
  res.locals.cartlength1;
  res.locals.heart;
  res.locals.adminpage;
  res.locals.Neworder;
  res.locals.allcategory;

  next();

});

app.use(express.static("public"));
app.use(express.static("uploads"));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.set('useCreateIndex', true);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  }
});

const upload = multer({ storage: storage });

app.use("/", public);
app.use("/", user);
app.use("/", upload.array("im", 10), product);
app.use("/", upload.array("im", 10), admin);
app.use("/", order);
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);
module.exports = app;

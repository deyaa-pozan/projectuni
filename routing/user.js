const express = require("express");
const User = require("../model/user");
const Token = require("../model/token");
const _ = require("lodash");
const bodyParser = require("body-parser");
const app = express();
const session = require("express-session");
const passportlocalmongoose = require("passport-local-mongoose");
const bcrypt = require('bcryptjs');
const passport = require('passport');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const {changePasswordPost, changePassword, confirmationPost, resendTokenPost } = require('../config/verification');
const { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } = require("constants");
app.use(bodyParser.urlencoded({ extended: true }));

//Registering Additional Routes in Express
app.post('/confirmation', confirmationPost);
app.post('/resend', resendTokenPost);

//confirmationPost
app.get('/confirmation/:token', confirmationPost, (req, res) => {
  req.flash('success_msg', 'The account has been verified. Please log in.');
  res.redirect("/login-user")
});
//resendTokenPost
app.get('/resend/:email', resendTokenPost, (req, res) => {
  req.flash('error_msg', 'A verification email has been sent to ' + req.params.email);
  res.redirect("/login-user")
});

// Login Page
app.get('/login-user', forwardAuthenticated, (req, res) => {
  console.log(req.session);
  res.render('login-user')
});

// Register Page
app.get('/register-user', forwardAuthenticated, (req, res) => res.render('register-user'));


// Login
app.post('/login-user', (req, res, next) => {
  passport.authenticate('user', {
    successRedirect: '/checkout',
    failureRedirect: '/login-user',
    failureFlash: true
  })(req, res, next);
});
// Register Page Post
app.post("/register-user", (req, res) => {
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  var password2 = req.body.passwordcheck;
  let errors = [];

  if (!username || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register-user', {
      errors,
      username,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email ,username:username}).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register-user', {
          errors,
          username,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          username: username,
          email: email,
          password: password,
          type: "user"
        });

        //Encrption Password
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save(function (err, user) {
                if (err) {
                  console.log(err);
                }
                else {
                  // Create a verification token for this user

                  var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
                  console.log(user.email);

                  // Save the verification token
                  token.save(function (err) {
                    if (err) {
                      console.log("no token");
                      return res.status(500).send({ msg: err.message });
                    } else {

                      // Send the email

                      var transporter = nodemailer.createTransport({ service: 'gmail', port: 465, secure: true, auth: { user: "deaiaa.1999@gmail.com", pass: "deaiaa.1999" }, tls: { rejectUnauthorized: false } });
                      console.log(transporter);

                      var mailOptions = { from: 'deaiaa.1999@gmail.com', to: user.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token.token + '.\n' };
                      console.log(mailOptions);
                      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                      transporter.sendMail(mailOptions, function (err) {
                        if (err) {
                          console.log(err); console.log("no verify"); return res.status(500).send({ msg: err.message });
                        } else {
                          console.log("ok verify");
                          req.flash('error_msg', 'A verification email has been sent to ' + email + '.');
                          res.redirect("/login-user")
                        }
                      });
                    }
                  });
                }
              })
          });
        });
      }
    });
  }
});

app.get('/logout-user', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  console.log(req.session);
  res.redirect('/');
});
app.get("/forget-pass", function (req, res) {
  res.render("forget-pass");
});
app.post("/forget-pass",changePassword, function (req, res) {
  req.flash('success_msg', 'Send link this email  '+req.body.email);

  res.redirect("/forget-pass")
});

app.get("/change-pass/:token", function (req, res) {

  res.render("change-pass", {token:req.params.token});
});
app.post("/change-pass/:token",changePasswordPost, function (req, res) {
  req.flash('success_msg', 'Password changed successfully ');
  res.redirect("/login-user");
});


module.exports = app;

const Token = require("../model/token");
const User = require("../model/user");
var crypto = require('crypto');
var nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');


module.exports = {
  confirmationPost: function (req, res, next) {



    // Find a matching token
    Token.findOne({ token: req.params.token }, function (err, token) {
      if (!token) return res.status(400).send({ type: 'not-verified', msg: 'We were unable to find a valid token. Your token my have expired.' });

      // If we found a token, find a matching user
      User.findOne({ _id: token._userId }, function (err, user) {


        // Verify and save the user
        user.isVerified = true;
        user.save(function (err) {
          if (err) { return res.status(500).send({ msg: err.message }); }
        });
      });
    });
    return next();
  },
  resendTokenPost: function (req, res, next) {

    // Check for validation errors    

    User.findOne({ email: req.params.email }, function (err, user) {
      if (!user) return res.status(400).send({ msg: 'We were unable to find a user with that email.' });
      if (user.isVerified) return res.status(400).send({ msg: 'This account has already been verified. Please log in.' });

      // Create a verification token, save it, and send email
      var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });

      // Save the token
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

            }
          });
        }
      });

    });

    return next();
  },
  changePassword: function (req, res, next) {

    // Check for validation errors    

    User.findOne({ email: req.body.email }, function (err, user) {
      console.log(user);
      if (!user) return res.status(400).send({ msg: 'We were unable to find a user with that email.' });


      // Create a verification token, save it, and send email
      var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });

      // Save the token
      token.save(function (err) {
        if (err) {
          console.log("no token");
          return res.status(500).send({ msg: err.message });
        } else {

          // Send the email

          var transporter = nodemailer.createTransport({ service: 'gmail', port: 465, secure: true, auth: { user: "deaiaa.1999@gmail.com", pass: "deaiaa.1999" }, tls: { rejectUnauthorized: false } });
          console.log(transporter);

          var mailOptions = { from: 'deaiaa.1999@gmail.com', to: user.email, subject: 'Change Password', text: 'Hello,\n\n' + 'Please Change Password clicking the link: \nhttp:\/\/' + req.headers.host + '\/change-pass\/' + token.token + '.\n' };

          process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
          transporter.sendMail(mailOptions, function (err) {
            if (err) {
              console.log(err); console.log("no verify"); return res.status(500).send({ msg: err.message });
            } else {
              console.log("ok verify");
              req.flash('error_msg', 'A verification email has been sent to ' + email + '.');

            }
          });
        }
      });

    });

    return next();
  },
  changePasswordPost: function (req, res, next) {

    var password = req.body.password;
    var passwordcheck = req.body.passwordcheck;
    let errors = [];
    if (!password || !passwordcheck) {
      errors.push({ msg: 'Please enter all fields' });
    }
    if (password != passwordcheck) {
      errors.push({ msg: 'Passwords do not match' });
    }
    if (password.length < 6) {
      errors.push({ msg: 'Password must be at least 6 characters' });
    }
    Token.findOne({ token: req.params.token }, function (err, usertoken) {
      if (errors.length > 0) {
        res.render('change-pass', {
          errors,
          password,
          passwordcheck,
          token: usertoken.token
        });
      } else {
        if (!usertoken) return res.status(400).send({ msg: 'We were unable to find a user with that email.' });
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) { console.log(err ); };
            password = hash;
            User.findByIdAndUpdate(usertoken._userId, { password: password }, { new: true }, function (error) {
              if (error) {
                return res.status(400).send({ msg: error });
              }
            })
          });
        });
        return next();
      }
    });
  }
};
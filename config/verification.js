
const Token = require("../model/token");
const User = require("../model/user");
var crypto = require('crypto');
var nodemailer = require('nodemailer');


module.exports = {
confirmationPost : function (req, res, next) {
   
    

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
resendTokenPost : function (req, res, next) {
   
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
           }else{
        
            // Send the email
        
            var transporter = nodemailer.createTransport({service: 'gmail',port: 465,secure: true,   auth: { user: "deaiaa.1999@gmail.com", pass: "deaiaa.1999" }, tls:{rejectUnauthorized: false} });
            console.log(transporter);
        
            var mailOptions = { from: 'deaiaa.1999@gmail.com', to: user.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token.token + '.\n' };
            console.log(mailOptions);
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0" ;
            transporter.sendMail(mailOptions, function (err) {
              if (err) { 
                console.log(err);console.log("no verify"); return res.status(500).send({ msg: err.message });
            }else{
              console.log("ok verify");
              req.flash('error_msg', 'A verification email has been sent to ' + email + '.');
                
              }
            });
            }
        });

    });
    
    return next();
}
};
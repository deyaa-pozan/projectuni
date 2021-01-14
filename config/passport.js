const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const admin = require('../model/admin');

// Load User model
const User = require('../model/user');

module.exports = function(passport) {
  passport.use('user',
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      User.findOne({
        email: email
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            if (!user.isVerified) return done(null, false, { message: 'Your account has not been verified.' });
            
            return done(null, user);
          } else {
            
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );

  passport.use('admin',
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      admin.findOne({
        email: email
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, {email:user.email,type:user.type});
  });

  passport.deserializeUser(function(obj, done) {
    
    switch (obj.type) {
      case 'admin':
        
          admin.findOne({email:obj.email})
              .then(device => {
                  if (device) {
                      done(null, device);
                  } else {
                    
                      done(new Error('device email not found:' + obj.email, null));
                  }
              });
              break;
      case 'user':
       

          User.findOne({email:obj.email})
              .then(user => {
                  if (user) {
                      done(null, user);
                  }
                  else {
                      done(new Error('user email not found:' + obj.email, null));
                  }
              });
          break;
      
        default:
            done(new Error('no entity type:', obj.type), null);
            break;
    }
  });
};

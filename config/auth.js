const admin = require('../model/admin');
module.exports = {
  ensureAuthenticated: function (req, res, next) {

    if (req.isAuthenticated()) {
      return next();
    }

    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/login-user');
  },
  forwardAuthenticated: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/checkout');
  },

  adminensureAuthenticated: function (req, res, next) {

    if (req.isAuthenticated()) {
      return next();
    }

    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/login');
  },
  adminforwardAuthenticated: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/dashbord');
  }
};

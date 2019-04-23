const express = require('express');
const router = express.Router();
const passport = require('passport');
const asyncMiddleware = require('../asyncMiddleware');

const whitelist = [
  'yqyeoh@gmail.com',
  'jessternrays@gmail.com',
  'nictengkk@gmail.com',
  'nipunbatra.1984@gmail.com',
  'achiekoaoki@gmail.com',
  'jerome.lim.zw@gmail.com'
];
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cookieSession = require('cookie-session');

router.route('/google').get((req, res, next) => {
  passport.authenticate('google', {
    scope: ['profile', 'email'] // Used to specify the required data
  })(req, res, next);
});

router.route('/google/callback').get(
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:3000',
    session: true
  }),
  (req, res) => {
    res.cookie('user', req.user.name.givenName, { httpOnly: false });
  }
);

// Logout route
router.get('/logout', (req, res) => {
  req.logout();
  res.clearCookie('user');
  res.clearCookie('express:sess');
  res.redirect('http://localhost:3000');
});

module.exports = router;

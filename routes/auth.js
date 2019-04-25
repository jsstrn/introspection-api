const express = require('express');
const router = express.Router();
const passport = require('passport');
const asyncMiddleware = require('../asyncMiddleware');
const { isValidBEHost, fehosts } = require('../hostnames');

const hostname = process.env.APP_NAME;
const feUrl = isValidBEHost(hostname) ? fehosts[hostname] : '';

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
    failureRedirect: `${feUrl}`,
    session: true
  }),
  (req, res) => {
    res.cookie('user', req.user.name, { httpOnly: true });
    res.cookie('picture', req.user.picture, { httpOnly: true });
  }
);

// Logout route
router.get('/logout', (req, res) => {
  req.logout();
  res.clearCookie('user');
  res.clearCookie('express:sess');
  res.redirect(`${feUrl}`);
});

module.exports = router;

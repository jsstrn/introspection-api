const express = require('express');
const router = express.Router();
const passport = require('passport');
const asyncMiddleware = require('../asyncMiddleware');
const { isValidBEHost, fehosts } = require('../hostnames');

const hostname = process.env.APP_NAME;
const feUrl = isValidBEHost(hostname) ? fehosts[hostname] : '';

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
    const domain = feUrl.split('/')[2];
    console.log(domain);
    res.cookie('user', req.user.name, { httpOnly: false, domain });
    res.cookie('picture', req.user.picture, { httpOnly: false, domain });
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

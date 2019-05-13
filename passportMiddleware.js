// UNUSED
const passport = require('passport');

const authWhitelist = ['nipunbatra.1984@gmail.com', 'achiekoaoki@gmail.com'];
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const isDev = process.env.NODE_ENV !== 'production';
if (isDev) {
  require('dotenv').config();
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:7890/auth/google/callback'
    },
    (accessToken, refreshToken, profile, done) => {
      if (authWhitelist.indexOf(profile._json.email) !== -1) {
        done(null, profile);
      }
      done(null, false, { message: 'User not found' });
    }
  )
);

module.exports = passport;

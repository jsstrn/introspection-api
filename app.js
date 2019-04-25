const express = require('express');
const app = express();
const cors = require('cors');
const passport = require('passport');
const authWhitelist = ['nipunbatra.1984@gmail.com', 'achiekoaoki@gmail.com'];
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cookieSession = require('cookie-session');
const { isValidBEHost, behosts } = require('./hostnames');

const isDev = process.env.NODE_ENV !== 'production';

const whitelist = [
  'https://auto-introspection-app.netlify.com',
  'https://qa-introspection-app.netlify.com',
  'https://staging-introspection-app.netlify.com'
];

if (isDev) {
  require('dotenv').config();
  whitelist.push('http://localhost:3000');
  whitelist.push(`http://localhost:${process.env.PORT}`);
}

const corsOptions = {
  origin(origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(
  cookieSession({
    maxAge: 3 * 60 * 60 * 1000, // One day in milliseconds
    keys: ['randomstringhere']
  })
);

app.use(passport.initialize()); // Used to initialize passport
app.use(passport.session());

const hostname = process.env.APP_NAME;
const hostUrl = isValidBEHost(hostname) ? behosts[hostname] : '';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${hostUrl}/auth/google/callback`
    },
    (accessToken, refreshToken, profile, done) => {
      if (authWhitelist.indexOf(profile._json.email) !== -1) {
        const user = {
          name: profile._json.name,
          email: profile._json.email,
          accessToken: accessToken,
          refreshToken: refreshToken,
          picture: profile._json.picture
        };
        done(null, user);
      }
      done(null, false, { message: 'User not found' });
    }
  )
);

// Used to stuff a piece of information into a cookie
passport.serializeUser((user, done) => {
  done(null, user);
});

// Used to decode the received cookie and persist session
passport.deserializeUser((user, done) => {
  done(null, user);
});

// middleware
app.use('/', cors(corsOptions));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// routes
app.use('/auth', require('./routes/auth'));
app.use('/upload', require('./routes/upload'));
app.use('/download', require('./routes/download'));
app.use('/introspection', require('./routes/introspection'));
app.use('/categories', require('./routes/categories'));
app.use('/actions', require('./routes/actions'));
app.use((err, req, res, next) => {
  return res.status(err.output.statusCode).json(err.output.payload);
});

app.route('/').get(() => {});

module.exports = app;

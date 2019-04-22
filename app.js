const express = require('express');
const app = express();
const cors = require('cors');

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

// middleware
app.use('/', cors(corsOptions));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// routes
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

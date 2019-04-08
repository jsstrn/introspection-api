const express = require('express');
const app = express();

// middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// routes
app.use('/upload', require('./routes/upload'));
app.route('/').get(() => {});

module.exports = app;

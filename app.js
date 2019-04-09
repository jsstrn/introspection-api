const express = require('express');
const app = express();

// middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// routes
app.use('/upload', require('./routes/upload'));
app.use('/introspection', require('./routes/introspection'));
app.use('/categories', require('./routes/categories'));
app.use((err, req, res, next) => {
  // console.log(err.message);
  //   console.log(err.output.payload);
  return res.status(err.output.statusCode).json(err.output.payload);
});
app.route('/').get(() => {});

module.exports = app;

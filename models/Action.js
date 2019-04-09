const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    trim: true
  }
});

const Action = mongoose.model('Action', actionSchema);

module.exports = Action;

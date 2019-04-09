const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
  rank: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
});

const Level = mongoose.model('Level', levelSchema);

module.exports = Level;

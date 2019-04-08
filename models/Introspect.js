const mongoose = require('mongoose');

const offices = ['Singapore', 'Thailand', 'Others'];
const levels = ['1. Open', '2. Informed', '3. Engaged', '4. Activated'];
const actions = [
  'Would like to explore',
  'Would like to deepen',
  'Would like to share'
];

const introspectSchema = new mongoose.Schema({
  timeStamp: {
    type: Date,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  office: {
    type: String,
    enum: offices
  },
  categories: [
    {
      category: {
        type: String,
        required: true
      },
      level: {
        type: String,
        enum: levels,
        required: true
      },
      action: {
        type: [String],
        enum: actions
      }
    }
  ]
});

const Introspect = mongoose.model('Introspect', introspectSchema);

module.exports = Introspect;

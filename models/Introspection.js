const mongoose = require('mongoose');

const offices = ['Singapore', 'Thailand', 'Others'];

const introspectionSchema = new mongoose.Schema({
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
      },
      level: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Level',
        required: true
      },
      action: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Action',
          required: true
        }
      ]
    }
  ]
});

const Introspection = mongoose.model('Introspection', introspectionSchema);

module.exports = Introspection;

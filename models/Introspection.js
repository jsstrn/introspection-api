const mongoose = require('mongoose');

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
    type: String
  },
  categories: [
    {
      name: {
        type: String,
        required: true
      },
      level: {
        type: String
      },
      action: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Action'
        }
      ]
    }
  ]
});

const Introspection = mongoose.model('Introspection', introspectionSchema);

module.exports = Introspection;

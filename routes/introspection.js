const express = require('express');
const router = express.Router();
const Introspection = require('../models/Introspection');
const boom = require('boom');
const asyncMiddleware = require('../asyncMiddleware');

router.route('/').get(
  asyncMiddleware(async (req, res) => {
    let introspections;
    const { email, office } = req.query;
    if (email) {
      introspections = await Introspection.findOne({ email })
        .populate('categories.category')
        .populate('categories.action')
        .populate('categories.level');

      if (!introspections) {
        throw boom.badRequest('Invalid Email');
      }
      introspections = [introspections];
    } else if (office) {
      introspections = await Introspection.find({ office })
        .populate('categories.category')
        .populate('categories.action')
        .populate('categories.level');

      if (introspections.length === 0) {
        throw boom.badRequest('Invalid Office');
      }
    } else {
      introspections = await Introspection.find()
        .populate('categories.category')
        .populate('categories.action')
        .populate('categories.level');
    }
    //deep clone
    const jsonString = JSON.stringify(introspections);
    introspections = JSON.parse(jsonString);
    const mappedIntrospections = introspections.map(result => {
      result.categories.map(item => {
        delete item._id;
        item.category = item.category.name;
        item.level = item.level.rank;
        item.action = item.action.map(element => {
          return element.name;
        });
        return item;
      });
      return result;
    });
    res.status(200).json(mappedIntrospections);
  })
);

module.exports = router;

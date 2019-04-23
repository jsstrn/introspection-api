const express = require('express');
const router = express.Router();
const Introspection = require('../models/Introspection');
const boom = require('boom');
const asyncMiddleware = require('../asyncMiddleware');
const authentication = require('../authMiddleware');

router.route('/').get(
  authentication,
  asyncMiddleware(async (req, res) => {
    let introspections;
    const { email, office } = req.query;
    if (email) {
      introspections = await Introspection.findOne({
        email: new RegExp('^' + email + '$', 'i')
      }).populate('categories.action');

      if (!introspections) {
        throw boom.badRequest('Invalid Email');
      }
      introspections = [introspections];
    } else if (office) {
      introspections = await Introspection.find({
        office: new RegExp('^' + office + '$', 'i')
      }).populate('categories.action');

      if (introspections.length === 0) {
        throw boom.badRequest('Invalid Office');
      }
    } else {
      introspections = await Introspection.find().populate('categories.action');
    }
    //deep clone
    const jsonString = JSON.stringify(introspections);
    introspections = JSON.parse(jsonString);
    const mappedIntrospections = introspections.map(result => {
      result.categories.map(item => {
        delete item._id;
        item.category = item.name;
        item.level = item.level;
        item.action = item.action.map(element => {
          return element.name;
        });
        delete item.name;
        return item;
      });
      return result;
    });
    res.status(200).json(mappedIntrospections);
  })
);

module.exports = router;

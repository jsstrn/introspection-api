const express = require('express');
const router = express.Router();
const Introspection = require('../models/Introspection');
const Category = require('../models/Category');
const Action = require('../models/Action');
const Level = require('../models/Level');

router.route('/').get(async (req, res) => {
  let introspections = await Introspection.find()
    .populate('categories.category')
    .populate('categories.action')
    .populate('categories.level');

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
});

module.exports = router;

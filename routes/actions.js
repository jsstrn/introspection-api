const express = require('express');
const boom = require('boom');
const router = express.Router();
const asyncMiddleware = require('../asyncMiddleware');
const Action = require('../models/Action');
const authentication = require('../authMiddleware');
router.route('/').get(
  authentication,
  asyncMiddleware(async (req, res) => {
    const actions = await Action.find();
    const actionsMapped = actions.map(elem => elem.name);

    res.json(actionsMapped);
  })
);

module.exports = router;

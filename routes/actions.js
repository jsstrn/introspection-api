const express = require('express');
const boom = require('boom');
const router = express.Router();
const asyncMiddleware = require('../asyncMiddleware');
const Action = require('../models/Action');

router.route('/').get(
  asyncMiddleware(async (req, res) => {
    const actions = await Action.find();
    const actionsMapped = actions.map(elem => elem.name);

    res.status(200).json(actionsMapped);
  })
);

module.exports = router;

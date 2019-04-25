const express = require('express');
const boom = require('boom');
const router = express.Router();
const multer = require('multer');
const File = require('../models/File');
const asyncMiddleware = require('../asyncMiddleware');
const authentication = require('../authMiddleware');
const storage = multer.memoryStorage();

router.route('/').get(
  authentication,
  asyncMiddleware(async (req, res) => {
    const file = await File.findOne();
    if (!file) {
      throw boom.notFound('No CSV file found');
    }

    res.setHeader(
      'Content-disposition',
      'attachment; filename=introspections.csv'
    );
    res.setHeader('Content-type', 'text/csv');
    res.setHeader('Content-Length', file.binary.length);
    return res.status(200).send(file.binary);
  })
);

module.exports = router;

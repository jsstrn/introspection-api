const express = require('express');
const boom = require('boom');
const router = express.Router();
const multer = require('multer');
const File = require('../models/File');
const Introspection = require('../models/Introspection');
const asyncMiddleware = require('../asyncMiddleware');
const csvParser = require('./helpers/csvParser');
const buildModel = require('./helpers/buildModel');
const storage = multer.memoryStorage();

const limit = {
  files: 1,
  fileSize: 1
};

const fileFilter = (req, file, cb) => {
  const acceptableTypes = [
    'text/comma-separated-values',
    'text/csv',
    'application/csv',
    'application/excel',
    'application/vnd.ms-excel',
    'application/vnd.msexcel',
    'application/octet-stream'
  ];
  if (acceptableTypes.indexOf(file.mimetype) === -1) {
    cb(null, false);
  } else {
    cb(null, true);
  }
};

const upload = multer({ storage, limit, fileFilter });

router.use(upload.single('file'));

router.route('/').post(
  asyncMiddleware(async (req, res) => {
    if (!req.file) {
      throw boom.badRequest('Only CSV files are allowed');
    }
    const { buffer, originalname } = req.file;

    const file = new File({ binary: buffer });
    const buffercsv = await file.save();

    const jsonArray = await csvParser(buffercsv);
    await buildModel(jsonArray);
    await Introspection.collection.deleteMany({});
    await Introspection.insertMany(jsonArray);
    return res.status(201).json(`👍 Successfully uploaded ${originalname}`);
  })
);
router.use((err, req, res, next) => {
  return res.status(err.output.statusCode).json(err.output.payload);
});

module.exports = router;

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
  console.log(file.mimetype);
  if (
    file.mimetype !== 'text/csv' &&
    file.mimetype !== 'application/vnd.ms-excel' &&
    file.mimetype !== 'application/octet-stream'
  ) {
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
      console.log(req);
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

module.exports = router;

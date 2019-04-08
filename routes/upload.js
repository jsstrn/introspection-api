const express = require('express');
const router = express.Router();
const multer = require('multer');
const File = require('../models/File');

const storage = multer.memoryStorage();

const limit = {
  files: 1,
  fileSize: 1
};

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== 'text/csv') {
    cb(null, false);
  } else {
    cb(null, true);
  }
};

const upload = multer({ storage, limit, fileFilter });

router.use(upload.single('file'));

router.route('/').post((req, res) => {
  if (!req.file) {
    return res.status(400).send('Only CSV files are allowed');
  }

  const { buffer, originalname } = req.file;

  const file = new File({ binary: buffer });
  file.save(err => {
    if (err) {
      return res.status(500).send(err);
    }
    return res.status(201).send(`👍 Successfully uploaded ${originalname}`);
  });
});

module.exports = router;

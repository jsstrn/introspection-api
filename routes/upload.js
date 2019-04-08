const express = require('express');
const router = express.Router();
const multer = require('multer');
const File = require('../models/File');
const Survey = require('../models/Survey');
const csv = require('csvtojson');

const storage = multer.memoryStorage();

const limit = {
  files: 1,
  fileSize: 1
};

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype !== 'text/csv' &&
    file.mimetype !== 'application/vnd.ms-excel'
  ) {
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
  file.save(async (err, buffer) => {
    if (err) {
      return res.status(500).send(err);
    }
    try {
      const data = buffer.binary.toString('utf8');
      const jsonArray = await csv().fromString(data);

      for (const result of jsonArray) {
        const replaceKeysArray = [
          ['timeStamp', 'Timestamp'],
          ['name', "What's your name?"],
          ['email', 'Email Address'],
          ['office', 'Which office are you from?']
        ];
        for (const [newKey, replacedKey] of replaceKeysArray) {
          result[newKey] = result[replacedKey];
          delete result[replacedKey];
        }
        const objectKeys = Object.keys(result);
        const actionPlanKeys = objectKeys.filter(key => {
          return key.includes('Action Plan');
        });
        let categories = [];
        for (const item of actionPlanKeys) {
          const pattern = /(?<=\[).*(?=\]$)/;
          const amendedKey = item.match(pattern)[0];
          const object = {
            name: amendedKey,
            level: result[amendedKey],
            action: result[item] ? result[item].split(', ') : []
          };
          delete result[amendedKey];
          delete result[item];
          categories.push(object);
        }
        result.categories = categories;
      }
      await Survey.collection.deleteMany({});
      await Survey.insertMany(jsonArray);
      return res.status(201).send(`👍 Successfully uploaded ${originalname}`);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

module.exports = router;

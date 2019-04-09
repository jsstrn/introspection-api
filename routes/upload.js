const express = require('express');
const router = express.Router();
const multer = require('multer');
const File = require('../models/File');
const Introspection = require('../models/Introspection');
const Category = require('../models/Category');
const Action = require('../models/Action');
const Level = require('../models/Level');

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
            category: amendedKey,
            level: result[amendedKey],
            action: result[item] ? result[item].split(', ') : []
          };
          delete result[amendedKey];
          delete result[item];

          let category = await Category.findOne({ name: object.category });
          if (!category) {
            category = new Category({ name: object.category });
            await category.save();
          }
          if (!object.level) {
            throw new Error(
              `Value cannot be empty for '${category.name}' for '${
                result.email
              }'`
            );
          }
          const levelRankRegex = /([^.]+)/;
          const levelRank = object.level.match(levelRankRegex)[0];

          let level = await Level.findOne({ rank: levelRank });
          if (!level) {
            throw new Error(
              `invalid level '${object.level}' for '${category.name}' for '${
                result.email
              }'`
            );
          }
          let actions = [];
          for (const item of object.action) {
            const action = await Action.findOne({ name: item });
            if (!action) {
              throw new Error(
                `invalid action '${item}' for '${category.name}' for '${
                  result.email
                }'`
              );
            }
            actions.push(action._id);
          }
          categories.push({
            category: category._id,
            level: level._id,
            action: actions
          });
        }
        result.categories = categories;
      }
      await Introspection.collection.deleteMany({});
      await Introspection.insertMany(jsonArray);
      return res.status(201).send(`👍 Successfully uploaded ${originalname}`);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

module.exports = router;

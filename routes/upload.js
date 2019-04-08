const path = require("path");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const File = require("../models/File");

const storage = multer.memoryStorage();

const limit = {
  files: 1,
  fileSize: 1
};

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== "text/csv") {
    console.log("💩", file);
    cb(null, false);
  } else {
    console.log("OKAY", file);
    cb(null, true);
  }
};

const upload = multer({ storage, limit, fileFilter });

router.use(upload.single("file"));

router.route("/").post((req, res) => {
  if (!req.file) {
    return res.status(400).send("Only CSV files are allowed");
  }

  console.log("🗄 File metadata", req.file);
  const { buffer, originalname, mimetype, size } = req.file;

  const file = new File({ binary: buffer });
  file.save((err, file) => {
    if (err) {
      return res.status(500).send(err);
    }
    return res.status(201).send(`👍 Successfully uploaded ${originalname}`);
  });
});

module.exports = router;

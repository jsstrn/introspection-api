const path = require("path");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const File = require("../models/File");

const upload = multer({
  storage: multer.memoryStorage()
});

router.route("/").post(upload.single("file"), (req, res) => {
  console.log("🗄 File metadata", req.file);

  const { buffer, originalname, mimetype, size } = req.file;

  const file = new File({ binary: buffer });
  file.save((err, file) => {
    if (err) {
      return res.send(500, err);
    }
    return res.send(
      201,
      `👍 Successfully uploaded ${originalname}`
    );
  });
});

module.exports = router;

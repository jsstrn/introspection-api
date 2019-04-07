const path = require("path");
const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage()
});

const mongoose = require("mongoose");
const dataSchema = new mongoose.Schema({
  binData: {
    type: Buffer,
    required: true
  }
});

const Data = mongoose.model("Data", dataSchema);

router.route("/").post(upload.single("file"), (req, res) => {
  console.log("🗄 File metadata", req.file, req.file.buffer);

  const {
    buffer,
    filename,
    destination,
    originalname,
    mimetype,
    size
  } = req.file;
  const data = new Data({ binData: buffer });

  data.save((err, file) => {
    if (err) {
      return res.send(500, err);
    }
    return res.send(
      201,
      `👍 Successfully uploaded ${originalname} to ${destination}`
    );
  });
});

module.exports = router;

const path = require("path");
const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer({
  dest: "./public/uploads/"
});

router.route("/").post(upload.single("csv"), (req, res) => {
  console.log("🗄 File metadata", req.file);
  const {destination, originalname, mimetype} = req.file;
  return res.send(`👍 Successfully uploaded ${originalname} to ${destination}`);
});

module.exports = router;

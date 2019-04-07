const path = require("path");
const express = require("express");
const app = express();
const multer = require("multer");

// middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/upload", require("./routes/upload"));
app.route("/").get((req, res) => {});

module.exports = app;

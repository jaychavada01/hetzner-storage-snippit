const AWS = require("aws-sdk");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const MOMENT = require("moment");
const EXPRESS = require("express");
const CORS = require("cors");
const FS = require("fs");

const UUID = () => uuidv4();

module.exports = {
  AWS,
  SHARP: sharp,
  UUID,
  MOMENT,
  EXPRESS,
  CORS,
  FS,
};

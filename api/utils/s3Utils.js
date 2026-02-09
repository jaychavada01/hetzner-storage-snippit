const AWS = require("aws-sdk");
const envConfig = require("../../config/envConfig");

const s3Utils = new AWS.S3({
  endpoint: envConfig.STORAGE.ENDPOINT,
  region: envConfig.STORAGE.REGION,
  accessKeyId: envConfig.STORAGE.ACCESS_KEY,
  secretAccessKey: envConfig.STORAGE.SECRET_KEY,
  s3ForcePathStyle: true,
  signatureVersion: "v4",
});

module.exports = s3Utils;
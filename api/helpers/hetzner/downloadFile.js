const AWS = require("aws-sdk");
const { HETZNER_STORAGE } = require("../../../config/constants");

// S3 CLIENT - PRIVATE BUCKET
const s3 = new AWS.S3({
  endpoint: HETZNER_STORAGE.ENDPOINT,
  region: HETZNER_STORAGE.REGION,
  accessKeyId: HETZNER_STORAGE.ACCESS_KEY,
  secretAccessKey: HETZNER_STORAGE.SECRET_KEY,
  s3ForcePathStyle: true,
  signatureVersion: "v4",
});

/**
 * Download file from private bucket
 */
const downloadFile = async ({ sourceFilePath }) => {
  try {
    let resolvedKey = sourceFilePath;

    // Check if file exists
    try {
      await s3
        .headObject({
          Bucket: HETZNER_STORAGE.BUCKET,
          Key: resolvedKey,
        })
        .promise();
    } catch (headError) {
      if (headError.code === "NotFound") {
        // Fallback: try with bucket prefix
        const bucketPrefixed = `${HETZNER_STORAGE.BUCKET}/${sourceFilePath}`;
        try {
          await s3
            .headObject({
              Bucket: HETZNER_STORAGE.BUCKET,
              Key: bucketPrefixed,
            })
            .promise();
          resolvedKey = bucketPrefixed;
        } catch (secondError) {
          if (secondError.code === "NotFound") {
            return {
              isError: true,
              data: "File does not exist in storage",
            };
          }
          throw secondError;
        }
      } else {
        throw headError;
      }
    }

    // Download file
    const downloadResult = await s3
      .getObject({
        Bucket: HETZNER_STORAGE.BUCKET,
        Key: resolvedKey,
      })
      .promise();

    return {
      isError: false,
      data: downloadResult.Body,
    };
  } catch (error) {
    return {
      isError: true,
      data: error.message,
    };
  }
};

module.exports = downloadFile;

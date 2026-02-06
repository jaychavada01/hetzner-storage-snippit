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
 * Delete file from private bucket
 */
const deleteFile = async ({ filePath }) => {
  try {
    // Check if file exists
    try {
      await s3
        .headObject({
          Bucket: HETZNER_STORAGE.BUCKET,
          Key: filePath,
        })
        .promise();
    } catch (headError) {
      if (headError.code === "NotFound") {
        return {
          isError: true,
          data: "File does not exist in storage",
        };
      }
      throw headError;
    }

    // Delete file from storage
    await s3
      .deleteObject({
        Bucket: HETZNER_STORAGE.BUCKET,
        Key: filePath,
      })
      .promise();

    return {
      isError: false,
      data: "File deleted successfully",
    };
  } catch (error) {
    return {
      isError: true,
      data: error.message,
    };
  }
};

module.exports = deleteFile;

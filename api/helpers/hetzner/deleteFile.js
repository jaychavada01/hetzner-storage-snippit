const envConfig = require("../../../config/envConfig");
const s3Utils = require("../../utils/s3Utils");

/**
 * Delete file from private bucket
 */
const deleteFile = async ({ filePath }) => {
  try {
    // Check if file exists
    try {
      await s3Utils
        .headObject({
          Bucket: envConfig.STORAGE.BUCKET,
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
    await s3Utils
      .deleteObject({
        Bucket: envConfig.STORAGE.BUCKET,
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

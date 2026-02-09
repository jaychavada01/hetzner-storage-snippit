const envConfig = require("../../../config/envConfig");
const s3Utils = require("../../utils/s3Utils");

/**
 * Download file from private bucket
 */
const downloadFile = async ({ sourceFilePath }) => {
  try {
    let resolvedKey = sourceFilePath;

    // Check if file exists
    try {
      await s3Utils
        .headObject({
          Bucket: envConfig.STORAGE.BUCKET,
          Key: resolvedKey,
        })
        .promise();
    } catch (headError) {
      if (headError.code === "NotFound") {
        // Fallback: try with bucket prefix
        const bucketPrefixed = `${envConfig.STORAGE.BUCKET}/${sourceFilePath}`;
        try {
          await s3Utils
            .headObject({
              Bucket: envConfig.STORAGE.BUCKET,
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
    const downloadResult = await s3Utils
      .getObject({
        Bucket: envConfig.STORAGE.BUCKET,
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

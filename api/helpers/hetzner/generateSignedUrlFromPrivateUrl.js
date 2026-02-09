const envConfig = require("../../../config/envConfig");
const { normalizeS3KeyFromUrl } = require("../../utils/fileUtils");
const s3Utils = require("../../utils/s3Utils");

/**
 * Generate signed URL from private URL
 * Used for: Regenerating expired signed URLs
 */
const generateSignedUrlFromPrivateUrl = async (privateUrl, expiryHours = 2) => {
  try {
    if (!privateUrl) {
      return {
        isError: true,
        data: "Private URL is required",
      };
    }

    // Normalize URL to extract S3 key
    const key = normalizeS3KeyFromUrl(privateUrl, envConfig.STORAGE.BUCKET);

    if (!key) {
      return {
        isError: true,
        data: "Invalid object key derived from URL",
      };
    }

    // Generate signed URL
    const signedUrl = s3Utils.getSignedUrl("getObject", {
      Bucket: envConfig.STORAGE.BUCKET,
      Key: key,
      Expires: expiryHours * 60 * 60,
      ResponseContentDisposition: "inline",
    });

    return {
      isError: false,
      data: signedUrl,
    };
  } catch (error) {
    return {
      isError: true,
      data: error.message,
    };
  }
};

module.exports = generateSignedUrlFromPrivateUrl;

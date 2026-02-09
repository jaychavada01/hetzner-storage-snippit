const { SIGNED_URL_EXPIRY } = require("../../../config/constants");
const envConfig = require("../../../config/envConfig");
const s3Utils = require("../../utils/s3Utils");

/**
 * Generate signed URL from file path
 * Used for: Creating temporary access URLs for private media
 */
const generateSignedUrl = async ({
  filePath,
  fileName,
  contentType,
  expiresIn,
}) => {
  try {
    // Generate signed URL with specified or default expiry
    const signedUrl = s3Utils.getSignedUrl("getObject", {
      Bucket: envConfig.STORAGE.BUCKET,
      Key: filePath,
      Expires: expiresIn || SIGNED_URL_EXPIRY.TWO_HOURS,
      ResponseContentType: contentType,
      ResponseContentDisposition: `inline; filename="${fileName}"`,
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

module.exports = generateSignedUrl;

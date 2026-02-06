const {
  HETZNER_STORAGE,
  SIGNED_URL_EXPIRY,
} = require("../../../config/constants");
const AWS = require("aws-sdk");

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
    const signedUrl = s3.getSignedUrl("getObject", {
      Bucket: HETZNER_STORAGE.BUCKET,
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

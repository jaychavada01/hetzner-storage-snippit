const AWS = require("aws-sdk");
const { normalizeS3KeyFromUrl } = require("../../utils/fileUtils");
const { HETZNER_STORAGE } = require("../../../config/constants");


// ============================================
// S3 CLIENT - PRIVATE BUCKET
// ============================================
const s3 = new AWS.S3({
  endpoint: HETZNER_STORAGE.ENDPOINT,
  region: HETZNER_STORAGE.REGION,
  accessKeyId: HETZNER_STORAGE.ACCESS_KEY,
  secretAccessKey: HETZNER_STORAGE.SECRET_KEY,
  s3ForcePathStyle: true,
  signatureVersion: "v4",
});

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
    const key = normalizeS3KeyFromUrl(privateUrl, HETZNER_STORAGE.BUCKET);

    if (!key) {
      return {
        isError: true,
        data: "Invalid object key derived from URL",
      };
    }

    // Generate signed URL
    const signedUrl = s3.getSignedUrl("getObject", {
      Bucket: HETZNER_STORAGE.BUCKET,
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

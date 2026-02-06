// ============================================
// FILE UTILITY FUNCTIONS
// ============================================

/**
 * Get content type by file extension
 */
const getContentTypeByExtension = (extension) => {
  const ext = extension.toLowerCase();
  const contentTypeMap = {
    // Images
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",

    // Videos
    mp4: "video/mp4",
    mpeg: "video/mpeg",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    webm: "video/webm",

    // Documents
    pdf: "application/pdf",

    // Default
    default: "application/octet-stream",
  };

  return contentTypeMap[ext] || contentTypeMap.default;
};

/**
 * Check if file extension is eligible for thumbnail generation
 */
const isThumbnailEligible = (extension) => {
  const ext = extension.toLowerCase();
  const eligibleExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
  return eligibleExtensions.includes(ext);
};

/**
 * Normalize S3 key from URL
 * Handles various URL formats and strips bucket prefixes
 */
const normalizeS3KeyFromUrl = (url, bucketName) => {
  try {
    // Remove query parameters
    const baseUrl = url.split("?")[0];

    // Parse URL
    const urlToParse = /^https?:\/\//i.test(baseUrl)
      ? baseUrl
      : `https://${baseUrl}`;

    const parsed = new URL(urlToParse);
    let path = decodeURIComponent(parsed.pathname);

    // Remove leading slash
    if (path.startsWith("/")) {
      path = path.slice(1);
    }

    // Remove bucket prefix if present
    while (path.startsWith(bucketName + "/")) {
      path = path.slice(bucketName.length + 1);
    }

    return path;
  } catch (error) {
    throw new Error(`Invalid URL format: ${error.message}`);
  }
};

module.exports = {
  getContentTypeByExtension,
  isThumbnailEligible,
  normalizeS3KeyFromUrl,
};

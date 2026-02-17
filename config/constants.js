// HTTP STATUS CODES
const HTTP_STATUS_CODE = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

// FILE CONSTANTS
const FILE_CONSTANTS = {
  MAX_SIZE: 52428800, // 50MB default
  TYPES: {
    IMAGE: {
      CONTENT_TYPES: [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
      ],
    },
    VIDEO: {
      CONTENT_TYPES: [
        "video/mp4",
        "video/mpeg",
        "video/quicktime",
        "video/x-msvideo",
        "video/webm",
      ],
    },
    PDF: {
      CONTENT_TYPES: ["application/pdf"],
    },
  },
  THUMBNAIL: {
    MAX_SIZE: 200,
    FORMAT: "webp",
    CONTENT_TYPE: "image/webp",
    THUMB_DIR: "thumbnails",
    SVG_RASTERIZE_DENSITY: 300,
  },
  ALLOWED_FOLDERS: ["feed", "general"],
};

// SIGNED URL EXPIRY
const SIGNED_URL_EXPIRY = {
  TWO_HOURS: 7200, // 2 hours in seconds
};

// MEDIA MODULE CONSTANTS
const MEDIA_CONSTANTS = {
  MULTIPART_CHUNK_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_BULK_UPLOAD: 20,
  ALLOWED_IMAGE_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ],
  ALLOWED_VIDEO_TYPES: [
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/x-msvideo",
    "video/webm",
  ],
};

module.exports = {
  HTTP_STATUS_CODE,
  FILE_CONSTANTS,
  SIGNED_URL_EXPIRY,
  MEDIA_CONSTANTS,
};

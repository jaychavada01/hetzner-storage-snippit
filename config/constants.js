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
  MAX_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 52428800, // 50MB default
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
    MAX_SIZE: parseInt(process.env.MAX_THUMBNAIL_SIZE) || 200,
    FORMAT: "webp",
    CONTENT_TYPE: "image/webp",
    THUMB_DIR: "thumbnails",
    SVG_RASTERIZE_DENSITY: 300,
  },
};

// HETZNER STORAGE - PRIVATE BUCKET
const HETZNER_STORAGE = {
  ENDPOINT: process.env.HETZNER_STORAGE_ENDPOINT,
  REGION: process.env.HETZNER_STORAGE_REGION,
  BUCKET: process.env.HETZNER_STORAGE_BUCKET,
  ACCESS_KEY: process.env.HETZNER_STORAGE_ACCESS_KEY,
  SECRET_KEY: process.env.HETZNER_STORAGE_SECRET_KEY,

  // Public bucket configuration
  PUBLIC_ENDPOINT: process.env.HETZNER_STORAGE_PUBLIC_ENDPOINT,
  PUBLIC_BUCKET: process.env.HETZNER_STORAGE_PUBLIC_BUCKET,
  PUBLIC_ACCESS_KEY: process.env.HETZNER_STORAGE_PUBLIC_ACCESS_KEY,
  PUBLIC_SECRET_KEY: process.env.HETZNER_STORAGE_PUBLIC_SECRET_KEY,
  PUBLIC_BASE_URL: process.env.HETZNER_STORAGE_PUBLIC_BASE_URL,
};

// SIGNED URL EXPIRY
const SIGNED_URL_EXPIRY = {
  TWO_HOURS: parseInt(process.env.SIGNED_URL_EXPIRY_TWO_HOURS) || 7200,
  ONE_HOUR: parseInt(process.env.SIGNED_URL_EXPIRY_ONE_HOUR) || 3600,
  THIRTY_MINUTES:
    parseInt(process.env.SIGNED_URL_EXPIRY_THIRTY_MINUTES) || 1800,
};

module.exports = {
  HTTP_STATUS_CODE,
  FILE_CONSTANTS,
  HETZNER_STORAGE,
  SIGNED_URL_EXPIRY,
};

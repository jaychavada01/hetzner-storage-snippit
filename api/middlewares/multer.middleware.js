const { MULTER } = require("../../config/packages");
const { FILE_CONSTANTS, MEDIA_CONSTANTS } = require("../../config/constants");
const PATH = require("path");

// Configure disk storage for videos (multipart upload)
const diskStorage = MULTER.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/tmp/uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + PATH.extname(file.originalname),
    );
  },
});

// Configure memory storage for images (direct upload)
const memoryStorage = MULTER.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Accept all files, validation will be done in service layer
  cb(null, true);
};

// Create multer instance for disk storage (videos)
const uploadDisk = MULTER({
  storage: diskStorage,
  limits: {
    fileSize: FILE_CONSTANTS.MAX_SIZE,
  },
  fileFilter: fileFilter,
}).single("file");

// Create multer instance for memory storage (images)
const uploadMemory = MULTER({
  storage: memoryStorage,
  limits: {
    fileSize: FILE_CONSTANTS.MAX_SIZE,
  },
  fileFilter: fileFilter,
}).single("file");

/**
 * Smart multer middleware that detects file type and uses appropriate storage
 * Uses a two-pass approach: first parse to detect type, then use correct storage
 */
const uploadSingleSmart = (req, res, next) => {
  // Use memory storage with a custom handler
  const tempUpload = MULTER({
    storage: memoryStorage,
    limits: {
      fileSize: FILE_CONSTANTS.MAX_SIZE,
    },
    fileFilter: (req, file, cb) => {
      // Check if file is video
      const isVideo = MEDIA_CONSTANTS.ALLOWED_VIDEO_TYPES.includes(
        file.mimetype,
      );

      cb(null, true);
    },
  }).single("file");

  tempUpload(req, res, (err) => {
    if (err) {
      return next(err);
    }

    // If file is video and in memory, we need to save it to disk
    if (
      req.file &&
      MEDIA_CONSTANTS.ALLOWED_VIDEO_TYPES.includes(req.file.mimetype)
    ) {
      const FS = require("fs");
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const filename =
        req.file.fieldname +
        "-" +
        uniqueSuffix +
        PATH.extname(req.file.originalname);
      const filepath = PATH.join("/tmp/uploads", filename);

      // Write buffer to disk for multipart upload
      FS.writeFileSync(filepath, req.file.buffer);

      // Update file object to include path
      req.file.path = filepath;
    }

    next();
  });
};

// Multer configuration for bulk upload (memory storage)
const uploadBulk = MULTER({
  storage: memoryStorage,
  limits: {
    fileSize: FILE_CONSTANTS.MAX_SIZE,
  },
  fileFilter: fileFilter,
}).array("files", 20);

module.exports = {
  uploadSingleSmart,
  uploadBulk,
};

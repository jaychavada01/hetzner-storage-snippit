const { JOI } = require("../../config/packages");
const { MEDIA_CONSTANTS } = require("../../config/constants");

/**
 * Validation schema for single file upload
 * Type is now auto-detected from file mimetype
 */
const uploadSchema = JOI.object({
  folder: JOI.string().trim().min(1).required().messages({
    "string.empty": "Folder name cannot be empty",
    "any.required": "Folder name is required",
  }),
});

/**
 * Validation schema for bulk file upload
 */
const bulkUploadSchema = JOI.object({
  folder: JOI.string().trim().min(1).required().messages({
    "string.empty": "Folder name cannot be empty",
    "any.required": "Folder name is required",
  }),
});

/**
 * Validation schema for file deletion
 */
const deleteSchema = JOI.object({
  key: JOI.string().trim().min(1).required().messages({
    "string.empty": "File key cannot be empty",
    "any.required": "File key is required",
  }),
});

/**
 * Validation schema for file download
 */
const downloadSchema = JOI.object({
  key: JOI.string().trim().min(1).required().messages({
    "string.empty": "File key cannot be empty",
    "any.required": "File key is required",
  }),
});

/**
 * Validate file count for bulk upload
 */
const validateFileCount = (filesCount) => {
  if (filesCount === 0) {
    return { error: "No files provided" };
  }
  if (filesCount > MEDIA_CONSTANTS.MAX_BULK_UPLOAD) {
    return {
      error: `Maximum ${MEDIA_CONSTANTS.MAX_BULK_UPLOAD} files allowed`,
    };
  }
  return { error: null };
};

/**
 * Determine file type from mimetype and validate
 * @param {String} mimetype - File mimetype
 * @returns {Object} { type: 'image'|'video'|null, isValid: boolean }
 */
const determineFileType = (mimetype) => {
  if (MEDIA_CONSTANTS.ALLOWED_IMAGE_TYPES.includes(mimetype)) {
    return { type: "image", isValid: true };
  }
  if (MEDIA_CONSTANTS.ALLOWED_VIDEO_TYPES.includes(mimetype)) {
    return { type: "video", isValid: true };
  }
  return { type: null, isValid: false };
};

module.exports = {
  uploadSchema,
  bulkUploadSchema,
  deleteSchema,
  downloadSchema,
  validateFileCount,
  determineFileType,
};

const { HTTP_STATUS_CODE } = require("../../config/constants");
const { successResponse, errorResponse } = require("../utils/response.util");
const {
  uploadSchema,
  bulkUploadSchema,
  deleteSchema,
  downloadSchema,
  validateFileCount,
} = require("../validations/media.validation");
const {
  uploadFile,
  uploadBulkFiles,
  deleteFile,
  downloadFile,
} = require("../services/media.service");

/**
 * Controller: Upload single file
 * POST /api/media/upload
 * File type is automatically determined from the uploaded file's mimetype
 */
const upload = async (req, res) => {
  try {
    // Set locale from accept-language header
    const locale =
      req.headers["accept-language"]?.split(",")[0]?.split("-")[0] || "en";
    req.setLocale(locale);

    // Validate request body (only folder is required now)
    const { error, value } = uploadSchema.validate(req.body);
    if (error) {
      return errorResponse(
        res,
        req.__("media.validation.invalidRequest"),
        HTTP_STATUS_CODE.BAD_REQUEST,
        { details: error.details[0].message },
      );
    }

    // Check if file exists
    if (!req.file) {
      return errorResponse(
        res,
        req.__("media.upload.fileRequired"),
        HTTP_STATUS_CODE.BAD_REQUEST,
      );
    }

    const { folder } = value;

    // Call service layer (file type will be auto-detected)
    const result = await uploadFile(req.file, folder, req);

    return successResponse(
      res,
      result.message,
      result.data,
      HTTP_STATUS_CODE.CREATED,
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message || req.__("media.upload.error"),
      HTTP_STATUS_CODE.SERVER_ERROR,
    );
  }
};

/**
 * Controller: Upload multiple files
 * POST /api/media/upload-bulk
 */
const uploadBulk = async (req, res) => {
  try {
    // Set locale from accept-language header
    const locale =
      req.headers["accept-language"]?.split(",")[0]?.split("-")[0] || "en";
    req.setLocale(locale);

    // Validate request body
    const { error, value } = bulkUploadSchema.validate(req.body);
    if (error) {
      return errorResponse(
        res,
        req.__("media.validation.invalidRequest"),
        HTTP_STATUS_CODE.BAD_REQUEST,
        { details: error.details[0].message },
      );
    }

    // Check if files exist
    if (!req.files || req.files.length === 0) {
      return errorResponse(
        res,
        req.__("media.bulkUpload.noFiles"),
        HTTP_STATUS_CODE.BAD_REQUEST,
      );
    }

    // Validate file count
    const fileCountValidation = validateFileCount(req.files.length);
    if (fileCountValidation.error) {
      return errorResponse(
        res,
        fileCountValidation.error,
        HTTP_STATUS_CODE.BAD_REQUEST,
      );
    }

    const { folder } = value;

    // Call service layer
    const result = await uploadBulkFiles(req.files, folder, req);

    return successResponse(
      res,
      result.message,
      result.data,
      HTTP_STATUS_CODE.CREATED,
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message || req.__("media.bulkUpload.error"),
      HTTP_STATUS_CODE.SERVER_ERROR,
    );
  }
};

/**
 * Controller: Delete file
 * DELETE /api/media/delete
 */
const deleteMedia = async (req, res) => {
  try {
    // Set locale from accept-language header
    const locale =
      req.headers["accept-language"]?.split(",")[0]?.split("-")[0] || "en";
    req.setLocale(locale);

    // Validate query parameters
    const { error, value } = deleteSchema.validate(req.query);
    if (error) {
      return errorResponse(
        res,
        req.__("media.validation.invalidRequest"),
        HTTP_STATUS_CODE.BAD_REQUEST,
        { details: error.details[0].message },
      );
    }

    const { key } = value;

    // Call service layer
    const result = await deleteFile(key, req);

    return successResponse(res, result.message, result.data);
  } catch (error) {
    return errorResponse(
      res,
      error.message || req.__("media.delete.error"),
      HTTP_STATUS_CODE.SERVER_ERROR,
    );
  }
};

/**
 * Controller: Download file
 * GET /api/media/download
 */
const download = async (req, res) => {
  try {
    // Set locale from accept-language header
    const locale =
      req.headers["accept-language"]?.split(",")[0]?.split("-")[0] || "en";
    req.setLocale(locale);

    // Validate query parameters
    const { error, value } = downloadSchema.validate(req.query);
    if (error) {
      return errorResponse(
        res,
        req.__("media.validation.invalidRequest"),
        HTTP_STATUS_CODE.BAD_REQUEST,
        { details: error.details[0].message },
      );
    }

    const { key } = value;

    // Call service layer
    const result = await downloadFile(key, req);

    // Set headers for file download
    res.setHeader("Content-Type", result.contentType);
    res.setHeader("Content-Length", result.contentLength);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.fileName}"`,
    );

    // Stream file to response
    result.stream.pipe(res);
  } catch (error) {
    return errorResponse(
      res,
      error.message || req.__("media.download.error"),
      HTTP_STATUS_CODE.SERVER_ERROR,
    );
  }
};

module.exports = {
  upload,
  uploadBulk,
  deleteMedia,
  download,
};

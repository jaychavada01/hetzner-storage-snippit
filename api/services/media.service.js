const { UUID, FS } = require("../../config/packages");
const {
  uploadFileToS3,
  uploadFileMultipart,
  deleteFileFromS3,
  getFileFromS3,
  generateSignedUrl,
} = require("../helpers/s3.helper");
const { determineFileType } = require("../validations/media.validation");
const { SIGNED_URL_EXPIRY } = require("../../config/constants");
const PATH = require("path");

/**
 * Service: Upload single file
 * Automatically determines file type from mimetype
 * Handles both image (direct upload) and video (multipart upload)
 */
const uploadFile = async (file, folder, i18n) => {
  try {
    // Auto-detect file type from mimetype
    const { type, isValid } = determineFileType(file.mimetype);

    if (!isValid) {
      throw new Error(
        i18n.__("media.upload.invalidType", {
          types:
            "images (JPEG, PNG, GIF, WEBP) or videos (MP4, WEBM, AVI, MOV)",
        }),
      );
    }

    // Generate unique file key
    const fileExtension = PATH.extname(file.originalname);
    const fileName = `${UUID()}${fileExtension}`;
    const key = `${folder}/${fileName}`;

    let result;

    if (type === "image") {
      result = await uploadFileToS3(key, file.buffer, file.mimetype);
    } else if (type === "video") {
      result = await uploadFileMultipart(key, file.path, file.mimetype);

      // Clean up temporary file after upload
      if (FS.existsSync(file.path)) {
        FS.unlinkSync(file.path);
      }
    }

    // Generate signed URL for immediate access
    const signedUrl = await generateSignedUrl(key, SIGNED_URL_EXPIRY.TWO_HOURS);
    const urlExpiresAt = new Date(
      Date.now() + SIGNED_URL_EXPIRY.TWO_HOURS * 1000,
    ).toISOString();

    return {
      success: true,
      message: i18n.__("media.upload.success"),
      data: {
        // S3 Storage Info
        key: result.key,
        url: signedUrl,
        urlExpiresAt: urlExpiresAt,

        // Database Ready Fields
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        mediaType: type,
        folder: folder,

        // Additional Metadata
        uploadedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    // Clean up temporary file on error
    if (file.path && FS.existsSync(file.path)) {
      FS.unlinkSync(file.path);
    }
    throw error;
  }
};

/**
 * Service: Upload multiple files in bulk
 * Uses direct upload for all files
 */
const uploadBulkFiles = async (files, folder, i18n) => {
  const uploadResults = [];
  const errors = [];

  for (const file of files) {
    try {
      // Auto-detect file type
      const { type } = determineFileType(file.mimetype);

      // Generate unique file key
      const fileExtension = PATH.extname(file.originalname);
      const fileName = `${UUID()}${fileExtension}`;
      const key = `${folder}/${fileName}`;

      // Upload file directly
      const result = await uploadFileToS3(key, file.buffer, file.mimetype);

      // Generate signed URL
      const signedUrl = await generateSignedUrl(
        key,
        SIGNED_URL_EXPIRY.TWO_HOURS,
      );
      const urlExpiresAt = new Date(
        Date.now() + SIGNED_URL_EXPIRY.TWO_HOURS * 1000,
      ).toISOString();

      uploadResults.push({
        // S3 Storage Info
        key: result.key,
        url: signedUrl,
        urlExpiresAt: urlExpiresAt,

        // Database Ready Fields
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        mediaType: type,
        folder: folder,

        // Additional Metadata
        uploadedAt: new Date().toISOString(),
      });
    } catch (error) {
      errors.push({
        fileName: file.originalname,
        error: error.message,
      });
    }
  }

  const successCount = uploadResults.length;
  const failedCount = errors.length;

  if (successCount === 0) {
    throw new Error(i18n.__("media.bulkUpload.error"));
  }

  return {
    success: true,
    message:
      failedCount > 0
        ? i18n.__("media.bulkUpload.partialSuccess", {
            success: successCount,
            failed: failedCount,
          })
        : i18n.__("media.bulkUpload.success", { count: successCount }),
    data: {
      uploaded: uploadResults,
      failed: errors,
      summary: {
        total: files.length,
        success: successCount,
        failed: failedCount,
      },
    },
  };
};

/**
 * Service: Delete file from storage
 */
const deleteFile = async (key, i18n) => {
  try {
    await deleteFileFromS3(key);

    return {
      success: true,
      message: i18n.__("media.delete.success"),
      data: { key },
    };
  } catch (error) {
    if (error.message.includes("not found")) {
      throw new Error(i18n.__("media.delete.notFound"));
    }
    throw error;
  }
};

/**
 * Service: Get file stream for download
 */
const downloadFile = async (key, i18n) => {
  try {
    const result = await getFileFromS3(key);

    return {
      success: true,
      stream: result.stream,
      contentType: result.contentType,
      contentLength: result.contentLength,
      fileName: PATH.basename(key),
    };
  } catch (error) {
    if (error.message.includes("not found")) {
      throw new Error(i18n.__("media.download.notFound"));
    }
    throw error;
  }
};

module.exports = {
  uploadFile,
  uploadBulkFiles,
  deleteFile,
  downloadFile,
};

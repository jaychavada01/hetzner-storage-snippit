const fs = require("fs");
const path = require("path");

const Media = require("../models/Media");
const s3Utils = require("../utils/s3Utils");
const {
  HTTP_STATUS_CODE,
  FILE_CONSTANTS,
  SIGNED_URL_EXPIRY,
} = require("../../config/constants");
const envConfig = require("../../config/envConfig");
const { UUID } = require("../../config/packages");

module.exports = {
  /**
   * @name uploadFile
   * @file StorageController.js
   * @param {Request} req
   * @param {Response} res
   * @throwsF
   * @description This method used to upload file to s3 and create media record in db
   */
  uploadFile: async (req, res) => {
    try {
      const file = req.file;
      const folder = (req.body.folder || "image").toString().toLowerCase();

      if (!file) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: "FILE_MISSING",
        });
      }

      // Allowed folders from FILE_CONSTANTS.TYPES
      const allowedFolders = FILE_CONSTANTS.ALLOWED_FOLDERS.map((f) =>
        f.toLowerCase(),
      );

      if (!allowedFolders.includes(folder)) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: "INVALID_FOLDER",
        });
      }

      // File size validation
      if (file.size > FILE_CONSTANTS.MAX_SIZE) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: "file_size_exceeded",
        });
      }

      // Allowed content types
      const allowedTypes = [
        ...FILE_CONSTANTS.TYPES.IMAGE.CONTENT_TYPES,
        ...FILE_CONSTANTS.TYPES.VIDEO.CONTENT_TYPES,
      ];

      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: "INVALID_FILE_TYPE",
        });
      }

      // Detect media type
      let mediaType = "OTHER";
      for (const [typeKey, cfg] of Object.entries(FILE_CONSTANTS.TYPES)) {
        if (
          Array.isArray(cfg.CONTENT_TYPES) &&
          cfg.CONTENT_TYPES.includes(file.mimetype)
        ) {
          mediaType = typeKey;
          break;
        }
      }

      const mediaId = UUID();
      const fileExt = path.extname(file.originalname);

      // generate dynamic based on media type and folder
      const key = `${folder}/${mediaType.toLowerCase()}/${mediaId}${fileExt}`;

      // Upload to S3
      await s3Utils
        .upload({
          Bucket: envConfig.STORAGE.BUCKET,
          Key: key,
          Body: fs.createReadStream(file.path),
          ContentType: file.mimetype,
        })
        .promise();

      // DB record
      const media = await Media.create({
        url: key,
        filePath: key,
        fileName: path.basename(key),
        originalName: file.originalname,
        size: file.size,
        contentType: file.mimetype,
        mediaType,
      });

      // Generate signed URL for immediate access
      const signedUrl = s3Utils.getSignedUrl("getObject", {
        Bucket: envConfig.STORAGE.BUCKET,
        Key: key,
        Expires: SIGNED_URL_EXPIRY.TWO_HOURS,
        ResponseContentDisposition: "inline",
      });

      const response = {
        id: media.id,
        filePath: media.filePath,
        signedUrl,
        expiresIn: "2 hours",
        contentType: media.contentType,
        mediaType: media.mediaType,
        folder,
      };

      return res.status(HTTP_STATUS_CODE.CREATED).json({
        status: HTTP_STATUS_CODE.CREATED,
        message: "File uploaded successfully",
        data: response,
      });
    } catch (error) {
      console.error("Upload error:", error);
      return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.SERVER_ERROR,
        message: "UPLOAD_FAILED",
        error: error.message,
      });
    }
  },

  /**
   * @name uploadMultipleFiles
   * @file StorageController.js
   * @param {Request} req
   * @param {Response} res
   * @throwsF
   * @description This method used to upload multiple files to s3 and create media records in db
   */
  uploadMultipleFiles: async (req, res) => {
    try {
      const files = Array.isArray(req.files) ? req.files : [];
      const folder = (req.body.folder || "image").toString().toLowerCase();

      if (!files.length) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: "FILES_MISSING",
        });
      }

      const allowedFolders = FILE_CONSTANTS.ALLOWED_FOLDERS.map((f) =>
        f.toLowerCase(),
      );
      if (!allowedFolders.includes(folder)) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: "INVALID_FOLDER",
        });
      }

      const allowedTypes = [
        ...FILE_CONSTANTS.TYPES.IMAGE.CONTENT_TYPES,
        ...FILE_CONSTANTS.TYPES.VIDEO.CONTENT_TYPES,
      ];

      const results = [];
      const failed = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
          if (file.size > FILE_CONSTANTS.MAX_SIZE) {
            throw new Error("STO002");
          }

          if (!allowedTypes.includes(file.mimetype)) {
            throw new Error("STO003");
          }

          let mediaType = "OTHER";
          for (const [typeKey, cfg] of Object.entries(FILE_CONSTANTS.TYPES)) {
            if (
              Array.isArray(cfg.CONTENT_TYPES) &&
              cfg.CONTENT_TYPES.includes(file.mimetype)
            ) {
              mediaType = typeKey;
              break;
            }
          }

          const mediaId = UUID();
          const fileExt = path.extname(file.originalname);

          // generate dynamic based on media type and folder
          const key = `${folder}/${mediaType.toLowerCase()}/${mediaId}${fileExt}`;

          // Upload to S3
          await s3Utils
            .upload({
              Bucket: envConfig.STORAGE.BUCKET,
              Key: key,
              Body: fs.createReadStream(file.path),
              ContentType: file.mimetype,
            })
            .promise();

          // DB record
          const media = await Media.create({
            url: key,
            filePath: key,
            fileName: path.basename(key),
            originalName: file.originalname,
            size: file.size,
            contentType: file.mimetype,
            mediaType,
          });

          // Generate signed URL for immediate access
          const signedUrl = s3Utils.getSignedUrl("getObject", {
            Bucket: envConfig.STORAGE.BUCKET,
            Key: key,
            Expires: SIGNED_URL_EXPIRY.TWO_HOURS,
            ResponseContentDisposition: "inline",
          });

          results.push({
            id: media.id,
            filePath: media.filePath,
            signedUrl,
            expiresIn: "2 hours",
            contentType: media.contentType,
            mediaType: media.mediaType,
          });
        } catch (err) {
          failed.push({
            index: i,
            fileName: file.originalname,
            error: err.message,
          });
        }
      }

      const response = {
        folder,
        successCount: results.length,
        failureCount: failed.length,
        items: results,
        failed,
      };

      return res.status(HTTP_STATUS_CODE.CREATED).json({
        status: HTTP_STATUS_CODE.CREATED,
        data: response,
      });
    } catch (error) {
      console.error("Bulk upload error:", error);
      return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.SERVER_ERROR,
        message: "UPLOAD_FAILED",
        error: error.message,
      });
    }
  },

  /**
   * @name generateSignedUrl
   * @file StorageController.js
   * @param {Request} req
   * @param {Response} res
   * @throwsF
   * @description This method used to generate signed URL for a media item
   */
  generateSignedUrl: async (req, res) => {
    try {
      const { mediaId } = req.body;

      if (!mediaId) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: "MEDIA_ID_REQUIRED",
        });
      }

      const media = await Media.findOne({
        where: { id: mediaId, is_deleted: false },
      });

      if (!media) {
        return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
          status: HTTP_STATUS_CODE.NOT_FOUND,
          message: "MEDIA_NOT_FOUND",
        });
      }

      const signedUrl = s3Utils.getSignedUrl("getObject", {
        Bucket: envConfig.STORAGE.BUCKET,
        Key: media.privateFilePath,
        Expires: SIGNED_URL_EXPIRY.TWO_HOURS, // 2 hours
      });

      return res.json({
        status: HTTP_STATUS_CODE.OK,
        data: { signedUrl },
      });
    } catch (error) {
      console.error("Signed URL error:", error);
      return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.SERVER_ERROR,
        error: error.message,
      });
    }
  },

  /**
   * @name downloadFile
   * @file StorageController.js
   * @param {Request} req
   * @param {Response} res
   * @throwsF
   * @description This method used to download the file from media id
   */
  downloadFile: async (req, res) => {
    try {
      const { mediaId } = req.query;

      if (!mediaId) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: "MEDIA_ID_REQUIRED",
        });
      }

      const media = await Media.findOne({
        where: { id: mediaId, is_deleted: false },
      });
      if (!media) {
        return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
          status: HTTP_STATUS_CODE.NOT_FOUND,
          message: "MEDIA_NOT_FOUND",
        });
      }

      res.setHeader("Content-Type", media.contentType);

      s3Utils
        .getObject({
          Bucket: envConfig.STORAGE.BUCKET,
          Key: media.filePath,
        })
        .createReadStream()
        .pipe(res);
    } catch (error) {
      console.error("Download error:", error);
      return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.SERVER_ERROR,
        error: error.message,
      });
    }
  },

  /**
   * @name deleteFile
   * @file StorageController.js
   * @param {Request} req
   * @param {Response} res
   * @throwsF
   * @description This method used to delete the file from media id
   */
  deleteFile: async (req, res) => {
    try {
      const { mediaId } = req.query;

      if (!mediaId) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: "MEDIA_ID_REQUIRED",
        });
      }

      const media = await Media.findOne({
        where: { id: mediaId, is_deleted: false },
      });
      if (!media) {
        return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
          status: HTTP_STATUS_CODE.NOT_FOUND,
          message: "MEDIA_NOT_FOUND",
        });
      }

      if (!media.filePath || typeof media.filePath !== "string") {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: "INVALID_FILE_PATH",
        });
      }

      await s3Utils
        .deleteObject({
          Bucket: envConfig.STORAGE.BUCKET,
          Key: media.filePath,
        })
        .promise();

      await media.update({ is_deleted: true });

      return res.json({
        status: HTTP_STATUS_CODE.OK,
        message: "FILE_DELETED",
      });
    } catch (error) {
      console.error("Delete error:", error);
      return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.SERVER_ERROR,
        error: error.message,
      });
    }
  },
};

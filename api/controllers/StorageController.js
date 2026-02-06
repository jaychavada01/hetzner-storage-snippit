const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");
const AWS = require("aws-sdk");

const Media = require("../models/Media");

// ============================================
// S3 (Hetzner) Setup
// ============================================
const s3Private = new AWS.S3({
  endpoint: process.env.HETZNER_ENDPOINT,
  region: "us-east-1",
  accessKeyId: process.env.HETZNER_ACCESS_KEY,
  secretAccessKey: process.env.HETZNER_SECRET_KEY,
  s3ForcePathStyle: true,
  signatureVersion: "v4",
});

const s3Public = new AWS.S3({
  endpoint: process.env.HETZNER_ENDPOINT,
  region: "us-east-1",
  accessKeyId: process.env.HETZNER_ACCESS_KEY,
  secretAccessKey: process.env.HETZNER_SECRET_KEY,
  s3ForcePathStyle: true,
  signatureVersion: "v4",
});

module.exports = {
  // ============================================
  // Upload file
  // ============================================
  uploadFile: async (req, res) => {
    try {
      const file = req.file;
      const context = (req.body.context || "private").toLowerCase(); // private | feed

      if (!file) {
        return res.status(400).json({
          success: false,
          message: "FILE_MISSING",
        });
      }

      const mediaId = uuid();
      const fileExt = path.extname(file.originalname);
      const key = `uploads/${mediaId}${fileExt}`;

      // Upload to PRIVATE bucket
      await s3Private
        .upload({
          Bucket: process.env.HETZNER_PRIVATE_BUCKET,
          Key: key,
          Body: fs.createReadStream(file.path),
          ContentType: file.mimetype,
        })
        .promise();

      // Save DB record
      const media = await Media.create({
        privateFilePath: key,
        privateUrl: key,
        contentType: file.mimetype,
        mediaType: file.mimetype.startsWith("image") ? "IMAGE" : "VIDEO",
        visibility: "PRIVATE",
      });

      // ============================================
      // FEED CONTEXT → Promote to PUBLIC
      // ============================================
      if (context === "feed") {
        const publicKey = `feed/${key}`;

        await s3Public
          .copyObject({
            Bucket: process.env.HETZNER_PUBLIC_BUCKET,
            CopySource: `${process.env.HETZNER_PRIVATE_BUCKET}/${key}`,
            Key: publicKey,
            ACL: "public-read",
            ContentType: file.mimetype,
          })
          .promise();

        await media.update({
          publicUrl: `${process.env.HETZNER_PUBLIC_BASE_URL}/${publicKey}`,
          visibility: "PUBLIC",
        });
      }

      return res.status(201).json({
        success: true,
        data: {
          id: media.id,
          publicUrl: media.publicUrl || null,
          visibility: media.visibility,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "UPLOAD_FAILED",
        error: error.message,
      });
    }
  },

  // ============================================
  // Generate signed URL (PRIVATE ONLY)
  // ============================================
  generateSignedUrl: async (req, res) => {
    try {
      const { mediaId } = req.body;

      const media = await Media.findByPk(mediaId);
      if (!media) {
        return res.status(404).json({
          success: false,
          message: "MEDIA_NOT_FOUND",
        });
      }

      const signedUrl = s3Private.getSignedUrl("getObject", {
        Bucket: process.env.HETZNER_PRIVATE_BUCKET,
        Key: media.privateFilePath,
        Expires: 60 * 60 * 2, // 2 hours
      });

      return res.json({
        success: true,
        data: {
          signedUrl,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  // ============================================
  // Download file
  // ============================================
  downloadFile: async (req, res) => {
    try {
      const { mediaId } = req.query;

      const media = await Media.findByPk(mediaId);
      if (!media) {
        return res.status(404).json({
          success: false,
          message: "MEDIA_NOT_FOUND",
        });
      }

      const stream = s3Private
        .getObject({
          Bucket: process.env.HETZNER_PRIVATE_BUCKET,
          Key: media.privateFilePath,
        })
        .createReadStream();

      res.setHeader("Content-Type", media.contentType);
      stream.pipe(res);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  // ============================================
  // Delete file (soft delete)
  // ============================================
  deleteFile: async (req, res) => {
    try {
      const { mediaId } = req.params;

      const media = await Media.findByPk(mediaId);
      if (!media) {
        return res.status(404).json({
          success: false,
          message: "MEDIA_NOT_FOUND",
        });
      }

      await s3Private
        .deleteObject({
          Bucket: process.env.HETZNER_PRIVATE_BUCKET,
          Key: media.privateFilePath,
        })
        .promise();

      await media.update({
        is_deleted: true,
      });

      return res.json({
        success: true,
        message: "FILE_DELETED",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};

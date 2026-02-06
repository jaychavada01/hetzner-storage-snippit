const express = require("express");
const multer = require("multer");

const StorageController = require("../controllers/storage.controller");

const router = express.Router();

// Multer config
const upload = multer({
  dest: "/tmp/uploads",
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB
  },
});

// Upload single file
router.post("/upload", upload.single("file"), StorageController.uploadFile);

// Generate signed URL
router.post("/generate-signed-url", StorageController.generateSignedUrl);

// Download file
router.get("/download", StorageController.downloadFile);

// Delete file
router.delete("/:mediaId", StorageController.deleteFile);

module.exports = router;

const express = require("express");
const multer = require("multer");
const StorageController = require("../controllers/StorageController");

const storageRouter = express.Router();

// Multer config
const upload = multer({
  dest: "/tmp/uploads",
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB
  },
});

// Upload single file
storageRouter.post(
  "/upload",
  upload.single("file"),
  StorageController.uploadFile,
);

storageRouter.post(
  "/upload/multiple",
  upload.array("files", 20), // max 20 files
  StorageController.uploadMultipleFiles,
);

// Generate signed URL
storageRouter.post("/generate-signed-url", StorageController.generateSignedUrl);

// Download file
storageRouter.get("/download", StorageController.downloadFile);

// Delete file
storageRouter.delete("/delete", StorageController.deleteFile);

module.exports = storageRouter;

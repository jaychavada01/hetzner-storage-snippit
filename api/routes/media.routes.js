const { EXPRESS } = require("../../config/packages");
const {
  upload,
  uploadBulk,
  deleteMedia,
  download,
} = require("../controllers/media.controller");
const {
  uploadSingleSmart,
  uploadBulk: uploadBulkMiddleware,
} = require("../middlewares/multer.middleware");

const router = EXPRESS.Router();

/**
 * @route   POST /api/media/upload
 * @desc    Upload single file (auto-detects image or video)
 * @body    folder (required)
 * @access  Public
 */
router.post("/upload", uploadSingleSmart, upload);

/**
 * @route   POST /api/media/upload-bulk
 * @desc    Upload multiple files (max 20)
 * @access  Public
 */
router.post("/upload-bulk", uploadBulkMiddleware, uploadBulk);

/**
 * @route   DELETE /api/media/delete
 * @desc    Delete file from storage
 * @access  Public
 */
router.delete("/delete", deleteMedia);

/**
 * @route   GET /api/media/download
 * @desc    Download file from storage
 * @access  Public
 */
router.get("/download", download);

module.exports = router;

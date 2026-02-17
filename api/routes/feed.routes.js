const { EXPRESS } = require("../../config/packages");
const {
  getFeedController,
  getPostController,
  getUserGalleryController,
} = require("../controllers/feed.controller");

const router = EXPRESS.Router();

/**
 * @route   GET /api/feed
 * @desc    Get paginated feed (Instagram-like infinite scroll)
 * @query   page (default: 1), limit (default: 10, max: 50)
 * @access  Public
 */
router.get("/", getFeedController);

/**
 * @route   GET /api/feed/post/:postId
 * @desc    Get single post by ID with signed URL
 * @access  Public
 */
router.get("/post/:postId", getPostController);

/**
 * @route   GET /api/feed/user/:userId
 * @desc    Get user's media gallery with pagination
 * @query   page (default: 1), limit (default: 20, max: 50)
 * @access  Public
 */
router.get("/user/:userId", getUserGalleryController);

module.exports = router;

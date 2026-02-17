const { HTTP_STATUS_CODE } = require("../../config/constants");
const { successResponse, errorResponse } = require("../utils/response.util");
const { JOI } = require("../../config/packages");
const {
  getFeed,
  getPostById,
  getUserGallery,
} = require("../services/feed.service");

/**
 * Validation schema for feed pagination
 */
const feedPaginationSchema = JOI.object({
  page: JOI.number().integer().min(1).default(1),
  limit: JOI.number().integer().min(1).max(50).default(10),
  userId: JOI.number().integer().optional(),
});

/**
 * Validation schema for post ID
 */
const postIdSchema = JOI.object({
  postId: JOI.number().integer().required(),
});

/**
 * Controller: Get feed with pagination (Instagram-like)
 * GET /api/feed?page=1&limit=10
 */
const getFeedController = async (req, res) => {
  try {
    // Set locale from accept-language header
    const locale =
      req.headers["accept-language"]?.split(",")[0]?.split("-")[0] || "en";
    req.setLocale(locale);

    // Validate query parameters
    const { error, value } = feedPaginationSchema.validate(req.query);
    if (error) {
      return errorResponse(
        res,
        req.__("media.validation.invalidRequest"),
        HTTP_STATUS_CODE.BAD_REQUEST,
        { details: error.details[0].message },
      );
    }

    const { page, limit, userId } = value;

    // Call service layer
    const result = await getFeed(page, limit, userId, req);

    return successResponse(res, result.message, result.data);
  } catch (error) {
    return errorResponse(
      res,
      error.message || req.__("feed.error"),
      HTTP_STATUS_CODE.SERVER_ERROR,
    );
  }
};

/**
 * Controller: Get single post by ID
 * GET /api/feed/:postId
 */
const getPostController = async (req, res) => {
  try {
    // Set locale from accept-language header
    const locale =
      req.headers["accept-language"]?.split(",")[0]?.split("-")[0] || "en";
    req.setLocale(locale);

    // Validate post ID
    const { error, value } = postIdSchema.validate({
      postId: parseInt(req.params.postId),
    });
    if (error) {
      return errorResponse(
        res,
        req.__("media.validation.invalidRequest"),
        HTTP_STATUS_CODE.BAD_REQUEST,
        { details: error.details[0].message },
      );
    }

    const { postId } = value;

    // Call service layer
    const result = await getPostById(postId, req);

    return successResponse(res, result.message, result.data);
  } catch (error) {
    return errorResponse(
      res,
      error.message || req.__("feed.error"),
      HTTP_STATUS_CODE.SERVER_ERROR,
    );
  }
};

/**
 * Controller: Get user's gallery/media
 * GET /api/feed/user/:userId?page=1&limit=20
 */
const getUserGalleryController = async (req, res) => {
  try {
    // Set locale from accept-language header
    const locale =
      req.headers["accept-language"]?.split(",")[0]?.split("-")[0] || "en";
    req.setLocale(locale);

    const userId = parseInt(req.params.userId);

    // Validate pagination
    const { error, value } = feedPaginationSchema.validate({
      ...req.query,
      userId,
    });

    if (error) {
      return errorResponse(
        res,
        req.__("media.validation.invalidRequest"),
        HTTP_STATUS_CODE.BAD_REQUEST,
        { details: error.details[0].message },
      );
    }

    const { page, limit } = value;

    // Call service layer
    const result = await getUserGallery(userId, page, limit, req);

    return successResponse(res, result.message, result.data);
  } catch (error) {
    return errorResponse(
      res,
      error.message || req.__("feed.error"),
      HTTP_STATUS_CODE.SERVER_ERROR,
    );
  }
};

module.exports = {
  getFeedController,
  getPostController,
  getUserGalleryController,
};

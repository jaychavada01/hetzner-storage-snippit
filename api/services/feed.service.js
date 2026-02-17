const {
  generateSignedUrl,
  generateBulkSignedUrls,
} = require("../helpers/s3.helper");
const { SIGNED_URL_EXPIRY } = require("../../config/constants");

/**
 * Service: Get feed with pagination (Instagram-like infinite scroll)
 * This assumes you have a database table storing post/media metadata
 *
 * @param {Number} page - Page number (for pagination)
 * @param {Number} limit - Number of items per page
 * @param {String} userId - Optional: Filter by user
 * @param {Object} i18n - i18n instance for translations
 * @returns {Promise<Object>} Feed data with signed URLs
 */
const getFeed = async (page = 1, limit = 10, userId = null, i18n) => {
  try {
    // TODO: Replace this with your actual database query
    // Example using Sequelize (you'll need to create a Post/Media model)
    /*
    const { Post } = require("../models");
    
    const offset = (page - 1) * limit;
    const whereClause = userId ? { userId } : {};
    
    const posts = await Post.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "DESC"]], // Latest first
      include: [
        { model: User, attributes: ["id", "username", "profilePicture"] }
      ]
    });
    */

    // MOCK DATA - Replace with actual database query
    const mockPosts = [
      {
        id: 1,
        userId: 101,
        username: "john_doe",
        caption: "Beautiful sunset 🌅",
        mediaType: "image",
        mediaKey: "images/sunset-123.jpg",
        likesCount: 245,
        commentsCount: 12,
        createdAt: "2026-02-17T10:30:00Z",
      },
      {
        id: 2,
        userId: 102,
        username: "jane_smith",
        caption: "My travel vlog 🎥",
        mediaType: "video",
        mediaKey: "videos/travel-456.mp4",
        thumbnailKey: "thumbnails/travel-456.jpg", // Optional thumbnail
        likesCount: 532,
        commentsCount: 45,
        createdAt: "2026-02-17T09:15:00Z",
      },
      {
        id: 3,
        userId: 103,
        username: "photographer_pro",
        caption: "Nature photography 📸",
        mediaType: "image",
        mediaKey: "images/nature-789.jpg",
        likesCount: 1024,
        commentsCount: 87,
        createdAt: "2026-02-17T08:00:00Z",
      },
    ];

    // Simulate pagination
    const offset = (page - 1) * limit;
    const paginatedPosts = mockPosts.slice(offset, offset + limit);
    const totalPosts = mockPosts.length;

    // Generate signed URLs for all media files
    const postsWithUrls = await Promise.all(
      paginatedPosts.map(async (post) => {
        try {
          // Generate signed URL for main media
          const mediaUrl = await generateSignedUrl(
            post.mediaKey,
            SIGNED_URL_EXPIRY.TWO_HOURS,
          );

          // Generate signed URL for thumbnail if exists (for videos)
          let thumbnailUrl = null;
          if (post.thumbnailKey) {
            thumbnailUrl = await generateSignedUrl(
              post.thumbnailKey,
              SIGNED_URL_EXPIRY.TWO_HOURS,
            );
          }

          return {
            ...post,
            mediaUrl, // Temporary signed URL (valid for 2 hours)
            thumbnailUrl, // Thumbnail URL for videos
            // Remove the raw keys from response for security
            mediaKey: undefined,
            thumbnailKey: undefined,
          };
        } catch (error) {
          // If URL generation fails, return post without URL
          return {
            ...post,
            mediaUrl: null,
            thumbnailUrl: null,
            error: "Failed to generate media URL",
          };
        }
      }),
    );

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalPosts / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      success: true,
      message: i18n.__("feed.success"),
      data: {
        posts: postsWithUrls,
        pagination: {
          currentPage: page,
          totalPages,
          totalPosts,
          postsPerPage: limit,
          hasNextPage,
          hasPreviousPage,
          nextPage: hasNextPage ? page + 1 : null,
          previousPage: hasPreviousPage ? page - 1 : null,
        },
      },
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Service: Get single post with signed URL
 * @param {Number} postId - Post ID
 * @param {Object} i18n - i18n instance
 * @returns {Promise<Object>} Post data with signed URL
 */
const getPostById = async (postId, i18n) => {
  try {
    // TODO: Replace with actual database query
    // const post = await Post.findByPk(postId);

    // MOCK DATA
    const mockPost = {
      id: postId,
      userId: 101,
      username: "john_doe",
      caption: "Beautiful sunset 🌅",
      mediaType: "image",
      mediaKey: "images/sunset-123.jpg",
      likesCount: 245,
      commentsCount: 12,
      createdAt: "2026-02-17T10:30:00Z",
    };

    if (!mockPost) {
      throw new Error(i18n.__("feed.postNotFound"));
    }

    // Generate signed URL
    const mediaUrl = await generateSignedUrl(
      mockPost.mediaKey,
      SIGNED_URL_EXPIRY.TWO_HOURS,
    );

    return {
      success: true,
      message: i18n.__("feed.postRetrieved"),
      data: {
        ...mockPost,
        mediaUrl,
        mediaKey: undefined, // Remove raw key
      },
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Service: Get user's media gallery with signed URLs
 * @param {Number} userId - User ID
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @param {Object} i18n - i18n instance
 * @returns {Promise<Object>} User's media with signed URLs
 */
const getUserGallery = async (userId, page = 1, limit = 20, i18n) => {
  try {
    // This is similar to getFeed but filtered by userId
    return await getFeed(page, limit, userId, i18n);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getFeed,
  getPostById,
  getUserGallery,
};

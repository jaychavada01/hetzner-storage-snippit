const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  FS,
} = require("../../config/packages");
const { MEDIA_CONSTANTS } = require("../../config/constants");
const envConfig = require("../../config/envConfig");

// Initialize S3 Client for Hetzner Object Storage
const s3Client = new S3Client({
  region: envConfig.STORAGE.REGION,
  endpoint: envConfig.STORAGE.ENDPOINT,
  credentials: {
    accessKeyId: envConfig.STORAGE.ACCESS_KEY,
    secretAccessKey: envConfig.STORAGE.SECRET_KEY,
  },
  forcePathStyle: true, // Required for S3-compatible services
});

/**
 * Upload file directly to S3 using PutObjectCommand
 * @param {String} key - S3 object key
 * @param {Buffer} fileBuffer - File buffer
 * @param {String} contentType - File MIME type
 * @returns {Promise<Object>} Upload result
 */
const uploadFileToS3 = async (key, fileBuffer, contentType) => {
  try {
    const command = new PutObjectCommand({
      Bucket: envConfig.STORAGE.BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    const result = await s3Client.send(command);
    return { success: true, key, etag: result.ETag };
  } catch (error) {
    throw new Error(`S3 upload failed: ${error.message}`);
  }
};

/**
 * Upload large file using multipart upload
 * @param {String} key - S3 object key
 * @param {String} filePath - Local file path
 * @param {String} contentType - File MIME type
 * @returns {Promise<Object>} Upload result
 */
const uploadFileMultipart = async (key, filePath, contentType) => {
  let uploadId;

  try {
    // Step 1: Initiate multipart upload
    const createCommand = new CreateMultipartUploadCommand({
      Bucket: envConfig.STORAGE.BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const { UploadId } = await s3Client.send(createCommand);
    uploadId = UploadId;

    // Step 2: Read file and split into chunks
    const fileBuffer = FS.readFileSync(filePath);
    const chunkSize = MEDIA_CONSTANTS.MULTIPART_CHUNK_SIZE;
    const parts = [];
    let partNumber = 1;

    for (let start = 0; start < fileBuffer.length; start += chunkSize) {
      const end = Math.min(start + chunkSize, fileBuffer.length);
      const chunk = fileBuffer.slice(start, end);

      // Step 3: Upload each part
      const uploadPartCommand = new UploadPartCommand({
        Bucket: envConfig.STORAGE.BUCKET,
        Key: key,
        UploadId: uploadId,
        PartNumber: partNumber,
        Body: chunk,
      });

      const partResult = await s3Client.send(uploadPartCommand);

      parts.push({
        PartNumber: partNumber,
        ETag: partResult.ETag,
      });

      partNumber++;
    }

    // Step 4: Complete multipart upload
    const completeCommand = new CompleteMultipartUploadCommand({
      Bucket: envConfig.STORAGE.BUCKET,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts },
    });

    const result = await s3Client.send(completeCommand);

    return { success: true, key, location: result.Location };
  } catch (error) {
    // Abort multipart upload on error
    if (uploadId) {
      try {
        const abortCommand = new AbortMultipartUploadCommand({
          Bucket: envConfig.STORAGE.BUCKET,
          Key: key,
          UploadId: uploadId,
        });
        await s3Client.send(abortCommand);
      } catch (abortError) {
        // Silent abort error
      }
    }
    throw new Error(`Multipart upload failed: ${error.message}`);
  }
};

/**
 * Delete file from S3
 * @param {String} key - S3 object key
 * @returns {Promise<Object>} Delete result
 */
const deleteFileFromS3 = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: envConfig.STORAGE.BUCKET,
      Key: key,
    });

    await s3Client.send(command);
    return { success: true, key };
  } catch (error) {
    throw new Error(`S3 delete failed: ${error.message}`);
  }
};

/**
 * Get file stream from S3
 * @param {String} key - S3 object key
 * @returns {Promise<Object>} File stream and metadata
 */
const getFileFromS3 = async (key) => {
  try {
    const command = new GetObjectCommand({
      Bucket: envConfig.STORAGE.BUCKET,
      Key: key,
    });

    const result = await s3Client.send(command);
    return {
      success: true,
      stream: result.Body,
      contentType: result.ContentType,
      contentLength: result.ContentLength,
    };
  } catch (error) {
    if (error.name === "NoSuchKey") {
      throw new Error("File not found");
    }
    throw new Error(`S3 get failed: ${error.message}`);
  }
};

/**
 * Generate a pre-signed URL for private bucket access
 * @param {String} key - S3 object key
 * @param {Number} expiresIn - URL expiration time in seconds (default: 7200 = 2 hours)
 * @returns {Promise<String>} Pre-signed URL
 */
const generateSignedUrl = async (key, expiresIn = 7200) => {
  try {
    const { getSignedUrl } = require("../../config/packages");

    const command = new GetObjectCommand({
      Bucket: envConfig.STORAGE.BUCKET,
      Key: key,
    });

    // Generate signed URL with expiration
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
};

/**
 * Generate signed URLs for multiple files (for feed/gallery)
 * @param {Array<String>} keys - Array of S3 object keys
 * @param {Number} expiresIn - URL expiration time in seconds (default: 7200 = 2 hours)
 * @returns {Promise<Array<Object>>} Array of objects with key and signedUrl
 */
const generateBulkSignedUrls = async (keys, expiresIn = 7200) => {
  try {
    const signedUrls = await Promise.all(
      keys.map(async (key) => {
        try {
          const signedUrl = await generateSignedUrl(key, expiresIn);
          return { key, signedUrl, success: true };
        } catch (error) {
          return { key, signedUrl: null, success: false, error: error.message };
        }
      }),
    );
    return signedUrls;
  } catch (error) {
    throw new Error(`Failed to generate bulk signed URLs: ${error.message}`);
  }
};

module.exports = {
  uploadFileToS3,
  uploadFileMultipart,
  deleteFileFromS3,
  getFileFromS3,
  generateSignedUrl,
  generateBulkSignedUrls,
};

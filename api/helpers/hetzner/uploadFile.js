const {
  HETZNER_STORAGE,
  FILE_CONSTANTS,
} = require("../../../config/constants");

const AWS = require("aws-sdk");
const SHARP = require("sharp");
const UUID = require("uuid").v4;

const { promisify } = require("util");
const { readFile, unlink } = require("fs");
const {
  getContentTypeByExtension,
  isThumbnailEligible,
} = require("../../../../utils/fileUtils");

const readFileAsync = promisify(readFile);
const unlinkAsync = promisify(unlink);

// S3 CLIENT - PRIVATE BUCKET
const s3 = new AWS.S3({
  endpoint: HETZNER_STORAGE.ENDPOINT,
  region: HETZNER_STORAGE.REGION,
  accessKeyId: HETZNER_STORAGE.ACCESS_KEY,
  secretAccessKey: HETZNER_STORAGE.SECRET_KEY,
  s3ForcePathStyle: true,
  signatureVersion: "v4",
});

/**
 * Upload file to private bucket with optional thumbnail generation
 */
const uploadFile = async ({
  sourceFilePath,
  destinationFilePath,
  fileName,
  generateThumbnail = false,
}) => {
  try {
    // Read file from temporary location
    const fileContent = await readFileAsync(sourceFilePath);

    // Generate unique filename
    const fileExtension = fileName.split(".").pop();
    const uniqueFileName = `${UUID()}.${fileExtension}`;
    const key = `${destinationFilePath}${uniqueFileName}`;

    // Upload to private bucket
    const uploadParams = {
      Bucket: HETZNER_STORAGE.BUCKET,
      Key: key,
      Body: fileContent,
      ContentType: getContentTypeByExtension(fileExtension),
    };

    const uploadResult = await s3.upload(uploadParams).promise();

    // Generate thumbnail if requested and file is image
    let thumbnailData = null;
    const extLower = fileExtension.toLowerCase();
    const canGenerateThumb = isThumbnailEligible(extLower);

    if (generateThumbnail && canGenerateThumb) {
      try {
        // For SVG, rasterize at high density to preserve detail
        const sharpInput =
          extLower === "svg"
            ? SHARP(fileContent, {
                density: FILE_CONSTANTS.THUMBNAIL.SVG_RASTERIZE_DENSITY,
              })
            : SHARP(fileContent);

        // Resize and convert to WebP
        const thumbBuffer = await sharpInput
          .resize(
            FILE_CONSTANTS.THUMBNAIL.MAX_SIZE,
            FILE_CONSTANTS.THUMBNAIL.MAX_SIZE,
            {
              fit: "inside",
              withoutEnlargement: true,
            },
          )
          .toFormat(FILE_CONSTANTS.THUMBNAIL.FORMAT)
          .toBuffer();

        // Upload thumbnail to private bucket
        const thumbKey = `${destinationFilePath}${
          FILE_CONSTANTS.THUMBNAIL.THUMB_DIR
        }/${uniqueFileName.replace(/\.[^.]+$/, "")}.${
          FILE_CONSTANTS.THUMBNAIL.FORMAT
        }`;

        await s3
          .upload({
            Bucket: HETZNER_STORAGE.BUCKET,
            Key: thumbKey,
            Body: thumbBuffer,
            ContentType: FILE_CONSTANTS.THUMBNAIL.CONTENT_TYPE,
          })
          .promise();

        // Get thumbnail dimensions
        const metadata = await SHARP(thumbBuffer).metadata();

        // Construct thumbnail URL
        const endpoint = HETZNER_STORAGE.ENDPOINT.endsWith("/")
          ? HETZNER_STORAGE.ENDPOINT.slice(0, -1)
          : HETZNER_STORAGE.ENDPOINT;

        thumbnailData = {
          url: `${endpoint}/${HETZNER_STORAGE.BUCKET}/${thumbKey}`,
          key: thumbKey,
          fileName: thumbKey.split("/").pop(),
          width: metadata.width || null,
          height: metadata.height || null,
        };
      } catch (thumbErr) {
        console.error("Thumbnail generation failed:", thumbErr.message);
        // Continue without thumbnail - don't fail the upload
      }
    }

    // Clean up temporary file
    await unlinkAsync(sourceFilePath);

    return {
      isError: false,
      data: {
        url: uploadResult.Location,
        key: key,
        fileName: uniqueFileName,
        thumbnail: thumbnailData,
      },
    };
  } catch (err) {
    // Clean up temporary file on error
    try {
      await unlinkAsync(sourceFilePath);
    } catch (deleteError) {
      console.error("Failed to delete temporary file:", deleteError.message);
    }

    return {
      isError: true,
      data: err.message,
    };
  }
};

module.exports = uploadFile;

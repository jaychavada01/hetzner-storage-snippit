const AWS = require("aws-sdk");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const MOMENT = require("moment");
const EXPRESS = require("express");
const CORS = require("cors");
const FS = require("fs");
const JOI = require("joi");
const I18N = require("i18n");
const MULTER = require("multer");
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const UUID = () => uuidv4();

module.exports = {
  AWS,
  SHARP: sharp,
  UUID,
  MOMENT,
  EXPRESS,
  CORS,
  FS,
  JOI,
  I18N,
  MULTER,
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  getSignedUrl,
};

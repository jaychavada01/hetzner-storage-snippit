# 🚀 Hetzner Object Storage Service

A robust Node.js application for managing media uploads to Hetzner Object Storage (S3 compatible). This service handles file uploads, storage management, and secure access via signed URLs, featuring intelligent handling of large files and automated type detection.

## ✨ Key Features

- **☁️ S3 Compatible**: Built for Hetzner Object Storage using AWS SDK v3.
- **🧠 Smart File Detection**: Automatically detects file types (Image vs Video) from mimetype.
- **💾 Hybrid Storage Strategy**:
  - **Images**: Processed in-memory for fast direct uploads.
  - **Videos**: Streamed to disk temporarily for robust multipart uploads.
- **📦 Multipart Uploads**: Automatically splits large video files into 5MB chunks for reliable uploading.
- **🔐 Secure Access**: Returns pre-signed URLs (valid for 2 hours) for secure, private file access.
- **⚡ Bulk Operations**: Support for uploading multiple files simultaneously.
- **🌍 Internationalization**: Built-in support for multiple languages (English & Hindi).
- **🛡️ Validation**: Comprehensive request validation using Joi.

---

## 🏗️ Project Structure

The project follows a clean, modular architecture separating concerns for maintainability and scalability.

```
hetzner-storage-snippit/
├── 📁 api/                   # Core Application Logic
│   ├── 📁 controllers/       # Request handlers & validation
│   │   ├── feed.controller.js
│   │   └── media.controller.js
│   ├── 📁 helpers/           # External service integrations (S3)
│   │   └── s3.helper.js
│   ├── 📁 middlewares/       # Express middlewares
│   │   └── multer.middleware.js
│   ├── 📁 routes/            # API Route definitions
│   │   ├── feed.routes.js
│   │   └── media.routes.js
│   ├── 📁 services/          # Business logic & data processing
│   │   ├── feed.service.js
│   │   └── media.service.js
│   ├── 📁 utils/             # Shared utilities (Response, etc.)
│   └── 📁 validations/       # Joi validation schemas
├── 📁 config/                # Configuration & Constants
│   ├── constants.js          # App-wide constants
│   ├── envConfig.js          # Environment variable mapping
│   ├── packages.js           # Centralized dependency imports
│   └── i18n.js               # Localization setup
├── 📁 locales/               # Translation files (en.json, hi.json)
├── .env                      # Environment variables
└── app.js                    # Application entry point
```

### 🧩 Key Components Explained

- **`api/middlewares/multer.middleware.js`**: A smart middleware that inspects the file stream. It routes images to memory storage for immediate processing and large videos to temporary disk storage to prepare for multipart uploading.
- **`api/helpers/s3.helper.js`**: Wraps the AWS SDK v3 `S3Client`. Handles complex operations like `CreateMultipartUploadCommand`, `UploadPartCommand`, and generating `GetSignedUrl`.
- **`api/services/media.service.js`**: The brain of the operation. It orchestrates the upload flow, determines file types, calls the appropriate S3 helper methods, and formats the standardized response with signed URLs and metadata.
- **`config/envConfig.js`**: Centralized configuration that ensures type safety and correct mapping of environment variables for the application.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm
- Hetzner Object Storage Account (or any S3 compatible storage)

### Installation

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment**:
    Create a `.env` file in the root directory:

    ```env
    # Server Configuration
    PORT=1338
    NODE_ENV=development

    # Hetzner Object Storage
    HETZNER_STORAGE_ENDPOINT=https://fsn1.your-objectstorage.com
    HETZNER_STORAGE_BUCKET=your-bucket-name
    HETZNER_STORAGE_ACCESS_KEY=your-access-key
    HETZNER_STORAGE_SECRET_KEY=your-secret-key
    HETZNER_STORAGE_REGION=eu-central

    # File Configuration
    MAX_FILE_SIZE=52428800 # 50MB
    ```

4.  **Start the server**:
    ```bash
    npm start
    ```

---

## 📡 API Documentation

### 1. Upload Single File

Uploads a file (image or video) to a specific folder.

- **Endpoint**: `POST /api/media/upload`
- **Body**: `form-data`
  - `file`: (File) The media file.
  - `folder`: (String) Target folder name (e.g., "profiles", "posts").

**Example Response:**

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "key": "profiles/uuid-filename.jpg",
    "url": "https://fsn1.your-objectstorage.com/bucket/...?signed_params...",
    "urlExpiresAt": "2026-02-17T23:00:00.000Z",
    "fileName": "avatar.jpg",
    "fileSize": 102400,
    "mimeType": "image/jpeg",
    "mediaType": "image",
    "folder": "profiles",
    "uploadedAt": "2026-02-17T21:00:00.000Z"
  }
}
```

### 2. Bulk Upload

Upload up to 20 files simultaneously.

- **Endpoint**: `POST /api/media/upload-bulk`
- **Body**: `form-data`
  - `files`: (Array of Files)
  - `folder`: (String) Target folder name.

**Example Response:**

```json
{
  "success": true,
  "message": "2 files uploaded successfully",
  "data": {
    "uploaded": [
      {
        "key": "posts/uuid-1.jpg",
        "url": "https://...",
        "fileName": "photo1.jpg",
        "mediaType": "image"
        // ... additional metadata
      },
      {
        "key": "posts/uuid-2.mp4",
        "url": "https://...",
        "fileName": "video.mp4",
        "mediaType": "video"
        // ... additional metadata
      }
    ],
    "failed": [],
    "summary": { "total": 2, "success": 2, "failed": 0 }
  }
}
```

### 3. Get Feed (Instagram-like)

Retrieves a paginated list of media posts with signed URLs.

- **Endpoint**: `GET /api/feed`
- **Query Params**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)

### 4. Delete File

Removes a file from storage.

- **Endpoint**: `DELETE /api/media/delete`
- **Query Params**:
  - `key`: The storage key of the file to delete.

---

## ⚙️ Logic Flow

### Auto-Detection & Upload Strategy

1.  **Request Arrival**: A `POST` request hits `/api/media/upload`.
2.  **Smart Middleware**: `multer.middleware.js` peeks at the `mimetype`.
    - **If Image**: It keeps the file in memory buffer.
    - **If Video**: It writes the file to `/tmp/uploads` to handle large sizes without crashing memory.
3.  **Service Processing**: `media.service.js` receives the file object.
    - It re-verifies the type.
    - **Image**: Calls `uploadFileToS3` (Single `PutObjectCommand`).
    - **Video**: Calls `uploadFileMultipart`.
      - Initiates Multipart Upload.
      - Reads file in **5MB Chunks**.
      - Uploads chunks sequentially.
      - Completes Multipart Upload.
4.  **Cleanup**: If a temporary file was created (for videos), it is deleted from disk.
5.  **Signing**: A temporary **Signed URL** (2-hour expiry) is generated for the uploaded file.
6.  **Response**: The client deals with a unified JSON response containing all necessary metadata for database storage.

---

## 📄 License

This project is licensed under the MIT License.

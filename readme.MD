# Media Storage System - Folder Structure

```
media-storage-system/
├── config/
│   ├── constants.js           # All constants and configurations
│   └── database.js             # Sequelize database connection
├── api/
│   ├── controllers/
│   │   ├── StorageController.js    # Storage APIs (upload, delete, signed URLs)
│   │   └── FeedController.js        # Feed listing API
│   ├── models/
│   │   └── Media.js                 # Media model (Sequelize)
│   ├── helpers/
│   │       └── hetzner/
│   │           ├── uploadFile.js           # Upload to S3
│   │           ├── deleteFile.js           # Delete from S3
│   │           ├── downloadFile.js         # Download from S3
│   │           ├── generateSignedUrl.js    # Generate signed URL from filePath
│   │           └── generateSignedUrlFromPrivateUrl.js  # Generate signed URL from URL
│   ├── middleware/
│   │   └── upload.js                # Multer file upload middleware
│   └── routes/
│       ├── storage.routes.js        # Storage routes
│       └── feed.routes.js           # Feed routes
├── utils/
│   └── fileUtils.js                 # File utility functions
├── .env.example                     # Environment variables template
├── app.js                           # Express app setup & entry point
```

## Architecture Principles

1. **Separation of Concerns**: Controllers handle HTTP, Services handle business logic, Helpers handle storage operations
2. **Reusability**: All storage helpers can be copied to any project
3. **Zero Duplication**: Single source of truth for each operation
4. **Functional Design**: No classes, pure functions only
5. **Database First**: Feed APIs query DB only, no storage SDK calls

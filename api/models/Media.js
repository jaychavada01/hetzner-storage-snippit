const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/sequelize");
const { models } = require("../../config/models");

const Media = sequelize.define(
  "Media",
  {
    url: {
      type: DataTypes.STRING(255),
      defaultValue: "",
    },
    fileName: {
      type: DataTypes.STRING(255),
      defaultValue: "",
      field: "file_name",
    },
    filePath: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "file_path",
    },
    size: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    contentType: {
      type: DataTypes.STRING(128),
      defaultValue: "",
      field: "content_type",
    },
    originalName: {
      type: DataTypes.STRING(255),
      defaultValue: "",
      field: "original_name",
    },
    mediaType: {
      type: DataTypes.STRING(15),
      defaultValue: "",
      field: "media_type",
    },
    // Thumbnail fields (for images)
    thumbnailUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "thumbnail_url",
    },
    thumbnailFileName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "thumbnail_file_name",
    },
    thumbnailFilePath: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "thumbnail_file_path",
    },
    thumbnailWidth: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "thumbnail_width",
    },
    thumbnailHeight: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "thumbnail_height",
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    // Public storage (populated when context = feed)
    publicUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Common fields from models.js
    ...models.defaultAttributes,
  },
  {
    tableName: "media",
    freezeTableName: true,
    timestamps: false,
  },
);

// Media.associate = function (models) {};

module.exports = Media;

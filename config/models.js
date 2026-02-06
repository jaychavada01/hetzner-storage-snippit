const { DataTypes } = require("sequelize");
const { GET_CURRENT_TIMESTAMP } = require("./constants");


module.exports.models = {
  defaultAttributes: {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
    created_at: {
      type: DataTypes.BIGINT,
      defaultValue: () => GET_CURRENT_TIMESTAMP(),
      field: 'created_at',
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'created_by',
    },
    updated_at: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: () => GET_CURRENT_TIMESTAMP(),
      field: 'updated_at',
    },
    updated_by: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'updated_by',
    },
    deleted_at: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'deleted_at',
    },
    deleted_by: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'deleted_by',
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_deleted',
    },
  },
};

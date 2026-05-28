const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CardSettings = sequelize.define('CardSettings', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cardIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'card_index',
      validate: {
        isIn: [[1, 2]],
      },
    },
    isEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_enabled',
    },
    isLockedForFree: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_locked_for_free',
    },
    isLockedForPremium: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_locked_for_premium',
    },
    allowedMediaTypes: {
      type: DataTypes.JSON,
      defaultValue: ['image', 'video'],
      field: 'allowed_media_types',
      get() {
        const value = this.getDataValue('allowedMediaTypes');
        if (typeof value === 'string') {
          return JSON.parse(value);
        }
        return value || ['image', 'video'];
      },
      set(value) {
        this.setDataValue('allowedMediaTypes', value);
      },
    },
    maxFileSizeMb: {
      type: DataTypes.INTEGER,
      defaultValue: 500,
      field: 'max_file_size_mb',
    },
    defaultMediaUrl: {
      type: DataTypes.TEXT,
      field: 'default_media_url',
    },
    defaultTitle: {
      type: DataTypes.STRING(255),
      field: 'default_title',
    },
    defaultDescription: {
      type: DataTypes.TEXT,
      field: 'default_description',
    },
    defaultLinkUrl: {
      type: DataTypes.TEXT,
      field: 'default_link_url',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  }, {
    tableName: 'card_settings',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['card_index'],
      },
    ],
  });

  return CardSettings;
};

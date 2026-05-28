const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const FeatureOverride = sequelize.define('FeatureOverride', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    featureKey: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'feature_key',
    },
    featureValue: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'feature_value',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'expires_at',
    },
  }, {
    tableName: 'user_feature_overrides',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'feature_key'],
      },
    ],
  });

  FeatureOverride.associate = (models) => {
    FeatureOverride.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return FeatureOverride;
};

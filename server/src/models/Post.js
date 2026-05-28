const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    fbAccountId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'facebook_accounts',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    targetType: {
      type: DataTypes.ENUM('profile', 'page', 'group'),
      allowNull: false,
    },
    targetId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    adAccountId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'ad_account_id',
    },
    caption: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    video1Path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    video2Path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    card1MediaType: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'card1_media_type',
    },
    card1Title: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'card1_title',
    },
    card1Description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'card1_description',
    },
    card1LinkUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'card1_link_url',
    },
    card2MediaType: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'card2_media_type',
    },
    card2Title: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'card2_title',
    },
    card2Description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'card2_description',
    },
    card2LinkUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'card2_link_url',
    },
    card2ManagedByAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'card2_managed_by_admin',
    },
    status: {
      type: DataTypes.ENUM('draft', 'scheduled', 'publishing', 'published', 'failed'),
      defaultValue: 'draft',
      allowNull: false,
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fbPostId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fbPostUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    facebookCreativeId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'facebook_creative_id',
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'posts',
    timestamps: true,
    underscored: true,
  });

  Post.associate = (models) => {
    Post.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    Post.belongsTo(models.FacebookAccount, {
      foreignKey: 'fbAccountId',
      as: 'facebookAccount',
    });
  };

  return Post;
};

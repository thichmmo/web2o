const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const FacebookAccount = sequelize.define('FacebookAccount', {
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
    fbUserId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fbUserName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accessToken: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tokenExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'facebook_accounts',
    timestamps: true,
    underscored: true,
  });

  FacebookAccount.associate = (models) => {
    FacebookAccount.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    FacebookAccount.hasMany(models.Post, {
      foreignKey: 'fbAccountId',
      as: 'posts',
    });
    FacebookAccount.hasMany(models.FacebookAdAccount, {
      foreignKey: 'fbAccountId',
      as: 'adAccounts',
    });
  };

  FacebookAccount.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.accessToken;
    return values;
  };

  return FacebookAccount;
};

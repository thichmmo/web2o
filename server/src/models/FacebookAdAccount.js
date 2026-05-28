const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const FacebookAdAccount = sequelize.define('FacebookAdAccount', {
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
    adAccountId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'ad_account_id',
    },
    adAccountName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'ad_account_name',
    },
    accountStatus: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'account_status',
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    timezoneName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'timezone_name',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
  }, {
    tableName: 'facebook_ad_accounts',
    timestamps: true,
    underscored: true,
  });

  FacebookAdAccount.associate = (models) => {
    FacebookAdAccount.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    FacebookAdAccount.belongsTo(models.FacebookAccount, {
      foreignKey: 'fbAccountId',
      as: 'facebookAccount',
    });
  };

  return FacebookAdAccount;
};

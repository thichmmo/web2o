'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('facebook_ad_accounts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      fb_account_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'facebook_accounts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      ad_account_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      ad_account_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      account_status: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      timezone_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('facebook_ad_accounts', ['user_id']);
    await queryInterface.addIndex('facebook_ad_accounts', ['fb_account_id']);
    await queryInterface.addIndex('facebook_ad_accounts', ['ad_account_id']);
    await queryInterface.addIndex(
      'facebook_ad_accounts',
      ['user_id', 'fb_account_id', 'ad_account_id'],
      { unique: true, name: 'uniq_fb_ad_accounts_user_fb_account_ad_account' }
    );

    await queryInterface.addColumn('posts', 'ad_account_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('posts', 'facebook_creative_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('posts', 'facebook_creative_id');
    await queryInterface.removeColumn('posts', 'ad_account_id');
    await queryInterface.dropTable('facebook_ad_accounts');
  }
};

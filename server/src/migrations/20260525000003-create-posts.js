'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('posts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      fbAccountId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'facebook_accounts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      targetType: {
        type: Sequelize.ENUM('profile', 'page', 'group'),
        allowNull: false,
      },
      targetId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      targetName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      caption: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      video1Path: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      video2Path: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('draft', 'scheduled', 'publishing', 'published', 'failed'),
        defaultValue: 'draft',
      },
      scheduledAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      publishedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      fbPostId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      fbPostUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      errorMessage: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('posts', ['userId']);
    await queryInterface.addIndex('posts', ['fbAccountId']);
    await queryInterface.addIndex('posts', ['status']);
    await queryInterface.addIndex('posts', ['scheduledAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('posts');
  }
};

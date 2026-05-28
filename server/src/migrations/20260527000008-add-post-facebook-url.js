'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('posts');
    if (!table.fb_post_url) {
      await queryInterface.addColumn('posts', 'fb_post_url', {
        type: Sequelize.STRING(1024),
        allowNull: true,
      });
    }
  },

  down: async (queryInterface) => {
    const table = await queryInterface.describeTable('posts');
    if (table.fb_post_url) {
      await queryInterface.removeColumn('posts', 'fb_post_url');
    }
  },
};

const { Sequelize } = require('sequelize');
const { sequelize } = require('../config/database');

const db = {
  sequelize,
  Sequelize,
};

// Import models
db.User = require('./User')(sequelize, Sequelize.DataTypes);
db.FacebookAccount = require('./FacebookAccount')(sequelize, Sequelize.DataTypes);
db.FacebookAdAccount = require('./FacebookAdAccount')(sequelize, Sequelize.DataTypes);
db.Post = require('./Post')(sequelize, Sequelize.DataTypes);
db.Plan = require('./Plan')(sequelize, Sequelize.DataTypes);
db.Subscription = require('./Subscription')(sequelize, Sequelize.DataTypes);
db.ActivityLog = require('./ActivityLog')(sequelize, Sequelize.DataTypes);
db.Setting = require('./Setting')(sequelize, Sequelize.DataTypes);
db.CardSettings = require('./CardSettings')(sequelize, Sequelize.DataTypes);
db.FeatureOverride = require('./FeatureOverride')(sequelize, Sequelize.DataTypes);

// Setup associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;

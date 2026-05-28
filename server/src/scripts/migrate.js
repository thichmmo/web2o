const fs = require('fs').promises;
const path = require('path');
const { sequelize } = require('../src/config/database');
const logger = require('../src/utils/logger');

const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

async function runMigrations() {
  try {
    logger.info('Starting database migrations...');

    // Get all migration files
    const files = await fs.readdir(MIGRATIONS_DIR);
    const sqlFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort();

    logger.info(`Found ${sqlFiles.length} migration files`);

    // Run each migration
    for (const file of sqlFiles) {
      logger.info(`Running migration: ${file}`);
      const sql = await fs.readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
      await sequelize.query(sql);
      logger.info(`✅ Completed: ${file}`);
    }

    logger.info('✅ All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();

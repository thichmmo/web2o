const fs = require('fs').promises;
const path = require('path');
const { sequelize } = require('../src/config/database');
const logger = require('../src/utils/logger');

const SEEDS_DIR = path.join(__dirname, '../seeds');

async function runSeeds() {
  try {
    logger.info('Starting database seeding...');

    // Get all seed files
    const files = await fs.readdir(SEEDS_DIR);
    const sqlFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort();

    logger.info(`Found ${sqlFiles.length} seed files`);

    // Run each seed
    for (const file of sqlFiles) {
      logger.info(`Running seed: ${file}`);
      const sql = await fs.readFile(path.join(SEEDS_DIR, file), 'utf8');
      await sequelize.query(sql);
      logger.info(`✅ Completed: ${file}`);
    }

    logger.info('✅ All seeds completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

runSeeds();

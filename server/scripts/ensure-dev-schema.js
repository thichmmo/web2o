const db = require('../src/models');

const postColumns = {
  ad_account_id: 'VARCHAR(255) NULL',
  card1_media_type: 'VARCHAR(20) NULL',
  card1_title: 'VARCHAR(255) NULL',
  card1_description: 'TEXT NULL',
  card1_link_url: 'TEXT NULL',
  card2_media_type: 'VARCHAR(20) NULL',
  card2_title: 'VARCHAR(255) NULL',
  card2_description: 'TEXT NULL',
  card2_link_url: 'TEXT NULL',
  card2_managed_by_admin: 'TINYINT(1) DEFAULT 1',
  fb_post_url: 'VARCHAR(1024) NULL',
  facebook_creative_id: 'VARCHAR(255) NULL',
};

const defaultSettings = [
  ['site_name', 'Thich Cuu - Facebook Tool', 'string', 'Website name'],
  ['site_description', 'Facebook carousel posting tool', 'string', 'Website description'],
  ['maintenance_mode', 'false', 'boolean', 'Maintenance mode'],
  ['maintenance_message', 'Website is under maintenance.', 'string', 'Maintenance message'],
  ['allow_registration', 'true', 'boolean', 'Allow registration'],
  ['email_enabled', 'false', 'boolean', 'Enable email sending'],
  ['smtp_host', '', 'string', 'SMTP host'],
  ['smtp_port', '587', 'number', 'SMTP port'],
  ['smtp_secure', 'true', 'boolean', 'Use SSL/TLS'],
  ['smtp_user', '', 'string', 'SMTP username'],
  ['smtp_password', '', 'string', 'SMTP password'],
  ['email_from_name', 'Thich Cuu', 'string', 'Email sender name'],
  ['email_from_address', 'noreply@thichcuu.local', 'string', 'Email sender address'],
  ['site_logo', '', 'string', 'Website logo path'],
  ['site_favicon', '', 'string', 'Website favicon path'],
  ['primary_color', '#2563eb', 'string', 'Primary color'],
  ['secondary_color', '#1e40af', 'string', 'Secondary color'],
  ['custom_css', '', 'string', 'Custom CSS'],
  ['custom_js', '', 'string', 'Custom JavaScript'],
];

async function ensurePostColumns() {
  const [columns] = await db.sequelize.query('SHOW COLUMNS FROM posts');
  const existing = new Set(columns.map((column) => column.Field));

  for (const [name, definition] of Object.entries(postColumns)) {
    if (!existing.has(name)) {
      await db.sequelize.query(`ALTER TABLE posts ADD COLUMN ${name} ${definition}`);
      console.log(`Added posts.${name}`);
    }
  }
}

async function ensureFacebookAdAccountsTable() {
  await db.sequelize.query(`
    CREATE TABLE IF NOT EXISTS facebook_ad_accounts (
      id CHAR(36) NOT NULL PRIMARY KEY,
      user_id CHAR(36) NOT NULL,
      fb_account_id CHAR(36) NOT NULL,
      ad_account_id VARCHAR(255) NOT NULL,
      ad_account_name VARCHAR(255) NOT NULL,
      account_status VARCHAR(255) NULL,
      currency VARCHAR(255) NULL,
      timezone_name VARCHAR(255) NULL,
      is_active TINYINT(1) DEFAULT 1,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      CONSTRAINT fk_facebook_ad_accounts_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_facebook_ad_accounts_fb_account_id FOREIGN KEY (fb_account_id) REFERENCES facebook_accounts(id) ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  const [indexes] = await db.sequelize.query('SHOW INDEX FROM facebook_ad_accounts');
  const indexNames = new Set(indexes.map((index) => index.Key_name));
  if (!indexNames.has('idx_facebook_ad_accounts_user_id')) {
    await db.sequelize.query('CREATE INDEX idx_facebook_ad_accounts_user_id ON facebook_ad_accounts (user_id)');
  }
  if (!indexNames.has('idx_facebook_ad_accounts_fb_account_id')) {
    await db.sequelize.query('CREATE INDEX idx_facebook_ad_accounts_fb_account_id ON facebook_ad_accounts (fb_account_id)');
  }
  if (!indexNames.has('idx_facebook_ad_accounts_ad_account_id')) {
    await db.sequelize.query('CREATE INDEX idx_facebook_ad_accounts_ad_account_id ON facebook_ad_accounts (ad_account_id)');
  }
  if (!indexNames.has('uniq_fb_ad_accounts_user_fb_account_ad_account')) {
    await db.sequelize.query('CREATE UNIQUE INDEX uniq_fb_ad_accounts_user_fb_account_ad_account ON facebook_ad_accounts (user_id, fb_account_id, ad_account_id)');
  }
}

async function ensureDefaults() {
  await Promise.all([
    db.CardSettings.findOrCreate({
      where: { cardIndex: 1 },
      defaults: {
        isEnabled: true,
        isLockedForFree: false,
        isLockedForPremium: false,
        allowedMediaTypes: ['image', 'video'],
        maxFileSizeMb: 500,
      },
    }),
    db.CardSettings.findOrCreate({
      where: { cardIndex: 2 },
      defaults: {
        isEnabled: true,
        isLockedForFree: true,
        isLockedForPremium: false,
        allowedMediaTypes: ['image', 'video'],
        maxFileSizeMb: 500,
        defaultTitle: 'Default Card 2',
        defaultDescription: 'Managed by admin for users without Card 2 permission',
        defaultLinkUrl: 'https://example.com',
      },
    }),
  ]);

  for (const [key, value, type, description] of defaultSettings) {
    await db.Setting.findOrCreate({
      where: { key },
      defaults: { value, type, description },
    });
  }
}

async function ensureDevSchema() {
  await db.sequelize.authenticate();
  await ensureFacebookAdAccountsTable();
  await ensurePostColumns();
  await ensureDefaults();
}

if (require.main === module) {
  ensureDevSchema()
    .then(async () => {
      console.log('Development schema is ready');
      await db.sequelize.close();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error('Failed to ensure development schema:', error);
      await db.sequelize.close();
      process.exit(1);
    });
}

module.exports = ensureDevSchema;

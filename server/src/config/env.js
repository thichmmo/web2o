require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1',
  },

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    database: process.env.DB_NAME || 'thichcuu_dev',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_change_in_production',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  encryption: {
    key: process.env.ENCRYPTION_KEY || 'dev_key_32_chars_change_prod!!',
    algorithm: 'aes-256-gcm',
  },

  facebook: {
    graphVersion: process.env.FACEBOOK_GRAPH_VERSION || 'v21.0',
    appId: process.env.FACEBOOK_APP_ID || process.env.FB_APP_ID || '',
    appSecret: process.env.FACEBOOK_APP_SECRET || process.env.FB_APP_SECRET || '',
    devMockEnabled: process.env.FACEBOOK_DEV_MOCK_ENABLED !== 'false',
  },

  upload: {
    maxSizeMB: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '500', 10),
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    allowedVideoTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif'],
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    credentials: true,
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || './logs',
  },
};

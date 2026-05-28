const express = require('express');
const router = express.Router();

// Placeholder routes - will be implemented in phases
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Thich Cuu API v1',
    endpoints: {
      auth: '/auth',
      user: '/user',
      facebook: '/facebook',
      videos: '/videos',
      posts: '/posts',
      logs: '/logs',
      admin: '/admin',
    },
  });
});

// Auth routes
router.use('/auth', require('./authRoutes'));

// Public read-only routes
router.use('/public', require('./publicRoutes'));

// Facebook routes
router.use('/facebook', require('./facebookRoutes'));

// Post routes
router.use('/posts', require('./postRoutes'));

// User self-service routes
router.use('/user', require('./userRoutes'));

// Admin routes
router.use('/admin', require('./adminRoutes'));

// Settings routes
router.use('/settings', require('./settingsRoutes'));

module.exports = router;

const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { uploadBranding, handleUploadError } = require('../middleware/upload');

router.get('/public', settingsController.getPublicSettings);

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);
router.post('/upload-branding', uploadBranding.single('file'), handleUploadError, settingsController.uploadBrandingFile);

module.exports = router;

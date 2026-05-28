const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const cardSettingsController = require('../controllers/cardSettingsController');
const planController = require('../controllers/planController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { uploadCardDefaultMedia, handleUploadError } = require('../middleware/upload');

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

router.get('/users', adminController.getUsers);
router.get('/users/:userId', adminController.getUser);
router.get('/users/:userId/stats', adminController.getUserStats);
router.put('/users/:userId', adminController.updateUser);
router.post('/users/:userId/reset-password', adminController.resetUserPassword);
router.delete('/users/:userId', adminController.deleteUser);

// User subscription routes
router.post('/users/:userId/subscription', adminController.assignPlanToUser);
router.get('/users/:userId/subscriptions', adminController.getUserSubscriptions);
router.delete('/subscriptions/:subscriptionId', adminController.cancelSubscription);

// User feature override routes
router.get('/users/:userId/feature-overrides', adminController.getUserFeatureOverrides);
router.post('/users/:userId/feature-overrides', adminController.addFeatureOverride);
router.delete('/feature-overrides/:overrideId', adminController.deleteFeatureOverride);

router.get('/activity-logs', adminController.getActivityLogs);
router.get('/stats', adminController.getStats);

// Card Settings routes
router.get('/card-settings', cardSettingsController.getCardSettings);
router.get('/card-settings/:cardIndex', cardSettingsController.getCardSettingByIndex);
router.put('/card-settings/:cardIndex', cardSettingsController.updateCardSettings);
router.post('/card-settings/:cardIndex/reset', cardSettingsController.resetCardSettings);
router.post(
  '/card-settings/:cardIndex/default-media',
  uploadCardDefaultMedia.single('file'),
  handleUploadError,
  cardSettingsController.uploadDefaultMedia
);

// Plan routes
router.get('/plans', planController.getPlans);
router.get('/plans/:planId', planController.getPlan);
router.post('/plans', planController.createPlan);
router.put('/plans/:planId', planController.updatePlan);
router.delete('/plans/:planId', planController.deletePlan);
router.patch('/plans/:planId/toggle', planController.togglePlanStatus);

// Post routes
router.get('/posts', adminController.getPosts);
router.get('/posts/:postId', adminController.getPost);
router.delete('/posts/:postId', adminController.deletePost);

module.exports = router;

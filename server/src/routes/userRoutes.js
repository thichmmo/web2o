const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const userController = require('../controllers/userController');

router.use(authenticate);

router.get('/dashboard', userController.getDashboard);
router.get('/subscription', userController.getSubscription);
router.get('/plans', userController.getPlans);
router.post('/subscription/upgrade', userController.upgradePlan);
router.get('/permissions', userController.getPermissions);
router.get('/card-settings', userController.getCardSettings);
router.get('/profile/stats', userController.getProfileStats);

module.exports = router;

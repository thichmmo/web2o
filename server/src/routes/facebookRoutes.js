const express = require('express');
const router = express.Router();
const facebookController = require('../controllers/facebookController');
const authenticate = require('../middleware/authenticate');

// All routes require authentication
router.use(authenticate);

router.get('/login-url', facebookController.getLoginUrl);
router.post('/mock-connect', facebookController.connectMockAccount);
router.post('/token-connect', facebookController.connectTokenAccount);
router.get('/callback', facebookController.handleCallback);
router.get('/accounts', facebookController.getAccounts);
router.get('/accounts/:accountId/pages', facebookController.getPages);
router.get('/accounts/:accountId/ad-accounts', facebookController.getAdAccounts);
router.get('/accounts/:accountId/groups', facebookController.getGroups);
router.post('/accounts/:accountId/disconnect', facebookController.disconnectAccount);

module.exports = router;

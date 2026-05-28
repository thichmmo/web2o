const facebookService = require('../services/facebookService');
const { syncAdAccountsForFacebookAccount } = require('../services/facebookAccountSyncService');
const db = require('../models');
const config = require('../config/env');

const getLoginUrl = (req, res) => {
  try {
    if (!facebookService.hasLiveCredentials() && config.facebook.devMockEnabled) {
      return res.status(200).json({
        success: true,
        data: {
          loginUrl: null,
          mockMode: true,
          message: 'Facebook credentials are not configured. Development mock connect is available.',
        },
      });
    }

    if (!facebookService.hasLiveCredentials()) {
      return res.status(503).json({
        success: false,
        message: 'Facebook App credentials are not configured',
      });
    }

    const redirectUri = `${req.protocol}://${req.get('host')}/api/${config.server.apiVersion}/facebook/callback`;
    const scope = 'public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts,publish_video,ads_read,ads_management';

    const loginUrl = `https://www.facebook.com/${config.facebook.graphVersion}/dialog/oauth?client_id=${config.facebook.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code`;

    return res.status(200).json({
      success: true,
      data: {
        loginUrl,
      },
    });
  } catch (error) {
    console.error('Get login URL error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate login URL',
    });
  }
};

const connectMockAccount = async (req, res) => {
  try {
    if (!config.facebook.devMockEnabled || config.server.env === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Development Facebook mock is disabled',
      });
    }

    const fbUserId = `dev-${req.user.id.substring(0, 8)}`;
    const tokenExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    const [account, created] = await db.FacebookAccount.findOrCreate({
      where: { userId: req.user.id, fbUserId },
      defaults: {
        fbUserName: `${req.user.fullName} Dev Facebook`,
        accessToken: `dev_mock_${req.user.id}_${Date.now()}`,
        tokenExpiresAt,
        isActive: true,
      },
    });

    if (!created) {
      await account.update({
        fbUserName: `${req.user.fullName} Dev Facebook`,
        accessToken: `dev_mock_${req.user.id}_${Date.now()}`,
        tokenExpiresAt,
        isActive: true,
      });
    }

    const [adAccount] = await db.FacebookAdAccount.findOrCreate({
      where: {
        userId: req.user.id,
        fbAccountId: account.id,
        adAccountId: 'act_dev_mock_1',
      },
      defaults: {
        adAccountName: 'Dev Mock Ad Account',
        accountStatus: 'ACTIVE',
        currency: 'USD',
        timezoneName: 'Etc/UTC',
        isActive: true,
      },
    });
    if (!adAccount.isActive) {
      await adAccount.update({ isActive: true });
    }

    await db.ActivityLog.create({
      userId: req.user.id,
      action: 'connect_facebook_mock',
      resource: 'facebook_account',
      resourceId: account.id,
      details: { fbUserId, devMock: true },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return res.status(201).json({
      success: true,
      message: 'Development Facebook account connected',
      data: {
        account,
        mockMode: true,
      },
    });
  } catch (error) {
    console.error('Connect mock Facebook error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to connect development Facebook account',
    });
  }
};

const connectTokenAccount = async (req, res) => {
  try {
    const { accessToken, tokenExpiresAt } = req.body;

    if (!accessToken || typeof accessToken !== 'string' || accessToken.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'A valid Facebook access token is required',
      });
    }

    const normalizedToken = accessToken.trim();
    const isDevToken = normalizedToken.startsWith('dev_mock_') || normalizedToken.startsWith('dev_token_');

    if (isDevToken && (!config.facebook.devMockEnabled || config.server.env === 'production')) {
      return res.status(403).json({
        success: false,
        message: 'Development Facebook token connect is disabled',
      });
    }

    const profile = await facebookService.getUserProfile(normalizedToken);
    if (!profile?.id || !profile?.name) {
      return res.status(400).json({
        success: false,
        message: 'Facebook token did not return a valid profile',
      });
    }

    let expiresAt = tokenExpiresAt ? new Date(tokenExpiresAt) : null;
    if (!expiresAt || Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
      expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
    }

    let fbAccount = await db.FacebookAccount.findOne({
      where: {
        userId: req.user.id,
        fbUserId: profile.id,
      },
    });

    if (fbAccount) {
      await fbAccount.update({
        fbUserName: profile.name,
        accessToken: normalizedToken,
        tokenExpiresAt: expiresAt,
        isActive: true,
      });
    } else {
      fbAccount = await db.FacebookAccount.create({
        userId: req.user.id,
        fbUserId: profile.id,
        fbUserName: profile.name,
        accessToken: normalizedToken,
        tokenExpiresAt: expiresAt,
        isActive: true,
      });
    }

    let adAccounts = [];
    try {
      adAccounts = await syncAdAccountsForFacebookAccount(fbAccount, req.user.id);
    } catch (syncError) {
      console.warn('Facebook ad account sync skipped:', syncError.message);
    }

    await db.ActivityLog.create({
      userId: req.user.id,
      action: 'connect_facebook_token',
      resource: 'facebook_account',
      resourceId: fbAccount.id,
      details: { fbUserId: profile.id, tokenSource: isDevToken ? 'dev' : 'manual' },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return res.status(201).json({
      success: true,
      message: 'Facebook account connected by token',
      data: {
        account: fbAccount,
        adAccounts,
      },
    });
  } catch (error) {
    console.error('Connect Facebook token error:', error);
    return res.status(400).json({
      success: false,
      message: 'Failed to connect Facebook account with token',
    });
  }
};

const handleCallback = async (req, res) => {
  try {
    const { code, error, error_description } = req.query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: error_description || 'Facebook authentication failed',
      });
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required',
      });
    }

    const redirectUri = `${req.protocol}://${req.get('host')}/api/${config.server.apiVersion}/facebook/callback`;

    // Exchange code for short-lived token
    const tokenData = await facebookService.exchangeCodeForToken(code, redirectUri);

    // Get long-lived token
    const longLivedTokenData = await facebookService.getLongLivedToken(tokenData.access_token);

    // Get user profile
    const profile = await facebookService.getUserProfile(longLivedTokenData.access_token);

    // Calculate token expiration
    const expiresIn = longLivedTokenData.expires_in || 5184000; // Default 60 days
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

    // Check if account already exists
    let fbAccount = await db.FacebookAccount.findOne({
      where: {
        userId: req.user.id,
        fbUserId: profile.id,
      },
    });

    if (fbAccount) {
      // Update existing account
      await fbAccount.update({
        fbUserName: profile.name,
        accessToken: longLivedTokenData.access_token,
        tokenExpiresAt,
        isActive: true,
      });
    } else {
      // Create new account
      fbAccount = await db.FacebookAccount.create({
        userId: req.user.id,
        fbUserId: profile.id,
        fbUserName: profile.name,
        accessToken: longLivedTokenData.access_token,
        tokenExpiresAt,
        isActive: true,
      });
    }

    let adAccounts = [];
    try {
      adAccounts = await syncAdAccountsForFacebookAccount(fbAccount, req.user.id);
    } catch (syncError) {
      console.warn('Facebook ad account sync skipped:', syncError.message);
    }

    await db.ActivityLog.create({
      userId: req.user.id,
      action: 'connect_facebook',
      resource: 'facebook_account',
      resourceId: fbAccount.id,
      details: { fbUserId: profile.id, fbUserName: profile.name },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return res.status(200).json({
      success: true,
      message: 'Facebook account connected successfully',
      data: {
        account: fbAccount,
        adAccounts,
      },
    });
  } catch (error) {
    console.error('Facebook callback error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to connect Facebook account',
    });
  }
};

const getAccounts = async (req, res) => {
  try {
    const accounts = await db.FacebookAccount.findAll({
      where: { userId: req.user.id },
      attributes: ['id', 'fbUserId', 'fbUserName', 'tokenExpiresAt', 'isActive', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: {
        accounts,
      },
    });
  } catch (error) {
    console.error('Get accounts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get Facebook accounts',
    });
  }
};

const getPages = async (req, res) => {
  try {
    const { accountId } = req.params;

    const fbAccount = await db.FacebookAccount.findOne({
      where: {
        id: accountId,
        userId: req.user.id,
      },
    });

    if (!fbAccount) {
      return res.status(404).json({
        success: false,
        message: 'Facebook account not found',
      });
    }

    const pages = await facebookService.getUserPages(fbAccount.accessToken);

    return res.status(200).json({
      success: true,
      data: {
        pages: pages.map(({ access_token, ...page }) => page),
      },
    });
  } catch (error) {
    console.error('Get pages error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get Facebook pages',
    });
  }
};

const getAdAccounts = async (req, res) => {
  try {
    const { accountId } = req.params;

    const fbAccount = await db.FacebookAccount.findOne({
      where: {
        id: accountId,
        userId: req.user.id,
      },
    });

    if (!fbAccount) {
      return res.status(404).json({
        success: false,
        message: 'Facebook account not found',
      });
    }

    const adAccounts = await syncAdAccountsForFacebookAccount(fbAccount, req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        adAccounts,
      },
    });
  } catch (error) {
    console.error('Get ad accounts error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get Facebook ad accounts',
    });
  }
};

const getGroups = async (req, res) => {
  try {
    const { accountId } = req.params;

    const fbAccount = await db.FacebookAccount.findOne({
      where: {
        id: accountId,
        userId: req.user.id,
      },
    });

    if (!fbAccount) {
      return res.status(404).json({
        success: false,
        message: 'Facebook account not found',
      });
    }

    const groups = await facebookService.getUserGroups(fbAccount.accessToken);

    return res.status(200).json({
      success: true,
      data: {
        groups,
      },
    });
  } catch (error) {
    console.error('Get groups error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get Facebook groups',
    });
  }
};

const disconnectAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    const fbAccount = await db.FacebookAccount.findOne({
      where: {
        id: accountId,
        userId: req.user.id,
      },
    });

    if (!fbAccount) {
      return res.status(404).json({
        success: false,
        message: 'Facebook account not found',
      });
    }

    await fbAccount.update({ isActive: false });

    await db.ActivityLog.create({
      userId: req.user.id,
      action: 'disconnect_facebook',
      resource: 'facebook_account',
      resourceId: fbAccount.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return res.status(200).json({
      success: true,
      message: 'Facebook account disconnected successfully',
    });
  } catch (error) {
    console.error('Disconnect account error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to disconnect Facebook account',
    });
  }
};

module.exports = {
  getLoginUrl,
  connectMockAccount,
  connectTokenAccount,
  handleCallback,
  getAccounts,
  getPages,
  getAdAccounts,
  getGroups,
  disconnectAccount,
};

const db = require('../models');
const permissionService = require('../services/permissionService');

const getDashboard = async (req, res) => {
  try {
    const context = await permissionService.getUserPlanContext(req.user.id);
    const postCounts = await db.Post.findAll({
      where: { userId: req.user.id },
      attributes: [
        'status',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    const byStatus = postCounts.reduce((acc, item) => {
      acc[item.status] = Number(item.count);
      return acc;
    }, {});

    const totalPosts = await db.Post.count({ where: { userId: req.user.id } });
    const fbAccounts = await db.FacebookAccount.count({ where: { userId: req.user.id, isActive: true } });

    return res.json({
      success: true,
      data: {
        posts: {
          total: totalPosts,
          draft: byStatus.draft || 0,
          scheduled: byStatus.scheduled || 0,
          published: byStatus.published || 0,
          failed: byStatus.failed || 0,
        },
        facebookAccounts: {
          active: fbAccounts,
        },
        plan: context.plan,
        subscription: context.subscription,
        permissions: context.permissions,
      },
    });
  } catch (error) {
    console.error('Get user dashboard error:', error);
    return res.status(500).json({ success: false, message: 'Failed to get dashboard data' });
  }
};

const getSubscription = async (req, res) => {
  try {
    const context = await permissionService.getUserPlanContext(req.user.id);
    const history = await db.Subscription.findAll({
      where: { userId: req.user.id },
      include: [{ model: db.Plan, as: 'plan' }],
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      success: true,
      data: {
        current: context.subscription,
        plan: context.plan,
        permissions: context.permissions,
        history,
      },
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    return res.status(500).json({ success: false, message: 'Failed to get subscription' });
  }
};

const getPlans = async (req, res) => {
  try {
    const plans = await db.Plan.findAll({
      where: { isActive: true },
      order: [['price', 'ASC']],
    });
    return res.json({ success: true, data: { plans } });
  } catch (error) {
    console.error('Get public plans error:', error);
    return res.status(500).json({ success: false, message: 'Failed to get plans' });
  }
};

const upgradePlan = async (req, res) => {
  try {
    const { planId } = req.body;
    if (!planId) {
      return res.status(400).json({ success: false, message: 'Plan ID is required' });
    }

    const plan = await db.Plan.findByPk(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ success: false, message: 'Plan not found or inactive' });
    }

    await db.Subscription.update(
      { isActive: false },
      { where: { userId: req.user.id, isActive: true } }
    );

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const subscription = await db.Subscription.create({
      userId: req.user.id,
      planId: plan.id,
      startDate,
      endDate,
      isActive: true,
    });

    await db.ActivityLog.create({
      userId: req.user.id,
      action: 'mock_upgrade_plan',
      resource: 'subscription',
      resourceId: subscription.id,
      details: { planId: plan.id, devPaymentMock: true },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return res.status(201).json({
      success: true,
      message: 'Plan upgraded in development mock mode',
      data: { subscription, devPaymentMock: true },
    });
  } catch (error) {
    console.error('Upgrade plan error:', error);
    return res.status(500).json({ success: false, message: 'Failed to upgrade plan' });
  }
};

const getPermissions = async (req, res) => {
  try {
    const context = await permissionService.getUserPlanContext(req.user.id);
    return res.json({
      success: true,
      data: {
        plan: context.plan,
        subscription: context.subscription,
        permissions: context.permissions,
      },
    });
  } catch (error) {
    console.error('Get permissions error:', error);
    return res.status(500).json({ success: false, message: 'Failed to get permissions' });
  }
};

const getCardSettings = async (req, res) => {
  try {
    const context = await permissionService.getUserPlanContext(req.user.id);
    const cards = await permissionService.getCardSettings();
    const cardAccessEntries = await Promise.all(cards.map(async (card) => {
      const access = await permissionService.canUseCard(req.user.id, card.cardIndex);
      return [card.cardIndex, { canUse: access.allowed, reason: access.reason }];
    }));
    const card2Permission = await permissionService.canEditCard2(req.user.id);

    return res.json({
      success: true,
      data: {
        cards,
        cardAccess: Object.fromEntries(cardAccessEntries),
        permissions: context.permissions,
        card2: {
          canEdit: card2Permission.allowed,
          reason: card2Permission.reason,
        },
      },
    });
  } catch (error) {
    console.error('Get user card settings error:', error);
    return res.status(500).json({ success: false, message: 'Failed to get card settings' });
  }
};

const getProfileStats = async (req, res) => {
  try {
    const context = await permissionService.getUserPlanContext(req.user.id);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthlyPosts = await db.Post.count({
      where: {
        userId: req.user.id,
        createdAt: { [db.Sequelize.Op.gte]: monthStart },
      },
    });
    const fbAccounts = await db.FacebookAccount.count({ where: { userId: req.user.id, isActive: true } });

    return res.json({
      success: true,
      data: {
        monthlyPosts,
        postsRemaining: Math.max((context.permissions.max_posts || 0) - monthlyPosts, 0),
        facebookAccounts: fbAccounts,
        maxFbAccounts: context.permissions.max_fb_accounts,
      },
    });
  } catch (error) {
    console.error('Get profile stats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to get profile stats' });
  }
};

module.exports = {
  getDashboard,
  getSubscription,
  getPlans,
  upgradePlan,
  getPermissions,
  getCardSettings,
  getProfileStats,
};

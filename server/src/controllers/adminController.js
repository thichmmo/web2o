const db = require('../models');
const { Op } = require('sequelize');

const getUsers = async (req, res) => {
  try {
    const { search, role, isActive, page = 1, limit = 20 } = req.query;

    const where = {};

    if (search) {
      where[Op.or] = [
        { email: { [Op.like]: `%${search}%` } },
        { fullName: { [Op.like]: `%${search}%` } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true';
    }

    const offset = (page - 1) * limit;

    const { count, rows: users } = await db.User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get users',
    });
  }
};

const getUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await db.User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: db.FacebookAccount,
          as: 'facebookAccounts',
          attributes: ['id', 'fbUserName', 'isActive', 'createdAt'],
        },
        {
          model: db.Subscription,
          as: 'subscriptions',
          include: [
            {
              model: db.Plan,
              as: 'plan',
              attributes: ['name', 'maxPosts', 'maxFbAccounts'],
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get post count
    const postCount = await db.Post.count({
      where: { userId },
    });

    return res.status(200).json({
      success: true,
      data: {
        user,
        stats: {
          postCount,
          fbAccountCount: user.facebookAccounts.length,
        },
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get user',
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { fullName, role, isActive } = req.body;

    const user = await db.User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (role !== undefined && !['admin', 'user'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role',
      });
    }

    if (isActive !== undefined && typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean',
      });
    }

    if (userId === req.user.id && ((role !== undefined && role !== 'admin') || isActive === false)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove your own admin access',
      });
    }

    const updates = {};
    if (fullName !== undefined) updates.fullName = fullName;
    if (role !== undefined) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;

    await user.update(updates);

    await db.ActivityLog.create({
      userId: req.user.id,
      action: 'update_user',
      resource: 'user',
      resourceId: userId,
      details: updates,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user',
    });
  }
};

const resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || typeof newPassword !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'New password is required',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      });
    }

    const user = await db.User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await user.update({ password: newPassword });

    await db.ActivityLog.create({
      userId: req.user.id,
      action: 'reset_user_password',
      resource: 'user',
      resourceId: userId,
      details: { targetUserId: userId },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    console.error('Reset user password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password',
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account',
      });
    }

    const user = await db.User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await user.destroy();

    await db.ActivityLog.create({
      userId: req.user.id,
      action: 'delete_user',
      resource: 'user',
      resourceId: userId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user',
    });
  }
};

const getActivityLogs = async (req, res) => {
  try {
    const { userId, userEmail, action, resource, page = 1, limit = 50 } = req.query;

    const where = {};

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = action;
    }

    if (resource) {
      where.resource = resource;
    }

    const offset = (page - 1) * limit;

    const includeUser = {
      model: db.User,
      as: 'user',
      attributes: ['id', 'email', 'fullName'],
    };

    if (userEmail) {
      includeUser.where = { email: { [Op.like]: `%${userEmail}%` } };
      includeUser.required = true;
    }

    const { count, rows: logs } = await db.ActivityLog.findAndCountAll({
      where,
      include: [includeUser],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get activity logs',
    });
  }
};

const getStats = async (req, res) => {
  try {
    // User stats
    const totalUsers = await db.User.count();
    const activeUsers = await db.User.count({ where: { isActive: true } });
    const adminUsers = await db.User.count({ where: { role: 'admin' } });
    const inactiveUsers = await db.User.count({ where: { isActive: false } });

    // Post stats
    const totalPosts = await db.Post.count();
    const publishedPosts = await db.Post.count({ where: { status: 'published' } });
    const failedPosts = await db.Post.count({ where: { status: 'failed' } });
    const draftPosts = await db.Post.count({ where: { status: 'draft' } });

    // Facebook account stats
    const totalFbAccounts = await db.FacebookAccount.count();
    const activeFbAccounts = await db.FacebookAccount.count({ where: { isActive: true } });

    // Recent activity
    const recentLogs = await db.ActivityLog.findAll({
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'email', 'fullName'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    return res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers,
          admins: adminUsers,
        },
        posts: {
          total: totalPosts,
          published: publishedPosts,
          failed: failedPosts,
          draft: draftPosts,
        },
        facebookAccounts: {
          total: totalFbAccounts,
          active: activeFbAccounts,
        },
        recentActivity: recentLogs,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get stats',
    });
  }
};

// Assign plan to user
const assignPlanToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { planId, durationDays } = req.body;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID is required',
      });
    }

    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const plan = await db.Plan.findByPk(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    // Deactivate current active subscriptions
    await db.Subscription.update(
      { isActive: false },
      { where: { userId, isActive: true } }
    );

    // Create new subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (durationDays || plan.durationDays));

    const subscription = await db.Subscription.create({
      userId,
      planId,
      startDate,
      endDate,
      isActive: true,
    });

    await db.ActivityLog.create({
      userId: req.user.id,
      action: 'assign_plan',
      resource: 'subscription',
      resourceId: subscription.id,
      details: { targetUserId: userId, planId },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return res.status(201).json({
      success: true,
      message: 'Plan assigned successfully',
      data: subscription,
    });
  } catch (error) {
    console.error('Assign plan error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to assign plan',
      error: error.message,
    });
  }
};

// Get user subscriptions
const getUserSubscriptions = async (req, res) => {
  try {
    const { userId } = req.params;

    const subscriptions = await db.Subscription.findAll({
      where: { userId },
      include: [{
        model: db.Plan,
        as: 'plan',
      }],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    console.error('Get user subscriptions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get subscriptions',
    });
  }
};

// Cancel subscription
const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await db.Subscription.findByPk(subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
    }

    await subscription.update({ isActive: false });

    await db.ActivityLog.create({
      userId: req.user.id,
      action: 'cancel_subscription',
      resource: 'subscription',
      resourceId: subscription.id,
      details: { targetUserId: subscription.userId },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
    });
  }
};

// Get user feature overrides
const getUserFeatureOverrides = async (req, res) => {
  try {
    const { userId } = req.params;

    const overrides = await db.FeatureOverride.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: overrides,
    });
  } catch (error) {
    console.error('Get feature overrides error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get feature overrides',
    });
  }
};

// Add feature override
const addFeatureOverride = async (req, res) => {
  try {
    const { userId } = req.params;
    const { featureKey, featureValue, expiresAt } = req.body;

    if (!featureKey) {
      return res.status(400).json({
        success: false,
        message: 'Feature key is required',
      });
    }

    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if override already exists
    const existing = await db.FeatureOverride.findOne({
      where: { userId, featureKey },
    });

    if (existing) {
      // Update existing
      await existing.update({
        featureValue: featureValue || null,
        expiresAt: expiresAt || null,
      });

      await db.ActivityLog.create({
        userId: req.user.id,
        action: 'update_feature_override',
        resource: 'feature_override',
        resourceId: existing.id,
        details: { targetUserId: userId, featureKey },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      return res.status(200).json({
        success: true,
        message: 'Feature override updated',
        data: existing,
      });
    }

    // Create new
    const override = await db.FeatureOverride.create({
      userId,
      featureKey,
      featureValue: featureValue || null,
      expiresAt: expiresAt || null,
    });

    await db.ActivityLog.create({
      userId: req.user.id,
      action: 'add_feature_override',
      resource: 'feature_override',
      resourceId: override.id,
      details: { targetUserId: userId, featureKey },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return res.status(201).json({
      success: true,
      message: 'Feature override added',
      data: override,
    });
  } catch (error) {
    console.error('Add feature override error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add feature override',
      error: error.message,
    });
  }
};

// Delete feature override
const deleteFeatureOverride = async (req, res) => {
  try {
    const { overrideId } = req.params;

    const override = await db.FeatureOverride.findByPk(overrideId);
    if (!override) {
      return res.status(404).json({
        success: false,
        message: 'Feature override not found',
      });
    }

    const targetUserId = override.userId;
    await override.destroy();

    await db.ActivityLog.create({
      userId: req.user.id,
      action: 'delete_feature_override',
      resource: 'feature_override',
      resourceId: overrideId,
      details: { targetUserId },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return res.status(200).json({
      success: true,
      message: 'Feature override deleted',
    });
  } catch (error) {
    console.error('Delete feature override error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete feature override',
    });
  }
};

// Get all posts (admin)
const getPosts = async (req, res) => {
  try {
    const { userId, status, caption, page = 1, limit = 20 } = req.query;

    const where = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (caption) where.caption = { [Op.like]: `%${caption}%` };

    const offset = (page - 1) * limit;

    const { count, rows: posts } = await db.Post.findAndCountAll({
      where,
      include: [{
        model: db.User,
        as: 'user',
        attributes: ['id', 'fullName', 'email'],
      }, {
        model: db.FacebookAccount,
        as: 'facebookAccount',
        attributes: ['id', 'fbUserId', 'fbUserName', 'isActive'],
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get posts',
    });
  }
};

// Get single post (admin)
const getPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await db.Post.findByPk(postId, {
      include: [{
        model: db.User,
        as: 'user',
        attributes: ['id', 'fullName', 'email'],
      }, {
        model: db.FacebookAccount,
        as: 'facebookAccount',
        attributes: ['id', 'fbUserId', 'fbUserName', 'isActive'],
      }],
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('Get post error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get post',
    });
  }
};

// Delete post (admin)
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await db.Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    await post.destroy();

    await db.ActivityLog.create({
      userId: req.user.id,
      action: 'admin_delete_post',
      resource: 'post',
      resourceId: postId,
      details: { targetUserId: post.userId },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Delete post error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete post',
    });
  }
};

// Get user stats
const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Count posts by status
    const postStats = await db.Post.findAll({
      where: { userId },
      attributes: [
        'status',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    const postsByStatus = postStats.reduce((acc, stat) => {
      acc[stat.status] = parseInt(stat.count);
      return acc;
    }, {});

    // Total posts
    const totalPosts = await db.Post.count({ where: { userId } });

    // Count subscriptions
    const totalSubscriptions = await db.Subscription.count({ where: { userId } });
    const activeSubscriptions = await db.Subscription.count({
      where: { userId, isActive: true },
    });

    // Count feature overrides
    const totalOverrides = await db.FeatureOverride.count({ where: { userId } });

    // Recent activity
    const recentActivity = await db.ActivityLog.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    return res.status(200).json({
      success: true,
      data: {
        posts: {
          total: totalPosts,
          byStatus: postsByStatus,
        },
        subscriptions: {
          total: totalSubscriptions,
          active: activeSubscriptions,
        },
        featureOverrides: {
          total: totalOverrides,
        },
        recentActivity,
      },
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get user stats',
    });
  }
};

module.exports = {
  getUsers,
  getUser,
  updateUser,
  resetUserPassword,
  deleteUser,
  getActivityLogs,
  getStats,
  assignPlanToUser,
  getUserSubscriptions,
  cancelSubscription,
  getUserFeatureOverrides,
  addFeatureOverride,
  deleteFeatureOverride,
  getPosts,
  getPost,
  deletePost,
  getUserStats,
};

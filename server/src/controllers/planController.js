const db = require('../models');

const parseFeatures = (features) => {
  if (features === undefined) return undefined;
  if (features === null || features === '') return null;
  if (typeof features === 'object') return features;
  try {
    return JSON.parse(features);
  } catch (error) {
    throw new Error('Features must be valid JSON');
  }
};

// Get all plans
exports.getPlans = async (req, res) => {
  try {
    const plans = await db.Plan.findAll({
      order: [['price', 'ASC']],
      include: [{
        model: db.Subscription,
        as: 'subscriptions',
        attributes: ['id'],
      }],
    });

    // Add subscriber count
    const plansWithCount = plans.map(plan => ({
      ...plan.toJSON(),
      subscriberCount: plan.subscriptions?.length || 0,
    }));

    res.json({
      success: true,
      data: plansWithCount,
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get plans',
      error: error.message,
    });
  }
};

// Get single plan
exports.getPlan = async (req, res) => {
  try {
    const { planId } = req.params;

    const plan = await db.Plan.findByPk(planId, {
      include: [{
        model: db.Subscription,
        as: 'subscriptions',
        attributes: ['id', 'userId', 'startDate', 'endDate', 'isActive'],
        include: [{
          model: db.User,
          as: 'user',
          attributes: ['id', 'fullName', 'email'],
        }],
      }],
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    res.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get plan',
      error: error.message,
    });
  }
};

// Create plan
exports.createPlan = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      durationDays,
      maxPosts,
      maxFbAccounts,
      features,
      isActive,
    } = req.body;

    // Validate required fields
    if (!name || price === undefined || !durationDays) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, price, durationDays',
      });
    }

    // Check if plan name already exists
    const existingPlan = await db.Plan.findOne({ where: { name } });
    if (existingPlan) {
      return res.status(400).json({
        success: false,
        message: 'Plan name already exists',
      });
    }

    let parsedFeatures;
    try {
      parsedFeatures = parseFeatures(features);
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    const plan = await db.Plan.create({
      name,
      description,
      price,
      durationDays,
      maxPosts: maxPosts || 0,
      maxFbAccounts: maxFbAccounts || 1,
      features: parsedFeatures === undefined ? null : parsedFeatures,
      isActive: isActive !== undefined ? isActive : true,
    });

    await db.ActivityLog.create({
      userId: req.user.id,
      action: 'create_plan',
      resource: 'plan',
      resourceId: plan.id,
      details: { name },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      success: true,
      message: 'Plan created successfully',
      data: plan,
    });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create plan',
      error: error.message,
    });
  }
};

// Update plan
exports.updatePlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const {
      name,
      description,
      price,
      durationDays,
      maxPosts,
      maxFbAccounts,
      features,
      isActive,
    } = req.body;

    const plan = await db.Plan.findByPk(planId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    // Check if new name conflicts with existing plan
    if (name && name !== plan.name) {
      const existingPlan = await db.Plan.findOne({ where: { name } });
      if (existingPlan) {
        return res.status(400).json({
          success: false,
          message: 'Plan name already exists',
        });
      }
    }

    let parsedFeatures;
    try {
      parsedFeatures = parseFeatures(features);
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    await plan.update({
      name: name || plan.name,
      description: description !== undefined ? description : plan.description,
      price: price !== undefined ? price : plan.price,
      durationDays: durationDays || plan.durationDays,
      maxPosts: maxPosts !== undefined ? maxPosts : plan.maxPosts,
      maxFbAccounts: maxFbAccounts !== undefined ? maxFbAccounts : plan.maxFbAccounts,
      features: parsedFeatures !== undefined ? parsedFeatures : plan.features,
      isActive: isActive !== undefined ? isActive : plan.isActive,
    });

    await db.ActivityLog.create({
      userId: req.user.id,
      action: 'update_plan',
      resource: 'plan',
      resourceId: plan.id,
      details: { name: plan.name },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Plan updated successfully',
      data: plan,
    });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update plan',
      error: error.message,
    });
  }
};

// Delete plan
exports.deletePlan = async (req, res) => {
  try {
    const { planId } = req.params;

    const plan = await db.Plan.findByPk(planId, {
      include: [{
        model: db.Subscription,
        as: 'subscriptions',
      }],
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    // Check if plan has active subscriptions
    const activeSubscriptions = plan.subscriptions?.filter(
      sub => sub.isActive
    );

    if (activeSubscriptions && activeSubscriptions.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete plan with ${activeSubscriptions.length} active subscriptions`,
      });
    }

    await plan.destroy();

    await db.ActivityLog.create({
      userId: req.user.id,
      action: 'delete_plan',
      resource: 'plan',
      resourceId: planId,
      details: { name: plan.name },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Plan deleted successfully',
    });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete plan',
      error: error.message,
    });
  }
};

// Toggle plan active status
exports.togglePlanStatus = async (req, res) => {
  try {
    const { planId } = req.params;

    const plan = await db.Plan.findByPk(planId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    await plan.update({
      isActive: !plan.isActive,
    });

    await db.ActivityLog.create({
      userId: req.user.id,
      action: 'toggle_plan',
      resource: 'plan',
      resourceId: plan.id,
      details: { isActive: plan.isActive },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: `Plan ${plan.isActive ? 'activated' : 'deactivated'} successfully`,
      data: plan,
    });
  } catch (error) {
    console.error('Toggle plan status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle plan status',
      error: error.message,
    });
  }
};

const { Op } = require('sequelize');
const db = require('../models');

const parseJson = (value, fallback = null) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

const normalizeFeatureValue = (value) => {
  const parsed = parseJson(value, value);
  if (parsed === 'true') return true;
  if (parsed === 'false') return false;
  return parsed;
};

const featuresToObject = (features) => {
  const parsed = parseJson(features, features);
  if (!parsed) return {};
  if (Array.isArray(parsed)) return { labels: parsed };
  if (typeof parsed === 'object') return parsed;
  return {};
};

const getFreePlan = async () => db.Plan.findOne({
  where: db.sequelize.where(
    db.sequelize.fn('LOWER', db.sequelize.col('name')),
    'free'
  ),
});

const getActiveSubscription = async (userId) => {
  const now = new Date();
  return db.Subscription.findOne({
    where: {
      userId,
      isActive: true,
      endDate: { [Op.gte]: now },
    },
    include: [{ model: db.Plan, as: 'plan' }],
    order: [['createdAt', 'DESC']],
  });
};

const getUserPlanContext = async (userId) => {
  let subscription = await getActiveSubscription(userId);
  let plan = subscription?.plan || null;

  if (!plan) {
    plan = await getFreePlan();
  }

  const planName = (plan?.name || 'Free').toLowerCase();
  const isFree = planName === 'free' || Number(plan?.price || 0) === 0;
  const planFeatures = featuresToObject(plan?.features);

  const overrides = await db.FeatureOverride.findAll({
    where: {
      userId,
      [Op.or]: [
        { expiresAt: null },
        { expiresAt: { [Op.gt]: new Date() } },
      ],
    },
  });

  const overrideMap = {};
  overrides.forEach((override) => {
    overrideMap[override.featureKey] = normalizeFeatureValue(override.featureValue);
  });

  const baseCanEditCard2 = planFeatures.can_edit_card_2 !== undefined
    ? Boolean(planFeatures.can_edit_card_2)
    : !isFree;

  const permissions = {
    can_edit_card_2: overrideMap.can_edit_card_2 !== undefined
      ? Boolean(overrideMap.can_edit_card_2)
      : baseCanEditCard2,
    max_posts: overrideMap.max_posts !== undefined
      ? Number(overrideMap.max_posts)
      : Number(plan?.maxPosts || 0),
    max_fb_accounts: overrideMap.max_fb_accounts !== undefined
      ? Number(overrideMap.max_fb_accounts)
      : Number(plan?.maxFbAccounts || 1),
  };

  return {
    subscription,
    plan,
    planFeatures,
    overrides,
    permissions,
    explicitCard2Override: overrideMap.can_edit_card_2 !== undefined,
    isFree,
    isPremium: !isFree,
  };
};

const getCardSettings = async () => {
  const settings = await db.CardSettings.findAll({ order: [['cardIndex', 'ASC']] });
  if (settings.length >= 2) return settings;

  const existingIndexes = new Set(settings.map((card) => card.cardIndex));
  if (!existingIndexes.has(1)) {
    await db.CardSettings.create({ cardIndex: 1, isLockedForFree: false, isLockedForPremium: false });
  }
  if (!existingIndexes.has(2)) {
    await db.CardSettings.create({
      cardIndex: 2,
      isLockedForFree: true,
      isLockedForPremium: false,
      defaultTitle: 'Card 2 mặc định',
      defaultDescription: 'Nội dung Card 2 do admin quản lý',
      defaultLinkUrl: 'https://example.com',
    });
  }
  return db.CardSettings.findAll({ order: [['cardIndex', 'ASC']] });
};

const canEditCard2 = async (userId) => {
  const context = await getUserPlanContext(userId);
  const card2 = await db.CardSettings.findOne({ where: { cardIndex: 2 } });

  if (!card2?.isEnabled) {
    return { allowed: false, reason: 'Card 2 is disabled', context, card2 };
  }

  if (context.explicitCard2Override) {
    return {
      allowed: Boolean(context.permissions.can_edit_card_2),
      reason: context.permissions.can_edit_card_2 ? null : 'User override disables Card 2 editing',
      context,
      card2,
    };
  }

  if (context.isFree && card2.isLockedForFree) {
    return { allowed: false, reason: 'Card 2 is locked for free users', context, card2 };
  }

  if (context.isPremium && card2.isLockedForPremium) {
    return { allowed: false, reason: 'Card 2 is locked for premium users', context, card2 };
  }

  if (!context.permissions.can_edit_card_2) {
    return { allowed: false, reason: 'Plan does not allow editing Card 2', context, card2 };
  }

  return { allowed: true, reason: null, context, card2 };
};

const canUseCard = async (userId, cardIndex) => {
  const context = await getUserPlanContext(userId);
  const card = await db.CardSettings.findOne({ where: { cardIndex } });

  if (!card?.isEnabled) {
    return { allowed: false, reason: `Card ${cardIndex} is disabled`, context, card };
  }

  if (context.isFree && card.isLockedForFree) {
    return { allowed: false, reason: `Card ${cardIndex} is locked for free users`, context, card };
  }

  if (context.isPremium && card.isLockedForPremium) {
    return { allowed: false, reason: `Card ${cardIndex} is locked for premium users`, context, card };
  }

  return { allowed: true, reason: null, context, card };
};

module.exports = {
  parseJson,
  featuresToObject,
  getFreePlan,
  getActiveSubscription,
  getUserPlanContext,
  getCardSettings,
  canEditCard2,
  canUseCard,
};

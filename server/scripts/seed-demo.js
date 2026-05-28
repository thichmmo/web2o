const db = require('../src/models');
const ensureDevSchema = require('./ensure-dev-schema');

const demoPassword = 'Demo@123456';
const adminPassword = 'Admin@123456';

const planDefinitions = [
  {
    name: 'Free',
    description: 'Free demo plan',
    price: 0,
    durationDays: 30,
    maxPosts: 10,
    maxFbAccounts: 1,
    features: { can_edit_card_2: false, scheduled_posts: false },
  },
  {
    name: 'Basic',
    description: 'Basic demo plan',
    price: 99000,
    durationDays: 30,
    maxPosts: 50,
    maxFbAccounts: 3,
    features: { can_edit_card_2: true, scheduled_posts: true },
  },
  {
    name: 'Pro',
    description: 'Pro demo plan',
    price: 299000,
    durationDays: 30,
    maxPosts: 200,
    maxFbAccounts: 10,
    features: { can_edit_card_2: true, scheduled_posts: true, analytics: true },
  },
  {
    name: 'Enterprise',
    description: 'Enterprise demo plan',
    price: 999000,
    durationDays: 30,
    maxPosts: 999999,
    maxFbAccounts: 999999,
    features: { can_edit_card_2: true, scheduled_posts: true, analytics: true, api_access: true },
  },
];

const users = [
  { email: 'admin@thichcuu.com', fullName: 'Admin Thich Cuu', role: 'admin', plan: 'Pro', password: adminPassword },
  { email: 'free.user@example.test', fullName: 'Free Demo User', role: 'user', plan: 'Free', password: demoPassword },
  { email: 'premium.user@example.test', fullName: 'Premium Demo User', role: 'user', plan: 'Pro', password: demoPassword },
];

async function upsertPlan(definition) {
  const [plan] = await db.Plan.findOrCreate({
    where: { name: definition.name },
    defaults: definition,
  });
  await plan.update(definition);
  return plan;
}

async function upsertUser(definition, plansByName) {
  const [user, created] = await db.User.findOrCreate({
    where: { email: definition.email },
    defaults: {
      email: definition.email,
      password: definition.password,
      fullName: definition.fullName,
      role: definition.role,
      isActive: true,
    },
  });

  if (!created) {
    await user.update({
      fullName: definition.fullName,
      password: definition.password,
      role: definition.role,
      isActive: true,
    });
  }

  const plan = plansByName[definition.plan];
  if (plan) {
    await db.Subscription.update(
      { isActive: false },
      { where: { userId: user.id, isActive: true } }
    );
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);
    await db.Subscription.create({
      userId: user.id,
      planId: plan.id,
      startDate,
      endDate,
      isActive: true,
    });
  }

  return user;
}

async function seedDemo() {
  await ensureDevSchema();
  const plansByName = {};
  for (const definition of planDefinitions) {
    const plan = await upsertPlan(definition);
    plansByName[plan.name] = plan;
  }

  const usersByEmail = {};
  for (const definition of users) {
    const user = await upsertUser(definition, plansByName);
    usersByEmail[user.email] = user;
  }

  await db.FeatureOverride.destroy({
    where: {
      userId: Object.values(usersByEmail).map((user) => user.id),
    },
  });

  await db.CardSettings.update(
    {
      isEnabled: true,
      isLockedForFree: false,
      isLockedForPremium: false,
      allowedMediaTypes: ['image', 'video'],
      maxFileSizeMb: 500,
    },
    { where: { cardIndex: 1 } }
  );

  await db.CardSettings.update(
    {
      isEnabled: true,
      isLockedForFree: true,
      isLockedForPremium: false,
      allowedMediaTypes: ['image', 'video'],
      maxFileSizeMb: 500,
      defaultMediaUrl: '/uploads/card-defaults/dev-card2.png',
      defaultTitle: 'Admin default Card 2',
      defaultDescription: 'Default Card 2 for users without permission',
      defaultLinkUrl: 'https://example.com/demo-card-2',
    },
    { where: { cardIndex: 2 } }
  );

  for (const user of Object.values(usersByEmail)) {
    const [account] = await db.FacebookAccount.findOrCreate({
      where: { userId: user.id, fbUserId: `dev-${user.id.substring(0, 8)}` },
      defaults: {
        fbUserName: `${user.fullName} Dev Facebook`,
        accessToken: `dev_mock_${user.id}`,
        tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    });
    await account.update({ accessToken: `dev_mock_${user.id}`, isActive: true });

    const [adAccount] = await db.FacebookAdAccount.findOrCreate({
      where: {
        userId: user.id,
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
    await adAccount.update({
      adAccountName: 'Dev Mock Ad Account',
      accountStatus: 'ACTIVE',
      currency: 'USD',
      timezoneName: 'Etc/UTC',
      isActive: true,
    });
  }

  await db.ActivityLog.create({
    userId: usersByEmail['admin@thichcuu.com'].id,
    action: 'seed_demo',
    resource: 'system',
    details: { accounts: users.map((user) => user.email) },
  });

  console.log('Demo seed complete');
  console.log(`Admin password: ${adminPassword}`);
  console.log(`Free/Premium demo password: ${demoPassword}`);
}

if (require.main === module) {
  seedDemo()
    .then(async () => {
      await db.sequelize.close();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error('Demo seed failed:', error);
      await db.sequelize.close();
      process.exit(1);
    });
}

module.exports = seedDemo;

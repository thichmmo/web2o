const request = require('supertest');
const fs = require('fs');
const path = require('path');

process.env.RATE_LIMIT_WINDOW_MS = process.env.RATE_LIMIT_WINDOW_MS || '60000';
process.env.RATE_LIMIT_MAX_REQUESTS = '100';

const app = require('../src/app');
const db = require('../src/models');
const seedDemo = require('../scripts/seed-demo');
const facebookService = require('../src/services/facebookService');
const { isUsableAdAccountStatus } = require('../src/services/facebookAccountSyncService');

jest.setTimeout(60000);

const login = async (email, password = 'Demo@123456') => {
  const response = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password });
  expect(response.status).toBe(200);
  return response.body.data;
};

const tinyPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
  'base64'
);

describe('QA security and permission flows', () => {
  let admin;
  let free;
  let premium;
  let freeAccount;
  let premiumAccount;
  let premiumAdAccount;
  let premiumPostId;

  beforeAll(async () => {
    await seedDemo();
    admin = await login('admin@thichcuu.com', 'Admin@123456');
    free = await login('free.user@example.test');
    premium = await login('premium.user@example.test');

    const freeAccounts = await request(app)
      .get('/api/v1/facebook/accounts')
      .set('Authorization', `Bearer ${free.token}`);
    freeAccount = freeAccounts.body.data.accounts.find((account) => account.fbUserId.startsWith('dev-'))
      || freeAccounts.body.data.accounts[0];

    const premiumAccounts = await request(app)
      .get('/api/v1/facebook/accounts')
      .set('Authorization', `Bearer ${premium.token}`);
    premiumAccount = premiumAccounts.body.data.accounts.find((account) => account.fbUserId.startsWith('dev-'))
      || premiumAccounts.body.data.accounts[0];

    const premiumAdAccounts = await request(app)
      .get(`/api/v1/facebook/accounts/${premiumAccount.id}/ad-accounts`)
      .set('Authorization', `Bearer ${premium.token}`);
    premiumAdAccount = premiumAdAccounts.body.data.adAccounts[0];
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  test('protected and admin APIs enforce auth and RBAC', async () => {
    await request(app).get('/api/v1/admin/users').expect(401);

    await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${free.token}`)
      .expect(403);

    const adminUsers = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);

    expect(JSON.stringify(adminUsers.body)).not.toContain('password');
  });

  test('public landing APIs expose branding and active plans without auth', async () => {
    const branding = await request(app)
      .get('/api/v1/settings/public')
      .expect(200);
    expect(branding.body.data.branding.site_name).toBeTruthy();
    expect(JSON.stringify(branding.body)).not.toContain('smtp_password');
    expect(JSON.stringify(branding.body)).not.toContain('password');

    const plans = await request(app)
      .get('/api/v1/public/plans')
      .expect(200);
    expect(plans.body.data.plans.length).toBeGreaterThan(0);
    expect(plans.body.data.plans[0]).toHaveProperty('name');
    expect(JSON.stringify(plans.body)).not.toContain('password');
    expect(JSON.stringify(plans.body)).not.toContain('accessToken');
  });

  test('invalid token and inactive users are blocked', async () => {
    await request(app)
      .get('/api/v1/auth/profile')
      .set('Authorization', 'Bearer invalid.token.value')
      .expect(401);

    const user = await db.User.findOne({ where: { email: 'free.user@example.test' } });
    await user.update({ isActive: false });
    await request(app)
      .get('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${free.token}`)
      .expect(403);
    await user.update({ isActive: true });
  });

  test('Facebook and admin post responses never expose raw tokens', async () => {
    const accounts = await request(app)
      .get('/api/v1/facebook/accounts')
      .set('Authorization', `Bearer ${free.token}`)
      .expect(200);
    expect(JSON.stringify(accounts.body)).not.toContain('accessToken');
    expect(JSON.stringify(accounts.body)).not.toContain('dev_mock_');

    const adminPosts = await request(app)
      .get('/api/v1/admin/posts')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    expect(JSON.stringify(adminPosts.body)).not.toContain('accessToken');
    expect(JSON.stringify(adminPosts.body)).not.toContain(`dev_mock_${free.user.id}`);
    expect(JSON.stringify(adminPosts.body)).not.toContain(`dev_mock_${premium.user.id}`);
  });

  test('manual Facebook token connect stores token without exposing it', async () => {
    const manualToken = `dev_token_manual_${Date.now()}`;

    const connectResponse = await request(app)
      .post('/api/v1/facebook/token-connect')
      .set('Authorization', `Bearer ${free.token}`)
      .send({ accessToken: manualToken })
      .expect(201);

    expect(JSON.stringify(connectResponse.body)).not.toContain(manualToken);
    expect(JSON.stringify(connectResponse.body)).not.toContain('accessToken');

    const accounts = await request(app)
      .get('/api/v1/facebook/accounts')
      .set('Authorization', `Bearer ${free.token}`)
      .expect(200);

    expect(JSON.stringify(accounts.body)).not.toContain(manualToken);
    expect(JSON.stringify(accounts.body)).not.toContain('accessToken');
    expect(accounts.body.data.accounts.some((account) => account.fbUserId.startsWith('manual-'))).toBe(true);
  });

  test('Facebook ad accounts are available without exposing tokens', async () => {
    const response = await request(app)
      .get(`/api/v1/facebook/accounts/${premiumAccount.id}/ad-accounts`)
      .set('Authorization', `Bearer ${premium.token}`)
      .expect(200);

    expect(response.body.data.adAccounts.length).toBeGreaterThan(0);
    expect(response.body.data.adAccounts[0].adAccountId).toBe('act_dev_mock_1');
    expect(JSON.stringify(response.body)).not.toContain('accessToken');
    expect(JSON.stringify(response.body)).not.toContain(`dev_mock_${premium.user.id}`);
  });

  test('SMTP password is accepted but masked on read', async () => {
    await request(app)
      .put('/api/v1/settings')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ settings: { smtp_password: 'dev-smtp-secret' } })
      .expect(200);

    const response = await request(app)
      .get('/api/v1/settings')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);

    expect(response.body.data.settings.smtp_password.value).toBe('********');
    expect(JSON.stringify(response.body)).not.toContain('dev-smtp-secret');
  });

  test('public branding settings and uploaded assets are readable without exposing secrets', async () => {
    const siteName = `QA Branding ${Date.now()}`;
    const before = await request(app)
      .get('/api/v1/settings')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    const original = before.body.data.settings;

    try {
      await request(app)
        .put('/api/v1/settings')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ settings: { site_name: siteName, primary_color: '#123456' } })
        .expect(200);

      const publicSettings = await request(app)
        .get('/api/v1/settings/public')
        .expect(200);

      expect(publicSettings.body.data.branding.site_name).toBe(siteName);
      expect(publicSettings.body.data.branding.primary_color).toBe('#123456');
      expect(JSON.stringify(publicSettings.body)).not.toContain('smtp_password');
      expect(JSON.stringify(publicSettings.body)).not.toContain('dev-smtp-secret');

      const upload = await request(app)
        .post('/api/v1/settings/upload-branding')
        .set('Authorization', `Bearer ${admin.token}`)
        .field('type', 'logo')
        .attach('file', tinyPng, { filename: 'brand-logo.png', contentType: 'image/png' })
        .expect(200);

      await request(app)
        .get(upload.body.data.filePath)
        .expect(200)
        .expect('Content-Type', /image\/png/);
    } finally {
      await request(app)
        .put('/api/v1/settings')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          settings: {
            site_name: original.site_name?.value || 'Thich Cuu - Facebook Tool',
            primary_color: original.primary_color?.value || '#2563eb',
            site_logo: original.site_logo?.value || '',
          },
        })
        .expect(200);
    }
  });

  test('free user Card 2 payload is ignored and admin defaults are applied', async () => {
    const response = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${free.token}`)
      .field('fbAccountId', freeAccount.id)
      .field('targetType', 'profile')
      .field('targetId', freeAccount.fbUserId)
      .field('caption', 'Free user post')
      .field('card1Title', 'Card 1')
      .field('card1LinkUrl', 'https://example.com/card-1')
      .field('card2Title', 'Forbidden custom Card 2')
      .field('card2LinkUrl', 'https://example.com/forbidden')
      .attach('card1Media', tinyPng, { filename: 'card1.png', contentType: 'image/png' })
      .expect(201);

    expect(response.body.data.card2Ignored).toBe(true);
    expect(response.body.data.post.card2ManagedByAdmin).toBe(true);
    expect(response.body.data.post.card2Title).toBe('Admin default Card 2');
  });

  test('premium user can edit Card 2 when plan permission is enabled', async () => {
    const response = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${premium.token}`)
      .field('fbAccountId', premiumAccount.id)
      .field('targetType', 'profile')
      .field('targetId', premiumAccount.fbUserId)
      .field('caption', 'Premium user post')
      .field('card1Title', 'Card 1')
      .field('card1LinkUrl', 'https://example.com/card-1')
      .field('card2Title', 'Premium custom Card 2')
      .field('card2LinkUrl', 'https://example.com/card-2')
      .attach('card1Media', tinyPng, { filename: 'card1.png', contentType: 'image/png' })
      .attach('card2Media', tinyPng, { filename: 'card2.png', contentType: 'image/png' })
      .expect(201);

    premiumPostId = response.body.data.post.id;
    expect(response.body.data.card2Ignored).toBe(false);
    expect(response.body.data.post.card2ManagedByAdmin).toBe(false);
    expect(response.body.data.post.card2Title).toBe('Premium custom Card 2');
  });

  test('card locks and allowed media type settings are enforced by backend', async () => {
    const card1 = await db.CardSettings.findOne({ where: { cardIndex: 1 } });
    const card2 = await db.CardSettings.findOne({ where: { cardIndex: 2 } });
    const originalCard1 = {
      isEnabled: card1.isEnabled,
      isLockedForFree: card1.isLockedForFree,
      isLockedForPremium: card1.isLockedForPremium,
      allowedMediaTypes: card1.allowedMediaTypes,
      maxFileSizeMb: card1.maxFileSizeMb,
    };
    const originalCard2 = {
      isEnabled: card2.isEnabled,
      isLockedForFree: card2.isLockedForFree,
      isLockedForPremium: card2.isLockedForPremium,
      allowedMediaTypes: card2.allowedMediaTypes,
      maxFileSizeMb: card2.maxFileSizeMb,
    };

    try {
      await card1.update({ isLockedForFree: true, allowedMediaTypes: ['image', 'video'] });
      const lockedCard1Response = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${free.token}`)
        .field('fbAccountId', freeAccount.id)
        .field('targetType', 'profile')
        .field('targetId', freeAccount.fbUserId)
        .field('caption', 'Locked Card 1')
        .attach('card1Media', tinyPng, { filename: 'card1.png', contentType: 'image/png' })
        .expect(400);
      expect(lockedCard1Response.body.message).toContain('Card 1 is locked for free users');

      await card1.update({ isLockedForFree: false, allowedMediaTypes: ['image'] });
      const videoCard1Response = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${premium.token}`)
        .field('fbAccountId', premiumAccount.id)
        .field('targetType', 'profile')
        .field('targetId', premiumAccount.fbUserId)
        .field('caption', 'Blocked video Card 1')
        .attach('card1Media', Buffer.from('fake mp4'), { filename: 'card1.mp4', contentType: 'video/mp4' })
        .expect(400);
      expect(videoCard1Response.body.message).toContain('Card 1 media type is not allowed');

      await card1.update({ allowedMediaTypes: ['image', 'video'] });
      await card2.update({ isLockedForPremium: true, allowedMediaTypes: ['image', 'video'] });
      const lockedPremiumCard2 = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${premium.token}`)
        .field('fbAccountId', premiumAccount.id)
        .field('targetType', 'profile')
        .field('targetId', premiumAccount.fbUserId)
        .field('caption', 'Locked premium Card 2')
        .field('card2Title', 'Should not persist')
        .attach('card1Media', tinyPng, { filename: 'card1.png', contentType: 'image/png' })
        .attach('card2Media', tinyPng, { filename: 'card2.png', contentType: 'image/png' })
        .expect(201);
      expect(lockedPremiumCard2.body.data.card2Ignored).toBe(true);
      expect(lockedPremiumCard2.body.data.post.card2ManagedByAdmin).toBe(true);
      expect(lockedPremiumCard2.body.data.post.card2Title).not.toBe('Should not persist');

      await card2.update({ isLockedForPremium: false, allowedMediaTypes: ['image'] });
      const videoCard2Response = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${premium.token}`)
        .field('fbAccountId', premiumAccount.id)
        .field('targetType', 'profile')
        .field('targetId', premiumAccount.fbUserId)
        .field('caption', 'Blocked video Card 2')
        .attach('card1Media', tinyPng, { filename: 'card1.png', contentType: 'image/png' })
        .attach('card2Media', Buffer.from('fake mp4'), { filename: 'card2.mp4', contentType: 'video/mp4' })
        .expect(400);
      expect(videoCard2Response.body.message).toContain('Card 2 media type is not allowed');

      const defaultVideoResponse = await request(app)
        .post('/api/v1/admin/card-settings/2/default-media')
        .set('Authorization', `Bearer ${admin.token}`)
        .attach('file', Buffer.from('fake mp4'), { filename: 'default.mp4', contentType: 'video/mp4' })
        .expect(400);
      expect(defaultVideoResponse.body.message).toContain('default media type is not allowed');
    } finally {
      await card1.update(originalCard1);
      await card2.update(originalCard2);
    }
  });

  test('page posts require an owned ad account and publish through the dev ad account flow', async () => {
    await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${premium.token}`)
      .field('fbAccountId', premiumAccount.id)
      .field('targetType', 'page')
      .field('targetId', 'mock-page-1')
      .field('caption', 'Missing ad account')
      .attach('card1Media', tinyPng, { filename: 'card1.png', contentType: 'image/png' })
      .expect(400);

    const response = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${premium.token}`)
      .field('fbAccountId', premiumAccount.id)
      .field('targetType', 'page')
      .field('targetId', 'mock-page-1')
      .field('adAccountId', premiumAdAccount.adAccountId)
      .field('caption', 'Premium page post')
      .field('card1Title', 'Card 1')
      .field('card1LinkUrl', 'https://example.com/card-1')
      .field('card2Title', 'Premium Card 2')
      .field('card2LinkUrl', 'https://example.com/card-2')
      .field('publishNow', 'true')
      .attach('card1Media', tinyPng, { filename: 'card1.png', contentType: 'image/png' })
      .attach('card2Media', tinyPng, { filename: 'card2.png', contentType: 'image/png' })
      .expect(200);

    expect(response.body.data.post.status).toBe('published');
    expect(response.body.data.post.adAccountId).toBe('act_dev_mock_1');
    expect(response.body.data.post.fbPostUrl).toContain('https://facebook.test/posts/dev_mock_post_');
    expect(response.body.data.fbPostUrl).toContain('https://facebook.test/posts/dev_mock_post_');
    expect(response.body.data.post.facebookCreativeId).toContain('dev_mock_creative_');
    expect(JSON.stringify(response.body)).not.toContain('accessToken');
    expect(JSON.stringify(response.body)).not.toContain(`dev_mock_${premium.user.id}`);
  });

  test('Facebook publish resolves public upload paths inside the server uploads directory', () => {
    const uploadsDir = path.resolve(__dirname, '../uploads/posts');
    const filename = `resolve-test-${Date.now()}.png`;
    const absolutePath = path.join(uploadsDir, filename);
    fs.mkdirSync(uploadsDir, { recursive: true });
    fs.writeFileSync(absolutePath, tinyPng);

    const resolved = facebookService.resolveMediaPath(`/uploads/posts/${filename}`);
    expect(resolved.path).toBe(absolutePath);

    fs.unlinkSync(absolutePath);
  });

  test('Facebook video carousel cards include image_hash thumbnails and inactive ad statuses are blocked', () => {
    const attachment = facebookService.buildChildAttachment(
      { linkUrl: 'https://example.com', title: 'Video card' },
      { type: 'video', id: 'video_1' },
      'page_1',
      { fallbackImageHash: 'image_hash_1' }
    );

    expect(attachment.video_id).toBe('video_1');
    expect(attachment.image_hash).toBe('image_hash_1');
    expect(isUsableAdAccountStatus('1')).toBe(true);
    expect(isUsableAdAccountStatus('ACTIVE')).toBe(true);
    expect(isUsableAdAccountStatus('101')).toBe(false);
  });

  test('user cannot read another user post', async () => {
    await request(app)
      .get(`/api/v1/posts/${premiumPostId}`)
      .set('Authorization', `Bearer ${free.token}`)
      .expect(404);
  });

  test('feature override affects Card 2 permission', async () => {
    const overrideResponse = await request(app)
      .post(`/api/v1/admin/users/${free.user.id}/feature-overrides`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ featureKey: 'can_edit_card_2', featureValue: true })
      .expect(201);

    const permissions = await request(app)
      .get('/api/v1/user/card-settings')
      .set('Authorization', `Bearer ${free.token}`)
      .expect(200);

    expect(permissions.body.data.card2.canEdit).toBe(true);

    await request(app)
      .delete(`/api/v1/admin/feature-overrides/${overrideResponse.body.data.id}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
  });

  test('admin can reset a user password without leaking password data', async () => {
    const email = `reset-target-${Date.now()}@example.test`;
    const targetUser = await db.User.create({
      email,
      password: 'OldPass@123',
      fullName: 'Reset Target',
      role: 'user',
      isActive: true,
    });

    const blockedResponse = await request(app)
      .post(`/api/v1/admin/users/${targetUser.id}/reset-password`)
      .set('Authorization', `Bearer ${free.token}`)
      .send({ newPassword: 'NewPass@123' })
      .expect(403);
    expect(JSON.stringify(blockedResponse.body)).not.toContain('NewPass@123');

    const resetResponse = await request(app)
      .post(`/api/v1/admin/users/${targetUser.id}/reset-password`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ newPassword: 'NewPass@123' })
      .expect(200);

    const resetBody = JSON.stringify(resetResponse.body);
    expect(resetBody).not.toContain('NewPass@123');
    expect(resetBody).not.toContain('OldPass@123');
    expect(resetBody).not.toContain('password');

    await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'NewPass@123' })
      .expect(200);

    await targetUser.destroy();
  });

  test('invalid upload type is rejected', async () => {
    await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${free.token}`)
      .field('fbAccountId', freeAccount.id)
      .field('targetType', 'profile')
      .field('targetId', freeAccount.fbUserId)
      .field('caption', 'Bad upload')
      .attach('card1Media', Buffer.from('not an image'), { filename: 'bad.txt', contentType: 'text/plain' })
      .expect(400);
  });

  test('oversized branding upload is rejected', async () => {
    const oversizedImage = Buffer.alloc((5 * 1024 * 1024) + 1, 0);

    await request(app)
      .post('/api/v1/settings/upload-branding')
      .set('Authorization', `Bearer ${admin.token}`)
      .field('type', 'logo')
      .attach('file', oversizedImage, { filename: 'large-logo.png', contentType: 'image/png' })
      .expect(400);
  });

  test('rate limit blocks excessive API calls', async () => {
    let sawRateLimit = false;

    for (let index = 0; index < 120; index += 1) {
      const response = await request(app).get('/api/v1/auth/profile');
      if (response.status === 429) {
        sawRateLimit = true;
        break;
      }
    }

    expect(sawRateLimit).toBe(true);
  });
});

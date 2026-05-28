# TESTING PLAN - THÍCH CỪU FACEBOOK VIDEO 2 Ô TOOL

## 1. TỔNG QUAN

**Mục tiêu:** Đảm bảo chất lượng code, phát hiện bugs sớm, đảm bảo hệ thống hoạt động đúng.

**Test Pyramid:**
```
        /\
       /  \      E2E Tests (10%)
      /____\
     /      \    Integration Tests (30%)
    /________\
   /          \  Unit Tests (60%)
  /____________\
```

**Coverage Target:** >80% code coverage

---

## 2. UNIT TESTS

### 2.1. Backend Unit Tests

**Framework:** Jest

**Coverage:** >80%

**Test suites:**

#### Auth Service
```javascript
describe('AuthService', () => {
  describe('register', () => {
    it('should create user with hashed password', async () => {
      const user = await authService.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test@123',
        full_name: 'Test User'
      });
      
      expect(user.id).toBeDefined();
      expect(user.password_hash).not.toBe('Test@123');
      expect(await bcrypt.compare('Test@123', user.password_hash)).toBe(true);
    });
    
    it('should throw error if email exists', async () => {
      await expect(authService.register({
        email: 'existing@example.com'
      })).rejects.toThrow('EMAIL_EXISTS');
    });
  });
  
  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const result = await authService.login({
        email: 'test@example.com',
        password: 'Test@123'
      });
      
      expect(result.access_token).toBeDefined();
      expect(result.refresh_token).toBeDefined();
      expect(result.user).toBeDefined();
    });
    
    it('should throw error for invalid password', async () => {
      await expect(authService.login({
        email: 'test@example.com',
        password: 'WrongPass'
      })).rejects.toThrow('INVALID_CREDENTIALS');
    });
  });
});
```

#### Encryption Service
```javascript
describe('EncryptionService', () => {
  describe('encryptToken', () => {
    it('should encrypt token', () => {
      const token = 'EAAxxxxxxxxxxxxx';
      const encrypted = encryptionService.encryptToken(token);
      
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(token);
      expect(encrypted.split(':')).toHaveLength(3); // iv:authTag:encrypted
    });
  });
  
  describe('decryptToken', () => {
    it('should decrypt token correctly', () => {
      const token = 'EAAxxxxxxxxxxxxx';
      const encrypted = encryptionService.encryptToken(token);
      const decrypted = encryptionService.decryptToken(encrypted);
      
      expect(decrypted).toBe(token);
    });
    
    it('should throw error for tampered data', () => {
      const encrypted = 'invalid:data:here';
      expect(() => encryptionService.decryptToken(encrypted)).toThrow();
    });
  });
});
```

#### Validation Utils
```javascript
describe('Validators', () => {
  describe('validateEmail', () => {
    it('should accept valid emails', () => {
      expect(validators.validateEmail('test@example.com')).toBe(true);
      expect(validators.validateEmail('user+tag@domain.co.uk')).toBe(true);
    });
    
    it('should reject invalid emails', () => {
      expect(validators.validateEmail('invalid')).toBe(false);
      expect(validators.validateEmail('@example.com')).toBe(false);
      expect(validators.validateEmail('test@')).toBe(false);
    });
  });
  
  describe('validatePassword', () => {
    it('should accept strong passwords', () => {
      expect(validators.validatePassword('Test@123')).toBe(true);
      expect(validators.validatePassword('MyP@ssw0rd')).toBe(true);
    });
    
    it('should reject weak passwords', () => {
      expect(validators.validatePassword('short')).toBe(false);
      expect(validators.validatePassword('alllowercase')).toBe(false);
      expect(validators.validatePassword('ALLUPPERCASE')).toBe(false);
      expect(validators.validatePassword('NoNumbers!')).toBe(false);
    });
  });
});
```

#### Facebook Service
```javascript
describe('FacebookService', () => {
  describe('validateToken', () => {
    it('should validate valid token', async () => {
      const result = await facebookService.validateToken('valid_token');
      expect(result.valid).toBe(true);
      expect(result.user_id).toBeDefined();
    });
    
    it('should reject invalid token', async () => {
      await expect(facebookService.validateToken('invalid_token'))
        .rejects.toThrow('INVALID_FB_TOKEN');
    });
  });
});
```

---

### 2.2. Frontend Unit Tests

**Framework:** Jest + React Testing Library

**Test suites:**

#### Components
```javascript
describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('should call onClick when clicked', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
  
  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

#### Hooks
```javascript
describe('useAuth', () => {
  it('should return user when authenticated', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });
    
    expect(result.current.user).toBeDefined();
    expect(result.current.isAuthenticated).toBe(true);
  });
  
  it('should return null when not authenticated', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

---

## 3. INTEGRATION TESTS

### 3.1. API Integration Tests

**Framework:** Jest + Supertest

**Coverage:** Tất cả 47 API endpoints

**Test suites:**

#### Auth APIs
```javascript
describe('Auth APIs', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Test@123',
          full_name: 'Test User'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('test@example.com');
    });
    
    it('should return 409 if email exists', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'Test@123'
        });
      
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('EMAIL_EXISTS');
    });
  });
  
  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test@123'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.data.access_token).toBeDefined();
      expect(res.body.data.refresh_token).toBeDefined();
    });
    
    it('should return 401 for invalid password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPass'
        });
      
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });
});
```

#### Facebook APIs
```javascript
describe('Facebook APIs', () => {
  let accessToken;
  
  beforeAll(async () => {
    // Login to get access token
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'Test@123' });
    accessToken = res.body.data.access_token;
  });
  
  describe('POST /api/v1/facebook/connect', () => {
    it('should connect Facebook with valid token', async () => {
      const res = await request(app)
        .post('/api/v1/facebook/connect')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          access_token: 'valid_fb_token'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.data.facebook_account).toBeDefined();
      expect(res.body.data.pages).toBeDefined();
    });
    
    it('should return 400 for invalid token', async () => {
      const res = await request(app)
        .post('/api/v1/facebook/connect')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          access_token: 'invalid_token'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_FB_TOKEN');
    });
  });
});
```

#### Video APIs
```javascript
describe('Video APIs', () => {
  let accessToken;
  
  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'Test@123' });
    accessToken = res.body.data.access_token;
  });
  
  describe('POST /api/v1/videos/upload', () => {
    it('should upload valid video', async () => {
      const res = await request(app)
        .post('/api/v1/videos/upload')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('video', 'test/fixtures/video.mp4');
      
      expect(res.status).toBe(201);
      expect(res.body.data.video.id).toBeDefined();
      expect(res.body.data.video.thumbnail_url).toBeDefined();
    });
    
    it('should return 400 for invalid file type', async () => {
      const res = await request(app)
        .post('/api/v1/videos/upload')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('video', 'test/fixtures/image.jpg');
      
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_FILE_TYPE');
    });
  });
});
```

#### Admin APIs
```javascript
describe('Admin APIs', () => {
  let adminToken;
  let userToken;
  
  beforeAll(async () => {
    // Admin login
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@thichcuu.com', password: 'Admin@123' });
    adminToken = adminRes.body.data.access_token;
    
    // User login
    const userRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: 'User@123' });
    userToken = userRes.body.data.access_token;
  });
  
  describe('GET /api/v1/admin/users', () => {
    it('should return users for admin', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.users).toBeDefined();
    });
    
    it('should return 403 for non-admin', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('ADMIN_REQUIRED');
    });
  });
});
```

---

### 3.2. Database Integration Tests

**Test database operations:**

```javascript
describe('Database Operations', () => {
  describe('User Repository', () => {
    it('should create user', async () => {
      const user = await userRepository.create({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hash',
        full_name: 'Test User'
      });
      
      expect(user.id).toBeDefined();
    });
    
    it('should find user by email', async () => {
      const user = await userRepository.findByEmail('test@example.com');
      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
    });
  });
  
  describe('Post Repository', () => {
    it('should create post with videos', async () => {
      const post = await postRepository.create({
        user_id: userId,
        page_id: '123456',
        message: 'Test post',
        videos: [
          { card_index: 0, title: 'Video 1' },
          { card_index: 1, title: 'Video 2' }
        ]
      });
      
      expect(post.id).toBeDefined();
      expect(post.videos).toHaveLength(2);
    });
  });
});
```

---

## 4. E2E TESTS

### 4.1. User Flows

**Framework:** Playwright / Cypress

**Test scenarios:**

#### Scenario 1: New User Registration & First Post
```javascript
test('New user can register and create first post', async ({ page }) => {
  // 1. Register
  await page.goto('/register');
  await page.fill('[name="username"]', 'newuser');
  await page.fill('[name="email"]', 'newuser@example.com');
  await page.fill('[name="password"]', 'NewUser@123');
  await page.fill('[name="full_name"]', 'New User');
  await page.click('button[type="submit"]');
  
  // 2. Verify email (mock)
  await page.goto('/verify-email?token=mock_token');
  await expect(page.locator('text=Email verified')).toBeVisible();
  
  // 3. Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'newuser@example.com');
  await page.fill('[name="password"]', 'NewUser@123');
  await page.click('button[type="submit"]');
  
  // 4. Connect Facebook
  await page.goto('/facebook/connect');
  await page.fill('[name="access_token"]', 'mock_fb_token');
  await page.click('button:has-text("Connect")');
  await expect(page.locator('text=Connected')).toBeVisible();
  
  // 5. Upload videos
  await page.goto('/posts/create');
  await page.setInputFiles('[name="video1"]', 'test/fixtures/video1.mp4');
  await page.setInputFiles('[name="video2"]', 'test/fixtures/video2.mp4');
  await page.waitForSelector('text=Upload complete');
  
  // 6. Fill post info
  await page.selectOption('[name="page_id"]', '123456');
  await page.fill('[name="card1_title"]', 'Card 1 Title');
  await page.fill('[name="card2_title"]', 'Card 2 Title');
  await page.fill('[name="message"]', 'My first post!');
  
  // 7. Preview
  await expect(page.locator('.preview-card-1')).toContainText('Card 1 Title');
  await expect(page.locator('.preview-card-2')).toContainText('Card 2 Title');
  
  // 8. Publish
  await page.click('button:has-text("Publish")');
  await page.click('button:has-text("Confirm")');
  
  // 9. Wait for success
  await expect(page.locator('text=Post published successfully')).toBeVisible({ timeout: 60000 });
  
  // 10. View in history
  await page.goto('/posts');
  await expect(page.locator('text=My first post!')).toBeVisible();
});
```

#### Scenario 2: Schedule Post
```javascript
test('User can schedule post', async ({ page }) => {
  await page.goto('/posts/create');
  
  // Create post
  // ... (similar to above)
  
  // Schedule
  await page.click('button:has-text("Schedule")');
  await page.fill('[name="scheduled_date"]', '2026-05-26');
  await page.fill('[name="scheduled_time"]', '18:00');
  await page.click('button:has-text("Confirm Schedule")');
  
  await expect(page.locator('text=Post scheduled')).toBeVisible();
  
  // View in history
  await page.goto('/posts');
  await expect(page.locator('text=Scheduled')).toBeVisible();
});
```

#### Scenario 3: Retry Failed Post
```javascript
test('User can retry failed post', async ({ page }) => {
  await page.goto('/posts');
  
  // Find failed post
  await page.click('tr:has-text("Failed") >> button:has-text("View")');
  
  // View error logs
  await expect(page.locator('.logs')).toContainText('Error');
  
  // Retry
  await page.click('button:has-text("Retry")');
  await page.click('button:has-text("Confirm")');
  
  // Wait for success
  await expect(page.locator('text=Post published successfully')).toBeVisible({ timeout: 60000 });
});
```

---

### 4.2. Admin Flows

```javascript
test('Admin can manage users', async ({ page }) => {
  // 1. Admin login
  await page.goto('/login');
  await page.fill('[name="email"]', 'admin@thichcuu.com');
  await page.fill('[name="password"]', 'Admin@123');
  await page.click('button[type="submit"]');
  
  // 2. Go to admin panel
  await page.goto('/admin/users');
  
  // 3. Search user
  await page.fill('[name="search"]', 'testuser');
  await page.press('[name="search"]', 'Enter');
  await expect(page.locator('text=testuser')).toBeVisible();
  
  // 4. View user detail
  await page.click('tr:has-text("testuser") >> button:has-text("View")');
  await expect(page.locator('text=User Details')).toBeVisible();
  
  // 5. Ban user
  await page.click('button:has-text("Ban User")');
  await page.fill('[name="reason"]', 'Spam');
  await page.click('button:has-text("Confirm Ban")');
  await expect(page.locator('text=User banned')).toBeVisible();
  
  // 6. Verify user cannot login
  await page.goto('/logout');
  await page.goto('/login');
  await page.fill('[name="email"]', 'testuser@example.com');
  await page.fill('[name="password"]', 'Test@123');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=Account has been banned')).toBeVisible();
});
```

---

## 5. SECURITY TESTS

### 5.1. Authentication Tests

```javascript
describe('Authentication Security', () => {
  it('should reject requests without token', async () => {
    const res = await request(app).get('/api/v1/user/profile');
    expect(res.status).toBe(401);
  });
  
  it('should reject requests with invalid token', async () => {
    const res = await request(app)
      .get('/api/v1/user/profile')
      .set('Authorization', 'Bearer invalid_token');
    expect(res.status).toBe(401);
  });
  
  it('should reject requests with expired token', async () => {
    const expiredToken = jwt.sign({ sub: 'user_id' }, privateKey, {
      expiresIn: '-1h'
    });
    const res = await request(app)
      .get('/api/v1/user/profile')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
  });
});
```

---

### 5.2. Authorization Tests

```javascript
describe('Authorization Security', () => {
  it('should prevent user from accessing other user data', async () => {
    const res = await request(app)
      .get('/api/v1/posts/other_user_post_id')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });
  
  it('should prevent user from accessing admin endpoints', async () => {
    const res = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });
});
```

---

### 5.3. Input Validation Tests

```javascript
describe('Input Validation', () => {
  it('should reject SQL injection attempts', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: "admin@example.com' OR '1'='1",
        password: 'anything'
      });
    expect(res.status).toBe(400);
  });
  
  it('should reject XSS attempts', async () => {
    const res = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        message: '<script>alert("XSS")</script>'
      });
    expect(res.body.data.post.message).not.toContain('<script>');
  });
});
```

---

### 5.4. Rate Limiting Tests

```javascript
describe('Rate Limiting', () => {
  it('should rate limit login attempts', async () => {
    // Make 6 failed login attempts
    for (let i = 0; i < 6; i++) {
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'wrong' });
    }
    
    // 6th attempt should be rate limited
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'wrong' });
    
    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe('TOO_MANY_ATTEMPTS');
  });
});
```

---

## 6. PERFORMANCE TESTS

### 6.1. Load Testing

**Tool:** Artillery / k6

**Scenarios:**

```yaml
# artillery.yml
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10
      name: Warm up
    - duration: 120
      arrivalRate: 50
      name: Ramp up
    - duration: 300
      arrivalRate: 100
      name: Sustained load

scenarios:
  - name: User browsing
    flow:
      - post:
          url: '/api/v1/auth/login'
          json:
            email: 'test@example.com'
            password: 'Test@123'
          capture:
            - json: '$.data.access_token'
              as: 'token'
      - get:
          url: '/api/v1/posts'
          headers:
            Authorization: 'Bearer {{ token }}'
      - get:
          url: '/api/v1/posts/{{ $randomString() }}'
          headers:
            Authorization: 'Bearer {{ token }}'
```

**Metrics to track:**
- Response time (p50, p95, p99)
- Throughput (requests/second)
- Error rate
- CPU usage
- Memory usage
- Database connections

**Acceptance criteria:**
- p95 response time < 500ms
- Error rate < 1%
- Support 100 concurrent users

---

### 6.2. Stress Testing

**Goal:** Find breaking point

**Scenarios:**
- Gradually increase load until system fails
- Identify bottlenecks
- Measure recovery time

---

## 7. BROWSER COMPATIBILITY TESTS

### 7.1. Desktop Browsers

**Test on:**
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

**Test cases:**
- All pages render correctly
- All features work
- No console errors
- Responsive design works

---

### 7.2. Mobile Browsers

**Test on:**
- iOS Safari (latest 2 versions)
- Chrome Mobile (latest 2 versions)

**Test cases:**
- Mobile layout works
- Touch interactions work
- File upload works
- Performance acceptable

---

## 8. ACCESSIBILITY TESTS

### 8.1. Automated Tests

**Tool:** axe-core / Lighthouse

```javascript
test('Homepage should have no accessibility violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

---

### 8.2. Manual Tests

**Test cases:**
- Keyboard navigation works
- Screen reader compatible
- Color contrast sufficient
- Focus indicators visible
- Alt text for images

---

## 9. CI/CD INTEGRATION

### 9.1. GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 10. TEST DATA MANAGEMENT

### 10.1. Test Database

**Setup:**
- Separate test database
- Reset before each test suite
- Seed with test data

```javascript
beforeAll(async () => {
  await sequelize.sync({ force: true });
  await seedTestData();
});

afterAll(async () => {
  await sequelize.close();
});
```

---

### 10.2. Test Fixtures

```
test/
├── fixtures/
│   ├── users.json
│   ├── posts.json
│   ├── video1.mp4
│   └── video2.mp4
└── helpers/
    ├── auth.js
    ├── database.js
    └── facebook.js
```

---

## 11. TEST COVERAGE REPORT

### 11.1. Generate Coverage

```bash
npm run test:coverage
```

### 11.2. Coverage Thresholds

```json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

---

## 12. TEST DOCUMENTATION

### 12.1. Test Plan Document

**Include:**
- Test strategy
- Test scope
- Test schedule
- Test resources
- Test deliverables

---

### 12.2. Test Report

**Include:**
- Tests executed
- Tests passed/failed
- Coverage percentage
- Bugs found
- Recommendations

---

## 13. PLAN PERMISSIONS TESTING (NEW)

### 13.1. Plan Feature Tests

**Test Suite: Free Plan Permissions**

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-PLAN-001 | Free user xem plan hiện tại | GET /me/plan → plan = "free" |
| TC-PLAN-002 | Free user xem permissions | GET /me/permissions → can_edit_card_2 = false |
| TC-PLAN-003 | Free user xem card settings | GET /me/card-settings → card 2 locked |
| TC-PLAN-004 | Free user tạo post với card 1 only | POST /posts → Success |
| TC-PLAN-005 | Free user cố chỉnh card 2 qua API | POST /posts với card 2 data → 403 CARD_LOCKED |
| TC-PLAN-006 | Free user vượt monthly limit | POST /posts lần thứ 6 → 403 PLAN_LIMIT_EXCEEDED |
| TC-PLAN-007 | Free user cố schedule post | POST /posts/:id/schedule → 403 FEATURE_NOT_AVAILABLE |
| TC-PLAN-008 | Free user cố retry failed post | POST /posts/:id/retry → 403 FEATURE_NOT_AVAILABLE |

**Test Suite: Premium Plan Permissions**

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-PLAN-101 | Premium user xem plan hiện tại | GET /me/plan → plan = "premium" |
| TC-PLAN-102 | Premium user xem permissions | GET /me/permissions → can_edit_card_2 = true |
| TC-PLAN-103 | Premium user xem card settings | GET /me/card-settings → card 2 unlocked |
| TC-PLAN-104 | Premium user tạo post với 2 cards | POST /posts với cả 2 cards → Success |
| TC-PLAN-105 | Premium user chỉnh card 2 | POST /posts với card 2 custom → Success |
| TC-PLAN-106 | Premium user schedule post | POST /posts/:id/schedule → Success |
| TC-PLAN-107 | Premium user retry failed post | POST /posts/:id/retry → Success |
| TC-PLAN-108 | Premium user vượt monthly limit | POST /posts lần thứ 101 → 403 PLAN_LIMIT_EXCEEDED |

---

### 13.2. Card Locking Tests

**Test Suite: Card 2 Locking for Free Users**

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-CARD-001 | Free user thấy card 2 locked trong UI | Frontend hiển thị locked state |
| TC-CARD-002 | Free user không thấy input cho card 2 | Input fields disabled |
| TC-CARD-003 | Free user thấy default media card 2 | Preview hiển thị admin's default media |
| TC-CARD-004 | Free user gửi empty card 2 | Backend fill default settings → Success |
| TC-CARD-005 | Free user gửi card 2 data qua API | Backend reject → 403 CARD_LOCKED |
| TC-CARD-006 | Free user bypass frontend validation | Backend vẫn reject → 403 CARD_LOCKED |
| TC-CARD-007 | Free user post thành công | Card 2 dùng admin's default settings |

**Test Suite: Card 2 Unlocked for Premium Users**

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-CARD-101 | Premium user thấy card 2 unlocked | Frontend hiển thị unlocked state |
| TC-CARD-102 | Premium user thấy input cho card 2 | Input fields enabled |
| TC-CARD-103 | Premium user upload media cho card 2 | Upload success |
| TC-CARD-104 | Premium user nhập link cho card 2 | Link saved |
| TC-CARD-105 | Premium user nhập caption cho card 2 | Caption saved |
| TC-CARD-106 | Premium user post với card 2 custom | Post success với custom card 2 |

---

### 13.3. Feature Override Tests

**Test Suite: Admin Override Permissions**

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-OVERRIDE-001 | Admin override can_edit_card_2 cho free user | POST /admin/users/:id/feature-overrides → Success |
| TC-OVERRIDE-002 | Free user với override xem permissions | GET /me/permissions → can_edit_card_2 = true (override) |
| TC-OVERRIDE-003 | Free user với override chỉnh card 2 | POST /posts với card 2 → Success |
| TC-OVERRIDE-004 | Admin xóa override | DELETE /admin/users/:id/feature-overrides/:id → Success |
| TC-OVERRIDE-005 | Free user sau khi xóa override | POST /posts với card 2 → 403 CARD_LOCKED |
| TC-OVERRIDE-006 | Override có expiry date | Sau expiry → user quay về plan permissions |
| TC-OVERRIDE-007 | Override priority cao hơn plan | Override = true, Plan = false → User có quyền |

---

### 13.4. Admin Plan Management Tests

**Test Suite: Admin Manage Plans**

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-ADMIN-PLAN-001 | Admin xem danh sách plans | GET /admin/plans → 2 plans (free, premium) |
| TC-ADMIN-PLAN-002 | Admin tạo plan mới | POST /admin/plans → Success |
| TC-ADMIN-PLAN-003 | Admin xem features của plan | GET /admin/plans/:id/features → List features |
| TC-ADMIN-PLAN-004 | Admin update features của plan | PATCH /admin/plans/:id/features → Success |
| TC-ADMIN-PLAN-005 | Admin gán plan cho user | PATCH /admin/users/:id/plan → Success |
| TC-ADMIN-PLAN-006 | User thấy plan mới ngay lập tức | GET /me/plan → Plan updated |
| TC-ADMIN-PLAN-007 | Admin disable plan | PATCH /admin/plans/:id → is_active = false |
| TC-ADMIN-PLAN-008 | User hiện tại vẫn dùng được plan disabled | GET /me/plan → Still active |

**Test Suite: Admin Manage Card Settings**

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-ADMIN-CARD-001 | Admin xem card settings | GET /admin/card-settings → 2 cards |
| TC-ADMIN-CARD-002 | Admin update card 2 settings | PATCH /admin/card-settings/card-2 → Success |
| TC-ADMIN-CARD-003 | Admin upload default media cho card 2 | POST /admin/card-settings/card-2/default-media → Success |
| TC-ADMIN-CARD-004 | Admin set default link cho card 2 | PATCH /admin/card-settings/card-2 → Success |
| TC-ADMIN-CARD-005 | Free user thấy default mới ngay | GET /me/card-settings → New defaults |
| TC-ADMIN-CARD-006 | Admin lock card 2 cho premium | PATCH → is_locked_for_premium = true |
| TC-ADMIN-CARD-007 | Premium user không chỉnh được card 2 | POST /posts với card 2 → 403 CARD_LOCKED |

---

### 13.5. Security Tests for Plan Permissions

**Test Suite: Permission Bypass Attempts**

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-SEC-PLAN-001 | Free user gửi can_edit_card_2=true trong request | Backend ignore → 403 CARD_LOCKED |
| TC-SEC-PLAN-002 | Free user modify JWT payload (plan=premium) | JWT verify failed → 401 INVALID_TOKEN |
| TC-SEC-PLAN-003 | Free user gọi API với plan_id=premium | Backend check DB → 403 CARD_LOCKED |
| TC-SEC-PLAN-004 | Free user bypass frontend locked state | Backend validate → 403 CARD_LOCKED |
| TC-SEC-PLAN-005 | User gửi card 2 data khi không có quyền | Backend reject → 403 CARD_LOCKED |
| TC-SEC-PLAN-006 | User vượt limit nhưng gửi nhiều requests | Rate limit + plan limit → 403 |
| TC-SEC-PLAN-007 | Admin log permission violations | system_logs có record violation |

---

### 13.6. Integration Tests

**Test Suite: End-to-End Plan Flow**

| Test Case | Description | Steps | Expected Result |
|-----------|-------------|-------|-----------------|
| TC-E2E-PLAN-001 | Free user đăng ký → tạo post | 1. Register<br>2. Connect FB<br>3. Upload videos<br>4. Create post (card 1 only)<br>5. Publish | Success, card 2 dùng default |
| TC-E2E-PLAN-002 | Admin upgrade user → user tạo post | 1. Admin gán premium<br>2. User refresh<br>3. User create post (2 cards)<br>4. Publish | Success, cả 2 cards custom |
| TC-E2E-PLAN-003 | Premium user hết hạn → downgrade | 1. Premium expires<br>2. Cron job auto-expire<br>3. User create post<br>4. Try edit card 2 | 403 CARD_LOCKED |
| TC-E2E-PLAN-004 | Admin override → user dùng → admin remove | 1. Admin override can_edit_card_2<br>2. User edit card 2<br>3. Admin remove override<br>4. User try edit card 2 | Step 2: Success<br>Step 4: 403 |

---

## THAM CHIẾU

- [API Plan - Test Plan](./08-api-plan.md#12-api-test-plan)
- [Implementation Phases - Phase 16](./06-implementation-phases.md#phase-16-e2e-testing)
- [Security Plan - Security Testing](./05-security-plan.md#13-security-testing)

---

## 14. QA Full Regression Addendum - 2026-05-27

Bo sung sau dot FULL QA + AUTO FIX cho Admin Panel va User Frontend.

### 14.1. Test automation moi

| Test Case | Scope | Expected Result |
|-----------|-------|-----------------|
| TC-QA-AUTH-001 | Protected API khong auth | 401 |
| TC-QA-AUTH-002 | User role goi admin API | 403 |
| TC-QA-AUTH-003 | Invalid token | 401 |
| TC-QA-AUTH-004 | Inactive user | 403 |
| TC-QA-AUTH-005 | Admin reset user password | Admin 200, user thuong 403, password moi login duoc |
| TC-QA-LEAK-001 | Admin/users response | Khong co password |
| TC-QA-LEAK-002 | Facebook accounts/admin posts/post detail | Khong co accessToken/dev_mock token |
| TC-QA-LEAK-003 | Settings response | smtp_password bi mask `********` |
| TC-QA-CARD2-001 | Free user gui Card 2 payload | Backend ignore/apply admin default |
| TC-QA-CARD2-002 | Premium user co permission | Backend cho edit Card 2 |
| TC-QA-CARD2-003 | Feature override | Anh huong dung Card 2 permission |
| TC-QA-CARD-LOCK-001 | Card 1 locked for Free | Free user create post bi backend chan 400 |
| TC-QA-CARD-LOCK-002 | Card 2 locked for Premium | Premium user `canEdit=false`, Card 2 payload bi ignore/apply default |
| TC-QA-CARD-MEDIA-001 | Card 1 allowed image only | Video upload bi backend chan 400 |
| TC-QA-CARD-MEDIA-002 | Card 2 allowed image only | Video upload bi backend chan 400 |
| TC-QA-CARD-MEDIA-003 | Admin default media upload | File default media sai type/max size bi backend chan |
| TC-QA-UPLOAD-001 | Sai file type | 400 |
| TC-QA-UPLOAD-002 | Branding file qua 5MB | 400 |
| TC-QA-RATE-001 | Goi API qua nguong | 429 |

### 14.2. API smoke regression

| Test Case | Scope | Expected Result |
|-----------|-------|-----------------|
| TC-QA-ADMIN-001 | Admin dashboard stats | Co users/posts/facebookAccounts/recent logs |
| TC-QA-ADMIN-002 | Admin users filter/detail/stats/subscriptions | 200, khong leak password |
| TC-QA-ADMIN-003 | Plan create/update/toggle/delete | Temp plan OK, plan co subscriber khong xoa duoc |
| TC-QA-ADMIN-004 | Card settings update/upload | 200, no token leak |
| TC-QA-ADMIN-005 | System settings update/mask/validate | SMTP masked, custom JS qua lon bi chan |
| TC-QA-ADMIN-006 | Branding settings update/upload | Site name saves, logo/favicon upload saves, `/uploads` asset returns 200, public branding endpoint exposes no secrets |
| TC-QA-USER-001 | Register/dashboard/subscription/profile | 200/201 |
| TC-QA-FB-001 | Facebook dev mock connect/list/pages/groups/disconnect | 200/201, no raw token |
| TC-QA-FB-002 | Facebook ad accounts list | 200, ad accounts returned, no raw token |
| TC-QA-POST-001 | Post create/list/detail/update/retry/delete | 200/201, ownership enforced |
| TC-QA-POST-002 | Page carousel publish | Requires owned ad account; dev publish passes; live publish stores Page story ID, creative ID, and permalink URL |
| TC-QA-UPLOAD-003 | Public `/uploads/...` path resolve on Windows | Resolves inside `server/uploads`, not drive root |
| TC-QA-FB-003 | Video carousel publish | Video child attachment includes fallback `image_hash` thumbnail from an image card |
| TC-QA-FB-004 | Ad account status filter | Status `101` ad accounts are not selectable/usable; only `1`/`ACTIVE` allowed |
| TC-QA-FB-005 | Published Page story visibility | Graph verifies `is_published=true`, `is_hidden=false`, and `permalink_url` is returned before local status becomes `published` |

### 14.3. UI smoke regression

| Test Case | Scope | Expected Result |
|-----------|-------|-----------------|
| TC-QA-UI-ADMIN-001 | Admin login | Redirect `/dashboard` |
| TC-QA-UI-ADMIN-002 | Admin pages users/plans/posts/logs/card-settings/settings | Page loads, no login redirect |
| TC-QA-UI-ADMIN-003 | Normal user login admin UI | Blocked, no admin token |
| TC-QA-UI-USER-001 | User login | Redirect `/dashboard` |
| TC-QA-UI-USER-002 | User dashboard/facebook/subscription/profile/posts/create | Page loads |
| TC-QA-UI-USER-003 | Free user create post UI | Card 2 shows admin-managed locked state |
| TC-QA-UI-POST-001 | Published post permalink in user list/detail | User can open Facebook post link after successful publish |
| TC-QA-UI-POST-002 | Published post permalink in admin posts | Admin can see/open Facebook post link without raw token exposure |
| TC-QA-UI-BRANDING-001 | Admin branding UI | Saving site name updates admin header/title; logo preview loads without cross-origin block |
| TC-QA-UI-BRANDING-002 | User branding UI | User login/dashboard uses public site name/logo/favicon |
| TC-QA-UI-LANDING-001 | Public landing route `/` | Loads without auth, displays hero, CTA, app screenshot, workflow, pricing, FAQ |
| TC-QA-UI-LANDING-002 | Landing pricing | Calls `GET /api/v1/public/plans`, shows active plans, no secret fields |
| TC-QA-UI-LANDING-003 | Protected dashboard unchanged | Unauthenticated `/dashboard` redirects to `/login` |

### 14.4. Regression notes

- Dev backend currently uses `http://localhost:3001/api/v1` because `127.0.0.1:3000` is occupied by an external app on this machine.
- Frontend/Admin must use `VITE_API_URL=http://localhost:3001/api/v1` in local `.env`.
- Docs live under `.claude/docs`.
- Demo credentials:
  - Admin: `admin@thichcuu.com` / `Admin@123456`
  - Free: `free.user@example.test` / `Demo@123456`
  - Premium: `premium.user@example.test` / `Demo@123456`
- Live Facebook OAuth/publish, payment, and SMTP send require real env credentials. Dev/mock flow must remain testable without real secrets.

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-25  
**Status:** ✅ Completed

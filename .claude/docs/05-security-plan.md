# SECURITY PLAN - THÍCH CỪU FACEBOOK VIDEO 2 Ô TOOL

## 1. TỔNG QUAN BẢO MẬT

**Mục tiêu:** Bảo vệ dữ liệu users, đặc biệt là Facebook access tokens và thông tin cá nhân.

**Nguyên tắc:**
- Defense in depth (nhiều lớp bảo mật)
- Least privilege (quyền tối thiểu)
- Secure by default
- Zero trust

---

## 2. AUTHENTICATION (XÁC THỰC)

### 2.1. JWT (JSON Web Token)

**Access Token:**
- **Lifetime:** 15 minutes
- **Algorithm:** RS256 (RSA + SHA256)
- **Storage:** Memory (frontend state)
- **Payload:**
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "user",
  "iat": 1716624000,
  "exp": 1716624900
}
```

**Refresh Token:**
- **Lifetime:** 7 days
- **Algorithm:** RS256
- **Storage:** httpOnly cookie
- **Rotation:** Mỗi lần refresh → token mới
- **Payload:**
```json
{
  "sub": "user_id",
  "type": "refresh",
  "iat": 1716624000,
  "exp": 1717228800
}
```

**Implementation:**
```javascript
// Generate tokens
const accessToken = jwt.sign(payload, privateKey, {
  algorithm: 'RS256',
  expiresIn: '15m'
});

const refreshToken = jwt.sign(
  { sub: userId, type: 'refresh' },
  privateKey,
  { algorithm: 'RS256', expiresIn: '7d' }
);
```

**Security measures:**
- ✅ Tokens signed với RSA private key
- ✅ Verify với RSA public key
- ✅ Short-lived access tokens
- ✅ Refresh token rotation
- ✅ Revoke tokens on logout/password change
- ✅ Store refresh token hash in DB (không lưu plain text)

**API liên quan:**
- POST /api/v1/auth/login
- POST /api/v1/auth/refresh
- POST /api/v1/auth/logout

---

### 2.2. Password Security

**Hashing:**
- **Algorithm:** bcrypt
- **Salt rounds:** 10
- **Library:** bcrypt.js

**Password requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (optional)

**Implementation:**
```javascript
// Hash password
const passwordHash = await bcrypt.hash(password, 10);

// Verify password
const isValid = await bcrypt.compare(password, passwordHash);
```

**Security measures:**
- ✅ Never store plain text passwords
- ✅ Never log passwords
- ✅ Never return passwords in API responses
- ✅ Rate limit login attempts (5/15 min)
- ✅ Account lockout after failed attempts
- ✅ Password strength validation

**API liên quan:**
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- PUT /api/v1/auth/password

---

### 2.3. Session Management

**Session storage:**
- **Database:** `sessions` table
- **Fields:** user_id, refresh_token_hash, ip_address, user_agent, expires_at

**Session lifecycle:**
```
1. Login → Create session
2. Refresh → Validate session, rotate token
3. Logout → Delete session
4. Password change → Delete all sessions
5. Expired → Auto cleanup (cron job)
```

**Security measures:**
- ✅ Store token hash (không lưu plain text)
- ✅ Track IP address và user agent
- ✅ Revoke sessions on security events
- ✅ Auto cleanup expired sessions
- ✅ Limit concurrent sessions per user (optional)

**API liên quan:**
- POST /api/v1/auth/login
- POST /api/v1/auth/refresh
- POST /api/v1/auth/logout

---

### 2.4. Multi-Factor Authentication (MFA) - Future

**Phase 2 (optional):**
- TOTP (Time-based One-Time Password)
- SMS OTP
- Email OTP
- Backup codes

---

## 3. AUTHORIZATION (PHÂN QUYỀN)

### 3.1. Role-Based Access Control (RBAC)

**Roles:**

| Role | Description | Permissions |
|------|-------------|-------------|
| user | End user | Own data only |
| admin | Administrator | View all, manage users |
| super_admin | Super administrator | Full access |

**Role hierarchy:**
```
super_admin > admin > user
```

**Implementation:**
```javascript
// Middleware: Check role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'PERMISSION_DENIED' }
      });
    }
    next();
  };
};

// Usage
router.get('/admin/users', 
  auth, 
  requireRole(['admin', 'super_admin']), 
  adminController.getUsers
);
```

**API liên quan:**
- Tất cả admin endpoints: `/api/v1/admin/*`

---

### 3.2. Ownership-Based Access Control

**Principle:** User chỉ truy cập resources của mình

**Implementation:**
```javascript
// Middleware: Check ownership
const requireOwnership = (resourceType) => {
  return async (req, res, next) => {
    const resourceId = req.params.id;
    const resource = await getResource(resourceType, resourceId);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND' }
      });
    }
    
    if (resource.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCESS_DENIED' }
      });
    }
    
    req.resource = resource;
    next();
  };
};

// Usage
router.get('/posts/:id', 
  auth, 
  requireOwnership('post'), 
  postController.getPost
);
```

**Resources cần ownership check:**
- Posts
- Videos
- Facebook connections
- User settings

**API liên quan:**
- GET /api/v1/posts/:id
- DELETE /api/v1/posts/:id
- GET /api/v1/videos/:id
- DELETE /api/v1/videos/:id

---

### 3.3. Plan-Based Permissions (NEW)

**Principle:** User permissions phụ thuộc vào plan (free/premium) và feature overrides

**Permission Priority:**
```
1. User Feature Override (highest)
2. Plan Feature
3. Default (false)
```

**Implementation:**

```javascript
// Service: Get user permissions
const getUserPermissions = async (userId) => {
  // Get user's active plan
  const userPlan = await db.user_plans.findOne({
    where: { user_id: userId, status: 'active' },
    include: [{ model: db.plans, include: [db.plan_features] }]
  });
  
  // Get user's feature overrides
  const overrides = await db.user_feature_overrides.findAll({
    where: { 
      user_id: userId,
      [Op.or]: [
        { expires_at: null },
        { expires_at: { [Op.gt]: new Date() } }
      ]
    }
  });
  
  // Build permissions object
  const permissions = {};
  
  // Add plan features
  if (userPlan?.plan?.plan_features) {
    userPlan.plan.plan_features.forEach(f => {
      permissions[f.feature_key] = parseFeatureValue(f.feature_value);
    });
  }
  
  // Apply overrides (higher priority)
  overrides.forEach(o => {
    permissions[o.feature_key] = parseFeatureValue(o.feature_value);
  });
  
  return permissions;
};

// Middleware: Check plan permission
const requirePermission = (featureKey) => {
  return async (req, res, next) => {
    const permissions = await getUserPermissions(req.user.id);
    
    if (!permissions[featureKey]) {
      return res.status(403).json({
        success: false,
        error: { 
          code: 'FEATURE_NOT_AVAILABLE',
          message: `Feature '${featureKey}' is not available in your plan`
        }
      });
    }
    
    req.permissions = permissions;
    next();
  };
};

// Middleware: Check plan limit
const checkPlanLimit = (limitKey) => {
  return async (req, res, next) => {
    const permissions = await getUserPermissions(req.user.id);
    const limit = permissions[limitKey];
    
    if (!limit) {
      return next(); // No limit
    }
    
    // Check current usage
    let currentUsage;
    if (limitKey === 'monthly_post_limit') {
      currentUsage = await db.posts.count({
        where: {
          user_id: req.user.id,
          created_at: { [Op.gte]: startOfMonth() }
        }
      });
    }
    
    if (currentUsage >= limit) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PLAN_LIMIT_EXCEEDED',
          message: `You have reached your ${limitKey} limit (${limit})`,
          current: currentUsage,
          limit: limit
        }
      });
    }
    
    next();
  };
};

// Usage
router.post('/posts/:id/publish', 
  auth, 
  requirePermission('can_schedule_post'), // Check feature
  checkPlanLimit('monthly_post_limit'),   // Check limit
  postController.publish
);
```

**Card Permission Validation:**

```javascript
// Middleware: Validate card permissions
const validateCardPermissions = async (req, res, next) => {
  const { cards } = req.body; // Array of 2 cards
  const permissions = await getUserPermissions(req.user.id);
  
  // Get card settings
  const cardSettings = await db.card_settings.findAll({
    order: [['card_index', 'ASC']]
  });
  
  // Get user's plan
  const userPlan = await db.user_plans.findOne({
    where: { user_id: req.user.id, status: 'active' },
    include: [db.plans]
  });
  
  const planName = userPlan?.plan?.name || 'free';
  
  // Validate each card
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const setting = cardSettings[i];
    
    // Check if card is locked for user's plan
    const isLocked = (planName === 'free' && setting.is_locked_for_free) ||
                     (planName === 'premium' && setting.is_locked_for_premium);
    
    // Check if user can edit this card
    const canEdit = permissions[`can_edit_card_${i + 1}`];
    
    if (isLocked || !canEdit) {
      // User cannot edit this card
      // Check if user is trying to modify it
      if (card && Object.keys(card).length > 0) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'CARD_LOCKED',
            message: `Card ${i + 1} is locked for your plan`,
            card_index: i
          }
        });
      }
      
      // Replace with default settings
      cards[i] = {
        media_url: setting.default_media_url,
        title: setting.default_title,
        description: setting.default_description,
        link_url: setting.default_link_url,
        cta_type: setting.default_cta_type
      };
    }
  }
  
  req.body.cards = cards;
  next();
};

// Usage
router.post('/posts', 
  auth,
  validateCardPermissions, // Validate card permissions
  postController.createPost
);
```

**Security Rules:**

1. **NEVER trust frontend locked state**
   - Frontend chỉ hiển thị UI locked
   - Backend MUST validate permissions

2. **Always validate on backend**
   - Check plan permissions trước khi action
   - Check card permissions trước khi create/update post
   - Check limits trước khi publish

3. **Log permission violations**
   - Log khi user cố bypass permissions
   - Alert admin nếu có nhiều violations

4. **Fail secure**
   - Nếu không tìm thấy permission → default false
   - Nếu không tìm thấy plan → default free plan
   - Nếu có lỗi → deny access

**API liên quan:**
- POST /api/v1/posts (validate card permissions)
- POST /api/v1/posts/:id/publish (check limits)
- POST /api/v1/posts/:id/schedule (check can_schedule_post)
- POST /api/v1/posts/:id/retry (check can_retry_failed_post)
- POST /api/v1/videos/upload (check max_upload_size_mb)

---

### 3.4. Permission Matrix

**Xem chi tiết:** [API Plan - Section 10](./08-api-plan.md#10-permission-matrix)

---

## 4. DATA ENCRYPTION

### 4.1. Facebook Access Tokens

**Algorithm:** AES-256-GCM (Galois/Counter Mode)

**Why AES-256-GCM:**
- ✅ Authenticated encryption (integrity + confidentiality)
- ✅ Fast performance
- ✅ Industry standard
- ✅ Resistant to tampering

**Implementation:**
```javascript
const crypto = require('crypto');

// Encryption
function encryptToken(token) {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes
  const iv = crypto.randomBytes(16); // 16 bytes
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Return: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

// Decryption
function decryptToken(encryptedData) {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

**Key management:**
- **Storage:** Environment variable `ENCRYPTION_KEY`
- **Generation:** `crypto.randomBytes(32).toString('hex')`
- **Rotation:** Manual (khi cần)
- **Backup:** Secure vault (1Password, AWS Secrets Manager)

**Security measures:**
- ✅ Never log tokens (encrypted or plain)
- ✅ Never return tokens to frontend
- ✅ Admin chỉ thấy masked tokens (e.g., "EAA...••••••••")
- ✅ Decrypt only when needed (upload to Facebook)
- ✅ Use authenticated encryption (GCM mode)

**API liên quan:**
- POST /api/v1/facebook/connect
- GET /api/v1/admin/users/:id (token masked)

---

### 4.2. Data at Rest

**Database:**
- PostgreSQL transparent data encryption (TDE) - optional
- Encrypted backups
- Encrypted disk volumes

**File storage:**
- Encrypt uploaded videos (optional)
- S3 server-side encryption (SSE-S3)

---

### 4.3. Data in Transit

**HTTPS:**
- TLS 1.2+ only
- Strong cipher suites
- HSTS (HTTP Strict Transport Security)

**Nginx configuration:**
```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
ssl_prefer_server_ciphers on;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

---

## 5. INPUT VALIDATION & SANITIZATION

### 5.1. Input Validation

**Validate all inputs:**
- Request body
- Query parameters
- URL parameters
- Headers

**Validation library:** Joi / Yup

**Example:**
```javascript
const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
  full_name: Joi.string().min(1).max(255).required()
});

// Middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message
        }
      });
    }
    next();
  };
};

// Usage
router.post('/auth/register', validate(registerSchema), authController.register);
```

---

### 5.2. SQL Injection Prevention

**Use ORM/Query Builder:**
- Sequelize / Prisma
- Parameterized queries
- Never concatenate SQL strings

**Example (Sequelize):**
```javascript
// ✅ Safe
const user = await User.findOne({
  where: { email: req.body.email }
});

// ❌ Unsafe
const user = await sequelize.query(
  `SELECT * FROM users WHERE email = '${req.body.email}'`
);
```

---

### 5.3. XSS Prevention

**Sanitize output:**
- Escape HTML entities
- Use Content Security Policy (CSP)
- Set X-XSS-Protection header

**Frontend:**
- React auto-escapes by default
- Don't use `dangerouslySetInnerHTML` unless necessary
- Sanitize with DOMPurify if needed

**Backend headers:**
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  },
  xssFilter: true
}));
```

---

### 5.4. CSRF Prevention

**SameSite cookies:**
```javascript
res.cookie('refresh_token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});
```

**CSRF tokens (optional):**
- Generate CSRF token on login
- Include in forms
- Validate on state-changing requests

---

## 6. RATE LIMITING

### 6.1. Rate Limit Rules

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| POST /auth/login | 5 requests | 15 min | Prevent brute force |
| POST /auth/register | 3 requests | 1 hour | Prevent spam |
| POST /auth/forgot-password | 3 requests | 15 min | Prevent abuse |
| POST /videos/upload | 50 requests | 1 hour | Prevent abuse |
| POST /posts | 20 requests | 1 hour | Prevent spam |
| GET /api/* | 100 requests | 1 hour | General rate limit |

### 6.2. Implementation

**Using express-rate-limit:**
```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_ATTEMPTS',
      message: 'Too many login attempts, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/auth/login', loginLimiter, authController.login);
```

**Using Redis (for distributed systems):**
```javascript
const RedisStore = require('rate-limit-redis');

const limiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:'
  }),
  windowMs: 60 * 60 * 1000,
  max: 100
});
```

---

## 7. SECURITY HEADERS

### 7.1. Helmet.js

**Install:**
```bash
npm install helmet
```

**Configuration:**
```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://graph.facebook.com"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
```

---

### 7.2. CORS

**Configuration:**
```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://thichcuu.com',
    'https://admin.thichcuu.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 8. FILE UPLOAD SECURITY

### 8.1. Validation

**File type validation:**
```javascript
const allowedMimeTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
const allowedExtensions = ['.mp4', '.mov', '.avi'];

function validateFile(file) {
  // Check MIME type
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type');
  }
  
  // Check extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    throw new Error('Invalid file extension');
  }
  
  // Check file size (500MB)
  if (file.size > 500 * 1024 * 1024) {
    throw new Error('File too large');
  }
  
  return true;
}
```

**Video validation (ffmpeg):**
```javascript
const ffmpeg = require('fluent-ffmpeg');

function validateVideo(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      
      const duration = metadata.format.duration;
      if (duration > 300) { // 5 minutes
        return reject(new Error('Video too long'));
      }
      
      resolve(metadata);
    });
  });
}
```

---

### 8.2. Storage Security

**File naming:**
```javascript
// Generate safe filename
const safeFilename = `${userId}_${Date.now()}_${crypto.randomBytes(8).toString('hex')}${ext}`;
```

**Storage location:**
```
uploads/
└── videos/
    └── 2026/
        └── 05/
            └── 25/
                └── user_123_1716624000_abc123.mp4
```

**Permissions:**
- Upload directory: 755
- Uploaded files: 644
- No execute permission

---

### 8.3. Virus Scanning (Optional)

**ClamAV integration:**
```javascript
const NodeClam = require('clamscan');

const clamscan = await new NodeClam().init({
  clamdscan: {
    host: 'localhost',
    port: 3310
  }
});

const { isInfected, viruses } = await clamscan.isInfected(filePath);
if (isInfected) {
  throw new Error(`Virus detected: ${viruses.join(', ')}`);
}
```

---

## 9. LOGGING & MONITORING

### 9.1. Security Logging

**Events to log:**
- Authentication events (login, logout, failed attempts)
- Authorization failures
- Admin actions
- Data access (sensitive data)
- Configuration changes
- Errors and exceptions

**Log format:**
```json
{
  "timestamp": "2026-05-25T15:00:00Z",
  "level": "warn",
  "type": "auth",
  "event": "login_failed",
  "user_id": null,
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "details": {
    "email": "user@example.com",
    "reason": "invalid_password"
  }
}
```

**What NOT to log:**
- Passwords (plain or hashed)
- Access tokens (encrypted or plain)
- Credit card numbers
- Social security numbers
- Other PII

---

### 9.2. Monitoring & Alerting

**Metrics to monitor:**
- Failed login attempts (spike)
- 403/401 errors (spike)
- Unusual API usage patterns
- Database connection errors
- Disk space usage

**Alerts:**
- Failed logins > 10/minute
- 500 errors > 5/minute
- Disk usage > 80%
- Database down

**Tools:**
- Sentry (error tracking)
- New Relic / DataDog (APM)
- Prometheus + Grafana (metrics)
- ELK Stack (logs)

---

## 10. INCIDENT RESPONSE

### 10.1. Security Incident Types

**Types:**
- Data breach
- Account compromise
- DDoS attack
- Malware infection
- Insider threat

---

### 10.2. Response Plan

**Steps:**
1. **Detect:** Monitor alerts, user reports
2. **Contain:** Isolate affected systems, revoke tokens
3. **Investigate:** Analyze logs, identify root cause
4. **Remediate:** Fix vulnerability, restore service
5. **Recover:** Restore from backup if needed
6. **Review:** Post-mortem, update procedures

---

### 10.3. Communication Plan

**Internal:**
- Notify team immediately
- Escalate to management if critical

**External:**
- Notify affected users (email)
- Public statement if major breach
- Comply with legal requirements (GDPR, etc.)

---

## 11. COMPLIANCE

### 11.1. Facebook Platform Policy

**Must comply:**
- Don't store user data longer than necessary
- Don't share user data with third parties
- Respect user privacy
- Follow rate limits
- Use latest API version

**Link:** https://developers.facebook.com/docs/development/release/policies

---

### 11.2. GDPR (if applicable)

**Requirements:**
- User consent for data collection
- Right to access data
- Right to delete data
- Data portability
- Privacy policy

---

### 11.3. Privacy Policy

**Must include:**
- What data we collect
- How we use data
- How we protect data
- User rights
- Contact information

---

## 12. SECURITY CHECKLIST

### 12.1. Development

- [ ] Use HTTPS everywhere
- [ ] Validate all inputs
- [ ] Sanitize all outputs
- [ ] Use parameterized queries
- [ ] Hash passwords with bcrypt
- [ ] Encrypt sensitive data (Facebook tokens)
- [ ] Implement rate limiting
- [ ] Use security headers (Helmet)
- [ ] Enable CORS properly
- [ ] Log security events
- [ ] Don't log sensitive data
- [ ] Use environment variables for secrets
- [ ] Never commit secrets to git

---

### 12.2. Deployment

- [ ] Use strong encryption keys
- [ ] Rotate keys regularly
- [ ] Enable database encryption
- [ ] Enable backup encryption
- [ ] Configure firewall rules
- [ ] Disable unnecessary services
- [ ] Keep software up to date
- [ ] Monitor security alerts
- [ ] Set up intrusion detection
- [ ] Configure SSL/TLS properly
- [ ] Enable audit logging
- [ ] Test disaster recovery

---

### 12.3. Operations

- [ ] Review logs regularly
- [ ] Monitor security metrics
- [ ] Respond to alerts promptly
- [ ] Conduct security audits
- [ ] Train team on security
- [ ] Update incident response plan
- [ ] Test backups regularly
- [ ] Review access controls
- [ ] Patch vulnerabilities quickly

---

## 13. SECURITY TESTING

### 13.1. Automated Testing

**Tools:**
- **OWASP ZAP:** Web application scanner
- **Burp Suite:** Security testing
- **npm audit:** Dependency vulnerabilities
- **Snyk:** Dependency scanning

**Run regularly:**
```bash
# Check dependencies
npm audit
npm audit fix

# Snyk scan
snyk test
```

---

### 13.2. Manual Testing

**Test cases:**
- [ ] SQL injection
- [ ] XSS attacks
- [ ] CSRF attacks
- [ ] Authentication bypass
- [ ] Authorization bypass
- [ ] Session hijacking
- [ ] Rate limit bypass
- [ ] File upload exploits
- [ ] Path traversal
- [ ] Command injection

---

### 13.3. Penetration Testing

**Frequency:** Annually or after major changes

**Scope:**
- Web application
- API endpoints
- Database
- Infrastructure

**Report:**
- Vulnerabilities found
- Severity ratings
- Remediation steps

---

## THAM CHIẾU

- [API Plan](./08-api-plan.md) - Security cho từng API
- [Architecture Plan](./03-architecture-plan.md) - Security architecture
- [Database Plan](./04-database-plan.md) - Database security
- [Implementation Phases](./06-implementation-phases.md) - Phase 15: Security review

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-25  
**Status:** ✅ Completed

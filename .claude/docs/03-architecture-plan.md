# KIẾN TRÚC HỆ THỐNG MỚI

## 1. TỔNG QUAN KIẾN TRÚC

### 1.1. Loại hệ thống

**Web Application (SaaS Model)**
- Multi-tenant (nhiều users độc lập)
- Cloud-based hoặc self-hosted
- RESTful API architecture

### 1.2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
├─────────────────────────────────────────────────────────┤
│  User Frontend          │  Admin Frontend               │
│  (React + Vite)         │  (React + Vite)               │
│  https://thichcuu.com   │  https://admin.thichcuu.com   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   API GATEWAY / NGINX                   │
│              (Reverse Proxy, SSL, CORS)                 │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                      │
├─────────────────────────────────────────────────────────┤
│              Backend API (Node.js + Express)            │
│                  /api/v1/* endpoints                    │
│                                                         │
│  ┌──────────┬──────────┬──────────┬──────────┐        │
│  │  Auth    │  User    │ Facebook │  Post    │        │
│  │ Service  │ Service  │ Service  │ Service  │        │
│  └──────────┴──────────┴──────────┴──────────┘        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    DATA LAYER                           │
├─────────────────────────────────────────────────────────┤
│  PostgreSQL Database    │  Redis Cache (Optional)       │
│  (Users, Posts, Logs)   │  (Sessions, Rate Limit)       │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  STORAGE LAYER                          │
├─────────────────────────────────────────────────────────┤
│  Local Storage / AWS S3                                 │
│  (Uploaded Videos, Thumbnails)                          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 EXTERNAL SERVICES                       │
├─────────────────────────────────────────────────────────┤
│  Facebook Graph API  │  Email Service  │  Monitoring    │
└─────────────────────────────────────────────────────────┘
```

---

## 2. FRONTEND ARCHITECTURE

### 2.1. User Frontend

**Tech Stack:**
- React 18+
- Vite (build tool)
- React Router (routing)
- Redux Toolkit / Zustand (state management)
- TanStack Query (data fetching)
- Tailwind CSS (styling)
- Axios (HTTP client)

**Structure:**
```
frontend/
├── public/
├── src/
│   ├── main.jsx                 # Entry point
│   ├── App.jsx                  # Root component
│   ├── router/
│   │   ├── index.jsx            # Route definitions
│   │   ├── PrivateRoute.jsx    # Auth guard
│   │   └── PublicRoute.jsx     # Public routes
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── ForgotPassword.jsx
│   │   ├── dashboard/
│   │   │   └── Dashboard.jsx
│   │   ├── posts/
│   │   │   ├── CreatePost.jsx
│   │   │   ├── PostHistory.jsx
│   │   │   └── PostDetail.jsx
│   │   ├── facebook/
│   │   │   └── FacebookConnect.jsx
│   │   └── settings/
│   │       └── Settings.jsx
│   ├── components/
│   │   ├── common/              # Reusable components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Footer.jsx
│   │   └── post/
│   │       ├── VideoUploader.jsx
│   │       ├── CardPreview.jsx
│   │       └── PostForm.jsx
│   ├── services/
│   │   ├── api.js               # Axios instance
│   │   ├── auth.js              # Auth API calls
│   │   ├── user.js              # User API calls
│   │   ├── facebook.js          # Facebook API calls
│   │   ├── post.js              # Post API calls
│   │   └── video.js             # Video API calls
│   ├── store/
│   │   ├── index.js             # Store config
│   │   ├── authSlice.js         # Auth state
│   │   ├── uiSlice.js           # UI state
│   │   └── ...
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useUser.js
│   │   └── ...
│   ├── utils/
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   └── constants.js
│   └── styles/
│       └── globals.css
├── .env.example
├── vite.config.js
└── package.json
```

### 2.2. Admin Frontend

**Tech Stack:** (giống User Frontend)

**Structure:**
```
admin/
├── src/
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── UserManagement.jsx
│   │   ├── UserDetail.jsx
│   │   ├── PostManagement.jsx
│   │   ├── SystemLogs.jsx
│   │   └── Settings.jsx
│   ├── components/
│   │   ├── DataTable.jsx
│   │   ├── Chart.jsx
│   │   ├── StatCard.jsx
│   │   └── ...
│   └── services/
│       └── admin.js
└── ...
```

---

## 3. BACKEND ARCHITECTURE

### 3.1. Tech Stack

**Core:**
- Node.js 18+ (LTS)
- Express.js (web framework)
- PostgreSQL (database)
- Redis (cache, sessions) - Optional
- Sequelize / Prisma (ORM)

**Libraries:**
- jsonwebtoken (JWT)
- bcrypt (password hashing)
- multer (file upload)
- fluent-ffmpeg (video processing)
- winston (logging)
- node-cron (scheduled jobs)
- axios (HTTP client)

### 3.2. Structure

```
server/
├── src/
│   ├── app.js                   # Express app setup
│   ├── server.js                # Server entry point
│   ├── routes/
│   │   ├── index.js             # Route aggregator
│   │   ├── auth.routes.js       # Auth endpoints
│   │   ├── user.routes.js       # User endpoints
│   │   ├── facebook.routes.js   # Facebook endpoints
│   │   ├── video.routes.js      # Video endpoints
│   │   ├── post.routes.js       # Post endpoints
│   │   ├── log.routes.js        # Log endpoints
│   │   ├── admin.routes.js      # Admin endpoints
│   │   ├── userPermission.routes.js  # User permission endpoints (NEW)
│   │   └── adminPlan.routes.js       # Admin plan endpoints (NEW)
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── facebook.controller.js
│   │   ├── video.controller.js
│   │   ├── post.controller.js
│   │   ├── log.controller.js
│   │   ├── admin.controller.js
│   │   ├── userPermission.controller.js      # User permission controller (NEW)
│   │   ├── adminPlan.controller.js           # Admin plan controller (NEW)
│   │   ├── adminFeatureOverride.controller.js # Admin override controller (NEW)
│   │   └── adminCardSetting.controller.js    # Admin card setting controller (NEW)
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── facebook.service.js
│   │   ├── video.service.js
│   │   ├── post.service.js
│   │   ├── encryption.service.js
│   │   ├── email.service.js
│   │   ├── postWorkflow.service.js
│   │   ├── plan.service.js              # Plan service (NEW)
│   │   ├── permission.service.js        # Permission service (NEW)
│   │   └── cardSetting.service.js       # Card setting service (NEW)
│   ├── repositories/
│   │   ├── user.repository.js
│   │   ├── post.repository.js
│   │   ├── video.repository.js
│   │   ├── log.repository.js
│   │   ├── plan.repository.js           # Plan repository (NEW)
│   │   └── permission.repository.js     # Permission repository (NEW)
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── FacebookAccount.js
│   │   ├── PostVideo.js
│   │   ├── Plan.js                      # Plan model (NEW)
│   │   ├── UserPlan.js                  # User plan model (NEW)
│   │   ├── PlanFeature.js               # Plan feature model (NEW)
│   │   ├── CardSetting.js               # Card setting model (NEW)
│   │   ├── UserFeatureOverride.js       # Feature override model (NEW)
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   ├── rbac.js              # Role-based access
│   │   ├── ownership.js         # Ownership check
│   │   ├── requirePermission.js # Plan permission check (NEW)
│   │   ├── checkPlanLimit.js    # Plan limit check (NEW)
│   │   ├── validateCardPermissions.js # Card permission validation (NEW)
│   │   ├── rateLimit.js         # Rate limiting
│   │   ├── upload.js            # File upload
│   │   ├── validator.js         # Input validation
│   │   ├── errorHandler.js      # Error handling
│   │   └── auditLog.js          # Audit logging
│   ├── jobs/
│   │   ├── scheduledPosts.js    # Scheduled posts job
│   │   ├── cleanupUploads.js    # Cleanup old files
│   │   ├── refreshTokens.js     # Refresh FB tokens
│   │   ├── expirePlans.js       # Expire user plans (NEW)
│   │   └── expireOverrides.js   # Expire feature overrides (NEW)
│   ├── utils/
│   │   ├── logger.js            # Winston logger
│   │   ├── jwt.js               # JWT helpers
│   │   ├── crypto.js            # Encryption helpers
│   │   ├── validators.js        # Validation helpers
│   │   └── errors.js            # Custom error classes
│   └── config/
│       ├── database.js          # DB config
│       ├── redis.js             # Redis config
│       └── env.js               # Environment config
├── migrations/
│   ├── 001_create_users.js
│   ├── 002_create_posts.js
│   └── ...
├── seeds/
│   └── admin_user.js
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── uploads/                     # Uploaded files (gitignored)
├── logs/                        # Application logs (gitignored)
├── .env.example
├── .env
└── package.json
```

### 3.3. API Architecture

**RESTful API Design:**
- Base URL: `/api/v1`
- Resource-based endpoints
- Standard HTTP methods (GET, POST, PUT, DELETE)
- JWT authentication
- JSON request/response

**Tham chiếu:** [API Plan](./08-api-plan.md) - Chi tiết 47 API endpoints

---

### 3.4. Permission Layer (NEW)

**Plan-Based Permission System:**

```
Request → Auth → RBAC → Plan Permission → Ownership → Controller
```

**Permission Priority:**
1. User Feature Override (highest)
2. Plan Feature
3. Default (false)

**Middleware Stack:**

```javascript
// Example: Create post with card permission validation
router.post('/posts',
  auth,                        // 1. Verify JWT
  requireRole(['user']),       // 2. Check role
  validateCardPermissions,     // 3. Check card permissions (NEW)
  checkPlanLimit('monthly_post_limit'), // 4. Check plan limit (NEW)
  postController.createPost    // 5. Execute
);

// Example: Schedule post
router.post('/posts/:id/schedule',
  auth,
  requireRole(['user']),
  requireOwnership('post'),
  requirePermission('can_schedule_post'), // Check feature permission (NEW)
  postController.schedulePost
);
```

**Permission Service:**

```javascript
// services/permission.service.js
class PermissionService {
  async getUserPermissions(userId) {
    // 1. Get user's active plan
    const userPlan = await UserPlan.findOne({
      where: { user_id: userId, status: 'active' },
      include: [{ model: Plan, include: [PlanFeature] }]
    });
    
    // 2. Get user's feature overrides
    const overrides = await UserFeatureOverride.findAll({
      where: { 
        user_id: userId,
        [Op.or]: [
          { expires_at: null },
          { expires_at: { [Op.gt]: new Date() } }
        ]
      }
    });
    
    // 3. Build permissions (override > plan > default)
    const permissions = {};
    
    // Add plan features
    userPlan?.plan?.plan_features?.forEach(f => {
      permissions[f.feature_key] = parseValue(f.feature_value);
    });
    
    // Apply overrides (higher priority)
    overrides.forEach(o => {
      permissions[o.feature_key] = parseValue(o.feature_value);
    });
    
    return permissions;
  }
  
  async checkPermission(userId, featureKey) {
    const permissions = await this.getUserPermissions(userId);
    return permissions[featureKey] || false;
  }
  
  async checkLimit(userId, limitKey) {
    const permissions = await this.getUserPermissions(userId);
    const limit = permissions[limitKey];
    
    if (!limit) return { allowed: true };
    
    // Check current usage
    const usage = await this.getCurrentUsage(userId, limitKey);
    
    return {
      allowed: usage < limit,
      current: usage,
      limit: limit
    };
  }
}
```

**Card Permission Validation:**

```javascript
// middleware/validateCardPermissions.js
const validateCardPermissions = async (req, res, next) => {
  const { cards } = req.body;
  const userId = req.user.id;
  
  // Get user permissions
  const permissions = await permissionService.getUserPermissions(userId);
  
  // Get card settings
  const cardSettings = await CardSetting.findAll({
    order: [['card_index', 'ASC']]
  });
  
  // Get user's plan
  const userPlan = await UserPlan.findOne({
    where: { user_id: userId, status: 'active' },
    include: [Plan]
  });
  
  const planName = userPlan?.plan?.name || 'free';
  
  // Validate each card
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const setting = cardSettings[i];
    
    // Check if locked
    const isLocked = (planName === 'free' && setting.is_locked_for_free) ||
                     (planName === 'premium' && setting.is_locked_for_premium);
    
    const canEdit = permissions[`can_edit_card_${i + 1}`];
    
    if (isLocked || !canEdit) {
      // User cannot edit this card
      if (card && Object.keys(card).length > 0) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'CARD_LOCKED',
            message: `Card ${i + 1} is locked for your plan`
          }
        });
      }
      
      // Use default settings
      cards[i] = {
        media_url: setting.default_media_url,
        title: setting.default_title,
        description: setting.default_description,
        link_url: setting.default_link_url
      };
    }
  }
  
  req.body.cards = cards;
  next();
};
```

**Security Rules:**
- ✅ NEVER trust frontend locked state
- ✅ ALWAYS validate permissions on backend
- ✅ Log permission violations
- ✅ Fail secure (default deny)

---

## 4. DATABASE ARCHITECTURE

### 4.1. Database Choice

**PostgreSQL** (khuyến nghị)
- ✅ ACID compliance
- ✅ JSON support (JSONB)
- ✅ Full-text search
- ✅ Mature, stable
- ✅ Good performance

**Alternative:** MySQL/MariaDB

### 4.2. Schema Overview

**Core Tables:**
- `users` - User accounts
- `user_settings` - User preferences
- `facebook_accounts` - Facebook connections
- `facebook_pages` - Facebook pages
- `facebook_ad_accounts` - Ad accounts
- `posts` - Posts
- `post_videos` - Videos in posts
- `post_logs` - Post operation logs
- `system_logs` - System logs
- `admin_logs` - Admin action logs
- `sessions` - User sessions
- `app_settings` - Application settings

**Plan System Tables (NEW):**
- `plans` - Plan definitions (free, premium)
- `user_plans` - User subscriptions
- `plan_features` - Features per plan
- `card_settings` - Card 1/2 settings
- `user_feature_overrides` - Permission overrides

**Relationships:**
```
users (1) ─────< (1) user_settings
  │
  ├─────< (1) facebook_accounts
  │         │
  │         ├─────< (*) facebook_pages
  │         └─────< (*) facebook_ad_accounts
  │
  ├─────< (*) posts
  │         │
  │         ├─────< (*) post_videos
  │         └─────< (*) post_logs
  │
  ├─────< (*) sessions
  │
  ├─────< (1) user_plans (NEW - active plan)
  │         │
  │         └─────> (*) plans
  │                   │
  │                   └─────< (*) plan_features
  │
  └─────< (*) user_feature_overrides (NEW)

card_settings (NEW - global, 2 records)
```

**Tham chiếu:** [Database Plan](./04-database-plan.md) - Chi tiết schema

---

## 5. SECURITY ARCHITECTURE

### 5.1. Authentication

**JWT (JSON Web Token):**
- Access Token: 15 minutes
- Refresh Token: 7 days
- Stored in httpOnly cookie (refresh) + memory (access)

**Flow:**
```
1. User login → Generate tokens
2. Frontend stores access token in memory
3. Frontend stores refresh token in httpOnly cookie
4. Every API call: Authorization: Bearer {access_token}
5. Access token expired → Auto refresh
6. Refresh token expired → Re-login
```

### 5.2. Authorization

**RBAC (Role-Based Access Control):**
- Roles: user, admin, super_admin
- Permissions matrix per endpoint
- Ownership checks for resources

**Middleware Stack:**
```
Request → auth → rbac → ownership → controller
```

### 5.3. Data Encryption

**Facebook Tokens:**
- Algorithm: AES-256-GCM
- Encrypted before saving to DB
- Decrypted only when needed
- Never logged or returned to frontend

**Passwords:**
- Algorithm: bcrypt
- Salt rounds: 10
- Never returned in API responses

### 5.4. Security Headers

**Helmet.js:**
- Content Security Policy
- HSTS
- X-Frame-Options
- X-Content-Type-Options

**CORS:**
- Whitelist allowed origins
- Credentials: true
- Preflight caching

**Rate Limiting:**
- Login: 5 attempts/15 min
- API: 100 requests/hour
- Upload: 50 uploads/hour
- Post: 20 posts/hour

**Tham chiếu:** [Security Plan](./05-security-plan.md) - Chi tiết bảo mật

---

## 6. DEPLOYMENT ARCHITECTURE

### 6.1. Development Environment

```
localhost:5173  → Frontend (Vite dev server)
localhost:3000  → Backend API
localhost:5432  → PostgreSQL
localhost:6379  → Redis (optional)
```

### 6.2. Production Environment

**Option 1: Single Server (Small Scale)**
```
Server (VPS/EC2)
├── Nginx (Reverse Proxy, SSL)
├── Node.js (Backend API)
├── PostgreSQL (Database)
├── Redis (Cache)
└── Static Files (Frontend build)
```

**Option 2: Multi-Server (Large Scale)**
```
Load Balancer
├── App Server 1 (Node.js)
├── App Server 2 (Node.js)
└── App Server 3 (Node.js)
      │
      ├── Database Server (PostgreSQL + Replica)
      ├── Cache Server (Redis Cluster)
      └── Storage Server (S3 / NFS)
```

### 6.3. Nginx Configuration

```nginx
# User Frontend
server {
    listen 443 ssl http2;
    server_name thichcuu.com;
    
    root /var/www/thichcuu.com/frontend;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Admin Frontend
server {
    listen 443 ssl http2;
    server_name admin.thichcuu.com;
    
    root /var/www/thichcuu.com/admin;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3000/api/;
    }
}
```

---

## 7. MONITORING & LOGGING

### 7.1. Application Logging

**Winston Logger:**
- Levels: debug, info, warn, error
- Transports: Console, File, Database
- Structured logging (JSON)
- Log rotation

**Log Types:**
- System logs (all operations)
- Post logs (per-post operations)
- Admin logs (admin actions)
- Error logs (errors only)

### 7.2. Monitoring

**Metrics to Track:**
- API response times
- Error rates
- Database query times
- Memory usage
- CPU usage
- Disk usage

**Tools:**
- New Relic / DataDog (APM)
- Sentry (Error tracking)
- Prometheus + Grafana (Metrics)
- Uptime Robot (Uptime monitoring)

### 7.3. Alerting

**Alert Conditions:**
- API error rate > 5%
- Response time > 2s
- Database connection failed
- Disk usage > 80%
- Memory usage > 90%

---

## 8. BACKUP & DISASTER RECOVERY

### 8.1. Database Backup

**Strategy:**
- Daily full backup
- Hourly incremental backup
- Retention: 30 days
- Off-site storage (S3)

**Tools:**
- pg_dump (PostgreSQL)
- Automated backup scripts
- Backup verification

### 8.2. File Backup

**Strategy:**
- Sync to S3 / Cloud Storage
- Versioning enabled
- Lifecycle policies

### 8.3. Disaster Recovery

**RTO (Recovery Time Objective):** 4 hours
**RPO (Recovery Point Objective):** 1 hour

**Recovery Steps:**
1. Restore database from backup
2. Restore files from S3
3. Deploy application
4. Verify functionality
5. Update DNS if needed

---

## 9. SCALABILITY CONSIDERATIONS

### 9.1. Horizontal Scaling

**Application Layer:**
- Stateless API servers
- Load balancer (Nginx / HAProxy)
- Session in Redis (shared)

**Database Layer:**
- Read replicas
- Connection pooling
- Query optimization

### 9.2. Vertical Scaling

**When to scale:**
- CPU usage > 70%
- Memory usage > 80%
- Response time degrading

**How to scale:**
- Increase server resources
- Optimize queries
- Add caching

### 9.3. Caching Strategy

**Redis Cache:**
- User sessions
- Facebook pages/accounts (TTL: 1 hour)
- Rate limit counters
- API responses (selective)

---

## 10. CI/CD PIPELINE

### 10.1. Development Workflow

```
1. Developer commits code → Git
2. Git push → GitHub/GitLab
3. CI runs:
   - Linter (ESLint)
   - Tests (Jest, Playwright)
   - Build
4. If pass → Deploy to staging
5. Manual approval → Deploy to production
```

### 10.2. Tools

**CI/CD:**
- GitHub Actions
- GitLab CI
- Jenkins

**Deployment:**
- Docker + Docker Compose
- PM2 (Node.js process manager)
- Systemd (Linux service)

---

## KẾT LUẬN

**Kiến trúc đề xuất:**
- ✅ Scalable (horizontal + vertical)
- ✅ Secure (JWT, encryption, RBAC)
- ✅ Reliable (backup, monitoring, error handling)
- ✅ Maintainable (modular, tested, documented)
- ✅ Cost-effective (start small, scale as needed)

**Tham chiếu:**
- [API Plan](./08-api-plan.md) - Chi tiết APIs
- [Database Plan](./04-database-plan.md) - Chi tiết database
- [Security Plan](./05-security-plan.md) - Chi tiết bảo mật
- [Implementation Phases](./06-implementation-phases.md) - Kế hoạch triển khai

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-25  
**Status:** ✅ Completed

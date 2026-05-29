# BÀNG GIAO DỰ ÁN - THÍCH CỪU FACEBOOK VIDEO 2 Ô TOOL

**Ngày bàn giao:** 2026-05-26  
**Trạng thái:** MVP Structure Complete - Ready for Development

---

## 1. TỔNG QUAN ĐÃ LÀM

### ✅ Hoàn thành

**Phase 1: Audit Source Cũ**
- Đã phân tích source code cũ trong `fb-video-carousel-tool/`
- Hiểu rõ core logic: upload video → create ad creative → publish
- Xác định được phần code có thể tái sử dụng

**Phase 2: Setup Project Structure**
- ✅ Tạo monorepo structure với workspaces
- ✅ Backend (Node.js + Express) - cấu trúc đầy đủ
- ✅ Frontend (React + Vite) - skeleton
- ✅ Admin (chưa tạo, dùng chung frontend tạm)
- ✅ Root package.json với scripts

**Phase 3: Database Setup (Partial)**
- ✅ Tạo 5 migration files (17 tables theo docs)
- ✅ Tạo 2 seed files (plans + admin user)
- ✅ Migration script và seed script
- ⚠️ Chưa chạy migrations (cần PostgreSQL)

---

## 2. CẤU TRÚC PROJECT

```
claude/
├── server/                    # Backend API
│   ├── src/
│   │   ├── config/           # Database, env config
│   │   ├── routes/           # API routes (placeholder)
│   │   ├── controllers/      # Controllers (empty, cần implement)
│   │   ├── services/         # Business logic (empty, cần implement)
│   │   ├── repositories/     # Data access (empty, cần implement)
│   │   ├── models/           # Sequelize models (empty, cần implement)
│   │   ├── middleware/       # Auth, RBAC, etc (partial)
│   │   ├── jobs/             # Cron jobs (empty, cần implement)
│   │   ├── utils/            # Logger, helpers
│   │   ├── scripts/          # migrate.js, seed.js
│   │   ├── app.js            # Express app setup ✅
│   │   └── server.js         # Server entry point ✅
│   ├── migrations/           # 5 SQL migration files ✅
│   ├── seeds/                # 2 SQL seed files ✅
│   ├── tests/                # Empty (cần viết tests)
│   ├── uploads/              # Upload directory
│   ├── logs/                 # Log directory
│   ├── .env.example          # Environment template ✅
│   └── package.json          # Dependencies ✅
│
├── frontend/                 # User Frontend
│   ├── src/
│   │   ├── pages/            # Empty (cần implement)
│   │   ├── components/       # Empty (cần implement)
│   │   ├── services/         # API calls (empty)
│   │   ├── store/            # Redux store (empty)
│   │   ├── hooks/            # Custom hooks (empty)
│   │   ├── utils/            # Helpers (empty)
│   │   ├── styles/           # Tailwind CSS ✅
│   │   ├── App.jsx           # Placeholder ✅
│   │   └── main.jsx          # Entry point ✅
│   ├── index.html            # HTML template ✅
│   ├── vite.config.js        # Vite config ✅
│   ├── tailwind.config.js    # Tailwind config ✅
│   └── package.json          # Dependencies ✅
│
├── admin/                    # Admin Frontend (chưa tạo)
│
├── .gitignore                # Git ignore ✅
├── package.json              # Root package.json ✅
└── README.md                 # Project README ✅
```

---

## 3. DATABASE SCHEMA

### Tables đã tạo migrations (17 tables)

**Core Tables:**
1. ✅ `users` - User accounts
2. ✅ `sessions` - User sessions
3. ✅ `facebook_accounts` - Facebook connections
4. ✅ `facebook_pages` - Facebook pages
5. ✅ `facebook_ad_accounts` - Ad accounts
6. ✅ `posts` - Posts
7. ✅ `post_videos` - Videos in posts (2 cards)
8. ✅ `post_logs` - Post operation logs
9. ✅ `system_logs` - System logs
10. ✅ `admin_logs` - Admin action logs
11. ✅ `app_settings` - Application settings

**Plan System Tables (NEW):**
12. ✅ `plans` - Plan definitions (free, premium)
13. ✅ `user_plans` - User subscriptions
14. ✅ `plan_features` - Features per plan
15. ✅ `card_settings` - Card 1/2 settings
16. ✅ `user_feature_overrides` - Permission overrides

**Seed Data:**
- ✅ 2 plans: free, premium với features
- ✅ 2 card settings: card 1 (unlocked), card 2 (locked for free)
- ✅ 1 admin user: admin@thichcuu.com / Admin@123456

---

## 4. BACKEND API

### Đã implement

**Config:**
- ✅ `config/env.js` - Environment variables
- ✅ `config/database.js` - Sequelize connection

**Core:**
- ✅ `app.js` - Express app với middleware
- ✅ `server.js` - Server startup
- ✅ `utils/logger.js` - Winston logger
- ✅ `middleware/errorHandler.js` - Error handling
- ✅ `routes/index.js` - Route aggregator (placeholder)

**Scripts:**
- ✅ `scripts/migrate.js` - Run migrations
- ✅ `scripts/seed.js` - Run seeds

### ⏳ Chưa implement (cần làm)

**Phase 8: Auth APIs (13 endpoints)**
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/logout
- GET /api/v1/auth/me
- POST /api/v1/auth/refresh
- PUT /api/v1/auth/password
- POST /api/v1/auth/forgot-password
- POST /api/v1/auth/reset-password
- GET /api/v1/auth/verify-email
- GET /api/v1/user/profile
- PUT /api/v1/user/profile
- GET /api/v1/user/settings
- PUT /api/v1/user/settings

**Phase 9: Facebook APIs (7 endpoints)**
- POST /api/v1/facebook/connect
- POST /api/v1/facebook/oauth/callback
- GET /api/v1/facebook/status
- GET /api/v1/facebook/pages
- GET /api/v1/facebook/ad-accounts
- POST /api/v1/facebook/refresh-token
- POST /api/v1/facebook/disconnect

**Phase 10: Video APIs (4 endpoints)**
- POST /api/v1/videos/upload
- POST /api/v1/videos/validate
- GET /api/v1/videos/:id
- DELETE /api/v1/videos/:id

**Phase 11-12: Post APIs (6 endpoints)**
- POST /api/v1/posts
- POST /api/v1/posts/validate
- POST /api/v1/posts/:id/publish
- POST /api/v1/posts/:id/schedule
- DELETE /api/v1/posts/:id/schedule
- POST /api/v1/posts/:id/retry

**Phase 13: History/Log APIs (5 endpoints)**
- GET /api/v1/posts
- GET /api/v1/posts/:id
- DELETE /api/v1/posts/:id
- GET /api/v1/posts/:id/logs
- GET /api/v1/logs

**Phase 14: Admin APIs (12 endpoints)**
- GET /api/v1/admin/dashboard/stats
- GET /api/v1/admin/dashboard/activity
- GET /api/v1/admin/users
- GET /api/v1/admin/users/:id
- PUT /api/v1/admin/users/:id/ban
- PUT /api/v1/admin/users/:id/unban
- DELETE /api/v1/admin/users/:id
- GET /api/v1/admin/posts
- GET /api/v1/admin/logs
- GET /api/v1/admin/logs/top-errors
- GET /api/v1/admin/settings
- PUT /api/v1/admin/settings

**Phase 18-20: Plan APIs (14 endpoints)**
- GET /api/v1/me/plan
- GET /api/v1/me/permissions
- GET /api/v1/me/card-settings
- GET /api/v1/admin/plans
- POST /api/v1/admin/plans
- GET /api/v1/admin/plans/:id
- PATCH /api/v1/admin/plans/:id
- GET /api/v1/admin/plans/:id/features
- PATCH /api/v1/admin/plans/:id/features
- PATCH /api/v1/admin/users/:id/plan
- POST /api/v1/admin/users/:id/feature-overrides
- GET /api/v1/admin/users/:id/feature-overrides
- DELETE /api/v1/admin/users/:id/feature-overrides/:override_id
- GET /api/v1/admin/card-settings
- PATCH /api/v1/admin/card-settings/card-2
- POST /api/v1/admin/card-settings/card-2/default-media
- DELETE /api/v1/admin/card-settings/card-2/default-media

**Tổng:** 61 APIs cần implement

---

## 5. FRONTEND

### Đã implement
- ✅ Vite setup với React
- ✅ Tailwind CSS config
- ✅ Basic App.jsx placeholder
- ✅ Folder structure

### ⏳ Chưa implement (cần làm)

**Phase 5-6: UI/UX**
- Login/Register pages
- Dashboard
- Facebook Connect page
- Create Post page (với card locking UI)
- Post History page
- Post Detail page
- Settings page
- Admin Dashboard
- Admin User Management
- Admin Plan Management
- Admin Card Settings

**Components cần tạo:**
- Layout components (Header, Sidebar, Footer)
- Auth components (LoginForm, RegisterForm)
- Post components (VideoUploader, CardPreview, PostForm)
- Plan components (PlanBadge, CardLocked, UpgradePrompt)
- Admin components (DataTable, Chart, StatCard)

---

## 6. NHỮNG PHẦN QUAN TRỌNG CHƯA LÀM

### 🔴 Critical (cần làm ngay)

1. **Sequelize Models** (Phase 3)
   - Tạo models cho 17 tables
   - Define relationships
   - Cần file: `server/src/models/*.js`

2. **Auth System** (Phase 4, 8)
   - JWT middleware
   - RBAC middleware
   - Password hashing (bcrypt)
   - Auth controllers và services
   - Cần file: `server/src/middleware/auth.js`, `rbac.js`

3. **Facebook Integration** (Phase 9)
   - Token encryption service (AES-256-GCM)
   - Facebook API wrapper
   - OAuth flow
   - Cần file: `server/src/services/encryption.service.js`, `facebook.service.js`

4. **Core Posting Logic** (Phase 12)
   - Upload video to Facebook
   - Create ad creative
   - Publish post
   - Retry mechanism
   - Cần file: `server/src/services/postWorkflow.service.js`

### 🟡 Important (cần làm sau)

5. **Plan Permission System** (Phase 18-20)
   - Permission middleware
   - Card validation middleware
   - Plan limit checks
   - Cần file: `server/src/middleware/requirePermission.js`, `validateCardPermissions.js`

6. **Admin Panel** (Phase 14)
   - Admin controllers
   - Admin UI pages
   - User management
   - Plan management

7. **Testing** (Phase 15-16)
   - Unit tests
   - Integration tests
   - E2E tests
   - Security tests

---

## 7. HƯỚNG DẪN CHẠY PROJECT

### Bước 1: Cài đặt dependencies

```bash
cd C:\Users\ThichMMO\Desktop\2ô\claude

# Install root dependencies
npm install

# Install workspace dependencies
npm install --workspaces
```

### Bước 2: Setup PostgreSQL

```bash
# Tạo database
createdb thichcuu_dev

# Hoặc dùng psql
psql -U postgres
CREATE DATABASE thichcuu_dev;
\q
```

### Bước 3: Cấu hình environment

```bash
# Copy .env.example
cd server
cp .env.example .env

# Edit .env với thông tin database của bạn
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=thichcuu_dev
# DB_USER=postgres
# DB_PASSWORD=your_password
```

### Bước 4: Run migrations và seeds

```bash
# Từ root folder
npm run migrate
npm run seed
```

### Bước 5: Start development servers

```bash
# Start tất cả services
npm run dev

# Hoặc start riêng từng service
npm run dev:server    # Backend: http://localhost:3001
npm run dev:frontend  # Frontend: http://localhost:5173
```

### Bước 6: Test API

```bash
# Health check
curl http://localhost:3001/health

# API root
curl http://localhost:3001/api/v1
```

---

## 8. NHỮNG VIỆC NÊN LÀM TIẾP THEO

### Priority 1: Core Features (1-2 tuần)

1. **Tạo Sequelize Models**
   - File: `server/src/models/User.js`, `Post.js`, `Plan.js`, etc.
   - Define relationships
   - Test với database

2. **Implement Auth APIs**
   - Register, Login, Logout
   - JWT middleware
   - Password hashing
   - Test với Postman/Thunder Client

3. **Implement Facebook Connection**
   - Token encryption
   - Connect Facebook API
   - Get pages và ad accounts
   - Test với Facebook token thật

4. **Implement Video Upload**
   - Multer setup
   - File validation
   - Thumbnail generation (ffmpeg)
   - Test upload

### Priority 2: Posting Features (1-2 tuần)

5. **Implement Create Post**
   - Draft post
   - Validation
   - Preview

6. **Implement Publish Post**
   - Upload videos to Facebook
   - Create ad creative
   - Publish to page
   - Logging
   - Test end-to-end

7. **Implement Post History**
   - List posts
   - Post detail
   - Logs

### Priority 3: Plan System (1 tuần)

8. **Implement Plan Permissions**
   - Permission middleware
   - Card validation
   - Plan limits
   - Test với free/premium users

9. **Implement Admin Plan Management**
   - Manage plans
   - Assign plans
   - Override permissions

### Priority 4: Admin & Polish (1 tuần)

10. **Implement Admin Panel**
    - Dashboard
    - User management
    - System logs

11. **Testing & Security**
    - Write tests
    - Security review
    - Fix vulnerabilities

12. **Deployment**
    - Docker setup
    - Production config
    - Deploy to VPS

---

## 9. RỦI RO VÀ LƯU Ý

### ⚠️ Rủi ro kỹ thuật

1. **Facebook API Changes**
   - Facebook có thể thay đổi API bất cứ lúc nào
   - Cần monitor Facebook changelog
   - Có fallback plan

2. **Token Expiration**
   - Facebook tokens hết hạn sau 60 ngày
   - Cần implement auto-refresh
   - Notify users khi token sắp hết hạn

3. **Video Upload Failures**
   - Upload video lớn có thể fail
   - Cần retry mechanism
   - Cần chunked upload cho file lớn

4. **Database Performance**
   - Cần indexes cho queries thường dùng
   - Cần pagination cho lists
   - Cần caching (Redis) nếu traffic cao

### ⚠️ Security Issues

1. **Token Storage**
   - Facebook tokens PHẢI được encrypt
   - Không log tokens
   - Không trả tokens về frontend

2. **Plan Permissions**
   - PHẢI validate permissions ở backend
   - Không tin frontend locked state
   - Free user gửi card 2 data → MUST reject

3. **Rate Limiting**
   - Cần implement rate limiting
   - Prevent abuse
   - Protect Facebook API quota

---

## 10. TÀI LIỆU THAM KHẢO

### Tài liệu đã có

Tất cả tài liệu chi tiết nằm trong `.claude/docs/`:

1. **[00-README.md](../.claude/docs/00-README.md)** - Tổng quan dự án
2. **[01-source-analysis.md](../.claude/docs/01-source-analysis.md)** - Phân tích source cũ
3. **[02-requirements.md](../.claude/docs/02-requirements.md)** - Yêu cầu chức năng (61 APIs)
4. **[03-architecture-plan.md](../.claude/docs/03-architecture-plan.md)** - Kiến trúc hệ thống
5. **[04-database-plan.md](../.claude/docs/04-database-plan.md)** - Database schema (17 tables)
6. **[05-security-plan.md](../.claude/docs/05-security-plan.md)** - Bảo mật
7. **[06-implementation-phases.md](../.claude/docs/06-implementation-phases.md)** - 20 phases chi tiết
8. **[07-testing-plan.md](../.claude/docs/07-testing-plan.md)** - Testing strategy
9. **[08-api-plan.md](../.claude/docs/08-api-plan.md)** - Chi tiết 61 APIs

### Source code cũ (tham khảo)

- `../fb-video-carousel-tool/create-carousel.js` - Core logic đăng carousel
- `../fb-video-carousel-tool/server.js` - Web UI server

---

## 11. LIÊN HỆ & HỖ TRỢ

### Nếu gặp vấn đề

1. **Database connection failed**
   - Check PostgreSQL đang chạy
   - Check credentials trong `.env`
   - Check database đã tạo chưa

2. **Migration failed**
   - Check SQL syntax
   - Check database permissions
   - Run migrations từng file để debug

3. **Dependencies install failed**
   - Delete `node_modules/` và `package-lock.json`
   - Run `npm install` lại
   - Check Node.js version (cần 18+)

4. **Facebook API errors**
   - Check token còn hiệu lực
   - Check permissions
   - Check Graph API version

---

## 12. KẾT LUẬN

### ✅ Đã hoàn thành

- Project structure setup
- Database migrations (17 tables)
- Seed data (plans, admin user)
- Backend skeleton (Express + config)
- Frontend skeleton (React + Vite)
- Documentation đầy đủ

### ⏳ Chưa hoàn thành (cần làm)

- 61 API endpoints
- Sequelize models
- Auth system
- Facebook integration
- Video upload
- Post workflow
- Plan permission system
- Admin panel
- Frontend UI
- Testing

### 📊 Tiến độ ước tính

- **Đã làm:** ~15% (structure + database)
- **Còn lại:** ~85% (implementation)
- **Thời gian ước tính:** 8-12 tuần (theo docs)

### 🎯 Next Steps

1. Cài dependencies: `npm install --workspaces`
2. Setup PostgreSQL database
3. Run migrations: `npm run migrate`
4. Run seeds: `npm run seed`
5. Start coding Phase 8 (Auth APIs)

---

**Chúc bạn code thành công! 🚀**

**Document Version:** 1.0  
**Last Updated:** 2026-05-26  
**Status:** MVP Structure Complete

---

## QA Full Test And Fix Update - 2026-05-27

- Full QA/Admin/User/API security pass da duoc ghi tai `QA-FULL-TEST-AND-FIX-REPORT.md`.
- Docs handover moi: `.claude/docs/HANDOVER.md`.
- Admin login da verify: `admin@thichcuu.com` / `Admin@123456`.
- Free user: `free.user@example.test` / `Demo@123456`.
- Premium user: `premium.user@example.test` / `Demo@123456`.
- Backend: `http://localhost:3001/api/v1`.
- User frontend: `http://localhost:5173`.
- Admin route: `http://localhost:5173/admin`.
- Luu y: Facebook OAuth/publish live, SMTP send live va payment live can credential/env that. Dev/mock flow da test pass.
- Update them: Page carousel publish da co Facebook Ad Account dropdown/validation. Bai live cua `premium.user@example.test` tren Page `Admin set` da publish voi `fbPostId=372874445919974_122214297548538429`, `facebookCreativeId=1693991625065943`.
- Update them: Fix loi `Invalid parameter` cho post `abc abc` co Card 1 video/Card 2 image. Backend them `image_hash` thumbnail cho video child attachment va chi cho dung ad account status `1`/`ACTIVE`. Post da publish voi `fbPostId=372874445919974_122214303860538429`, `facebookCreativeId=1702768317628336`.
- Update them: Fix loi local bao `published` nhung Page chua hien bai. Backend bay gio publish Page story bang Page token, verify `is_published=true` va `is_hidden=false`, luu `fbPostUrl`, va user/admin UI hien permalink. Post `abc abc` da verify live Graph voi permalink `https://www.facebook.com/61566152891343/posts/pfbid02mjJ6DnvPt8pj8QuseLZor7Mn75Mmp5Ct1EV7ManoYP6bEe47bk2B2FSnVMHTqR4il`.
- Update 2026-05-28: Fix System Settings branding. Backend now serves `/uploads`, Helmet allows cross-origin branding images, public branding endpoint added at `/api/v1/settings/public`, admin Settings preview URL fixed, and admin/user UI uses saved site name/logo/favicon. Regression now 18/18 backend tests plus admin/frontend build pass.
- Update 2026-05-28: Verify/fix Card Settings locks/media. Card 1 lock now enforced by backend, Card 2 Premium lock regression covered, allowed media types enforced for user uploads and admin default media uploads. Regression now 19/19 backend tests plus admin/frontend build pass; live API smoke pass.
- Update 2026-05-29: Added public landing page at `http://localhost:5173/`, with branding from `/api/v1/settings/public`, pricing from new `GET /api/v1/public/plans`, and real app screenshot asset `frontend/public/landing-dashboard.png`. Regression now 20/20 backend tests; frontend build and Playwright landing smoke pass.
- Update 2026-05-29: Fixed blank user frontend, then moved admin back under the same frontend origin at `/admin` for hosting. `npm.cmd run dev` now starts only backend + frontend; admin login is `http://localhost:5173/admin/login`. Backend tests, frontend build, and Playwright same-port admin smoke pass.
- Port `127.0.0.1:3000` dang bi `Kinx Auto.exe` chiem nen local dev dung backend `3001`.

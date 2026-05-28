# IMPLEMENTATION PHASES - THÍCH CỪU FACEBOOK VIDEO 2 Ô TOOL

## TỔNG QUAN

**Tổng số phases:** 17 phases

**Timeline ước tính:** 8-12 tuần (60-75 ngày làm việc)

**Team size:** 1-2 developers

---

## PHASE 1: AUDIT SOURCE CŨ

**Thời gian:** 1 ngày

**Mục tiêu:** Phân tích source code hiện tại, hiểu cách hoạt động, xác định những phần có thể reuse.

### Công việc

1. **Đọc source code hiện tại**
   - Xác định tech stack
   - Xác định cấu trúc folder
   - Xác định các chức năng chính

2. **Phân tích luồng hoạt động**
   - Luồng kết nối Facebook
   - Luồng upload video
   - Luồng tạo carousel post
   - Luồng publish

3. **Xác định điểm mạnh/yếu**
   - Những phần code tốt có thể reuse
   - Những phần cần viết lại
   - Rủi ro kỹ thuật

4. **Viết báo cáo phân tích**
   - Document findings
   - Recommendations

### Kết quả mong đợi

- ✅ Document phân tích source cũ
- ✅ Hiểu rõ cách tool hoạt động
- ✅ Xác định được core logic có thể reuse

### Tham chiếu

- [Source Analysis](./01-source-analysis.md)

**Trạng thái:** ✅ **Hoàn thành**

---

## PHASE 2: XÁC ĐỊNH KIẾN TRÚC

**Thời gian:** 2-3 ngày

**Mục tiêu:** Thiết kế kiến trúc hệ thống mới, xác định tech stack, thiết kế high-level architecture.

### Công việc

1. **Xác định tech stack**
   - Frontend: React + Vite
   - Backend: Node.js + Express
   - Database: PostgreSQL
   - Cache: Redis (optional)
   - Storage: Local / S3

2. **Thiết kế high-level architecture**
   - Client layer
   - API Gateway
   - Application layer
   - Data layer
   - Storage layer
   - External services

3. **Thiết kế backend structure**
   - Routes
   - Controllers
   - Services
   - Repositories
   - Models
   - Middleware

4. **Thiết kế frontend structure**
   - Pages
   - Components
   - Services
   - Store
   - Hooks
   - Utils

5. **Xác định deployment strategy**
   - Development environment
   - Production environment
   - CI/CD pipeline

6. **Viết architecture document**

### APIs liên quan

- Chưa có (đang thiết kế)

### Kết quả mong đợi

- ✅ Architecture document hoàn chỉnh
- ✅ Tech stack đã xác định
- ✅ Folder structure đã thiết kế
- ✅ Deployment strategy đã xác định

### Tham chiếu

- [Architecture Plan](./03-architecture-plan.md)

**Trạng thái:** ⏳ Chờ bắt đầu

---

## PHASE 3: THIẾT KẾ DATABASE

**Thời gian:** 2-3 ngày

**Mục tiêu:** Thiết kế database schema, relationships, indexes, migrations.

### Công việc

1. **Thiết kế database schema**
   - 12 tables: users, user_settings, facebook_accounts, facebook_pages, facebook_ad_accounts, posts, post_videos, post_logs, system_logs, admin_logs, sessions, app_settings
   - Columns cho mỗi table
   - Data types
   - Constraints

2. **Thiết kế relationships**
   - 1:1 relationships
   - 1:N relationships
   - Foreign keys
   - Cascade rules

3. **Thiết kế indexes**
   - Primary keys
   - Foreign keys
   - Query optimization indexes

4. **Viết migrations**
   - 12 migration files
   - Up/down scripts
   - Seed data (admin user, default settings)

5. **Viết database document**

### APIs liên quan

- Chưa có (đang thiết kế)

### Kết quả mong đợi

- ✅ Database schema hoàn chỉnh
- ✅ 12 migration files
- ✅ Seed data scripts
- ✅ Database document

### Tham chiếu

- [Database Plan](./04-database-plan.md)

**Trạng thái:** ⏳ Chờ bắt đầu

---

## PHASE 4: AUTH + RBAC

**Thời gian:** 3-4 ngày

**Mục tiêu:** Thiết kế authentication và authorization system (JWT, RBAC, ownership checks).

### Công việc

1. **Thiết kế JWT authentication**
   - Access token (15 min)
   - Refresh token (7 days)
   - Token generation
   - Token verification
   - Token rotation

2. **Thiết kế RBAC**
   - Roles: user, admin, super_admin
   - Permission matrix
   - Role middleware

3. **Thiết kế ownership checks**
   - Ownership middleware
   - Resource access control

4. **Thiết kế password security**
   - Bcrypt hashing
   - Password validation
   - Password reset flow

5. **Thiết kế session management**
   - Session storage
   - Session cleanup

6. **Viết security document**

### APIs liên quan

- Chưa implement (đang thiết kế)

### Kết quả mong đợi

- ✅ Auth system design hoàn chỉnh
- ✅ RBAC design hoàn chỉnh
- ✅ Security document

### Tham chiếu

- [Security Plan](./05-security-plan.md)
- [API Plan - Auth APIs](./08-api-plan.md#2-auth-apis)

**Trạng thái:** ⏳ Chờ bắt đầu

---

## PHASE 5: UI/UX USER SIDE

**Thời gian:** 4-5 ngày

**Mục tiêu:** Thiết kế UI/UX cho user side (wireframes, mockups, design system).

### Công việc

1. **Thiết kế wireframes**
   - Login/Register pages
   - Dashboard
   - Facebook Connect page
   - Create Post page (với preview)
   - Post History page
   - Post Detail page
   - Settings page

2. **Thiết kế mockups**
   - High-fidelity designs
   - Color scheme
   - Typography
   - Icons

3. **Thiết kế design system**
   - Components library
   - Button styles
   - Input styles
   - Modal styles
   - Card styles

4. **Thiết kế user flows**
   - Registration flow
   - Login flow
   - Facebook connection flow
   - Create post flow
   - Schedule post flow

5. **Viết UI/UX document**

### Kết quả mong đợi

- ✅ Wireframes cho tất cả pages
- ✅ Mockups cho key pages
- ✅ Design system
- ✅ User flows
- ✅ UI/UX document

**Trạng thái:** ⏳ Chờ bắt đầu

---

## PHASE 6: UI/UX ADMIN SIDE

**Thời gian:** 3-4 ngày

**Mục tiêu:** Thiết kế UI/UX cho admin panel.

### Công việc

1. **Thiết kế wireframes**
   - Admin Dashboard
   - User Management page
   - User Detail page
   - Post Management page
   - System Logs page
   - Settings page

2. **Thiết kế mockups**
   - Dashboard với charts
   - Data tables
   - Filters
   - Actions (ban, unban, delete)

3. **Thiết kế admin flows**
   - View users flow
   - Ban user flow
   - View logs flow

4. **Viết UI/UX document**

### Kết quả mong đợi

- ✅ Wireframes cho admin pages
- ✅ Mockups cho key pages
- ✅ Admin flows
- ✅ UI/UX document

**Trạng thái:** ⏳ Chờ bắt đầu

---

## PHASE 7: LAYOUT NỀN TẢNG

**Thời gian:** 2-3 ngày

**Mục tiêu:** Setup project, implement layout components, routing.

### Công việc

1. **Setup frontend project**
   - Create React + Vite project
   - Install dependencies (React Router, Redux, Tailwind, Axios)
   - Configure Vite
   - Configure Tailwind

2. **Setup backend project**
   - Create Node.js + Express project
   - Install dependencies (Express, Sequelize, bcrypt, jsonwebtoken, etc.)
   - Configure Express
   - Configure database connection

3. **Implement layout components**
   - Header
   - Sidebar
   - Footer
   - Main layout

4. **Setup routing**
   - Frontend routes
   - Backend routes structure
   - Route guards

5. **Setup environment variables**
   - .env.example
   - .env files

### APIs liên quan

- Chưa có (chỉ setup structure)

### Kết quả mong đợi

- ✅ Frontend project setup
- ✅ Backend project setup
- ✅ Layout components
- ✅ Routing setup
- ✅ Environment variables

**Trạng thái:** ⏳ Chờ bắt đầu

---

## PHASE 8: AUTH/USER MANAGEMENT

**Thời gian:** 3-4 ngày

**Mục tiêu:** Implement authentication và user management (register, login, profile, settings).

### Công việc

1. **Backend: Implement Auth APIs**
   - POST /api/v1/auth/register
   - POST /api/v1/auth/login
   - POST /api/v1/auth/logout
   - GET /api/v1/auth/me
   - POST /api/v1/auth/refresh
   - PUT /api/v1/auth/password
   - POST /api/v1/auth/forgot-password
   - POST /api/v1/auth/reset-password
   - GET /api/v1/auth/verify-email

2. **Backend: Implement User APIs**
   - GET /api/v1/user/profile
   - PUT /api/v1/user/profile
   - GET /api/v1/user/settings
   - PUT /api/v1/user/settings

3. **Backend: Implement middleware**
   - auth.js (JWT verification)
   - rbac.js (role check)
   - validator.js (input validation)

4. **Frontend: Implement Auth pages**
   - Login page
   - Register page
   - Forgot Password page
   - Reset Password page

5. **Frontend: Implement User pages**
   - Profile page
   - Settings page

6. **Frontend: Implement auth service**
   - API calls
   - Token management
   - Auto refresh

7. **Testing**
   - Unit tests cho services
   - Integration tests cho APIs
   - E2E tests cho auth flows

### APIs implement

- ✅ POST /api/v1/auth/register
- ✅ POST /api/v1/auth/login
- ✅ POST /api/v1/auth/logout
- ✅ GET /api/v1/auth/me
- ✅ POST /api/v1/auth/refresh
- ✅ PUT /api/v1/auth/password
- ✅ POST /api/v1/auth/forgot-password
- ✅ POST /api/v1/auth/reset-password
- ✅ GET /api/v1/auth/verify-email
- ✅ GET /api/v1/user/profile
- ✅ PUT /api/v1/user/profile
- ✅ GET /api/v1/user/settings
- ✅ PUT /api/v1/user/settings

### Cách test

- ✅ Register user mới
- ✅ Login với credentials đúng
- ✅ Login với credentials sai → error
- ✅ Get profile
- ✅ Update profile
- ✅ Logout
- ✅ Refresh token
- ✅ Change password
- ✅ Forgot password flow
- ✅ Email verification flow

### Kết quả mong đợi

- ✅ 13 APIs hoạt động
- ✅ Auth pages hoạt động
- ✅ User pages hoạt động
- ✅ Tests pass

### Tham chiếu

- [API Plan - Auth APIs](./08-api-plan.md#2-auth-apis)
- [API Plan - User APIs](./08-api-plan.md#3-user-apis)
- [Security Plan](./05-security-plan.md)

**Trạng thái:** ⏳ Chờ bắt đầu

---

## PHASE 9: FACEBOOK CONNECTION

**Thời gian:** 3-4 ngày

**Mục tiêu:** Implement Facebook connection (manual token + OAuth, pages, ad accounts).

### Công việc

1. **Backend: Implement Facebook APIs**
   - POST /api/v1/facebook/connect
   - POST /api/v1/facebook/oauth/callback
   - GET /api/v1/facebook/status
   - GET /api/v1/facebook/pages
   - GET /api/v1/facebook/ad-accounts
   - POST /api/v1/facebook/refresh-token
   - POST /api/v1/facebook/disconnect

2. **Backend: Implement encryption service**
   - encryptToken() - AES-256-GCM
   - decryptToken()
   - Key management

3. **Backend: Implement Facebook service**
   - validateToken()
   - getPages()
   - getAdAccounts()
   - refreshToken()

4. **Frontend: Implement Facebook Connect page**
   - Manual token input
   - OAuth button
   - Connection status
   - Pages list
   - Ad accounts list
   - Disconnect button

5. **Frontend: Implement Facebook service**
   - API calls
   - Error handling

6. **Testing**
   - Unit tests cho encryption
   - Integration tests cho Facebook APIs
   - E2E tests cho connection flow

### APIs implement

- ✅ POST /api/v1/facebook/connect
- ✅ POST /api/v1/facebook/oauth/callback
- ✅ GET /api/v1/facebook/status
- ✅ GET /api/v1/facebook/pages
- ✅ GET /api/v1/facebook/ad-accounts
- ✅ POST /api/v1/facebook/refresh-token
- ✅ POST /api/v1/facebook/disconnect

### Cách test

- ✅ Connect với token hợp lệ
- ✅ Token được encrypt trong DB
- ✅ Get pages
- ✅ Get ad accounts
- ✅ Refresh token
- ✅ Disconnect
- ❌ Connect với token invalid → error
- ❌ Connect với token thiếu permissions → error

### Kết quả mong đợi

- ✅ 7 APIs hoạt động
- ✅ Facebook Connect page hoạt động
- ✅ Token encryption hoạt động
- ✅ Tests pass

### Tham chiếu

- [API Plan - Facebook APIs](./08-api-plan.md#4-facebook-connection-apis)
- [Security Plan - Encryption](./05-security-plan.md#41-facebook-access-tokens)

**Trạng thái:** ⏳ Chờ bắt đầu

---

## PHASE 10: UPLOAD + PREVIEW

**Thời gian:** 4-5 ngày

**Mục tiêu:** Implement video upload, validation, preview.

### Công việc

1. **Backend: Implement Video APIs**
   - POST /api/v1/videos/upload
   - POST /api/v1/videos/validate
   - GET /api/v1/videos/:id
   - DELETE /api/v1/videos/:id

2. **Backend: Implement video processing**
   - File upload (multer)
   - File validation (type, size)
   - Video validation (ffmpeg - duration, resolution)
   - Thumbnail generation (ffmpeg)
   - Metadata extraction

3. **Backend: Implement storage**
   - Local storage structure
   - File cleanup (cron job)

4. **Frontend: Implement VideoUploader component**
   - Drag & drop
   - File picker
   - Progress bar
   - Preview thumbnail
   - Validation feedback

5. **Frontend: Implement video service**
   - Upload with progress
   - Validate before upload
   - Error handling

6. **Testing**
   - Unit tests cho validation
   - Integration tests cho upload APIs
   - E2E tests cho upload flow

### APIs implement

- ✅ POST /api/v1/videos/upload
- ✅ POST /api/v1/videos/validate
- ✅ GET /api/v1/videos/:id
- ✅ DELETE /api/v1/videos/:id

### Cách test

- ✅ Upload video hợp lệ (MP4, <500MB, <5min)
- ✅ Thumbnail được generate
- ✅ Metadata được extract
- ✅ Get video info
- ✅ Delete video
- ❌ Upload file không phải video → error
- ❌ Upload file quá lớn → error
- ❌ Upload video quá dài → error

### Kết quả mong đợi

- ✅ 4 APIs hoạt động
- ✅ VideoUploader component hoạt động
- ✅ Thumbnail generation hoạt động
- ✅ Tests pass

### Tham chiếu

- [API Plan - Video APIs](./08-api-plan.md#5-uploadvideo-apis)

**Trạng thái:** ⏳ Chờ bắt đầu

---

## PHASE 11: CREATE POST + VALIDATION

**Thời gian:** 3-4 ngày

**Mục tiêu:** Implement create post, validation, preview.

### Công việc

1. **Backend: Implement Post APIs (draft)**
   - POST /api/v1/posts (create draft)
   - POST /api/v1/posts/validate

2. **Backend: Implement validation service**
   - Validate Facebook connection
   - Validate page access
   - Validate ad account access
   - Validate videos uploaded
   - Validate cards data

3. **Frontend: Implement Create Post page**
   - Select page
   - Select ad account
   - Upload/select 2 videos
   - Input card 1 info (title, description, link, CTA)
   - Input card 2 info
   - Input message/caption
   - Preview section (2 cards side by side)
   - Validation checklist
   - Save draft button

4. **Frontend: Implement CardPreview component**
   - Video thumbnail
   - Title
   - Description
   - CTA button

5. **Frontend: Implement PostForm component**
   - Form fields
   - Validation
   - Real-time preview update

6. **Testing**
   - Unit tests cho validation
   - Integration tests cho APIs
   - E2E tests cho create post flow

### APIs implement

- ✅ POST /api/v1/posts (draft)
- ✅ POST /api/v1/posts/validate

### Cách test

- ✅ Create draft post
- ✅ Validate post → all checks pass
- ✅ Preview updates real-time
- ❌ Validate với Facebook not connected → error
- ❌ Validate với videos not uploaded → error

### Kết quả mong đợi

- ✅ 2 APIs hoạt động
- ✅ Create Post page hoạt động
- ✅ Preview hoạt động
- ✅ Validation hoạt động
- ✅ Tests pass

### Tham chiếu

- [API Plan - Post APIs](./08-api-plan.md#6-create-post-apis)

**Trạng thái:** ⏳ Chờ bắt đầu

---

## PHASE 12: POSTING API

**Thời gian:** 5-6 ngày

**Mục tiêu:** Implement publish post, schedule post, retry failed post. **Phase quan trọng nhất!**

### Công việc

1. **Backend: Implement Post APIs (publish)**
   - POST /api/v1/posts/:id/publish
   - POST /api/v1/posts/:id/schedule
   - DELETE /api/v1/posts/:id/schedule
   - POST /api/v1/posts/:id/retry

2. **Backend: Implement post workflow service**
   - Upload video 1 to Facebook
   - Upload video 2 to Facebook
   - Create ad creative (carousel)
   - Publish to page
   - Poll effective_object_story_id
   - Error handling
   - Retry mechanism

3. **Backend: Implement logging**
   - Log mỗi bước
   - Log errors chi tiết
   - Save to post_logs table

4. **Backend: Implement scheduled posts job**
   - Cron job check scheduled posts
   - Publish posts at scheduled time

5. **Frontend: Implement publish flow**
   - Publish button
   - Confirmation modal
   - Progress indicator (steps)
   - Success/error feedback

6. **Frontend: Implement schedule flow**
   - Date/time picker
   - Timezone selector
   - Schedule button
   - Confirmation

7. **Testing**
   - Unit tests cho workflow
   - Integration tests với Facebook API thật
   - E2E tests cho publish flow
   - Test scheduled posts job

### APIs implement

- ✅ POST /api/v1/posts/:id/publish
- ✅ POST /api/v1/posts/:id/schedule
- ✅ DELETE /api/v1/posts/:id/schedule
- ✅ POST /api/v1/posts/:id/retry

### Cách test

- ✅ Publish post → success
- ✅ Videos upload lên Facebook
- ✅ Creative được tạo
- ✅ Post publish lên page
- ✅ Logs được ghi đầy đủ
- ✅ Schedule post
- ✅ Scheduled post tự động publish
- ✅ Retry failed post
- ❌ Publish với token expired → error
- ❌ Publish với page không accessible → error

### Kết quả mong đợi

- ✅ 4 APIs hoạt động
- ✅ Publish flow hoạt động end-to-end
- ✅ Schedule flow hoạt động
- ✅ Retry mechanism hoạt động
- ✅ Logging đầy đủ
- ✅ Tests pass

### Tham chiếu

- [API Plan - Post APIs](./08-api-plan.md#6-create-post-apis)

**Trạng thái:** ⏳ Chờ bắt đầu

---

## PHASE 13: POST HISTORY/LOG

**Thời gian:** 2-3 ngày

**Mục tiêu:** Implement post history, post detail, logs.

### Công việc

1. **Backend: Implement Post History APIs**
   - GET /api/v1/posts (list)
   - GET /api/v1/posts/:id (detail)
   - DELETE /api/v1/posts/:id
   - GET /api/v1/posts/:id/logs

2. **Backend: Implement Log APIs**
   - GET /api/v1/logs

3. **Frontend: Implement Post History page**
   - Posts list (table/cards)
   - Filters (status, page, date)
   - Search
   - Pagination
   - Actions (view, delete)

4. **Frontend: Implement Post Detail page**
   - Post info
   - 2 videos preview
   - Cards info
   - Status
   - Logs timeline
   - Link to Facebook post
   - Actions (retry if failed)

5. **Frontend: Implement Logs page**
   - User logs
   - Filters
   - Pagination

6. **Testing**
   - Integration tests cho APIs
   - E2E tests cho history flow

### APIs implement

- ✅ GET /api/v1/posts
- ✅ GET /api/v1/posts/:id
- ✅ DELETE /api/v1/posts/:id
- ✅ GET /api/v1/posts/:id/logs
- ✅ GET /api/v1/logs

### Cách test

- ✅ Get posts list
- ✅ Filter posts
- ✅ Get post detail
- ✅ Get post logs
- ✅ Delete post
- ❌ Get post của user khác → error

### Kết quả mong đợi

- ✅ 5 APIs hoạt động
- ✅ Post History page hoạt động
- ✅ Post Detail page hoạt động
- ✅ Logs page hoạt động
- ✅ Tests pass

### Tham chiếu

- [API Plan - Post History APIs](./08-api-plan.md#7-post-history-apis)
- [API Plan - Log APIs](./08-api-plan.md#8-logging-apis)

**Trạng thái:** ⏳ Chờ bắt đầu

---

## PHASE 14: ADMIN PANEL

**Thời gian:** 4-5 ngày

**Mục tiêu:** Implement admin panel (dashboard, user management, logs).

### Công việc

1. **Backend: Implement Admin APIs**
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

2. **Frontend: Implement Admin Dashboard**
   - Stats cards
   - Charts (posts per day, users per day)
   - Recent activity
   - Top errors

3. **Frontend: Implement User Management page**
   - Users table
   - Search, filters
   - Actions (view, ban, unban, delete)

4. **Frontend: Implement User Detail page**
   - User info
   - Facebook connection (token masked)
   - Statistics
   - Posts
   - Actions

5. **Frontend: Implement Post Management page**
   - All posts table
   - Filters
   - View details

6. **Frontend: Implement System Logs page**
   - Logs table
   - Filters
   - Export

7. **Frontend: Implement Settings page**
   - App settings
   - Edit settings

8. **Testing**
   - Integration tests cho Admin APIs
   - E2E tests cho admin flows

### APIs implement

- ✅ GET /api/v1/admin/dashboard/stats
- ✅ GET /api/v1/admin/dashboard/activity
- ✅ GET /api/v1/admin/users
- ✅ GET /api/v1/admin/users/:id
- ✅ PUT /api/v1/admin/users/:id/ban
- ✅ PUT /api/v1/admin/users/:id/unban
- ✅ DELETE /api/v1/admin/users/:id
- ✅ GET /api/v1/admin/posts
- ✅ GET /api/v1/admin/logs
- ✅ GET /api/v1/admin/logs/top-errors
- ✅ GET /api/v1/admin/settings
- ✅ PUT /api/v1/admin/settings

### Cách test

- ✅ Admin login
- ✅ View dashboard
- ✅ View users
- ✅ Ban user
- ✅ Unban user
- ✅ View posts
- ✅ View logs
- ✅ Update settings
- ❌ User access admin endpoints → error

### Kết quả mong đợi

- ✅ 12 APIs hoạt động
- ✅ Admin Dashboard hoạt động
- ✅ User Management hoạt động
- ✅ Post Management hoạt động
- ✅ System Logs hoạt động
- ✅ Settings hoạt động
- ✅ Tests pass

### Tham chiếu

- [API Plan - Admin APIs](./08-api-plan.md#9-admin-apis)

**Trạng thái:** ⏳ Chờ bắt đầu

---

## PHASE 15: SECURITY REVIEW

**Thời gian:** 3-4 ngày

**Mục tiêu:** Review và fix security issues.

### Công việc

1. **Code review**
   - Review authentication code
   - Review authorization code
   - Review encryption code
   - Review input validation
   - Review SQL queries

2. **Security testing**
   - SQL injection tests
   - XSS tests
   - CSRF tests
   - Authentication bypass tests
   - Authorization bypass tests
   - Rate limit tests

3. **Dependency audit**
   - npm audit
   - Snyk scan
   - Update vulnerable packages

4. **Configuration review**
   - Environment variables
   - CORS settings
   - Security headers
   - SSL/TLS configuration

5. **Fix issues**
   - Fix vulnerabilities found
   - Implement missing security measures

6. **Documentation**
   - Security checklist
   - Security best practices

### Kết quả mong đợi

- ✅ No critical vulnerabilities
- ✅ Security tests pass
- ✅ Dependencies up to date
- ✅ Security checklist completed

### Tham chiếu

- [Security Plan](./05-security-plan.md)

**Trạng thái:** ⏳ Chờ bắt đầu

---

## PHASE 16: E2E TESTING

**Thời gian:** 5-6 ngày

**Mục tiêu:** End-to-end testing toàn bộ hệ thống.

### Công việc

1. **Setup E2E testing**
   - Playwright / Cypress
   - Test database
   - Test data

2. **Write E2E tests**
   - User registration flow
   - Login flow
   - Facebook connection flow
   - Create post flow
   - Publish post flow
   - Schedule post flow
   - Post history flow
   - Admin flows

3. **Run tests**
   - Run all E2E tests
   - Fix failing tests
   - Achieve >90% pass rate

4. **Performance testing**
   - Load testing (100 concurrent users)
   - Stress testing
   - Response time testing

5. **Browser testing**
   - Chrome
   - Firefox
   - Safari
   - Edge

6. **Mobile testing**
   - iOS Safari
   - Chrome Mobile

### Test scenarios

**Scenario 1: New User Journey**
1. Register → Verify email → Login
2. Connect Facebook
3. Upload 2 videos
4. Create post
5. Publish post
6. View post in history

**Scenario 2: Admin Journey**
1. Admin login
2. View dashboard
3. View users
4. Ban user
5. View logs

**Scenario 3: Scheduled Post**
1. Create post
2. Schedule post
3. Wait for scheduled time
4. Verify post published

**Scenario 4: Failed Post Retry**
1. Publish post (simulate failure)
2. View error logs
3. Retry post
4. Verify success

### Kết quả mong đợi

- ✅ E2E tests pass (>90%)
- ✅ Performance tests pass
- ✅ Browser compatibility verified
- ✅ Mobile compatibility verified

### Tham chiếu

- [Testing Plan](./07-testing-plan.md)
- [API Plan - Test Plan](./08-api-plan.md#12-api-test-plan)

**Trạng thái:** ⏳ Chờ bắt đầu

---

## PHASE 17: REFACTOR + CLEANUP

**Thời gian:** 3-4 ngày

**Mục tiêu:** Code refactoring, cleanup, optimization, documentation.

### Công việc

1. **Code refactoring**
   - Remove duplicate code
   - Improve code structure
   - Optimize queries
   - Improve error handling

2. **Code cleanup**
   - Remove unused code
   - Remove console.logs
   - Remove commented code
   - Format code

3. **Performance optimization**
   - Database indexes
   - Query optimization
   - Caching (Redis)
   - Image optimization

4. **Documentation**
   - API documentation (Swagger)
   - README
   - Deployment guide
   - User guide
   - Admin guide

5. **Final testing**
   - Run all tests
   - Fix any issues
   - Verify all features

6. **Deployment preparation**
   - Environment setup
   - Database migrations
   - Seed data
   - SSL certificates

### Kết quả mong đợi

- ✅ Code clean và optimized
- ✅ Documentation complete
- ✅ All tests pass
- ✅ Ready for deployment

**Trạng thái:** ⏳ Chờ bắt đầu

---

## SUMMARY

### Timeline Overview

| Phase | Tên | Thời gian | APIs | Trạng thái |
|-------|-----|-----------|------|-----------|
| 1 | Audit source cũ | 1 ngày | 0 | ✅ Hoàn thành |
| 2 | Xác định kiến trúc | 2-3 ngày | 0 | ⏳ Chờ |
| 3 | Thiết kế database | 2-3 ngày | 0 | ⏳ Chờ |
| 4 | Auth + RBAC | 3-4 ngày | 0 | ⏳ Chờ |
| 5 | UI/UX User side | 4-5 ngày | 0 | ⏳ Chờ |
| 6 | UI/UX Admin side | 3-4 ngày | 0 | ⏳ Chờ |
| 7 | Layout nền tảng | 2-3 ngày | 0 | ⏳ Chờ |
| 8 | Auth/User management | 3-4 ngày | 13 | ⏳ Chờ |
| 9 | Facebook connection | 3-4 ngày | 7 | ⏳ Chờ |
| 10 | Upload + Preview | 4-5 ngày | 4 | ⏳ Chờ |
| 11 | Create post + Validation | 3-4 ngày | 2 | ⏳ Chờ |
| 12 | Posting API | 5-6 ngày | 4 | ⏳ Chờ |
| 13 | Post history/Log | 2-3 ngày | 5 | ⏳ Chờ |
| 14 | Admin panel | 4-5 ngày | 12 | ⏳ Chờ |
| 15 | Security review | 3-4 ngày | 0 | ⏳ Chờ |
| 16 | E2E testing | 5-6 ngày | 0 | ⏳ Chờ |
| 17 | Refactor + Cleanup | 3-4 ngày | 0 | ⏳ Chờ |

**Tổng:** 60-75 ngày làm việc (~3 tháng)

**Tổng APIs:** 47 endpoints

---

## Phase 18: Plan System - Database & Models (NEW)

**Mục tiêu:** Implement plan system database và models

**Thời gian:** 3 days

**Tasks:**

1. **Create migrations cho 5 tables mới**
   - `013_create_plans.sql`
   - `014_create_user_plans.sql`
   - `015_create_plan_features.sql`
   - `016_create_card_settings.sql`
   - `017_create_user_feature_overrides.sql`
   - Seed data: free plan, premium plan, default features, card settings

2. **Create models**
   - `models/Plan.js`
   - `models/UserPlan.js`
   - `models/PlanFeature.js`
   - `models/CardSetting.js`
   - `models/UserFeatureOverride.js`
   - Define relationships

3. **Create services**
   - `services/planService.js` - Get user plan, get permissions
   - `services/permissionService.js` - Check permission, check limit
   - `services/cardSettingService.js` - Get card settings for user

4. **Test migrations**
   - Run migrations
   - Verify tables created
   - Verify seed data
   - Verify relationships

**Files cần tạo/sửa:**
- `migrations/013-017_*.sql` (5 files)
- `models/Plan.js`, `UserPlan.js`, `PlanFeature.js`, `CardSetting.js`, `UserFeatureOverride.js` (5 files)
- `services/planService.js`, `permissionService.js`, `cardSettingService.js` (3 files)

**Test:**
- Unit tests cho models
- Unit tests cho services
- Integration tests cho database queries

**Kết quả mong đợi:**
- ✅ 5 tables mới trong database
- ✅ Seed data: 2 plans (free, premium) với features
- ✅ Models hoạt động đúng
- ✅ Services trả về permissions chính xác

---

## Phase 19: Plan System - APIs & Middleware (NEW)

**Mục tiêu:** Implement plan APIs và permission middleware

**Thời gian:** 4 days

**Tasks:**

1. **Create permission middleware**
   - `middleware/requirePermission.js` - Check feature permission
   - `middleware/checkPlanLimit.js` - Check plan limits
   - `middleware/validateCardPermissions.js` - Validate card permissions
   - Test middleware với mock data

2. **Implement User Permission APIs (3 endpoints)**
   - `GET /api/v1/me/plan` - User xem plan hiện tại
   - `GET /api/v1/me/permissions` - User xem permissions
   - `GET /api/v1/me/card-settings` - User xem card settings
   - Controller: `controllers/userPermissionController.js`

3. **Implement Admin Plan APIs (8 endpoints)**
   - `GET /api/v1/admin/plans` - List plans
   - `POST /api/v1/admin/plans` - Create plan
   - `GET /api/v1/admin/plans/:id` - Get plan detail
   - `PATCH /api/v1/admin/plans/:id` - Update plan
   - `GET /api/v1/admin/plans/:id/features` - Get plan features
   - `PATCH /api/v1/admin/plans/:id/features` - Update plan features
   - `PATCH /api/v1/admin/users/:id/plan` - Assign plan to user
   - Controller: `controllers/adminPlanController.js`

4. **Implement Admin Feature Override APIs (3 endpoints)**
   - `POST /api/v1/admin/users/:id/feature-overrides` - Create override
   - `GET /api/v1/admin/users/:id/feature-overrides` - List overrides
   - `DELETE /api/v1/admin/users/:id/feature-overrides/:override_id` - Delete override
   - Controller: `controllers/adminFeatureOverrideController.js`

5. **Implement Admin Card Settings APIs (4 endpoints)**
   - `GET /api/v1/admin/card-settings` - Get card settings
   - `PATCH /api/v1/admin/card-settings/card-2` - Update card 2 settings
   - `POST /api/v1/admin/card-settings/card-2/default-media` - Upload default media
   - `DELETE /api/v1/admin/card-settings/card-2/default-media` - Delete default media
   - Controller: `controllers/adminCardSettingController.js`

6. **Apply middleware to existing APIs**
   - `POST /api/v1/posts` - Add `validateCardPermissions`
   - `POST /api/v1/posts/:id/publish` - Add `checkPlanLimit('monthly_post_limit')`
   - `POST /api/v1/posts/:id/schedule` - Add `requirePermission('can_schedule_post')`
   - `POST /api/v1/posts/:id/retry` - Add `requirePermission('can_retry_failed_post')`
   - `POST /api/v1/videos/upload` - Add `checkPlanLimit('max_upload_size_mb')`

**Files cần tạo/sửa:**
- `middleware/requirePermission.js`, `checkPlanLimit.js`, `validateCardPermissions.js` (3 files)
- `controllers/userPermissionController.js`, `adminPlanController.js`, `adminFeatureOverrideController.js`, `adminCardSettingController.js` (4 files)
- `routes/userPermission.routes.js`, `adminPlan.routes.js` (2 files)
- Update `routes/post.routes.js`, `video.routes.js` (2 files)

**Test:**
- Unit tests cho middleware
- Unit tests cho controllers
- Integration tests cho APIs
- Test permission validation
- Test plan limits

**Kết quả mong đợi:**
- ✅ 18 APIs mới hoạt động
- ✅ Permission middleware hoạt động đúng
- ✅ Free user không chỉnh được card 2
- ✅ Premium user chỉnh được card 2
- ✅ Plan limits được enforce

---

## Phase 20: Plan System - Frontend & Testing (NEW)

**Mục tiêu:** Implement plan UI và end-to-end testing

**Thời gian:** 5 days

**Tasks:**

1. **User side - Plan UI**
   - Component: `PlanBadge.jsx` - Hiển thị plan hiện tại
   - Component: `CardLocked.jsx` - Hiển thị card 2 locked state
   - Component: `UpgradePrompt.jsx` - CTA upgrade to premium
   - Update `CreatePostPage.jsx` - Integrate card locking
   - Fetch `/me/permissions` và `/me/card-settings` on mount
   - Disable card 2 inputs nếu locked
   - Show default preview cho card 2 nếu locked

2. **Admin side - Plan Management UI**
   - Page: `AdminPlansPage.jsx` - List plans
   - Page: `AdminPlanDetailPage.jsx` - Edit plan features
   - Page: `AdminCardSettingsPage.jsx` - Configure card settings
   - Page: `AdminUserDetailPage.jsx` - Add "Assign Plan" và "Override Permissions" sections
   - Component: `PlanFeatureEditor.jsx` - Toggle features
   - Component: `CardSettingEditor.jsx` - Edit card settings
   - Component: `FeatureOverrideForm.jsx` - Create override

3. **Backend validation testing**
   - Test free user gửi card 2 data → 403 CARD_LOCKED
   - Test free user vượt monthly limit → 403 PLAN_LIMIT_EXCEEDED
   - Test premium user chỉnh card 2 → Success
   - Test admin override → User có quyền mới
   - Test admin remove override → User mất quyền

4. **End-to-end testing**
   - E2E: Free user register → create post (card 1 only) → publish
   - E2E: Admin upgrade user → user create post (2 cards) → publish
   - E2E: Admin set default media card 2 → free user post → verify card 2 dùng default
   - E2E: Admin override can_edit_card_2 → free user edit card 2 → success
   - E2E: Premium user hết hạn → downgrade → cannot edit card 2

5. **Cron jobs**
   - Cron: Auto-expire user_plans (check expires_at)
   - Cron: Auto-expire feature_overrides (check expires_at)
   - Run every hour

**Files cần tạo/sửa:**
- Frontend: `PlanBadge.jsx`, `CardLocked.jsx`, `UpgradePrompt.jsx`, `AdminPlansPage.jsx`, `AdminPlanDetailPage.jsx`, `AdminCardSettingsPage.jsx`, `PlanFeatureEditor.jsx`, `CardSettingEditor.jsx`, `FeatureOverrideForm.jsx` (9 files)
- Update: `CreatePostPage.jsx`, `AdminUserDetailPage.jsx` (2 files)
- Backend: `cron/expirePlans.js`, `cron/expireOverrides.js` (2 files)
- Tests: `tests/e2e/planPermissions.test.js` (1 file)

**Test:**
- Component tests
- E2E tests (Playwright/Cypress)
- Manual testing với free/premium users
- Test cron jobs

**Kết quả mong đợi:**
- ✅ Free user thấy card 2 locked trong UI
- ✅ Premium user thấy card 2 unlocked
- ✅ Admin có thể manage plans, features, card settings
- ✅ Admin có thể override permissions cho user
- ✅ Cron jobs auto-expire plans và overrides
- ✅ Tất cả E2E tests pass

---

## DEPENDENCIES

### Phase Dependencies

```
Phase 1 (Audit) → Phase 2 (Architecture)
Phase 2 → Phase 3 (Database)
Phase 3 → Phase 4 (Auth)
Phase 4 → Phase 7 (Layout)
Phase 5, 6 (UI/UX) → Phase 7 (Layout)
Phase 7 → Phase 8 (Auth/User)
Phase 8 → Phase 9 (Facebook)
Phase 9 → Phase 10 (Upload)
Phase 10 → Phase 11 (Create Post)
Phase 11 → Phase 12 (Posting)
Phase 12 → Phase 13 (History)
Phase 8 → Phase 14 (Admin)
Phase 1-14 → Phase 15 (Security)
Phase 1-15 → Phase 16 (E2E Testing)
Phase 1-16 → Phase 17 (Refactor)

NEW - Plan System:
Phase 3 (Database) → Phase 18 (Plan Database)
Phase 18 → Phase 19 (Plan APIs)
Phase 19 → Phase 20 (Plan Frontend & Testing)
Phase 14 (Admin) → Phase 19 (Plan APIs - Admin side)
Phase 11 (Create Post) → Phase 19 (Apply permission middleware)
```

**Giải thích:**
- Phase 18-20 là plan system (có thể làm song song với Phase 1-17 hoặc sau khi hoàn thành core features)
- Phase 18 phụ thuộc Phase 3 (Database setup)
- Phase 19 phụ thuộc Phase 18 (cần có models/services trước)
- Phase 20 phụ thuộc Phase 19 (cần có APIs trước)
- Phase 19 cần Phase 14 (Admin panel) và Phase 11 (Create Post) để integrate

---

## THAM CHIẾU

- [Requirements](./02-requirements.md) - Yêu cầu chức năng
- [Architecture Plan](./03-architecture-plan.md) - Kiến trúc
- [Database Plan](./04-database-plan.md) - Database
- [Security Plan](./05-security-plan.md) - Bảo mật
- [Testing Plan](./07-testing-plan.md) - Testing
- [API Plan](./08-api-plan.md) - 47 APIs

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-25  
**Status:** ✅ Completed

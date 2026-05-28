# TÀI LIỆU KẾ HOẠCH DỰ ÁN - THÍCH CỪU FACEBOOK VIDEO 2 Ô TOOL

## TỔNG QUAN DỰ ÁN

**Tên dự án:** Thích Cừu - Facebook Video 2 Ô Tool

**Mục tiêu:** Xây dựng web application cho phép nhiều users đăng video carousel (2 ô) lên Facebook, với admin panel quản lý toàn hệ thống.

**Loại:** Web Application (SaaS Model)

**Timeline:** ~10-14 tuần (20 phases, bao gồm plan system)

**Tính năng mới (NEW):**
- ✅ Plan-based permissions (Free/Premium)
- ✅ Card locking system (Card 2 locked for free users)
- ✅ Feature overrides (Admin can grant special permissions)
- ✅ Admin plan management
- ✅ Admin card settings management

---

## CÁC TÀI LIỆU

### 📋 Tài liệu đã hoàn thành

| # | Tên File | Mô tả | Trạng thái |
|---|----------|-------|-----------|
| 1 | [01-source-analysis.md](./01-source-analysis.md) | Phân tích source code hiện tại | ✅ Hoàn thành |
| 2 | [02-requirements.md](./02-requirements.md) | Yêu cầu chức năng và phi chức năng + Plan system | ✅ Đã cập nhật |
| 3 | [03-architecture-plan.md](./03-architecture-plan.md) | Kiến trúc hệ thống + Permission layer | ✅ Đã cập nhật |
| 4 | [04-database-plan.md](./04-database-plan.md) | Database schema (17 tables) + Plan tables | ✅ Đã cập nhật |
| 5 | [05-security-plan.md](./05-security-plan.md) | Kế hoạch bảo mật + Plan permissions | ✅ Đã cập nhật |
| 6 | [06-implementation-phases.md](./06-implementation-phases.md) | 20 phases triển khai (bao gồm plan system) | ✅ Đã cập nhật |
| 7 | [07-testing-plan.md](./07-testing-plan.md) | Kế hoạch testing + Plan permission tests | ✅ Đã cập nhật |
| 8 | [08-api-plan.md](./08-api-plan.md) | Chi tiết 61 API endpoints (47 cũ + 14 mới) | ✅ Đã cập nhật |

---

## TECH STACK

### Frontend
- **Framework:** React 18+
- **Build Tool:** Vite
- **State Management:** Redux Toolkit / Zustand
- **Routing:** React Router
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js 18+ (LTS)
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Cache:** Redis (optional)
- **ORM:** Sequelize / Prisma

### DevOps
- **CI/CD:** GitHub Actions
- **Deployment:** Docker / PM2
- **Monitoring:** Sentry, New Relic
- **Logging:** Winston

---

## KIẾN TRÚC TỔNG QUAN

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│  User Frontend (React)  │  Admin Frontend (React)       │
└─────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────┐
│              API GATEWAY (Nginx + SSL)                  │
└─────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────┐
│           BACKEND API (Node.js + Express)               │
│                   47 API Endpoints                      │
└─────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────┐
│  PostgreSQL Database  │  Redis Cache  │  File Storage   │
└─────────────────────────────────────────────────────────┘
```

**Chi tiết:** [Architecture Plan](./03-architecture-plan.md)

---

## API ENDPOINTS (47 APIs)

### Auth APIs (9 endpoints)
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/logout
- GET /api/v1/auth/me
- POST /api/v1/auth/refresh
- PUT /api/v1/auth/password
- POST /api/v1/auth/forgot-password
- POST /api/v1/auth/reset-password
- GET /api/v1/auth/verify-email

### User APIs (4 endpoints)
- GET /api/v1/user/profile
- PUT /api/v1/user/profile
- GET /api/v1/user/settings
- PUT /api/v1/user/settings

### Facebook APIs (7 endpoints)
- POST /api/v1/facebook/connect
- POST /api/v1/facebook/oauth/callback
- GET /api/v1/facebook/status
- GET /api/v1/facebook/pages
- GET /api/v1/facebook/ad-accounts
- POST /api/v1/facebook/refresh-token
- POST /api/v1/facebook/disconnect

### Video APIs (4 endpoints)
- POST /api/v1/videos/upload
- POST /api/v1/videos/validate
- GET /api/v1/videos/:id
- DELETE /api/v1/videos/:id

### Post APIs (6 endpoints)
- POST /api/v1/posts
- POST /api/v1/posts/validate
- POST /api/v1/posts/:id/publish
- POST /api/v1/posts/:id/schedule
- DELETE /api/v1/posts/:id/schedule
- POST /api/v1/posts/:id/retry

### Post History APIs (4 endpoints)
- GET /api/v1/posts
- GET /api/v1/posts/:id
- DELETE /api/v1/posts/:id
- GET /api/v1/posts/:id/logs

### Log APIs (1 endpoint)
- GET /api/v1/logs

### Admin APIs (12 endpoints)
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

**Chi tiết:** [API Plan](./08-api-plan.md)

---

## DATABASE SCHEMA

### Core Tables (12 tables)

1. **users** - User accounts
2. **user_settings** - User preferences
3. **facebook_accounts** - Facebook connections (1:1 với users)
4. **facebook_pages** - Facebook pages
5. **facebook_ad_accounts** - Ad accounts
6. **posts** - Posts
7. **post_videos** - Videos trong posts (2 videos/post)
8. **post_logs** - Logs chi tiết từng post
9. **system_logs** - System logs
10. **admin_logs** - Admin action logs
11. **sessions** - User sessions
12. **app_settings** - Application settings

### Plan System Tables (5 tables - NEW)

13. **plans** - Plan definitions (free, premium, enterprise)
14. **user_plans** - User subscriptions (active plan)
15. **plan_features** - Features per plan (permissions, limits)
16. **card_settings** - Card 1/2 global settings
17. **user_feature_overrides** - Admin-granted special permissions

**Tổng:** 17 tables

**Chi tiết:** [Database Plan](./04-database-plan.md)

---

## BẢO MẬT

### Authentication
- **JWT Tokens:** Access (15 min) + Refresh (7 days)
- **Storage:** httpOnly cookie (refresh) + memory (access)

### Authorization
- **RBAC:** user, admin, super_admin
- **Plan-Based Permissions (NEW):** Free/Premium plans với feature flags
- **Ownership:** User chỉ truy cập dữ liệu của mình
- **Admin:** Xem tất cả, không thấy token thô

### Plan Permissions (NEW)
- **Permission Priority:** Override > Plan Feature > Default (false)
- **Card Locking:** Free users không chỉnh được card 2
- **Plan Limits:** Monthly post limit, upload size limit, etc.
- **Backend Validation:** NEVER trust frontend locked state

### Encryption
- **Facebook Tokens:** AES-256-GCM
- **Passwords:** bcrypt (salt rounds = 10)
- **Sensitive Data:** Không log, không trả về frontend

### Rate Limiting
- Login: 5 attempts/15 min
- API: 100 requests/hour
- Upload: 50 uploads/hour
- Post: 20 posts/hour

**Chi tiết:** [Security Plan](./05-security-plan.md)

---

## IMPLEMENTATION PHASES (20 Phases)

| Phase | Tên | Thời gian | Trạng thái |
|-------|-----|-----------|-----------|
| 1 | Audit source cũ | 1 ngày | ✅ Hoàn thành |
| 2 | Xác định kiến trúc | 2-3 ngày | ⏳ Chờ bắt đầu |
| 3 | Thiết kế database | 2-3 ngày | ⏳ Chờ bắt đầu |
| 4 | Auth + RBAC | 3-4 ngày | ⏳ Chờ bắt đầu |
| 5 | UI/UX User side | 4-5 ngày | ⏳ Chờ bắt đầu |
| 6 | UI/UX Admin side | 3-4 ngày | ⏳ Chờ bắt đầu |
| 7 | Layout nền tảng | 2-3 ngày | ⏳ Chờ bắt đầu |
| 8 | Auth/User management | 3-4 ngày | ⏳ Chờ bắt đầu |
| 9 | Facebook connection | 3-4 ngày | ⏳ Chờ bắt đầu |
| 10 | Upload + Preview | 4-5 ngày | ⏳ Chờ bắt đầu |
| 11 | Create post + Validation | 3-4 ngày | ⏳ Chờ bắt đầu |
| 12 | Posting API | 5-6 ngày | ⏳ Chờ bắt đầu |
| 13 | Post history/Log | 2-3 ngày | ⏳ Chờ bắt đầu |
| 14 | Admin panel | 4-5 ngày | ⏳ Chờ bắt đầu |
| 15 | Security review | 3-4 ngày | ⏳ Chờ bắt đầu |
| 16 | E2E testing | 5-6 ngày | ⏳ Chờ bắt đầu |
| 17 | Refactor + Cleanup | 3-4 ngày | ⏳ Chờ bắt đầu |
| **18** | **Plan System - Database & Models (NEW)** | **3 ngày** | ⏳ Chờ bắt đầu |
| **19** | **Plan System - APIs & Middleware (NEW)** | **4 ngày** | ⏳ Chờ bắt đầu |
| **20** | **Plan System - Frontend & Testing (NEW)** | **5 ngày** | ⏳ Chờ bắt đầu |

**Tổng:** ~72-87 ngày làm việc (~3.5 tháng, bao gồm plan system)

**Chi tiết:** [Implementation Phases](./06-implementation-phases.md)

---

## TESTING STRATEGY

### Unit Tests
- Services, utils, components
- Target: >80% code coverage
- Tool: Jest

### Integration Tests
- API endpoints
- Database operations
- Tool: Jest + Supertest

### E2E Tests
- User flows
- Admin flows
- Tool: Playwright / Cypress

### Security Tests
- Authentication bypass
- Authorization bypass
- SQL injection, XSS
- Rate limiting

**Chi tiết:** [Testing Plan](./07-testing-plan.md) *(cần tạo)*

---

## DEPLOYMENT

### Development
```
localhost:5173  → Frontend (Vite)
localhost:3000  → Backend API
localhost:5432  → PostgreSQL
localhost:6379  → Redis
```

### Production
```
https://thichcuu.com        → User Frontend
https://admin.thichcuu.com  → Admin Frontend
https://thichcuu.com/api/v1 → Backend API
```

**Infrastructure:**
- VPS / AWS EC2
- Nginx (Reverse Proxy + SSL)
- PostgreSQL (Database)
- Redis (Cache)
- PM2 (Process Manager)

---

## MONITORING & LOGGING

### Application Logs
- Winston logger
- Levels: debug, info, warn, error
- Transports: Console, File, Database

### Monitoring
- Sentry (Error tracking)
- New Relic / DataDog (APM)
- Uptime Robot (Uptime)

### Metrics
- API response times
- Error rates
- Database query times
- Resource usage

---

## BACKUP & RECOVERY

### Database Backup
- Daily full backup
- Hourly incremental
- Retention: 30 days
- Storage: S3

### File Backup
- Sync to S3
- Versioning enabled

### Recovery
- RTO: 4 hours
- RPO: 1 hour

---

## QUY TẮC TRƯỚC KHI CODE

### ⚠️ QUAN TRỌNG

**HIỆN TẠI:** Chỉ đang ở giai đoạn lập kế hoạch

**CHƯA ĐƯỢC PHÉP:**
- ❌ Viết code
- ❌ Tạo file mới (ngoài docs)
- ❌ Sửa source code hiện tại
- ❌ Chạy lệnh build/deploy

**CHỈ ĐƯỢC PHÉP:**
- ✅ Hoàn thiện tài liệu
- ✅ Trả lời câu hỏi về kế hoạch
- ✅ Điều chỉnh kế hoạch theo feedback

### Quy trình phê duyệt

**Bước 1:** User review tài liệu
**Bước 2:** User nói "Bắt đầu code Phase X"
**Bước 3:** Bắt đầu code phase đó
**Bước 4:** Báo cáo kết quả
**Bước 5:** Chờ phê duyệt phase tiếp theo

---

## TRẠNG THÁI HIỆN TẠI

### ✅ Đã hoàn thành
- Phase 1: Audit source cũ
- Tài liệu phân tích source
- Tài liệu kiến trúc
- Tài liệu API (47 endpoints)

### 📝 Đang làm
- Hoàn thiện các tài liệu còn lại

### ⏳ Chờ phê duyệt
- Tất cả tài liệu kế hoạch
- Bắt đầu Phase 2

---

## LIÊN HỆ & HỖ TRỢ

**Câu hỏi về dự án:**
- Review tài liệu trong folder `.claude/docs/`
- Hỏi trực tiếp về bất kỳ phần nào

**Yêu cầu điều chỉnh:**
- Có thể yêu cầu sửa/bổ sung bất kỳ tài liệu nào
- Có thể thay đổi tech stack
- Có thể thêm/bớt tính năng

**Sẵn sàng:**
- Trả lời câu hỏi
- Làm rõ các phần mơ hồ
- Điều chỉnh kế hoạch
- Bắt đầu code khi được phê duyệt

---

## PLAN SYSTEM (NEW)

### Tổng quan

Tool hỗ trợ **plan-based permissions** để phân quyền theo gói sử dụng (free/premium).

### Các Plans

| Plan | Giá | Card 1 | Card 2 | Schedule | Retry | Monthly Limit |
|------|-----|--------|--------|----------|-------|---------------|
| **Free** | 0đ | ✅ Chỉnh được | ❌ Khóa (dùng default) | ❌ | ❌ | 5 posts |
| **Premium** | 99,000đ | ✅ Chỉnh được | ✅ Chỉnh được | ✅ | ✅ | 100 posts |

### Card Locking System

**Free User:**
- Card 1: Chỉnh được (upload video, nhập title/description/link)
- Card 2: **Bị khóa**, hiển thị locked state, dùng cấu hình mặc định do admin đặt
- Frontend: Disable inputs cho card 2
- Backend: Validate và reject nếu free user gửi dữ liệu card 2

**Premium User:**
- Card 1: Chỉnh được
- Card 2: Chỉnh được (nếu permission `can_edit_card_2` = true)
- Frontend: Enable inputs cho card 2
- Backend: Validate permission trước khi cho phép

### Admin Capabilities

**Plan Management:**
- Tạo/sửa/disable plans
- Cấu hình features cho từng plan
- Gán plan cho user
- Override quyền cho user cụ thể (ví dụ: free user được mở card 2)

**Card Settings:**
- Cấu hình card 1 và card 2 (bật/tắt, khóa cho plan nào)
- Upload media mặc định cho card 2
- Set link/caption mặc định cho card 2
- Preview card 2 mặc định

### Permission Priority

```
1. User Feature Override (highest)
   ↓
2. Plan Feature
   ↓
3. Default (false)
```

### Security

- ✅ Backend MUST validate permissions (không tin frontend)
- ✅ Free user gửi card 2 data → 403 CARD_LOCKED
- ✅ Check plan limits trước khi action
- ✅ Log permission violations

### Database

**5 tables mới:**
- `plans` - Plan definitions
- `user_plans` - User subscriptions
- `plan_features` - Features per plan
- `card_settings` - Card 1/2 settings
- `user_feature_overrides` - Admin overrides

### APIs

**14 APIs mới:**
- 3 User Permission APIs (GET /me/plan, /me/permissions, /me/card-settings)
- 8 Admin Plan APIs (manage plans, features, assign plans)
- 3 Admin Card Settings APIs (configure cards, upload default media)

**Tổng APIs:** 61 endpoints (47 cũ + 14 mới)

---

## THAM CHIẾU NHANH

### Tài liệu đã hoàn thành
- [Source Analysis](./01-source-analysis.md) - Phân tích source cũ
- [Requirements](./02-requirements.md) - Yêu cầu chức năng + Plan system
- [Architecture Plan](./03-architecture-plan.md) - Kiến trúc + Permission layer
- [Database Plan](./04-database-plan.md) - 17 tables + Plan tables
- [Security Plan](./05-security-plan.md) - Bảo mật + Plan permissions
- [Implementation Phases](./06-implementation-phases.md) - 20 phases
- [Testing Plan](./07-testing-plan.md) - Testing + Plan tests
- [API Plan](./08-api-plan.md) - 61 APIs (47 cũ + 14 mới)

---

**Document Version:** 2.0  
**Last Updated:** 2026-05-26  
**Status:** 📋 Planning Phase - Plan System Added  
**Next Step:** Chờ user review và phê duyệt kế hoạch

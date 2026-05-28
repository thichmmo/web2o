# YÊU CẦU DỰ ÁN - THÍCH CỪU FACEBOOK VIDEO 2 Ô TOOL

## 1. TỔNG QUAN

**Tên dự án:** Thích Cừu - Facebook Video 2 Ô Tool

**Mục tiêu:** Xây dựng web application cho phép nhiều users đăng video carousel (2 ô) lên Facebook Page, với admin panel quản lý toàn hệ thống.

**Loại:** Web Application (SaaS Model)

**Target Users:**
- **End Users:** Người dùng cá nhân/doanh nghiệp muốn đăng video 2 ô lên Facebook
- **Admins:** Quản trị viên hệ thống
- **Super Admins:** Quản trị viên cấp cao

---

## 2. YÊU CẦU CHỨC NĂNG

### 2.1. User Authentication & Authorization

**FR-AUTH-001: Đăng ký tài khoản**
- User có thể đăng ký tài khoản mới
- Yêu cầu: username, email, password, full name
- Validate: email unique, username unique, password mạnh (≥8 ký tự, có chữ hoa, số)
- Gửi email xác nhận sau khi đăng ký
- API: `POST /api/v1/auth/register`

**FR-AUTH-002: Xác nhận email**
- User nhận email với link xác nhận
- Click link để active tài khoản
- Token xác nhận có thời hạn 24 giờ
- API: `GET /api/v1/auth/verify-email?token={token}`

**FR-AUTH-003: Đăng nhập**
- User đăng nhập bằng email/username + password
- Nhận JWT access token (15 min) và refresh token (7 days)
- Rate limit: 5 attempts/15 minutes
- API: `POST /api/v1/auth/login`

**FR-AUTH-004: Đăng xuất**
- User có thể đăng xuất
- Revoke session hiện tại
- API: `POST /api/v1/auth/logout`

**FR-AUTH-005: Refresh token**
- Tự động refresh access token khi hết hạn
- Sử dụng refresh token
- API: `POST /api/v1/auth/refresh`

**FR-AUTH-006: Quên mật khẩu**
- User có thể request reset password
- Nhận email với link reset
- Token reset có thời hạn 1 giờ
- API: `POST /api/v1/auth/forgot-password`, `POST /api/v1/auth/reset-password`

**FR-AUTH-007: Đổi mật khẩu**
- User có thể đổi password khi đã đăng nhập
- Yêu cầu nhập password hiện tại
- Revoke tất cả sessions sau khi đổi
- API: `PUT /api/v1/auth/password`

---

### 2.2. User Profile Management

**FR-USER-001: Xem profile**
- User xem thông tin profile của mình
- Hiển thị: username, email, full name, avatar, role, status
- API: `GET /api/v1/user/profile`

**FR-USER-002: Cập nhật profile**
- User có thể cập nhật: full name, avatar
- Không cho phép sửa: email, username, role
- API: `PUT /api/v1/user/profile`

**FR-USER-003: Xem settings**
- User xem cài đặt của mình
- Hiển thị: notifications, timezone, language, default page/account
- API: `GET /api/v1/user/settings`

**FR-USER-004: Cập nhật settings**
- User có thể cập nhật settings
- Lưu preferences
- API: `PUT /api/v1/user/settings`

---

### 2.3. Plans & Permissions (NEW)

**FR-PLAN-001: User có plan mặc định khi đăng ký**
- User mới đăng ký tự động được gán plan "free"
- Plan xác định quyền sử dụng tính năng
- Plan khác với role (role = user/admin, plan = free/premium)
- API: `POST /api/v1/auth/register` (tự động gán plan)

**FR-PLAN-002: User xem plan hiện tại**
- User xem plan đang sử dụng (free/premium/custom)
- Hiển thị: plan name, features, limits, expiry date (nếu có)
- API: `GET /api/v1/me/plan`

**FR-PLAN-003: User xem permissions của mình**
- User xem danh sách quyền được phép
- Hiển thị: can_edit_card_1, can_edit_card_2, can_upload_video, can_schedule_post, daily_post_limit, etc.
- API: `GET /api/v1/me/permissions`

**FR-PLAN-004: User xem card settings**
- User xem cấu hình card 1 và card 2
- Hiển thị: card nào được chỉnh, card nào bị khóa, default media/link cho card bị khóa
- API: `GET /api/v1/me/card-settings`

**FR-PLAN-005: Free user chỉ chỉnh được card 1**
- User free chỉ được chỉnh sửa card 1 (title, description, link, CTA, video/image)
- Card 2 bị khóa, hiển thị trạng thái "Locked - Managed by Admin"
- Card 2 sử dụng cấu hình mặc định do admin đặt
- Frontend: Card 2 hiển thị locked state với tooltip "Upgrade to Premium to unlock"
- Backend: Validate và reject nếu free user cố gửi dữ liệu card 2

**FR-PLAN-006: Premium user có thể chỉnh card 2**
- User premium được chỉnh sửa cả card 1 và card 2
- Quyền chỉnh card 2 phụ thuộc vào permission `can_edit_card_2`
- Admin có thể bật/tắt permission này cho từng plan
- Backend: Validate permission trước khi cho phép chỉnh card 2

**FR-PLAN-007: Plan limits**
- Mỗi plan có giới hạn riêng:
  - Free: 5 posts/month, 10 videos/month, no scheduling, no retry
  - Premium: 100 posts/month, 500 videos/month, scheduling enabled, retry enabled
- Backend kiểm tra limits trước khi cho phép action
- API trả lỗi `PLAN_LIMIT_EXCEEDED` nếu vượt limit

**FR-PLAN-008: Feature flags per plan**
- Mỗi plan có danh sách features:
  - `can_edit_card_1` (boolean)
  - `can_edit_card_2` (boolean)
  - `can_upload_image` (boolean)
  - `can_upload_video` (boolean)
  - `can_edit_card_link` (boolean)
  - `can_schedule_post` (boolean)
  - `can_retry_failed_post` (boolean)
  - `daily_post_limit` (number)
  - `monthly_post_limit` (number)
  - `max_upload_size_mb` (number)
- Admin có thể cấu hình từng feature cho từng plan

---

### 2.4. Card Settings (NEW)

**FR-CARD-001: Admin cấu hình card 1**
- Admin có thể cấu hình card 1:
  - Có bật không (is_enabled)
  - User nào được chỉnh (free/premium)
  - Loại media cho phép (image/video)
  - Kích thước file tối đa
- API: `PATCH /api/v1/admin/card-settings/card-1`

**FR-CARD-002: Admin cấu hình card 2**
- Admin có thể cấu hình card 2:
  - Có bật không (is_enabled)
  - User nào được chỉnh (free/premium)
  - Loại media cho phép (image/video)
  - Kích thước file tối đa
  - Có khóa cho free user không (is_locked_for_free)
  - Có khóa cho premium user không (is_locked_for_premium)
- API: `PATCH /api/v1/admin/card-settings/card-2`

**FR-CARD-003: Admin set default media cho card 2**
- Admin upload ảnh/video mặc định cho card 2
- Media này sẽ được dùng khi user free tạo bài (card 2 bị khóa)
- Validate file type và size
- API: `POST /api/v1/admin/card-settings/card-2/default-media`

**FR-CARD-004: Admin set default link cho card 2**
- Admin nhập link mặc định cho card 2
- Link này sẽ được dùng khi user free tạo bài
- Validate URL format
- API: `PATCH /api/v1/admin/card-settings/card-2` (field: default_link_url)

**FR-CARD-005: Admin set default caption cho card 2**
- Admin nhập caption/title/description mặc định cho card 2
- Caption này sẽ được dùng khi user free tạo bài
- API: `PATCH /api/v1/admin/card-settings/card-2` (field: default_caption)

**FR-CARD-006: Admin xem preview card 2 mặc định**
- Admin xem preview card 2 với cấu hình mặc định
- Hiển thị: media, title, description, link, CTA
- Giúp admin kiểm tra trước khi apply

**FR-CARD-007: User free thấy card 2 locked**
- Khi user free tạo bài, card 2 hiển thị:
  - Locked icon
  - Preview media/link/caption mặc định
  - Tooltip: "This card is managed by admin. Upgrade to Premium to customize."
  - Không có input fields để chỉnh sửa
- Frontend: Disable inputs cho card 2
- Backend: Reject nếu user free gửi dữ liệu card 2

**FR-CARD-008: User premium thấy card 2 unlocked**
- Khi user premium tạo bài, card 2 hiển thị:
  - Unlocked icon (nếu permission cho phép)
  - Input fields để chỉnh sửa
  - Có thể upload media riêng
  - Có thể nhập link/caption riêng
- Backend: Validate permission `can_edit_card_2` trước khi cho phép

---

### 2.5. Facebook Connection

**FR-FB-001: Kết nối Facebook (Manual Token)**
- User nhập Facebook access token thủ công
- Validate token với Facebook API
- Lưu token encrypted (AES-256-GCM)
- Lấy danh sách pages và ad accounts
- API: `POST /api/v1/facebook/connect`

**FR-FB-002: Kết nối Facebook (OAuth)**
- User click "Kết nối qua Facebook"
- Redirect đến Facebook OAuth
- Callback xử lý authorization code
- Exchange code for access token
- API: `POST /api/v1/facebook/oauth/callback`

**FR-FB-003: Kiểm tra trạng thái kết nối**
- User xem trạng thái kết nối Facebook
- Hiển thị: connected status, Facebook name, token expiry
- API: `GET /api/v1/facebook/status`

**FR-FB-004: Lấy danh sách Pages**
- User xem danh sách Facebook Pages có quyền quản lý
- Hiển thị: page name, followers count, picture
- API: `GET /api/v1/facebook/pages`

**FR-FB-005: Lấy danh sách Ad Accounts**
- User xem danh sách Ad Accounts có quyền truy cập
- Hiển thị: account name, status, currency
- API: `GET /api/v1/facebook/ad-accounts`

**FR-FB-006: Refresh Facebook token**
- User có thể refresh token khi sắp hết hạn
- Extend token expiry
- API: `POST /api/v1/facebook/refresh-token`

**FR-FB-007: Ngắt kết nối Facebook**
- User có thể ngắt kết nối Facebook
- Xóa token khỏi database
- Giữ lại posts history
- API: `POST /api/v1/facebook/disconnect`

---

### 2.4. Video Upload

**FR-VIDEO-001: Upload video**
- User upload video từ local
- Validate: file type (MP4, MOV, AVI), size (≤500MB), duration (≤5 min)
- Generate thumbnail
- Extract metadata (duration, resolution)
- Rate limit: 50 uploads/hour
- API: `POST /api/v1/videos/upload`

**FR-VIDEO-002: Validate video trước khi upload**
- Client-side validation
- Server-side validation
- Hiển thị lỗi rõ ràng
- API: `POST /api/v1/videos/validate`

**FR-VIDEO-003: Xem thông tin video**
- User xem chi tiết video đã upload
- Hiển thị: filename, size, duration, resolution, thumbnail
- API: `GET /api/v1/videos/:id`

**FR-VIDEO-004: Xóa video**
- User có thể xóa video chưa được dùng
- Không cho phép xóa video đang trong post
- API: `DELETE /api/v1/videos/:id`

**FR-VIDEO-005: Preview video**
- User có thể preview video trước khi đăng
- Play video trong browser
- Hiển thị thumbnail

---

### 2.5. Create Post

**FR-POST-001: Tạo draft post**
- User tạo bài đăng draft
- Chọn Page và Ad Account
- Upload/chọn 2 videos
- Nhập thông tin 2 cards:
  - Title (required)
  - Description (optional)
  - Link (optional, default = page URL)
  - CTA type (LIKE_PAGE, OPEN_LINK, WATCH_VIDEO, etc.)
  - CTA link (nếu CTA = OPEN_LINK)
- Nhập message/caption
- API: `POST /api/v1/posts`

**FR-POST-002: Validate post trước khi đăng**
- Validate tất cả dữ liệu
- Check Facebook connection
- Check page access
- Check ad account access
- Check videos uploaded
- Hiển thị checklist
- API: `POST /api/v1/posts/validate`

**FR-POST-003: Preview post**
- User preview bài đăng trước khi publish
- Hiển thị 2 cards với video thumbnails
- Hiển thị title, description, CTA
- Real-time update khi user nhập

**FR-POST-004: Publish post ngay**
- User click "Đăng bài"
- Confirmation modal
- Upload videos lên Facebook
- Create ad creative
- Publish lên page
- Hiển thị progress
- Rate limit: 20 posts/hour
- API: `POST /api/v1/posts/:id/publish`

**FR-POST-005: Lên lịch đăng bài**
- User chọn thời gian đăng
- Chọn ngày và giờ
- Hiển thị múi giờ
- Gợi ý thời gian tốt (18:00-21:00)
- API: `POST /api/v1/posts/:id/schedule`

**FR-POST-006: Hủy lịch đăng**
- User có thể hủy bài đã lên lịch
- Chuyển về draft
- API: `DELETE /api/v1/posts/:id/schedule`

**FR-POST-007: Retry failed post**
- User có thể retry bài đăng failed
- Max 3 retries
- Hiển thị lỗi chi tiết
- API: `POST /api/v1/posts/:id/retry`

---

### 2.6. Post History

**FR-HISTORY-001: Xem danh sách posts**
- User xem tất cả bài đã đăng của mình
- Hiển thị: page name, message, status, posted time
- Pagination: 20 posts/page
- API: `GET /api/v1/posts`

**FR-HISTORY-002: Filter posts**
- Filter theo status (posted, scheduled, failed)
- Filter theo page
- Filter theo date range
- Search theo message content
- Sort theo created_at, posted_at

**FR-HISTORY-003: Xem chi tiết post**
- User xem chi tiết 1 bài đăng
- Hiển thị: 2 videos, cards info, message, status, logs
- Link "Xem trên Facebook"
- API: `GET /api/v1/posts/:id`

**FR-HISTORY-004: Xem logs của post**
- User xem logs chi tiết từng bước
- Hiển thị timeline: upload video → create creative → publish
- Hiển thị errors nếu có
- API: `GET /api/v1/posts/:id/logs`

**FR-HISTORY-005: Xóa post**
- User có thể xóa bài đăng
- Soft delete (giữ lại trong DB)
- Confirmation required
- API: `DELETE /api/v1/posts/:id`

**FR-HISTORY-006: Sao chép post**
- User có thể tạo bài mới từ bài cũ
- Copy tất cả config
- Chọn videos mới hoặc giữ nguyên

---

### 2.7. Dashboard

**FR-DASH-001: Xem thống kê**
- User xem thống kê cá nhân
- Hiển thị:
  - Tổng bài đăng
  - Thành công / Thất bại
  - Bài đăng gần đây
  - Chart posts per day

**FR-DASH-002: Quick actions**
- Nút "Tạo bài mới"
- Nút "Kết nối Facebook"
- Link đến lịch sử

---

### 2.8. Admin Panel

**FR-ADMIN-001: Dashboard thống kê**
- Admin xem thống kê tổng quan hệ thống
- Hiển thị:
  - Tổng users (active, inactive, banned)
  - Tổng posts (success, failed, scheduled)
  - Top errors
  - Recent activity
- API: `GET /api/v1/admin/dashboard/stats`, `GET /api/v1/admin/dashboard/activity`

**FR-ADMIN-002: Quản lý users**
- Admin xem danh sách tất cả users
- Search, filter, sort
- Pagination
- API: `GET /api/v1/admin/users`

**FR-ADMIN-003: Xem chi tiết user**
- Admin xem chi tiết 1 user
- Hiển thị: profile, Facebook connection (token masked), statistics
- API: `GET /api/v1/admin/users/:id`

**FR-ADMIN-004: Ban user**
- Admin có thể khóa user
- Nhập lý do
- Revoke tất cả sessions
- Gửi email thông báo (optional)
- API: `PUT /api/v1/admin/users/:id/ban`

**FR-ADMIN-005: Unban user**
- Admin có thể mở khóa user
- Log action
- API: `PUT /api/v1/admin/users/:id/unban`

**FR-ADMIN-006: Xóa user (Super Admin only)**
- Super Admin có thể xóa user
- Soft delete
- Cleanup files
- Confirmation required
- API: `DELETE /api/v1/admin/users/:id`

**FR-ADMIN-007: Xem tất cả posts**
- Admin xem posts của tất cả users
- Filter theo user, status, page, date
- API: `GET /api/v1/admin/posts`

**FR-ADMIN-008: Xem system logs**
- Admin xem system logs
- Filter theo level, type, user, date
- Export logs
- API: `GET /api/v1/admin/logs`

**FR-ADMIN-009: Xem top errors**
- Admin xem top errors trong khoảng thời gian
- Hiển thị: error type, count, affected users
- API: `GET /api/v1/admin/logs/top-errors`

**FR-ADMIN-010: Quản lý settings (Super Admin only)**
- Super Admin xem/sửa app settings
- Settings: upload limits, rate limits, Facebook API config
- Log changes
- API: `GET /api/v1/admin/settings`, `PUT /api/v1/admin/settings`

---

### 2.9. Admin Plan Management (NEW)

**FR-ADMIN-PLAN-001: Xem danh sách plans**
- Admin xem tất cả plans (free, premium, custom)
- Hiển thị: plan name, description, price, features count, users count, status
- API: `GET /api/v1/admin/plans`

**FR-ADMIN-PLAN-002: Tạo plan mới**
- Admin có thể tạo plan mới (ví dụ: enterprise, trial)
- Nhập: name, description, price, duration
- API: `POST /api/v1/admin/plans`

**FR-ADMIN-PLAN-003: Xem chi tiết plan**
- Admin xem chi tiết 1 plan
- Hiển thị: thông tin plan, danh sách features, danh sách users đang dùng
- API: `GET /api/v1/admin/plans/:id`

**FR-ADMIN-PLAN-004: Cập nhật plan**
- Admin có thể cập nhật thông tin plan
- Cập nhật: name, description, price, status
- Không ảnh hưởng đến users đang dùng plan
- API: `PATCH /api/v1/admin/plans/:id`

**FR-ADMIN-PLAN-005: Disable plan**
- Admin có thể disable plan (không cho user mới đăng ký)
- Users hiện tại vẫn dùng được
- API: `PATCH /api/v1/admin/plans/:id` (field: is_active = false)

**FR-ADMIN-PLAN-006: Xem features của plan**
- Admin xem danh sách features của 1 plan
- Hiển thị: feature_key, feature_value, description
- Ví dụ: can_edit_card_2 = true, monthly_post_limit = 100
- API: `GET /api/v1/admin/plans/:id/features`

**FR-ADMIN-PLAN-007: Cập nhật features của plan**
- Admin có thể bật/tắt features cho plan
- Cập nhật: can_edit_card_1, can_edit_card_2, can_upload_video, can_schedule_post, daily_post_limit, monthly_post_limit, max_upload_size_mb
- Áp dụng ngay cho tất cả users của plan
- API: `PATCH /api/v1/admin/plans/:id/features`

**FR-ADMIN-PLAN-008: Gán plan cho user**
- Admin có thể đổi plan của user
- Chọn user, chọn plan mới, nhập expiry date (nếu có)
- Log action
- API: `PATCH /api/v1/admin/users/:id/plan`

**FR-ADMIN-PLAN-009: Override quyền cho user cụ thể**
- Admin có thể override quyền cho 1 user cụ thể
- Ví dụ: User A dùng free plan nhưng được mở can_edit_card_2
- Nhập: user_id, feature_key, feature_value, reason, expiry_date
- Log action
- API: `POST /api/v1/admin/users/:id/feature-overrides`

**FR-ADMIN-PLAN-010: Xem feature overrides của user**
- Admin xem danh sách quyền đã override cho 1 user
- Hiển thị: feature_key, override_value, reason, overridden_by, created_at, expires_at
- API: `GET /api/v1/admin/users/:id/feature-overrides`

**FR-ADMIN-PLAN-011: Xóa feature override**
- Admin có thể xóa override (user quay về quyền mặc định của plan)
- Log action
- API: `DELETE /api/v1/admin/users/:id/feature-overrides/:override_id`

---

### 2.10. Admin Card Settings Management (NEW)

**FR-ADMIN-CARD-001: Xem card settings**
- Admin xem cấu hình hiện tại của card 1 và card 2
- Hiển thị: is_enabled, is_locked_for_free, is_locked_for_premium, default_media, default_link, default_caption, allowed_media_types, max_file_size_mb
- API: `GET /api/v1/admin/card-settings`

**FR-ADMIN-CARD-002: Cập nhật card 1 settings**
- Admin cấu hình card 1:
  - Bật/tắt card 1 (is_enabled)
  - Loại media cho phép (image/video/both)
  - Kích thước file tối đa
- API: `PATCH /api/v1/admin/card-settings/card-1`

**FR-ADMIN-CARD-003: Cập nhật card 2 settings**
- Admin cấu hình card 2:
  - Bật/tắt card 2 (is_enabled)
  - Khóa cho free user (is_locked_for_free)
  - Khóa cho premium user (is_locked_for_premium)
  - Loại media cho phép (image/video/both)
  - Kích thước file tối đa
- API: `PATCH /api/v1/admin/card-settings/card-2`

**FR-ADMIN-CARD-004: Upload default media cho card 2**
- Admin upload ảnh/video mặc định cho card 2
- Validate: file type, size
- Generate thumbnail
- Media này sẽ được dùng khi user free tạo bài
- API: `POST /api/v1/admin/card-settings/card-2/default-media`

**FR-ADMIN-CARD-005: Xóa default media**
- Admin có thể xóa media mặc định
- Cleanup file
- API: `DELETE /api/v1/admin/card-settings/card-2/default-media`

**FR-ADMIN-CARD-006: Set default link cho card 2**
- Admin nhập link mặc định cho card 2
- Validate URL format
- API: `PATCH /api/v1/admin/card-settings/card-2` (field: default_link_url)

**FR-ADMIN-CARD-007: Set default caption cho card 2**
- Admin nhập title/description mặc định cho card 2
- API: `PATCH /api/v1/admin/card-settings/card-2` (fields: default_title, default_description)

**FR-ADMIN-CARD-008: Preview card 2 mặc định**
- Admin xem preview card 2 với cấu hình hiện tại
- Hiển thị: media, title, description, link, CTA
- Giúp admin kiểm tra trước khi apply

---

## 3. YÊU CẦU PHI CHỨC NĂNG

### 3.1. Performance

**NFR-PERF-001: Response Time**
- GET endpoints: < 200ms (p95)
- POST endpoints: < 500ms (p95)
- Upload endpoints: < 5s for 10MB file
- Database queries: < 100ms (p95)

**NFR-PERF-002: Throughput**
- Support 100 concurrent users
- Support 1000 requests/minute
- Support 50 concurrent uploads

**NFR-PERF-003: Scalability**
- Horizontal scaling (add more servers)
- Database read replicas
- Caching layer (Redis)

---

### 3.2. Security

**NFR-SEC-001: Authentication**
- JWT tokens (Access: 15 min, Refresh: 7 days)
- Secure password hashing (bcrypt, salt rounds = 10)
- Session management

**NFR-SEC-002: Authorization**
- Role-based access control (RBAC)
- Plan-based permissions (NEW)
- Ownership checks
- Admin permissions

**NFR-SEC-002-PLAN: Plan-based Permission Validation (NEW)**
- Backend MUST validate plan permissions trước khi cho phép action
- Không tin tưởng frontend locked state
- Free user gửi dữ liệu card 2 → Backend MUST reject với error `PERMISSION_DENIED`
- Premium user không có permission `can_edit_card_2` → Backend MUST reject
- Check plan limits (posts/month, videos/month) trước khi action
- Return error `PLAN_LIMIT_EXCEEDED` nếu vượt limit
- Log tất cả permission violations

**NFR-SEC-003: Data Encryption**
- Facebook tokens encrypted (AES-256-GCM)
- HTTPS only in production
- Secure cookies (httpOnly, secure, sameSite)

**NFR-SEC-004: Input Validation**
- Validate all user inputs
- Sanitize data
- Prevent SQL injection, XSS

**NFR-SEC-005: Rate Limiting**
- Login: 5 attempts/15 min
- API: 100 requests/hour
- Upload: 50 uploads/hour
- Post: 20 posts/hour

**NFR-SEC-006: Audit Logging**
- Log all admin actions
- Log authentication events
- Log errors

---

### 3.3. Reliability

**NFR-REL-001: Availability**
- Uptime: 99.5% (target)
- Downtime: < 3.6 hours/month

**NFR-REL-002: Error Handling**
- Graceful error handling
- User-friendly error messages
- Retry mechanism for transient errors

**NFR-REL-003: Backup**
- Daily database backup
- Hourly incremental backup
- 30 days retention
- Off-site storage (S3)

**NFR-REL-004: Disaster Recovery**
- RTO (Recovery Time Objective): 4 hours
- RPO (Recovery Point Objective): 1 hour
- Documented recovery procedures

---

### 3.4. Usability

**NFR-USE-001: User Interface**
- Intuitive, easy to use
- Responsive design (desktop, tablet, mobile)
- Consistent design system

**NFR-USE-002: Accessibility**
- WCAG 2.1 Level AA compliance (target)
- Keyboard navigation
- Screen reader support
- ARIA labels

**NFR-USE-003: Internationalization**
- Support Vietnamese (primary)
- Support English (secondary)
- Timezone support

**NFR-USE-004: Help & Documentation**
- User guide
- Tooltips
- Error messages rõ ràng

---

### 3.5. Maintainability

**NFR-MAIN-001: Code Quality**
- Clean code
- Follow best practices
- Code review required

**NFR-MAIN-002: Testing**
- Unit tests: >80% coverage
- Integration tests
- E2E tests
- Security tests

**NFR-MAIN-003: Documentation**
- API documentation (Swagger)
- Architecture documentation
- Deployment guide
- Troubleshooting guide

**NFR-MAIN-004: Monitoring**
- Application monitoring (APM)
- Error tracking (Sentry)
- Uptime monitoring
- Alerts

---

### 3.6. Compatibility

**NFR-COMP-001: Browser Support**
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

**NFR-COMP-002: Mobile Support**
- iOS Safari (latest 2 versions)
- Chrome Mobile (latest 2 versions)

**NFR-COMP-003: Facebook API**
- Graph API v21.0 (current)
- Support API version migration

---

## 4. USER STORIES

### 4.1. End User Stories

**US-001: Đăng ký và đăng nhập**
```
Là một user mới
Tôi muốn đăng ký tài khoản
Để có thể sử dụng tool đăng video lên Facebook
```

**US-002: Kết nối Facebook**
```
Là một user đã đăng nhập
Tôi muốn kết nối tài khoản Facebook của mình
Để có thể đăng bài lên Page
```

**US-003: Tạo bài đăng video 2 ô**
```
Là một user đã kết nối Facebook
Tôi muốn tạo bài đăng với 2 videos
Để quảng bá sản phẩm trên Facebook Page
```

**US-004: Preview trước khi đăng**
```
Là một user đang tạo bài
Tôi muốn preview bài đăng trước khi publish
Để đảm bảo nội dung đúng như mong muốn
```

**US-005: Lên lịch đăng bài**
```
Là một user
Tôi muốn lên lịch đăng bài vào thời gian cụ thể
Để bài đăng tự động publish vào giờ vàng
```

**US-006: Xem lịch sử bài đăng**
```
Là một user
Tôi muốn xem lại các bài đã đăng
Để theo dõi hiệu quả và quản lý nội dung
```

**US-007: Retry bài đăng failed**
```
Là một user có bài đăng failed
Tôi muốn retry lại
Để không phải tạo lại từ đầu
```

---

### 4.2. Admin Stories

**US-ADMIN-001: Xem thống kê hệ thống**
```
Là một admin
Tôi muốn xem thống kê tổng quan
Để nắm được tình hình hoạt động của hệ thống
```

**US-ADMIN-002: Quản lý users**
```
Là một admin
Tôi muốn xem danh sách users và quản lý
Để hỗ trợ users và xử lý vi phạm
```

**US-ADMIN-003: Khóa user vi phạm**
```
Là một admin
Tôi muốn khóa user vi phạm điều khoản
Để bảo vệ hệ thống và cộng đồng
```

**US-ADMIN-004: Xem logs lỗi**
```
Là một admin
Tôi muốn xem logs lỗi hệ thống
Để troubleshoot và fix bugs
```

---

## 5. ACCEPTANCE CRITERIA

### 5.1. Authentication

**AC-AUTH-001: Đăng ký thành công**
- ✅ User nhập đầy đủ thông tin hợp lệ
- ✅ Email chưa tồn tại
- ✅ Username chưa tồn tại
- ✅ Password đủ mạnh
- ✅ Email xác nhận được gửi
- ✅ User status = 'pending'

**AC-AUTH-002: Đăng nhập thành công**
- ✅ User nhập email/password đúng
- ✅ Account status = 'active'
- ✅ Nhận access token và refresh token
- ✅ Session được tạo
- ✅ last_login_at được update

---

### 5.2. Facebook Connection

**AC-FB-001: Kết nối Facebook thành công**
- ✅ Token hợp lệ
- ✅ Token có đủ permissions
- ✅ Token được encrypt trước khi lưu
- ✅ Pages được fetch và lưu
- ✅ Ad accounts được fetch và lưu

---

### 5.3. Create Post

**AC-POST-001: Đăng bài thành công**
- ✅ User đã kết nối Facebook
- ✅ Token còn hiệu lực
- ✅ 2 videos đã upload
- ✅ Thông tin 2 cards đầy đủ
- ✅ Videos upload lên Facebook thành công
- ✅ Ad creative tạo thành công
- ✅ Post publish lên page thành công
- ✅ Logs được ghi đầy đủ

---

## 6. CONSTRAINTS & ASSUMPTIONS

### 6.1. Constraints

**Technical Constraints:**
- Facebook Graph API rate limits
- Video upload size limit: 500MB
- Video duration limit: 5 minutes
- Max 2 videos per post (carousel format)

**Business Constraints:**
- Budget: TBD
- Timeline: 8-12 tuần
- Team size: 1-2 developers

**Legal Constraints:**
- Tuân thủ Facebook Platform Policy
- GDPR compliance (nếu có EU users)
- Privacy policy required

---

### 6.2. Assumptions

**User Assumptions:**
- Users có Facebook Page
- Users có Ad Account
- Users biết cách lấy Facebook access token (hoặc dùng OAuth)

**Technical Assumptions:**
- Facebook Graph API v21.0 stable
- Users có internet connection ổn định
- Users dùng modern browsers

**Business Assumptions:**
- Có nhu cầu thực tế cho tool này
- Users sẵn sàng trả phí (nếu có)
- Facebook không thay đổi API đột ngột

---

## 7. OUT OF SCOPE

### Không nằm trong scope Phase 1

❌ **Payment/Subscription:**
- Không có payment gateway
- Không có subscription plans
- Free for all users

❌ **Advanced Features:**
- Không có A/B testing
- Không có analytics/insights
- Không có auto-posting từ RSS
- Không có bulk upload

❌ **Social Features:**
- Không có comments/likes trong app
- Không có user collaboration
- Không có sharing posts

❌ **Mobile App:**
- Chỉ có web app
- Không có native iOS/Android app

---

## 8. DEPENDENCIES

### 8.1. External Dependencies

**Facebook:**
- Facebook Graph API v21.0
- Facebook OAuth
- Facebook Ad Account

**Third-party Services:**
- Email service (SMTP / SendGrid)
- Error tracking (Sentry) - optional
- Monitoring (New Relic) - optional

---

### 8.2. Internal Dependencies

**Phase Dependencies:**
- Phase 3 (Database) → Phase 4 (Auth)
- Phase 4 (Auth) → Phase 8 (User Management)
- Phase 9 (Facebook) → Phase 12 (Posting)
- Phase 10 (Upload) → Phase 12 (Posting)

---

## 9. RISKS & MITIGATION

### 9.1. Technical Risks

**Risk 1: Facebook API Changes**
- **Impact:** High
- **Probability:** Medium
- **Mitigation:** Monitor Facebook changelog, version API, có fallback plan

**Risk 2: Token Expiration**
- **Impact:** High
- **Probability:** High
- **Mitigation:** Auto refresh tokens, notify users, có manual refresh

**Risk 3: Video Upload Failures**
- **Impact:** Medium
- **Probability:** Medium
- **Mitigation:** Retry mechanism, chunked upload, error handling

---

### 9.2. Business Risks

**Risk 1: Low User Adoption**
- **Impact:** High
- **Probability:** Medium
- **Mitigation:** User research, MVP testing, marketing

**Risk 2: Facebook Policy Violation**
- **Impact:** Critical
- **Probability:** Low
- **Mitigation:** Follow Facebook policies, legal review

---

## 10. SUCCESS METRICS

### 10.1. User Metrics

- **User Registration:** 100 users trong 3 tháng đầu
- **Active Users:** 50 DAU (Daily Active Users)
- **Posts Created:** 500 posts/month
- **Success Rate:** >95% posts thành công

---

### 10.2. Technical Metrics

- **Uptime:** >99.5%
- **Response Time:** <200ms (p95)
- **Error Rate:** <1%
- **Test Coverage:** >80%

---

## THAM CHIẾU

- [API Plan](./08-api-plan.md) - Chi tiết 47 APIs
- [Architecture Plan](./03-architecture-plan.md) - Kiến trúc hệ thống
- [Database Plan](./04-database-plan.md) - Database schema
- [Security Plan](./05-security-plan.md) - Bảo mật
- [Implementation Phases](./06-implementation-phases.md) - Kế hoạch triển khai

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-25  
**Status:** ✅ Completed

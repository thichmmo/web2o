# DATABASE PLAN - THÍCH CỪU FACEBOOK VIDEO 2 Ô TOOL

## 1. TỔNG QUAN

**Database:** PostgreSQL 14+

**ORM:** Sequelize / Prisma

**Tổng số tables:** 17 tables (12 tables cũ + 5 tables mới cho plan system)

**Relationships:** 1:1, 1:N

**Thay đổi quan trọng:**
- ✅ Thêm 5 tables mới: `plans`, `user_plans`, `plan_features`, `card_settings`, `user_feature_overrides`
- ✅ Table `users` không thay đổi (role vẫn là user/admin/super_admin)
- ✅ Plan system độc lập với role system
- ✅ Role = quyền hệ thống, Plan = quyền sử dụng tính năng

---

## 2. DATABASE SCHEMA

### 2.1. users

**Mô tả:** Lưu thông tin tài khoản users

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | User ID |
| username | VARCHAR(50) | UNIQUE, NOT NULL | Username |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hash |
| full_name | VARCHAR(255) | NOT NULL | Tên đầy đủ |
| avatar_url | TEXT | NULL | URL avatar |
| role | ENUM | NOT NULL, DEFAULT 'user' | user, admin, super_admin |
| status | ENUM | NOT NULL, DEFAULT 'pending' | pending, active, inactive, banned |
| email_verified | BOOLEAN | NOT NULL, DEFAULT false | Email đã verify? |
| email_verified_at | TIMESTAMP | NULL | Thời gian verify |
| banned_at | TIMESTAMP | NULL | Thời gian bị ban |
| ban_reason | TEXT | NULL | Lý do ban |
| last_login_at | TIMESTAMP | NULL | Lần login cuối |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian tạo |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian update |
| deleted_at | TIMESTAMP | NULL | Soft delete |

**Indexes:**
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);
```

**API sử dụng:**
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- GET /api/v1/user/profile
- PUT /api/v1/user/profile
- GET /api/v1/admin/users
- GET /api/v1/admin/users/:id

---

### 2.2. user_settings

**Mô tả:** Lưu cài đặt của users

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Setting ID |
| user_id | UUID | FOREIGN KEY, UNIQUE, NOT NULL | User ID |
| notifications_enabled | BOOLEAN | NOT NULL, DEFAULT true | Bật notifications? |
| email_on_post_success | BOOLEAN | NOT NULL, DEFAULT true | Email khi post thành công? |
| email_on_post_failure | BOOLEAN | NOT NULL, DEFAULT true | Email khi post failed? |
| default_page_id | VARCHAR(50) | NULL | Page mặc định |
| default_ad_account_id | VARCHAR(50) | NULL | Ad account mặc định |
| timezone | VARCHAR(50) | NOT NULL, DEFAULT 'Asia/Ho_Chi_Minh' | Múi giờ |
| language | VARCHAR(10) | NOT NULL, DEFAULT 'vi' | Ngôn ngữ (vi, en) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian tạo |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian update |

**Relationships:**
```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
```

**Indexes:**
```sql
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
```

**API sử dụng:**
- GET /api/v1/user/settings
- PUT /api/v1/user/settings

---

### 2.3. facebook_accounts

**Mô tả:** Lưu kết nối Facebook của users

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Account ID |
| user_id | UUID | FOREIGN KEY, UNIQUE, NOT NULL | User ID (1:1) |
| facebook_id | VARCHAR(50) | NOT NULL | Facebook User ID |
| facebook_name | VARCHAR(255) | NOT NULL | Facebook name |
| access_token_encrypted | TEXT | NOT NULL | Token encrypted (AES-256-GCM) |
| token_expires_at | TIMESTAMP | NOT NULL | Token expiry |
| connected_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian kết nối |
| last_refreshed_at | TIMESTAMP | NULL | Lần refresh cuối |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian tạo |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian update |

**Relationships:**
```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
```

**Indexes:**
```sql
CREATE INDEX idx_facebook_accounts_user_id ON facebook_accounts(user_id);
CREATE INDEX idx_facebook_accounts_facebook_id ON facebook_accounts(facebook_id);
```

**Security:**
- ⚠️ `access_token_encrypted` được encrypt bằng AES-256-GCM
- ⚠️ Không bao giờ log token thô
- ⚠️ Admin chỉ thấy token masked

**API sử dụng:**
- POST /api/v1/facebook/connect
- GET /api/v1/facebook/status
- POST /api/v1/facebook/refresh-token
- POST /api/v1/facebook/disconnect

---

### 2.4. facebook_pages

**Mô tả:** Lưu danh sách Facebook Pages

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Record ID |
| user_id | UUID | FOREIGN KEY, NOT NULL | User ID |
| page_id | VARCHAR(50) | NOT NULL | Facebook Page ID |
| page_name | VARCHAR(255) | NOT NULL | Page name |
| page_picture_url | TEXT | NULL | Page picture |
| followers_count | INTEGER | NULL | Số followers |
| is_published | BOOLEAN | NOT NULL, DEFAULT true | Page published? |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian tạo |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian update |

**Relationships:**
```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
UNIQUE (user_id, page_id)
```

**Indexes:**
```sql
CREATE INDEX idx_facebook_pages_user_id ON facebook_pages(user_id);
CREATE INDEX idx_facebook_pages_page_id ON facebook_pages(page_id);
```

**API sử dụng:**
- GET /api/v1/facebook/pages

---

### 2.5. facebook_ad_accounts

**Mô tả:** Lưu danh sách Facebook Ad Accounts

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Record ID |
| user_id | UUID | FOREIGN KEY, NOT NULL | User ID |
| ad_account_id | VARCHAR(50) | NOT NULL | Facebook Ad Account ID |
| ad_account_name | VARCHAR(255) | NOT NULL | Account name |
| account_status | VARCHAR(50) | NOT NULL | ACTIVE, DISABLED, etc. |
| currency | VARCHAR(10) | NOT NULL | VND, USD, etc. |
| timezone_name | VARCHAR(50) | NOT NULL | Timezone |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian tạo |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian update |

**Relationships:**
```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
UNIQUE (user_id, ad_account_id)
```

**Indexes:**
```sql
CREATE INDEX idx_facebook_ad_accounts_user_id ON facebook_ad_accounts(user_id);
CREATE INDEX idx_facebook_ad_accounts_ad_account_id ON facebook_ad_accounts(ad_account_id);
```

**API sử dụng:**
- GET /api/v1/facebook/ad-accounts

---

### 2.6. posts

**Mô tả:** Lưu thông tin bài đăng

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Post ID |
| user_id | UUID | FOREIGN KEY, NOT NULL | User ID |
| page_id | VARCHAR(50) | NOT NULL | Facebook Page ID |
| page_name | VARCHAR(255) | NOT NULL | Page name (cached) |
| ad_account_id | VARCHAR(50) | NOT NULL | Ad Account ID |
| message | TEXT | NULL | Caption/message |
| status | ENUM | NOT NULL, DEFAULT 'draft' | draft, processing, posted, failed, scheduled |
| facebook_post_id | VARCHAR(50) | NULL | Facebook Post ID |
| facebook_creative_id | VARCHAR(50) | NULL | Facebook Creative ID |
| scheduled_at | TIMESTAMP | NULL | Thời gian lên lịch |
| posted_at | TIMESTAMP | NULL | Thời gian đăng thực tế |
| retry_count | INTEGER | NOT NULL, DEFAULT 0 | Số lần retry |
| error_message | TEXT | NULL | Error message nếu failed |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian tạo |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian update |
| deleted_at | TIMESTAMP | NULL | Soft delete |

**Relationships:**
```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
```

**Indexes:**
```sql
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_page_id ON posts(page_id);
CREATE INDEX idx_posts_scheduled_at ON posts(scheduled_at);
CREATE INDEX idx_posts_posted_at ON posts(posted_at);
CREATE INDEX idx_posts_created_at ON posts(created_at);
```

**API sử dụng:**
- POST /api/v1/posts
- GET /api/v1/posts
- GET /api/v1/posts/:id
- POST /api/v1/posts/:id/publish
- POST /api/v1/posts/:id/schedule
- DELETE /api/v1/posts/:id
- GET /api/v1/admin/posts

---

### 2.7. post_videos

**Mô tả:** Lưu thông tin videos trong posts (2 videos/post)

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Video ID |
| post_id | UUID | FOREIGN KEY, NOT NULL | Post ID |
| card_index | INTEGER | NOT NULL | 0 hoặc 1 (card 1 hoặc 2) |
| title | VARCHAR(255) | NOT NULL | Tiêu đề card |
| description | TEXT | NULL | Mô tả card |
| link | TEXT | NULL | Link (default = page URL) |
| cta_type | VARCHAR(50) | NOT NULL | LIKE_PAGE, OPEN_LINK, etc. |
| cta_link | TEXT | NULL | Link cho CTA (nếu OPEN_LINK) |
| video_file_path | TEXT | NOT NULL | Path file video local |
| video_size_bytes | BIGINT | NOT NULL | Kích thước file |
| video_duration_seconds | INTEGER | NOT NULL | Độ dài video |
| video_width | INTEGER | NOT NULL | Chiều rộng |
| video_height | INTEGER | NOT NULL | Chiều cao |
| thumbnail_url | TEXT | NULL | URL thumbnail |
| facebook_video_id | VARCHAR(50) | NULL | Facebook Video ID |
| uploaded_to_facebook_at | TIMESTAMP | NULL | Thời gian upload lên FB |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian tạo |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian update |

**Relationships:**
```sql
FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
UNIQUE (post_id, card_index)
```

**Indexes:**
```sql
CREATE INDEX idx_post_videos_post_id ON post_videos(post_id);
```

**API sử dụng:**
- POST /api/v1/posts (tạo videos)
- GET /api/v1/posts/:id (xem videos)

---

### 2.8. post_logs

**Mô tả:** Lưu logs chi tiết từng bước của post

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Log ID |
| post_id | UUID | FOREIGN KEY, NOT NULL | Post ID |
| timestamp | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian log |
| level | ENUM | NOT NULL | info, warn, error |
| step | VARCHAR(50) | NOT NULL | start, upload_video_1, create_creative, publish, etc. |
| message | TEXT | NOT NULL | Log message |
| details | JSONB | NULL | Chi tiết (JSON) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian tạo |

**Relationships:**
```sql
FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
```

**Indexes:**
```sql
CREATE INDEX idx_post_logs_post_id ON post_logs(post_id);
CREATE INDEX idx_post_logs_timestamp ON post_logs(timestamp);
CREATE INDEX idx_post_logs_level ON post_logs(level);
```

**API sử dụng:**
- GET /api/v1/posts/:id/logs

---

### 2.9. system_logs

**Mô tả:** Lưu system logs (errors, warnings, info)

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Log ID |
| timestamp | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian log |
| level | ENUM | NOT NULL | debug, info, warn, error |
| user_id | UUID | NULL | User ID (nếu có) |
| type | VARCHAR(50) | NOT NULL | facebook_api, upload, auth, etc. |
| message | TEXT | NOT NULL | Log message |
| details | JSONB | NULL | Chi tiết (JSON) |
| ip_address | VARCHAR(45) | NULL | IP address |
| user_agent | TEXT | NULL | User agent |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian tạo |

**Indexes:**
```sql
CREATE INDEX idx_system_logs_timestamp ON system_logs(timestamp);
CREATE INDEX idx_system_logs_level ON system_logs(level);
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX idx_system_logs_type ON system_logs(type);
```

**API sử dụng:**
- GET /api/v1/logs
- GET /api/v1/admin/logs
- GET /api/v1/admin/logs/top-errors

---

### 2.10. admin_logs

**Mô tả:** Lưu logs hành động của admin

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Log ID |
| admin_id | UUID | FOREIGN KEY, NOT NULL | Admin user ID |
| action | VARCHAR(50) | NOT NULL | ban_user, unban_user, delete_user, update_settings, etc. |
| target_type | VARCHAR(50) | NULL | user, post, setting, etc. |
| target_id | VARCHAR(255) | NULL | ID của target |
| details | JSONB | NULL | Chi tiết action |
| ip_address | VARCHAR(45) | NULL | IP address |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian tạo |

**Relationships:**
```sql
FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
```

**Indexes:**
```sql
CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at);
```

**API sử dụng:**
- Tự động log khi admin thực hiện actions

---

### 2.11. sessions

**Mô tả:** Lưu user sessions (JWT refresh tokens)

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Session ID |
| user_id | UUID | FOREIGN KEY, NOT NULL | User ID |
| refresh_token_hash | VARCHAR(255) | NOT NULL | Hash của refresh token |
| ip_address | VARCHAR(45) | NULL | IP address |
| user_agent | TEXT | NULL | User agent |
| expires_at | TIMESTAMP | NOT NULL | Thời gian hết hạn |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian tạo |

**Relationships:**
```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
```

**Indexes:**
```sql
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

**API sử dụng:**
- POST /api/v1/auth/login (tạo session)
- POST /api/v1/auth/refresh (validate session)
- POST /api/v1/auth/logout (xóa session)

---

### 2.12. app_settings

**Mô tả:** Lưu cài đặt ứng dụng

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Setting ID |
| key | VARCHAR(255) | UNIQUE, NOT NULL | Setting key (e.g., upload.max_file_size_mb) |
| value | TEXT | NOT NULL | Setting value (JSON string) |
| description | TEXT | NULL | Mô tả setting |
| updated_by | UUID | NULL | Admin user ID |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian tạo |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian update |

**Indexes:**
```sql
CREATE INDEX idx_app_settings_key ON app_settings(key);
```

**API sử dụng:**
- GET /api/v1/admin/settings
- PUT /api/v1/admin/settings

---

### 2.13. plans (NEW)

**Mô tả:** Lưu các gói plan (free, premium, enterprise)

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Plan ID |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Plan name (free, premium, enterprise) |
| display_name | VARCHAR(100) | NOT NULL | Tên hiển thị |
| description | TEXT | NULL | Mô tả plan |
| price | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Giá (0 = free) |
| currency | VARCHAR(10) | NOT NULL, DEFAULT 'VND' | Đơn vị tiền tệ |
| duration_days | INTEGER | NULL | Thời hạn (NULL = vĩnh viễn) |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Plan có active không |
| is_default | BOOLEAN | NOT NULL, DEFAULT false | Plan mặc định cho user mới |
| sort_order | INTEGER | NOT NULL, DEFAULT 0 | Thứ tự hiển thị |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian tạo |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian update |

**Indexes:**
```sql
CREATE INDEX idx_plans_name ON plans(name);
CREATE INDEX idx_plans_is_active ON plans(is_active);
CREATE INDEX idx_plans_is_default ON plans(is_default);
```

**API sử dụng:**
- GET /api/v1/admin/plans
- POST /api/v1/admin/plans
- GET /api/v1/admin/plans/:id
- PATCH /api/v1/admin/plans/:id

**Seed data:**
```sql
INSERT INTO plans (name, display_name, description, price, is_default) VALUES
('free', 'Free Plan', 'Basic features for personal use', 0, true),
('premium', 'Premium Plan', 'Advanced features for professionals', 99000, false);
```

---

### 2.14. user_plans (NEW)

**Mô tả:** Lưu plan hiện tại của users (subscription)

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Subscription ID |
| user_id | UUID | FOREIGN KEY, NOT NULL | User ID |
| plan_id | UUID | FOREIGN KEY, NOT NULL | Plan ID |
| status | ENUM | NOT NULL, DEFAULT 'active' | active, expired, cancelled |
| started_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Ngày bắt đầu |
| expires_at | TIMESTAMP | NULL | Ngày hết hạn (NULL = vĩnh viễn) |
| cancelled_at | TIMESTAMP | NULL | Ngày hủy |
| assigned_by | UUID | NULL | Admin ID (nếu admin gán) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian tạo |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian update |

**Relationships:**
```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT
FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
```

**Indexes:**
```sql
CREATE INDEX idx_user_plans_user_id ON user_plans(user_id);
CREATE INDEX idx_user_plans_plan_id ON user_plans(plan_id);
CREATE INDEX idx_user_plans_status ON user_plans(status);
CREATE INDEX idx_user_plans_expires_at ON user_plans(expires_at);
```

**Business Logic:**
- Mỗi user chỉ có 1 active plan tại 1 thời điểm
- Khi user đăng ký, tự động tạo user_plan với plan "free"
- Khi admin đổi plan, tạo record mới và set record cũ = expired
- Cron job check expires_at để auto-expire plans

**API sử dụng:**
- GET /api/v1/me/plan
- PATCH /api/v1/admin/users/:id/plan

---

### 2.15. plan_features (NEW)

**Mô tả:** Lưu features/permissions của từng plan

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Feature ID |
| plan_id | UUID | FOREIGN KEY, NOT NULL | Plan ID |
| feature_key | VARCHAR(100) | NOT NULL | Feature key |
| feature_value | TEXT | NOT NULL | Feature value (JSON string) |
| description | TEXT | NULL | Mô tả feature |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian tạo |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian update |

**Relationships:**
```sql
FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
UNIQUE (plan_id, feature_key)
```

**Indexes:**
```sql
CREATE INDEX idx_plan_features_plan_id ON plan_features(plan_id);
CREATE INDEX idx_plan_features_feature_key ON plan_features(feature_key);
```

**Feature Keys:**
```
Boolean features:
- can_edit_card_1 (true/false)
- can_edit_card_2 (true/false)
- can_upload_image (true/false)
- can_upload_video (true/false)
- can_edit_card_link (true/false)
- can_schedule_post (true/false)
- can_retry_failed_post (true/false)

Numeric features:
- daily_post_limit (number)
- monthly_post_limit (number)
- max_upload_size_mb (number)
- max_storage_gb (number)
```

**API sử dụng:**
- GET /api/v1/admin/plans/:id/features
- PATCH /api/v1/admin/plans/:id/features
- GET /api/v1/me/permissions

**Seed data:**
```sql
-- Free plan features
INSERT INTO plan_features (plan_id, feature_key, feature_value) VALUES
((SELECT id FROM plans WHERE name = 'free'), 'can_edit_card_1', 'true'),
((SELECT id FROM plans WHERE name = 'free'), 'can_edit_card_2', 'false'),
((SELECT id FROM plans WHERE name = 'free'), 'can_upload_video', 'true'),
((SELECT id FROM plans WHERE name = 'free'), 'can_schedule_post', 'false'),
((SELECT id FROM plans WHERE name = 'free'), 'monthly_post_limit', '5');

-- Premium plan features
INSERT INTO plan_features (plan_id, feature_key, feature_value) VALUES
((SELECT id FROM plans WHERE name = 'premium'), 'can_edit_card_1', 'true'),
((SELECT id FROM plans WHERE name = 'premium'), 'can_edit_card_2', 'true'),
((SELECT id FROM plans WHERE name = 'premium'), 'can_upload_video', 'true'),
((SELECT id FROM plans WHERE name = 'premium'), 'can_schedule_post', 'true'),
((SELECT id FROM plans WHERE name = 'premium'), 'monthly_post_limit', '100');
```

---

### 2.16. card_settings (NEW)

**Mô tả:** Lưu cấu hình card 1 và card 2 (global settings)

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Setting ID |
| card_index | INTEGER | UNIQUE, NOT NULL | 0 = card 1, 1 = card 2 |
| is_enabled | BOOLEAN | NOT NULL, DEFAULT true | Card có bật không |
| is_locked_for_free | BOOLEAN | NOT NULL, DEFAULT false | Khóa cho free user |
| is_locked_for_premium | BOOLEAN | NOT NULL, DEFAULT false | Khóa cho premium user |
| default_media_type | VARCHAR(20) | NULL | image/video |
| default_media_url | TEXT | NULL | URL media mặc định |
| default_thumbnail_url | TEXT | NULL | URL thumbnail |
| default_title | VARCHAR(255) | NULL | Title mặc định |
| default_description | TEXT | NULL | Description mặc định |
| default_link_url | TEXT | NULL | Link mặc định |
| default_cta_type | VARCHAR(50) | NULL | CTA type mặc định |
| allowed_media_types | TEXT | NOT NULL, DEFAULT '["image","video"]' | JSON array |
| max_file_size_mb | INTEGER | NOT NULL, DEFAULT 500 | Kích thước file tối đa |
| updated_by | UUID | NULL | Admin ID |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian tạo |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian update |

**Indexes:**
```sql
CREATE INDEX idx_card_settings_card_index ON card_settings(card_index);
```

**API sử dụng:**
- GET /api/v1/admin/card-settings
- PATCH /api/v1/admin/card-settings/card-1
- PATCH /api/v1/admin/card-settings/card-2
- POST /api/v1/admin/card-settings/card-2/default-media
- GET /api/v1/me/card-settings

**Seed data:**
```sql
-- Card 1 settings (unlocked for all)
INSERT INTO card_settings (card_index, is_enabled, is_locked_for_free, is_locked_for_premium) VALUES
(0, true, false, false);

-- Card 2 settings (locked for free, unlocked for premium)
INSERT INTO card_settings (card_index, is_enabled, is_locked_for_free, is_locked_for_premium) VALUES
(1, true, true, false);
```

---

### 2.17. user_feature_overrides (NEW)

**Mô tả:** Lưu override quyền cho user cụ thể (admin can grant special permissions)

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Override ID |
| user_id | UUID | FOREIGN KEY, NOT NULL | User ID |
| feature_key | VARCHAR(100) | NOT NULL | Feature key |
| feature_value | TEXT | NOT NULL | Override value (JSON string) |
| reason | TEXT | NULL | Lý do override |
| overridden_by | UUID | FOREIGN KEY, NOT NULL | Admin ID |
| expires_at | TIMESTAMP | NULL | Thời gian hết hạn (NULL = vĩnh viễn) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian tạo |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời gian update |

**Relationships:**
```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
FOREIGN KEY (overridden_by) REFERENCES users(id) ON DELETE SET NULL
UNIQUE (user_id, feature_key)
```

**Indexes:**
```sql
CREATE INDEX idx_user_feature_overrides_user_id ON user_feature_overrides(user_id);
CREATE INDEX idx_user_feature_overrides_feature_key ON user_feature_overrides(feature_key);
CREATE INDEX idx_user_feature_overrides_expires_at ON user_feature_overrides(expires_at);
```

**Business Logic:**
- Override có priority cao hơn plan features
- Nếu user có override cho feature X, dùng override value
- Nếu không có override, dùng plan feature value
- Cron job check expires_at để auto-expire overrides

**API sử dụng:**
- POST /api/v1/admin/users/:id/feature-overrides
- GET /api/v1/admin/users/:id/feature-overrides
- DELETE /api/v1/admin/users/:id/feature-overrides/:override_id
- GET /api/v1/me/permissions (bao gồm overrides)

**Example:**
```sql
-- User A (free plan) được admin cho phép edit card 2
INSERT INTO user_feature_overrides (user_id, feature_key, feature_value, reason, overridden_by) VALUES
('user-a-id', 'can_edit_card_2', 'true', 'Special request from customer', 'admin-id');
```

---

## 3. RELATIONSHIPS DIAGRAM

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
  │         ├─────< (*) post_videos (2 videos/post)
  │         └─────< (*) post_logs
  │
  ├─────< (*) sessions
  │
  ├─────< (*) system_logs (optional FK)
  │
  ├─────< (1) user_plans (NEW - active plan)
  │         │
  │         └─────> (*) plans
  │                   │
  │                   └─────< (*) plan_features
  │
  └─────< (*) user_feature_overrides (NEW - special permissions)

users (admin) ─────< (*) admin_logs

card_settings (NEW - global, 2 records: card 0 & card 1)
```

**Giải thích relationships mới:**
- `users` 1:1 `user_plans` (active) - Mỗi user có 1 plan đang active
- `user_plans` N:1 `plans` - Nhiều users có thể dùng cùng 1 plan
- `plans` 1:N `plan_features` - Mỗi plan có nhiều features
- `users` 1:N `user_feature_overrides` - User có thể có nhiều overrides
- `card_settings` - Global settings (2 records cố định)

---

## 4. MIGRATIONS

### 4.1. Migration Files

**Thứ tự migrations:**

```
migrations/
├── 001_create_users.sql
├── 002_create_user_settings.sql
├── 003_create_facebook_accounts.sql
├── 004_create_facebook_pages.sql
├── 005_create_facebook_ad_accounts.sql
├── 006_create_posts.sql
├── 007_create_post_videos.sql
├── 008_create_post_logs.sql
├── 009_create_system_logs.sql
├── 010_create_admin_logs.sql
├── 011_create_sessions.sql
├── 012_create_app_settings.sql
├── 013_create_plans.sql (NEW)
├── 014_create_user_plans.sql (NEW)
├── 015_create_plan_features.sql (NEW)
├── 016_create_card_settings.sql (NEW)
└── 017_create_user_feature_overrides.sql (NEW)
```

### 4.2. Sample Migration (001_create_users.sql)

```sql
-- 001_create_users.sql
CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');
CREATE TYPE user_status AS ENUM ('pending', 'active', 'inactive', 'banned');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'user',
    status user_status NOT NULL DEFAULT 'pending',
    email_verified BOOLEAN NOT NULL DEFAULT false,
    email_verified_at TIMESTAMP,
    banned_at TIMESTAMP,
    ban_reason TEXT,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Trigger auto update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4.3. Sample Migration (013_create_plans.sql) - NEW

```sql
-- 013_create_plans.sql
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'VND',
    duration_days INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_default BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_plans_name ON plans(name);
CREATE INDEX idx_plans_is_active ON plans(is_active);
CREATE INDEX idx_plans_is_default ON plans(is_default);

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed default plans
INSERT INTO plans (name, display_name, description, price, is_default, sort_order) VALUES
('free', 'Free Plan', 'Basic features for personal use', 0, true, 1),
('premium', 'Premium Plan', 'Advanced features for professionals', 99000, false, 2);
```

### 4.4. Sample Migration (015_create_plan_features.sql) - NEW

```sql
-- 015_create_plan_features.sql
CREATE TABLE plan_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    feature_key VARCHAR(100) NOT NULL,
    feature_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (plan_id, feature_key)
);

CREATE INDEX idx_plan_features_plan_id ON plan_features(plan_id);
CREATE INDEX idx_plan_features_feature_key ON plan_features(feature_key);

CREATE TRIGGER update_plan_features_updated_at BEFORE UPDATE ON plan_features
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed free plan features
INSERT INTO plan_features (plan_id, feature_key, feature_value, description) VALUES
((SELECT id FROM plans WHERE name = 'free'), 'can_edit_card_1', 'true', 'Can edit card 1'),
((SELECT id FROM plans WHERE name = 'free'), 'can_edit_card_2', 'false', 'Cannot edit card 2'),
((SELECT id FROM plans WHERE name = 'free'), 'can_upload_image', 'true', 'Can upload images'),
((SELECT id FROM plans WHERE name = 'free'), 'can_upload_video', 'true', 'Can upload videos'),
((SELECT id FROM plans WHERE name = 'free'), 'can_schedule_post', 'false', 'Cannot schedule posts'),
((SELECT id FROM plans WHERE name = 'free'), 'can_retry_failed_post', 'false', 'Cannot retry failed posts'),
((SELECT id FROM plans WHERE name = 'free'), 'daily_post_limit', '2', 'Max 2 posts per day'),
((SELECT id FROM plans WHERE name = 'free'), 'monthly_post_limit', '5', 'Max 5 posts per month'),
((SELECT id FROM plans WHERE name = 'free'), 'max_upload_size_mb', '100', 'Max 100MB per file');

-- Seed premium plan features
INSERT INTO plan_features (plan_id, feature_key, feature_value, description) VALUES
((SELECT id FROM plans WHERE name = 'premium'), 'can_edit_card_1', 'true', 'Can edit card 1'),
((SELECT id FROM plans WHERE name = 'premium'), 'can_edit_card_2', 'true', 'Can edit card 2'),
((SELECT id FROM plans WHERE name = 'premium'), 'can_upload_image', 'true', 'Can upload images'),
((SELECT id FROM plans WHERE name = 'premium'), 'can_upload_video', 'true', 'Can upload videos'),
((SELECT id FROM plans WHERE name = 'premium'), 'can_schedule_post', 'true', 'Can schedule posts'),
((SELECT id FROM plans WHERE name = 'premium'), 'can_retry_failed_post', 'true', 'Can retry failed posts'),
((SELECT id FROM plans WHERE name = 'premium'), 'daily_post_limit', '50', 'Max 50 posts per day'),
((SELECT id FROM plans WHERE name = 'premium'), 'monthly_post_limit', '100', 'Max 100 posts per month'),
((SELECT id FROM plans WHERE name = 'premium'), 'max_upload_size_mb', '500', 'Max 500MB per file');
```

### 4.5. Sample Migration (016_create_card_settings.sql) - NEW

```sql
-- 016_create_card_settings.sql
CREATE TABLE card_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_index INTEGER UNIQUE NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    is_locked_for_free BOOLEAN NOT NULL DEFAULT false,
    is_locked_for_premium BOOLEAN NOT NULL DEFAULT false,
    default_media_type VARCHAR(20),
    default_media_url TEXT,
    default_thumbnail_url TEXT,
    default_title VARCHAR(255),
    default_description TEXT,
    default_link_url TEXT,
    default_cta_type VARCHAR(50),
    allowed_media_types TEXT NOT NULL DEFAULT '["image","video"]',
    max_file_size_mb INTEGER NOT NULL DEFAULT 500,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_card_settings_card_index ON card_settings(card_index);

CREATE TRIGGER update_card_settings_updated_at BEFORE UPDATE ON card_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed card settings
-- Card 1: Unlocked for all users
INSERT INTO card_settings (card_index, is_enabled, is_locked_for_free, is_locked_for_premium) VALUES
(0, true, false, false);

-- Card 2: Locked for free users, unlocked for premium users
INSERT INTO card_settings (card_index, is_enabled, is_locked_for_free, is_locked_for_premium) VALUES
(1, true, true, false);
```

---

## 5. SEED DATA

### 5.1. Admin User Seed

```sql
-- seeds/001_admin_user.sql
INSERT INTO users (
    id,
    username,
    email,
    password_hash,
    full_name,
    role,
    status,
    email_verified,
    email_verified_at
) VALUES (
    gen_random_uuid(),
    'admin',
    'admin@thichcuu.com',
    '$2b$10$...',  -- bcrypt hash of 'Admin@123'
    'System Administrator',
    'super_admin',
    'active',
    true,
    NOW()
);
```

### 5.2. Default Settings Seed

```sql
-- seeds/002_default_settings.sql
INSERT INTO app_settings (key, value, description) VALUES
('upload.max_file_size_mb', '500', 'Max video file size in MB'),
('upload.allowed_formats', '["mp4", "mov", "avi"]', 'Allowed video formats'),
('upload.max_duration_seconds', '300', 'Max video duration (5 minutes)'),
('rate_limit.login_attempts', '5', 'Max login attempts per 15 minutes'),
('rate_limit.api_requests_per_hour', '100', 'Max API requests per hour'),
('rate_limit.uploads_per_hour', '50', 'Max uploads per hour'),
('rate_limit.posts_per_hour', '20', 'Max posts per hour'),
('facebook.graph_api_version', 'v21.0', 'Facebook Graph API version'),
('facebook.retry_attempts', '3', 'Max retry attempts for Facebook API'),
('facebook.request_timeout_ms', '30000', 'Request timeout in milliseconds');
```

---

## 6. QUERIES THƯỜNG DÙNG

### 6.1. Get user với Facebook connection

```sql
SELECT 
    u.*,
    fa.facebook_id,
    fa.facebook_name,
    fa.token_expires_at,
    (SELECT COUNT(*) FROM facebook_pages WHERE user_id = u.id) as pages_count,
    (SELECT COUNT(*) FROM facebook_ad_accounts WHERE user_id = u.id) as ad_accounts_count
FROM users u
LEFT JOIN facebook_accounts fa ON fa.user_id = u.id
WHERE u.id = $1 AND u.deleted_at IS NULL;
```

### 6.2. Get posts với videos

```sql
SELECT 
    p.*,
    json_agg(
        json_build_object(
            'card_index', pv.card_index,
            'title', pv.title,
            'description', pv.description,
            'thumbnail_url', pv.thumbnail_url,
            'facebook_video_id', pv.facebook_video_id
        ) ORDER BY pv.card_index
    ) as videos
FROM posts p
LEFT JOIN post_videos pv ON pv.post_id = p.id
WHERE p.user_id = $1 AND p.deleted_at IS NULL
GROUP BY p.id
ORDER BY p.created_at DESC
LIMIT 20 OFFSET $2;
```

### 6.3. Get scheduled posts cần publish

```sql
SELECT *
FROM posts
WHERE status = 'scheduled'
  AND scheduled_at <= NOW()
  AND deleted_at IS NULL
ORDER BY scheduled_at ASC;
```

### 6.4. Get top errors

```sql
SELECT 
    type,
    COUNT(*) as count,
    MAX(timestamp) as last_occurrence,
    COUNT(DISTINCT user_id) as affected_users
FROM system_logs
WHERE level = 'error'
  AND timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY type
ORDER BY count DESC
LIMIT 10;
```

### 6.5. Get user với plan và permissions (NEW)

```sql
SELECT 
    u.*,
    p.name as plan_name,
    p.display_name as plan_display_name,
    up.status as plan_status,
    up.expires_at as plan_expires_at,
    json_agg(
        json_build_object(
            'feature_key', pf.feature_key,
            'feature_value', pf.feature_value
        )
    ) FILTER (WHERE pf.id IS NOT NULL) as plan_features,
    json_agg(
        json_build_object(
            'feature_key', ufo.feature_key,
            'feature_value', ufo.feature_value,
            'expires_at', ufo.expires_at
        )
    ) FILTER (WHERE ufo.id IS NOT NULL) as feature_overrides
FROM users u
LEFT JOIN user_plans up ON up.user_id = u.id AND up.status = 'active'
LEFT JOIN plans p ON p.id = up.plan_id
LEFT JOIN plan_features pf ON pf.plan_id = p.id
LEFT JOIN user_feature_overrides ufo ON ufo.user_id = u.id 
    AND (ufo.expires_at IS NULL OR ufo.expires_at > NOW())
WHERE u.id = $1 AND u.deleted_at IS NULL
GROUP BY u.id, p.id, up.id;
```

### 6.6. Check user permission (NEW)

```sql
-- Check if user has specific permission
-- Priority: override > plan feature > default false
SELECT COALESCE(
    -- Check override first
    (SELECT feature_value::boolean 
     FROM user_feature_overrides 
     WHERE user_id = $1 
       AND feature_key = $2
       AND (expires_at IS NULL OR expires_at > NOW())
     LIMIT 1),
    -- Then check plan feature
    (SELECT feature_value::boolean
     FROM user_plans up
     JOIN plan_features pf ON pf.plan_id = up.plan_id
     WHERE up.user_id = $1
       AND up.status = 'active'
       AND pf.feature_key = $2
     LIMIT 1),
    -- Default false
    false
) as has_permission;
```

### 6.7. Get card settings cho user (NEW)

```sql
SELECT 
    cs.*,
    CASE 
        WHEN up.plan_id = (SELECT id FROM plans WHERE name = 'free') 
            THEN cs.is_locked_for_free
        WHEN up.plan_id = (SELECT id FROM plans WHERE name = 'premium') 
            THEN cs.is_locked_for_premium
        ELSE false
    END as is_locked_for_user
FROM card_settings cs
CROSS JOIN user_plans up
WHERE up.user_id = $1 
  AND up.status = 'active'
ORDER BY cs.card_index;
```

### 6.8. Count posts this month (for limit check) (NEW)

```sql
SELECT COUNT(*) as posts_this_month
FROM posts
WHERE user_id = $1
  AND created_at >= DATE_TRUNC('month', NOW())
  AND deleted_at IS NULL;
```

### 6.9. Get expired plans cần auto-expire (NEW)

```sql
SELECT *
FROM user_plans
WHERE status = 'active'
  AND expires_at IS NOT NULL
  AND expires_at <= NOW();
```

### 6.10. Get expired overrides cần cleanup (NEW)

```sql
SELECT *
FROM user_feature_overrides
WHERE expires_at IS NOT NULL
  AND expires_at <= NOW();
```

---

## 7. PERFORMANCE OPTIMIZATION

### 7.1. Indexes

**Đã có indexes cho:**
- Foreign keys (tất cả)
- Columns thường query (email, username, status, created_at, etc.)
- Columns dùng trong WHERE, ORDER BY, JOIN

### 7.2. Partitioning (Optional - cho scale lớn)

**Partition `system_logs` theo tháng:**
```sql
CREATE TABLE system_logs_2026_05 PARTITION OF system_logs
FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
```

### 7.3. Archiving

**Archive old logs:**
- `system_logs` > 90 days → archive table
- `post_logs` > 180 days → archive table
- `admin_logs` → keep forever

---

## 8. BACKUP STRATEGY

### 8.1. Full Backup

```bash
# Daily full backup
pg_dump -h localhost -U postgres -d thichcuu_db -F c -f backup_$(date +%Y%m%d).dump
```

### 8.2. Incremental Backup

```bash
# Hourly WAL archiving
archive_command = 'cp %p /backup/wal/%f'
```

### 8.3. Restore

```bash
# Restore from backup
pg_restore -h localhost -U postgres -d thichcuu_db -c backup_20260525.dump
```

---

## 9. SECURITY

### 9.1. Encryption

**Sensitive columns:**
- `facebook_accounts.access_token_encrypted` → AES-256-GCM
- `users.password_hash` → bcrypt (salt rounds = 10)

### 9.2. Access Control

**Database users:**
- `app_user` → Read/Write (application)
- `readonly_user` → Read only (analytics)
- `admin_user` → Full access (DBA)

### 9.3. Row-Level Security (Optional)

```sql
-- Enable RLS on posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own posts
CREATE POLICY posts_user_policy ON posts
FOR SELECT
USING (user_id = current_setting('app.current_user_id')::uuid);
```

---

## 10. MONITORING

### 10.1. Metrics to Track

- **Query Performance:** Slow queries (>100ms)
- **Connection Pool:** Active connections
- **Table Size:** Growth rate
- **Index Usage:** Unused indexes
- **Lock Contention:** Blocking queries

### 10.2. Tools

- **pg_stat_statements:** Query statistics
- **pgBadger:** Log analyzer
- **Prometheus + Grafana:** Metrics visualization

---

## THAM CHIẾU

- [API Plan](./08-api-plan.md) - APIs sử dụng tables nào
- [Architecture Plan](./03-architecture-plan.md) - Database trong kiến trúc
- [Security Plan](./05-security-plan.md) - Bảo mật database
- [Implementation Phases](./06-implementation-phases.md) - Phase 3: Database

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-25  
**Status:** ✅ Completed

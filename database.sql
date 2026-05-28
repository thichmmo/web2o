-- =============================================
-- Thích Cừu - Facebook Video Tool
-- Database Setup Script (MySQL)
-- =============================================

-- Create database
CREATE DATABASE IF NOT EXISTS thichcuu_fb_tool CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use database
USE thichcuu_fb_tool;

-- =============================================
-- TABLES
-- =============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (role IN ('user', 'admin'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_days INTEGER NOT NULL,
    max_posts INTEGER NOT NULL,
    max_fb_accounts INTEGER NOT NULL,
    features JSON,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    plan_id CHAR(36) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Facebook Accounts table
CREATE TABLE IF NOT EXISTS facebook_accounts (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    fb_user_id VARCHAR(255) NOT NULL,
    fb_user_name VARCHAR(255) NOT NULL,
    access_token TEXT NOT NULL,
    token_expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_fb (user_id, fb_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    fb_account_id CHAR(36) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(255) NOT NULL,
    caption TEXT,
    video1_path TEXT NOT NULL,
    video2_path TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    scheduled_at TIMESTAMP NULL,
    published_at TIMESTAMP NULL,
    fb_post_id VARCHAR(255),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (fb_account_id) REFERENCES facebook_accounts(id) ON DELETE CASCADE,
    CHECK (target_type IN ('profile', 'page', 'group')),
    CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity Logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id CHAR(36),
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `key` VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    type VARCHAR(50) DEFAULT 'string',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (type IN ('string', 'number', 'boolean', 'json'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- INDEXES
-- =============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Subscriptions indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_is_active ON subscriptions(is_active);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);

-- Facebook Accounts indexes
CREATE INDEX idx_facebook_accounts_user_id ON facebook_accounts(user_id);
CREATE INDEX idx_facebook_accounts_fb_user_id ON facebook_accounts(fb_user_id);
CREATE INDEX idx_facebook_accounts_is_active ON facebook_accounts(is_active);

-- Posts indexes
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_fb_account_id ON posts(fb_account_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_scheduled_at ON posts(scheduled_at);
CREATE INDEX idx_posts_created_at ON posts(created_at);

-- Activity Logs indexes
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_resource ON activity_logs(resource);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- Settings indexes
CREATE INDEX idx_settings_key ON settings(`key`);

-- =============================================
-- SEED DATA
-- =============================================

-- Insert default admin user
-- Password: Admin@123456 (hashed with bcrypt)
INSERT INTO users (id, email, password, full_name, role, is_active)
VALUES (
    UUID(),
    'admin@thichcuu.com',
    '$2a$10$YourHashedPasswordHere',
    'Admin Thích Cừu',
    'admin',
    true
) ON DUPLICATE KEY UPDATE email=email;

-- Insert default plans
INSERT INTO plans (id, name, description, price, duration_days, max_posts, max_fb_accounts, features, is_active)
VALUES
    (
        UUID(),
        'Free',
        'Gói miễn phí cho người dùng mới',
        0.00,
        30,
        10,
        1,
        '["Đăng 10 bài/tháng", "1 tài khoản Facebook", "Hỗ trợ cơ bản"]',
        true
    ),
    (
        UUID(),
        'Basic',
        'Gói cơ bản cho cá nhân',
        99000.00,
        30,
        50,
        3,
        '["Đăng 50 bài/tháng", "3 tài khoản Facebook", "Hỗ trợ ưu tiên", "Lên lịch đăng bài"]',
        true
    ),
    (
        UUID(),
        'Pro',
        'Gói chuyên nghiệp cho doanh nghiệp',
        299000.00,
        30,
        200,
        10,
        '["Đăng 200 bài/tháng", "10 tài khoản Facebook", "Hỗ trợ 24/7", "Lên lịch đăng bài", "Phân tích thống kê"]',
        true
    ),
    (
        UUID(),
        'Enterprise',
        'Gói doanh nghiệp không giới hạn',
        999000.00,
        30,
        999999,
        999999,
        '["Không giới hạn bài viết", "Không giới hạn tài khoản", "Hỗ trợ 24/7", "Lên lịch đăng bài", "Phân tích thống kê", "API riêng", "Quản lý team"]',
        true
    )
ON DUPLICATE KEY UPDATE name=name;

-- Insert default settings
INSERT INTO settings (`key`, value, type, description)
VALUES
    -- General Settings
    ('site_name', 'Thích Cừu - Facebook Video Tool', 'string', 'Tên website'),
    ('site_description', 'Công cụ đăng video Facebook tự động', 'string', 'Mô tả website'),
    ('contact_email', 'contact@thichcuu.com', 'string', 'Email liên hệ'),

    -- Maintenance Mode
    ('maintenance_mode', 'false', 'boolean', 'Chế độ bảo trì'),
    ('maintenance_message', 'Website đang bảo trì. Vui lòng quay lại sau.', 'string', 'Thông báo bảo trì'),

    -- User Settings
    ('allow_registration', 'true', 'boolean', 'Cho phép đăng ký tài khoản mới'),

    -- Upload Settings
    ('max_video_size_mb', '100', 'number', 'Kích thước video tối đa (MB)'),
    ('max_caption_length', '5000', 'number', 'Độ dài caption tối đa'),

    -- Facebook Settings
    ('facebook_app_id', '', 'string', 'Facebook App ID'),

    -- Analytics Settings
    ('enable_analytics', 'false', 'boolean', 'Bật Google Analytics'),

    -- Email Settings
    ('email_enabled', 'false', 'boolean', 'Bật gửi email'),
    ('smtp_host', '', 'string', 'SMTP Server Host'),
    ('smtp_port', '587', 'number', 'SMTP Server Port'),
    ('smtp_secure', 'false', 'boolean', 'Sử dụng SSL/TLS'),
    ('smtp_user', '', 'string', 'SMTP Username'),
    ('smtp_password', '', 'string', 'SMTP Password'),
    ('email_from_name', 'Thích Cừu', 'string', 'Tên người gửi'),
    ('email_from_address', 'noreply@thichcuu.com', 'string', 'Email người gửi'),

    -- Branding Settings
    ('site_logo', '', 'string', 'Logo website'),
    ('site_favicon', '', 'string', 'Favicon website'),
    ('primary_color', '#2563eb', 'string', 'Màu chủ đạo'),
    ('secondary_color', '#1e40af', 'string', 'Màu phụ'),
    ('custom_css', '', 'string', 'Custom CSS code'),
    ('custom_js', '', 'string', 'Custom JavaScript code')
ON DUPLICATE KEY UPDATE `key`=`key`;

-- =============================================
-- VIEWS
-- =============================================

-- View for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT
    u.id,
    u.email,
    u.full_name,
    COUNT(DISTINCT fa.id) as fb_accounts_count,
    COUNT(DISTINCT p.id) as total_posts,
    COUNT(DISTINCT CASE WHEN p.status = 'published' THEN p.id END) as published_posts,
    COUNT(DISTINCT CASE WHEN p.status = 'draft' THEN p.id END) as draft_posts,
    COUNT(DISTINCT CASE WHEN p.status = 'failed' THEN p.id END) as failed_posts
FROM users u
LEFT JOIN facebook_accounts fa ON u.id = fa.user_id AND fa.is_active = true
LEFT JOIN posts p ON u.id = p.user_id
GROUP BY u.id, u.email, u.full_name;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

SELECT '✅ Database setup completed successfully!' as message;
SELECT '📊 Tables created: users, plans, subscriptions, facebook_accounts, posts, activity_logs, settings' as info;
SELECT '🔑 Default admin: admin@thichcuu.com' as admin;
SELECT '📦 Default plans: Free, Basic, Pro, Enterprise' as plans;
SELECT '⚠️  Remember to update admin password hash!' as warning;


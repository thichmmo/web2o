-- Add settings table to database.sql

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    type VARCHAR(50) DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for settings
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- Trigger for settings
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO settings (key, value, type, description)
VALUES
    ('site_name', 'Thích Cừu - Facebook Tool', 'string', 'Tên website hiển thị'),
    ('site_description', 'Công cụ đăng video carousel lên Facebook', 'string', 'Mô tả website'),
    ('maintenance_mode', 'false', 'boolean', 'Chế độ bảo trì website'),
    ('maintenance_message', 'Website đang bảo trì, vui lòng quay lại sau.', 'string', 'Thông báo khi bảo trì'),
    ('allow_registration', 'true', 'boolean', 'Cho phép đăng ký tài khoản mới'),
    ('max_video_size_mb', '100', 'number', 'Kích thước video tối đa (MB)'),
    ('max_caption_length', '5000', 'number', 'Độ dài caption tối đa'),
    ('contact_email', 'support@thichcuu.com', 'string', 'Email liên hệ hỗ trợ'),
    ('facebook_app_id', '', 'string', 'Facebook App ID'),
    ('enable_analytics', 'false', 'boolean', 'Bật Google Analytics')
ON CONFLICT (key) DO NOTHING;

-- Add Email and Branding settings

-- Email Settings
INSERT INTO settings (key, value, type, description)
VALUES
    ('smtp_host', '', 'string', 'SMTP Server Host (vd: smtp.gmail.com)'),
    ('smtp_port', '587', 'number', 'SMTP Server Port'),
    ('smtp_secure', 'true', 'boolean', 'Sử dụng SSL/TLS'),
    ('smtp_user', '', 'string', 'SMTP Username/Email'),
    ('smtp_password', '', 'string', 'SMTP Password'),
    ('email_from_name', 'Thích Cừu', 'string', 'Tên người gửi email'),
    ('email_from_address', 'noreply@thichcuu.com', 'string', 'Email người gửi'),
    ('email_enabled', 'false', 'boolean', 'Bật gửi email')
ON CONFLICT (key) DO NOTHING;

-- Branding Settings
INSERT INTO settings (key, value, type, description)
VALUES
    ('site_logo', '', 'string', 'Logo website (URL hoặc path)'),
    ('site_favicon', '', 'string', 'Favicon website (URL hoặc path)'),
    ('primary_color', '#2563eb', 'string', 'Màu chủ đạo (hex code)'),
    ('secondary_color', '#1e40af', 'string', 'Màu phụ (hex code)'),
    ('custom_css', '', 'string', 'Custom CSS code'),
    ('custom_js', '', 'string', 'Custom JavaScript code')
ON CONFLICT (key) DO NOTHING;

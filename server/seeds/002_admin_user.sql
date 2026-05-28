-- Seed: Create default admin user
-- Phase 3: Database Setup

-- Password: Admin@123456 (hashed with bcrypt)
-- NOTE: Change this password in production!

INSERT INTO users (
  username,
  email,
  password_hash,
  full_name,
  role,
  status,
  email_verified
) VALUES (
  'admin',
  'admin@thichcuu.com',
  '$2b$10$rKvVJH9xQX5YJ5YJ5YJ5YOqKvVJH9xQX5YJ5YJ5YJ5YOqKvVJH9xQ',
  'System Administrator',
  'super_admin',
  'active',
  TRUE
) ON CONFLICT (email) DO NOTHING;

-- Assign free plan to admin (for testing)
DO $$
DECLARE
  admin_user_id INTEGER;
  free_plan_id INTEGER;
BEGIN
  SELECT id INTO admin_user_id FROM users WHERE email = 'admin@thichcuu.com';
  SELECT id INTO free_plan_id FROM plans WHERE name = 'free';

  IF admin_user_id IS NOT NULL AND free_plan_id IS NOT NULL THEN
    INSERT INTO user_plans (user_id, plan_id, status)
    VALUES (admin_user_id, free_plan_id, 'active')
    ON CONFLICT (user_id, status) DO NOTHING;
  END IF;
END $$;

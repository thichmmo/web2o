-- Seed: Insert default plans and features
-- Phase 18: Plan System

-- Insert default plans
INSERT INTO plans (name, display_name, description, price_monthly, is_active) VALUES
('free', 'Free Plan', 'Basic plan with limited features', 0, TRUE),
('premium', 'Premium Plan', 'Full access to all features', 99000, TRUE)
ON CONFLICT (name) DO NOTHING;

-- Get plan IDs
DO $$
DECLARE
  free_plan_id INTEGER;
  premium_plan_id INTEGER;
BEGIN
  SELECT id INTO free_plan_id FROM plans WHERE name = 'free';
  SELECT id INTO premium_plan_id FROM plans WHERE name = 'premium';

  -- Free plan features
  INSERT INTO plan_features (plan_id, feature_key, feature_value, description) VALUES
  (free_plan_id, 'can_edit_card_1', 'true', 'Can edit card 1'),
  (free_plan_id, 'can_edit_card_2', 'false', 'Cannot edit card 2 (locked)'),
  (free_plan_id, 'can_upload_image', 'true', 'Can upload images'),
  (free_plan_id, 'can_upload_video', 'true', 'Can upload videos'),
  (free_plan_id, 'can_schedule_post', 'false', 'Cannot schedule posts'),
  (free_plan_id, 'can_retry_failed_post', 'false', 'Cannot retry failed posts'),
  (free_plan_id, 'monthly_post_limit', '5', 'Max 5 posts per month'),
  (free_plan_id, 'max_upload_size_mb', '100', 'Max 100MB upload size')
  ON CONFLICT (plan_id, feature_key) DO NOTHING;

  -- Premium plan features
  INSERT INTO plan_features (plan_id, feature_key, feature_value, description) VALUES
  (premium_plan_id, 'can_edit_card_1', 'true', 'Can edit card 1'),
  (premium_plan_id, 'can_edit_card_2', 'true', 'Can edit card 2'),
  (premium_plan_id, 'can_upload_image', 'true', 'Can upload images'),
  (premium_plan_id, 'can_upload_video', 'true', 'Can upload videos'),
  (premium_plan_id, 'can_schedule_post', 'true', 'Can schedule posts'),
  (premium_plan_id, 'can_retry_failed_post', 'true', 'Can retry failed posts'),
  (premium_plan_id, 'monthly_post_limit', '100', 'Max 100 posts per month'),
  (premium_plan_id, 'max_upload_size_mb', '500', 'Max 500MB upload size')
  ON CONFLICT (plan_id, feature_key) DO NOTHING;
END $$;

-- Insert default card settings
INSERT INTO card_settings (card_index, is_enabled, is_locked_for_free, is_locked_for_premium, default_title, default_description, default_link_url) VALUES
(1, TRUE, FALSE, FALSE, 'Card 1 Title', 'Card 1 Description', 'https://facebook.com'),
(2, TRUE, TRUE, FALSE, 'Card 2 - Managed by Admin', 'Upgrade to Premium to customize this card', 'https://facebook.com')
ON CONFLICT (card_index) DO NOTHING;

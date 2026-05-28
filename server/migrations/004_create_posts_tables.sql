-- Migration: Create posts and related tables
-- Phase 3: Database Setup

CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  facebook_page_id INTEGER NOT NULL REFERENCES facebook_pages(id) ON DELETE RESTRICT,
  facebook_ad_account_id INTEGER NOT NULL REFERENCES facebook_ad_accounts(id) ON DELETE RESTRICT,
  message TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'posted', 'scheduled', 'failed', 'deleted')),
  facebook_post_id VARCHAR(255),
  facebook_creative_id VARCHAR(255),
  scheduled_publish_time TIMESTAMP,
  posted_at TIMESTAMP,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS post_videos (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  card_index INTEGER NOT NULL CHECK (card_index IN (1, 2)),
  video_path TEXT,
  video_url TEXT,
  facebook_video_id VARCHAR(255),
  thumbnail_url TEXT,
  title VARCHAR(255),
  description TEXT,
  link_url TEXT,
  cta_type VARCHAR(50),
  cta_link TEXT,
  file_size_bytes BIGINT,
  duration_seconds INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, card_index)
);

CREATE TABLE IF NOT EXISTS post_logs (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  level VARCHAR(20) DEFAULT 'info' CHECK (level IN ('debug', 'info', 'warn', 'error')),
  step VARCHAR(100),
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_scheduled_time ON posts(scheduled_publish_time);
CREATE INDEX idx_post_videos_post_id ON post_videos(post_id);
CREATE INDEX idx_post_logs_post_id ON post_logs(post_id);

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_post_videos_updated_at BEFORE UPDATE ON post_videos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

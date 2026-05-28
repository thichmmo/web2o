-- Migration: Create Facebook-related tables
-- Phase 3: Database Setup

CREATE TABLE IF NOT EXISTS facebook_accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  facebook_user_id VARCHAR(100) UNIQUE NOT NULL,
  facebook_name VARCHAR(255),
  access_token_encrypted TEXT NOT NULL,
  token_expires_at TIMESTAMP,
  connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_refreshed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS facebook_pages (
  id SERIAL PRIMARY KEY,
  facebook_account_id INTEGER NOT NULL REFERENCES facebook_accounts(id) ON DELETE CASCADE,
  page_id VARCHAR(100) UNIQUE NOT NULL,
  page_name VARCHAR(255),
  page_access_token_encrypted TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  picture_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS facebook_ad_accounts (
  id SERIAL PRIMARY KEY,
  facebook_account_id INTEGER NOT NULL REFERENCES facebook_accounts(id) ON DELETE CASCADE,
  account_id VARCHAR(100) UNIQUE NOT NULL,
  account_name VARCHAR(255),
  account_status VARCHAR(50),
  currency VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_facebook_accounts_user_id ON facebook_accounts(user_id);
CREATE INDEX idx_facebook_pages_account_id ON facebook_pages(facebook_account_id);
CREATE INDEX idx_facebook_ad_accounts_account_id ON facebook_ad_accounts(facebook_account_id);

CREATE TRIGGER update_facebook_accounts_updated_at BEFORE UPDATE ON facebook_accounts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facebook_pages_updated_at BEFORE UPDATE ON facebook_pages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facebook_ad_accounts_updated_at BEFORE UPDATE ON facebook_ad_accounts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

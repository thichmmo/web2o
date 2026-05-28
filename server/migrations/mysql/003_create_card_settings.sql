-- Create card_settings table for MySQL
CREATE TABLE IF NOT EXISTS card_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_index INT NOT NULL CHECK (card_index IN (1, 2)),
  is_enabled BOOLEAN DEFAULT TRUE,
  is_locked_for_free BOOLEAN DEFAULT FALSE,
  is_locked_for_premium BOOLEAN DEFAULT FALSE,
  allowed_media_types JSON DEFAULT NULL,
  max_file_size_mb INT DEFAULT 500,
  default_media_url TEXT,
  default_title VARCHAR(255),
  default_description TEXT,
  default_link_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_card_index (card_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default settings for Card 1 and Card 2
INSERT INTO card_settings (card_index, allowed_media_types) VALUES
(1, '["image", "video"]'),
(2, '["image", "video"]')
ON DUPLICATE KEY UPDATE card_index = card_index;

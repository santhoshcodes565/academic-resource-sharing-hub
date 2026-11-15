-- Academic Resource Sharing Hub (ARH)
-- Migration 001: Core Enhancements Schema & Tables
-- Supports Faculty Email Verification, Verification Audit History, In-App Notifications, and Trending Indices

USE `arh_db`;

-- 1. Authorized Faculty Emails Allowlist
CREATE TABLE IF NOT EXISTS `authorized_faculty_emails` (
  `id` VARCHAR(36) PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `department` VARCHAR(100) NOT NULL,
  `designation` VARCHAR(100) DEFAULT 'Faculty Member',
  `is_registered` BOOLEAN NOT NULL DEFAULT FALSE,
  `added_by` VARCHAR(36) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_auth_faculty_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Faculty Verification Tokens (Cryptographic single-use token hashes)
CREATE TABLE IF NOT EXISTS `faculty_verifications` (
  `id` VARCHAR(36) PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL,
  `token_hash` VARCHAR(255) NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `used` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_faculty_verif_token` (`token_hash`),
  INDEX `idx_faculty_verif_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. In-App Notifications Table
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(50) NOT NULL DEFAULT 'INFO',
  `link` VARCHAR(255) NULL,
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_notifications_user_read` (`user_id`, `is_read`),
  INDEX `idx_notifications_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Extend Resource Reviews with Action and State Transition Tracking
-- Note: Check if columns exist before adding in MySQL 8.0+
SET @dbname = DATABASE();
SET @tablename = 'resource_reviews';

-- Add action column if not exists
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = 'action'
  ) > 0,
  'SELECT 1',
  'ALTER TABLE `resource_reviews` ADD COLUMN `action` VARCHAR(50) NULL DEFAULT "REVIEW"'
));
PREPARE alterStmt FROM @preparedStatement;
EXECUTE alterStmt;
DEALLOCATE PREPARE alterStmt;

-- Add previous_status column if not exists
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = 'previous_status'
  ) > 0,
  'SELECT 1',
  'ALTER TABLE `resource_reviews` ADD COLUMN `previous_status` VARCHAR(50) NULL DEFAULT NULL'
));
PREPARE alterStmt FROM @preparedStatement;
EXECUTE alterStmt;
DEALLOCATE PREPARE alterStmt;

-- Add new_status column if not exists
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = 'new_status'
  ) > 0,
  'SELECT 1',
  'ALTER TABLE `resource_reviews` ADD COLUMN `new_status` VARCHAR(50) NULL DEFAULT "UNDER REVIEW"'
));
PREPARE alterStmt FROM @preparedStatement;
EXECUTE alterStmt;
DEALLOCATE PREPARE alterStmt;

-- 5. Seed Pre-authorized Faculty Registry
INSERT IGNORE INTO `authorized_faculty_emails` (`id`, `email`, `department`, `designation`, `is_registered`) VALUES
('afe-001', 'dr.morales@university.edu', 'Computer Science', 'Associate Professor', TRUE),
('afe-002', 'prof.patel@university.edu', 'Electrical Engineering', 'Professor & Chair', FALSE),
('afe-003', 'dr.connor@university.edu', 'Mechanical Engineering', 'Assistant Professor', FALSE),
('afe-004', 'prof.turing@university.edu', 'Computer Science', 'Distinguished Professor', FALSE),
('afe-005', 'dr.hopper@university.edu', 'Computer Science', 'Professor', FALSE),
('afe-006', 'dr.feynman@university.edu', 'Physics', 'Professor', FALSE),
('afe-007', 'prof.gauss@university.edu', 'Mathematics', 'Professor & Chair', FALSE);

-- 6. Performance Indices for Trending Calculations
-- Conditional index creation for resource_downloads and resources
ALTER TABLE `resource_downloads` ADD INDEX `idx_res_downloads_time` (`downloaded_at`, `resource_id`);
ALTER TABLE `resources` ADD INDEX `idx_resources_status_dl` (`status`, `download_count`);

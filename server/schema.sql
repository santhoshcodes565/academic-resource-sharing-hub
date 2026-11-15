-- Academic Resource Sharing Hub (ARH)
-- Database Schema for MySQL 8.0+

CREATE DATABASE IF NOT EXISTS `arh_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `arh_db`;

-- 1. Users Table (Core Identity & RBAC)
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `role` ENUM('student', 'faculty', 'admin') NOT NULL DEFAULT 'student',
  `department` VARCHAR(100) NOT NULL,
  `academic_year` VARCHAR(50) DEFAULT NULL,
  `semester` VARCHAR(20) DEFAULT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Password Reset Requests
CREATE TABLE IF NOT EXISTS `password_resets` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `token_hash` VARCHAR(255) NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `used` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_resets_token` (`token_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Audit Log for Security & Compliance
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NULL,
  `action` VARCHAR(100) NOT NULL,
  `status` ENUM('SUCCESS', 'FAILURE') NOT NULL,
  `ip_address` VARCHAR(50) NULL,
  `details` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_audit_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3b. Academic Years Table
CREATE TABLE IF NOT EXISTS `academic_years` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `start_date` DATE NULL,
  `end_date` DATE NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_academic_years_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Departments Table
CREATE TABLE IF NOT EXISTS `departments` (
  `id` VARCHAR(36) PRIMARY KEY,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `icon` VARCHAR(50) DEFAULT 'BookOpen',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Subjects Table
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` VARCHAR(36) PRIMARY KEY,
  `department_id` VARCHAR(36) NOT NULL,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(200) NOT NULL,
  `year` INT NOT NULL DEFAULT 1,
  `semester` VARCHAR(20) NOT NULL DEFAULT 'Semester 1',
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE,
  INDEX `idx_subjects_dept` (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Resource Types Table
CREATE TABLE IF NOT EXISTS `resource_types` (
  `id` VARCHAR(36) PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `icon` VARCHAR(50) DEFAULT 'FileText'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Resources Table
CREATE TABLE IF NOT EXISTS `resources` (
  `id` VARCHAR(36) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `department_id` VARCHAR(36) NOT NULL,
  `subject_id` VARCHAR(36) NOT NULL,
  `resource_type_id` VARCHAR(36) NOT NULL,
  `academic_year` VARCHAR(50) NOT NULL,
  `year` INT NOT NULL DEFAULT 1,
  `semester` VARCHAR(20) NOT NULL,
  `file_url` VARCHAR(500) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_size` VARCHAR(50) NOT NULL,
  `file_mime` VARCHAR(100) DEFAULT 'application/pdf',
  `uploader_id` VARCHAR(36) NOT NULL,
  `status` ENUM('PENDING', 'UNDER REVIEW', 'VERIFIED', 'REJECTED', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'PENDING',
  `staff_remarks` TEXT NULL,
  `verified_by` VARCHAR(36) NULL,
  `verified_at` TIMESTAMP NULL,
  `download_count` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`resource_type_id`) REFERENCES `resource_types`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`uploader_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_resources_status` (`status`),
  INDEX `idx_resources_dept` (`department_id`),
  INDEX `idx_resources_subj` (`subject_id`),
  INDEX `idx_resources_type` (`resource_type_id`),
  INDEX `idx_resources_uploader` (`uploader_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Bookmarks Table
CREATE TABLE IF NOT EXISTS `bookmarks` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `resource_id` VARCHAR(36) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `idx_user_resource_bookmark` (`user_id`, `resource_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Resource Downloads Table
CREATE TABLE IF NOT EXISTS `resource_downloads` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `resource_id` VARCHAR(36) NOT NULL,
  `downloaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON DELETE CASCADE,
  INDEX `idx_downloads_user` (`user_id`),
  INDEX `idx_downloads_res` (`resource_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Resource Requests Table
CREATE TABLE IF NOT EXISTS `resource_requests` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `department_id` VARCHAR(36) NOT NULL,
  `subject_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `status` ENUM('PENDING', 'IN PROGRESS', 'COMPLETED', 'CLOSED') NOT NULL DEFAULT 'PENDING',
  `staff_remarks` TEXT NULL,
  `resolved_by` VARCHAR(36) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE RESTRICT,
  INDEX `idx_requests_user` (`user_id`),
  INDEX `idx_requests_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Resource Reviews & Verification Table
CREATE TABLE IF NOT EXISTS `resource_reviews` (
  `id` VARCHAR(36) PRIMARY KEY,
  `resource_id` VARCHAR(36) NOT NULL,
  `staff_id` VARCHAR(36) NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `review_status` VARCHAR(50) DEFAULT 'UNDER REVIEW',
  `remarks` TEXT NULL,
  `rating` INT NULL,
  `review_text` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_reviews_resource` (`resource_id`),
  INDEX `idx_reviews_staff` (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

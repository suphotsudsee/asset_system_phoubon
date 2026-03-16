-- Asset Management System - MySQL Schema
-- Compatible with MySQL 5.7/8.0
-- Created: 2026-03-16

-- Create database
CREATE DATABASE IF NOT EXISTS asset_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE asset_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    department VARCHAR(100),
    position VARCHAR(100),
    phone VARCHAR(20),
    role ENUM('admin', 'agency_admin', 'asset_manager', 'staff', 'viewer') NOT NULL DEFAULT 'staff',
    agency_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    permissions TEXT,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Asset categories table
CREATE TABLE IF NOT EXISTS asset_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    serial_number VARCHAR(100),
    category_id INT,
    department VARCHAR(100),
    location VARCHAR(200),
    asset_condition ENUM('excellent', 'good', 'fair', 'poor') DEFAULT 'good',
    status ENUM('active', 'inactive', 'maintenance', 'disposed') DEFAULT 'active',
    purchase_date DATE,
    purchase_price DECIMAL(15,2) DEFAULT 0,
    useful_life_years INT DEFAULT 5,
    depreciation_method ENUM('straight_line', 'declining_balance') DEFAULT 'straight_line',
    description TEXT,
    agency_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES asset_categories(id) ON DELETE SET NULL,
    INDEX idx_asset_code (asset_code),
    INDEX idx_status (status),
    INDEX idx_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Asset transactions table
CREATE TABLE IF NOT EXISTS asset_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    transaction_type ENUM('acquire', 'transfer', 'dispose', 'adjust') NOT NULL,
    transaction_date DATE NOT NULL,
    reference_number VARCHAR(50),
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_asset_id (asset_id),
    INDEX idx_transaction_type (transaction_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Depreciation records table
CREATE TABLE IF NOT EXISTS depreciation_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    fiscal_year INT NOT NULL,
    beginning_book_value DECIMAL(15,2) NOT NULL,
    depreciation_expense DECIMAL(15,2) NOT NULL,
    accumulated_depreciation DECIMAL(15,2) NOT NULL,
    ending_book_value DECIMAL(15,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    UNIQUE KEY unique_asset_year (asset_id, fiscal_year),
    INDEX idx_fiscal_year (fiscal_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Maintenance records table
CREATE TABLE IF NOT EXISTS maintenance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    maintenance_type ENUM('preventive', 'corrective', 'emergency') NOT NULL,
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    scheduled_date DATE,
    completed_date DATE,
    technician VARCHAR(100),
    cost DECIMAL(15,2) DEFAULT 0,
    total_cost DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    INDEX idx_asset_id (asset_id),
    INDEX idx_status (status),
    INDEX idx_scheduled_date (scheduled_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT,
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: admin123, hashed with bcrypt)
-- Note: In production, use proper password hashing
INSERT INTO users (username, email, hashed_password, full_name, role, is_active) VALUES
('admin', 'admin@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G.2f4f4f4f4f4f', 'System Administrator', 'admin', TRUE);

-- Insert sample categories
INSERT INTO asset_categories (name, code, description) VALUES
('คอมพิวเตอร์', 'CAT-001', 'คอมพิวเตอร์และอุปกรณ์ที่เกี่ยวข้อง'),
('เครื่องพิมพ์', 'CAT-002', 'เครื่องพิมพ์และอุปกรณ์พิมพ์'),
('เฟอร์นิเจอร์', 'CAT-003', 'โต๊ะ เก้าอี้ และเฟอร์นิเจอร์สำนักงาน'),
('เครื่องใช้ไฟฟ้า', 'CAT-004', 'เครื่องใช้ไฟฟ้าต่างๆ'),
('ยานพาหนะ', 'CAT-005', 'รถยนต์ รถจักรยานยนต์'),
('อุปกรณ์สำนักงาน', 'CAT-006', 'อุปกรณ์สำนักงานทั่วไป');

-- Insert sample assets
INSERT INTO assets (asset_code, name, serial_number, category_id, department, location, condition, status, purchase_date, purchase_price, useful_life_years, depreciation_method, description) VALUES
('AST-2024-001', 'คอมพิวเตอร์ Dell OptiPlex', 'DPX123456', 1, 'IT', 'ห้อง 101', 'good', 'active', '2024-01-15', 25000.00, 5, 'straight_line', 'คอมพิวเตอร์สำนักงานสำหรับพนักงาน IT'),
('AST-2024-002', 'เครื่องพิมพ์ Canon', 'CN789012', 2, 'Admin', 'ห้อง 102', 'excellent', 'active', '2024-02-01', 15000.00, 3, 'straight_line', 'เครื่องพิมพ์เลเซอร์สำหรับเอกสาร'),
('AST-2024-003', 'โต๊ะทำงาน', 'DSK345678', 3, 'HR', 'ห้อง 201', 'good', 'active', '2024-01-20', 8000.00, 10, 'straight_line', 'โต๊ะทำงานไม้ขนาด 120x60 ซม.'),
('AST-2024-004', 'เก้าอี้สำนักงาน', 'CHR901234', 3, 'Finance', 'ห้อง 301', 'fair', 'inactive', '2024-03-01', 5000.00, 7, 'straight_line', 'เก้าอี้สำนักงานปรับระดับได้'),
('AST-2024-005', 'เครื่องปรับอากาศ', 'AC567890', 4, 'IT', 'ห้อง 101', 'excellent', 'active', '2024-02-15', 12000.00, 8, 'straight_line', 'เครื่องปรับอากาศ 12000 BTU');

-- Insert sample maintenance records
INSERT INTO maintenance_records (asset_id, title, maintenance_type, status, priority, scheduled_date, technician, cost, description) VALUES
(1, 'Regular maintenance check', 'preventive', 'pending', 'medium', '2024-03-20', 'John Doe', 500.00, 'ตรวจสอบระบบเป็นประจำ'),
(2, 'Paper jam fix', 'corrective', 'completed', 'low', '2024-03-15', 'Jane Smith', 300.00, 'แก้ไขปัญหากระดาษติด'),
(5, 'Filter cleaning', 'preventive', 'in_progress', 'medium', '2024-03-18', 'Bob Wilson', 200.00, 'ทำความสะอาดฟิลเตอร์');

-- Insert sample depreciation records
INSERT INTO depreciation_records (asset_id, fiscal_year, beginning_book_value, depreciation_expense, accumulated_depreciation, ending_book_value) VALUES
(1, 2024, 25000.00, 5000.00, 5000.00, 20000.00),
(1, 2025, 20000.00, 5000.00, 10000.00, 15000.00),
(2, 2024, 15000.00, 5000.00, 5000.00, 10000.00);

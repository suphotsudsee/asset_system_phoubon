-- Database Initialization Script
-- ระบบงานทะเบียนครุภัณฑ์ - Asset Management System

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE asset_status AS ENUM ('active', 'maintenance', 'disposed', 'lost', 'reserved');
CREATE TYPE transfer_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE maintenance_type AS ENUM ('preventive', 'corrective', 'emergency', 'upgrade');
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'officer', 'viewer');

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES departments(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role user_role DEFAULT 'viewer',
    department_id INTEGER REFERENCES departments(id),
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES categories(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    asset_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    category_id INTEGER REFERENCES categories(id),
    description TEXT,
    serial_number VARCHAR(100),
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    price DECIMAL(15, 2) NOT NULL DEFAULT 0,
    purchase_date DATE,
    warranty_date DATE,
    depreciation_rate DECIMAL(5, 2) DEFAULT 0,
    status asset_status DEFAULT 'active',
    location VARCHAR(255),
    department_id INTEGER REFERENCES departments(id),
    assigned_to INTEGER REFERENCES users(id),
    images JSONB DEFAULT '[]',
    documents JSONB DEFAULT '[]',
    qr_code VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create transfers table
CREATE TABLE IF NOT EXISTS transfers (
    id SERIAL PRIMARY KEY,
    transfer_code VARCHAR(50) UNIQUE NOT NULL,
    asset_id INTEGER REFERENCES assets(id),
    from_department_id INTEGER REFERENCES departments(id),
    to_department_id INTEGER REFERENCES departments(id),
    transfer_date DATE NOT NULL,
    reason TEXT,
    notes TEXT,
    status transfer_status DEFAULT 'pending',
    requested_by INTEGER REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    rejected_by INTEGER REFERENCES users(id),
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create maintenances table
CREATE TABLE IF NOT EXISTS maintenances (
    id SERIAL PRIMARY KEY,
    maintenance_code VARCHAR(50) UNIQUE NOT NULL,
    asset_id INTEGER REFERENCES assets(id),
    type maintenance_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    vendor VARCHAR(255),
    contact_person VARCHAR(255),
    contact_phone VARCHAR(50),
    cost DECIMAL(15, 2) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    warranty_period INTEGER, -- months
    next_maintenance_date DATE,
    status VARCHAR(50) DEFAULT 'in_progress',
    completed_by INTEGER REFERENCES users(id),
    completed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sessions table (for JWT token management)
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_assets_code ON assets(asset_code);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_category ON assets(category_id);
CREATE INDEX idx_assets_department ON assets(department_id);
CREATE INDEX idx_assets_deleted ON assets(deleted_at);
CREATE INDEX idx_transfers_asset ON transfers(asset_id);
CREATE INDEX idx_transfers_status ON transfers(status);
CREATE INDEX idx_maintenances_asset ON maintenances(asset_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- Insert default data

-- Default departments
INSERT INTO departments (name, name_en, code, description) VALUES
('ฝ่ายเทคโนโลยีสารสนเทศ', 'IT Department', 'IT', 'ดูแลระบบเทคโนโลยีสารสนเทศ'),
('ฝ่ายทรัพยากรมนุษย์', 'HR Department', 'HR', 'จัดการทรัพยากรมนุษย์'),
('ฝ่ายการเงินและบัญชี', 'Finance Department', 'FIN', 'จัดการการเงินและบัญชี'),
('ฝ่ายปฏิบัติการ', 'Operations Department', 'OPS', 'จัดการปฏิบัติการ'),
('ฝ่ายบริหาร', 'Management', 'MGMT', 'ฝ่ายบริหาร');

-- Default categories
INSERT INTO categories (name, name_en, code, description) VALUES
('อุปกรณ์คอมพิวเตอร์', 'Computer Equipment', 'COMP', 'อุปกรณ์คอมพิวเตอร์และอุปกรณ์ต่อพ่วง'),
('อุปกรณ์สำนักงาน', 'Office Equipment', 'OFFC', 'อุปกรณ์สำนักงานต่างๆ'),
('เฟอร์นิเจอร์', 'Furniture', 'FURN', 'เฟอร์นิเจอร์สำนักงาน'),
('ยานพาหนะ', 'Vehicles', 'VEHI', 'ยานพาหนะของบริษัท'),
('เครื่องจักร', 'Machinery', 'MACH', 'เครื่องจักรและอุปกรณ์การผลิต'),
('อุปกรณ์อิเล็กทรอนิกส์', 'Electronics', 'ELEC', 'อุปกรณ์อิเล็กทรอนิกส์');

-- Default admin user (password: admin123 - change after first login!)
INSERT INTO users (username, email, password_hash, full_name, role, department_id) VALUES
('admin', 'admin@asset-system.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ผู้ดูแลระบบ', 'super_admin', 1),
('officer', 'officer@asset-system.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'เจ้าหน้าที่', 'officer', 1);

-- Sample assets (for testing)
INSERT INTO assets (asset_code, name, name_en, category_id, description, serial_number, manufacturer, model, price, purchase_date, warranty_date, status, location, department_id) VALUES
('AST-2026-00001', 'คอมพิวเตอร์ตั้งโต๊ะ Dell', 'Dell Desktop PC', 1, 'คอมพิวเตอร์สำหรับงานสำนักงาน', 'SN-DELL-001', 'Dell', 'OptiPlex 7090', 25000.00, '2026-01-15', '2027-01-15', 'active', 'สำนักงาน ชั้น 3', 1),
('AST-2026-00002', 'เครื่องพิมพ์ Canon', 'Canon Printer', 1, 'เครื่องพิมพ์เลเซอร์สี', 'SN-CANON-001', 'Canon', 'imageRUNNER', 45000.00, '2026-02-01', '2027-02-01', 'active', 'สำนักงาน ชั้น 2', 2),
('AST-2026-00003', 'โต๊ะทำงาน', 'Office Desk', 3, 'โต๊ะทำงานไม้', 'N/A', 'Local', 'Standard', 5000.00, '2026-01-20', '2026-01-20', 'active', 'สำนักงาน ชั้น 3', 1),
('AST-2026-00004', 'เก้าอี้สำนักงาน', 'Office Chair', 3, 'เก้าอี้สำนักงานปรับระดับได้', 'N/A', 'Local', 'Ergonomic', 3500.00, '2026-01-20', '2026-01-20', 'active', 'สำนักงาน ชั้น 3', 1),
('AST-2026-00005', 'โน้ตบุ๊ก Lenovo', 'Lenovo Laptop', 1, 'โน้ตบุ๊กสำหรับพนักงาน', 'SN-LEN-001', 'Lenovo', 'ThinkPad X1', 35000.00, '2026-03-01', '2027-03-01', 'active', 'สำนักงาน ชั้น 2', 2);

-- Create view for active assets
CREATE OR REPLACE VIEW active_assets AS
SELECT * FROM assets
WHERE deleted_at IS NULL AND status = 'active';

-- Create function for updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transfers_updated_at BEFORE UPDATE ON transfers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenances_updated_at BEFORE UPDATE ON maintenances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO assetuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO assetuser;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Database initialization completed successfully!';
    RAISE NOTICE 'Tables created: departments, users, categories, assets, transfers, maintenances, audit_logs, notifications, sessions';
    RAISE NOTICE 'Default data inserted: 5 departments, 6 categories, 2 users, 5 sample assets';
    RAISE NOTICE 'Remember to change default passwords after first login!';
END $$;

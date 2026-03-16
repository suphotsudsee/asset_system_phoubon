-- ============================================================================
-- ระบบงานทะเบียนครุภัณฑ์ (Asset Management System)
-- Database Schema สำหรับหน่วยงานภาครัฐ
-- ออกแบบตามระเบียบพัสดุเรื่องการคำนวณค่าเสื่อมราคา
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ระบบผู้ใช้และการควบคุมการเข้าถึง (RBAC)
-- ============================================================================

-- ตารางหน่วยงาน (Agencies) - สำหรับแยกข้อมูลตามหน่วยงาน
CREATE TABLE agencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_code VARCHAR(20) UNIQUE NOT NULL,
    agency_name VARCHAR(200) NOT NULL,
    parent_agency_id UUID REFERENCES agencies(id),
    agency_type VARCHAR(50) DEFAULT 'department', -- ministry, department, division, bureau
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ตารางบทบาท (Roles)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_code VARCHAR(50) UNIQUE NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    role_level VARCHAR(20) NOT NULL, -- super_admin, agency_admin, manager, operator, viewer
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ตารางผู้ใช้ (Users)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(20) UNIQUE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    agency_id UUID REFERENCES agencies(id) NOT NULL,
    position VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ตารางเชื่อมโยงผู้ใช้กับบทบาท (User Roles)
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    agency_id UUID REFERENCES agencies(id),
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (user_id, role_id, agency_id)
);

-- ตารางสิทธิ์ (Permissions)
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    permission_code VARCHAR(100) UNIQUE NOT NULL,
    permission_name VARCHAR(200) NOT NULL,
    resource_type VARCHAR(50) NOT NULL, -- asset, category, transaction, report, admin
    action_type VARCHAR(20) NOT NULL, -- create, read, update, delete, approve, export
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ตารางเชื่อมโยงบทบาทกับสิทธิ์ (Role Permissions)
CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID REFERENCES users(id),
    PRIMARY KEY (role_id, permission_id)
);

-- ============================================================================
-- 2. ประเภทครุภัณฑ์ (Asset Categories)
-- ============================================================================

-- ตารางประเภทครุภัณฑ์หลัก
CREATE TABLE asset_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_code VARCHAR(20) UNIQUE NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    category_group VARCHAR(50) NOT NULL, -- อาคาร, ยานพาหนะ, เครื่องจักร, คอมพิวเตอร์, อื่นๆ
    parent_category_id UUID REFERENCES asset_categories(id),
    
    -- ข้อมูลค่าเสื่อมราคาตามระเบียบพัสดุ
    depreciation_method VARCHAR(20) DEFAULT 'straight_line', -- straight_line, declining_balance
    useful_life_years INTEGER NOT NULL, -- อายุการใช้งาน (ปี)
    depreciation_rate DECIMAL(5,4) NOT NULL, -- อัตราค่าเสื่อม (ต่อปี)
    salvage_value_rate DECIMAL(5,4) DEFAULT 0, -- อัตราค่าซาก (%)
    
    -- การตั้งค่าเพิ่มเติม
    is_depreciable BOOLEAN DEFAULT true,
    requires_maintenance BOOLEAN DEFAULT false,
    requires_qr_code BOOLEAN DEFAULT true,
    
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ตารางอัตราค่าเสื่อมราคา (อ้างอิงระเบียบพัสดุ)
CREATE TABLE depreciation_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_category_id UUID REFERENCES asset_categories(id),
    regulation_reference VARCHAR(100), -- อ้างอิงระเบียบ
    fiscal_year INTEGER NOT NULL, -- ปีงบประมาณ
    useful_life_years INTEGER NOT NULL,
    depreciation_rate DECIMAL(5,4) NOT NULL,
    salvage_value_rate DECIMAL(5,4) DEFAULT 0,
    depreciation_method VARCHAR(20) NOT NULL,
    effective_date DATE NOT NULL,
    expiry_date DATE,
    is_current BOOLEAN DEFAULT true,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. ครุภัณฑ์หลัก (Assets)
-- ============================================================================

-- ตารางครุภัณฑ์
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_code VARCHAR(50) UNIQUE NOT NULL, -- รหัสครุภัณฑ์
    barcode VARCHAR(50) UNIQUE, -- Barcode
    qr_code_id UUID, -- จะเชื่อมโยงกับตาราง qr_codes
    
    -- ข้อมูลพื้นฐาน
    asset_name VARCHAR(200) NOT NULL,
    asset_name_en VARCHAR(200),
    category_id UUID REFERENCES asset_categories(id) NOT NULL,
    model VARCHAR(100),
    manufacturer VARCHAR(100),
    serial_number VARCHAR(100),
    color VARCHAR(50),
    size_description TEXT,
    weight_kg DECIMAL(10,2),
    
    -- ข้อมูลการเงิน
    acquisition_cost DECIMAL(15,2) NOT NULL, -- ราคาทุน
    acquisition_date DATE NOT NULL, -- วันที่ได้มา
    acquisition_type VARCHAR(50) NOT NULL, -- ซื้อ, รับบริจาค, สร้างเอง, โอนมา
    funding_source VARCHAR(100), -- แหล่งเงิน
    budget_year INTEGER, -- ปีงบประมาณ
    invoice_number VARCHAR(50),
    po_number VARCHAR(50),
    
    -- ข้อมูลค่าเสื่อมราคา
    depreciation_method VARCHAR(20) DEFAULT 'straight_line',
    useful_life_years INTEGER,
    depreciation_rate DECIMAL(5,4),
    salvage_value DECIMAL(15,2) DEFAULT 0,
    accumulated_depreciation DECIMAL(15,2) DEFAULT 0,
    net_book_value DECIMAL(15,2),
    depreciation_start_date DATE,
    depreciation_end_date DATE,
    last_depreciation_date TIMESTAMP WITH TIME ZONE,
    
    -- สถานะ
    asset_status VARCHAR(30) DEFAULT 'active', -- active, inactive, disposed, lost, damaged, under_maintenance
    location_description TEXT,
    custody_officer_id UUID REFERENCES users(id), -- ผู้รับผิดชอบ
    department_id UUID REFERENCES agencies(id),
    
    -- การตรวจสอบ
    last_physical_check_date DATE,
    next_physical_check_date DATE,
    physical_check_result VARCHAR(50),
    
    -- Metadata
    specifications JSONB, -- ข้อมูลจำเพาะเพิ่มเติม
    images JSONB, -- รายการรูปภาพ
    attachments JSONB, -- ไฟว์แนบ
    notes TEXT,
    
    -- Audit
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

-- ============================================================================
-- 4. QR Code Management
-- ============================================================================

-- ตาราง QR Codes
CREATE TABLE qr_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    qr_code_data TEXT NOT NULL, -- เนื้อหา QR Code (URL หรือ JSON)
    qr_code_image BYTEA, -- รูปภาพ QR Code (base64 หรือ binary)
    qr_code_format VARCHAR(20) DEFAULT 'QR_CODE', -- QR_CODE, DATA_MATRIX, etc.
    print_status VARCHAR(20) DEFAULT 'pending', -- pending, printed, replaced, damaged
    print_date TIMESTAMP WITH TIME ZONE,
    printed_by UUID REFERENCES users(id),
    replacement_count INTEGER DEFAULT 0,
    last_scanned_at TIMESTAMP WITH TIME ZONE,
    last_scanned_by UUID REFERENCES users(id),
    scan_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ตารางบันทึกการสแกน QR Code
CREATE TABLE qr_scan_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    qr_code_id UUID REFERENCES qr_codes(id),
    asset_id UUID REFERENCES assets(id),
    scanned_by UUID REFERENCES users(id),
    scan_type VARCHAR(30), -- physical_check, transfer, maintenance, audit
    scan_location VARCHAR(200),
    scan_device VARCHAR(100),
    scan_ip_address INET,
    scan_notes TEXT,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. ธุรกรรมครุภัณฑ์ (Asset Transactions)
-- ============================================================================

-- ตารางธุรกรรมครุภัณฑ์
CREATE TABLE asset_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_code VARCHAR(50) UNIQUE NOT NULL,
    transaction_type VARCHAR(30) NOT NULL, -- acquisition, transfer, disposal, adjustment, maintenance, audit
    
    -- ข้อมูลธุรกรรม
    asset_id UUID REFERENCES assets(id) NOT NULL,
    transaction_date DATE NOT NULL,
    transaction_fiscal_year INTEGER NOT NULL,
    
    -- ผู้เกี่ยวข้อง
    initiated_by UUID REFERENCES users(id) NOT NULL,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES users(id),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- ธุรกรรมประเภทต่างๆ
    -- การโอนย้าย
    from_agency_id UUID REFERENCES agencies(id),
    to_agency_id UUID REFERENCES agencies(id),
    from_custody_officer_id UUID REFERENCES users(id),
    to_custody_officer_id UUID REFERENCES users(id),
    transfer_reason TEXT,
    
    -- การจำหน่าย
    disposal_type VARCHAR(50), -- ขาย, ทิ้ง, บริจาค, โอน, สูญหาย
    disposal_reason TEXT,
    disposal_approval_number VARCHAR(100),
    disposal_committee_date DATE,
    disposal_sale_price DECIMAL(15,2),
    disposal_buyer_info TEXT,
    
    -- การปรับปรุงมูลค่า
    adjustment_type VARCHAR(50), -- revaluation, impairment, correction
    adjustment_amount DECIMAL(15,2),
    adjustment_reason TEXT,
    adjustment_approval_number VARCHAR(100),
    
    -- สถานะ
    transaction_status VARCHAR(30) DEFAULT 'pending', -- pending, approved, completed, cancelled, rejected
    rejection_reason TEXT,
    rejected_by UUID REFERENCES users(id),
    rejected_at TIMESTAMP WITH TIME ZONE,
    
    -- เอกสารแนบ
    attachment_ids JSONB,
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. บันทึกค่าเสื่อมราคา (Depreciation Logs)
-- ============================================================================

-- ตารางบันทึกการคำนวณค่าเสื่อมราคา
CREATE TABLE depreciation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES assets(id) NOT NULL,
    fiscal_year INTEGER NOT NULL,
    fiscal_period VARCHAR(20) NOT NULL, -- monthly, quarterly, yearly
    
    -- ข้อมูลการคำนวณ
    calculation_date DATE NOT NULL,
    beginning_book_value DECIMAL(15,2) NOT NULL,
    depreciation_expense DECIMAL(15,2) NOT NULL,
    accumulated_depreciation DECIMAL(15,2) NOT NULL,
    ending_book_value DECIMAL(15,2) NOT NULL,
    
    -- วิธีการคำนวณ
    depreciation_method VARCHAR(20) NOT NULL,
    depreciation_rate DECIMAL(5,4) NOT NULL,
    useful_life_remaining INTEGER,
    
    -- การตรวจสอบ
    calculated_by UUID REFERENCES users(id),
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- สถานะ
    posting_status VARCHAR(20) DEFAULT 'pending', -- pending, posted, adjusted
    posted_to_gl BOOLEAN DEFAULT false,
    gl_voucher_number VARCHAR(50),
    posted_at TIMESTAMP WITH TIME ZONE,
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 7. บันทึกการซ่อมบำรุง (Maintenance Logs)
-- ============================================================================

-- ตารางประเภทการซ่อมบำรุง
CREATE TABLE maintenance_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    maintenance_type_code VARCHAR(20) UNIQUE NOT NULL,
    maintenance_type_name VARCHAR(100) NOT NULL, -- ป้องกัน, แก้ไข, ปรับปรุง, ตรวจสอบ
    is_planned BOOLEAN DEFAULT false,
    default_interval_days INTEGER,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ตารางบันทึกการซ่อมบำรุง
CREATE TABLE maintenance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    maintenance_code VARCHAR(50) UNIQUE NOT NULL,
    asset_id UUID REFERENCES assets(id) NOT NULL,
    
    -- ข้อมูลการซ่อมบำรุง
    maintenance_type_id UUID REFERENCES maintenance_types(id),
    maintenance_date DATE NOT NULL,
    reported_date DATE NOT NULL,
    completed_date DATE,
    
    -- รายละเอียด
    problem_description TEXT NOT NULL,
    cause_analysis TEXT,
    action_taken TEXT NOT NULL,
    parts_replaced JSONB, -- รายการอะไหล่ที่เปลี่ยน
    labor_cost DECIMAL(15,2) DEFAULT 0,
    parts_cost DECIMAL(15,2) DEFAULT 0,
    total_cost DECIMAL(15,2) DEFAULT 0,
    vendor_info TEXT,
    warranty_claim BOOLEAN DEFAULT false,
    warranty_info TEXT,
    
    -- ผู้รับผิดชอบ
    reported_by UUID REFERENCES users(id) NOT NULL,
    assigned_to UUID REFERENCES users(id),
    completed_by UUID REFERENCES users(id),
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- สถานะ
    maintenance_status VARCHAR(30) DEFAULT 'reported', -- reported, assigned, in_progress, completed, cancelled
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    downtime_hours DECIMAL(10,2),
    
    -- การวางแผน
    is_preventive BOOLEAN DEFAULT false,
    next_maintenance_date DATE,
    maintenance_interval_days INTEGER,
    
    -- AI/ML Fields สำหรับพยากรณ์
    failure_probability DECIMAL(5,4), -- ความน่าจะเป็นที่จะเสียหาย
    predicted_failure_date DATE, -- วันที่คาดว่าจะเสียหาย
    risk_score INTEGER DEFAULT 0, -- คะแนนความเสี่ยง (0-100)
    ai_analysis JSONB, -- ผลการวิเคราะห์จาก AI
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 8. Audit Trail (บันทึกการตรวจสอบ)
-- ============================================================================

-- ตาราง Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- ข้อมูลการดำเนินการ
    action_type VARCHAR(50) NOT NULL, -- create, update, delete, view, export, print, approve, reject
    resource_type VARCHAR(50) NOT NULL, -- asset, user, transaction, category, etc.
    resource_id UUID,
    resource_code VARCHAR(100),
    
    -- ผู้ดำเนินการ
    user_id UUID REFERENCES users(id),
    user_email VARCHAR(100),
    user_name VARCHAR(100),
    user_agent_id UUID REFERENCES agencies(id),
    
    -- รายละเอียดการเปลี่ยนแปลง
    action_description TEXT,
    old_values JSONB, -- ค่าเดิม (ก่อนแก้ไข)
    new_values JSONB, -- ค่าใหม่ (หลังแก้ไข)
    changed_fields JSONB, -- รายการฟิลด์ที่เปลี่ยน
    
    -- Context
    ip_address INET,
    mac_address VARCHAR(50),
    device_info VARCHAR(200),
    session_id VARCHAR(100),
    request_id VARCHAR(100),
    
    -- เวลา
    action_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- เพิ่มเติม
    extra_data JSONB
);

-- ============================================================================
-- 9. ระบบการแจ้งเตือน (Notifications)
-- ============================================================================

-- ตารางการแจ้งเตือน
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- approval_request, task_assigned, reminder, alert, info
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    
    -- ข้อมูลที่เกี่ยวข้อง
    resource_type VARCHAR(50),
    resource_id UUID,
    action_url VARCHAR(200),
    
    -- สถานะ
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    is_archived BOOLEAN DEFAULT false,
    
    -- การส่ง
    sent_via_email BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 10. ระบบการตั้งค่า (Settings)
-- ============================================================================

-- ตารางการตั้งค่าระบบ
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type VARCHAR(20) DEFAULT 'string', -- string, number, boolean, json
    category VARCHAR(50), -- general, depreciation, maintenance, security, notification
    description TEXT,
    is_editable BOOLEAN DEFAULT true,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES (สำหรับประสิทธิภาพ)
-- ============================================================================

-- Indexes สำหรับตาราง assets
CREATE INDEX idx_assets_asset_code ON assets(asset_code);
CREATE INDEX idx_assets_category_id ON assets(category_id);
CREATE INDEX idx_assets_status ON assets(asset_status);
CREATE INDEX idx_assets_agency_id ON assets(department_id);
CREATE INDEX idx_assets_custody_officer ON assets(custody_officer_id);
CREATE INDEX idx_assets_acquisition_date ON assets(acquisition_date);
CREATE INDEX idx_assets_created_at ON assets(created_at);
CREATE INDEX idx_assets_deleted_at ON assets(deleted_at) WHERE deleted_at IS NULL;

-- Indexes สำหรับตาราง asset_transactions
CREATE INDEX idx_transactions_asset_id ON asset_transactions(asset_id);
CREATE INDEX idx_transactions_type ON asset_transactions(transaction_type);
CREATE INDEX idx_transactions_status ON asset_transactions(transaction_status);
CREATE INDEX idx_transactions_date ON asset_transactions(transaction_date);
CREATE INDEX idx_transactions_fiscal_year ON asset_transactions(transaction_fiscal_year);

-- Indexes สำหรับตาราง depreciation_logs
CREATE INDEX idx_depreciation_asset_id ON depreciation_logs(asset_id);
CREATE INDEX idx_depreciation_fiscal_year ON depreciation_logs(fiscal_year);
CREATE INDEX idx_depreciation_date ON depreciation_logs(calculation_date);
CREATE INDEX idx_depreciation_status ON depreciation_logs(posting_status);

-- Indexes สำหรับตาราง maintenance_logs
CREATE INDEX idx_maintenance_asset_id ON maintenance_logs(asset_id);
CREATE INDEX idx_maintenance_status ON maintenance_logs(maintenance_status);
CREATE INDEX idx_maintenance_date ON maintenance_logs(maintenance_date);
CREATE INDEX idx_maintenance_priority ON maintenance_logs(priority);
CREATE INDEX idx_maintenance_risk_score ON maintenance_logs(risk_score);

-- Indexes สำหรับตาราง audit_logs
CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(action_timestamp);
CREATE INDEX idx_audit_action_type ON audit_logs(action_type);

-- Indexes สำหรับตาราง users
CREATE INDEX idx_users_agency_id ON users(agency_id);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_username ON users(username);

-- ============================================================================
-- VIEWS (สำหรับรายงาน)
-- ============================================================================

-- View: สรุปครุภัณฑ์ตามหน่วยงาน
CREATE VIEW asset_summary_by_agency AS
SELECT 
    a.id AS agency_id,
    a.agency_code,
    a.agency_name,
    COUNT(ast.id) AS total_assets,
    SUM(ast.acquisition_cost) AS total_value,
    SUM(ast.accumulated_depreciation) AS total_depreciation,
    SUM(ast.net_book_value) AS total_net_value,
    COUNT(CASE WHEN ast.asset_status = 'active' THEN 1 END) AS active_assets,
    COUNT(CASE WHEN ast.asset_status = 'under_maintenance' THEN 1 END) AS under_maintenance_assets
FROM agencies a
LEFT JOIN assets ast ON ast.department_id = a.id AND ast.deleted_at IS NULL
GROUP BY a.id, a.agency_code, a.agency_name;

-- View: ครุภัณฑ์ที่ต้องคำนวณค่าเสื่อม
CREATE VIEW assets_for_depreciation AS
SELECT 
    ast.id,
    ast.asset_code,
    ast.asset_name,
    ast.acquisition_cost,
    ast.acquisition_date,
    ast.useful_life_years,
    ast.depreciation_rate,
    ast.accumulated_depreciation,
    ast.net_book_value,
    ast.last_depreciation_date,
    ac.category_name,
    ac.depreciation_method
FROM assets ast
JOIN asset_categories ac ON ast.category_id = ac.id
WHERE ast.deleted_at IS NULL
    AND ast.asset_status IN ('active', 'under_maintenance')
    AND ac.is_depreciable = true
    AND (ast.last_depreciation_date IS NULL 
         OR ast.last_depreciation_date < CURRENT_DATE - INTERVAL '1 month');

-- View: ครุภัณฑ์ที่ต้องซ่อมบำรุงเร็วๆ นี้
CREATE VIEW upcoming_maintenance_assets AS
SELECT 
    ast.id,
    ast.asset_code,
    ast.asset_name,
    ml.maintenance_code,
    ml.maintenance_status,
    ml.priority,
    ml.next_maintenance_date,
    ml.risk_score,
    ml.predicted_failure_date
FROM assets ast
LEFT JOIN maintenance_logs ml ON ml.asset_id = ast.id 
    AND ml.maintenance_status IN ('reported', 'assigned', 'in_progress')
WHERE ast.deleted_at IS NULL
    AND ast.asset_status = 'active'
    AND (ml.next_maintenance_date <= CURRENT_DATE + INTERVAL '30 days'
         OR ml.risk_score > 70);

-- ============================================================================
-- TRIGGERS (สำหรับ auto-update)
-- ============================================================================

-- Trigger: อัพเดต updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_assets_updated_at
    BEFORE UPDATE ON assets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agencies_updated_at
    BEFORE UPDATE ON agencies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: คำนวณ net_book_value อัตโนมัติ
CREATE OR REPLACE FUNCTION calculate_net_book_value()
RETURNS TRIGGER AS $$
BEGIN
    NEW.net_book_value := NEW.acquisition_cost - NEW.accumulated_depreciation;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_asset_net_book_value
    BEFORE INSERT OR UPDATE ON assets
    FOR EACH ROW
    EXECUTE FUNCTION calculate_net_book_value();

-- ============================================================================
-- INITIAL DATA (ข้อมูลเริ่มต้น)
-- ============================================================================

-- Insert default roles
INSERT INTO roles (role_code, role_name, role_level, description) VALUES
('SUPER_ADMIN', 'ผู้ดูแลระบบสูงสุด', 'super_admin', 'สามารถเข้าถึงทุกฟังก์ชันและทุกหน่วยงาน'),
('AGENCY_ADMIN', 'ผู้ดูแลระบบหน่วยงาน', 'agency_admin', 'ดูแลระบบภายในหน่วยงานของตนเอง'),
('MANAGER', 'ผู้จัดการ', 'manager', 'อนุมัติธุรกรรมและรายงาน'),
('OPERATOR', 'ผู้ปฏิบัติงาน', 'operator', 'บันทึกและแก้ไขข้อมูลครุภัณฑ์'),
('VIEWER', 'ผู้ดูข้อมูล', 'viewer', 'ดูข้อมูลและรายงานเท่านั้น');

-- Insert default asset categories (ตามระเบียบพัสดุ)
INSERT INTO asset_categories (category_code, category_name, category_group, useful_life_years, depreciation_rate, depreciation_method) VALUES
('BLDG-001', 'อาคารถาวร', 'อาคาร', 50, 0.02, 'straight_line'),
('BLDG-002', 'อาคารชั่วคราว', 'อาคาร', 10, 0.10, 'straight_line'),
('VEH-001', 'รถยนต์', 'ยานพาหนะ', 8, 0.125, 'straight_line'),
('VEH-002', 'รถจักรยานยนต์', 'ยานพาหนะ', 5, 0.20, 'straight_line'),
('VEH-003', 'รถบรรทุก', 'ยานพาหนะ', 10, 0.10, 'straight_line'),
('MACH-001', 'เครื่องจักรการผลิต', 'เครื่องจักร', 10, 0.10, 'straight_line'),
('MACH-002', 'เครื่องจักรก่อสร้าง', 'เครื่องจักร', 8, 0.125, 'straight_line'),
('COMP-001', 'คอมพิวเตอร์ PC', 'คอมพิวเตอร์', 5, 0.20, 'straight_line'),
('COMP-002', 'คอมพิวเตอร์ Laptop', 'คอมพิวเตอร์', 3, 0.33, 'straight_line'),
('COMP-003', 'Server', 'คอมพิวเตอร์', 5, 0.20, 'straight_line'),
('COMP-004', 'Network Equipment', 'คอมพิวเตอร์', 5, 0.20, 'straight_line'),
('FURN-001', 'โต๊ะและเก้าอี้', 'อื่นๆ', 10, 0.10, 'straight_line'),
('FURN-002', 'ตู้และชั้น', 'อื่นๆ', 10, 0.10, 'straight_line'),
('EQP-001', 'เครื่องปรับอากาศ', 'อื่นๆ', 7, 0.14, 'straight_line'),
('EQP-002', 'เครื่องถ่ายเอกสาร', 'อื่นๆ', 5, 0.20, 'straight_line');

-- Insert default permissions
INSERT INTO permissions (permission_code, permission_name, resource_type, action_type) VALUES
('ASSET_CREATE', 'สร้างครุภัณฑ์', 'asset', 'create'),
('ASSET_READ', 'ดูครุภัณฑ์', 'asset', 'read'),
('ASSET_UPDATE', 'แก้ไขครุภัณฑ์', 'asset', 'update'),
('ASSET_DELETE', 'ลบครุภัณฑ์', 'asset', 'delete'),
('ASSET_EXPORT', 'ส่งออกข้อมูลครุภัณฑ์', 'asset', 'export'),
('TRANSACTION_CREATE', 'สร้างธุรกรรม', 'transaction', 'create'),
('TRANSACTION_READ', 'ดูธุรกรรม', 'transaction', 'read'),
('TRANSACTION_APPROVE', 'อนุมัติธุรกรรม', 'transaction', 'approve'),
('REPORT_ACCESS', 'เข้าถึงรายงาน', 'report', 'read'),
('USER_MANAGE', 'จัดการผู้ใช้', 'admin', 'manage'),
('ROLE_MANAGE', 'จัดการบทบาท', 'admin', 'manage'),
('SETTINGS_MANAGE', 'จัดการการตั้งค่า', 'admin', 'update');

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

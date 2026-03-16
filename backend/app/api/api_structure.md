# API Structure - ระบบงานทะเบียนครุภัณฑ์

## Base URL
```
GETWAY_URL:PORT/api/v1
```

## Authentication
- **Type:** JWT Bearer Token
- **Header:** `Authorization: Bearer <token>`
- **Token Expiry:** 24 hours
- **Refresh Token:** 7 days

---

## API Endpoints

### 1. Authentication & Authorization

#### POST /auth/login
```
Description: เข้าสู่ระบบ
Body: {
  "username": "string",
  "password": "string"
}
Response: {
  "access_token": "string",
  "refresh_token": "string",
  "user": { ... }
}
```

#### POST /auth/refresh
```
Description: รีเฟรช token
Body: {
  "refresh_token": "string"
}
Response: {
  "access_token": "string",
  "refresh_token": "string"
}
```

#### POST /auth/logout
```
Description: ออกจากระบบ
Headers: Authorization
```

#### GET /auth/me
```
Description: ข้อมูลผู้ใช้ปัจจุบัน
Headers: Authorization
Response: {
  "id": "uuid",
  "username": "string",
  "email": "string",
  "full_name": "string",
  "agency_id": "uuid",
  "roles": [...],
  "permissions": [...]
}
```

---

### 2. Users Management (Admin)

#### GET /users
```
Description: รายการผู้ใช้ (พร้อม pagination)
Query Params: page, limit, search, agency_id, is_active
Headers: Authorization
Response: {
  "data": [...],
  "total": number,
  "page": number,
  "limit": number
}
```

#### GET /users/:id
```
Description: ข้อมูลผู้ใช้
Headers: Authorization
Response: { user object }
```

#### POST /users
```
Description: สร้างผู้ใช้ใหม่
Headers: Authorization
Body: {
  "username": "string",
  "email": "string",
  "password": "string",
  "full_name": "string",
  "agency_id": "uuid",
  "role_ids": ["uuid"]
}
```

#### PUT /users/:id
```
Description: แก้ไขข้อมูลผู้ใช้
Headers: Authorization
Body: {
  "email": "string",
  "full_name": "string",
  "phone": "string",
  "position": "string",
  "is_active": "boolean"
}
```

#### PUT /users/:id/roles
```
Description: กำหนดบทบาทผู้ใช้
Headers: Authorization
Body: {
  "role_ids": ["uuid"]
}
```

#### DELETE /users/:id
```
Description: ลบผู้ใช้ (soft delete)
Headers: Authorization
```

---

### 3. Roles & Permissions (Admin)

#### GET /roles
```
Description: รายการบทบาท
Headers: Authorization
Response: {
  "data": [role objects]
}
```

#### GET /roles/:id
```
Description: ข้อมูลบทบาทพร้อมสิทธิ์
Headers: Authorization
Response: {
  "role": {...},
  "permissions": [...]
}
```

#### POST /roles
```
Description: สร้างบทบาทใหม่
Headers: Authorization
Body: {
  "role_code": "string",
  "role_name": "string",
  "role_level": "string",
  "permission_ids": ["uuid"]
}
```

#### PUT /roles/:id
```
Description: แก้ไขบทบาท
Headers: Authorization
Body: {
  "role_name": "string",
  "description": "string",
  "permission_ids": ["uuid"]
}
```

#### GET /permissions
```
Description: รายการสิทธิ์ทั้งหมด
Headers: Authorization
Response: {
  "data": [permission objects]
}
```

---

### 4. Agencies (Admin)

#### GET /agencies
```
Description: รายการหน่วยงาน (tree structure)
Query Params: parent_id, type
Headers: Authorization
Response: {
  "data": [agency objects with children]
}
```

#### GET /agencies/:id
```
Description: ข้อมูลหน่วยงาน
Headers: Authorization
```

#### POST /agencies
```
Description: สร้างหน่วยงานใหม่
Headers: Authorization
Body: {
  "agency_code": "string",
  "agency_name": "string",
  "parent_agency_id": "uuid",
  "agency_type": "string"
}
```

#### PUT /agencies/:id
```
Description: แก้ไขหน่วยงาน
Headers: Authorization
```

---

### 5. Asset Categories

#### GET /asset-categories
```
Description: รายการประเภทครุภัณฑ์
Query Params: group, is_active
Headers: Authorization
Response: {
  "data": [category objects]
}
```

#### GET /asset-categories/:id
```
Description: ข้อมูลประเภทครุภัณฑ์
Headers: Authorization
Response: {
  "category": {...},
  "depreciation_rates": [...]
}
```

#### POST /asset-categories
```
Description: สร้างประเภทครุภัณฑ์ใหม่
Headers: Authorization (admin/manager)
Body: {
  "category_code": "string",
  "category_name": "string",
  "category_group": "string",
  "useful_life_years": "number",
  "depreciation_rate": "number",
  "depreciation_method": "string"
}
```

#### PUT /asset-categories/:id
```
Description: แก้ไขประเภทครุภัณฑ์
Headers: Authorization (admin)
```

#### DELETE /asset-categories/:id
```
Description: ลบประเภทครุภัณฑ์ (soft delete)
Headers: Authorization (admin)
```

---

### 6. Assets (ครุภัณฑ์)

#### GET /assets
```
Description: รายการครุภัณฑ์ (พร้อม pagination & filters)
Query Params: 
  - page, limit
  - search (asset_code, asset_name)
  - category_id
  - status (active, inactive, disposed, etc.)
  - agency_id
  - custody_officer_id
  - acquisition_date_from, acquisition_date_to
  - has_qr_code (boolean)
Headers: Authorization
Response: {
  "data": [asset objects],
  "total": number,
  "page": number,
  "limit": number,
  "summary": {
    "total_value": number,
    "total_depreciation": number,
    "net_book_value": number
  }
}
```

#### GET /assets/:id
```
Description: ข้อมูลครุภัณฑ์
Headers: Authorization
Response: {
  "asset": {...},
  "category": {...},
  "qr_code": {...},
  "transactions": [...],
  "maintenance_logs": [...],
  "depreciation_logs": [...]
}
```

#### POST /assets
```
Description: สร้างครุภัณฑ์ใหม่
Headers: Authorization (operator+)
Body: {
  "asset_code": "string",
  "asset_name": "string",
  "category_id": "uuid",
  "acquisition_cost": "number",
  "acquisition_date": "date",
  "acquisition_type": "string",
  "model": "string",
  "manufacturer": "string",
  "serial_number": "string",
  "department_id": "uuid",
  "custody_officer_id": "uuid",
  "location_description": "string",
  "specifications": "object"
}
```

#### PUT /assets/:id
```
Description: แก้ไขครุภัณฑ์
Headers: Authorization (operator+)
Body: {
  "asset_name": "string",
  "model": "string",
  "location_description": "string",
  "custody_officer_id": "uuid",
  "notes": "string"
  // ... other fields
}
```

#### DELETE /assets/:id
```
Description: ลบครุภัณฑ์ (soft delete)
Headers: Authorization (manager+)
```

#### POST /assets/:id/qr-code
```
Description: สร้าง/สร้างใหม่ QR Code
Headers: Authorization
Response: {
  "qr_code_id": "uuid",
  "qr_code_data": "string",
  "qr_code_image": "base64"
}
```

#### GET /assets/:id/qr-code
```
Description: ข้อมูล QR Code
Headers: Authorization
```

#### POST /assets/batch-import
```
Description: นำเข้าครุภัณฑ์จำนวนมาก (Excel/CSV)
Headers: Authorization (manager+)
Content-Type: multipart/form-data
Body: {
  "file": "file",
  "agency_id": "uuid",
  "fiscal_year": "number"
}
```

#### POST /assets/batch-export
```
Description: ส่งออกครุภัณฑ์ (Excel/PDF)
Headers: Authorization
Body: {
  "filters": {...},
  "format": "excel|pdf"
}
```

---

### 7. Asset Transactions (ธุรกรรม)

#### GET /transactions
```
Description: รายการธุรกรรมครุภัณฑ์
Query Params: 
  - type (acquisition, transfer, disposal, etc.)
  - status (pending, approved, completed)
  - asset_id
  - agency_id
  - date_from, date_to
  - fiscal_year
Headers: Authorization
```

#### GET /transactions/:id
```
Description: ข้อมูลธุรกรรม
Headers: Authorization
Response: {
  "transaction": {...},
  "asset": {...},
  "approval_history": [...]
}
```

#### POST /transactions
```
Description: สร้างธุรกรรมใหม่
Headers: Authorization (operator+)
Body: {
  "transaction_type": "string",
  "asset_id": "uuid",
  "transaction_date": "date",
  "notes": "string",
  // type-specific fields:
  "to_agency_id": "uuid", // for transfer
  "disposal_type": "string", // for disposal
  "adjustment_amount": "number" // for adjustment
}
```

#### PUT /transactions/:id
```
Description: แก้ไขธุรกรรม
Headers: Authorization (initiated_by or manager+)
```

#### POST /transactions/:id/approve
```
Description: อนุมัติธุรกรรม
Headers: Authorization (manager+)
Body: {
  "approval_notes": "string"
}
```

#### POST /transactions/:id/reject
```
Description: ปฏิเสธธุรกรรม
Headers: Authorization (manager+)
Body: {
  "rejection_reason": "string"
}
```

#### POST /transactions/:id/complete
```
Description: ปิดธุรกรรม (mark as completed)
Headers: Authorization
```

---

### 8. Depreciation (ค่าเสื่อมราคา)

#### GET /depreciation/rates
```
Description: รายการอัตราค่าเสื่อมราคา
Query Params: fiscal_year, is_current
Headers: Authorization
```

#### POST /depreciation/rates
```
Description: กำหนดอัตราค่าเสื่อมใหม่
Headers: Authorization (admin/manager)
Body: {
  "asset_category_id": "uuid",
  "fiscal_year": "number",
  "useful_life_years": "number",
  "depreciation_rate": "number",
  "depreciation_method": "string",
  "effective_date": "date"
}
```

#### GET /depreciation/logs
```
Description: รายการบันทึกค่าเสื่อม
Query Params: asset_id, fiscal_year, status
Headers: Authorization
```

#### GET /depreciation/logs/:id
```
Description: ข้อมูลบันทึกค่าเสื่อม
Headers: Authorization
```

#### POST /depreciation/calculate
```
Description: คำนวณค่าเสื่อม (รายเดือน/รายปี)
Headers: Authorization (manager+)
Body: {
  "fiscal_year": "number",
  "fiscal_period": "monthly|quarterly|yearly",
  "asset_ids": ["uuid"] // optional, default all
}
Response: {
  "calculated_count": number,
  "total_depreciation": number,
  "logs_created": [...]
}
```

#### POST /depreciation/logs/:id/post
```
Description: โพสต์ค่าเสื่อมสู่บัญชีแยกประเภท
Headers: Authorization (manager+)
Body: {
  "gl_voucher_number": "string"
}
```

#### GET /depreciation/report
```
Description: รายงานค่าเสื่อมราคา
Query Params: fiscal_year, agency_id, category_id
Headers: Authorization
Response: {
  "summary": {...},
  "details": [...],
  "generated_at": "timestamp"
}
```

---

### 9. Maintenance (ซ่อมบำรุง)

#### GET /maintenance/logs
```
Description: รายการซ่อมบำรุง
Query Params: 
  - asset_id
  - status (reported, assigned, in_progress, completed)
  - priority (low, normal, high, urgent)
  - is_preventive (boolean)
  - date_from, date_to
Headers: Authorization
```

#### GET /maintenance/logs/:id
```
Description: ข้อมูลซ่อมบำรุง
Headers: Authorization
Response: {
  "maintenance": {...},
  "asset": {...},
  "parts_replaced": [...],
  "cost_breakdown": {...}
}
```

#### POST /maintenance/logs
```
Description: รายงานการซ่อมบำรุง
Headers: Authorization (operator+)
Body: {
  "asset_id": "uuid",
  "maintenance_type_id": "uuid",
  "problem_description": "string",
  "priority": "string",
  "is_preventive": "boolean",
  "next_maintenance_date": "date"
}
```

#### PUT /maintenance/logs/:id
```
Description: อัพเดตซ่อมบำรุง
Headers: Authorization
Body: {
  "action_taken": "string",
  "parts_replaced": [...],
  "labor_cost": "number",
  "parts_cost": "number",
  "maintenance_status": "string",
  "completed_by": "uuid"
}
```

#### POST /maintenance/logs/:id/assign
```
Description: มอบหมายซ่อมบำรุง
Headers: Authorization (manager+)
Body: {
  "assigned_to": "uuid",
  "notes": "string"
}
```

#### POST /maintenance/logs/:id/verify
```
Description: ตรวจสอบซ่อมบำรุง
Headers: Authorization (manager+)
Body: {
  "verified_notes": "string"
}
```

#### GET /maintenance/upcoming
```
Description: การซ่อมบำรุงที่จะเกิดขึ้น
Query Params: days (default 30)
Headers: Authorization
Response: {
  "data": [maintenance objects]
}
```

#### GET /maintenance/ai-predictions
```
Description: พยากรณ์ซ่อมบำรุงด้วย AI
Query Params: asset_id, threshold (risk_score)
Headers: Authorization
Response: {
  "predictions": [
    {
      "asset_id": "uuid",
      "failure_probability": number,
      "predicted_failure_date": "date",
      "risk_score": number,
      "recommended_action": "string"
    }
  ]
}
```

#### GET /maintenance/types
```
Description: รายการประเภทซ่อมบำรุง
Headers: Authorization
```

---

### 10. QR Code Scanning

#### POST /qr/scan
```
Description: บันทึกการสแกน QR Code
Headers: Authorization (optional for public scan)
Body: {
  "qr_code_data": "string",
  "scan_type": "physical_check|transfer|maintenance|audit",
  "scan_location": "string",
  "scan_device": "string",
  "scan_notes": "string"
}
Response: {
  "asset": {...},
  "scan_logged": true
}
```

#### GET /qr/scans
```
Description: รายการการสแกน
Query Params: asset_id, qr_code_id, date_from, date_to
Headers: Authorization
```

---

### 11. Audit Logs

#### GET /audit-logs
```
Description: รายการ audit trail
Query Params: 
  - user_id
  - resource_type
  - resource_id
  - action_type
  - date_from, date_to
Headers: Authorization (admin/manager)
Response: {
  "data": [audit_log objects],
  "total": number
}
```

#### GET /audit-logs/:id
```
Description: ข้อมูล audit log
Headers: Authorization (admin)
Response: {
  "id": "uuid",
  "action_type": "string",
  "resource_type": "string",
  "old_values": {...},
  "new_values": {...},
  "changed_fields": [...],
  "user": {...},
  "action_timestamp": "timestamp"
}
```

---

### 12. Reports & Dashboard

#### GET /reports/asset-summary
```
Description: สรุปครุภัณฑ์
Query Params: agency_id, fiscal_year, group_by (category, status, location)
Headers: Authorization
Response: {
  "summary": {...},
  "breakdown": [...]
}
```

#### GET /reports/depreciation-summary
```
Description: สรุปค่าเสื่อมราคา
Query Params: fiscal_year, agency_id
Headers: Authorization
```

#### GET /reports/maintenance-summary
```
Description: สรุปซ่อมบำรุง
Query Params: fiscal_year, agency_id, asset_type
Headers: Authorization
```

#### GET /reports/physical-check
```
Description: รายงานการตรวจสอบครุภัณฑ์
Query Params: agency_id, check_date
Headers: Authorization
```

#### GET /dashboard/stats
```
Description: สถิติ dashboard
Headers: Authorization
Response: {
  "total_assets": number,
  "total_value": number,
  "active_assets": number,
  "pending_transactions": number,
  "upcoming_maintenance": number,
  "high_risk_assets": number
}
```

---

### 13. Notifications

#### GET /notifications
```
Description: รายการแจ้งเตือน
Query Params: is_read, is_archived, limit
Headers: Authorization
Response: {
  "data": [notification objects],
  "unread_count": number
}
```

#### PUT /notifications/:id/read
```
Description: อ่านแล้ว
Headers: Authorization
```

#### DELETE /notifications/:id
```
Description: ลบแจ้งเตือน
Headers: Authorization
```

---

### 14. System Settings

#### GET /settings
```
Description: การตั้งค่าระบบ
Query Params: category
Headers: Authorization (admin)
```

#### PUT /settings/:key
```
Description: อัพเดตการตั้งค่า
Headers: Authorization (admin)
Body: {
  "setting_value": "string|number|boolean|object"
}
```

---

## Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {...}, // optional
    "timestamp": "2026-03-16T08:52:00Z",
    "path": "/api/v1/..."
  }
}
```

### Common Error Codes
- `UNAUTHORIZED` - 401
- `FORBIDDEN` - 403
- `NOT_FOUND` - 404
- `VALIDATION_ERROR` - 400
- `DUPLICATE` - 409
- `SERVER_ERROR` - 500

---

## Rate Limiting
- **Default:** 100 requests/minute per user
- **Report endpoints:** 10 requests/minute
- **Admin endpoints:** 50 requests/minute

Headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1678953120
```

---

## Versioning
- Current version: v1
- Header: `Accept-Version: v1` (optional)
- URL prefix: `/api/v1/`

---

## Pagination Standard
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## File Upload
- Max size: 10MB per file
- Allowed formats: jpg, png, pdf, xlsx, csv
- Endpoint: `POST /uploads`
- Response: `{ "file_url": "...", "file_id": "uuid" }`

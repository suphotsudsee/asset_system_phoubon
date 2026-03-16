# API Documentation - ระบบงานทะเบียนครุภัณฑ์

## สารบัญ
1. [ภาพรวม](#ภาพรวม)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
4. [Models](#models)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)

---

## ภาพรวม

### Base URL
```
Production: https://api.asset-system.com
Development: http://localhost:3000
```

### API Version
```
Current: v1
Base path: /api/v1
```

### Content Type
```
Content-Type: application/json
Accept: application/json
```

---

## Authentication

### JWT Token Authentication

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "email": "admin@example.com"
    }
  }
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
```

---

## Endpoints

### Health Check

#### GET /health
ตรวจสอบสถานะระบบ

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-16T08:52:00.000Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "api": "running"
  }
}
```

---

### Assets (ครุภัณฑ์)

#### GET /api/v1/assets
ดึงรายการครุภัณฑ์ทั้งหมด

**Query Parameters:**
- `page` (number): หมายเลขหน้า (default: 1)
- `limit` (number): จำนวนต่อหน้า (default: 20)
- `search` (string): ค้นหาตามรหัสหรือชื่อ
- `category` (string): กรองตามประเภท
- `status` (string): กรองตามสถานะ
- `sort` (string): เรียงลำดับ (created_at, updated_at, price)
- `order` (string): ลำดับ (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "assets": [
      {
        "id": 1,
        "asset_code": "AST-2026-00001",
        "name": "คอมพิวเตอร์ตั้งโต๊ะ",
        "category": "electronics",
        "price": 25000,
        "purchase_date": "2026-01-15",
        "status": "active",
        "location": "สำนักงาน",
        "created_at": "2026-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "total_pages": 5
    }
  }
}
```

#### GET /api/v1/assets/:id
ดึงข้อมูลครุภัณฑ์รายบุคคล

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "asset_code": "AST-2026-00001",
    "name": "คอมพิวเตอร์ตั้งโต๊ะ",
    "category": "electronics",
    "description": "คอมพิวเตอร์สำหรับงานสำนักงาน",
    "price": 25000,
    "purchase_date": "2026-01-15",
    "warranty_date": "2027-01-15",
    "status": "active",
    "location": "สำนักงาน",
    "department": "IT",
    "assigned_to": null,
    "images": [],
    "documents": [],
    "created_at": "2026-01-15T10:00:00.000Z",
    "updated_at": "2026-01-15T10:00:00.000Z"
  }
}
```

#### POST /api/v1/assets
สร้างครุภัณฑ์ใหม่

**Request:**
```json
{
  "asset_code": "AST-2026-00002",
  "name": "เครื่องพิมพ์เลเซอร์",
  "category": "electronics",
  "description": "เครื่องพิมพ์สำหรับงานเอกสาร",
  "price": 15000,
  "purchase_date": "2026-03-01",
  "warranty_date": "2027-03-01",
  "location": "สำนักงาน",
  "department": "Admin"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "asset_code": "AST-2026-00002",
    "name": "เครื่องพิมพ์เลเซอร์",
    "created_at": "2026-03-16T08:52:00.000Z"
  },
  "message": "สร้างครุภัณฑ์สำเร็จ"
}
```

#### PUT /api/v1/assets/:id
อัปเดตครุภัณฑ์

**Request:**
```json
{
  "name": "เครื่องพิมพ์เลเซอร์ HP",
  "status": "maintenance",
  "location": "ห้องเซิร์ฟเวอร์"
}
```

#### DELETE /api/v1/assets/:id
ลบครุภัณฑ์ (Soft Delete)

**Response:**
```json
{
  "success": true,
  "message": "ลบครุภัณฑ์สำเร็จ"
}
```

---

### Categories (ประเภทครุภัณฑ์)

#### GET /api/v1/categories
ดึงรายการประเภทครุภัณฑ์

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Electronics",
      "name_th": "อุปกรณ์อิเล็กทรอนิกส์",
      "code": "ELEC",
      "parent_id": null
    },
    {
      "id": 2,
      "name": "Furniture",
      "name_th": "เฟอร์นิเจอร์",
      "code": "FURN",
      "parent_id": null
    }
  ]
}
```

#### POST /api/v1/categories
สร้างประเภทใหม่

**Request:**
```json
{
  "name": "Vehicles",
  "name_th": "ยานพาหนะ",
  "code": "VEHI",
  "parent_id": null
}
```

---

### Transfers (การโอนย้าย)

#### GET /api/v1/transfers
ดึงรายการการโอนย้าย

**Query Parameters:**
- `asset_id` (number): กรองตามครุภัณฑ์
- `from_department` (string): จากหน่วยงาน
- `to_department` (string): ไปหน่วยงาน
- `status` (string): สถานะ (pending, approved, rejected)

#### POST /api/v1/transfers
สร้างการโอนย้าย

**Request:**
```json
{
  "asset_id": 1,
  "from_department_id": 1,
  "to_department_id": 2,
  "transfer_date": "2026-03-20",
  "reason": "ย้ายตามโครงการ",
  "notes": "กรุณาจัดส่งภายในสัปดาห์หน้า"
}
```

#### PUT /api/v1/transfers/:id
อัปเดตสถานะการโอนย้าย

**Request:**
```json
{
  "status": "approved",
  "approved_by": 1,
  "approved_at": "2026-03-18"
}
```

---

### Maintenances (การซ่อมบำรุง)

#### GET /api/v1/maintenances
ดึงรายการการซ่อมบำรุง

#### POST /api/v1/maintenances
สร้างการซ่อมบำรุง

**Request:**
```json
{
  "asset_id": 1,
  "type": "repair",
  "title": "ซ่อมหน้าจอ",
  "description": "หน้าจอแสดงภาพไม่ชัดเจน",
  "cost": 2500,
  "vendor": "บริษัท คอมพิวเตอร์ เซอร์วิส",
  "start_date": "2026-03-17",
  "end_date": "2026-03-19"
}
```

#### PUT /api/v1/maintenances/:id
อัปเดตการซ่อมบำรุง

---

### Reports (รายงาน)

#### GET /api/v1/reports/assets-by-category
รายงานครุภัณฑ์ตามประเภท

**Query Parameters:**
- `category_id` (number): ประเภท
- `start_date` (string): วันที่เริ่มต้น
- `end_date` (string): วันที่สิ้นสุด

**Response:**
```json
{
  "success": true,
  "data": {
    "report": [
      {
        "category": "Electronics",
        "count": 50,
        "total_value": 1250000
      }
    ],
    "generated_at": "2026-03-16T08:52:00.000Z"
  }
}
```

#### GET /api/v1/reports/assets-by-status
รายงานครุภัณฑ์ตามสถานะ

#### GET /api/v1/reports/transfers
รายงานการโอนย้าย

#### GET /api/v1/reports/maintenances
รายงานการซ่อมบำรุง

#### POST /api/v1/reports/export
ส่งออกข้อมูล Excel/PDF

**Request:**
```json
{
  "report_type": "assets",
  "format": "excel",
  "filters": {
    "category": "electronics",
    "status": "active"
  }
}
```

---

### Users (ผู้ใช้)

#### GET /api/v1/users
ดึงรายการผู้ใช้ (Admin only)

#### GET /api/v1/users/:id
ดึงข้อมูลผู้ใช้

#### POST /api/v1/users
สร้างผู้ใช้ใหม่ (Admin only)

**Request:**
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123",
  "role": "officer",
  "department_id": 1
}
```

#### PUT /api/v1/users/:id
อัปเดตผู้ใช้

#### DELETE /api/v1/users/:id
ลบผู้ใช้ (Admin only)

---

### Departments (หน่วยงาน)

#### GET /api/v1/departments
ดึงรายการหน่วยงาน

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "ฝ่าย IT",
      "code": "IT",
      "parent_id": null
    },
    {
      "id": 2,
      "name": "ฝ่าย HR",
      "code": "HR",
      "parent_id": null
    }
  ]
}
```

---

## Models

### Asset Model
```json
{
  "id": "number",
  "asset_code": "string",
  "name": "string",
  "name_en": "string",
  "category_id": "number",
  "description": "string",
  "price": "number",
  "purchase_date": "date",
  "warranty_date": "date",
  "status": "string (active|maintenance|disposed|lost)",
  "location": "string",
  "department_id": "number",
  "assigned_to": "number",
  "serial_number": "string",
  "manufacturer": "string",
  "model": "string",
  "created_at": "datetime",
  "updated_at": "datetime",
  "deleted_at": "datetime|null"
}
```

### User Model
```json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "password_hash": "string",
  "role": "string (super_admin|admin|officer|viewer)",
  "department_id": "number",
  "is_active": "boolean",
  "last_login": "datetime",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

---

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "ข้อมูลไม่ถูกต้อง",
    "details": [
      {
        "field": "name",
        "message": "ชื่อครุภัณฑ์เป็นข้อมูลที่ต้องกรอก"
      }
    ]
  },
  "timestamp": "2026-03-16T08:52:00.000Z"
}
```

### HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

### Error Codes
- `VALIDATION_ERROR`: ข้อมูลไม่ถูกต้อง
- `AUTHENTICATION_ERROR`: การยืนยันตัวตนล้มเหลว
- `AUTHORIZATION_ERROR`: ไม่มีสิทธิ์
- `NOT_FOUND`: ไม่พบข้อมูล
- `DUPLICATE_ERROR`: ข้อมูลซ้ำ
- `DATABASE_ERROR`: ข้อผิดพลาดฐานข้อมูล
- `RATE_LIMIT_ERROR`: เกินจำนวนคำขอ

---

## Rate Limiting

### Limits
- **Anonymous**: 100 requests/minute
- **Authenticated**: 500 requests/minute
- **Admin**: 1000 requests/minute

### Rate Limit Headers
```
X-RateLimit-Limit: 500
X-RateLimit-Remaining: 499
X-RateLimit-Reset: 1647388800
```

### Rate Limit Response
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_ERROR",
    "message": "เกินจำนวนคำขอที่กำหนด กรุณาลองอีกครั้งใน 60 วินาที"
  },
  "retry_after": 60
}
```

---

## Webhooks

### Event Types
- `asset.created`: สร้างครุภัณฑ์ใหม่
- `asset.updated`: อัปเดตครุภัณฑ์
- `asset.deleted`: ลบครุภัณฑ์
- `transfer.created`: สร้างการโอนย้าย
- `transfer.approved`: อนุมัติการโอนย้าย
- `maintenance.created`: สร้างการซ่อมบำรุง

### Webhook Payload
```json
{
  "event": "asset.created",
  "timestamp": "2026-03-16T08:52:00.000Z",
  "data": {
    "id": 1,
    "asset_code": "AST-2026-00001",
    "name": "คอมพิวเตอร์ตั้งโต๊ะ"
  }
}
```

---

## SDK Examples

### JavaScript/Node.js
```javascript
const api = require('asset-system-api');

const client = new api.Client({
  baseUrl: 'http://localhost:3000',
  apiKey: 'your-api-key'
});

// ดึงรายการครุภัณฑ์
const assets = await client.assets.list({ page: 1, limit: 20 });

// สร้างครุภัณฑ์ใหม่
const newAsset = await client.assets.create({
  name: 'คอมพิวเตอร์',
  price: 25000,
  category: 'electronics'
});
```

### Python
```python
import requests

BASE_URL = 'http://localhost:3000'
TOKEN = 'your-jwt-token'

headers = {'Authorization': f'Bearer {TOKEN}'}

# ดึงรายการครุภัณฑ์
response = requests.get(f'{BASE_URL}/api/v1/assets', headers=headers)
assets = response.json()

# สร้างครุภัณฑ์ใหม่
data = {
    'name': 'คอมพิวเตอร์',
    'price': 25000,
    'category': 'electronics'
}
response = requests.post(f'{BASE_URL}/api/v1/assets', json=data, headers=headers)
```

---

## การทดสอบ API

### Postman Collection
นำเข้า Postman Collection จากไฟล์ `postman_collection.json` ใน repository

### cURL Examples
```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# ดึงรายการครุภัณฑ์
curl -X GET http://localhost:3000/api/v1/assets \
  -H "Authorization: Bearer <token>"

# สร้างครุภัณฑ์
curl -X POST http://localhost:3000/api/v1/assets \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"คอมพิวเตอร์","price":25000}'
```

---

## Contact

สำหรับคำถามเกี่ยวกับ API กรุณาติดต่อ:
- Email: api-support@asset-system.com
- Documentation: https://docs.asset-system.com

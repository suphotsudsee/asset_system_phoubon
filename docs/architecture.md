# Architecture Document - ระบบงานทะเบียนครุภัณฑ์

## ภาพรวมระบบ (System Overview)

ระบบงานทะเบียนครุภัณฑ์เป็นแพลตฟอร์มสำหรับจัดการสินทรัพย์ของรัฐตามระเบียบพัสดุ ออกแบบมาเพื่อรองรับ 10,000+ ครุภัณฑ์ พร้อม QR Code tracking และ AI พยากรณ์ซ่อมบำรุง

---

## 1. หลักการออกแบบ (Design Principles)

### 1.1 Agency Isolation
- ข้อมูลแยกตามหน่วยงาน (Multi-tenancy)
- แต่ละหน่วยงานเห็นข้อมูลของตัวเองเท่านั้น
- Super Admin เห็นข้อมูลทั้งหมด
- Row-level security ในฐานข้อมูล

### 1.2 Compliance
- คำนวณค่าเสื่อมตามระเบียบพัสดุ
- Audit trail ทุกการดำเนินการ
- รองรับการจัดทำรายงานตามมาตรฐานภาครัฐ

### 1.3 Scalability
- รองรับ 10,000+ assets
- แยก Database connection pool
- Caching layer สำหรับ query ที่ใช้บ่อย
- Async processing สำหรับ batch operations

### 1.4 Security
- RBAC (Role-Based Access Control)
- JWT Authentication
- Audit logging
- Data encryption at rest

---

## 2. สถาปัตยกรรมระบบ (System Architecture)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   Web    │  │  Mobile  │  │  Tablet  │  │   API    │       │
│  │   App    │  │   App    │  │   App    │  │  Clients │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway                                 │
│  - Rate Limiting  - Authentication  - Load Balancing            │
│  - Request Routing  - SSL Termination  - CORS                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend Services                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │    Auth      │  │    Asset     │  │ Transaction  │         │
│  │   Service    │  │   Service    │  │   Service    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Depreciation│  │ Maintenance  │ │   Report     │         │
│  │   Service    │  │   Service    │  │   Service    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │     AI/ML    │  │   Notification                           │
│  │   Service    │  │   Service                                │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  PostgreSQL  │  │    Redis     │  │  File Store  │         │
│  │  (Primary)   │  │   (Cache)    │  │   (S3/MinIO) │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   External Integrations                          │
│  - Government SSO  - e-GP System  - GFMIS  - Email Service      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. เทคโนโลยี (Technology Stack)

### 3.1 Backend
- **Runtime:** Node.js 20+ LTS
- **Framework:** NestJS (TypeScript)
- **ORM:** Prisma ORM
- **Database:** PostgreSQL 15+
- **Cache:** Redis
- **Message Queue:** Bull (Redis-based)
- **API Documentation:** OpenAPI 3.0 (Swagger)

### 3.2 Frontend
- **Web:** React 18+ with TypeScript
- **UI Library:** Ant Design / Material UI
- **State Management:** Zustand / Redux Toolkit
- **Build Tool:** Vite
- **Mobile:** React Native (อนาคต)

### 3.3 DevOps
- **Container:** Docker
- **Orchestration:** Kubernetes (optional)
- **CI/CD:** GitHub Actions / GitLab CI
- **Monitoring:** Prometheus + Grafana
- **Logging:** ELK Stack (Elasticsearch, Logstash, Kibana)

### 3.4 AI/ML
- **Framework:** Python + scikit-learn
- **Model Serving:** FastAPI microservice
- **Features:**
  - Predictive maintenance (Random Forest / XGBoost)
  - Failure probability calculation
  - Risk scoring algorithm

---

## 4. โครงสร้างโปรเจค (Project Structure)

```
asset_system_phoubon/
├── sql/                          # Database scripts
│   ├── schema.sql                # Main schema
│   ├── seeds.sql                 # Initial data
│   ├── migrations/               # Version migrations
│   └── functions/                # Stored procedures
│
├── backend/
│   └── app/
│       ├── main.ts               # Entry point
│       ├── app.module.ts         # Root module
│       ├── config/               # Configuration
│       │   ├── database.config.ts
│       │   ├── jwt.config.ts
│       │   └── app.config.ts
│       │
│       ├── common/               # Shared utilities
│       │   ├── decorators/
│       │   ├── filters/          # Exception filters
│       │   ├── guards/           # Auth guards
│       │   ├── interceptors/
│       │   ├── pipes/            # Validation pipes
│       │   └── middleware/
│       │
│       ├── modules/              # Feature modules
│       │   ├── auth/
│       │   │   ├── auth.module.ts
│       │   │   ├── auth.controller.ts
│       │   │   ├── auth.service.ts
│       │   │   ├── strategies/
│       │   │   └── dto/
│       │   │
│       │   ├── users/
│       │   ├── agencies/
│       │   ├── roles/
│       │   ├── assets/
│       │   ├── categories/
│       │   ├── transactions/
│       │   ├── depreciation/
│       │   ├── maintenance/
│       │   ├── qr-codes/
│       │   ├── audit/
│       │   ├── reports/
│       │   └── notifications/
│       │
│       ├── api/                  # API documentation
│       │   └── api_structure.md
│       │
│       └── middleware/           # Custom middleware
│           ├── audit.middleware.ts
│           └── agency-isolation.middleware.ts
│
├── frontend/
│   ├── src/
│   │   ├── app.tsx
│   │   ├── modules/              # Feature modules
│   │   ├── components/           # Reusable components
│   │   ├── layouts/              # Page layouts
│   │   ├── hooks/                # Custom hooks
│   │   ├── services/             # API clients
│   │   ├── stores/               # State management
│   │   └── utils/                # Utilities
│   │
│   └── public/                   # Static assets
│
├── docs/                         # Documentation
│   ├── architecture.md           # This file
│   ├── api/                      # API docs
│   ├── user-guide/               # User manuals
│   └── deployment/               # Deployment guides
│
├── scripts/                      # Automation scripts
│   ├── deploy.sh
│   ├── backup.sh
│   └── migration-runner.ts
│
└── tests/                        # Test suites
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## 5. Security Model

### 5.1 Authentication
- **Method:** JWT (JSON Web Token)
- **Access Token:** 24 hours expiry
- **Refresh Token:** 7 days expiry
- **Storage:** HttpOnly cookies (web) / Secure storage (mobile)
- **2FA:** Optional (TOTP)

### 5.2 Authorization (RBAC)

#### Role Hierarchy
```
SUPER_ADMIN (ระดับสูงสุด)
    └── AGENCY_ADMIN (ดูแลหน่วยงานของตัวเอง)
        └── MANAGER (อนุมัติธุรกรรม)
            └── OPERATOR (บันทึก/แก้ไขข้อมูล)
                └── VIEWER (ดูข้อมูลเท่านั้น)
```

#### Permission Model
```
Resource × Action = Permission
Example: ASSET × CREATE = ASSET_CREATE
```

#### Agency Isolation
```
- Users สามารถเห็นข้อมูลเฉพาะ agency_id ของตัวเอง
- Super Admin เห็นข้อมูลทุกหน่วยงาน
- Row-level security ใช้ WHERE agency_id IN (...)
```

### 5.3 Audit Trail
- **Log ทุก action:** create, update, delete, view, export, approve
- **เก็บข้อมูล:** old_values, new_values, changed_fields
- **Context:** user, ip_address, device_info, timestamp
- **Retention:** 7 ปี (ตามระเบียบ)

### 5.4 Data Protection
- **Encryption:** AES-256 สำหรับ sensitive data
- **TLS:** HTTPS ทุกการสื่อสาร
- **Backup:** Daily automated backup
- **PII:** Personal data protection compliance

---

## 6. Database Design

### 6.1 Entity Relationship
```
agencies (1) ──< (N) users
agencies (1) ──< (N) assets
agencies (1) ──< (N) asset_transactions

users (1) ──< (N) user_roles
roles (1) ──< (N) user_roles
roles (1) ──< (N) role_permissions
permissions (1) ──< (N) role_permissions

asset_categories (1) ──< (N) assets
assets (1) ──< (N) asset_transactions
assets (1) ──< (N) depreciation_logs
assets (1) ──< (N) maintenance_logs
assets (1) ──< (1) qr_codes

depreciation_rates (N) ──> (1) asset_categories
```

### 6.2 Key Design Decisions

#### Soft Delete
- ใช้ `deleted_at` timestamp สำหรับทุกตารางหลัก
- Query ใช้ `WHERE deleted_at IS NULL`
- รองรับ data recovery

#### UUID Primary Keys
- ป้องกัน ID enumeration attacks
- Distributed system friendly
- ใช้ `uuid_generate_v4()`

#### JSONB Fields
- `specifications`: ข้อมูลจำเพาะที่ต่างกันตามประเภท
- `images`, `attachments`: metadata ไฟล์
- `extra_data`: future-proof

#### Indexing Strategy
- B-tree สำหรับ equality searches
- GIN สำหรับ JSONB queries
- Partial indexes สำหรับ soft delete
- Composite indexes สำหรับ common filters

---

## 7. API Design

### 7.1 RESTful Principles
- Resource-based URLs
- HTTP methods สำหรับ actions
- Stateless authentication
- HATEOAS (optional)

### 7.2 Versioning
- URL versioning: `/api/v1/`
- Backward compatibility guaranteed
- Deprecation policy: 6 months notice

### 7.3 Pagination
```
GET /assets?page=1&limit=20
Response: {
  data: [...],
  pagination: {
    page: 1,
    limit: 20,
    total: 150,
    total_pages: 8
  }
}
```

### 7.4 Filtering & Sorting
```
GET /assets?status=active&category_id=uuid&sort=-created_at
Operators: =, !=, >, <, >=, <=, like, in
```

### 7.5 Bulk Operations
- `POST /assets/batch-import` - Excel/CSV upload
- `POST /assets/batch-export` - Download filtered data
- `POST /depreciation/calculate` - Batch calculation

---

## 8. Depreciation Calculation

### 8.1 วิธีการคำนวณ (ตามระเบียบพัสดุ)

#### Straight-Line Method (วิธีเส้นตรง)
```
ค่าเสื่อมราคาต่อปี = (ราคาทุน - ค่าซาก) × อัตราค่าเสื่อม
หรือ
ค่าเสื่อมราคาต่อปี = ราคาทุน / อายุการใช้งาน
```

#### ตัวอย่างอัตราค่าเสื่อม (ตามระเบียบ)
| ประเภท | อายุการใช้งาน | อัตราค่าเสื่อม |
|--------|--------------|---------------|
| อาคารถาวร | 50 ปี | 2% |
| อาคารชั่วคราว | 10 ปี | 10% |
| รถยนต์ | 8 ปี | 12.5% |
| คอมพิวเตอร์ | 5 ปี | 20% |
| Laptop | 3 ปี | 33.33% |

### 8.2 Calculation Flow
```
1. ดึง assets ที่ถึงรอบคำนวณ
2. อ่าน depreciation_rate จาก config
3. คำนวณ: depreciation_expense = acquisition_cost × rate
4. อัพเดต: accumulated_depreciation += expense
5. คำนวณ: net_book_value = acquisition_cost - accumulated_depreciation
6. สร้าง depreciation_log record
7. (optional) Post to General Ledger
```

### 8.3 Depreciation Schedule
- **Monthly:** สำหรับรายงานภายใน
- **Quarterly:** สำหรับตรวจสอบ
- **Yearly:** สำหรับงบการเงิน

---

## 9. Maintenance & AI Predictions

### 9.1 Maintenance Types
- **Preventive:** ตามกำหนดเวลา
- **Corrective:** เมื่อเสียหาย
- **Predictive:** ตาม AI พยากรณ์

### 9.2 AI Model Features
```python
Features:
- asset_age_days
- maintenance_history_count
- days_since_last_maintenance
- usage_intensity (ถ้ามี sensor)
- category_risk_baseline
- seasonal_factors
- cost_of_previous_repairs

Target:
- failure_probability (0-1)
- predicted_failure_date
- risk_score (0-100)
```

### 9.3 Risk Scoring
```
risk_score = (
  failure_probability × 50 +
  asset_value_factor × 20 +
  criticality_factor × 30
)

Thresholds:
- 0-30: Low risk (green)
- 31-60: Medium risk (yellow)
- 61-80: High risk (orange)
- 81-100: Critical risk (red)
```

### 9.4 Integration Flow
```
Backend → HTTP → AI Service → Prediction Result
           (FastAPI)           (JSON response)
```

---

## 10. QR Code System

### 10.1 QR Code Content
```json
{
  "asset_id": "uuid",
  "asset_code": "AST-2026-00001",
  "asset_name": "คอมพิวเตอร์ PC",
  "category": "คอมพิวเตอร์",
  "agency": "กรม XXX",
  "url": "https://system.gov.th/assets/uuid"
}
```

### 10.2 Scan Workflow
```
1. User สแกน QR ด้วย mobile app
2. App ส่ง scan_data ไปยัง API
3. Backend บันทึก scan_log
4. แสดงข้อมูลครุภัณฑ์
5. (optional) อัพเดตสถานะการตรวจสอบ
```

### 10.3 Use Cases
- **Physical Check:** ตรวจสอบครุภัณฑ์ประจำปี
- **Transfer:** โอนย้ายครุภัณฑ์
- **Maintenance:** รายงานปัญหา
- **Audit:** ผู้ตรวจสอบเข้าถึงข้อมูล

---

## 11. Reporting & Analytics

### 11.1 Standard Reports
1. **ทะเบียนครุภัณฑ์** - รายการครุภัณฑ์ทั้งหมด
2. **สรุปค่าเสื่อมราคา** - ตามหมวด/หน่วยงาน
3. **รายงานการโอนย้าย** - ธุรกรรมในรอบปี
4. **รายงานการจำหน่าย** - ครุภัณฑ์ที่จำหน่าย
5. **รายงานซ่อมบำรุง** - Cost & frequency
6. **รายงานการตรวจสอบ** - Physical check result

### 11.2 Dashboard Metrics
```
- Total assets count & value
- Net book value
- Depreciation YTD
- Pending transactions
- Upcoming maintenance
- High-risk assets
- Physical check compliance %
```

### 11.3 Export Formats
- **Excel (.xlsx)** - สำหรับแก้ไขต่อ
- **PDF** - สำหรับพิมพ์/ส่ง
- **CSV** - สำหรับระบบอื่น

---

## 12. Performance Considerations

### 12.1 Database Optimization
- Connection pooling (PgBouncer)
- Read replicas สำหรับ report queries
- Materialized views สำหรับ dashboard
- Query optimization (EXPLAIN ANALYZE)

### 12.2 Caching Strategy
```
Redis Cache:
- User sessions: 24h
- Agency tree: 1h
- Asset categories: 1h
- Dashboard stats: 5m
- Expensive reports: 1h
```

### 12.3 Async Processing
```
Bull Queue Jobs:
- Batch import processing
- Depreciation calculation
- Report generation
- Email notifications
- AI model inference
```

### 12.4 Scalability Targets
- **Concurrent users:** 500+
- **Assets:** 10,000+
- **Transactions/year:** 50,000+
- **API response time:** < 200ms (p95)

---

## 13. Deployment Architecture

### 13.1 Production Setup
```
┌─────────────────────────────────────────┐
│           Load Balancer (Nginx)          │
└─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   ┌────────┐ ┌────────┐ ┌────────┐
   │  App   │ │  App   │ │  App   │
   │ Server │ │ Server │ │ Server │
   │  :3000 │ │ :3001  │ │ :3002  │
   └────────┘ └────────┘ └────────┘
        │           │           │
        └───────────┼───────────┘
                    ▼
           ┌────────────────┐
           │   PostgreSQL   │
           │   (Primary)    │
           └────────────────┘
                    │
           ┌────────────────┐
           │     Redis      │
           │   (Cache+Queue)│
           └────────────────┘
```

### 13.2 Environment Variables
```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
JWT_SECRET=your-secret-key
APP_PORT=3000
NODE_ENV=production
AGENCY_ISOLATION_ENABLED=true
AI_SERVICE_URL=http://ai-service:8000
```

### 13.3 Backup Strategy
- **Database:** Daily dump + WAL archiving
- **Files:** S3 versioning
- **Retention:** 7 ปี
- **Recovery Point:** < 24 hours
- **Recovery Time:** < 4 hours

---

## 14. Compliance & Regulations

### 14.1 Government Standards
- ระเบียบสำนักนายกรัฐมนตรีว่าด้วยพัสดุ
- มาตรฐานระบบสารสนเทศภาครัฐ
- PDPA (Personal Data Protection)

### 14.2 Audit Requirements
- ทุก transaction ต้องมี approval trail
- ค่าเสื่อมต้องคำนวณตามระเบียบ
- รายงานต้อง generate ตาม fiscal year
- ข้อมูลต้องเก็บรักษา 7 ปี

### 14.3 Security Compliance
- OWASP Top 10 compliance
- Penetration testing annually
- Vulnerability scanning monthly
- Security audit yearly

---

## 15. Future Enhancements

### Phase 2
- Mobile app (React Native)
- Barcode scanning (fallback สำหรับ QR เสียหาย)
- Integration with e-GP system
- GFMIS integration

### Phase 3
- IoT sensor integration (สำหรับเครื่องจักรสำคัญ)
- Advanced AI predictions (Deep Learning)
- Multi-language support
- Advanced analytics (Power BI integration)

### Phase 4
- Blockchain สำหรับ audit trail (optional)
- AR visualization สำหรับ asset location
- Voice commands สำหรับ warehouse operations

---

## 16. Conclusion

ระบบงานทะเบียนครุภัณฑ์ออกแบบมาเพื่อ:
1. **ความสอดคล้องกับระเบียบ** - คำนวณค่าเสื่อมตามมาตรฐานภาครัฐ
2. **ความปลอดภัย** - RBAC + Audit trail + Agency isolation
3. **ประสิทธิภาพ** - รองรับ 10,000+ assets ด้วย response time < 200ms
4. **นวัตกรรม** - AI พยากรณ์ซ่อมบำรุง + QR tracking
5. **ขยายได้** - Modular architecture สำหรับ future enhancements

---

**Document Version:** 1.0  
**Last Updated:** 2026-03-16  
**Author:** Phase 1 Analysis & Design Team

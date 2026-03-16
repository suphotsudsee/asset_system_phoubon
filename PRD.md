# 🏛️ ระบบงานทะเบียนครุภัณฑ์ - Asset Management System

## ภาพรวมโปรเจกต์

ระบบจัดการครุภัณฑ์ครบวงจร สำหรับหน่วยงานภาครัฐ พร้อมคำนวณค่าเสื่อมราคาตามระเบียบพัสดุ

---

## 📋 ฟีเจอร์หลัก

### 1. การจัดการครุภัณฑ์
- ทะเบียนครุภัณฑ์ (Asset Registry)
- การจัดหา/จัดซื้อ (Procurement)
- การโอนย้าย (Transfer)
- การจำหน่าย/ลบจำหน่าย (Disposal)

### 2. ค่าเสื่อมราคา
- คำนวณอัตโนมัติตามระเบียบพัสดุ
- หลายวิธี: เส้นตรง, ลด余额
- รายงานค่าเสื่อมรายเดือน/รายปี

### 3. QR Code System
- ติด QR Code บนครุภัณฑ์
- สแกนเพื่อดูประวัติ
- ติดตามสถานะ

### 4. Smart Alert (AI)
- พยากรณ์การซ่อมบำรุง
- แจ้งเตือนครุภัณฑ์ใกล้หมดอายุ
- แนะนำการทดแทน

### 5. การเข้าถึงข้ามหน่วยงาน
- Role-based Access Control
- แบ่งตามหน่วยงาน/กรม
- Audit Log

---

## 🎯 ข้อกำหนด (Requirements)

### Functional Requirements

| ID | ข้อกำหนด | Priority |
|----|----------|----------|
| FR-001 | เพิ่ม/แก้ไข/ลบ ครุภัณฑ์ | High |
| FR-002 | คำนวณค่าเสื่อมราคาอัตโนมัติ | High |
| FR-003 | สร้าง QR Code | High |
| FR-004 | รายงานค่าเสื่อมรายเดือน | High |
| FR-005 | แจ้งเตือนซ่อมบำรุง (AI) | Medium |
| FR-006 | ประวัติการซ่อมบำรุง | Medium |
| FR-007 | การโอนย้ายระหว่างหน่วยงาน | Medium |
| FR-008 | การจำหน่ายครุภัณฑ์ | Medium |
| FR-009 | Dashboard สรุปสถานะ | High |
| FR-010 | Export Excel/PDF | Medium |

### Non-Functional Requirements

| ID | ข้อกำหนด | Target |
|----|----------|--------|
| NFR-001 | Performance | < 2s response time |
| NFR-002 | Scalability | 10,000+ assets |
| NFR-003 | Security | RBAC + Audit Log |
| NFR-004 | Availability | 99.9% uptime |
| NFR-005 | Compliance | ระเบียบพัสดุ |

---

## 🏗️ สถาปัตยกรรมระบบ

```
┌─────────────────────────────────────────────────┐
│                Frontend (React)                 │
│  - Dashboard, Asset Mgmt, Reports, QR Scanner   │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│             Backend (FastAPI + AI)              │
│  - REST API, Depreciation Engine, Smart Alert   │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│              Database (MySQL)                   │
│  - Assets, Transactions, Depreciation, Users    │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│            External Services                    │
│  - QR Code Generator, Storage, Email, Line      │
└─────────────────────────────────────────────────┘
```

---

## 📊 Database Schema (หลัก)

### Tables

| Table | Description |
|-------|-------------|
| `assets` | ครุภัณฑ์หลัก |
| `asset_categories` | ประเภทครุภัณฑ์ |
| `asset_transactions` | ธุรกรรม (เพิ่ม, โอน, จำหน่าย) |
| `depreciation_rates` | อัตราค่าเสื่อม |
| `depreciation_logs` | บันทึกค่าเสื่อม |
| `maintenance_logs` | ประวัติซ่อมบำรุง |
| `qr_codes` | QR Code mapping |
| `users` | ผู้ใช้ |
| `roles` | บทบาท |
| `permissions` | สิทธิ์ |
| `audit_logs` | Audit trail |

---

## 🔐 Security & RBAC

### Roles

| Role | Description |
|------|-------------|
| Super Admin | ดูแลระบบทั้งหมด |
| Agency Admin | ดูแลหน่วยงาน |
| Asset Manager | จัดการครุภัณฑ์ |
| Viewer | ดูข้อมูลเท่านั้น |

### Permissions

| Permission | Super Admin | Agency Admin | Asset Manager | Viewer |
|------------|-------------|--------------|---------------|--------|
| Create Asset | ✅ | ✅ (own agency) | ✅ (own agency) | ❌ |
| Edit Asset | ✅ | ✅ (own agency) | ✅ (own agency) | ❌ |
| Delete Asset | ✅ | ❌ | ❌ | ❌ |
| Transfer Asset | ✅ | ✅ (own agency) | ✅ (own agency) | ❌ |
| Dispose Asset | ✅ | ✅ (own agency) | ❌ | ❌ |
| View Reports | ✅ | ✅ | ✅ | ✅ |
| Manage Users | ✅ | ✅ (own agency) | ❌ | ❌ |

---

## 🚀 Tech Stack

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **Database:** MySQL 8.0+
- **ORM:** SQLAlchemy
- **Auth:** JWT + OAuth2
- **AI:** scikit-learn (prediction)

### Frontend
- **Framework:** React 18 + TypeScript
- **UI:** TailwindCSS + shadcn/ui
- **State:** Zustand + React Query
- **QR:** react-qr-reader

### DevOps
- **Container:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Cloud:** AWS/Azure/GCP (optional)
- **Monitoring:** Prometheus + Grafana

---

## 📁 Project Structure

```
asset_system_phoubon/
├── backend/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   ├── core/         # Config, security
│   │   └── ai/           # ML models
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Pages
│   │   ├── hooks/        # Custom hooks
│   │   ├── stores/       # Zustand stores
│   │   └── utils/        # Utilities
│   ├── package.json
│   └── Dockerfile
├── docs/
│   ├── user-manual.md    # คู่มือผู้ใช้
│   └── technical-manual.md # คู่มือติดตั้ง
├── sql/
│   ├── schema.sql        # Database schema
│   └── seed.sql          # Sample data
├── docker-compose.yml
├── README.md
└── PRD.md               # This file
```

---

## 📅 Timeline (23 Agents)

| Phase | Duration | Agents Involved |
|-------|----------|-----------------|
| **Phase 1: Analysis & Design** | 2 days | researcher, product-manager, system-architect, sql-dba |
| **Phase 2: Development** | 5 days | backend-engineer, frontend-engineer, coder, ai-engineer |
| **Phase 3: Quality & Security** | 2 days | qa-reviewer, security-reviewer, test-case-designer |
| **Phase 4: Deployment** | 1 day | devops-engineer, doc-writer, release-manager |

**Total:** 10 days

---

## ✅ Definition of Done

- [ ] ทุกฟีเจอร์ทำงานได้
- [ ] ทดสอบครบ 100% use cases
- [ ] Security audit ผ่าน
- [ ] Performance < 2s
- [ ] คู่มือครบถ้วน
- [ ] Deploy ได้จริง

---

**สร้างโดย:** Team Director (👔)  
**วันที่:** 16 มีนาคม 2026  
**Version:** 1.0
# คู่มือผู้ดูแลระบบ - ระบบงานทะเบียนครุภัณฑ์

## สารบัญ
1. [ภาพรวมระบบ](#ภาพรวมระบบ)
2. [การติดตั้งและกำหนดค่า](#การติดตั้งและกำหนดค่า)
3. [การจัดการผู้ใช้](#การจัดการผู้ใช้)
4. [การสำรองข้อมูล](#การสำรองข้อมูล)
5. [การตรวจสอบและ Monitoring](#การตรวจสอบและ-monitoring)
6. [การแก้ไขปัญหา](#การแก้ไขปัญหา)
7. [ความปลอดภัย](#ความปลอดภัย)

---

## ภาพรวมระบบ

### สถาปัตยกรรม
ระบบประกอบด้วย:
- **Backend API**: Node.js + Express
- **Frontend**: React/Vue.js
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)

### ส่วนประกอบ Docker
```
- asset_db (PostgreSQL)
- asset_backend (Node.js API)
- asset_frontend (Nginx)
- asset_redis (Redis)
- asset_prometheus (Monitoring)
- asset_grafana (Dashboard)
- asset_elasticsearch (Logging)
- asset_logstash (Log Processing)
- asset_kibana (Log Visualization)
```

---

## การติดตั้งและกำหนดค่า

### ข้อกำหนดระบบ
- CPU: 4 cores ขึ้นไป
- RAM: 8GB ขึ้นไป
- Disk: 50GB ขึ้นไป
- OS: Linux (Ubuntu 20.04+) หรือ Windows Server

### การติดตั้งด้วย Docker
```bash
# Clone repository
git clone https://github.com/your-org/asset_system_phoubon.git
cd asset_system_phoubon

# กำหนดค่า environment
cp .env.example .env
# แก้ไขค่าใน .env ให้เหมาะสม

# เริ่มระบบ
docker-compose up -d

# ตรวจสอบสถานะ
docker-compose ps

# ดู logs
docker-compose logs -f
```

### การกำหนดค่า Environment
ไฟล์ `.env` มีพารามิเตอร์สำคัญ:
```
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@db:5432/asset_registry
JWT_SECRET=your-secret-key
REDIS_URL=redis://redis:6379
PORT=3000
```

---

## การจัดการผู้ใช้

### การเพิ่มผู้ใช้ใหม่
1. เข้าสู่ระบบด้วยบัญชี Admin
2. ไปที่เมนู "ตั้งค่า" > "จัดการผู้ใช้"
3. คลิก "เพิ่มผู้ใช้ใหม่"
4. กรอกข้อมูล:
   - ชื่อผู้ใช้
   - อีเมล
   - รหัสผ่าน
   - บทบาท (Role)
5. คลิก "บันทึก"

### บทบาทผู้ใช้ (Roles)
- **Super Admin**: เข้าถึงทุกฟังก์ชัน รวมถึงการตั้งค่าระบบ
- **Admin**: จัดการครุภัณฑ์และผู้ใช้
- **Officer**: บันทึกและแก้ไขครุภัณฑ์
- **Viewer**: ดูข้อมูลเท่านั้น

### การรีเซ็ตรหัสผ่าน
```sql
-- รีเซ็ตรหัสผ่านในฐานข้อมูล
UPDATE users 
SET password_hash = '$2b$10$...' 
WHERE username = 'target_user';
```

---

## การสำรองข้อมูล

### สำรองฐานข้อมูล
```bash
# สำรองข้อมูล PostgreSQL
docker exec asset_db pg_dump -U assetuser asset_registry > backup_$(date +%Y%m%d).sql

# คืนค่าข้อมูล
docker exec -i asset_db psql -U assetuser asset_registry < backup_20260316.sql
```

### สำรองไฟล์ config
```bash
tar -czf config_backup_$(date +%Y%m%d).tar.gz \
  docker-compose.yml \
  .env \
  monitoring/
```

### ตั้งค่าการสำรองข้อมูลอัตโนมัติ (Cron)
```bash
# เพิ่มใน crontab
0 2 * * * /path/to/backup-script.sh
```

---

## การตรวจสอบและ Monitoring

### การเข้าถึง Dashboard
- **Grafana**: http://localhost:3001 (admin/admin123)
- **Kibana**: http://localhost:5601
- **Prometheus**: http://localhost:9090

### Metrics ที่ตรวจสอบ
- API Response Time
- Database Connection Pool
- Memory Usage
- CPU Usage
- Request Rate
- Error Rate

### การตั้งค่า Alert
1. เข้า Grafana
2. ไปที่ Alerting > Alert rules
3. สร้าง rule ใหม่
4. กำหนดเงื่อนไขและ threshold
5. ตั้งค่า notification channel

---

## การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

#### Backend ไม่เริ่มต้น
```bash
# ตรวจสอบ logs
docker-compose logs backend

# รีสตาร์ท service
docker-compose restart backend

# ตรวจสอบ database connection
docker exec asset_backend ping db
```

#### Database Connection Error
```bash
# ตรวจสอบ database status
docker-compose ps db

# ดู database logs
docker-compose logs db

# รีสตาร์ท database
docker-compose restart db
```

#### Frontend ไม่โหลด
```bash
# ตรวจสอบ frontend logs
docker-compose logs frontend

# เคลียร์ browser cache
# หรือ rebuild frontend
docker-compose build frontend
docker-compose up -d frontend
```

### คำสั่งที่มีประโยชน์
```bash
# ดูสถานะทั้งหมด
docker-compose ps

# ดู logs ทุก service
docker-compose logs -f

# รีสตาร์ททั้งหมด
docker-compose restart

# หยุดทั้งหมด
docker-compose down

# เริ่มทั้งหมด
docker-compose up -d

# ดู resource usage
docker stats
```

---

## ความปลอดภัย

### การตั้งค่าความปลอดภัย
1. เปลี่ยน default passwords ทั้งหมด
2. ใช้ HTTPS ใน production
3. จำกัดการเข้าถึง ports
4. Enable firewall
5. Update dependencies เป็นประจำ

### การจัดการ Secrets
- ใช้ Docker secrets หรือ environment variables
- ไม่ commit .env file
- Rotate JWT_SECRET เป็นประจำ

### การ Audit Logs
- ตรวจสอบ access logs เป็นประจำ
- ตั้งค่า alert สำหรับ suspicious activities
- สำรอง logs ไว้วิเคราะห์

---

## การอัปเดตระบบ

### อัปเดตจาก Git
```bash
git pull origin main
docker-compose build
docker-compose up -d
```

### อัปเดต Docker Images
```bash
docker-compose pull
docker-compose up -d
```

### Rollback
```bash
# กลับไป version ก่อนหน้า
git checkout <previous-tag>
docker-compose up -d
```

---

## ติดต่อทีมพัฒนา

สำหรับปัญหาทางเทคนิค กรุณาติดต่อ:
- ทีมพัฒนา: dev-team@asset-system.com
- เอกสารเพิ่มเติม: https://github.com/your-org/asset_system_phoubon

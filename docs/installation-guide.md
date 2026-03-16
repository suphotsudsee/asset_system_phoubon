# คู่มือติดตั้ง - ระบบงานทะเบียนครุภัณฑ์

## สารบัญ
1. [ข้อกำหนดระบบ](#ข้อกำหนดระบบ)
2. [การเตรียมความพร้อม](#การเตรียมความพร้อม)
3. [การติดตั้งบน Linux](#การติดตั้งบน-linux)
4. [การติดตั้งบน Windows](#การติดตั้งบน-windows)
5. [การติดตั้งบน Production Server](#การติดตั้งบน-production-server)
6. [การตรวจสอบหลังติดตั้ง](#การตรวจสอบหลังติดตั้ง)
7. [การตั้งค่าเพิ่มเติม](#การตั้งค่าเพิ่มเติม)

---

## ข้อกำหนดระบบ

### Hardware Requirements
| ส่วนประกอบ | Minimum | Recommended |
|------------|---------|-------------|
| CPU | 2 cores | 4 cores |
| RAM | 4 GB | 8 GB |
| Disk | 20 GB | 50 GB SSD |
| Network | 100 Mbps | 1 Gbps |

### Software Requirements
- Docker 20.10+
- Docker Compose 2.0+
- Git
- Node.js 20.x (สำหรับ development)
- PostgreSQL 15 (ถ้าไม่ใช้ Docker)

---

## การเตรียมความพร้อม

### 1. ติดตั้ง Docker
**Ubuntu/Debian:**
```bash
# อัปเดต package
sudo apt update

# ติดตั้ง Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# เพิ่ม user เข้า docker group
sudo usermod -aG docker $USER

# ตรวจสอบการติดตั้ง
docker --version
docker-compose --version
```

**Windows:**
1. ดาวน์โหลด Docker Desktop จาก https://www.docker.com/products/docker-desktop
2. ติดตั้งและรีสตาร์ทเครื่อง
3. เปิด Docker Desktop

### 2. Clone Repository
```bash
git clone https://github.com/your-org/asset_system_phoubon.git
cd asset_system_phoubon
```

### 3. เตรียม Environment File
```bash
cp .env.example .env
```

แก้ไขค่าใน `.env`:
```
# Database
POSTGRES_USER=assetuser
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=asset_registry

# Backend
NODE_ENV=production
JWT_SECRET=your-jwt-secret-min-32-characters
PORT=3000

# Frontend
API_URL=http://your-server-ip:3000

# Monitoring
GRAFANA_ADMIN_PASSWORD=your-grafana-password
```

---

## การติดตั้งบน Linux

### ขั้นตอนการติดตั้ง
```bash
# 1. ไปที่ directory
cd /opt/asset_system_phoubon

# 2. กำหนดสิทธิ์
sudo chown -R $USER:$USER .

# 3. เริ่มต้นระบบ
docker-compose up -d

# 4. ตรวจสอบสถานะ
docker-compose ps

# 5. ดู logs
docker-compose logs -f
```

### ตั้งค่า Systemd Service (Optional)
```bash
sudo nano /etc/systemd/system/asset-system.service
```

เนื้อหา:
```ini
[Unit]
Description=Asset Management System
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/asset_system_phoubon
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable asset-system

# Start service
sudo systemctl start asset-system

# ตรวจสอบสถานะ
sudo systemctl status asset-system
```

---

## การติดตั้งบน Windows

### ขั้นตอนการติดตั้ง
1. เปิด PowerShell เป็น Administrator
2. ไปที่ directory:
```powershell
cd C:\fullstack\asset_system_phoubon
```

3. เริ่มต้นระบบ:
```powershell
docker-compose up -d
```

4. ตรวจสอบสถานะ:
```powershell
docker-compose ps
```

### สร้าง Windows Service (Optional)
ใช้ NSSM (Non-Sucking Service Manager):
```powershell
# ดาวน์โหลด NSSM
wget https://nssm.cc/release/2.24/64bit/nssm-2.24.zip
Expand-Archive nssm-2.24.zip

# ติดตั้ง service
cd nssm-2.24\win64
.\nssm.exe install AssetSystem "C:\Program Files\Docker\Docker\docker-compose.exe" "up -d"
.\nssm.exe set AssetSystem AppDirectory C:\fullstack\asset_system_phoubon
.\nssm.exe start AssetSystem
```

---

## การติดตั้งบน Production Server

### Security Hardening
```bash
# 1. เปิดเฉพาะ ports ที่จำเป็น
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# 2. ติดตั้ง SSL Certificate (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

# 3. ตั้งค่า Firewall
sudo ufw allow 'Nginx Full'
sudo ufw delete allow 'Nginx HTTP'
```

### Production Docker Compose
สร้างไฟล์ `docker-compose.prod.yml`:
```yaml
version: '3.8'

services:
  backend:
    environment:
      NODE_ENV: production
      # Production settings
    restart: always
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
  
  frontend:
    restart: always
  
  db:
    restart: always
    volumes:
      - /var/lib/postgresql/data:/var/lib/postgresql/data
```

```bash
# เริ่มด้วย production config
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## การตรวจสอบหลังติดตั้ง

### ตรวจสอบ Services
```bash
# ดูสถานะทั้งหมด
docker-compose ps

# Expected output:
# NAME                    STATUS         PORTS
# asset_backend           Up (healthy)   0.0.0.0:3000->3000/tcp
# asset_frontend          Up (healthy)   0.0.0.0:80->80/tcp
# asset_db                Up (healthy)   0.0.0.0:5432->5432/tcp
# asset_redis             Up (healthy)   0.0.0.0:6379->6379/tcp
```

### ตรวจสอบ Health Endpoints
```bash
# Backend health
curl http://localhost:3000/health

# Frontend
curl http://localhost:80/

# Database
docker exec asset_db pg_isready
```

### ตรวจสอบ Logs
```bash
# ดู logs ทั้งหมด
docker-compose logs

# ดู logs เฉพาะ service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
```

---

## การตั้งค่าเพิ่มเติม

### การตั้งค่า Email (SMTP)
แก้ไข `.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_SECURE=false
```

### การตั้งค่า Backup อัตโนมัติ
สร้างสคริปต์ `scripts/backup.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec asset_db pg_dump -U assetuser asset_registry > /backups/backup_$DATE.sql
find /backups -name "backup_*.sql" -mtime +7 -delete
```

```bash
# ทำให้ executable
chmod +x scripts/backup.sh

# ตั้งค่า cron
crontab -e
# เพิ่ม: 0 2 * * * /opt/asset_system_phoubon/scripts/backup.sh
```

### การตั้งค่า Monitoring Alerts
1. เข้า Grafana: http://localhost:3001
2. ไปที่ Alerting > Contact points
3. เพิ่ม Email/Slack/Webhook
4. สร้าง Alert rules

---

## การทดสอบการติดตั้ง

### Test Script
```bash
#!/bin/bash
echo "Testing Asset Management System..."

# Test Backend
echo -n "Backend API: "
curl -s http://localhost:3000/health > /dev/null && echo "OK" || echo "FAILED"

# Test Frontend
echo -n "Frontend: "
curl -s http://localhost:80/ > /dev/null && echo "OK" || echo "FAILED"

# Test Database
echo -n "Database: "
docker exec asset_db pg_isready > /dev/null && echo "OK" || echo "FAILED"

# Test Redis
echo -n "Redis: "
docker exec asset_redis redis-cli ping > /dev/null && echo "OK" || echo "FAILED"

echo "All tests completed!"
```

---

## ปัญหาที่พบบ่อย

### Port Already in Use
```bash
# หา process ที่ใช้ port
sudo lsof -i :3000
sudo lsof -i :80

# หยุด process
sudo kill -9 <PID>
```

### Permission Denied
```bash
# แก้ไข ownership
sudo chown -R $USER:$USER .

# แก้ไข permissions
chmod -R 755 .
```

### Docker Network Issues
```bash
# รีเซ็ต network
docker-compose down
docker network prune
docker-compose up -d
```

---

## สรุป

หลังติดตั้งเสร็จ ระบบจะเข้าถึงได้ที่:
- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:3000
- **Grafana**: http://localhost:3001
- **Kibana**: http://localhost:5601

สำหรับการใช้งานใน production ควร:
1. เปลี่ยน default passwords ทั้งหมด
2. ตั้งค่า HTTPS
3. ตั้งค่า backup อัตโนมัติ
4. ตั้งค่า monitoring alerts
5. จำกัดการเข้าถึงด้วย firewall

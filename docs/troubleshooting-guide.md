# Troubleshooting Guide - ระบบงานทะเบียนครุภัณฑ์

## สารบัญ
1. [การแก้ไขปัญหาทั่วไป](#การแก้ไขปัญหาทั่วไป)
2. [Database Issues](#database-issues)
3. [Backend Issues](#backend-issues)
4. [Frontend Issues](#frontend-issues)
5. [Docker Issues](#docker-issues)
6. [Network Issues](#network-issues)
7. [Performance Issues](#performance-issues)
8. [Security Issues](#security-issues)

---

## การแก้ไขปัญหาทั่วไป

### ระบบไม่เริ่มต้น
**อาการ**: `docker-compose up -d` ไม่ทำงาน

**แก้ไข:**
```bash
# ตรวจสอบ logs
docker-compose logs

# ตรวจสอบ syntax
docker-compose config

# รีสตาร์ท
docker-compose down
docker-compose up -d

# ตรวจสอบ resource
docker stats
df -h
free -m
```

### Service ไม่ตอบสนอง
**อาการ**: Service ขึ้น "Up" แต่ไม่สามารถเข้าถึงได้

**แก้ไข:**
```bash
# ตรวจสอบ health status
docker-compose ps

# ตรวจสอบ logs
docker-compose logs <service-name>

# ตรวจสอบ port mapping
docker port <container-name>

# ตรวจสอบ network
docker network inspect asset_network
```

---

## Database Issues

### Connection Refused
**อาการ**: `ECONNREFUSED` หรือ `connection refused`

**สาเหตุและแก้ไข:**

1. **Database ไม่ทำงาน**
```bash
# ตรวจสอบสถานะ
docker-compose ps db

# ดู logs
docker-compose logs db

# รีสตาร์ท
docker-compose restart db
```

2. **Wrong credentials**
```bash
# ตรวจสอบ environment
docker-compose exec db env | grep POSTGRES

# แก้ไขใน .env และรีสตาร์ท
docker-compose down
docker-compose up -d
```

3. **Port conflict**
```bash
# หา process ที่ใช้ port
netstat -tulpn | grep 5432

# เปลี่ยน port ใน docker-compose.yml
ports:
  - "5433:5432"  # เปลี่ยนจาก 5432 เป็น 5433
```

### Database Slow
**อาการ**: Query ช้า, timeout

**แก้ไข:**
```sql
-- หา slow queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
ORDER BY duration DESC;

-- Kill long-running query
SELECT pg_terminate_backend(pid);

-- Analyze tables
ANALYZE;

-- Vacuum
VACUUM;
```

**Optimize configuration:**
```yaml
# ใน docker-compose.yml
db:
  command: >
    postgres
    -c shared_buffers=256MB
    -c effective_cache_size=768MB
    -c work_mem=16MB
    -c maintenance_work_mem=64MB
```

### Database Full
**อาการ**: `disk full`, `no space left on device`

**แก้ไข:**
```bash
# ตรวจสอบ disk usage
df -h
docker system df

# ลบ unused data
docker system prune -a

# ลบ old logs
docker-compose logs --tail=100 db > db_logs.txt
> /var/lib/docker/volumes/postgres_data/_data/pg_log/*

# เพิ่ม disk space
# หรือย้าย data ไป disk อื่น
```

### Migration Failed
**อาการ**: `migration failed`, `relation does not exist`

**แก้ไข:**
```bash
# ตรวจสอบ migration status
docker-compose exec backend npm run db:status

# Rollback
docker-compose exec backend npm run db:rollback

# Fix migration file
# แล้ว run ใหม่
docker-compose exec backend npm run db:migrate

# Force reset (LAST RESORT)
docker-compose exec backend npm run db:reset
```

---

## Backend Issues

### Server Not Starting
**อาการ**: `Cannot find module`, `SyntaxError`

**แก้ไข:**
```bash
# เข้า container
docker-compose exec backend sh

# ตรวจสอบ files
ls -la

# ตรวจสอบ dependencies
npm ls

# Reinstall
rm -rf node_modules package-lock.json
npm install

# Build
npm run build

# ตรวจสอบ logs
docker-compose logs backend
```

### Memory Leak
**อาการ**: Memory usage เพิ่มขึ้นเรื่อยๆ

**แก้ไข:**
```bash
# ตรวจสอบ memory usage
docker stats backend

# Restart service
docker-compose restart backend

# ตรวจสอบ code
# หา memory leak ใน event listeners, closures

# เพิ่ม resource limits
deploy:
  resources:
    limits:
      memory: 512M
```

### High CPU Usage
**อาการ**: CPU usage > 90%

**แก้ไข:**
```bash
# หา process ที่ใช้ CPU
docker top backend

# ตรวจสอบ logs
docker-compose logs backend --tail=1000

# Optimize code
# - ลด loop ที่ไม่จำเป็น
# - ใช้ caching
# - เพิ่ม connection pooling

# เพิ่ม CPU limits
deploy:
  resources:
    limits:
      cpus: '1'
```

### API Timeout
**อาการ**: `ETIMEDOUT`, `504 Gateway Timeout`

**แก้ไข:**
```javascript
// เพิ่ม timeout ใน config
requestTimeout: 30000
connectionTimeout: 10000

// ใน docker-compose.yml
backend:
  environment:
    REQUEST_TIMEOUT: 30000
    CONNECTION_TIMEOUT: 10000
```

**Optimize queries:**
```sql
-- เพิ่ม index
CREATE INDEX idx_asset_code ON assets(asset_code);
CREATE INDEX idx_status ON assets(status);

-- ตรวจสอบ query plan
EXPLAIN ANALYZE SELECT * FROM assets WHERE status = 'active';
```

---

## Frontend Issues

### Page Not Loading
**อาการ**: Blank page, 404, 500

**แก้ไข:**
```bash
# ตรวจสอบ logs
docker-compose logs frontend

# ตรวจสอบ build
docker-compose exec frontend ls -la /usr/share/nginx/html

# Rebuild
docker-compose build frontend
docker-compose up -d frontend

# ตรวจสอบ nginx config
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf
```

### CORS Error
**อาการ**: `Access-Control-Allow-Origin` error

**แก้ไข:**
```javascript
// ใน backend config
app.use(cors({
  origin: ['http://localhost', 'https://asset-system.com'],
  credentials: true
}));
```

### Assets Not Loading
**อาการ**: CSS/JS ไม่โหลด, 404

**แก้ไข:**
```bash
# ตรวจสอบ build
docker-compose exec frontend ls -la /usr/share/nginx/html/assets

# Rebuild
docker-compose build frontend
docker-compose up -d frontend

# ตรวจสอบ nginx config
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## Docker Issues

### Container Exits Immediately
**อาการ**: Container status "Exited"

**แก้ไข:**
```bash
# ตรวจสอบ logs
docker logs <container-name>

# ตรวจสอบ exit code
docker inspect <container-name> | grep ExitCode

# ตรวจสอบ command
docker inspect <container-name> | grep Cmd

# รันแบบ interactive
docker-compose run --rm backend sh
```

### Volume Permission Denied
**อาการ**: `Permission denied`, `EACCES`

**แก้ไข:**
```bash
# แก้ไข ownership
sudo chown -R 1000:1000 /path/to/volume

# หรือใช้ user ใน Dockerfile
USER node

# หรือ mount ด้วย correct permissions
volumes:
  - ./data:/var/lib/postgresql/data:Z
```

### Network Not Working
**อาการ**: Containers ไม่สื่อสารกัน

**แก้ไข:**
```bash
# ตรวจสอบ network
docker network ls
docker network inspect asset_network

# สร้าง network ใหม่
docker-compose down
docker network rm asset_network
docker-compose up -d

# ตรวจสอบ DNS resolution
docker-compose exec backend ping db
```

### Image Pull Failed
**อาการ**: `image not found`, `pull access denied`

**แก้ไข:**
```bash
# ตรวจสอบ image name
docker images

# Login to registry
docker login ghcr.io

# Pull manually
docker pull ghcr.io/org/backend:v1.0.0

# หรือ build locally
docker-compose build
```

---

## Network Issues

### Port Already in Use
**อาการ**: `bind: address already in use`

**แก้ไข:**
```bash
# หา process
sudo lsof -i :3000
sudo netstat -tulpn | grep 3000

# Kill process
sudo kill -9 <PID>

# หรือเปลี่ยน port
ports:
  - "3001:3000"  # เปลี่ยน host port
```

### DNS Resolution Failed
**อาการ**: `getaddrinfo ENOTFOUND`

**แก้ไข:**
```bash
# ตรวจสอบ /etc/hosts
cat /etc/hosts

# ตรวจสอบ DNS
docker-compose exec backend nslookup db

# ใช้ container name แทน hostname
# ใน docker-compose ใช้ service name เป็น hostname
```

### Firewall Blocking
**อาการ**: Connection timeout, refused

**แก้ไข:**
```bash
# ตรวจสอบ firewall
sudo ufw status

# เปิด port
sudo ufw allow 3000/tcp
sudo ufw allow 5432/tcp

# หรือปิด firewall ชั่วคราว
sudo ufw disable
sudo ufw enable
```

---

## Performance Issues

### Slow Response Time
**อาการ**: Response time > 1s

**แก้ไข:**
```bash
# ตรวจสอบ slow logs
docker-compose logs backend | grep "slow"

# ตรวจสอบ database
docker-compose exec db tail -f /var/log/postgresql/postgresql.log

# Enable caching
# ใน backend config
cache:
  enabled: true
  ttl: 3600

# เพิ่ม connection pool
pool:
  min: 2
  max: 10
```

**Optimize:**
```sql
-- ตรวจสอบ slow queries
SELECT query, total_time, calls
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- เพิ่ม index
CREATE INDEX CONCURRENTLY idx_name ON table(column);

-- Analyze
ANALYZE VERBOSE;
```

### High Memory Usage
**อาการ**: Memory > 80%

**แก้ไข:**
```bash
# ตรวจสอบ memory usage
docker stats

# ตรวจสอบ memory leak
docker-compose top backend

# เพิ่ม swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# หรือเพิ่ม RAM ให้ server
```

### High Disk I/O
**อาการ**: iowait > 20%

**แก้ไข:**
```bash
# ตรวจสอบ I/O
iostat -x 1

# หา process ที่ใช้ I/O
iotop

# ใช้ SSD
# หรือย้าย data ไป disk อื่น
```

---

## Security Issues

### Authentication Failed
**อาการ**: `Invalid credentials`, `401 Unauthorized`

**แก้ไข:**
```bash
# ตรวจสอบ JWT secret
docker-compose exec backend env | grep JWT

# Reset password
docker-compose exec backend node scripts/reset-password.js admin

# หรือใน database
UPDATE users 
SET password_hash = '$2b$10$...' 
WHERE username = 'admin';
```

### SSL Certificate Expired
**อาการ**: `CERT_HAS_EXPIRED`, `unable to verify`

**แก้ไข:**
```bash
# ตรวจสอบ certificate
openssl x509 -in /etc/ssl/certs/cert.pem -text -noout

# Renew certificate
sudo certbot renew

# หรือ generate ใหม่
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout key.pem -out cert.pem
```

### Vulnerability Detected
**อาการ**: Security scan พบ vulnerability

**แก้ไข:**
```bash
# Scan images
docker scout cves asset_system_phoubon_backend

# Update base image
FROM node:20-alpine  # ใช้ version ล่าสุด

# Update dependencies
npm audit fix
npm update

# หรือ rebuild
docker-compose build --no-cache
```

---

## Diagnostic Commands

### Useful Commands
```bash
# ดูสถานะทั้งหมด
docker-compose ps -a

# ดู logs
docker-compose logs -f --tail=100

# ดู resource usage
docker stats

# เข้า container
docker-compose exec backend sh

# ตรวจสอบ network
docker network inspect asset_network

# ตรวจสอบ volumes
docker volume ls

# Cleanup
docker system prune -a

# Export logs
docker-compose logs > all_logs.txt 2>&1
```

### Health Check Script
```bash
#!/bin/bash

echo "=== System Health Check ==="

# Check services
echo -n "Backend: "
curl -s http://localhost:3000/health > /dev/null && echo "OK" || echo "FAILED"

echo -n "Frontend: "
curl -s http://localhost:80/ > /dev/null && echo "OK" || echo "FAILED"

echo -n "Database: "
docker-compose exec -T db pg_isready > /dev/null && echo "OK" || echo "FAILED"

echo -n "Redis: "
docker-compose exec -T redis redis-cli ping > /dev/null && echo "OK" || echo "FAILED"

# Check resources
echo ""
echo "=== Resource Usage ==="
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Check disk
echo ""
echo "=== Disk Usage ==="
df -h

echo ""
echo "Health check completed!"
```

---

## Escalation Path

### Level 1: Self-Help
- ตรวจสอบ logs
- รีสตาร์ท service
- รัน diagnostic scripts

### Level 2: Team Support
- ติดต่อทีมพัฒนา
- เปิด issue ใน GitHub
- ตรวจสอบ documentation

### Level 3: Vendor Support
- ติดต่อ vendor support
- เปิด support ticket
- Escalate to engineering

### Contact Information
- **DevOps Team**: devops@asset-system.com
- **On-Call**: oncall@asset-system.com (24/7)
- **Emergency**: +66-XXX-XXX-XXXX

---

## Prevention

### Best Practices
1. **Monitor proactively** - ตั้งค่า alerts
2. **Backup regularly** - สำรองข้อมูลทุกวัน
3. **Update regularly** - อัปเดต dependencies
4. **Test thoroughly** - ทดสอบก่อน deploy
5. **Document everything** - บันทึกปัญหาและวิธีแก้
6. **Automate** - ใช้ automation scripts
7. **Review** - ตรวจสอบ logs เป็นประจำ
8. **Train** - อบรมทีมสนับสนุน

---

## Resources

### Documentation
- API Docs: https://docs.asset-system.com/api
- Admin Manual: https://docs.asset-system.com/admin
- Deployment Guide: https://docs.asset-system.com/deploy

### Tools
- Postman Collection: https://github.com/org/asset_system_phoubon.postman_collection
- Monitoring Dashboard: http://localhost:3001
- Log Viewer: http://localhost:5601

### Community
- GitHub Issues: https://github.com/org/asset_system_phoubon/issues
- Stack Overflow: [asset-management-system]
- Slack: #asset-system-support

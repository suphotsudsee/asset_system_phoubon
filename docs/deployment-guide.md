# Deployment Guide - ระบบงานทะเบียนครุภัณฑ์

## สารบัญ
1. [ภาพรวมการ Deploy](#ภาพรวมการ-deploy)
2. [Deployment Environments](#deployment-environments)
3. [Pre-Deployment Checklist](#pre-deployment-checklist)
4. [Deployment Steps](#deployment-steps)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Rollback Procedure](#rollback-procedure)
7. [Zero-Downtime Deployment](#zero-downtime-deployment)

---

## ภาพรวมการ Deploy

### Deployment Strategy
ระบบใช้ **Blue-Green Deployment** ด้วย Docker Compose เพื่อลดความเสี่ยงและ downtime

### Architecture
```
┌─────────────────────────────────────────────────────┐
│                   Load Balancer                      │
│                    (Nginx/HAProxy)                   │
└─────────────────────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
    ┌────▼────┐                    ┌────▼────┐
    │  Blue   │                    │  Green  │
    │  Stack  │                    │  Stack  │
    └────┬────┘                    └────┬────┘
         │                               │
         └───────────────┬───────────────┘
                         │
              ┌──────────▼──────────┐
              │   Shared Database    │
              │   (PostgreSQL)       │
              └─────────────────────┘
```

---

## Deployment Environments

### 1. Development
- **Purpose**: พัฒนาและทดสอบ
- **URL**: http://localhost
- **Auto-deploy**: ทุก commit
- **Data**: Mock data

### 2. Staging
- **Purpose**: ทดสอบก่อน production
- **URL**: https://staging.asset-system.com
- **Auto-deploy**: ทุก merge to develop
- **Data**: Production-like data

### 3. Production
- **Purpose**: ใช้งานจริง
- **URL**: https://asset-system.com
- **Auto-deploy**: ทุก release tag
- **Data**: Real production data

---

## Pre-Deployment Checklist

### Code Review
- [ ] Code review completed
- [ ] All tests passing
- [ ] No security vulnerabilities
- [ ] Documentation updated

### Testing
- [ ] Unit tests: >80% coverage
- [ ] Integration tests: passed
- [ ] E2E tests: passed
- [ ] Performance tests: acceptable
- [ ] Security scan: clean

### Database
- [ ] Migration scripts tested
- [ ] Rollback scripts prepared
- [ ] Backup completed
- [ ] Data validation passed

### Infrastructure
- [ ] Server resources adequate
- [ ] SSL certificates valid
- [ ] DNS configured
- [ ] Firewall rules updated

### Monitoring
- [ ] Health checks configured
- [ ] Alerts configured
- [ ] Logging enabled
- [ ] Dashboard updated

---

## Deployment Steps

### 1. Preparation
```bash
# อัปเดต code
git pull origin main

# ตรวจสอบสถานะ
git status
git log --oneline -5

# สร้าง backup
./scripts/backup.sh
```

### 2. Build
```bash
# Build Docker images
docker-compose build

# Tag images
docker tag asset_system_phoubon_backend:latest ghcr.io/org/backend:v1.0.0
docker tag asset_system_phoubon_frontend:latest ghcr.io/org/frontend:v1.0.0
```

### 3. Push Images
```bash
# Login to registry
docker login ghcr.io -u username -p token

# Push images
docker push ghcr.io/org/backend:v1.0.0
docker push ghcr.io/org/frontend:v1.0.0
```

### 4. Deploy
```bash
# หยุดระบบเดิม
docker-compose down

# เริ่มระบบใหม่
docker-compose up -d

# ตรวจสอบสถานะ
docker-compose ps
```

### 5. Run Migrations
```bash
# เข้า container
docker-compose exec backend npm run db:migrate

# ตรวจสอบ migration
docker-compose exec backend npm run db:status
```

### 6. Verify
```bash
# ตรวจสอบ health
curl http://localhost:3000/health

# ตรวจสอบ logs
docker-compose logs -f --tail=100
```

---

## Post-Deployment Verification

### Functional Tests
```bash
#!/bin/bash

echo "Running post-deployment tests..."

# Test API
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/health)
if [ "$API_RESPONSE" -eq 200 ]; then
    echo "✓ API Health Check: PASSED"
else
    echo "✗ API Health Check: FAILED"
    exit 1
fi

# Test Frontend
WEB_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80)
if [ "$WEB_RESPONSE" -eq 200 ]; then
    echo "✓ Frontend Health Check: PASSED"
else
    echo "✗ Frontend Health Check: FAILED"
    exit 1
fi

# Test Database
DB_STATUS=$(docker-compose exec -T db pg_isready 2>&1)
if [[ "$DB_STATUS" == *"accepting connections"* ]]; then
    echo "✓ Database Health Check: PASSED"
else
    echo "✗ Database Health Check: FAILED"
    exit 1
fi

echo "All post-deployment tests passed!"
```

### Monitoring Verification
- [ ] Grafana dashboard showing data
- [ ] No error spikes in logs
- [ ] Response time within SLA
- [ ] No memory leaks
- [ ] Database connections stable

### User Acceptance
- [ ] Login working
- [ ] Main features functional
- [ ] Reports generating correctly
- [ ] No UI issues

---

## Rollback Procedure

### Automatic Rollback
หาก deployment fails ระบบจะ rollback อัตโนมัติ:

```bash
#!/bin/bash

VERSION=$1
CURRENT_VERSION=$(cat .version)

echo "Rolling back from $CURRENT_VERSION to $VERSION..."

# Stop current
docker-compose down

# Checkout previous version
git checkout $VERSION

# Rebuild
docker-compose build

# Start
docker-compose up -d

# Update version file
echo $VERSION > .version

echo "Rollback completed!"
```

### Manual Rollback
```bash
# 1. หยุดระบบ
docker-compose down

# 2. กลับไป version ก่อน
git checkout <previous-tag>

# 3. Restore database
docker exec -i asset_db psql -U assetuser asset_registry < backup_20260315.sql

# 4. เริ่มระบบ
docker-compose up -d

# 5. ตรวจสอบ
docker-compose ps
```

### Rollback Decision Criteria
Rollback เมื่อ:
- Error rate > 5%
- Response time > 2s
- Critical feature broken
- Data corruption detected
- Security vulnerability found

---

## Zero-Downtime Deployment

### Blue-Green Strategy
```bash
#!/bin/bash

# Deploy to Green environment
docker-compose -f docker-compose.green.yml up -d

# Wait for health check
until $(curl --output /dev/null --silent --head --fail http://localhost:8080/health); do
    printf '.'
    sleep 5
done

# Switch traffic (update load balancer)
kubectl set image deployment/frontend frontend=ghcr.io/org/frontend:v1.0.0

# Monitor for 5 minutes
sleep 300

# If OK, tear down Blue
docker-compose -f docker-compose.blue.yml down

# If NOT OK, rollback
kubectl rollout undo deployment/frontend
```

### Canary Deployment
```bash
# Deploy new version to 10% of traffic
kubectl set image deployment/frontend frontend=ghcr.io/org/frontend:v1.0.0
kubectl patch deployment frontend -p '{"spec":{"replicas":1}}'

# Monitor metrics
for i in {1..10}; do
    ERROR_RATE=$(curl -s http://prometheus:9090/api/v1/query?query=error_rate)
    if (( $(echo "$ERROR_RATE > 0.05" | bc -l) )); then
        echo "Error rate too high, rolling back..."
        kubectl rollout undo deployment/frontend
        exit 1
    fi
    sleep 60
done

# Gradually increase traffic
kubectl patch deployment frontend -p '{"spec":{"replicas":3}}'
```

---

## Deployment Automation

### GitHub Actions Deployment
```yaml
name: Deploy to Production

on:
  release:
    types: [published]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy
        run: |
          ssh ${{ secrets.SSH_HOST }} << 'EOF'
            cd /opt/asset_system_phoubon
            git pull origin main
            docker-compose pull
            docker-compose up -d
            docker-compose exec backend npm run db:migrate
          EOF
      
      - name: Verify
        run: |
          curl -f https://asset-system.com/health || exit 1
```

### Deployment Script
```bash
#!/bin/bash
set -e

VERSION=${1:-$(git describe --tags --always)}
ENVIRONMENT=${2:-production}

echo "Deploying version $VERSION to $ENVIRONMENT"

# Pre-deployment checks
./scripts/pre-deploy-check.sh $ENVIRONMENT

# Backup
./scripts/backup.sh

# Deploy
docker-compose pull
docker-compose up -d

# Migrate
docker-compose exec -T backend npm run db:migrate

# Post-deployment tests
./scripts/post-deploy-test.sh

# Notify
./scripts/notify-deploy.sh $VERSION $ENVIRONMENT

echo "Deployment completed successfully!"
```

---

## Environment Configuration

### Development (.env.dev)
```
NODE_ENV=development
DATABASE_URL=postgresql://dev:dev@localhost:5432/asset_dev
DEBUG=true
LOG_LEVEL=debug
```

### Staging (.env.staging)
```
NODE_ENV=staging
DATABASE_URL=postgresql://staging:staging@staging-db:5432/asset_staging
DEBUG=false
LOG_LEVEL=info
```

### Production (.env.prod)
```
NODE_ENV=production
DATABASE_URL=postgresql://prod:secure-password@prod-db:5432/asset_prod
DEBUG=false
LOG_LEVEL=warn
HTTPS=true
```

---

## Performance Optimization

### Build Optimization
```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app .
CMD ["npm", "start"]
```

### Caching Strategy
```yaml
# docker-compose.yml
services:
  backend:
    environment:
      REDIS_URL: redis://redis:6379
      CACHE_TTL: 3600
  
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
```

---

## Security Considerations

### Secrets Management
```bash
# ใช้ Docker secrets
echo "my-secret" | docker secret create db_password -

# ใน docker-compose
services:
  backend:
    secrets:
      - db_password
    environment:
      DB_PASSWORD_FILE: /run/secrets/db_password
```

### Security Scanning
```bash
# Scan images
docker scout cves asset_system_phoubon_backend

# Scan code
npm audit
docker run --rm -v $(pwd):/app sonarqube sonar-scanner
```

---

## Monitoring & Observability

### Key Metrics
- **Availability**: >99.9%
- **Response Time**: <500ms (p95)
- **Error Rate**: <1%
- **Throughput**: >1000 req/s

### Dashboards
- **Grafana**: System metrics
- **Kibana**: Application logs
- **Prometheus**: Performance metrics

### Alerts
- **Critical**: Service down, data loss
- **Warning**: High error rate, slow response
- **Info**: Deployment completed, backup completed

---

## Troubleshooting

### Common Issues

#### Deployment Fails
```bash
# ตรวจสอบ logs
docker-compose logs backend

# ตรวจสอบ events
kubectl describe deployment backend

# Rollback
kubectl rollout undo deployment/backend
```

#### Database Migration Fails
```bash
# ตรวจสอบ migration status
docker-compose exec backend npm run db:status

# Rollback migration
docker-compose exec backend npm run db:rollback

# Fix และ retry
docker-compose exec backend npm run db:migrate
```

#### Performance Degradation
```bash
# ตรวจสอบ resource usage
docker stats

# ตรวจสอบ slow queries
docker-compose exec db psql -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

---

## Best Practices

1. **Always test in staging first**
2. **Automate everything**
3. **Monitor everything**
4. **Have rollback plan**
5. **Document everything**
6. **Communicate with team**
7. **Deploy during low traffic**
8. **Have on-call engineer**

---

## Contact

สำหรับคำถามเกี่ยวกับการ deploy กรุณาติดต่อ:
- DevOps Team: devops@asset-system.com
- On-Call: oncall@asset-system.com
- Documentation: https://docs.asset-system.com/deployment

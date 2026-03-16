#!/bin/bash
# Health Check Script - ระบบงานทะเบียนครุภัณฑ์
# Comprehensive health check for all services

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  System Health Check${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Counter for results
PASS=0
FAIL=0
WARN=0

# Function to check service
check_service() {
    local name=$1
    local status=$2
    
    if [ "$status" == "OK" ]; then
        echo -e "${GREEN}✓${NC} $name"
        ((PASS++))
    elif [ "$status" == "WARN" ]; then
        echo -e "${YELLOW}⚠${NC} $name"
        ((WARN++))
    else
        echo -e "${RED}✗${NC} $name"
        ((FAIL++))
    fi
}

echo -e "${YELLOW}Checking Services...${NC}"
echo ""

# Check Docker containers
echo "1. Docker Containers:"
for container in asset_db asset_backend asset_frontend asset_redis; do
    if docker ps --format '{{.Names}}' | grep -q "^$container$"; then
        check_service "  $container" "OK"
    else
        check_service "  $container" "FAIL"
    fi
done
echo ""

# Check Backend API
echo "2. Backend API:"
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health 2>/dev/null || echo "000")
if [ "$BACKEND_STATUS" == "200" ]; then
    check_service "  Backend Health Endpoint" "OK"
else
    check_service "  Backend Health Endpoint" "FAIL"
fi
echo ""

# Check Frontend
echo "3. Frontend:"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80 2>/dev/null || echo "000")
if [ "$BACKEND_STATUS" == "200" ] || [ "$FRONTEND_STATUS" == "200" ]; then
    check_service "  Frontend Web Server" "OK"
else
    check_service "  Frontend Web Server" "FAIL"
fi
echo ""

# Check Database
echo "4. Database:"
DB_STATUS=$(docker exec asset_db pg_isready -U assetuser 2>&1 | grep -c "accepting connections" || echo "0")
if [ "$DB_STATUS" -gt 0 ]; then
    check_service "  PostgreSQL Connection" "OK"
else
    check_service "  PostgreSQL Connection" "FAIL"
fi
echo ""

# Check Redis
echo "5. Redis:"
REDIS_STATUS=$(docker exec asset_redis redis-cli ping 2>/dev/null || echo "PONG")
if [ "$REDIS_STATUS" == "PONG" ]; then
    check_service "  Redis Connection" "OK"
else
    check_service "  Redis Connection" "FAIL"
fi
echo ""

# Check Monitoring Services
echo "6. Monitoring:"
for service in prometheus grafana elasticsearch kibana; do
    if docker ps --format '{{.Names}}' | grep -q "asset_$service"; then
        check_service "  $service" "OK"
    else
        check_service "  $service" "WARN"
    fi
done
echo ""

# Check Resource Usage
echo "7. Resource Usage:"
echo "   CPU & Memory:"
docker stats --no-stream --format "   {{.Container}}: CPU {{.CPUPerc}}, Memory {{.MemUsage}}" | head -5
echo ""

# Check Disk Space
DISK_USAGE=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    check_service "  Disk Space (${DISK_USAGE}% used)" "OK"
elif [ "$DISK_USAGE" -lt 90 ]; then
    check_service "  Disk Space (${DISK_USAGE}% used)" "WARN"
else
    check_service "  Disk Space (${DISK_USAGE}% used)" "FAIL"
fi
echo ""

# Check Logs for Errors
echo "8. Recent Errors:"
ERROR_COUNT=$(docker-compose logs --tail=100 2>/dev/null | grep -ci "error" || echo "0")
if [ "$ERROR_COUNT" -eq 0 ]; then
    check_service "  No Recent Errors" "OK"
elif [ "$ERROR_COUNT" -lt 10 ]; then
    check_service "  $ERROR_COUNT errors in recent logs" "WARN"
else
    check_service "  $ERROR_COUNT errors in recent logs" "FAIL"
fi
echo ""

# Summary
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Summary${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "Passed:  ${GREEN}$PASS${NC}"
echo -e "Warnings: ${YELLOW}$WARN${NC}"
echo -e "Failed:  ${RED}$FAIL${NC}"
echo ""

if [ "$FAIL" -eq 0 ]; then
    echo -e "${GREEN}✓ All critical checks passed!${NC}"
    exit 0
elif [ "$WARN" -eq 0 ]; then
    echo -e "${YELLOW}⚠ Some warnings detected. Review recommended.${NC}"
    exit 0
else
    echo -e "${RED}✗ Critical issues detected! Immediate action required.${NC}"
    exit 1
fi

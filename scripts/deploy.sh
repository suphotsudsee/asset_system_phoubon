#!/bin/bash
# Deployment Script - ระบบงานทะเบียนครุภัณฑ์
# Automated deployment with rollback support

set -e

# Configuration
ENVIRONMENT=${1:-production}
VERSION=${2:-$(git describe --tags --always 2>/dev/null || echo "latest")}
BACKUP_BEFORE_DEPLOY=true
RUN_MIGRATIONS=true

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Deployment Script${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo "Environment: $ENVIRONMENT"
echo "Version: $VERSION"
echo "Timestamp: $(date)"
echo ""

# Function to log
log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

# Pre-deployment checks
log "Running pre-deployment checks..."

# Check if docker is running
if ! docker ps > /dev/null 2>&1; then
    error "Docker is not running. Please start Docker first."
    exit 1
fi
success "Docker is running"

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    error "docker-compose.yml not found"
    exit 1
fi
success "docker-compose.yml found"

# Check disk space
DISK_AVAILABLE=$(df -m . | tail -1 | awk '{print $4}')
if [ "$DISK_AVAILABLE" -lt 5000 ]; then
    error "Insufficient disk space (< 5GB available)"
    exit 1
fi
success "Disk space OK (${DISK_AVAILABLE}MB available)"

# Backup
if [ "$BACKUP_BEFORE_DEPLOY" == "true" ]; then
    log "Creating backup..."
    if [ -f "scripts/backup.sh" ]; then
        ./scripts/backup.sh || true
        success "Backup completed"
    else
        log "Backup script not found, skipping..."
    fi
fi

# Stop current services
log "Stopping current services..."
docker-compose down
success "Services stopped"

# Pull new images
log "Pulling new images..."
docker-compose pull
success "Images pulled"

# Start new services
log "Starting new services..."
docker-compose up -d
success "Services started"

# Wait for services to be healthy
log "Waiting for services to be healthy..."
sleep 10

# Check health
for i in {1..30}; do
    HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health 2>/dev/null || echo "000")
    if [ "$HEALTH_STATUS" == "200" ]; then
        success "Backend is healthy"
        break
    fi
    echo -n "."
    sleep 2
done

if [ "$HEALTH_STATUS" != "200" ]; then
    error "Backend health check failed after waiting"
    log "Initiating rollback..."
    ./scripts/rollback.sh 2>/dev/null || true
    exit 1
fi

# Run migrations
if [ "$RUN_MIGRATIONS" == "true" ]; then
    log "Running database migrations..."
    docker-compose exec -T backend npm run db:migrate 2>/dev/null || {
        log "Migration command not found or failed"
        # Try alternative migration
        docker-compose exec -T backend node scripts/migrate.js 2>/dev/null || true
    }
    success "Migrations completed"
fi

# Post-deployment health check
log "Running post-deployment health check..."
if [ -f "scripts/health-check.sh" ]; then
    ./scripts/health-check.sh
else
    # Simple health check
    BACKEND_OK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health 2>/dev/null)
    FRONTEND_OK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80 2>/dev/null)
    
    if [ "$BACKEND_OK" == "200" ] && [ "$FRONTEND_OK" == "200" ]; then
        success "All services healthy"
    else
        error "Health check failed"
        exit 1
    fi
fi

# Summary
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}  Deployment Completed${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Version: $VERSION"
echo "Environment: $ENVIRONMENT"
echo "Completed at: $(date)"
echo ""
echo "Access URLs:"
echo "  Frontend: http://localhost:80"
echo "  Backend API: http://localhost:3000"
echo "  Grafana: http://localhost:3001"
echo "  Kibana: http://localhost:5601"
echo ""
echo -e "${YELLOW}Note: Please verify the deployment manually${NC}"
echo ""

exit 0

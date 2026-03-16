#!/bin/bash
# Rollback Script - ระบบงานทะเบียนครุภัณฑ์
# Emergency rollback to previous version

set -e

# Configuration
TARGET_VERSION=${1:-$(git describe --tags --abbrev=0 $(git rev-list --tags --skip=1 -n 1) 2>/dev/null || echo "previous")}
BACKUP_RESTORE=false

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${RED}================================${NC}"
echo -e "${RED}  Emergency Rollback${NC}"
echo -e "${RED}================================${NC}"
echo ""
echo "Target Version: $TARGET_VERSION"
echo "Timestamp: $(date)"
echo ""

# Confirm rollback
echo -e "${YELLOW}⚠ WARNING: This will rollback the system to $TARGET_VERSION${NC}"
echo -e "${YELLOW}⚠ All current changes will be lost${NC}"
echo ""
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Rollback cancelled"
    exit 0
fi

log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

# Start rollback
log "Initiating rollback to $TARGET_VERSION..."

# Stop current services
log "Stopping current services..."
docker-compose down
success "Services stopped"

# Checkout previous version
log "Checking out version $TARGET_VERSION..."
git checkout $TARGET_VERSION 2>/dev/null || {
    error "Failed to checkout $TARGET_VERSION"
    log "Continuing with rollback anyway..."
}
success "Code rolled back"

# Restore backup if available
if [ "$BACKUP_RESTORE" == "true" ]; then
    log "Restoring database from backup..."
    LATEST_BACKUP=$(ls -t backups/*.sql.gz 2>/dev/null | head -1)
    if [ -n "$LATEST_BACKUP" ]; then
        gunzip -c "$LATEST_BACKUP" | docker exec -i asset_db psql -U assetuser asset_registry
        success "Database restored from $LATEST_BACKUP"
    else
        log "No backup found, skipping database restore"
    fi
fi

# Rebuild images
log "Rebuilding images..."
docker-compose build
success "Images rebuilt"

# Start services
log "Starting services..."
docker-compose up -d
success "Services started"

# Wait for services
log "Waiting for services to start..."
sleep 10

# Health check
log "Running health check..."
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
    error "Health check failed"
    log "Rollback completed but services are not healthy"
    log "Please check logs: docker-compose logs"
    exit 1
fi

# Summary
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}  Rollback Completed${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Rolled back to: $TARGET_VERSION"
echo "Completed at: $(date)"
echo ""
echo "Please verify the system:"
echo "  1. Check frontend: http://localhost:80"
echo "  2. Check API: http://localhost:3000/health"
echo "  3. Review logs: docker-compose logs"
echo ""
echo -e "${YELLOW}⚠ Remember to investigate the issue that caused the rollback${NC}"
echo ""

exit 0

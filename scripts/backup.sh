#!/bin/bash
# Backup Script - ระบบงานทะเบียนครุภัณฑ์
# Automated backup for database and configuration

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="asset_db"
DB_USER="assetuser"
DB_NAME="asset_registry"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Starting Backup ===${NC}"
echo "Timestamp: $(date)"
echo "Backup Directory: $BACKUP_DIR"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Database backup
echo -e "${YELLOW}Backing up database...${NC}"
DB_BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sql"

docker exec $CONTAINER_NAME pg_dump -U $DB_USER $DB_NAME > "$DB_BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database backup completed: $DB_BACKUP_FILE${NC}"
    # Compress backup
    gzip "$DB_BACKUP_FILE"
    echo -e "${GREEN}✓ Database backup compressed: ${DB_BACKUP_FILE}.gz${NC}"
else
    echo -e "${RED}✗ Database backup failed${NC}"
    exit 1
fi

# Configuration backup
echo -e "${YELLOW}Backing up configuration...${NC}"
CONFIG_BACKUP_FILE="$BACKUP_DIR/config_backup_$DATE.tar.gz"

tar -czf "$CONFIG_BACKUP_FILE" \
    docker-compose.yml \
    .env \
    monitoring/ \
    scripts/ \
    2>/dev/null || true

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Configuration backup completed: $CONFIG_BACKUP_FILE${NC}"
else
    echo -e "${YELLOW}⚠ Configuration backup completed with warnings${NC}"
fi

# Logs backup (optional)
echo -e "${YELLOW}Backing up logs...${NC}"
LOGS_BACKUP_FILE="$BACKUP_DIR/logs_backup_$DATE.tar.gz"

tar -czf "$LOGS_BACKUP_FILE" \
    backend/logs/ \
    2>/dev/null || true

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Logs backup completed: $LOGS_BACKUP_FILE${NC}"
else
    echo -e "${YELLOW}⚠ No logs to backup${NC}"
fi

# Cleanup old backups
echo -e "${YELLOW}Cleaning up old backups (older than $RETENTION_DAYS days)...${NC}"
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo -e "${GREEN}✓ Cleanup completed${NC}"

# Summary
echo -e "\n${GREEN}=== Backup Summary ===${NC}"
echo "Database Backup: ${DB_BACKUP_FILE}.gz"
echo "Config Backup: $CONFIG_BACKUP_FILE"
echo "Logs Backup: $LOGS_BACKUP_FILE"
echo "Backup Location: $BACKUP_DIR"
echo "Retention Period: $RETENTION_DAYS days"

# Verify backup
echo -e "\n${YELLOW}Verifying backups...${NC}"
if [ -f "${DB_BACKUP_FILE}.gz" ]; then
    SIZE=$(ls -lh "${DB_BACKUP_FILE}.gz" | awk '{print $5}')
    echo -e "${GREEN}✓ Database backup verified (Size: $SIZE)${NC}"
fi

if [ -f "$CONFIG_BACKUP_FILE" ]; then
    SIZE=$(ls -lh "$CONFIG_BACKUP_FILE" | awk '{print $5}')
    echo -e "${GREEN}✓ Configuration backup verified (Size: $SIZE)${NC}"
fi

echo -e "\n${GREEN}=== Backup Completed Successfully ===${NC}"
echo "Completed at: $(date)"

# Exit successfully
exit 0

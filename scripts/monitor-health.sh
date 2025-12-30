#!/bin/bash

# Health Monitoring Script for RBS Backend
# Run this as a cron job every 5 minutes

LOG_FILE="/var/log/rbs-health.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] === Health Check Started ===" >> $LOG_FILE

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{print ($3/$2) * 100.0}')
echo "[$DATE] Memory Usage: ${MEMORY_USAGE}%" >> $LOG_FILE

# Check disk usage
DISK_USAGE=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')
echo "[$DATE] Disk Usage: ${DISK_USAGE}%" >> $LOG_FILE

# Check Docker containers status
POSTGRES_STATUS=$(docker inspect -f '{{.State.Status}}' rbs-postgres 2>/dev/null || echo "not_found")
BACKEND_STATUS=$(docker inspect -f '{{.State.Status}}' rbs-backend 2>/dev/null || echo "not_found")
REDIS_STATUS=$(docker inspect -f '{{.State.Status}}' rbs-redis 2>/dev/null || echo "not_found")

echo "[$DATE] Postgres Status: $POSTGRES_STATUS" >> $LOG_FILE
echo "[$DATE] Backend Status: $BACKEND_STATUS" >> $LOG_FILE
echo "[$DATE] Redis Status: $REDIS_STATUS" >> $LOG_FILE

# Check if PostgreSQL is accepting connections
if [ "$POSTGRES_STATUS" = "running" ]; then
    docker exec rbs-postgres pg_isready -U postgres > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "[$DATE] PostgreSQL: HEALTHY" >> $LOG_FILE
    else
        echo "[$DATE] PostgreSQL: UNHEALTHY - Restarting..." >> $LOG_FILE
        docker restart rbs-postgres
        sleep 10
        docker restart rbs-backend
    fi
else
    echo "[$DATE] PostgreSQL: NOT RUNNING - Starting..." >> $LOG_FILE
    cd ~/apps/rbs-travels-backend-express
    docker compose up -d postgres
    sleep 10
    docker compose up -d rbs-backend
fi

# Alert if memory usage is critical (>85%)
if (( $(echo "$MEMORY_USAGE > 85" | bc -l) )); then
    echo "[$DATE] ALERT: Critical memory usage!" >> $LOG_FILE
    # Log top memory consumers
    docker stats --no-stream >> $LOG_FILE
fi

# Alert if disk usage is critical (>85%)
if [ "$DISK_USAGE" -gt 85 ]; then
    echo "[$DATE] ALERT: Critical disk usage!" >> $LOG_FILE
fi

echo "[$DATE] === Health Check Completed ===" >> $LOG_FILE
echo "" >> $LOG_FILE

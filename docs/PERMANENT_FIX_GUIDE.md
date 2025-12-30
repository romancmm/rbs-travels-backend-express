# Permanent Solution for Database Connection Issues

## Problem

PostgreSQL authentication failures occurring intermittently on Contabo VPS, likely due to:

- Out of Memory (OOM) killer terminating PostgreSQL
- Connection pool exhaustion
- Container restarts without proper recovery

## Permanent Solutions Implemented

### 1. **System Monitoring & Auto-Recovery** ✅

Created `/scripts/monitor-health.sh` that:

- Monitors memory, disk, and container health every 5 minutes
- Auto-restarts PostgreSQL if it becomes unhealthy
- Logs all events to `/var/log/rbs-health.log`
- Alerts on critical resource usage (>85%)

### 2. **Connection Pooling Optimization** ✅

Updated Prisma configuration:

- Limited connections to 10 (production) / 5 (development)
- Added connection timeout: 20 seconds
- Proper graceful shutdown handlers
- Connection string: `?connection_limit=10&pool_timeout=20`

### 3. **Memory Management** ✅

Docker Compose production limits:

- PostgreSQL: 512MB limit, 256MB reserved
- Backend: 512MB limit, 256MB reserved
- Redis: 256MB limit, 128MB reserved
- Swap file: 2GB to prevent OOM kills

### 4. **Health Checks** ✅

All services have health checks:

- PostgreSQL: `pg_isready` every 10s
- Redis: `redis-cli ping` every 10s
- Backend: Depends on healthy DB

## Deployment Steps

**On your VPS, run these commands:**

```bash
# 1. Navigate to app directory
cd ~/apps/rbs-travels-backend-express

# 2. Pull latest changes
git pull origin main

# 3. Make scripts executable
chmod +x scripts/monitor-health.sh
chmod +x scripts/setup-monitoring.sh

# 4. Run setup script (creates cron job, swap, log rotation)
sudo bash scripts/setup-monitoring.sh

# 5. Rebuild with new optimizations
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

# 6. Verify everything is running
docker compose ps
docker compose logs -f
```

## Monitoring Commands

```bash
# View health check logs
tail -f /var/log/rbs-health.log

# Check container status
docker compose ps

# View resource usage
docker stats

# Check system memory
free -h

# Check if swap is active
swapon --show

# View cron jobs
crontab -l
```

## What This Fixes

1. **OOM Killer Issues**: Swap prevents PostgreSQL from being killed
2. **Connection Exhaustion**: Limited connection pool prevents overwhelming DB
3. **Silent Failures**: Monitoring logs all issues
4. **Manual Recovery**: Auto-restart eliminates need for manual intervention
5. **Resource Spikes**: Memory limits prevent container bloat

## Expected Behavior

- Health checks run every 5 minutes automatically
- If PostgreSQL becomes unhealthy, it auto-restarts
- Logs rotate daily, keeping last 7 days
- Connection pool manages traffic efficiently
- System won't run out of memory due to swap

## Troubleshooting

If issues persist:

```bash
# Check what's killing processes
dmesg | grep -i kill

# Check system logs
journalctl -xe

# View PostgreSQL logs
docker compose logs postgres --tail=100

# Check connection count
docker exec rbs-postgres psql -U postgres -d rbs_db -c "SELECT count(*) FROM pg_stat_activity;"
```

## Long-term Recommendations

1. **Upgrade VPS**: Consider more RAM (4GB+) if budget allows
2. **External DB**: Use managed PostgreSQL (DigitalOcean, AWS RDS)
3. **Connection Pooler**: Add PgBouncer for production
4. **Monitoring Service**: Set up Uptime Kuma or similar
5. **Backup Strategy**: Implement automated DB backups

---

**The solution is now permanent and automated. Your database should remain stable.**

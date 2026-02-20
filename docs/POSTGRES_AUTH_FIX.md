# PostgreSQL Authentication Fix Guide

## Problem

The application crashes with authentication errors after deployment because:

1. Docker volumes persist PostgreSQL data between deployments
2. When credentials change, the old password remains in the volume
3. New containers try to connect with new credentials but the database still has old ones

## Root Cause

PostgreSQL initializes credentials **only on first run** with an empty data directory. Using
external volumes (`postgres_prod_data`) means the data persists, and subsequent deployments don't
reinitialize credentials.

## Solution

### 1. Ensure Consistent Credentials

Make sure your `.env.production` file has these variables:

```bash
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=rbs_db

# Full DATABASE_URL (must match above credentials)
DATABASE_URL="postgresql://postgres:your_secure_password_here@rbs-postgres:5432/rbs_db?schema=public"
```

**Important**: The credentials in `DATABASE_URL` MUST match `POSTGRES_USER` and `POSTGRES_PASSWORD`.

### 2. On VPS - Initial Setup

When deploying for the first time or after credential changes:

```bash
cd apps/rbs-travels-backend-express

# Stop all containers
docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# Remove old postgres data (THIS DELETES ALL DATA!)
docker volume rm postgres_prod_data

# Recreate volume
docker volume create postgres_prod_data

# Deploy normally
./deploy-ci.sh
```

### 3. Using the Reset Script

If you need to change credentials on an existing deployment:

```bash
# On VPS
cd apps/rbs-travels-backend-express
./reset-postgres.sh
```

**WARNING**: This script deletes all database data!

### 4. Verify Deployment

After deployment, check if the app is working:

```bash
# Check container logs
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs rbs-backend

# Check database connection
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec rbs-backend bun prisma db pull

# Test health endpoint
curl http://localhost:4000/health
```

## GitHub Actions Deployment

The GitHub Actions workflow now uses environment variables from `.env.production`, so:

1. **Never hardcode credentials** in docker-compose files
2. **Always use** `${VARIABLE:-default}` syntax
3. **Ensure** `.env.production` exists on VPS before deployment

## Common Issues

### Issue: "Authentication failed" after deployment

**Solution**: Database credentials in `.env.production` don't match the ones in the postgres volume.

```bash
./reset-postgres.sh  # Warning: Deletes all data
```

### Issue: Container keeps restarting

**Solution**: Check logs for database connection errors

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs rbs-backend
```

### Issue: Migration fails

**Solution**: Ensure DATABASE_URL is correct and database is accessible

```bash
# Test connection
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec postgres psql -U postgres -d rbs_db -c "SELECT 1;"
```

## Best Practices

1. **Keep credentials consistent** across `.env.production`
2. **Use strong passwords** in production (not "postgres123")
3. **Backup database** before running reset script
4. **Document credentials** securely (password manager)
5. **Test locally** before deploying to production

## Backup & Restore

### Backup Database

```bash
# On VPS
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec postgres pg_dump -U postgres rbs_db > backup.sql
```

### Restore Database

```bash
# On VPS
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T postgres psql -U postgres rbs_db < backup.sql
```

## Emergency Recovery

If production is down:

1. **Quick fix** (if you know old password):

   ```bash
   # Update .env.production with OLD credentials
   ./deploy-ci.sh
   ```

2. **Full reset** (if data can be lost):

   ```bash
   ./reset-postgres.sh
   # Re-seed database if needed
   ```

3. **Restore from backup**:
   ```bash
   ./reset-postgres.sh
   # Restore backup.sql
   docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T postgres psql -U postgres rbs_db < backup.sql
   ```

## Files Modified

- `docker-compose.yml` - Now uses environment variables
- `docker-compose.prod.yml` - Now uses environment variables
- `Dockerfile` - Added connection validation in entrypoint
- `deploy-ci.sh` - Added warnings about volume management
- `reset-postgres.sh` - New script for credential reset

## Testing Changes Locally

Before deploying to VPS:

```bash
# Test with docker-compose.prod.yml
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
docker compose -f docker-compose.yml -f docker-compose.prod.yml up
```

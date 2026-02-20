# PostgreSQL Authentication Fix - Summary

## What Was Fixed

✅ **Fixed credential management in Docker Compose**

- Changed hardcoded credentials to environment variables
- Now reads from `.env.production` consistently
- Both `docker-compose.yml` and `docker-compose.prod.yml` updated

✅ **Enhanced Docker entrypoint**

- Added database connection validation before migrations
- Better error messages for connection failures
- Prevents app from starting with bad credentials

✅ **Created helper scripts**

- `diagnose.sh` - Quick diagnostics for troubleshooting
- `reset-postgres.sh` - Safe database credential reset
- Updated `deploy-ci.sh` with warnings

✅ **Added comprehensive documentation**

- `docs/POSTGRES_AUTH_FIX.md` - Complete troubleshooting guide
- Updated `README.md` with deployment troubleshooting section

## Why This Happened

The issue occurred because:

1. **PostgreSQL volumes persist data** - External volumes keep data between deployments
2. **Credentials initialized once** - PostgreSQL only sets password on first startup
3. **Hardcoded mismatches** - Different credentials in different compose files
4. **No validation** - App tried to connect without checking credentials first

## The Solution

### For Your VPS Right Now

1. **SSH into your VPS**

   ```bash
   ssh user@your-vps-ip
   cd apps/rbs-travels-backend-express
   ```

2. **Run diagnostics**

   ```bash
   ./diagnose.sh
   ```

3. **Fix the credentials mismatch**

   **Option A: If you can afford to lose data**

   ```bash
   ./reset-postgres.sh
   ```

   **Option B: If you need to keep data**

   ```bash
   # Update .env.production with the CURRENT working password
   # Then redeploy
   ./deploy-ci.sh
   ```

### For Future Deployments

Just ensure your `.env.production` has:

```bash
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=rbs_db
DATABASE_URL="postgresql://postgres:your_secure_password@rbs-postgres:5432/rbs_db?schema=public"
```

The system now automatically uses these credentials consistently.

## What Changed in Files

### Modified Files:

1. **docker-compose.yml** - Uses env vars instead of hardcoded values
2. **docker-compose.prod.yml** - Uses env vars instead of hardcoded values
3. **Dockerfile** - Enhanced entrypoint with connection validation
4. **deploy-ci.sh** - Added warnings about volume management

### New Files:

1. **diagnose.sh** - Troubleshooting tool
2. **reset-postgres.sh** - Credential reset tool
3. **docs/POSTGRES_AUTH_FIX.md** - Complete guide

## Quick Commands Reference

```bash
# Diagnose issues
./diagnose.sh

# Deploy normally
./deploy-ci.sh

# Reset database credentials (DELETES DATA!)
./reset-postgres.sh

# Check logs
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs rbs-backend

# Check postgres
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs postgres

# Manual connection test
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec postgres psql -U postgres -d rbs_db
```

## Next Steps

1. **On VPS**: Run `git pull` to get these changes
2. **Fix current issue**: Run `./diagnose.sh` then `./reset-postgres.sh` if needed
3. **Test deployment**: Verify everything works
4. **Update GitHub Actions**: Changes will automatically deploy on next push to `stage` branch

## Prevention

To avoid this in the future:

1. ✅ Always use same credentials in `.env.production`
2. ✅ Never hardcode credentials in Docker Compose files
3. ✅ Run `./diagnose.sh` if issues occur
4. ✅ Backup database before major changes
5. ✅ Test locally before deploying to production

## Support

If you still face issues:

1. Run `./diagnose.sh` and share the output
2. Check logs: `docker compose logs rbs-backend`
3. Verify `.env.production` credentials match
4. Review full guide: `docs/POSTGRES_AUTH_FIX.md`

#!/bin/bash

# Diagnostic script for PostgreSQL connection issues

echo "=== RBS Backend Diagnostics ==="
echo ""

# Check if .env.production exists
echo "1. Checking .env.production file..."
if [ -f .env.production ]; then
    echo "   ✓ .env.production exists"
    
    # Extract DATABASE_URL (mask password)
    if grep -q "DATABASE_URL" .env.production; then
        echo "   ✓ DATABASE_URL found in .env.production"
        DATABASE_URL=$(grep "DATABASE_URL" .env.production | cut -d '=' -f2-)
        MASKED_URL=$(echo "$DATABASE_URL" | sed -E 's/(:[^:@]*@)/:*****@/')
        echo "   URL: $MASKED_URL"
    else
        echo "   ✗ DATABASE_URL not found in .env.production"
    fi
    
    # Check individual postgres vars
    echo ""
    echo "   PostgreSQL Environment Variables:"
    grep -E "POSTGRES_USER|POSTGRES_PASSWORD|POSTGRES_DB" .env.production | sed 's/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=*****/' || echo "   ✗ Missing POSTGRES_ variables"
else
    echo "   ✗ .env.production NOT FOUND"
fi

echo ""
echo "2. Checking Docker containers..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

echo ""
echo "3. Checking PostgreSQL container..."
if docker ps | grep -q rbs-postgres; then
    echo "   ✓ PostgreSQL container is running"
    
    echo ""
    echo "4. Testing PostgreSQL connection..."
    if docker compose -f docker-compose.yml -f docker-compose.prod.yml exec postgres pg_isready -U postgres 2>/dev/null; then
        echo "   ✓ PostgreSQL is accepting connections"
    else
        echo "   ✗ PostgreSQL is not ready"
    fi
else
    echo "   ✗ PostgreSQL container is NOT running"
fi

echo ""
echo "5. Checking backend container..."
if docker ps | grep -q rbs-backend; then
    echo "   ✓ Backend container is running"
    
    echo ""
    echo "6. Recent backend logs (last 20 lines):"
    docker compose -f docker-compose.yml -f docker-compose.prod.yml logs --tail=20 rbs-backend
else
    echo "   ✗ Backend container is NOT running"
    echo ""
    echo "6. Last exit logs:"
    docker compose -f docker-compose.yml -f docker-compose.prod.yml logs --tail=30 rbs-backend
fi

echo ""
echo "7. Checking volumes..."
docker volume ls | grep -E "postgres_prod_data|redis_prod_data"

echo ""
echo "=== Diagnostics Complete ==="
echo ""
echo "Common fixes:"
echo "1. If authentication fails: ./reset-postgres.sh (WARNING: Deletes data)"
echo "2. If container won't start: docker compose -f docker-compose.yml -f docker-compose.prod.yml logs"
echo "3. If credentials mismatch: Check .env.production matches DATABASE_URL"

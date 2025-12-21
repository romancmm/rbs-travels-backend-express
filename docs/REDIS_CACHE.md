# Redis Cache Implementation

## Overview

This project implements Redis caching for all public API routes to reduce database load and improve
response times.

## Features

- **Automatic Caching**: All GET requests on public routes are automatically cached for 5 minutes
- **Cache Invalidation**: Cache is automatically invalidated when resources are created, updated, or
  deleted
- **Fail-Safe**: If Redis is unavailable, the app continues to work without caching
- **Docker Integration**: Redis runs as a Docker service alongside PostgreSQL

## Architecture

### Components

1. **Redis Configuration** (`src/config/redis.config.ts`)

   - Redis client initialization and connection management
   - Automatic reconnection on errors
   - Graceful shutdown handling

2. **Cache Service** (`src/services/cache.service.ts`)

   - `get<T>(key)`: Retrieve cached data
   - `set(key, value, ttl)`: Store data with TTL (default: 5 minutes)
   - `delete(key)`: Remove specific cache entry
   - `invalidatePattern(pattern)`: Clear all keys matching pattern (e.g., `public:/articles*`)
   - `generateKey(prefix, path, query)`: Generate cache keys from request data

3. **Cache Middleware** (`src/middlewares/cache.middleware.ts`)
   - Applied to all public routes
   - Automatically caches successful (200) GET responses
   - Logs cache hits/misses for debugging

### Cache Keys

Cache keys follow this pattern:

```
{prefix}:{path}:{queryString}
```

Examples:

- `public:/articles/posts`
- `public:/articles/posts:{"page":1,"perPage":10}`
- `public:/menus`
- `public:/pages/slug/home`

## Cache Invalidation

When resources are mutated (create/update/delete), cache patterns are invalidated:

| Resource       | Mutation Operations             | Invalidates Pattern |
| -------------- | ------------------------------- | ------------------- |
| Articles/Posts | create, update, delete          | `public:/articles*` |
| Categories     | create, update, delete          | `public:/articles*` |
| Pages          | create, update, delete          | `public:/page*`     |
| Page Builder   | create, update, delete, publish | `public:/pages*`    |
| Menus          | create, update, delete          | `public:/menus*`    |
| Menu Items     | create, update, delete          | `public:/menus*`    |
| Services       | create, update, delete          | `public:/services*` |
| Projects       | create, update, delete          | `public:/projects*` |
| Settings       | create, update, delete          | `public:/settings*` |

## Usage

### Starting Redis

**Development:**

```bash
bun run docker:dev:up
```

**Production:**

```bash
bun run docker:prod:up
```

### Environment Variables

Add to your `.env` file:

```bash
REDIS_URL=redis://localhost:6379        # For local development
# or
REDIS_URL=redis://redis:6379            # For Docker (container name)
```

### Testing Cache

1. Make a GET request to any public endpoint (first request will be a cache miss):

```bash
curl http://localhost:4000/api/v1/articles/posts
# Console: ❌ Cache MISS: public:/articles/posts
```

2. Make the same request again (should be a cache hit):

```bash
curl http://localhost:4000/api/v1/articles/posts
# Console: ✅ Cache HIT: public:/articles/posts
```

3. Create/update/delete a resource via admin endpoint
4. Make the GET request again (cache miss because it was invalidated)

## Admin Routes

Admin routes (`/api/v1/admin/*`) are **not cached** - they always fetch fresh data from the
database.

## Monitoring

Redis logs are visible in the application console:

- ✅ Redis connected successfully
- ✅ Redis is ready to accept commands
- ❌ Redis connection error: (with details)
- 🗑️ Invalidated X cache keys matching: pattern

## Performance Benefits

- **Reduced Database Load**: Cached responses don't hit the database
- **Faster Response Times**: Redis returns data in <1ms vs database queries (10-100ms)
- **Scalability**: Can handle more concurrent users with less database pressure

## Troubleshooting

### Redis Connection Failed

Check if Redis container is running:

```bash
docker ps | grep rbs-redis
```

Restart Redis:

```bash
docker compose -f docker-compose.dev.yml restart redis
```

### Cache Not Working

Check console logs for cache hit/miss indicators. If you don't see any:

1. Verify middleware is applied to public routes
2. Check REDIS_URL environment variable
3. Ensure Redis container is accessible on the configured port

### Clear All Cache

Connect to Redis and flush:

```bash
docker exec -it rbs-redis redis-cli
> FLUSHDB
> OK
```

Or use the CacheService programmatically:

```typescript
import CacheService from '@/services/cache.service'
await CacheService.clear()
```

## Future Enhancements

- [ ] Add Redis Cluster support for high availability
- [ ] Implement cache warming on application start
- [ ] Add cache statistics/metrics endpoint
- [ ] Implement per-endpoint TTL configuration
- [ ] Add Redis Sentinel for automatic failover

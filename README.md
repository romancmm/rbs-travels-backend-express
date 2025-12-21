# Travel Agency Backend (Express.js, Bun, MVC)

## Overview

This backend is built with Express.js (TypeScript) and follows a professional MVC pattern inspired
by Laravel/Next.js. Bun is used for package management and scripts. Swagger UI is integrated for API
documentation.

**Key Features:**

- 🚀 MVC Architecture with service layer separation
- 📦 Prisma ORM for database management
- 🔐 JWT-based authentication
- 📝 Comprehensive API documentation with Swagger
- ⚡ Redis caching for optimized performance
- 🐳 Docker containerization for easy deployment

## Folder Structure

- `src/controllers/` — Route handlers and business logic
- `src/models/` — Data models and ORM definitions
- `src/services/` — Service classes for business logic
- `src/routes/` — Route definitions
- `src/views/` — View templates (if needed)
- `src/middlewares/` — Custom middleware functions
- `src/config/` — Configuration files (env, db, redis, etc.)
- `docs/` — API documentation and Swagger files

## Setup Steps

1. Install dependencies: `bun install`
2. Start Docker services (PostgreSQL & Redis): `bun run docker:dev:up`
3. Set up environment variables (copy `.env.production` to `.env`)
4. Run database migrations: `bun run db:migrate`
5. Start development server: `bun run dev`
6. Access Swagger UI at `http://localhost:4000/docs`

## Redis Caching

This project implements Redis caching for all public API routes to reduce database load and improve
response times.

- **Automatic Caching**: All GET requests on public routes are cached for 5 minutes
- **Cache Invalidation**: Cache is automatically invalidated on create/update/delete operations
- **Fail-Safe**: Application continues to work if Redis is unavailable

See [docs/REDIS_CACHE.md](docs/REDIS_CACHE.md) for detailed information.

## Best Practices

- Use controllers for request handling, keep logic in services
- Models should only handle data and validation
- Use middlewares for authentication, logging, etc.
- Document all endpoints in Swagger
- Admin routes are cache-less, public routes are cached

## Docker Commands

```bash
# Development
bun run docker:dev:up        # Start PostgreSQL & Redis
bun run docker:dev:down      # Stop services
bun run docker:dev:logs      # View logs

# Production
bun run docker:prod:up       # Start production services
bun run docker:prod:down     # Stop production services
```

## Next Steps

- Implement models, controllers, and services for travel agency features
- Add authentication and user management
- Expand API documentation in `docs/`

---

Refer to this README for setup and usage instructions.

# rbs-travels-backend

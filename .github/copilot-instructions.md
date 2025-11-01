# Copilot Instructions for Travel Agency Backend (Express.js, MVC)

## Project Overview

This project is a full-stack travel agency website backend built with Express.js
(Node.js/TypeScript). The backend follows a professional MVC pattern inspired by Laravel and
Next.js, with clear separation of concerns. Swagger UI is integrated for API documentation.

## Folder Structure

- `src/controllers/` — Route handlers and business logic
- `src/models/` — Data models and ORM definitions
- `src/services/` — Service classes for business logic
- `src/routes/` — Route definitions
- `src/views/` — View templates (if needed)
- `src/middlewares/` — Custom middleware functions
- `src/config/` — Configuration files (env, db, etc.)
- `docs/` — API documentation and Swagger files
- `.github/` — Copilot instructions and workflow files

## Setup Steps

1. Install dependencies: `bun install`
2. Start development server: `bun run dev`
3. Access Swagger UI at `/docs` endpoint

## Best Practices

- Use controllers for request handling, keep logic in services
- Models should only handle data and validation
- Use middlewares for authentication, logging, etc.
- Document all endpoints in Swagger

## Next Steps

- Implement models, controllers, and services for travel agency features
- Add authentication and user management
- Expand API documentation in `docs/`

---

Refer to README.md for more details and usage instructions.

# make it a model not feature

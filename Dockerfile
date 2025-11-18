# Production Dockerfile for rbs Backend
FROM oven/bun:latest

WORKDIR /app

# Copy package files and install dependencies (including devDependencies for build)
COPY package.json bun.lock ./
RUN bun install

# Copy source code and build
COPY . .

# Generate Prisma client and build application
# Set a placeholder DATABASE_URL for build time only
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public"
RUN bun run db:generate && bun run build
ENV DATABASE_URL=""

# Create entrypoint script
RUN echo '#!/bin/sh\necho "Running database migrations..."\nbun prisma migrate deploy\necho "Starting application..."\nexec "$@"' > /entrypoint.sh && \
    chmod +x /entrypoint.sh

# Create uploads directory with proper permissions
RUN mkdir -p files && chown -R bun:bun files

# Switch to non-root user for security
USER bun

# Set entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Expose application port
EXPOSE 4000

# Start the production application
CMD ["bun", "run", "start:prod"]
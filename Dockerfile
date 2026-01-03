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
 
# Create entrypoint script with database connection check
RUN echo '#!/bin/sh\n\
echo "Waiting for database to be ready..."\n\
max_attempts=30\n\
attempt=0\n\
until bun prisma db push --accept-data-loss --skip-generate 2>&1 | grep -q "datasource" || [ $attempt -eq $max_attempts ]; do\n\
  attempt=$((attempt + 1))\n\
  echo "Database connection attempt $attempt/$max_attempts..."\n\
  sleep 2\n\
done\n\
\n\
if [ $attempt -eq $max_attempts ]; then\n\
  echo "ERROR: Could not connect to database after $max_attempts attempts"\n\
  echo "Please check your DATABASE_URL and database credentials"\n\
  exit 1\n\
fi\n\
\n\
echo "Database connection successful!"\n\
echo "Running database migrations..."\n\
bun prisma migrate deploy\n\
\n\
if [ $? -ne 0 ]; then\n\
  echo "ERROR: Migration failed. Check your database credentials."\n\
  exit 1\n\
fi\n\
\n\
echo "Starting application..."\n\
exec "$@"' > /entrypoint.sh && \
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
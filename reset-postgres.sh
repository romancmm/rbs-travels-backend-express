#!/bin/bash

# Define color codes
RED="\033[0;31m"
YELLOW="\033[0;33m"
GREEN="\033[0;32m"
RESET="\033[0m"

echo -e "${RED}======================================${RESET}"
echo -e "${RED}   POSTGRES CREDENTIALS RESET        ${RESET}"
echo -e "${RED}======================================${RESET}"
echo -e "${YELLOW}This will DELETE all PostgreSQL data!${RESET}"
echo -e "${YELLOW}Press Ctrl+C to cancel...${RESET}"
sleep 5

# Stop all containers
echo -e "${YELLOW}Stopping containers...${RESET}"
docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# Remove postgres volume
echo -e "${RED}Removing postgres volume...${RESET}"
docker volume rm postgres_prod_data

# Recreate volume
echo -e "${GREEN}Creating fresh postgres volume...${RESET}"
docker volume create postgres_prod_data

# Start containers
echo -e "${GREEN}Starting containers with new credentials...${RESET}"
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Wait for postgres to be ready
echo -e "${YELLOW}Waiting for postgres to be ready...${RESET}"
sleep 10

# Run migrations
echo -e "${GREEN}Running database migrations...${RESET}"
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec rbs-backend bun prisma migrate deploy

echo -e "${GREEN}======================================${RESET}"
echo -e "${GREEN}   Postgres reset completed!         ${RESET}"
echo -e "${GREEN}======================================${RESET}"

#!/bin/bash

# Define color codes for better output
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
RESET="\033[0m"

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}Error: .env.production file not found!${RESET}"
    echo -e "${YELLOW}Please create the .env.production file with your database credentials.${RESET}"
    exit 1
fi
 
# Load environment variables from .env.production
export $(grep -v '^#' .env.production | xargs)

# Display banner
echo -e "${BLUE}======================================${RESET}"
echo -e "${BLUE}   RBS CI/CD Deployment     ${RESET}"
echo -e "${BLUE}======================================${RESET}"

# Create external volumes if they don't exist
echo -e "${YELLOW}Checking and creating external volumes if needed...${RESET}"
docker volume inspect postgres_prod_data >/dev/null 2>&1 || docker volume create postgres_prod_data
docker volume inspect redis_prod_data >/dev/null 2>&1 || docker volume create redis_prod_data
echo -e "${GREEN}External volumes are ready.${RESET}"

# Important: If you're changing database credentials, you MUST remove the old volume first
# Uncomment the lines below if you need to reset the database:
# echo -e "${RED}WARNING: Removing postgres volume to reset credentials...${RESET}"
# docker volume rm postgres_prod_data
# docker volume create postgres_prod_data

# Build production image
echo -e "${YELLOW}Building production Docker image...${RESET}"
docker compose -f docker-compose.yml -f docker-compose.prod.yml build

# Check if build succeeded
if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed! Check the logs above for errors.${RESET}"
    exit 1
fi

echo -e "${GREEN}Build successful! Starting containers...${RESET}"

# Stop existing containers if running
echo -e "${YELLOW}Stopping any existing production containers...${RESET}"
docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# Start production containers
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --remove-orphans

# Check if containers started successfully
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to start containers! Check the logs above for errors.${RESET}"
    exit 1
fi

echo -e "${GREEN}Containers started successfully!${RESET}"

# Show running containers
echo -e "${YELLOW}Checking running containers:${RESET}"
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps


echo -e "${BLUE}======================================${RESET}"
echo -e "${GREEN}CI/CD Deployment process completed!${RESET}"
echo -e "${BLUE}======================================${RESET}"
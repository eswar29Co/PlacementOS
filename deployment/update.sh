#!/bin/bash

# PlacementOS Update Script for AWS EC2
# This script updates the application on an already deployed EC2 instance

set -e  # Exit on any error

echo "======================================"
echo "PlacementOS Update Script"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Determine which docker compose command to use
if command -v docker-compose &> /dev/null; then
    DC="docker-compose"
else
    DC="docker compose"
fi

print_info "Using Docker Compose command: $DC"

# Backup .env file
print_info "Backing up .env file..."
if [ -f .env ]; then
    cp .env .env.backup
    print_success ".env file backed up"
else
    print_error ".env file not found! Please create one before updating."
    exit 1
fi

# Pull latest changes from git
print_info "Pulling latest changes from git..."
git fetch origin
git pull origin main

print_success "Latest changes pulled"

# Restore .env file
print_info "Restoring .env file..."
cp .env.backup .env
rm .env.backup
print_success ".env file restored"

# Stop containers
print_info "Stopping containers..."
$DC down

print_success "Containers stopped"

# Clean up before rebuilding to save space
print_info "Cleaning up old Docker resources to free space..."
docker system prune -f
print_success "Cleanup completed"

# Rebuild images
print_info "Rebuilding Docker images..."
$DC build --no-cache

print_success "Images rebuilt"

# Start containers
print_info "Starting containers..."
$DC up -d

print_success "Containers started"

# Wait for services to be healthy
print_info "Waiting for services to be healthy..."
sleep 15

# Check backend health
MAX_RETRIES=5
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        print_success "Backend is healthy"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT+1))
        if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
            print_error "Backend health check failed after $MAX_RETRIES attempts"
            print_info "Showing backend logs:"
            $DC logs --tail=50 backend
            exit 1
        fi
        print_info "Waiting for backend... (attempt $RETRY_COUNT/$MAX_RETRIES)"
        sleep 5
    fi
done

# Check frontend health
if curl -f http://localhost/health > /dev/null 2>&1; then
    print_success "Frontend is healthy"
else
    print_error "Frontend health check failed"
    print_info "Showing frontend logs:"
    $DC logs --tail=50 frontend
    exit 1
fi

# Clean up old Docker images
print_info "Cleaning up old Docker images..."
docker image prune -f
print_success "Cleanup completed"

echo ""
echo "======================================"
print_success "Update completed successfully!"
echo "======================================"
echo ""
echo "Services are running:"
echo "  Frontend: http://$(curl -s http://checkip.amazonaws.com 2>/dev/null || echo 'localhost')"
echo "  Backend:  http://$(curl -s http://checkip.amazonaws.com 2>/dev/null || echo 'localhost'):5000"
echo ""
echo "To view logs:"
echo "  $DC logs -f"
echo ""
echo "To rollback (if needed):"
echo "  git reset --hard HEAD~1"
echo "  $DC down && $DC up -d"
echo ""

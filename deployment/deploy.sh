#!/bin/bash

# PlacementOS Deployment Script for AWS EC2
# This script automates the deployment process on EC2

set -e  # Exit on any error

echo "======================================"
echo "PlacementOS Deployment Script"
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

# Check if .env file exists
if [ ! -f .env ]; then
    print_error ".env file not found!"
    print_info "Please create a .env file from .env.example"
    exit 1
fi

print_success ".env file found"

# Load environment variables
source .env

# Check if required variables are set
REQUIRED_VARS=("MONGODB_URI" "JWT_SECRET" "CORS_ORIGIN" "FRONTEND_URL" "VITE_API_BASE_URL")
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set in .env"
        exit 1
    fi
done

print_success "All required environment variables are set"

# Stop and remove existing containers
print_info "Stopping existing containers..."
docker-compose down 2>/dev/null || true
print_success "Existing containers stopped"

# Remove old images (optional - uncomment to save disk space)
# print_info "Removing old images..."
# docker image prune -f

# Build and start containers
print_info "Building Docker images..."
docker-compose build --no-cache

print_success "Docker images built successfully"

print_info "Starting containers..."
docker-compose up -d

print_success "Containers started successfully"

# Wait for services to be healthy
print_info "Waiting for services to be healthy..."
sleep 10

# Check backend health
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    print_success "Backend is healthy"
else
    print_error "Backend health check failed"
    docker-compose logs backend
    exit 1
fi

# Check frontend health
if curl -f http://localhost/health > /dev/null 2>&1; then
    print_success "Frontend is healthy"
else
    print_error "Frontend health check failed"
    docker-compose logs frontend
    exit 1
fi

echo ""
echo "======================================"
print_success "Deployment completed successfully!"
echo "======================================"
echo ""
echo "Services are running:"
echo "  Frontend: http://$(curl -s http://checkip.amazonaws.com 2>/dev/null || echo 'localhost')"
echo "  Backend:  http://$(curl -s http://checkip.amazonaws.com 2>/dev/null || echo 'localhost'):5000"
echo "  API:      http://$(curl -s http://checkip.amazonaws.com 2>/dev/null || echo 'localhost'):5000/api/v1"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop services:"
echo "  docker-compose down"
echo ""

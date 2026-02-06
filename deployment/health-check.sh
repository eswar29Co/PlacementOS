#!/bin/bash

# Health check script for PlacementOS
# Run this to verify all services are running correctly

set -e

echo "======================================"
echo "PlacementOS Health Check"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if Docker is running
print_info "Checking Docker..."
if docker info > /dev/null 2>&1; then
    print_success "Docker is running"
else
    print_error "Docker is not running"
    exit 1
fi

# Check if containers are running
print_info "Checking containers..."
if docker-compose ps | grep -q "Up"; then
    print_success "Containers are running"
    docker-compose ps
else
    print_error "Containers are not running"
    print_info "Start containers with: docker-compose up -d"
    exit 1
fi

echo ""

# Check backend health
print_info "Checking backend health..."
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    print_success "Backend is healthy"
    curl -s http://localhost:5000/health | jq '.' 2>/dev/null || curl -s http://localhost:5000/health
else
    print_error "Backend health check failed"
    print_info "Check logs with: docker-compose logs backend"
fi

echo ""

# Check frontend health
print_info "Checking frontend health..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    print_success "Frontend is healthy"
else
    print_error "Frontend health check failed"
    print_info "Check logs with: docker-compose logs frontend"
fi

echo ""

# Check disk space
print_info "Checking disk space..."
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    print_success "Disk space OK ($DISK_USAGE% used)"
else
    print_error "Disk space critical ($DISK_USAGE% used)"
    print_info "Clean up with: docker system prune -a -f"
fi

# Check memory usage
print_info "Checking memory usage..."
if command -v free > /dev/null 2>&1; then
    MEMORY_USAGE=$(free | awk 'NR==2 {printf "%.0f", $3/$2 * 100}')
    if [ "$MEMORY_USAGE" -lt 90 ]; then
        print_success "Memory usage OK ($MEMORY_USAGE% used)"
    else
        print_error "Memory usage high ($MEMORY_USAGE% used)"
        print_info "Consider restarting containers or adding swap"
    fi
fi

echo ""

# Check Docker resource usage
print_info "Docker resource usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo ""
echo "======================================"
print_success "Health check completed"
echo "======================================"

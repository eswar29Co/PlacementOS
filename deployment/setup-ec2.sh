#!/bin/bash

# PlacementOS EC2 Instance Setup Script
# Run this script on a fresh EC2 instance to install all dependencies

set -e  # Exit on any error

echo "======================================"
echo "PlacementOS EC2 Setup Script"
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

# Update system packages
print_info "Updating system packages..."
sudo apt update
sudo apt upgrade -y
print_success "System packages updated"

# Install Docker
print_info "Installing Docker..."
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io
print_success "Docker installed"

# Install Docker Compose
print_info "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
print_success "Docker Compose installed"

# Add current user to docker group
print_info "Adding user to docker group..."
sudo usermod -aG docker $USER
print_success "User added to docker group"

# Install Git
print_info "Installing Git..."
sudo apt install -y git
print_success "Git installed"

# Install useful utilities
print_info "Installing utilities..."
sudo apt install -y htop curl wget unzip
print_success "Utilities installed"

# Enable Docker service
print_info "Enabling Docker service..."
sudo systemctl start docker
sudo systemctl enable docker
print_success "Docker service enabled"

# Configure firewall (UFW)
print_info "Configuring firewall..."
sudo apt install -y ufw
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS (for future SSL)
sudo ufw --force enable
print_success "Firewall configured"

# Set up swap space (recommended for t2.micro)
print_info "Setting up swap space..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    print_success "Swap space created (2GB)"
else
    print_info "Swap space already exists"
fi

# Create application directory
print_info "Creating application directory..."
mkdir -p ~/placementos
print_success "Application directory created"

echo ""
echo "======================================"
print_success "EC2 Setup completed successfully!"
echo "======================================"
echo ""
echo "IMPORTANT: You need to log out and log back in for Docker group changes to take effect."
echo ""
echo "Next steps:"
echo "1. Log out: exit"
echo "2. Log back in via SSH"
echo "3. Clone your repository: cd ~/placementos && git clone https://github.com/eswar29Co/PlacementOS.git ."
echo "4. Create .env file: cp .env.example .env"
echo "5. Edit .env with your configuration: nano .env"
echo "6. Run deployment: bash deployment/deploy.sh"
echo ""

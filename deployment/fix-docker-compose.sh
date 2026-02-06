#!/bin/bash

echo "=========================================="
echo "Fixing Docker Compose Installation"
echo "=========================================="

# 1. Update package list
echo "Updating package lists..."
sudo apt-get update

# 2. Install Docker Compose Plugin (Official Method for V2)
echo "Installing Docker Compose Plugin..."
sudo apt-get install -y docker-compose-plugin

# 3. Install Standalone Binary (Fallback/Legacy support)
echo "Installing Standalone docker-compose binary..."
# Using a recent stable version
sudo curl -SL https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Verify Installations
echo ""
echo "Verifying installations..."

if command -v docker-compose &> /dev/null; then
    echo "✅ docker-compose (standalone) is installed:"
    docker-compose --version
else
    echo "❌ docker-compose (standalone) failed to install"
fi

if docker compose version &> /dev/null; then
    echo "✅ docker compose (plugin) is installed:"
    docker compose version
else
    echo "❌ docker compose (plugin) failed to install"
fi

echo ""
echo "=========================================="
echo "Fix complete. You can now run deployment/update.sh"
echo "=========================================="

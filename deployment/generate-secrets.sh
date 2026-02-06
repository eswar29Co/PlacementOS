#!/bin/bash

# Script to generate secure secrets for PlacementOS deployment
# Run this script to generate JWT secrets and other secure tokens

echo "======================================"
echo "PlacementOS Secret Generator"
echo "======================================"
echo ""

# Check if openssl is available
if ! command -v openssl &> /dev/null; then
    echo "Error: openssl is not installed"
    echo "Please install openssl first"
    exit 1
fi

echo "Generating secure secrets..."
echo ""

# Generate JWT Secret
JWT_SECRET=$(openssl rand -hex 64)
echo "JWT_SECRET:"
echo "$JWT_SECRET"
echo ""

# Generate JWT Refresh Secret
JWT_REFRESH_SECRET=$(openssl rand -hex 64)
echo "JWT_REFRESH_SECRET:"
echo "$JWT_REFRESH_SECRET"
echo ""

# Generate Session Secret (if needed)
SESSION_SECRET=$(openssl rand -hex 32)
echo "SESSION_SECRET (optional):"
echo "$SESSION_SECRET"
echo ""

echo "======================================"
echo "Copy these values to your .env file"
echo "======================================"
echo ""
echo "Add these lines to your .env file:"
echo ""
echo "JWT_SECRET=$JWT_SECRET"
echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
echo ""
echo "IMPORTANT: Keep these secrets secure and never commit them to Git!"
echo ""

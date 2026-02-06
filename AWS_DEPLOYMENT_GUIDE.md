# 🚀 AWS EC2 Deployment Guide - PlacementOS

Complete guide for deploying PlacementOS to AWS EC2 using Docker and Docker Compose.

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Option 1: Fresh EC2 Deployment](#option-1-fresh-ec2-deployment)
- [Option 2: Update Existing EC2 Instance](#option-2-update-existing-ec2-instance)
- [Environment Configuration](#environment-configuration)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)
- [SSL/HTTPS Setup (Optional)](#sslhttps-setup-optional)

---

## 🛠 Prerequisites

Before you begin, ensure you have:

- [ ] **AWS Account** (Free Tier eligible)
- [ ] **MongoDB Atlas** account and connection string
- [ ] **Cloudinary** account for file uploads (free tier available)
- [ ] **Gmail** account for SMTP (or other email service)
- [ ] **SSH Key Pair** (.pem file) for EC2 access
- [ ] **Git** installed locally (for pushing code)

---

## Option 1: Fresh EC2 Deployment

### Step 1: Launch EC2 Instance

1. **Go to AWS EC2 Console** → Click "Launch Instance"

2. **Configure Instance:**
   - **Name**: `PlacementOS-Production`
   - **AMI**: Ubuntu Server 22.04 LTS (Free Tier)
   - **Instance Type**: `t2.small` (recommended) or `t2.micro` (minimum)
   - **Key Pair**: Create new or select existing (.pem file)
   
3. **Network Settings:**
   - Create security group with these rules:
     - **SSH** (22): Your IP
     - **HTTP** (80): 0.0.0.0/0 (Anywhere)
     - **HTTPS** (443): 0.0.0.0/0 (Anywhere) - for future SSL
     - **Custom TCP** (5000): Your IP (for testing backend directly)

4. **Storage**: 20 GB gp3 (recommended for better performance)

5. **Launch** the instance and wait for it to reach "Running" state

6. **Note your Public IPv4 address** (e.g., `54.123.45.67`)

### Step 2: Connect to EC2

```bash
# Make your key file secure
chmod 400 your-key.pem

# Connect via SSH
ssh -i "your-key.pem" ubuntu@your-ec2-ip
```

### Step 3: Run Setup Script

```bash
# Download and run the setup script
curl -fsSL https://raw.githubusercontent.com/eswar29Co/PlacementOS/main/deployment/setup-ec2.sh -o setup.sh
chmod +x setup.sh
./setup.sh
```

**OR** if you've already cloned the repo:

```bash
cd ~/placementos
git clone https://github.com/eswar29Co/PlacementOS.git .
chmod +x deployment/setup-ec2.sh
bash deployment/setup-ec2.sh
```

**Important:** After setup completes, **log out and log back in** for Docker group changes to take effect:

```bash
exit
# Then reconnect
ssh -i "your-key.pem" ubuntu@your-ec2-ip
```

### Step 4: Configure Environment

```bash
cd ~/placementos

# Create .env file from template
cp .env.example .env

# Edit with your configuration
nano .env
```

**Update these critical values in `.env`:**

```env
# Replace with your EC2 public IP
CORS_ORIGIN=http://54.123.45.67
FRONTEND_URL=http://54.123.45.67
VITE_API_BASE_URL=http://54.123.45.67/api/v1

# Your MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/placementos

# Generate secure secrets (use: openssl rand -hex 64)
JWT_SECRET=your-generated-secret-here
JWT_REFRESH_SECRET=your-generated-refresh-secret-here

# Cloudinary credentials
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Gmail SMTP (enable App Passwords in Google Account)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Save and exit:** Press `Ctrl+X`, then `Y`, then `Enter`

### Step 5: Deploy Application

```bash
# Make deployment script executable
chmod +x deployment/deploy.sh

# Run deployment
bash deployment/deploy.sh
```

The script will:
- ✓ Validate environment variables
- ✓ Build Docker images
- ✓ Start containers
- ✓ Run health checks
- ✓ Display service URLs

### Step 6: Verify Deployment

Open in your browser:
- **Frontend**: `http://your-ec2-ip`
- **Backend Health**: `http://your-ec2-ip:5000/health`
- **API**: `http://your-ec2-ip:5000/api/v1`

---

## Option 2: Update Existing EC2 Instance

If you already have PlacementOS deployed and want to update it with new changes:

### Step 1: Connect to Your EC2 Instance

```bash
ssh -i "your-key.pem" ubuntu@your-ec2-ip
cd ~/placementos
```

### Step 2: Run Update Script

```bash
# Make update script executable (first time only)
chmod +x deployment/update.sh

# Run update
bash deployment/update.sh
```

The update script will:
- ✓ Backup your `.env` file
- ✓ Pull latest changes from Git
- ✓ Restore your `.env` configuration
- ✓ Rebuild Docker images
- ✓ Restart containers with zero downtime
- ✓ Run health checks
- ✓ Clean up old images

### Step 3: Verify Update

Check that services are running:

```bash
# View running containers
docker-compose ps

# Check logs
docker-compose logs -f

# Test endpoints
curl http://localhost:5000/health
curl http://localhost/health
```

---

## 🔧 Environment Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret for JWT tokens | Generate with `openssl rand -hex 64` |
| `CORS_ORIGIN` | Frontend URL for CORS | `http://54.123.45.67` |
| `FRONTEND_URL` | Frontend URL | `http://54.123.45.67` |
| `VITE_API_BASE_URL` | API URL for frontend | `http://54.123.45.67/api/v1` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-secret` |
| `SMTP_USER` | Email address for SMTP | `your-email@gmail.com` |
| `SMTP_PASS` | SMTP password/app password | `your-app-password` |

### Optional Environment Variables

See `.env.example` for all available configuration options.

---

## 📊 Monitoring & Maintenance

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100
```

### Check Container Status

```bash
# List running containers
docker-compose ps

# Check resource usage
docker stats

# System-wide resource usage
htop
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (CAUTION: removes data)
docker-compose down -v
```

### Backup .env File

```bash
# Create backup
cp .env .env.backup.$(date +%Y%m%d)

# List backups
ls -la .env.backup.*
```

### Clean Up Docker Resources

```bash
# Remove unused images
docker image prune -f

# Remove unused containers
docker container prune -f

# Remove everything unused (CAUTION)
docker system prune -a -f
```

---

## 🔍 Troubleshooting

### Backend Not Starting

```bash
# Check backend logs
docker-compose logs backend

# Common issues:
# 1. MongoDB connection failed - verify MONGODB_URI
# 2. Port already in use - check if port 5000 is available
# 3. Missing environment variables - check .env file
```

### Frontend Not Loading

```bash
# Check frontend logs
docker-compose logs frontend

# Verify nginx is running
docker-compose exec frontend nginx -t

# Check if port 80 is accessible
curl http://localhost/health
```

### Database Connection Issues

```bash
# Test MongoDB connection from EC2
# Install mongosh
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-mongosh

# Test connection
mongosh "your-mongodb-uri"
```

### Out of Memory (t2.micro)

```bash
# Check memory usage
free -h

# Verify swap is enabled
swapon --show

# If swap not enabled, run:
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Port Already in Use

```bash
# Check what's using port 80
sudo lsof -i :80

# Check what's using port 5000
sudo lsof -i :5000

# Kill process if needed
sudo kill -9 <PID>
```

### Container Health Check Failing

```bash
# Check container health
docker-compose ps

# Inspect specific container
docker inspect placementos-backend
docker inspect placementos-frontend

# Manual health check
curl http://localhost:5000/health
curl http://localhost/health
```

---

## 🔒 SSL/HTTPS Setup (Optional)

### Using Let's Encrypt with Certbot

1. **Install Certbot:**

```bash
sudo apt install -y certbot python3-certbot-nginx
```

2. **Get SSL Certificate:**

```bash
# Replace with your domain
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

3. **Update docker-compose.yml:**

Add volume mounts for SSL certificates:

```yaml
frontend:
  volumes:
    - /etc/letsencrypt:/etc/letsencrypt:ro
  ports:
    - "443:443"
```

4. **Update nginx.conf** to include SSL configuration

5. **Auto-renewal:**

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot will auto-renew via cron
```

---

## 🎯 Quick Reference Commands

```bash
# Deploy application
bash deployment/deploy.sh

# Update application
bash deployment/update.sh

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Start services
docker-compose up -d

# Check status
docker-compose ps

# SSH to container
docker-compose exec backend sh
docker-compose exec frontend sh

# Database backup (if using local MongoDB)
docker-compose exec backend mongodump --uri="$MONGODB_URI" --out=/backup

# View environment
docker-compose exec backend env
```

---

## 📞 Support

If you encounter issues:

1. Check logs: `docker-compose logs -f`
2. Verify environment variables: `cat .env`
3. Check container status: `docker-compose ps`
4. Review this guide's troubleshooting section
5. Check GitHub issues: https://github.com/eswar29Co/PlacementOS/issues

---

## 🎉 Success Checklist

- [ ] EC2 instance running
- [ ] Docker and Docker Compose installed
- [ ] Application cloned from Git
- [ ] `.env` file configured with all credentials
- [ ] Containers built and running
- [ ] Frontend accessible at `http://your-ec2-ip`
- [ ] Backend health check passing at `http://your-ec2-ip:5000/health`
- [ ] Can create user account and log in
- [ ] File uploads working (Cloudinary)
- [ ] Email notifications working (SMTP)
- [ ] Auto-restart enabled: `docker update --restart always placementos-backend placementos-frontend`

---

**Last Updated:** February 2026  
**Version:** 2.0 (Docker Compose)

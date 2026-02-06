# 🐳 Docker Deployment Guide

This document explains the Docker setup for PlacementOS and how to use it for local development and production deployment.

## 📁 Project Structure

```
PlacementOS/
├── backend-pos/
│   ├── Dockerfile              # Backend container definition
│   ├── src/                    # Backend source code
│   └── package.json
├── frontend-pos/
│   ├── Dockerfile              # Frontend container definition
│   ├── nginx.conf              # Nginx configuration for serving frontend
│   ├── src/                    # Frontend source code
│   └── package.json
├── deployment/
│   ├── setup-ec2.sh           # EC2 initial setup script
│   ├── deploy.sh              # Deployment script
│   └── update.sh              # Update script for existing deployments
├── docker-compose.yml          # Multi-container orchestration
├── .env.example               # Environment variables template
└── .dockerignore              # Files to exclude from Docker builds
```

## 🏗️ Architecture

The application uses a **multi-container architecture**:

1. **Backend Container** (Node.js + Express)
   - Runs on port 5000
   - Handles API requests
   - Connects to MongoDB Atlas
   - Multi-stage build for smaller image size

2. **Frontend Container** (React + Vite + Nginx)
   - Runs on port 80
   - Serves static files via Nginx
   - Proxies API requests to backend
   - Multi-stage build for optimized production bundle

## 🚀 Quick Start

### Local Development with Docker

1. **Clone the repository:**
```bash
git clone https://github.com/eswar29Co/PlacementOS.git
cd PlacementOS
```

2. **Create environment file:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Build and run:**
```bash
docker-compose up -d
```

4. **Access the application:**
   - Frontend: http://localhost
   - Backend: http://localhost:5000
   - API: http://localhost:5000/api/v1

### Production Deployment

See [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md) for complete AWS EC2 deployment instructions.

## 🔧 Docker Commands

### Build Images

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Build without cache (clean build)
docker-compose build --no-cache
```

### Start/Stop Services

```bash
# Start all services in background
docker-compose up -d

# Start and view logs
docker-compose up

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

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

### Container Management

```bash
# List running containers
docker-compose ps

# Restart services
docker-compose restart

# Restart specific service
docker-compose restart backend

# Execute command in container
docker-compose exec backend sh
docker-compose exec frontend sh

# View container stats
docker stats
```

### Cleanup

```bash
# Remove stopped containers
docker-compose rm

# Remove unused images
docker image prune -f

# Remove all unused resources
docker system prune -a -f
```

## 🔍 Image Details

### Backend Image

**Base Image:** `node:20-alpine`

**Features:**
- Multi-stage build (builder + production)
- Non-root user for security
- dumb-init for proper signal handling
- Health check endpoint
- Production dependencies only

**Size:** ~200MB (optimized)

### Frontend Image

**Base Image:** `nginx:alpine`

**Features:**
- Multi-stage build (builder + nginx)
- Optimized Nginx configuration
- Gzip compression
- Security headers
- SPA routing support
- Health check endpoint

**Size:** ~50MB (optimized)

## 🌐 Environment Variables

### Required Variables

```env
# Database
MONGODB_URI=mongodb+srv://...

# Authentication
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret

# CORS & Frontend
CORS_ORIGIN=http://your-domain
FRONTEND_URL=http://your-domain
VITE_API_BASE_URL=http://your-domain/api/v1

# File Uploads
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# Email
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

See `.env.example` for complete list.

## 🏥 Health Checks

Both containers include health checks:

### Backend Health Check
```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "success": true,
  "message": "PlacementOS API is running",
  "timestamp": "2026-02-06T...",
  "environment": "production"
}
```

### Frontend Health Check
```bash
curl http://localhost/health
```

Response:
```
healthy
```

## 🔒 Security Best Practices

1. **Non-root user:** Backend runs as user `nodejs` (UID 1001)
2. **Minimal base images:** Using Alpine Linux for smaller attack surface
3. **Multi-stage builds:** Build dependencies not included in final image
4. **Security headers:** Nginx configured with security headers
5. **Environment variables:** Sensitive data in .env, not in code
6. **Health checks:** Automatic container health monitoring

## 📊 Resource Requirements

### Minimum (t2.micro)
- **CPU:** 1 vCPU
- **RAM:** 1 GB
- **Storage:** 8 GB
- **Swap:** 2 GB recommended

### Recommended (t2.small)
- **CPU:** 1 vCPU
- **RAM:** 2 GB
- **Storage:** 20 GB
- **Swap:** Not required

## 🐛 Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs backend

# Check container status
docker-compose ps

# Inspect container
docker inspect placementos-backend
```

### Port already in use

```bash
# Check what's using the port
sudo lsof -i :80
sudo lsof -i :5000

# Change ports in docker-compose.yml if needed
```

### Out of memory

```bash
# Check memory usage
docker stats

# Add swap space (Linux)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Build fails

```bash
# Clean build
docker-compose down
docker system prune -a -f
docker-compose build --no-cache
```

## 🔄 Update Strategy

### Zero-Downtime Updates

1. Build new images
2. Start new containers
3. Health check passes
4. Stop old containers

```bash
# Automated via update script
bash deployment/update.sh
```

### Rollback

```bash
# Rollback code
git reset --hard HEAD~1

# Rebuild and restart
docker-compose down
docker-compose up -d
```

## 📈 Monitoring

### Container Logs

```bash
# Real-time logs
docker-compose logs -f

# Export logs
docker-compose logs > logs.txt
```

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df
```

### Health Status

```bash
# Check health
docker-compose ps

# Manual health check
curl http://localhost:5000/health
curl http://localhost/health
```

## 🎯 Best Practices

1. **Always use .env file** - Never commit secrets to Git
2. **Regular updates** - Keep base images updated
3. **Monitor logs** - Check logs regularly for errors
4. **Backup .env** - Keep backup of environment configuration
5. **Use health checks** - Monitor container health
6. **Clean up regularly** - Remove unused images and containers
7. **Test locally first** - Test changes with Docker locally before deploying

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [Nginx Documentation](https://nginx.org/en/docs/)

## 🆘 Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)
3. Check container logs: `docker-compose logs -f`
4. Open an issue on GitHub

---

**Last Updated:** February 2026  
**Docker Version:** 24.0+  
**Docker Compose Version:** 2.0+

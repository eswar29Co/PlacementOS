# 📋 Deployment Checklist

Use this checklist to ensure a successful deployment of PlacementOS.

## Pre-Deployment Checklist

### 1. Prerequisites
- [ ] AWS account created and configured
- [ ] MongoDB Atlas cluster created
- [ ] MongoDB connection string obtained
- [ ] Cloudinary account created
- [ ] Cloudinary credentials obtained
- [ ] Gmail account configured with App Password
- [ ] SSH key pair (.pem file) downloaded
- [ ] Git repository accessible

### 2. Local Testing
- [ ] Application runs locally without errors
- [ ] All environment variables configured in `.env`
- [ ] Backend builds successfully: `cd backend-pos && npm run build`
- [ ] Frontend builds successfully: `cd frontend-pos && npm run build`
- [ ] Docker images build successfully: `docker-compose build`
- [ ] Docker containers run successfully: `docker-compose up -d`
- [ ] Health checks pass locally
- [ ] All features tested (login, job posting, applications, etc.)

### 3. Code Quality
- [ ] No TypeScript errors: `npm run lint`
- [ ] All tests passing: `npm test`
- [ ] Code committed to Git
- [ ] Code pushed to GitHub
- [ ] `.env` file NOT committed (check `.gitignore`)

## AWS EC2 Setup Checklist

### 1. EC2 Instance Configuration
- [ ] EC2 instance launched (Ubuntu 22.04 LTS)
- [ ] Instance type selected (t2.small recommended, t2.micro minimum)
- [ ] Security group configured:
  - [ ] SSH (22) from My IP
  - [ ] HTTP (80) from Anywhere (0.0.0.0/0)
  - [ ] HTTPS (443) from Anywhere (0.0.0.0/0)
  - [ ] Custom TCP (5000) from My IP (optional, for testing)
- [ ] Key pair selected/created
- [ ] Storage configured (20GB recommended)
- [ ] Instance running and accessible
- [ ] Public IP address noted

### 2. EC2 Initial Setup
- [ ] Connected to EC2 via SSH
- [ ] System packages updated: `sudo apt update && sudo apt upgrade -y`
- [ ] Docker installed
- [ ] Docker Compose installed
- [ ] Git installed
- [ ] User added to docker group
- [ ] Firewall (UFW) configured
- [ ] Swap space created (for t2.micro)
- [ ] Logged out and back in (for docker group)

### 3. Application Setup
- [ ] Application directory created: `mkdir -p ~/placementos`
- [ ] Repository cloned: `git clone https://github.com/eswar29Co/PlacementOS.git .`
- [ ] `.env` file created from `.env.example`
- [ ] All environment variables configured in `.env`
- [ ] EC2 public IP updated in `.env`:
  - [ ] `CORS_ORIGIN=http://your-ec2-ip`
  - [ ] `FRONTEND_URL=http://your-ec2-ip`
  - [ ] `VITE_API_BASE_URL=http://your-ec2-ip/api/v1`
- [ ] MongoDB URI configured
- [ ] JWT secrets generated and configured
- [ ] Cloudinary credentials configured
- [ ] SMTP credentials configured

## Deployment Checklist

### 1. Initial Deployment
- [ ] Deployment script executable: `chmod +x deployment/deploy.sh`
- [ ] Deployment script executed: `bash deployment/deploy.sh`
- [ ] No errors during build
- [ ] Containers started successfully
- [ ] Health checks passed
- [ ] Backend accessible: `curl http://localhost:5000/health`
- [ ] Frontend accessible: `curl http://localhost/health`

### 2. Verification
- [ ] Frontend loads in browser: `http://your-ec2-ip`
- [ ] Backend health check works: `http://your-ec2-ip:5000/health`
- [ ] Can register new user
- [ ] Can login successfully
- [ ] Can create/view jobs
- [ ] Can upload resume (Cloudinary)
- [ ] Email notifications working (SMTP)
- [ ] All user roles working (Student, TPO, Professional)

### 3. Post-Deployment
- [ ] Auto-restart enabled: `docker update --restart always placementos-backend placementos-frontend`
- [ ] Logs checked: `docker-compose logs -f`
- [ ] Resource usage checked: `docker stats`
- [ ] Disk space checked: `df -h`
- [ ] Memory usage checked: `free -h`
- [ ] Health check script works: `bash deployment/health-check.sh`

## Security Checklist

- [ ] `.env` file has correct permissions: `chmod 600 .env`
- [ ] `.pem` file has correct permissions: `chmod 400 your-key.pem`
- [ ] JWT secrets are strong (64+ characters)
- [ ] MongoDB uses strong password
- [ ] SMTP uses app-specific password (not main password)
- [ ] Security group rules are restrictive (SSH only from your IP)
- [ ] Firewall (UFW) is enabled
- [ ] No sensitive data in Git repository
- [ ] HTTPS configured (optional but recommended)

## Monitoring Checklist

### Daily
- [ ] Check application is accessible
- [ ] Check health endpoints
- [ ] Review error logs: `docker-compose logs --tail=100 | grep -i error`

### Weekly
- [ ] Check disk space: `df -h`
- [ ] Check memory usage: `free -h`
- [ ] Clean up old Docker images: `docker image prune -f`
- [ ] Review application logs
- [ ] Check for security updates: `sudo apt update && sudo apt list --upgradable`

### Monthly
- [ ] Update system packages: `sudo apt update && sudo apt upgrade -y`
- [ ] Backup `.env` file
- [ ] Review and rotate JWT secrets (if needed)
- [ ] Review MongoDB Atlas backups
- [ ] Check Cloudinary storage usage
- [ ] Review email quota usage

## Update Deployment Checklist

### Before Update
- [ ] Test changes locally
- [ ] All tests passing
- [ ] Code committed and pushed to GitHub
- [ ] Backup `.env` file: `cp .env .env.backup`
- [ ] Note current commit hash: `git rev-parse HEAD`

### During Update
- [ ] Connected to EC2
- [ ] In application directory: `cd ~/placementos`
- [ ] Update script executed: `bash deployment/update.sh`
- [ ] No errors during update
- [ ] Health checks passed

### After Update
- [ ] Application accessible
- [ ] All features working
- [ ] Logs checked for errors
- [ ] Old Docker images cleaned up
- [ ] Backup `.env` file removed (if update successful)

### Rollback (if needed)
- [ ] Rollback code: `git reset --hard <previous-commit-hash>`
- [ ] Rebuild: `docker-compose down && docker-compose up -d`
- [ ] Verify rollback successful

## Troubleshooting Checklist

### If Deployment Fails
- [ ] Check deployment logs
- [ ] Verify `.env` file configuration
- [ ] Check Docker logs: `docker-compose logs`
- [ ] Verify all required environment variables set
- [ ] Check MongoDB connection: `mongosh "your-mongodb-uri"`
- [ ] Check disk space: `df -h`
- [ ] Check memory: `free -h`
- [ ] Review security group rules
- [ ] Check firewall rules: `sudo ufw status`

### If Application Not Accessible
- [ ] Check containers running: `docker-compose ps`
- [ ] Check health endpoints
- [ ] Check nginx logs: `docker-compose logs frontend`
- [ ] Check backend logs: `docker-compose logs backend`
- [ ] Verify security group allows HTTP (80)
- [ ] Verify firewall allows HTTP: `sudo ufw status`
- [ ] Check if ports are listening: `sudo netstat -tlnp | grep -E '80|5000'`

### If Database Connection Fails
- [ ] Verify MongoDB URI in `.env`
- [ ] Check MongoDB Atlas network access (allow EC2 IP)
- [ ] Test connection: `mongosh "your-mongodb-uri"`
- [ ] Check MongoDB Atlas cluster status
- [ ] Verify database user credentials

### If File Uploads Fail
- [ ] Verify Cloudinary credentials in `.env`
- [ ] Check Cloudinary dashboard for errors
- [ ] Check backend logs for upload errors
- [ ] Verify Cloudinary storage quota

### If Emails Not Sending
- [ ] Verify SMTP credentials in `.env`
- [ ] Check Gmail App Password is correct
- [ ] Verify "Less secure app access" disabled (use App Password)
- [ ] Check backend logs for email errors
- [ ] Test SMTP connection manually

## Performance Optimization Checklist

- [ ] Enable gzip compression (already in nginx.conf)
- [ ] Configure browser caching (already in nginx.conf)
- [ ] Monitor response times
- [ ] Optimize database queries
- [ ] Add database indexes if needed
- [ ] Consider CDN for static assets
- [ ] Consider upgrading instance type if needed
- [ ] Monitor and optimize Docker resource usage

## Backup Checklist

### What to Backup
- [ ] `.env` file (store securely, not in Git)
- [ ] MongoDB database (automatic in Atlas)
- [ ] Cloudinary files (automatic)
- [ ] Application logs (if needed)
- [ ] Nginx configuration
- [ ] Docker compose configuration

### Backup Locations
- [ ] `.env` backup stored securely locally
- [ ] MongoDB Atlas automatic backups enabled
- [ ] Important configuration files in Git (without secrets)

## Documentation Checklist

- [ ] README.md updated
- [ ] API documentation current
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Troubleshooting guide updated
- [ ] Change log maintained

---

## Quick Reference

### Essential Commands
```bash
# Deploy
bash deployment/deploy.sh

# Update
bash deployment/update.sh

# Health check
bash deployment/health-check.sh

# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Stop
docker-compose down

# Start
docker-compose up -d
```

### Essential URLs
- Frontend: `http://your-ec2-ip`
- Backend: `http://your-ec2-ip:5000`
- Health: `http://your-ec2-ip:5000/health`
- API: `http://your-ec2-ip:5000/api/v1`

---

**Print this checklist and check off items as you complete them!**

**Last Updated:** February 2026

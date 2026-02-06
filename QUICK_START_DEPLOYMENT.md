# 🚀 Quick Start - Update Existing EC2 Instance

This guide is for updating an **already deployed** EC2 instance with the latest changes.

## ⚡ Quick Update (5 minutes)

### 1. Connect to EC2

```bash
ssh -i "placementos-dev.pem" ubuntu@your-ec2-ip
cd ~/placementos
```

### 2. Run Update Script

```bash
bash deployment/update.sh
```

That's it! The script will:
- ✓ Pull latest code from GitHub
- ✓ Preserve your `.env` configuration
- ✓ Rebuild Docker images
- ✓ Restart services
- ✓ Run health checks

### 3. Verify

Visit `http://your-ec2-ip` to see your updated application.

---

## 🔧 Manual Update (if script fails)

```bash
# 1. Backup environment
cp .env .env.backup

# 2. Pull latest changes
git pull origin main

# 3. Restore environment
cp .env.backup .env

# 4. Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 5. Check status
docker-compose ps
docker-compose logs -f
```

---

## 📊 Useful Commands

```bash
# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Restart specific service
docker-compose restart backend
docker-compose restart frontend

# Stop all services
docker-compose down

# Start all services
docker-compose up -d
```

---

## 🐛 Troubleshooting

### Services won't start

```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Verify .env file
cat .env | grep -v "^#" | grep -v "^$"
```

### Out of disk space

```bash
# Clean up old images
docker image prune -f

# Check disk usage
df -h
```

### Need to rollback

```bash
# Go back to previous version
git reset --hard HEAD~1
docker-compose down
docker-compose up -d
```

---

## 🆘 Need Help?

See the full [AWS Deployment Guide](./AWS_DEPLOYMENT_GUIDE.md) for detailed instructions.

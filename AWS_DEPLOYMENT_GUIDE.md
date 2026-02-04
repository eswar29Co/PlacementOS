# 🚀 AWS EC2 Deployment Guide (Dockerized)

This guide will help you deploy PlacementOS to an AWS EC2 instance using Docker for a "zero-config" setup.

## 🛠 Prerequisites
- [ ] AWS Account (Free Tier)
- [ ] MongoDB Atlas Connection String
- [ ] Cloudinary Credentials

---

## 1️⃣ AWS EC2 Setup (Console)

1.  **Launch Instance**:
    *   **Name**: `PlacementOS-Dev`
    *   **AMI**: `Ubuntu 22.04 LTS` (Free Tier)
    *   **Instance Type**: `t2.micro` (Free Tier)
    *   **Key Pair**: Create new or use existing (.pem file)
    *   **Security Group Rules**:
        *   Allow **SSH** (22) from My IP
        *   Allow **HTTP** (80) from Everywhere
2.  **Launch** and wait for the "Running" state.
3.  **Copy Public IPv4**: This is your "Dev URL" (e.g., `54.123.45.67`).

---

## 2️⃣ Install Docker on EC2

Connect to your EC2 via SSH:
```bash
ssh -i "your-key.pem" ubuntu@your-ec2-ip
```

Run these commands to install Docker:
```bash
sudo apt update
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
# Log out and log back in for group changes to take effect
exit
```

---

## 3️⃣ Prepare Environment Files

Log back in and create a directory:
```bash
mkdir placementos && cd placementos
nano .env
```

Paste and fill your production variables:
```env
MONGODB_URI=mongodb+srv://placementos-admin:placeOSAdmin%404945@placementos-cluster.zviwjef.mongodb.net/placementos?appName=PlacementOS-Cluster
JWT_SECRET=9f7a2b8c4d1e6f3a5b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a
CORS_ORIGIN=http://13.211.190.255
FRONTEND_URL=http://13.211.190.255
# Add Cloudinary and SMTP keys as well
```

---

## 4️⃣ Build & Run with Docker

1.  **Clone your repo**:
    *If you already created a .env file, you must move it first:*
    ```bash
    mv .env ../.env_bak
    git clone https://github.com/eswar29Co/PlacementOS.git .
    mv ../.env_bak .env
    ```
2.  **Build the Image**:
    ```bash
    docker build --build-arg VITE_API_BASE_URL=http://13.211.190.255/api/v1 -t placementos .
    ```
3.  **Run the Container**:
    ```bash
    docker run -d --name app --env-file .env -p 80:80 placementos
    ```

---

## 5️⃣ Verification Checklist

- [ ] **Frontend**: Open `http://your-ec2-ip` in your browser.
- [ ] **Backend**: Open `http://your-ec2-ip/api/health`.
- [ ] **Database**: Try to sign up a new user.
- [ ] **Logs**: Check `docker logs app` if something goes wrong.

---

## 🔄 Automatic Restart on Reboot
```bash
docker update --restart always app
```

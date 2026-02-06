# 🎓 PlacementOS - Complete Placement Management System

A comprehensive, production-ready placement management platform built with the MERN stack, featuring AI-powered resume screening, automated assessments, and real-time notifications.

## ✨ Features

### For Students
- 📝 **Profile Management** - Complete academic and professional profile
- 💼 **Job Applications** - Browse and apply for placement opportunities
- 📄 **Resume Upload** - AI-powered ATS resume screening
- 📊 **Assessment System** - Take technical assessments for job applications
- 🎤 **AI Interviews** - Automated interview scheduling and feedback
- 🔔 **Real-time Notifications** - Stay updated on application status
- 📈 **Application Tracking** - Monitor all your applications in one place

### For TPOs (Training & Placement Officers)
- 👥 **Student Management** - Manage student profiles and data
- 💼 **Job Posting** - Create and manage job opportunities
- 📊 **Analytics Dashboard** - Track placement statistics and metrics
- ✅ **Application Review** - Review and shortlist candidates
- 📧 **Bulk Notifications** - Send updates to students
- 📈 **Placement Reports** - Generate comprehensive reports

### For Professionals/Recruiters
- 🏢 **Company Profiles** - Manage company information
- 💼 **Job Management** - Post and manage job openings
- 👨‍💼 **Candidate Screening** - AI-powered resume screening
- 📊 **Assessment Creation** - Create custom technical assessments
- 🎯 **Shortlisting** - Automated candidate shortlisting based on ATS scores
- 📈 **Hiring Analytics** - Track recruitment metrics

### Technical Features
- 🤖 **AI-Powered ATS** - Semantic resume analysis and scoring
- 🔐 **Secure Authentication** - JWT-based authentication with refresh tokens
- 📁 **File Management** - Cloudinary integration for resume/document storage
- 📧 **Email Notifications** - SMTP integration for automated emails
- 🔄 **Real-time Updates** - Socket.io for live notifications
- 📊 **Advanced Analytics** - Comprehensive dashboard with statistics
- 🎨 **Modern UI** - Built with React, TypeScript, and Shadcn/UI
- 🐳 **Docker Ready** - Containerized deployment for easy scaling

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast builds
- **Shadcn/UI** for beautiful components
- **TailwindCSS** for styling
- **Redux Toolkit** for state management
- **React Query** for data fetching
- **React Router** for navigation
- **Framer Motion** for animations

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Cloudinary** for file storage
- **Nodemailer** for emails
- **Natural** for NLP/text processing
- **Socket.io** for real-time features

### DevOps
- **Docker** & **Docker Compose** for containerization
- **GitHub Actions** for CI/CD
- **AWS EC2** for hosting
- **MongoDB Atlas** for database
- **Nginx** for reverse proxy

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose (for containerized deployment)
- MongoDB Atlas account
- Cloudinary account
- Gmail account (for SMTP)

### Local Development (Without Docker)

1. **Clone the repository:**
```bash
git clone https://github.com/eswar29Co/PlacementOS.git
cd PlacementOS
```

2. **Backend Setup:**
```bash
cd backend-pos
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

3. **Frontend Setup:**
```bash
cd frontend-pos
npm install
npm run dev
```

### Local Development (With Docker)

1. **Clone and configure:**
```bash
git clone https://github.com/eswar29Co/PlacementOS.git
cd PlacementOS
cp .env.example .env
# Edit .env with your configuration
```

2. **Start with Docker Compose:**
```bash
docker-compose up -d
```

3. **Access the application:**
   - Frontend: http://localhost
   - Backend: http://localhost:5000
   - API: http://localhost:5000/api/v1

## 📦 Production Deployment

### Deploy to AWS EC2

We provide comprehensive deployment guides and automated scripts:

#### Fresh Deployment
See [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md) for complete instructions.

**Quick steps:**
1. Launch EC2 instance (Ubuntu 22.04)
2. Run setup script: `bash deployment/setup-ec2.sh`
3. Configure `.env` file
4. Deploy: `bash deployment/deploy.sh`

#### Update Existing Deployment
See [QUICK_START_DEPLOYMENT.md](./QUICK_START_DEPLOYMENT.md) for update instructions.

**Quick update:**
```bash
ssh -i "your-key.pem" ubuntu@your-ec2-ip
cd ~/placementos
bash deployment/update.sh
```

### Docker Deployment

See [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) for detailed Docker documentation.

**Key features:**
- Multi-stage builds for optimized images
- Health checks for automatic recovery
- Non-root users for security
- Automated deployment scripts
- Zero-downtime updates

## 📚 Documentation

- [AWS Deployment Guide](./AWS_DEPLOYMENT_GUIDE.md) - Complete AWS EC2 deployment
- [Quick Start Deployment](./QUICK_START_DEPLOYMENT.md) - Update existing deployments
- [Docker Guide](./DOCKER_GUIDE.md) - Docker setup and commands
- [Deployment Guide](./DEPLOYMENT.md) - General deployment information

## 🔧 Configuration

### Environment Variables

Create a `.env` file from `.env.example` and configure:

```env
# Database
MONGODB_URI=your-mongodb-connection-string

# Authentication
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

# CORS & Frontend
CORS_ORIGIN=http://your-domain
FRONTEND_URL=http://your-domain
VITE_API_BASE_URL=http://your-domain/api/v1

# File Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

Generate secure secrets:
```bash
bash deployment/generate-secrets.sh
```

## 🛠️ Useful Commands

### Docker Commands
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild images
docker-compose build --no-cache

# Health check
bash deployment/health-check.sh
```

### Deployment Commands
```bash
# Deploy to EC2
bash deployment/deploy.sh

# Update existing deployment
bash deployment/update.sh

# Setup fresh EC2 instance
bash deployment/setup-ec2.sh

# Check system health
bash deployment/health-check.sh
```

## 🔍 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/me` - Get current user

### Jobs
- `GET /api/v1/jobs` - List all jobs
- `POST /api/v1/jobs` - Create job (Professional only)
- `GET /api/v1/jobs/:id` - Get job details
- `PUT /api/v1/jobs/:id` - Update job
- `DELETE /api/v1/jobs/:id` - Delete job

### Applications
- `POST /api/v1/applications` - Apply for job
- `GET /api/v1/applications` - Get user applications
- `GET /api/v1/applications/:id` - Get application details
- `PUT /api/v1/applications/:id/status` - Update status

### Assessments
- `GET /api/v1/assessments/:id` - Get assessment
- `POST /api/v1/assessments/:id/submit` - Submit assessment

See full API documentation at `/api/v1/docs` (when running).

## 🧪 Testing

```bash
# Backend tests
cd backend-pos
npm test

# Frontend tests
cd frontend-pos
npm test
```

## 📊 Monitoring

### Health Checks
```bash
# Backend health
curl http://your-domain:5000/health

# Frontend health
curl http://your-domain/health

# Automated health check
bash deployment/health-check.sh
```

### View Logs
```bash
# Docker logs
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🔒 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Helmet.js security headers
- Input validation and sanitization
- Non-root Docker containers
- Environment variable protection

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Eswar** - [eswar29Co](https://github.com/eswar29Co)

## 🙏 Acknowledgments

- Shadcn/UI for beautiful components
- MongoDB Atlas for database hosting
- Cloudinary for file storage
- AWS for hosting infrastructure

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on [GitHub](https://github.com/eswar29Co/PlacementOS/issues)
- Check the [Documentation](./AWS_DEPLOYMENT_GUIDE.md)
- Review [Troubleshooting Guide](./AWS_DEPLOYMENT_GUIDE.md#troubleshooting)

## 🗺️ Roadmap

- [ ] Mobile application (React Native)
- [ ] Advanced analytics dashboard
- [ ] Video interview integration
- [ ] Multi-language support
- [ ] Kubernetes deployment
- [ ] GraphQL API
- [ ] Advanced AI features

---

**Built with ❤️ for better placement management**

**Last Updated:** February 2026  
**Version:** 2.0.0

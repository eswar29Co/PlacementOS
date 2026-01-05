# PlacementOS - Pre-Placement Simulation Platform

## 🚀 Quick Start Guide

### Prerequisites
- Java 17 or higher
- Maven 3.6+

### Installation & Running

1. **Navigate to project directory:**
```bash
cd PlacementOS
```

2. **Run the application:**
```bash
mvn spring-boot:run
```

3. **Access the application:**
- Application URL: http://localhost:8080
- H2 Database Console: http://localhost:8080/h2-console

### H2 Database Connection Details
- **JDBC URL:** `jdbc:h2:mem:placementosdb`
- **Username:** `sa`
- **Password:** (leave blank)

---

## 📋 Sample Login Accounts

### Students
- **Email:** rahul@example.com
- **Email:** priya@example.com

### Admin
- **Email:** admin@placementos.com

---

## 🎯 Features

### For Students
1. **Browse Jobs** - View all available job openings
2. **Apply to Jobs** - Submit resume/cover letter
3. **AI Resume Screening** - Get instant automated feedback
4. **Technical Assessment** - Take simulated assessments
5. **Interview Process** - Get interviewed by admins
6. **Offer Letters** - Receive offer if selected
7. **Final Reports** - View complete application timeline

### For Admins
1. **Conduct Interviews** - Review candidates and provide feedback
2. **Submit Verdicts** - Pass or fail candidates

---

## 📂 Project Structure

```
PlacementOS/
├── src/main/java/com/placementos/
│   ├── controller/      # REST controllers
│   ├── service/         # Business logic
│   ├── repository/      # Data access layer
│   ├── model/          # JPA entities
│   └── config/         # Configuration & data seeder
├── src/main/resources/
│   ├── templates/      # Thymeleaf HTML templates
│   ├── static/         # CSS files
│   └── application.yml # Application configuration
└── pom.xml            # Maven dependencies
```

---

## 🔄 Application Flow

1. **Register/Login** → User creates account or logs in
2. **Browse Jobs** → View available positions
3. **Apply** → Submit resume text
4. **AI Screening** → Automated resume evaluation (pass/fail)
5. **Assessment** → Random score generation (70+ to pass)
6. **Interview** → Admin conducts and provides feedback
7. **Offer** → If passed, receive offer letter
8. **Report** → View complete journey timeline

---

## 🤖 Simulated AI Logic

### Resume Screening
- Minimum 300 characters required
- Keyword matching based on job role
- Auto-reject if criteria not met

### Assessment
- Random score: 50-100
- Pass threshold: 70
- Auto-schedules interview on pass

---

## 💾 Database

- **Type:** H2 In-Memory Database
- **Auto-creates** on startup
- **Auto-seeds** sample data:
  - 3 users (2 students, 1 admin)
  - 5 job postings

---

## 🛠️ Tech Stack

- **Backend:** Java 17, Spring Boot 3.2.0
- **Database:** H2 (in-memory)
- **ORM:** Spring Data JPA (Hibernate)
- **Frontend:** Thymeleaf, HTML, CSS, Vanilla JavaScript
- **Build Tool:** Maven

---

## 📊 API Endpoints

All endpoints are server-rendered (no REST API exposed).

### Public
- `GET /` - Redirect to login/dashboard
- `GET /login` - Login page
- `POST /login` - Process login
- `GET /register` - Registration page
- `POST /register` - Create account

### Student
- `GET /dashboard` - Student dashboard
- `GET /jobs` - List all jobs
- `GET /jobs/{id}` - Job details
- `GET /applications/apply/{jobId}` - Apply form
- `POST /applications/apply/{jobId}` - Submit application
- `GET /applications/my-applications` - View all applications
- `GET /applications/{id}/screening` - Resume screening result
- `GET /applications/{id}/assessment` - Start assessment
- `POST /applications/{id}/assessment/submit` - Submit assessment
- `GET /applications/{id}/assessment/result` - Assessment result
- `GET /applications/{id}/interview` - Interview status
- `GET /applications/{id}/offer` - Offer letter
- `GET /applications/{id}/report` - Final report

### Admin
- `GET /admin/interviews` - Interview list
- `GET /admin/interviews/{id}/conduct` - Conduct interview
- `POST /admin/interviews/{id}/submit` - Submit feedback

---

## 🎨 UI Features

- Responsive design
- Color-coded status badges
- Timeline visualization
- Gradient backgrounds
- Card-based layouts

---

## 🔐 Security Note

This is a **localhost development application**. No real authentication is implemented - login is email-only for simplicity.

---

## 📝 Notes

- Database resets on every restart (in-memory)
- All AI logic is deterministic/simulated
- Unlimited attempts allowed
- No file uploads - text-based resumes only

---

## 🎓 Purpose

PlacementOS is designed for Tier-2 & Tier-3 tech students to practice the complete placement process in a risk-free environment.

---

## 📞 Support

For issues or questions, check the console logs when running the application.

---

**Built with ❤️ for aspiring tech professionals**

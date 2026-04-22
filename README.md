# 🚀 Portfolio Project

A modern full-stack portfolio application built with a scalable, secure, and modular architecture. This project demonstrates production-grade backend design, clean architecture principles, and a polished frontend experience.

---

## 📌 Overview

This portfolio system is designed to:
- Showcase professional experience, skills, and projects
- Provide dynamic content management via admin/dashboard
- Demonstrate enterprise-level backend architecture

---

## 🏗️ Architecture

The backend follows a **layered architecture**:

```
Route → Middleware → Controller → Use Case → Domain → Repository → Database
```

### Key Principles
- Separation of concerns
- Clean architecture
- Scalable and maintainable codebase
- Security-first design

📄 Detailed architecture: [`docs/backend/BACKEND.md`](./docs/backend/BACKEND.md)

---

## ⚙️ Tech Stack

### Frontend
- Next.js
- React
- Tailwind CSS

### Backend
- Node.js (App Router / API Routes)
- MongoDB
- Mongoose (ODM)

### Security
- CSRF Protection
- Rate Limiting
- Input Sanitization
- Secure Cookies

---

## 🔐 Security Features

- **CSRF Protection** for all state-changing requests
- **Rate Limiting** to prevent abuse
- **Input Sanitization** against NoSQL & XSS attacks
- **DTO Validation** for strict schema enforcement
- **Domain-level Authorization**

---

## 📁 Project Structure

```
root/
├── src/
│   ├── app/                # Next.js routes
│   ├── modules/            # Feature-based modules
│   │   ├── auth/
│   │   ├── profile/
│   │   └── ...
│   ├── shared/             # Shared utilities & configs
│   │   ├── lib/
│   │   ├── security/
│   │   └── utils/
│
├── docs/                   # Documentation
│   └── backend/
│       └── BACKEND.md
│
├── README.md
└── package.json
```

---

## 🔄 Request Flow (Backend)

```
Client Request
   ↓
API Route
   ↓
Middleware (CSRF, Rate Limit, Sanitization)
   ↓
Controller
   ↓
Use Case
   ↓
Domain (Authorization)
   ↓
Repository
   ↓
MongoDB (DB Hit)
```

---

## ✨ Features

- Dynamic portfolio sections (skills, services, testimonials, etc.)
- Admin dashboard for content management
- Modular backend architecture
- Secure API design
- Clean UI with responsive design

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd <project-folder>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Create a `.env.local` file:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
```

### 4. Run the development server

```bash
npm run dev
```

App will be available at:

```
http://localhost:3000
```

---

## 📬 API Example

```
PUT /api/v1/profile/coreCompetencySection
```

Payload:

```json
{
  "profileId": "...",
  "heading": "Core Competencies",
  "subHeading": "Technical strengths",
  "items": []
}
```

---

## 📊 Future Improvements

- Add caching (Redis)
- Implement GraphQL layer
- Add CI/CD pipeline
- Improve observability (logging + tracing)

---

## 🤝 Contributing

Contributions are welcome. Please open an issue or submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Swastik Jha**

Software Engineer | Full Stack Developer

---

## ⭐ If you found this useful

Give this repo a star ⭐ to support the project.


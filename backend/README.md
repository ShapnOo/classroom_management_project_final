# Scholaris Backend (Express.js + PostgreSQL)

A robust backend REST API service built with **Express.js** and **PostgreSQL** for the Scholaris Classroom Management System.

---

##  Tech Stack
- **Runtime**: Node.js
- **Language**: TypeScript / JavaScript
- **Framework**: Express.js
- **Database**: PostgreSQL (`pg` connection pool)
- **CORS & Security**: `cors`, `dotenv`

---

## 📁 Folder Structure
```
backend/
├── src/
│   ├── config/          # PostgreSQL database connection pool
│   │   └── db.ts
│   ├── db/              # SQL Schema definitions & seed scripts
│   │   └── schema.sql
│   ├── controllers/     # Route logic & DB transactions
│   ├── routes/          # Express API route modules
│   ├── middleware/      # Auth & error handling middlewares
│   └── server.ts        # Express server entry point
├── .env.example         # Environment variables template
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and set your PostgreSQL credentials:
```bash
cp .env.example .env
```

### 3. Initialize PostgreSQL Database
Make sure PostgreSQL is running, create your database:
```sql
CREATE DATABASE scholaris_db;
```
Run the schema script:
```bash
psql -U postgres -d scholaris_db -f src/db/schema.sql
```

### 4. Start the Development Server
```bash
npm run dev
```
The server will start on `http://localhost:5000`.
Health check endpoint: `http://localhost:5000/api/health`.

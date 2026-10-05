import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/db.js";
import { initDatabase } from "./db/init.js";
import adminRoutes from "./routes/admin/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health Check API
app.get("/api/health", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT NOW() as current_time");
    res.json({
      status: "healthy",
      timestamp: result.rows[0].current_time,
      service: "Scholaris Express Backend",
      database: "PostgreSQL connected",
    });
  } catch (error: any) {
    res.status(500).json({
      status: "unhealthy",
      error: error.message,
      service: "Scholaris Express Backend",
    });
  }
});

// Admin Panel API Routes
app.use("/api/admin", adminRoutes);

// Root API Welcome & Endpoint Discovery
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Welcome to Scholaris Management System Backend API",
    version: "1.0.0",
    modules: {
      admin: {
        academic: "/api/admin/academic/(departments|programs|sessions|batches|courses|syllabus)",
        users: "/api/admin/users/(teachers|students|admins)",
        classrooms: "/api/admin/classrooms",
        schedules: "/api/admin/classrooms/schedules",
        activities: "/api/admin/activities/(sessions|attendance|assignments|tests|results)",
        announcements: "/api/admin/announcements",
        reports: "/api/admin/reports/(dashboard-stats|attendance)",
        settings: "/api/admin/settings"
      },
      health: "/api/health"
    }
  });
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Internal Server Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

app.listen(PORT, async () => {
  console.log(` Scholaris Express Server running on http://localhost:${PORT}`);
  
  // Auto-initialize DB & seed demo data if reachable
  try {
    await initDatabase();
  } catch (err: any) {
    console.warn(` Notice: PostgreSQL database auto-init notice (${err.message}). Ensure PostgreSQL is running and .env is configured.`);
  }
});

export default app;

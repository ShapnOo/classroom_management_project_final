import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { pool } from "./config/db.js";
import { initDatabase } from "./db/init.js";
import { swaggerSpec } from "./config/swagger.js";
import adminRoutes from "./routes/admin/index.js";
import authRoutes from "./routes/auth.routes.js";
import { sendError, sendSuccess } from "./utils/response.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Swagger UI Documentation ────────────────────────────────────────────────
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "Scholaris API Documentation",
  customCss: ".swagger-ui .topbar { display: none }",
}));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api/docs.json", (req: Request, res: Response) => {
  res.json(swaggerSpec);
});

// Health Check API
app.get("/api/health", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT NOW() as current_time");
    sendSuccess(res, {
      status: "healthy",
      timestamp: result.rows[0].current_time,
      service: "Scholaris Express Backend",
      database: "PostgreSQL connected",
      docs: `http://localhost:${PORT}/api/docs`,
    }, "Scholaris Backend API is running smoothly");
  } catch (error: any) {
    sendError(res, "Database connection error", 500, error.message);
  }
});

// Auth Routes (Login, Token Verification, Profile)
app.use("/api/auth", authRoutes);

// Admin Panel API Routes
app.use("/api/admin", adminRoutes);

// Root API Welcome & Endpoint Discovery
app.get("/", (req: Request, res: Response) => {
  sendSuccess(res, {
    version: "1.0.0",
    docs: `http://localhost:${PORT}/api/docs`,
    modules: {
      auth: {
        login: "POST /api/auth/login",
        me: "GET /api/auth/me (Bearer Auth)",
        logout: "POST /api/auth/logout (Bearer Auth)"
      },
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
  }, "Welcome to Scholaris Management System Backend API");
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
  console.log(` Swagger API Documentation available at http://localhost:${PORT}/api/docs`);
  
  // Auto-initialize DB & seed demo data if reachable
  try {
    await initDatabase();
  } catch (err: any) {
    console.warn(` Notice: PostgreSQL database auto-init notice (${err.message}). Ensure PostgreSQL is running and .env is configured.`);
  }
});

export default app;

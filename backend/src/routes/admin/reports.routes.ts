import { Router } from "express";
import { getDashboardStats, getAttendanceReport } from "../../controllers/admin/reports.controller.js";

const router = Router();

router.get("/dashboard-stats", getDashboardStats);
router.get("/attendance", getAttendanceReport);

export default router;

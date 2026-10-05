import { Router } from "express";
import { getAdminDashboardSummary, getTeacherDashboardSummary } from "../../controllers/admin/dashboard.controller.js";

const router = Router();

router.get("/", getAdminDashboardSummary);
router.get("/teacher-stats", getTeacherDashboardSummary);

export default router;

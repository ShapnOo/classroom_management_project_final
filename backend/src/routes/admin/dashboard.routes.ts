import { Router } from "express";
import { getAdminDashboardSummary } from "../../controllers/admin/dashboard.controller.js";

const router = Router();

router.get("/", getAdminDashboardSummary);

export default router;

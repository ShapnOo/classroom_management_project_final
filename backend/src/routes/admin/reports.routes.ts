import { Router } from "express";
import { getDashboardStats, getAttendanceReport, getStudentTranscript, getSessionSemesterResults } from "../../controllers/admin/reports.controller.js";

const router = Router();

router.get("/dashboard-stats", getDashboardStats);
router.get("/attendance", getAttendanceReport);
router.get("/transcripts/:studentId", getStudentTranscript);
router.get("/session-semester-results", getSessionSemesterResults);

export default router;

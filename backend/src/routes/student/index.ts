import { Router } from "express";
import { optionalAuth } from "../../middleware/auth.js";
import {
  getStudentDashboard,
  getStudentClassrooms,
  getStudentSchedules,
  getStudentMaterials,
  getStudentAssignments,
  submitAssignment,
  getStudentTests,
  getStudentAttendance,
  getStudentResults,
} from "../../controllers/student/student.controller.js";

const router = Router();

// Apply optional JWT authorization middleware so authenticated requests decode req.user
router.use(optionalAuth);

router.get("/dashboard", getStudentDashboard);
router.get("/classrooms", getStudentClassrooms);
router.get("/schedules", getStudentSchedules);
router.get("/materials", getStudentMaterials);
router.get("/assignments", getStudentAssignments);
router.post("/assignments/:id/submit", submitAssignment);
router.get("/tests", getStudentTests);
router.get("/attendance", getStudentAttendance);
router.get("/results", getStudentResults);

export default router;

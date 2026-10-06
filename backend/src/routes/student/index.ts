import { Router } from "express";
import {
  getStudentDashboard,
  getStudentClassrooms,
  getStudentMaterials,
  getStudentAssignments,
  submitAssignment,
  getStudentTests,
  getStudentAttendance,
  getStudentResults,
} from "../../controllers/student/student.controller.js";

const router = Router();

router.get("/dashboard", getStudentDashboard);
router.get("/classrooms", getStudentClassrooms);
router.get("/materials", getStudentMaterials);
router.get("/assignments", getStudentAssignments);
router.post("/assignments/:id/submit", submitAssignment);
router.get("/tests", getStudentTests);
router.get("/attendance", getStudentAttendance);
router.get("/results", getStudentResults);

export default router;

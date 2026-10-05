import { Router } from "express";
import {
  getClassSessions, createClassSession,
  getAttendanceLogs, saveAttendance,
  getAssignments, createAssignment, updateAssignment, deleteAssignment,
  getTests, createTest, updateTest, deleteTest,
  getResults, saveGradeRecord
} from "../../controllers/admin/activities.controller.js";

const router = Router();

// Sessions & Attendance
router.get("/sessions", getClassSessions);
router.post("/sessions", createClassSession);
router.get("/attendance", getAttendanceLogs);
router.post("/attendance", saveAttendance);

// Assignments
router.get("/assignments", getAssignments);
router.post("/assignments", createAssignment);
router.put("/assignments/:id", updateAssignment);
router.delete("/assignments/:id", deleteAssignment);

// Tests
router.get("/tests", getTests);
router.post("/tests", createTest);
router.put("/tests/:id", updateTest);
router.delete("/tests/:id", deleteTest);

// Grades
router.get("/results", getResults);
router.post("/results", saveGradeRecord);

export default router;

import { Router } from "express";
import {
  getClassSessions, createClassSession,
  getAttendanceLogs, saveAttendance,
  getAssignments, createAssignment, updateAssignment, deleteAssignment,
  getAssignmentSubmissions,
  getTests, createTest, updateTest, deleteTest,
  getResults, saveGradeRecord,
  getMaterials, createMaterial, deleteMaterial,
  getSlideState, saveSlideState, getAllSlideStates
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
router.get("/assignments/:id/submissions", getAssignmentSubmissions);
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

// Materials & Slide States
router.get("/materials", getMaterials);
router.post("/materials", createMaterial);
router.delete("/materials/:id", deleteMaterial);
router.get("/materials/slide-states", getAllSlideStates);
router.get("/materials/slide-state/:materialId", getSlideState);
router.put("/materials/slide-state/:materialId", saveSlideState);
router.post("/materials/slide-state/:materialId", saveSlideState);

export default router;


import { Router } from "express";
import { authenticateToken, authorizeRoles } from "../../middleware/auth.js";
import { getTeacherDashboardSummary } from "../../controllers/admin/dashboard.controller.js";
import { getClassrooms, getClassroomById, getSchedules } from "../../controllers/admin/classrooms.controller.js";
import { 
  getCourses, 
  getSyllabusTopics, 
  createSyllabusTopic, 
  updateSyllabusTopic, 
  deleteSyllabusTopic 
} from "../../controllers/admin/academic.controller.js";
import { getStudents } from "../../controllers/admin/users.controller.js";
import {
  getClassSessions, createClassSession,
  getAttendanceLogs, saveAttendance,
  getAssignments, createAssignment, updateAssignment, deleteAssignment,
  getTests, createTest, updateTest, deleteTest,
  getResults, saveGradeRecord,
  getMaterials, createMaterial, deleteMaterial
} from "../../controllers/admin/activities.controller.js";

const router = Router();

// Apply JWT Authentication and Teacher/Admin Role Requirement
router.use(authenticateToken, authorizeRoles("teacher", "admin"));

// Dedicated Teacher Portal Endpoints
router.get("/dashboard", getTeacherDashboardSummary);
router.get("/classrooms", getClassrooms);
router.get("/classrooms/:id", getClassroomById);
router.get("/schedules", getSchedules);

router.get("/courses", getCourses);
router.get("/syllabus", getSyllabusTopics);
router.post("/syllabus", createSyllabusTopic);
router.put("/syllabus/:id", updateSyllabusTopic);
router.delete("/syllabus/:id", deleteSyllabusTopic);
router.get("/students", getStudents);

// Activities, Attendance & Grading
router.get("/sessions", getClassSessions);
router.post("/sessions", createClassSession);
router.get("/attendance", getAttendanceLogs);
router.post("/attendance", saveAttendance);

router.get("/assignments", getAssignments);
router.post("/assignments", createAssignment);
router.put("/assignments/:id", updateAssignment);
router.delete("/assignments/:id", deleteAssignment);

router.get("/tests", getTests);
router.post("/tests", createTest);
router.put("/tests/:id", updateTest);
router.delete("/tests/:id", deleteTest);

router.get("/results", getResults);
router.post("/results", saveGradeRecord);

router.get("/materials", getMaterials);
import { getReschedules, createReschedule, updateRescheduleStatus } from "../../controllers/teacher/reschedule.controller.js";

// Class Rescheduling & Teacher Slot Exchange
router.get("/reschedules", getReschedules);
router.post("/reschedules", createReschedule);
router.put("/reschedules/:id/status", updateRescheduleStatus);

export default router;

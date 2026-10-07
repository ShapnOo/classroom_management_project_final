import { Router } from "express";
import {
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getPrograms, createProgram, updateProgram, deleteProgram,
  getSessions, createSession, updateSession, deleteSession,
  getBatches, createBatch, updateBatch, deleteBatch,
  getCourses, createCourse, updateCourse, deleteCourse,
  getSyllabusTopics, createSyllabusTopic, updateSyllabusTopic, deleteSyllabusTopic,
  executeBatchPromotion, getPromotionQueue, getPromotionHistory, getNonPromotedStudents, reintegrateStudent, submitImprovementMarks,
  getRescheduleRequests, updateRescheduleRequest,
  getCampusRooms, updateCampusRoom
} from "../../controllers/admin/academic.controller.js";

const router = Router();

// Departments
router.get("/departments", getDepartments);
router.post("/departments", createDepartment);
router.put("/departments/:id", updateDepartment);
router.delete("/departments/:id", deleteDepartment);

// Programs
router.get("/programs", getPrograms);
router.post("/programs", createProgram);
router.put("/programs/:id", updateProgram);
router.delete("/programs/:id", deleteProgram);

// Sessions
router.get("/sessions", getSessions);
router.post("/sessions", createSession);
router.put("/sessions/:id", updateSession);
router.delete("/sessions/:id", deleteSession);

// Batches
router.get("/batches", getBatches);
router.post("/batches", createBatch);
router.put("/batches/:id", updateBatch);
router.delete("/batches/:id", deleteBatch);

// Batch Promotion & Student Progression
router.get("/promotion-queue", getPromotionQueue);
router.get("/promotion-history", getPromotionHistory);
router.get("/non-promoted-students", getNonPromotedStudents);
router.post("/reintegrate-student", reintegrateStudent);
router.post("/submit-improvement-marks", submitImprovementMarks);
router.post("/batch-promotion", executeBatchPromotion);

// Reschedule Requests
router.get("/reschedules", getRescheduleRequests);
router.patch("/reschedules/:id", updateRescheduleRequest);

// Campus Rooms
router.get("/rooms", getCampusRooms);
router.patch("/rooms/:id", updateCampusRoom);

// Courses
router.get("/courses", getCourses);
router.post("/courses", createCourse);
router.put("/courses/:id", updateCourse);
router.delete("/courses/:id", deleteCourse);

// Syllabus Topics
router.get("/syllabus", getSyllabusTopics);
router.post("/syllabus", createSyllabusTopic);
router.put("/syllabus/:id", updateSyllabusTopic);
router.delete("/syllabus/:id", deleteSyllabusTopic);

export default router;

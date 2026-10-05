import { Router } from "express";
import {
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getPrograms, createProgram, updateProgram, deleteProgram,
  getSessions, createSession, updateSession, deleteSession,
  getBatches, createBatch, updateBatch, deleteBatch,
  getCourses, createCourse, updateCourse, deleteCourse,
  getSyllabusTopics, createSyllabusTopic, updateSyllabusTopic, deleteSyllabusTopic
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

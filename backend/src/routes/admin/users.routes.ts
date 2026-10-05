import { Router } from "express";
import {
  getTeachers, createTeacher, updateTeacher, deleteTeacher,
  getStudents, createStudent, updateStudent, deleteStudent,
  getAdmins, createAdmin, deleteAdmin
} from "../../controllers/admin/users.controller.js";

const router = Router();

// Teachers
router.get("/teachers", getTeachers);
router.post("/teachers", createTeacher);
router.put("/teachers/:id", updateTeacher);
router.delete("/teachers/:id", deleteTeacher);

// Students
router.get("/students", getStudents);
router.post("/students", createStudent);
router.put("/students/:id", updateStudent);
router.delete("/students/:id", deleteStudent);

// Admins
router.get("/admins", getAdmins);
router.post("/admins", createAdmin);
router.delete("/admins/:id", deleteAdmin);

export default router;

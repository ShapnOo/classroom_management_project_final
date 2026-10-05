import { Router } from "express";
import {
  getClassrooms, getClassroomById, createClassroom, updateClassroom, deleteClassroom,
  getSchedules, createSchedule, deleteSchedule
} from "../../controllers/admin/classrooms.controller.js";

const router = Router();

// Class Schedules
router.get("/schedules/all", getSchedules);
router.get("/schedules", getSchedules);
router.post("/schedules", createSchedule);
router.delete("/schedules/:id", deleteSchedule);

// Classrooms CRUD
router.get("/", getClassrooms);
router.get("/:id", getClassroomById);
router.post("/", createClassroom);
router.put("/:id", updateClassroom);
router.delete("/:id", deleteClassroom);

export default router;

import { Router } from "express";
import {
  getClassrooms, getClassroomById, createClassroom, updateClassroom, deleteClassroom,
  getSchedules, createSchedule, deleteSchedule
} from "../../controllers/admin/classrooms.controller.js";

const router = Router();

// Classrooms
router.get("/classrooms", getClassrooms);
router.get("/classrooms/:id", getClassroomById);
router.post("/classrooms", createClassroom);
router.put("/classrooms/:id", updateClassroom);
router.delete("/classrooms/:id", deleteClassroom);

// Schedules
router.get("/schedules", getSchedules);
router.post("/schedules", createSchedule);
router.delete("/schedules/:id", deleteSchedule);

export default router;

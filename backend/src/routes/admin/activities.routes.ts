import { Router } from "express";
import {
  getClassSessions,
  getAttendanceLogs,
  getAssignments,
  getTests,
  getResults,
} from "../../controllers/admin/activities.controller.js";

const router = Router();

router.get("/sessions", getClassSessions);
router.get("/attendance", getAttendanceLogs);
router.get("/assignments", getAssignments);
router.get("/tests", getTests);
router.get("/results", getResults);

export default router;

import { Router } from "express";
import academicRoutes from "./academic.routes.js";
import usersRoutes from "./users.routes.js";
import classroomsRoutes from "./classrooms.routes.js";
import activitiesRoutes from "./activities.routes.js";
import announcementsRoutes from "./announcements.routes.js";
import settingsRoutes from "./settings.routes.js";
import reportsRoutes from "./reports.routes.js";

const router = Router();

// Mount all admin sub-modules
router.use("/academic", academicRoutes);
router.use("/users", usersRoutes);
router.use("/classrooms", classroomsRoutes);
router.use("/activities", activitiesRoutes);
router.use("/announcements", announcementsRoutes);
router.use("/settings", settingsRoutes);
router.use("/reports", reportsRoutes);

export default router;

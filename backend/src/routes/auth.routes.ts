import { Router } from "express";
import { login, getProfile, logout } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.post("/login", login);
router.get("/me", authenticateToken, getProfile);
router.post("/logout", authenticateToken, logout);

export default router;

import { Router } from "express";
import {
  lookupStudentAdmission,
  verifyStudentOtp,
  submitStudentOnboarding,
  getPublicLandingData,
} from "../../controllers/public/onboarding.controller.js";

const router = Router();

// Public Landing Page Data & Stats
router.get("/landing-data", getPublicLandingData);

// E-Recruitment / Student Verification & Onboarding API
router.post("/onboarding/lookup", lookupStudentAdmission);
router.post("/onboarding/verify-otp", verifyStudentOtp);
router.post("/onboarding/submit", submitStudentOnboarding);

export default router;


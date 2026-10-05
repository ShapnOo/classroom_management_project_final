import { Request, Response } from "express";
import { pool } from "../../config/db.js";

// In-memory or key-value settings table
let settingsState = {
  schoolName: "Scholaris Academic Management",
  logoBase64: "",
};

export const getSettings = async (req: Request, res: Response) => {
  res.json(settingsState);
};

export const updateSettings = async (req: Request, res: Response) => {
  const { schoolName, logoBase64 } = req.body;
  if (schoolName !== undefined) settingsState.schoolName = schoolName;
  if (logoBase64 !== undefined) settingsState.logoBase64 = logoBase64;
  res.json(settingsState);
};

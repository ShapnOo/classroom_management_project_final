import { Request, Response } from "express";
import { pool } from "../../config/db.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export const getSettings = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query("SELECT * FROM app_settings WHERE id = 'default' LIMIT 1");
    if (rows.length > 0) {
      return sendSuccess(res, {
        schoolName: rows[0].school_name,
        logoBase64: rows[0].logo_base64 || "",
      }, "Settings retrieved successfully");
    }
    return sendSuccess(res, {
      schoolName: "Jahangirnagar University",
      logoBase64: "",
    }, "Default settings retrieved");
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    sendError(res, "Failed to fetch application settings", 500, error.message);
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { schoolName, logoBase64 } = req.body;
    const name = schoolName ?? "Jahangirnagar University";
    const logo = logoBase64 ?? "";

    const { rows } = await pool.query(
      `INSERT INTO app_settings (id, school_name, logo_base64, updated_at)
       VALUES ('default', $1, $2, NOW())
       ON CONFLICT (id) DO UPDATE 
       SET school_name = EXCLUDED.school_name,
           logo_base64 = EXCLUDED.logo_base64,
           updated_at = NOW()
       RETURNING school_name, logo_base64`,
      [name, logo]
    );

    sendSuccess(res, {
      schoolName: rows[0].school_name,
      logoBase64: rows[0].logo_base64 || "",
    }, "Settings updated successfully");
  } catch (error: any) {
    console.error("Error updating settings:", error);
    sendError(res, "Failed to update application settings", 500, error.message);
  }
};

import { Request, Response } from "express";
import { pool } from "../../config/db.js";

export const getSettings = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query("SELECT * FROM app_settings WHERE id = 'default' LIMIT 1");
    if (rows.length > 0) {
      return res.json({
        schoolName: rows[0].school_name,
        logoBase64: rows[0].logo_base64 || "",
      });
    }
    return res.json({
      schoolName: "Jahangirnagar University",
      logoBase64: "",
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Failed to fetch application settings" });
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

    res.json({
      schoolName: rows[0].school_name,
      logoBase64: rows[0].logo_base64 || "",
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: "Failed to update application settings" });
  }
};

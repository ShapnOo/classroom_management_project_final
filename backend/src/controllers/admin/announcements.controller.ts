import { Request, Response } from "express";
import { pool } from "../../config/db.js";
import crypto from "crypto";

const genId = () => Date.now().toString(36) + crypto.randomBytes(3).toString("hex");

export const getAnnouncements = async (req: Request, res: Response) => {
  try {
    const { audienceType } = req.query;
    let queryText = "SELECT * FROM announcements";
    const params: any[] = [];
    if (audienceType) {
      queryText += " WHERE audience_type = $1";
      params.push(audienceType);
    }
    queryText += " ORDER BY date DESC, created_at DESC";

    const { rows } = await pool.query(queryText, params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const { title, content, authorName, authorId, audienceType, programId, batchId, courseId, priority, status } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }
    const id = genId();
    const { rows } = await pool.query(`
      INSERT INTO announcements (id, title, content, date, author_id, author_name, author_role, audience_type, program_id, batch_id, course_id, status, priority)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *
    `, [
      id,
      title,
      content,
      new Date().toISOString().split("T")[0],
      authorId || "admin-1",
      authorName || "Administration",
      "Admin",
      audienceType || "Global",
      programId || null,
      batchId || null,
      courseId || null,
      status || "Published",
      priority || "Normal",
    ]);
    res.status(201).json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, priority, status, audienceType } = req.body;
    const { rows } = await pool.query(`
      UPDATE announcements 
      SET title = COALESCE($1, title),
          content = COALESCE($2, content),
          priority = COALESCE($3, priority),
          status = COALESCE($4, status),
          audience_type = COALESCE($5, audience_type)
      WHERE id = $6 RETURNING *
    `, [title, content, priority, status, audienceType, id]);
    if (rows.length === 0) return res.status(404).json({ error: "Announcement not found" });
    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM announcements WHERE id = $1", [id]);
    res.json({ message: "Announcement deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

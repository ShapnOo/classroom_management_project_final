import { Request, Response } from "express";
import { pool } from "../../config/db.js";
import crypto from "crypto";

const genId = () => Date.now().toString(36) + crypto.randomBytes(3).toString("hex");

// ── CLASS SESSIONS ────────────────────────────────────────────────────────────
export const getClassSessions = async (req: Request, res: Response) => {
  try {
    const { classroomId } = req.query;
    let queryText = `
      SELECT cs.*, c.room, cr.title as course_title, cr.code as course_code,
             b.name as batch_name, t.name as teacher_name,
             (SELECT COUNT(*) FROM attendance_records ar WHERE ar.session_id = cs.id AND ar.status = 'present')::int as present_count,
             (SELECT COUNT(*) FROM attendance_records ar WHERE ar.session_id = cs.id AND ar.status = 'absent')::int as absent_count,
             (SELECT COUNT(*) FROM attendance_records ar WHERE ar.session_id = cs.id AND ar.status = 'late')::int as late_count
      FROM class_sessions cs
      JOIN classrooms c ON cs.classroom_id = c.id
      JOIN courses cr ON c.course_id = cr.id
      JOIN batches b ON c.batch_id = b.id
      JOIN teachers t ON c.teacher_id = t.id
    `;
    const params: any[] = [];
    if (classroomId) {
      queryText += " WHERE cs.classroom_id = $1";
      params.push(classroomId);
    }
    queryText += " ORDER BY cs.conducted_at DESC";

    const { rows } = await pool.query(queryText, params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ── ATTENDANCE ────────────────────────────────────────────────────────────────
export const getAttendanceLogs = async (req: Request, res: Response) => {
  try {
    const { classroomId, sessionId } = req.query;
    let queryText = `
      SELECT ar.*, s.name as student_name, s.roll_no as student_roll_no, s.email as student_email,
             cs.topic_covered, cs.date as session_date
      FROM attendance_records ar
      JOIN students s ON ar.student_id = s.id
      JOIN class_sessions cs ON ar.session_id = cs.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (classroomId) {
      params.push(classroomId);
      conditions.push(`ar.classroom_id = $${params.length}`);
    }
    if (sessionId) {
      params.push(sessionId);
      conditions.push(`ar.session_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      queryText += " WHERE " + conditions.join(" AND ");
    }
    queryText += " ORDER BY cs.date DESC, s.roll_no ASC";

    const { rows } = await pool.query(queryText, params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ── ASSIGNMENTS ───────────────────────────────────────────────────────────────
export const getAssignments = async (req: Request, res: Response) => {
  try {
    const { classroomId } = req.query;
    let queryText = `
      SELECT a.*, cr.title as course_title, cr.code as course_code, b.name as batch_name, t.name as teacher_name
      FROM assignments a
      JOIN classrooms c ON a.classroom_id = c.id
      JOIN courses cr ON c.course_id = cr.id
      JOIN batches b ON c.batch_id = b.id
      JOIN teachers t ON c.teacher_id = t.id
    `;
    const params: any[] = [];
    if (classroomId) {
      queryText += " WHERE a.classroom_id = $1";
      params.push(classroomId);
    }
    queryText += " ORDER BY a.due_date DESC";

    const { rows } = await pool.query(queryText, params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ── TESTS ─────────────────────────────────────────────────────────────────────
export const getTests = async (req: Request, res: Response) => {
  try {
    const { classroomId } = req.query;
    let queryText = `
      SELECT tst.*, cr.title as course_title, cr.code as course_code, b.name as batch_name, t.name as teacher_name
      FROM tests tst
      JOIN classrooms c ON tst.classroom_id = c.id
      JOIN courses cr ON c.course_id = cr.id
      JOIN batches b ON c.batch_id = b.id
      JOIN teachers t ON c.teacher_id = t.id
    `;
    const params: any[] = [];
    if (classroomId) {
      queryText += " WHERE tst.classroom_id = $1";
      params.push(classroomId);
    }
    queryText += " ORDER BY tst.test_date DESC";

    const { rows } = await pool.query(queryText, params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ── RESULTS & GRADES ──────────────────────────────────────────────────────────
export const getResults = async (req: Request, res: Response) => {
  try {
    const { classroomId } = req.query;
    let queryText = `
      SELECT gr.*, s.name as student_name, s.roll_no as student_roll_no,
             cr.title as course_title, cr.code as course_code, b.name as batch_name,
             a.title as assignment_title, tst.title as test_title
      FROM grade_records gr
      JOIN students s ON gr.student_id = s.id
      JOIN classrooms c ON gr.classroom_id = c.id
      JOIN courses cr ON c.course_id = cr.id
      JOIN batches b ON c.batch_id = b.id
      LEFT JOIN assignments a ON gr.assignment_id = a.id
      LEFT JOIN tests tst ON gr.test_id = tst.id
    `;
    const params: any[] = [];
    if (classroomId) {
      queryText += " WHERE gr.classroom_id = $1";
      params.push(classroomId);
    }
    queryText += " ORDER BY s.roll_no ASC, gr.created_at DESC";

    const { rows } = await pool.query(queryText, params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

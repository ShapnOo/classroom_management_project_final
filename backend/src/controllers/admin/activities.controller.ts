import { Request, Response } from "express";
import { pool } from "../../config/db.js";
import { sendSuccess, sendError } from "../../utils/response.js";
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
    sendSuccess(res, rows, "Class sessions retrieved successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const createClassSession = async (req: Request, res: Response) => {
  try {
    const { classroomId, date, topicCovered, notes, duration } = req.body;
    if (!classroomId || !topicCovered) {
      return sendError(res, "Classroom ID and topic are required", 400);
    }
    const id = genId();
    const { rows } = await pool.query(`
      INSERT INTO class_sessions (id, classroom_id, date, topic_covered, notes, duration)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [id, classroomId, date || new Date().toISOString(), topicCovered, notes || "", duration || "1h 30m"]);
    sendSuccess(res, rows[0], "Class session recorded successfully", 201);
  } catch (err: any) {
    sendError(res, err.message);
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
    sendSuccess(res, rows, "Attendance logs retrieved successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const saveAttendance = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { records } = req.body; // Array of { sessionId, classroomId, studentId, status }
    if (!records || !Array.isArray(records)) {
      return sendError(res, "Records array is required", 400);
    }

    await client.query("BEGIN");
    for (const r of records) {
      const id = genId();
      await client.query(`
        INSERT INTO attendance_records (id, session_id, classroom_id, student_id, status)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (session_id, student_id) DO UPDATE SET status = EXCLUDED.status
      `, [id, r.sessionId, r.classroomId, r.studentId, r.status]);
    }
    await client.query("COMMIT");
    sendSuccess(res, { count: records.length }, "Attendance saved successfully");
  } catch (err: any) {
    await client.query("ROLLBACK");
    sendError(res, err.message);
  } finally {
    client.release();
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
    sendSuccess(res, rows, "Assignments retrieved successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const createAssignment = async (req: Request, res: Response) => {
  try {
    const { classroomId, title, description, dueDate, totalMarks, status } = req.body;
    if (!classroomId || !title || !dueDate) {
      return sendError(res, "Classroom, title, and due date are required", 400);
    }
    const id = genId();
    const { rows } = await pool.query(`
      INSERT INTO assignments (id, classroom_id, title, description, due_date, total_marks, status, submissions)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 0) RETURNING *
    `, [id, classroomId, title, description || "", dueDate, totalMarks || 20, status || "Active"]);
    sendSuccess(res, rows[0], "Assignment created successfully", 201);
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const updateAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, totalMarks, status, submissions } = req.body;
    const { rows } = await pool.query(`
      UPDATE assignments 
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          due_date = COALESCE($3, due_date),
          total_marks = COALESCE($4, total_marks),
          status = COALESCE($5, status),
          submissions = COALESCE($6, submissions)
      WHERE id = $7 RETURNING *
    `, [title, description, dueDate, totalMarks, status, submissions, id]);
    if (rows.length === 0) return sendError(res, "Assignment not found", 404);
    sendSuccess(res, rows[0], "Assignment updated successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const deleteAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM assignments WHERE id = $1", [id]);
    sendSuccess(res, { id }, "Assignment deleted successfully");
  } catch (err: any) {
    sendError(res, err.message);
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
    sendSuccess(res, rows, "Tests retrieved successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const createTest = async (req: Request, res: Response) => {
  try {
    const { classroomId, title, description, testDate, duration, totalMarks, status } = req.body;
    if (!classroomId || !title || !testDate) {
      return sendError(res, "Classroom, title, and test date are required", 400);
    }
    const id = genId();
    const { rows } = await pool.query(`
      INSERT INTO tests (id, classroom_id, title, description, test_date, duration, total_marks, status, submissions)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0) RETURNING *
    `, [id, classroomId, title, description || "", testDate, duration || "1h", totalMarks || 25, status || "Upcoming"]);
    sendSuccess(res, rows[0], "Test scheduled successfully", 201);
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const updateTest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, testDate, duration, totalMarks, status, submissions } = req.body;
    const { rows } = await pool.query(`
      UPDATE tests 
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          test_date = COALESCE($3, test_date),
          duration = COALESCE($4, duration),
          total_marks = COALESCE($5, total_marks),
          status = COALESCE($6, status),
          submissions = COALESCE($7, submissions)
      WHERE id = $8 RETURNING *
    `, [title, description, testDate, duration, totalMarks, status, submissions, id]);
    if (rows.length === 0) return sendError(res, "Test not found", 404);
    sendSuccess(res, rows[0], "Test updated successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const deleteTest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM tests WHERE id = $1", [id]);
    sendSuccess(res, { id }, "Test deleted successfully");
  } catch (err: any) {
    sendError(res, err.message);
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
    sendSuccess(res, rows, "Grade records retrieved successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const saveGradeRecord = async (req: Request, res: Response) => {
  try {
    const { classroomId, studentId, assignmentId, testId, obtainedMarks, totalMarks, remarks } = req.body;
    if (!classroomId || !studentId || obtainedMarks === undefined || totalMarks === undefined) {
      return sendError(res, "Classroom, student, obtained marks, and total marks are required", 400);
    }
    const id = genId();
    const { rows } = await pool.query(`
      INSERT INTO grade_records (id, classroom_id, student_id, assignment_id, test_id, obtained_marks, total_marks, remarks)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, [id, classroomId, studentId, assignmentId || null, testId || null, obtainedMarks, totalMarks, remarks || ""]);
    sendSuccess(res, rows[0], "Grade recorded successfully", 201);
  } catch (err: any) {
    sendError(res, err.message);
  }
};

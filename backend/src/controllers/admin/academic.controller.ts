import { Request, Response } from "express";
import { pool } from "../../config/db.js";
import crypto from "crypto";

const genId = () => Date.now().toString(36) + crypto.randomBytes(3).toString("hex");

// ── DEPARTMENTS ───────────────────────────────────────────────────────────────
export const getDepartments = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query("SELECT * FROM departments ORDER BY name ASC");
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) return res.status(400).json({ error: "Name and code are required" });

    const id = genId();
    const { rows } = await pool.query(
      "INSERT INTO departments (id, name, code) VALUES ($1, $2, $3) RETURNING *",
      [id, name, code]
    );
    res.status(201).json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;
    const { rows } = await pool.query(
      "UPDATE departments SET name = COALESCE($1, name), code = COALESCE($2, code) WHERE id = $3 RETURNING *",
      [name, code, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Department not found" });
    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM departments WHERE id = $1", [id]);
    res.json({ message: "Department deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ── PROGRAMS ──────────────────────────────────────────────────────────────────
export const getPrograms = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.*, d.name as department_name, d.code as department_code 
      FROM programs p
      LEFT JOIN departments d ON p.department_id = d.id
      ORDER BY p.name ASC
    `);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createProgram = async (req: Request, res: Response) => {
  try {
    const { departmentId, name, code, duration } = req.body;
    if (!departmentId || !name || !code) {
      return res.status(400).json({ error: "Department, name, and code are required" });
    }
    const id = genId();
    const { rows } = await pool.query(
      "INSERT INTO programs (id, department_id, name, code, duration) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [id, departmentId, name, code, duration || "4 Years"]
    );
    res.status(201).json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProgram = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { departmentId, name, code, duration } = req.body;
    const { rows } = await pool.query(`
      UPDATE programs 
      SET department_id = COALESCE($1, department_id),
          name = COALESCE($2, name),
          code = COALESCE($3, code),
          duration = COALESCE($4, duration)
      WHERE id = $5 RETURNING *
    `, [departmentId, name, code, duration, id]);
    if (rows.length === 0) return res.status(404).json({ error: "Program not found" });
    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteProgram = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM programs WHERE id = $1", [id]);
    res.json({ message: "Program deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ── SESSIONS ──────────────────────────────────────────────────────────────────
export const getSessions = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query("SELECT * FROM academic_sessions ORDER BY start_date DESC");
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createSession = async (req: Request, res: Response) => {
  try {
    const { name, startDate, endDate, status } = req.body;
    if (!name || !startDate || !endDate) {
      return res.status(400).json({ error: "Name, start date, and end date are required" });
    }
    const id = genId();
    const { rows } = await pool.query(
      "INSERT INTO academic_sessions (id, name, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [id, name, startDate, endDate, status || "Active"]
    );
    res.status(201).json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate, status } = req.body;
    const { rows } = await pool.query(`
      UPDATE academic_sessions 
      SET name = COALESCE($1, name),
          start_date = COALESCE($2, start_date),
          end_date = COALESCE($3, end_date),
          status = COALESCE($4, status)
      WHERE id = $5 RETURNING *
    `, [name, startDate, endDate, status, id]);
    if (rows.length === 0) return res.status(404).json({ error: "Session not found" });
    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM academic_sessions WHERE id = $1", [id]);
    res.json({ message: "Session deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ── BATCHES ───────────────────────────────────────────────────────────────────
export const getBatches = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT b.*, p.name as program_name, p.code as program_code, s.name as session_name,
             (SELECT COUNT(*) FROM students st WHERE st.batch_id = b.id)::int as student_count
      FROM batches b
      LEFT JOIN programs p ON b.program_id = p.id
      LEFT JOIN academic_sessions s ON b.session_id = s.id
      ORDER BY b.name ASC
    `);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createBatch = async (req: Request, res: Response) => {
  try {
    const { code, name, programId, sessionId, section, status, semesterCount } = req.body;
    if (!code || !name || !programId || !sessionId) {
      return res.status(400).json({ error: "Code, name, program, and session are required" });
    }
    const id = genId();
    const { rows } = await pool.query(`
      INSERT INTO batches (id, code, name, program_id, session_id, section, status, semester_count)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, [id, code, name, programId, sessionId, section || "A", status || "Active", semesterCount || 4]);
    res.status(201).json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateBatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { code, name, programId, sessionId, section, status, semesterCount } = req.body;
    const { rows } = await pool.query(`
      UPDATE batches 
      SET code = COALESCE($1, code),
          name = COALESCE($2, name),
          program_id = COALESCE($3, program_id),
          session_id = COALESCE($4, session_id),
          section = COALESCE($5, section),
          status = COALESCE($6, status),
          semester_count = COALESCE($7, semester_count)
      WHERE id = $8 RETURNING *
    `, [code, name, programId, sessionId, section, status, semesterCount, id]);
    if (rows.length === 0) return res.status(404).json({ error: "Batch not found" });
    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteBatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM batches WHERE id = $1", [id]);
    res.json({ message: "Batch deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ── COURSES ───────────────────────────────────────────────────────────────────
export const getCourses = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.*, p.name as program_name, p.code as program_code
      FROM courses c
      LEFT JOIN programs p ON c.program_id = p.id
      ORDER BY c.code ASC
    `);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const { code, title, programId, credits } = req.body;
    if (!code || !title || !programId) {
      return res.status(400).json({ error: "Code, title, and programId are required" });
    }
    const id = genId();
    const { rows } = await pool.query(
      "INSERT INTO courses (id, code, title, program_id, credits) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [id, code, title, programId, credits || 3]
    );
    res.status(201).json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { code, title, programId, credits } = req.body;
    const { rows } = await pool.query(`
      UPDATE courses 
      SET code = COALESCE($1, code),
          title = COALESCE($2, title),
          program_id = COALESCE($3, program_id),
          credits = COALESCE($4, credits)
      WHERE id = $5 RETURNING *
    `, [code, title, programId, credits, id]);
    if (rows.length === 0) return res.status(404).json({ error: "Course not found" });
    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM courses WHERE id = $1", [id]);
    res.json({ message: "Course deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ── SYLLABUS TOPICS ───────────────────────────────────────────────────────────
export const getSyllabusTopics = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.query;
    let queryText = `
      SELECT s.*, c.title as course_title, c.code as course_code
      FROM syllabus_topics s
      JOIN courses c ON s.course_id = c.id
    `;
    const params: any[] = [];
    if (courseId) {
      queryText += " WHERE s.course_id = $1";
      params.push(courseId);
    }
    queryText += " ORDER BY s.week ASC, s.created_at ASC";

    const { rows } = await pool.query(queryText, params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createSyllabusTopic = async (req: Request, res: Response) => {
  try {
    const { courseId, topic, week, subTopics, adminStatus } = req.body;
    if (!courseId || !topic) {
      return res.status(400).json({ error: "Course and topic title are required" });
    }
    const id = genId();
    const { rows } = await pool.query(`
      INSERT INTO syllabus_topics (id, course_id, topic, week, sub_topics, teacher_status, admin_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `, [id, courseId, topic, week || 1, subTopics || [], "pending", adminStatus || "Published"]);
    res.status(201).json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateSyllabusTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { topic, week, subTopics, adminStatus, teacherStatus } = req.body;
    const { rows } = await pool.query(`
      UPDATE syllabus_topics 
      SET topic = COALESCE($1, topic),
          week = COALESCE($2, week),
          sub_topics = COALESCE($3, sub_topics),
          admin_status = COALESCE($4, admin_status),
          teacher_status = COALESCE($5, teacher_status)
      WHERE id = $6 RETURNING *
    `, [topic, week, subTopics, adminStatus, teacherStatus, id]);
    if (rows.length === 0) return res.status(404).json({ error: "Syllabus topic not found" });
    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteSyllabusTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM syllabus_topics WHERE id = $1", [id]);
    res.json({ message: "Syllabus topic deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

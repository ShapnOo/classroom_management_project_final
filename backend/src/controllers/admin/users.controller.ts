import { Request, Response } from "express";
import { pool } from "../../config/db.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import crypto from "crypto";

const genId = () => Date.now().toString(36) + crypto.randomBytes(3).toString("hex");

// ── TEACHERS ──────────────────────────────────────────────────────────────────
export const getTeachers = async (req: Request, res: Response) => {
  try {
    const { departmentId } = req.query;
    let queryText = `
      SELECT t.*, d.name as department_name, d.code as department_code,
             (SELECT COUNT(*) FROM classrooms c WHERE c.teacher_id = t.id)::int as assigned_courses_count
      FROM teachers t
      LEFT JOIN departments d ON t.department_id = d.id
    `;
    const params: any[] = [];
    if (departmentId) {
      queryText += " WHERE t.department_id = $1";
      params.push(departmentId);
    }
    queryText += " ORDER BY t.name ASC";

    const { rows } = await pool.query(queryText, params);
    sendSuccess(res, rows, "Teachers retrieved successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const createTeacher = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { name, email, departmentId, designation } = req.body;
    if (!name || !email) {
      return sendError(res, "Name and email are required", 400);
    }
    const id = genId();
    await client.query("BEGIN");
    await client.query(`
      INSERT INTO users (id, name, email, password_hash, role)
      VALUES ($1, $2, $3, 'teacher123', 'teacher')
      ON CONFLICT (id) DO NOTHING
    `, [id, name, email]);

    const { rows } = await client.query(`
      INSERT INTO teachers (id, name, email, department_id, designation)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [id, name, email, departmentId || null, designation || "Faculty Member"]);
    await client.query("COMMIT");
    sendSuccess(res, rows[0], "Teacher created successfully", 201);
  } catch (err: any) {
    await client.query("ROLLBACK");
    sendError(res, err.message);
  } finally {
    client.release();
  }
};

export const updateTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, departmentId, designation } = req.body;
    const { rows } = await pool.query(`
      UPDATE teachers 
      SET name = COALESCE($1, name),
          email = COALESCE($2, email),
          department_id = COALESCE($3, department_id),
          designation = COALESCE($4, designation)
      WHERE id = $5 RETURNING *
    `, [name, email, departmentId, designation, id]);

    if (rows.length === 0) return sendError(res, "Teacher not found", 404);
    await pool.query("UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email) WHERE id = $3", [name, email, id]);
    sendSuccess(res, rows[0], "Teacher updated successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const deleteTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    sendSuccess(res, { id }, "Teacher deleted successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

// ── STUDENTS ──────────────────────────────────────────────────────────────────
export const getStudents = async (req: Request, res: Response) => {
  try {
    const { batchId } = req.query;
    let queryText = `
      SELECT s.id, s.roll_no as "rollNo", s.name, s.email, s.batch_id as "batchId", s.phone,
             COALESCE(s.documents, '[]'::jsonb) as documents, s.created_at,
             b.name as "batchName", b.code as "batchCode", p.name as "programName"
      FROM students s
      JOIN batches b ON s.batch_id = b.id
      JOIN programs p ON b.program_id = p.id
    `;
    const params: any[] = [];
    if (batchId) {
      queryText += " WHERE s.batch_id = $1";
      params.push(batchId);
    }
    queryText += " ORDER BY s.roll_no ASC";

    const { rows } = await pool.query(queryText, params);
    sendSuccess(res, rows, "Students retrieved successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const createStudent = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { rollNo, name, email, batchId, phone, documents } = req.body;
    if (!rollNo || !name || !email || !batchId || !phone) {
      return sendError(res, "Roll number, name, email, batch, and phone number are required", 400);
    }
    const id = genId();
    await client.query("BEGIN");
    await client.query(`
      INSERT INTO users (id, name, email, password_hash, role)
      VALUES ($1, $2, $3, 'student123', 'student')
      ON CONFLICT (id) DO NOTHING
    `, [id, name, email]);

    const docsJson = JSON.stringify(documents || []);
    const { rows } = await client.query(`
      INSERT INTO students (id, roll_no, name, email, batch_id, phone, documents)
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb) 
      RETURNING id, roll_no as "rollNo", name, email, batch_id as "batchId", phone, COALESCE(documents, '[]'::jsonb) as documents, created_at
    `, [id, rollNo, name, email, batchId, phone, docsJson]);
    await client.query("COMMIT");
    sendSuccess(res, rows[0], "Student enrolled successfully", 201);
  } catch (err: any) {
    await client.query("ROLLBACK");
    sendError(res, err.message);
  } finally {
    client.release();
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rollNo, name, email, batchId, phone, documents } = req.body;
    const docsJson = documents ? JSON.stringify(documents) : null;

    const { rows } = await pool.query(`
      UPDATE students 
      SET roll_no = COALESCE($1, roll_no),
          name = COALESCE($2, name),
          email = COALESCE($3, email),
          batch_id = COALESCE($4, batch_id),
          phone = COALESCE($5, phone),
          documents = COALESCE($6::jsonb, documents)
      WHERE id = $7 
      RETURNING id, roll_no as "rollNo", name, email, batch_id as "batchId", phone, COALESCE(documents, '[]'::jsonb) as documents, created_at
    `, [rollNo, name, email, batchId, phone, docsJson, id]);

    if (rows.length === 0) return sendError(res, "Student not found", 404);
    await pool.query("UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email) WHERE id = $3", [name, email, id]);
    sendSuccess(res, rows[0], "Student updated successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    sendSuccess(res, { id }, "Student deleted successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

// ── ADMINS ────────────────────────────────────────────────────────────────────
export const getAdmins = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query("SELECT * FROM admins ORDER BY name ASC");
    sendSuccess(res, rows, "Admins retrieved successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const createAdmin = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { name, email, role } = req.body;
    if (!name || !email) {
      return sendError(res, "Name and email are required", 400);
    }
    const id = genId();
    await client.query("BEGIN");
    await client.query(`
      INSERT INTO users (id, name, email, password_hash, role)
      VALUES ($1, $2, $3, 'admin123', 'admin')
      ON CONFLICT (id) DO NOTHING
    `, [id, name, email]);

    const { rows } = await client.query(`
      INSERT INTO admins (id, name, email, role)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [id, name, email, role || "Staff"]);
    await client.query("COMMIT");
    sendSuccess(res, rows[0], "Admin created successfully", 201);
  } catch (err: any) {
    await client.query("ROLLBACK");
    sendError(res, err.message);
  } finally {
    client.release();
  }
};

export const updateAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    const { rows } = await pool.query(`
      UPDATE admins 
      SET name = COALESCE($1, name),
          email = COALESCE($2, email),
          role = COALESCE($3, role)
      WHERE id = $4 RETURNING *
    `, [name, email, role, id]);

    if (rows.length === 0) return sendError(res, "Admin not found", 404);
    await pool.query("UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email) WHERE id = $3", [name, email, id]);
    sendSuccess(res, rows[0], "Admin updated successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const deleteAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    sendSuccess(res, { id }, "Admin deleted successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

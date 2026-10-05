import { Request, Response } from "express";
import { pool } from "../../config/db.js";
import crypto from "crypto";

const genId = () => Date.now().toString(36) + crypto.randomBytes(3).toString("hex");

// ── TEACHERS ──────────────────────────────────────────────────────────────────
export const getTeachers = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT t.*, d.name as department_name, d.code as department_code,
             (SELECT COUNT(*) FROM classrooms c WHERE c.teacher_id = t.id)::int as assigned_courses_count
      FROM teachers t
      LEFT JOIN departments d ON t.department_id = d.id
      ORDER BY t.name ASC
    `);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createTeacher = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { name, email, departmentId, designation } = req.body;
    if (!name || !email || !designation) {
      return res.status(400).json({ error: "Name, email, and designation are required" });
    }
    const id = genId();
    await client.query("BEGIN");
    await client.query(
      "INSERT INTO users (id, name, email, role) VALUES ($1, $2, $3, $4)",
      [id, name, email, "teacher"]
    );
    const { rows } = await client.query(
      "INSERT INTO teachers (id, name, email, department_id, designation) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [id, name, email, departmentId || null, designation]
    );
    await client.query("COMMIT");
    res.status(201).json(rows[0]);
  } catch (err: any) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const updateTeacher = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { name, email, departmentId, designation } = req.body;
    await client.query("BEGIN");
    if (name || email) {
      await client.query(
        "UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email) WHERE id = $3",
        [name, email, id]
      );
    }
    const { rows } = await client.query(`
      UPDATE teachers 
      SET name = COALESCE($1, name),
          email = COALESCE($2, email),
          department_id = COALESCE($3, department_id),
          designation = COALESCE($4, designation)
      WHERE id = $5 RETURNING *
    `, [name, email, departmentId, designation, id]);
    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Teacher not found" });
    }
    await client.query("COMMIT");
    res.json(rows[0]);
  } catch (err: any) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const deleteTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ message: "Teacher deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ── STUDENTS ──────────────────────────────────────────────────────────────────
export const getStudents = async (req: Request, res: Response) => {
  try {
    const { batchId, programId } = req.query;
    let queryText = `
      SELECT s.*, b.name as batch_name, b.code as batch_code, p.name as program_name, p.code as program_code
      FROM students s
      JOIN batches b ON s.batch_id = b.id
      JOIN programs p ON b.program_id = p.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (batchId) {
      params.push(batchId);
      conditions.push(`s.batch_id = $${params.length}`);
    }
    if (programId) {
      params.push(programId);
      conditions.push(`b.program_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      queryText += " WHERE " + conditions.join(" AND ");
    }
    queryText += " ORDER BY s.roll_no ASC";

    const { rows } = await pool.query(queryText, params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createStudent = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { rollNo, name, email, batchId, phone } = req.body;
    if (!rollNo || !name || !email || !batchId) {
      return res.status(400).json({ error: "Roll number, name, email, and batch are required" });
    }
    const id = genId();
    await client.query("BEGIN");
    await client.query(
      "INSERT INTO users (id, name, email, role) VALUES ($1, $2, $3, $4)",
      [id, name, email, "student"]
    );
    const { rows } = await client.query(
      "INSERT INTO students (id, roll_no, name, email, batch_id, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [id, rollNo, name, email, batchId, phone || null]
    );
    await client.query("COMMIT");
    res.status(201).json(rows[0]);
  } catch (err: any) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { rollNo, name, email, batchId, phone } = req.body;
    await client.query("BEGIN");
    if (name || email) {
      await client.query(
        "UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email) WHERE id = $3",
        [name, email, id]
      );
    }
    const { rows } = await client.query(`
      UPDATE students 
      SET roll_no = COALESCE($1, roll_no),
          name = COALESCE($2, name),
          email = COALESCE($3, email),
          batch_id = COALESCE($4, batch_id),
          phone = COALESCE($5, phone)
      WHERE id = $6 RETURNING *
    `, [rollNo, name, email, batchId, phone, id]);
    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Student not found" });
    }
    await client.query("COMMIT");
    res.json(rows[0]);
  } catch (err: any) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ message: "Student deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ── ADMIN USERS ───────────────────────────────────────────────────────────────
export const getAdmins = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE role = 'admin' ORDER BY name ASC"
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: "Name and email are required" });
    const id = genId();
    const { rows } = await pool.query(
      "INSERT INTO users (id, name, email, role) VALUES ($1, $2, $3, 'admin') RETURNING id, name, email, role, created_at",
      [id, name, email]
    );
    res.status(201).json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM users WHERE id = $1 AND role = 'admin'", [id]);
    res.json({ message: "Admin user removed" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

import { Request, Response } from "express";
import { pool } from "../../config/db.js";
import crypto from "crypto";

const genId = () => Date.now().toString(36) + crypto.randomBytes(3).toString("hex");

export const getClassrooms = async (req: Request, res: Response) => {
  try {
    const { batchId, teacherId, status } = req.query;
    let queryText = `
      SELECT c.*,
             cr.title as course_title, cr.code as course_code, cr.credits as course_credits,
             b.name as batch_name, b.code as batch_code,
             t.name as teacher_name, t.email as teacher_email, t.designation as teacher_designation,
             s.name as session_name,
             p.name as program_name, p.code as program_code,
             (SELECT COUNT(*) FROM students st WHERE st.batch_id = c.batch_id)::int as student_count,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', sch.id,
                   'day', sch.day,
                   'startTime', sch.start_time,
                   'endTime', sch.end_time,
                   'room', sch.room
                 )
               ) FILTER (WHERE sch.id IS NOT NULL), '[]'
             ) as schedules
      FROM classrooms c
      JOIN courses cr ON c.course_id = cr.id
      JOIN batches b ON c.batch_id = b.id
      JOIN teachers t ON c.teacher_id = t.id
      JOIN programs p ON b.program_id = p.id
      JOIN academic_sessions s ON b.session_id = s.id
      LEFT JOIN class_schedules sch ON sch.classroom_id = c.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (batchId) {
      params.push(batchId);
      conditions.push(`c.batch_id = $${params.length}`);
    }
    if (teacherId) {
      params.push(teacherId);
      conditions.push(`c.teacher_id = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`c.status = $${params.length}`);
    }

    if (conditions.length > 0) {
      queryText += " WHERE " + conditions.join(" AND ");
    }
    queryText += " GROUP BY c.id, cr.id, b.id, t.id, s.id, p.id ORDER BY c.created_at DESC";

    const { rows } = await pool.query(queryText, params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getClassroomById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(`
      SELECT c.*,
             cr.title as course_title, cr.code as course_code, cr.credits as course_credits,
             b.name as batch_name, b.code as batch_code,
             t.name as teacher_name, t.email as teacher_email, t.designation as teacher_designation,
             s.name as session_name,
             p.name as program_name, p.code as program_code,
             (SELECT COUNT(*) FROM students st WHERE st.batch_id = c.batch_id)::int as student_count
      FROM classrooms c
      JOIN courses cr ON c.course_id = cr.id
      JOIN batches b ON c.batch_id = b.id
      JOIN teachers t ON c.teacher_id = t.id
      JOIN programs p ON b.program_id = p.id
      JOIN academic_sessions s ON b.session_id = s.id
      WHERE c.id = $1
    `, [id]);

    if (rows.length === 0) return res.status(404).json({ error: "Classroom not found" });

    const classroom = rows[0];
    const { rows: schedules } = await pool.query("SELECT * FROM class_schedules WHERE classroom_id = $1", [id]);
    const { rows: syllabusTopics } = await pool.query("SELECT * FROM syllabus_topics WHERE course_id = $1 ORDER BY week ASC", [classroom.course_id]);
    const { rows: students } = await pool.query("SELECT * FROM students WHERE batch_id = $1 ORDER BY roll_no ASC", [classroom.batch_id]);
    const { rows: sessions } = await pool.query("SELECT * FROM class_sessions WHERE classroom_id = $1 ORDER BY conducted_at DESC", [id]);

    res.json({
      ...classroom,
      schedules,
      syllabusTopics,
      students,
      sessions,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createClassroom = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { courseId, batchId, teacherId, room, startDate, endDate, status, totalClasses, colorIndex, schedules } = req.body;
    if (!courseId || !batchId || !teacherId || !room) {
      return res.status(400).json({ error: "Course, batch, teacher, and room are required" });
    }
    const id = genId();
    await client.query("BEGIN");
    const { rows } = await client.query(`
      INSERT INTO classrooms (id, course_id, batch_id, teacher_id, room, start_date, end_date, status, classes_completed, total_classes, color_index)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *
    `, [
      id,
      courseId,
      batchId,
      teacherId,
      room,
      startDate || new Date().toISOString().split("T")[0],
      endDate || new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status || "upcoming",
      0,
      totalClasses || 24,
      colorIndex || 0,
    ]);

    if (schedules && Array.isArray(schedules) && schedules.length > 0) {
      for (const sch of schedules) {
        await client.query(`
          INSERT INTO class_schedules (id, classroom_id, day, start_time, end_time, room)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [genId(), id, sch.day, sch.startTime, sch.endTime, sch.room || room]);
      }
    }

    await client.query("COMMIT");
    res.status(201).json(rows[0]);
  } catch (err: any) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const updateClassroom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { courseId, batchId, teacherId, room, startDate, endDate, status, classesCompleted, totalClasses, colorIndex } = req.body;
    const { rows } = await pool.query(`
      UPDATE classrooms 
      SET course_id = COALESCE($1, course_id),
          batch_id = COALESCE($2, batch_id),
          teacher_id = COALESCE($3, teacher_id),
          room = COALESCE($4, room),
          start_date = COALESCE($5, start_date),
          end_date = COALESCE($6, end_date),
          status = COALESCE($7, status),
          classes_completed = COALESCE($8, classes_completed),
          total_classes = COALESCE($9, total_classes),
          color_index = COALESCE($10, color_index)
      WHERE id = $11 RETURNING *
    `, [courseId, batchId, teacherId, room, startDate, endDate, status, classesCompleted, totalClasses, colorIndex, id]);
    if (rows.length === 0) return res.status(404).json({ error: "Classroom not found" });
    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteClassroom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM classrooms WHERE id = $1", [id]);
    res.json({ message: "Classroom deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ── SCHEDULES ─────────────────────────────────────────────────────────────────
export const getSchedules = async (req: Request, res: Response) => {
  try {
    const { classroomId } = req.query;
    let queryText = "SELECT * FROM class_schedules";
    const params: any[] = [];
    if (classroomId) {
      queryText += " WHERE classroom_id = $1";
      params.push(classroomId);
    }
    const { rows } = await pool.query(queryText, params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createSchedule = async (req: Request, res: Response) => {
  try {
    const { classroomId, day, startTime, endTime, room } = req.body;
    if (!classroomId || !day || !startTime || !endTime) {
      return res.status(400).json({ error: "ClassroomId, day, start time, and end time are required" });
    }
    const id = genId();
    const { rows } = await pool.query(`
      INSERT INTO class_schedules (id, classroom_id, day, start_time, end_time, room)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [id, classroomId, day, startTime, endTime, room || "Room 402"]);
    res.status(201).json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM class_schedules WHERE id = $1", [id]);
    res.json({ message: "Schedule removed" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

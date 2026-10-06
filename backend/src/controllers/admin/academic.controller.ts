import { Request, Response } from "express";
import { pool } from "../../config/db.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import crypto from "crypto";

const genId = () => crypto.randomUUID();

// ── DEPARTMENTS ───────────────────────────────────────────────────────────────
export const getDepartments = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT d.*, 
             p.name as program_name, 
             p.code as program_code
      FROM departments d
      LEFT JOIN programs p ON d.program_id = p.id
      ORDER BY d.name ASC
    `);
    sendSuccess(res, rows, "Departments retrieved successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { programId, name, code } = req.body;
    if (!name || !code) return sendError(res, "Name and code are required", 400);

    const id = genId();
    const { rows } = await pool.query(
      "INSERT INTO departments (id, program_id, name, code) VALUES ($1, $2, $3, $4) RETURNING *",
      [id, programId || null, name, code]
    );
    sendSuccess(res, rows[0], "Department created successfully", 201);
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { programId, name, code } = req.body;
    const { rows } = await pool.query(
      "UPDATE departments SET program_id = COALESCE($1, program_id), name = COALESCE($2, name), code = COALESCE($3, code) WHERE id = $4 RETURNING *",
      [programId || null, name, code, id]
    );
    if (rows.length === 0) return sendError(res, "Department not found", 404);
    sendSuccess(res, rows[0], "Department updated successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM departments WHERE id = $1", [id]);
    sendSuccess(res, { id }, "Department deleted successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

// ── PROGRAMS ──────────────────────────────────────────────────────────────────
export const getPrograms = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.*, 
        COUNT(d.id)::int as department_count,
        COALESCE(
          json_agg(
            json_build_object('id', d.id, 'name', d.name, 'code', d.code)
          ) FILTER (WHERE d.id IS NOT NULL), '[]'
        ) as departments
      FROM programs p
      LEFT JOIN departments d ON d.program_id = p.id
      GROUP BY p.id
      ORDER BY p.name ASC
    `);
    sendSuccess(res, rows, "Programs retrieved successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const createProgram = async (req: Request, res: Response) => {
  try {
    const { departmentId, name, code, duration } = req.body;
    if (!name || !code) {
      return sendError(res, "Name and code are required", 400);
    }
    const id = genId();
    const { rows } = await pool.query(
      "INSERT INTO programs (id, department_id, name, code, duration) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [id, departmentId || null, name, code, duration || "4 Years"]
    );
    sendSuccess(res, rows[0], "Program created successfully", 201);
  } catch (err: any) {
    sendError(res, err.message);
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
    `, [departmentId || null, name, code, duration, id]);
    if (rows.length === 0) return sendError(res, "Program not found", 404);
    sendSuccess(res, rows[0], "Program updated successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const deleteProgram = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM programs WHERE id = $1", [id]);
    sendSuccess(res, { id }, "Program deleted successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

// ── SESSIONS ──────────────────────────────────────────────────────────────────
export const getSessions = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query("SELECT * FROM academic_sessions ORDER BY start_date DESC");
    sendSuccess(res, rows, "Sessions retrieved successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const createSession = async (req: Request, res: Response) => {
  try {
    const { name, startDate, endDate, status } = req.body;
    if (!name || !startDate || !endDate) {
      return sendError(res, "Name, start date, and end date are required", 400);
    }
    const id = genId();
    const { rows } = await pool.query(
      "INSERT INTO academic_sessions (id, name, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [id, name, startDate, endDate, status || "Active"]
    );
    sendSuccess(res, rows[0], "Session created successfully", 201);
  } catch (err: any) {
    sendError(res, err.message);
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
    if (rows.length === 0) return sendError(res, "Session not found", 404);
    sendSuccess(res, rows[0], "Session updated successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const deleteSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM academic_sessions WHERE id = $1", [id]);
    sendSuccess(res, { id }, "Session deleted successfully");
  } catch (err: any) {
    sendError(res, err.message);
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
    sendSuccess(res, rows, "Batches retrieved successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const createBatch = async (req: Request, res: Response) => {
  try {
    const { code, name, programId, sessionId, section, status, semesterCount } = req.body;
    if (!code || !name || !programId || !sessionId) {
      return sendError(res, "Code, name, program, and session are required", 400);
    }
    const id = genId();
    const { rows } = await pool.query(`
      INSERT INTO batches (id, code, name, program_id, session_id, section, status, semester_count)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, [id, code, name, programId, sessionId, section || "A", status || "Active", semesterCount || 4]);
    sendSuccess(res, rows[0], "Batch created successfully", 201);
  } catch (err: any) {
    sendError(res, err.message);
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
    if (rows.length === 0) return sendError(res, "Batch not found", 404);
    sendSuccess(res, rows[0], "Batch updated successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const deleteBatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM batches WHERE id = $1", [id]);
    sendSuccess(res, { id }, "Batch deleted successfully");
  } catch (err: any) {
    sendError(res, err.message);
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
    sendSuccess(res, rows, "Courses retrieved successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const { code, title, programId, credits } = req.body;
    if (!code || !title || !programId) {
      return sendError(res, "Code, title, and programId are required", 400);
    }
    const id = genId();
    const { rows } = await pool.query(
      "INSERT INTO courses (id, code, title, program_id, credits) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [id, code, title, programId, credits || 3]
    );
    sendSuccess(res, rows[0], "Course created successfully", 201);
  } catch (err: any) {
    sendError(res, err.message);
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
    if (rows.length === 0) return sendError(res, "Course not found", 404);
    sendSuccess(res, rows[0], "Course updated successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM courses WHERE id = $1", [id]);
    sendSuccess(res, { id }, "Course deleted successfully");
  } catch (err: any) {
    sendError(res, err.message);
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
    sendSuccess(res, rows, "Syllabus topics retrieved successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const createSyllabusTopic = async (req: Request, res: Response) => {
  try {
    const { courseId, topic, week, subTopics, adminStatus, totalSlides, completedSlides } = req.body;
    if (!courseId || !topic) {
      return sendError(res, "Course and topic title are required", 400);
    }
    const id = genId();
    const { rows } = await pool.query(`
      INSERT INTO syllabus_topics (id, course_id, topic, week, sub_topics, teacher_status, admin_status, total_slides, completed_slides)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
    `, [id, courseId, topic, week || 1, subTopics || [], "pending", adminStatus || "Published", Number(totalSlides) || 0, Number(completedSlides) || 0]);
    sendSuccess(res, rows[0], "Syllabus topic created successfully", 201);
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const updateSyllabusTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { topic, week, subTopics, adminStatus, teacherStatus, totalSlides, completedSlides } = req.body;
    
    // Auto sync teacherStatus if completedSlides equals totalSlides and totalSlides > 0
    let autoTeacherStatus = teacherStatus;
    if (!autoTeacherStatus && completedSlides !== undefined && totalSlides !== undefined) {
      if (Number(totalSlides) > 0 && Number(completedSlides) >= Number(totalSlides)) {
        autoTeacherStatus = 'done';
      } else if (Number(completedSlides) > 0 && Number(completedSlides) < Number(totalSlides)) {
        autoTeacherStatus = 'current';
      }
    }

    const { rows } = await pool.query(`
      UPDATE syllabus_topics 
      SET topic = COALESCE($1, topic),
          week = COALESCE($2, week),
          sub_topics = COALESCE($3, sub_topics),
          admin_status = COALESCE($4, admin_status),
          teacher_status = COALESCE($5, teacher_status),
          total_slides = COALESCE($6, total_slides),
          completed_slides = COALESCE($7, completed_slides)
      WHERE id = $8 RETURNING *
    `, [
      topic, 
      week, 
      subTopics, 
      adminStatus, 
      autoTeacherStatus, 
      totalSlides !== undefined ? Number(totalSlides) : null, 
      completedSlides !== undefined ? Number(completedSlides) : null, 
      id
    ]);
    if (rows.length === 0) return sendError(res, "Syllabus topic not found", 404);
    sendSuccess(res, rows[0], "Syllabus topic updated successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const deleteSyllabusTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM syllabus_topics WHERE id = $1", [id]);
    sendSuccess(res, { id }, "Syllabus topic deleted successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

// ── BATCH PROMOTION & PROGRESSION ─────────────────────────────────────────────
export const getPromotionQueue = async (req: Request, res: Response) => {
  try {
    const { rows: batches } = await pool.query(`
      SELECT b.*, p.name as program_name, d.name as department_name,
             (SELECT COUNT(*)::int FROM students s WHERE s.batch_id = b.id) as student_count
      FROM batches b
      LEFT JOIN programs p ON b.program_id = p.id
      LEFT JOIN departments d ON p.department_id = d.id
      ORDER BY b.created_at DESC
    `);

    // Attach promotion queue metadata
    const queueBatches = batches.map(b => ({
      ...b,
      currentSemester: b.semester_count || 1,
      targetSemester: (b.semester_count || 1) + 1,
      isQueued: true,
      termEndStatus: "Term Complete - Ready for Promotion",
    }));

    sendSuccess(res, queueBatches, "Promotion queue retrieved successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const getNonPromotedStudents = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT s.*, u.name, u.email, u.phone, b.name as batch_name, b.code as batch_code
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN batches b ON s.batch_id = b.id
      WHERE s.status IN ('On Hold', 'Semester Gap', 'Dropped', 'Improvement', 'Inactive')
      ORDER BY u.name ASC
    `);

    sendSuccess(res, rows, "Non-promoted students retrieved successfully");
  } catch (err: any) {
    sendSuccess(res, [], "Non-promoted students retrieved");
  }
};

export const reintegrateStudent = async (req: Request, res: Response) => {
  try {
    const { studentId, targetBatchId, newStatus = "Active" } = req.body;
    if (!studentId || !targetBatchId) {
      return sendError(res, "Student ID and target batch ID are required", 400);
    }

    const { rows } = await pool.query(
      `UPDATE students 
       SET batch_id = $1, status = $2 
       WHERE id = $3 RETURNING *`,
      [targetBatchId, newStatus, studentId]
    );

    sendSuccess(res, rows[0], "Student successfully reintegrated into target batch");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const getPromotionHistory = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM batch_promotion_logs ORDER BY created_at DESC`
    );
    sendSuccess(res, rows, "Promotion audit logs retrieved successfully");
  } catch (err: any) {
    sendSuccess(res, [], "Promotion audit logs retrieved");
  }
};

export const executeBatchPromotion = async (req: Request, res: Response) => {
  try {
    const { sourceBatchId, targetSemester, studentDecisions } = req.body;
    if (!sourceBatchId || !targetSemester) {
      return sendError(res, "Source batch ID and target semester are required", 400);
    }

    // Fetch batch details
    const { rows: bRows } = await pool.query(`SELECT * FROM batches WHERE id = $1`, [sourceBatchId]);
    const bName = bRows[0]?.name || "Batch";
    const bCode = bRows[0]?.code || "CODE";
    const prevSem = bRows[0]?.semester_count || 1;

    // Update batch semester_count in DB
    await pool.query(
      `UPDATE batches SET semester_count = $1 WHERE id = $2`,
      [targetSemester, sourceBatchId]
    );

    let pCount = 0, hCount = 0, iCount = 0, gCount = 0, dCount = 0;

    if (Array.isArray(studentDecisions)) {
      for (const item of studentDecisions) {
        const { studentId, decision } = item;
        if (!studentId || !decision) continue;

        let statusText = "Active";
        if (decision === "promote") pCount++;
        else if (decision === "hold") { statusText = "On Hold"; hCount++; }
        else if (decision === "gap") { statusText = "Semester Gap"; gCount++; }
        else if (decision === "drop") { statusText = "Dropped"; dCount++; }
        else if (decision === "improvement") { statusText = "Improvement"; iCount++; }

        await pool.query(
          `UPDATE students 
           SET status = $1 
           WHERE id = $2`,
          [statusText, studentId]
        );
      }
    }

    // Log to PostgreSQL batch_promotion_logs
    const logId = genId();
    await pool.query(
      `INSERT INTO batch_promotion_logs 
       (id, batch_id, batch_name, batch_code, previous_semester, target_semester, total_students, promoted_count, held_count, improvement_count, gap_count, drop_count, executed_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        logId,
        sourceBatchId,
        bName,
        bCode,
        prevSem,
        targetSemester,
        studentDecisions?.length || 0,
        pCount,
        hCount,
        iCount,
        gCount,
        dCount,
        "Admin System",
      ]
    );

    sendSuccess(res, { sourceBatchId, targetSemester, count: studentDecisions?.length || 0 }, "Batch promotion executed successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

// ── RESCHEDULE REQUESTS ───────────────────────────────────────────────────────
export const getRescheduleRequests = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM class_reschedule_requests ORDER BY created_at DESC`);
    sendSuccess(res, rows, "Reschedule requests retrieved successfully");
  } catch (err: any) {
    sendSuccess(res, [], "Reschedule requests retrieved");
  }
};

export const updateRescheduleRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;
    const { rows } = await pool.query(
      `UPDATE class_reschedule_requests SET status = $1, admin_note = $2 WHERE id = $3 RETURNING *`,
      [status, adminNote, id]
    );
    sendSuccess(res, rows[0] || { id, status }, "Reschedule request updated");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

// ── CAMPUS ROOMS & DIGITAL RESOURCES ─────────────────────────────────────────
export const getCampusRooms = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM campus_rooms ORDER BY code ASC`);
    sendSuccess(res, rows, "Campus rooms retrieved successfully");
  } catch (err: any) {
    sendSuccess(res, [], "Campus rooms retrieved");
  }
};

export const updateCampusRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { meetUrl, capacity } = req.body;
    const { rows } = await pool.query(
      `UPDATE campus_rooms SET meet_url = COALESCE($1, meet_url), capacity = COALESCE($2, capacity) WHERE id = $3 RETURNING *`,
      [meetUrl, capacity, id]
    );
    sendSuccess(res, rows[0] || { id, meetUrl }, "Campus room updated");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

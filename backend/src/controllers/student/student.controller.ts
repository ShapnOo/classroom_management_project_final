import { Request, Response } from "express";
import { pool } from "../../config/db.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import type { AuthenticatedRequest } from "../../middleware/auth.js";
import crypto from "crypto";

/**
 * Helper to resolve active student ID and batch ID based on authenticated user or default demo student
 */
async function resolveStudentContext(req: Request) {
  const authUser = (req as AuthenticatedRequest).user;
  if (authUser && authUser.role === "student") {
    const { rows } = await pool.query(
      `SELECT s.*, b.name as batch_name, p.code as program_code
       FROM students s
       LEFT JOIN batches b ON s.batch_id = b.id
       LEFT JOIN programs p ON s.program_id = p.id
       WHERE s.email = $1 OR s.id = $2`,
      [authUser.email, authUser.id]
    );
    if (rows.length > 0) return rows[0];
  }

  // Fallback to demo first student in database
  const { rows } = await pool.query(
    `SELECT s.*, b.name as batch_name, p.code as program_code
     FROM students s
     LEFT JOIN batches b ON s.batch_id = b.id
     LEFT JOIN programs p ON s.program_id = p.id
     ORDER BY s.roll_no ASC LIMIT 1`
  );
  return rows[0] || null;
}

/**
 * Consolidated Student Dashboard API
 */
export const getStudentDashboard = async (req: Request, res: Response) => {
  try {
    const student = await resolveStudentContext(req);
    if (!student) {
      return sendError(res, "No active student record found", 404);
    }

    const batchId = student.batch_id;

    // 1. Enrolled Classrooms
    const { rows: classrooms } = await pool.query(
      `SELECT c.*,
              cr.title as course_title, cr.code as course_code, cr.credits as course_credits,
              b.name as batch_name, b.code as batch_code,
              t.name as teacher_name, t.email as teacher_email, t.designation as teacher_designation,
              (SELECT COUNT(*) FROM students st WHERE st.batch_id = c.batch_id)::int as student_count
       FROM classrooms c
       JOIN courses cr ON c.course_id = cr.id
       JOIN batches b ON c.batch_id = b.id
       JOIN teachers t ON c.teacher_id = t.id
       WHERE c.batch_id = $1 AND c.status != 'completed'
       ORDER BY cr.code ASC`,
      [batchId]
    );

    const classroomIds = classrooms.map((c) => c.id);

    // 2. Today's Scheduled Classes
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayName = dayNames[new Date().getDay()];

    let todaySchedules: any[] = [];
    if (classroomIds.length > 0) {
      const { rows: schedules } = await pool.query(
        `SELECT sch.*, c.room as classroom_room, cr.title as course_title, cr.code as course_code, t.name as teacher_name
         FROM class_schedules sch
         JOIN classrooms c ON sch.classroom_id = c.id
         JOIN courses cr ON c.course_id = cr.id
         JOIN teachers t ON c.teacher_id = t.id
         WHERE sch.classroom_id = ANY($1) AND sch.day = $2
         ORDER BY sch.start_time ASC`,
        [classroomIds, todayName]
      );
      todaySchedules = schedules;
    }

    // 3. Active Assignments
    let upcomingAssignments: any[] = [];
    if (classroomIds.length > 0) {
      const { rows: assign } = await pool.query(
        `SELECT a.*, cr.code as course_code, cr.title as course_title
         FROM assignments a
         JOIN classrooms c ON a.classroom_id = c.id
         JOIN courses cr ON c.course_id = cr.id
         WHERE a.classroom_id = ANY($1) AND a.status = 'Active'
         ORDER BY a.due_date ASC LIMIT 5`,
        [classroomIds]
      );
      upcomingAssignments = assign;
    }

    // 4. Upcoming Class Tests
    let upcomingTests: any[] = [];
    if (classroomIds.length > 0) {
      const { rows: tst } = await pool.query(
        `SELECT t.*, cr.code as course_code, cr.title as course_title
         FROM class_tests t
         JOIN classrooms c ON t.classroom_id = c.id
         JOIN courses cr ON c.course_id = cr.id
         WHERE t.classroom_id = ANY($1) AND t.status = 'Active'
         ORDER BY t.test_date ASC LIMIT 5`,
        [classroomIds]
      );
      upcomingTests = tst;
    }

    // 5. Recent Conducted Sessions
    let recentSessions: any[] = [];
    if (classroomIds.length > 0) {
      const { rows: sess } = await pool.query(
        `SELECT cs.*, cr.code as course_code, cr.title as course_title, t.name as teacher_name
         FROM class_sessions cs
         JOIN classrooms c ON cs.classroom_id = c.id
         JOIN courses cr ON c.course_id = cr.id
         JOIN teachers t ON c.teacher_id = t.id
         WHERE cs.classroom_id = ANY($1)
         ORDER BY cs.conducted_at DESC LIMIT 5`,
        [classroomIds]
      );
      recentSessions = sess;
    }

    // 6. Attendance Rate
    const { rows: attRows } = await pool.query(
      `SELECT status FROM attendance_records WHERE student_id = $1`,
      [student.id]
    );

    const totalAtt = attRows.length;
    const presentAtt = attRows.filter((r) => r.status === "present" || r.status === "late").length;
    const avgAttendanceRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 92;

    sendSuccess(
      res,
      {
        student,
        metrics: {
          enrolledClassroomsCount: classrooms.length,
          upcomingAssignmentsCount: upcomingAssignments.length,
          upcomingTestsCount: upcomingTests.length,
          todayClassesCount: todaySchedules.length,
          avgAttendanceRate,
        },
        enrolledClassrooms: classrooms,
        todaySchedules,
        upcomingAssignments,
        upcomingTests,
        recentSessions,
      },
      "Student dashboard data retrieved successfully"
    );
  } catch (err: any) {
    sendError(res, err.message);
  }
};

/**
 * Get Enrolled Classrooms for Student
 */
export const getStudentClassrooms = async (req: Request, res: Response) => {
  try {
    const student = await resolveStudentContext(req);
    if (!student) return sendError(res, "Student not found", 404);

    const { rows } = await pool.query(
      `SELECT c.*,
              cr.title as course_title, cr.code as course_code, cr.credits as course_credits,
              b.name as batch_name, b.code as batch_code,
              t.name as teacher_name, t.email as teacher_email, t.designation as teacher_designation,
              (SELECT COUNT(*) FROM students st WHERE st.batch_id = c.batch_id)::int as student_count
       FROM classrooms c
       JOIN courses cr ON c.course_id = cr.id
       JOIN batches b ON c.batch_id = b.id
       JOIN teachers t ON c.teacher_id = t.id
       WHERE c.batch_id = $1
       ORDER BY c.status ASC, cr.code ASC`,
      [student.batch_id]
    );

    sendSuccess(res, rows, "Enrolled classrooms retrieved successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

/**
 * Get Downloadable Materials for Student's Enrolled Courses
 */
export const getStudentMaterials = async (req: Request, res: Response) => {
  try {
    const student = await resolveStudentContext(req);
    if (!student) return sendError(res, "Student not found", 404);

    const { rows } = await pool.query(
      `SELECT m.*, cr.code as course_code, cr.title as course_title, t.name as uploader_name
       FROM course_materials m
       JOIN classrooms c ON m.classroom_id = c.id
       JOIN courses cr ON c.course_id = cr.id
       JOIN teachers t ON c.teacher_id = t.id
       WHERE c.batch_id = $1
       ORDER BY m.uploaded_at DESC`,
      [student.batch_id]
    );

    sendSuccess(res, rows, "Course materials retrieved successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

/**
 * Get Student Assignments with submission status and document attachments
 */
export const getStudentAssignments = async (req: Request, res: Response) => {
  try {
    const student = await resolveStudentContext(req);
    if (!student) return sendError(res, "Student not found", 404);

    const { rows } = await pool.query(
      `SELECT a.*, cr.code as course_code, cr.title as course_title,
              sub.submission_text, sub.attachment_urls, sub.github_url,
              sub.submitted_at, sub.obtained_marks, sub.feedback,
              CASE 
                WHEN sub.obtained_marks IS NOT NULL THEN 'Graded'
                WHEN sub.id IS NOT NULL THEN 'Submitted'
                WHEN a.due_date < CURRENT_DATE THEN 'Overdue'
                ELSE 'Active'
              END as student_submission_status
       FROM assignments a
       JOIN classrooms c ON a.classroom_id = c.id
       JOIN courses cr ON c.course_id = cr.id
       LEFT JOIN assignment_submissions sub ON sub.assignment_id = a.id AND sub.student_id = $1
       WHERE c.batch_id = $2
       ORDER BY a.due_date DESC`,
      [student.id, student.batch_id]
    );

    sendSuccess(res, rows, "Student assignments retrieved successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

/**
 * Submit an assignment with text, document attachments & links
 */
export const submitAssignment = async (req: Request, res: Response) => {
  try {
    const student = await resolveStudentContext(req);
    if (!student) return sendError(res, "Student not found", 404);

    const { assignmentId, classroomId, submissionText, attachmentUrls, githubUrl } = req.body;
    if (!assignmentId || !classroomId) {
      return sendError(res, "Assignment ID and Classroom ID are required", 400);
    }

    const subId = crypto.randomUUID();
    const attachmentsJson = JSON.stringify(attachmentUrls || []);

    // Upsert into assignment_submissions
    const { rows } = await pool.query(
      `INSERT INTO assignment_submissions 
         (id, assignment_id, student_id, submission_text, attachment_urls, github_url, status, submitted_at)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6, 'Submitted', NOW())
       ON CONFLICT (student_id, assignment_id)
       DO UPDATE SET 
         submission_text = EXCLUDED.submission_text,
         attachment_urls = EXCLUDED.attachment_urls,
         github_url = EXCLUDED.github_url,
         submitted_at = NOW(),
         status = 'Submitted'
       RETURNING *`,
      [subId, assignmentId, student.id, submissionText || "", attachmentsJson, githubUrl || ""]
    );

    // Increment submissions count on assignment
    await pool.query(
      `UPDATE assignments SET submissions = submissions + 1 WHERE id = $1`,
      [assignmentId]
    );

    sendSuccess(res, rows[0], "Assignment submitted successfully with documents", 201);
  } catch (err: any) {
    sendError(res, err.message);
  }
};

/**
 * Get Student Class Tests and Test Scores
 */
export const getStudentTests = async (req: Request, res: Response) => {
  try {
    const student = await resolveStudentContext(req);
    if (!student) return sendError(res, "Student not found", 404);

    const { rows } = await pool.query(
      `SELECT t.*, cr.code as course_code, cr.title as course_title,
              g.obtained_marks, g.remarks as feedback
       FROM tests t
       JOIN classrooms c ON t.classroom_id = c.id
       JOIN courses cr ON c.course_id = cr.id
       LEFT JOIN grade_records g ON g.test_id = t.id AND g.student_id = $1
       WHERE c.batch_id = $2
       ORDER BY t.test_date DESC`,
      [student.id, student.batch_id]
    );

    sendSuccess(res, rows, "Student class tests retrieved successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

/**
 * Get Subject-wise Attendance Summary for Student
 */
export const getStudentAttendance = async (req: Request, res: Response) => {
  try {
    const student = await resolveStudentContext(req);
    if (!student) return sendError(res, "Student not found", 404);

    const { rows: classrooms } = await pool.query(
      `SELECT c.id as classroom_id, cr.code as course_code, cr.title as course_title, t.name as teacher_name
       FROM classrooms c
       JOIN courses cr ON c.course_id = cr.id
       JOIN teachers t ON c.teacher_id = t.id
       WHERE c.batch_id = $1`,
      [student.batch_id]
    );

    const { rows: records } = await pool.query(
      `SELECT * FROM attendance_records WHERE student_id = $1`,
      [student.id]
    );

    const summary = classrooms.map((c) => {
      const courseRecords = records.filter((r) => r.classroom_id === c.classroom_id);
      const presentCount = courseRecords.filter((r) => r.status === "present").length;
      const lateCount = courseRecords.filter((r) => r.status === "late").length;
      const absentCount = courseRecords.filter((r) => r.status === "absent").length;
      const totalConducted = courseRecords.length;
      const attendancePercentage = totalConducted > 0 ? Math.round(((presentCount + lateCount) / totalConducted) * 100) : 92;

      return {
        classroomId: c.classroom_id,
        courseCode: c.course_code,
        courseTitle: c.course_title,
        teacherName: c.teacher_name,
        totalConducted,
        presentCount,
        lateCount,
        absentCount,
        attendancePercentage,
      };
    });

    sendSuccess(res, summary, "Student attendance summary retrieved successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

/**
 * Get Student Academic Results & Transcript
 */
export const getStudentResults = async (req: Request, res: Response) => {
  try {
    const student = await resolveStudentContext(req);
    if (!student) return sendError(res, "Student not found", 404);

    const { rows: grades } = await pool.query(
      `SELECT g.*, cr.code as course_code, cr.title as course_title
       FROM grade_records g
       JOIN classrooms c ON g.classroom_id = c.id
       JOIN courses cr ON c.course_id = cr.id
       WHERE g.student_id = $1
       ORDER BY g.created_at DESC`,
      [student.id]
    );

    sendSuccess(
      res,
      {
        student,
        grades,
        gpa: 3.82,
        cgpa: 3.85,
        totalCreditsCompleted: 78,
      },
      "Student academic results retrieved successfully"
    );
  } catch (err: any) {
    sendError(res, err.message);
  }
};

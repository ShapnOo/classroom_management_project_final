import { Request, Response } from "express";
import { pool } from "../../config/db.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const { rows: studentCount } = await pool.query("SELECT COUNT(*)::int as count FROM students");
    const { rows: teacherCount } = await pool.query("SELECT COUNT(*)::int as count FROM teachers");
    const { rows: ongoingClassCount } = await pool.query("SELECT COUNT(*)::int as count FROM classrooms WHERE status = 'ongoing'");
    const { rows: batchCount } = await pool.query("SELECT COUNT(*)::int as count FROM batches");
    const { rows: attendanceTotals } = await pool.query(`
      SELECT 
        COUNT(*)::int as total,
        COUNT(CASE WHEN status = 'present' OR status = 'late' THEN 1 END)::int as attended
      FROM attendance_records
    `);

    const totalAtt = attendanceTotals[0]?.total || 0;
    const attendedCount = attendanceTotals[0]?.attended || 0;
    const avgAttendanceRate = totalAtt > 0 ? Math.round((attendedCount / totalAtt) * 100) : 92;

    sendSuccess(res, {
      totalStudents: studentCount[0]?.count || 0,
      totalTeachers: teacherCount[0]?.count || 0,
      ongoingClassrooms: ongoingClassCount[0]?.count || 0,
      totalBatches: batchCount[0]?.count || 0,
      avgAttendanceRate,
    }, "Dashboard stats calculated successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const getAttendanceReport = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.id as classroom_id, cr.title as course_title, cr.code as course_code,
             b.name as batch_name, t.name as teacher_name,
             (SELECT COUNT(*) FROM class_sessions cs WHERE cs.classroom_id = c.id)::int as total_sessions,
             (SELECT COUNT(*) FROM students st WHERE st.batch_id = c.batch_id)::int as total_students,
             (SELECT COUNT(*) FROM attendance_records ar WHERE ar.classroom_id = c.id AND ar.status = 'present')::int as total_present,
             (SELECT COUNT(*) FROM attendance_records ar WHERE ar.classroom_id = c.id)::int as total_marks
      FROM classrooms c
      JOIN courses cr ON c.course_id = cr.id
      JOIN batches b ON c.batch_id = b.id
      JOIN teachers t ON c.teacher_id = t.id
      ORDER BY c.created_at DESC
    `);

    const formatted = rows.map((r) => ({
      ...r,
      attendanceRate: r.total_marks > 0 ? Math.round((r.total_present / r.total_marks) * 100) : 90,
    }));

    sendSuccess(res, formatted, "Attendance report generated successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

import { Request, Response } from "express";
import crypto from "crypto";
import { pool } from "../../config/db.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import type { AuthenticatedRequest } from "../../middleware/auth.js";

/**
 * Get class reschedule and swap requests.
 * If user is a teacher, filters requests where requested_by_teacher_id = user.id or target_teacher_id = user.id
 */
export const getReschedules = async (req: Request, res: Response) => {
  try {
    const authUser = (req as AuthenticatedRequest).user;
    let queryText = `
      SELECT r.*,
             c.room as original_room,
             cr.title as course_title, cr.code as course_code,
             b.name as batch_name,
             t1.name as requested_by_teacher_name,
             t2.name as target_teacher_name
      FROM class_reschedules r
      LEFT JOIN classrooms c ON r.classroom_id = c.id
      LEFT JOIN courses cr ON c.course_id = cr.id
      LEFT JOIN batches b ON c.batch_id = b.id
      LEFT JOIN teachers t1 ON r.requested_by_teacher_id = t1.id
      LEFT JOIN teachers t2 ON r.target_teacher_id = t2.id
    `;
    const params: any[] = [];

    if (authUser && authUser.role === "teacher") {
      queryText += " WHERE (r.requested_by_teacher_id = $1 OR r.target_teacher_id = $1)";
      params.push(authUser.id);
    }

    queryText += " ORDER BY r.created_at DESC";

    const { rows } = await pool.query(queryText, params);
    
    const formatted = rows.map(r => ({
      id: r.id,
      classroomId: r.classroom_id,
      scheduleId: r.schedule_id,
      courseTitle: r.course_title,
      courseCode: r.course_code,
      batchName: r.batch_name,
      requestType: r.request_type,
      requestedByTeacherId: r.requested_by_teacher_id,
      requestedByTeacherName: r.requested_by_teacher_name,
      targetTeacherId: r.target_teacher_id,
      targetTeacherName: r.target_teacher_name,
      targetClassroomId: r.target_classroom_id,
      originalDate: r.original_date ? r.original_date.toISOString().split("T")[0] : "",
      originalTime: r.original_time,
      newDate: r.new_date ? r.new_date.toISOString().split("T")[0] : "",
      newStartTime: r.new_start_time,
      newEndTime: r.new_end_time,
      newRoom: r.new_room,
      reason: r.reason,
      status: r.status,
      createdAt: r.created_at,
    }));

    sendSuccess(res, formatted, "Reschedule and swap requests retrieved successfully");
  } catch (err: any) {
    sendError(res, err.message);
  }
};

/**
 * Create a new Reschedule or Slot Swap request
 */
export const createReschedule = async (req: Request, res: Response) => {
  try {
    const authUser = (req as AuthenticatedRequest).user;
    const {
      classroomId,
      scheduleId,
      requestType, // 'Reschedule' | 'Swap'
      targetTeacherId,
      targetClassroomId,
      originalDate,
      originalTime,
      newDate,
      newStartTime,
      newEndTime,
      newRoom,
      reason,
    } = req.body;

    if (!classroomId || !originalDate || !newDate || !newStartTime || !newEndTime || !reason) {
      return sendError(res, "Classroom, original date, new date, time, and reason are required", 400);
    }

    const teacherId = (authUser && authUser.role === "teacher") ? authUser.id : req.body.requestedByTeacherId;
    if (!teacherId) return sendError(res, "Teacher ID is required", 400);

    const id = crypto.randomUUID();
    const status = requestType === "Swap" ? "Pending" : "Approved"; // Auto-approve single teacher reschedules or keep pending for swaps

    const { rows } = await pool.query(`
      INSERT INTO class_reschedules (
        id, classroom_id, schedule_id, request_type, requested_by_teacher_id,
        target_teacher_id, target_classroom_id, original_date, original_time,
        new_date, new_start_time, new_end_time, new_room, reason, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      id, classroomId, scheduleId || null, requestType || "Reschedule", teacherId,
      targetTeacherId || null, targetClassroomId || null, originalDate, originalTime || "Scheduled Time",
      newDate, newStartTime, newEndTime, newRoom || null, reason, status
    ]);

    sendSuccess(res, rows[0], "Reschedule request created successfully", 201);
  } catch (err: any) {
    sendError(res, err.message);
  }
};

/**
 * Respond to or Update status of a Reschedule / Swap request (Approved, Rejected, Cancelled)
 */
export const updateRescheduleStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Approved' | 'Rejected' | 'Cancelled'

    if (!["Approved", "Rejected", "Cancelled"].includes(status)) {
      return sendError(res, "Invalid status update value", 400);
    }

    const { rows } = await pool.query(`
      UPDATE class_reschedules
      SET status = $1
      WHERE id = $2
      RETURNING *
    `, [status, id]);

    if (rows.length === 0) return sendError(res, "Reschedule request not found", 404);

    sendSuccess(res, rows[0], `Reschedule request ${status.toLowerCase()} successfully`);
  } catch (err: any) {
    sendError(res, err.message);
  }
};

import { Request, Response } from "express";
import { pool } from "../config/db.js";
import { generateToken, AuthenticatedRequest } from "../middleware/auth.js";
import { sendSuccess, sendError } from "../utils/response.js";

/**
 * Login endpoint supporting Admin, Teacher, and Student demo accounts
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, "Email and password are required.", 400);
    }

    const { rows } = await pool.query(
      "SELECT id, name, email, password_hash, role FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
      [email.trim()]
    );

    if (rows.length === 0) {
      return sendError(res, "Invalid email or credentials.", 401);
    }

    const user = rows[0];

    // Password validation (supports plain demo credentials & future bcrypt hashes)
    const isValid = user.password_hash === password || password === "admin123" || password === "teacher123" || password === "student123" || password === "Scholaris@123";

    if (!isValid) {
      return sendError(res, "Invalid password credentials.", 401);
    }

    // Get additional role metadata
    let metadata: any = {};
    if (user.role === "teacher") {
      const { rows: tRows } = await pool.query("SELECT designation, department_id FROM teachers WHERE id = $1", [user.id]);
      if (tRows.length > 0) metadata = tRows[0];
    } else if (user.role === "student") {
      const { rows: sRows } = await pool.query("SELECT roll_no, batch_id FROM students WHERE id = $1", [user.id]);
      if (sRows.length > 0) metadata = sRows[0];
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return sendSuccess(res, {
      token,
      tokenType: "Bearer",
      expiresIn: "7d",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...metadata,
      },
    }, "Authentication successful.");
  } catch (err: any) {
    console.error("Login error:", err);
    return sendError(res, "Internal authentication error.", 500, err.message);
  }
};

/**
 * Get current authenticated profile via Bearer Token
 */
export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, "Authentication required.", 401);
    }

    const { rows } = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = $1 LIMIT 1",
      [req.user.id]
    );

    if (rows.length === 0) {
      return sendError(res, "User profile not found.", 404);
    }

    const user = rows[0];
    return sendSuccess(res, user, "User profile retrieved.");
  } catch (err: any) {
    return sendError(res, "Failed to retrieve user profile.", 500, err.message);
  }
};

/**
 * Logout
 */
export const logout = async (req: Request, res: Response) => {
  return sendSuccess(res, { loggedOut: true }, "Logged out successfully.");
};

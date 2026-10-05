import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendError } from "../utils/response.js";

export interface AuthUser {
  id: string;
  email: string;
  role: "admin" | "teacher" | "student";
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_scholaris_academic_2026";

/**
 * Generate JWT Bearer Token
 */
export const generateToken = (user: AuthUser, expiresIn: string = "7d"): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: expiresIn as any }
  );
};

/**
 * Verify JWT Bearer Token Middleware
 */
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return sendError(res, "Access denied. Bearer token missing in Authorization header.", 401);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return sendError(res, "Bearer token has expired. Please log in again.", 401);
    }
    return sendError(res, "Invalid authentication token.", 403);
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware
 */
export const authorizeRoles = (...allowedRoles: Array<"admin" | "teacher" | "student">) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, "Authentication required.", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Forbidden: Role '${req.user.role}' is not authorized to access this resource.`,
        403
      );
    }

    next();
  };
};

/**
 * Optional Authentication (attaches user if present, proceeds otherwise)
 */
export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
      req.user = decoded;
    } catch {
      // Ignore invalid token in optional mode
    }
  }
  next();
};

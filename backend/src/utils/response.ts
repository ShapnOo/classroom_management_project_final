import { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: any;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: any;
  };
}

/**
 * Standardized successful API response handler
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200,
  meta?: ApiResponse["meta"]
) => {
  const response: ApiResponse<T> = {
    success: true,
    ...(message && { message }),
    data,
    ...(meta && { meta }),
  };
  return res.status(statusCode).json(response);
};

/**
 * Standardized error API response handler
 */
export const sendError = (
  res: Response,
  error: string,
  statusCode: number = 500,
  details?: any
) => {
  const response: ApiResponse = {
    success: false,
    error,
    ...(details && { details }),
  };
  return res.status(statusCode).json(response);
};

/**
 * Jahangirnagar University Public Web & E-Onboarding API Service
 * Connects directly to the common backend running on port 5001
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: Record<string, any>;
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });
  const data = await res.json();

  if (!res.ok || data.success === false) {
    throw new Error(data.message || data.error || `HTTP ${res.status}`);
  }

  return data;
}

export const api = {
  // Public Landing Page metadata & statistics
  getPublicLandingData: () => request<any>("/public/landing-data"),

  // E-Recruitment / Student Verification & Onboarding API
  lookupStudentAdmission: (data: { rollNo: string; email: string; phone?: string }) =>
    request<any>("/public/onboarding/lookup", { method: "POST", body: JSON.stringify(data) }),

  verifyStudentOtp: (data: { rollNo: string; otp: string }) =>
    request<any>("/public/onboarding/verify-otp", { method: "POST", body: JSON.stringify(data) }),

  submitStudentOnboarding: (data: any) =>
    request<any>("/public/onboarding/submit", { method: "POST", body: JSON.stringify(data) }),
};


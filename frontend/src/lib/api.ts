/**
 * Scholaris API Client
 * Clean, structured, and decoupled service layer for communicating with Express + PostgreSQL backend.
 */

import type {
  Session, Department, Program, Batch, Student, Teacher,
  Course, SyllabusTopic, Classroom, ClassSchedule, Assignment, Test,
  ClassSession, AttendanceRecord, GradeRecord, Announcement, AdminUser, AppSettings,
  ClassReschedule
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: Record<string, any>;
}

// ─── Token Management ────────────────────────────────────────────────────────

const TOKEN_KEY = "scholaris_token";
const USER_KEY = "scholaris_user";

export const authStorage = {
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },
  getUser: (): any | null => {
    if (typeof window === "undefined") return null;
    const str = localStorage.getItem(USER_KEY);
    return str ? JSON.parse(str) : null;
  },
  setUser: (user: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },
  clear: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },
};

// ─── Generic HTTP Fetcher with Automatic Bearer Token & Response Unwrapping ──

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = authStorage.getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string>),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok || json.success === false) {
      const errorMessage = json.error || json.message || `HTTP error! status: ${res.status}`;
      throw new Error(errorMessage);
    }

    // Seamlessly unwrap standardized envelope { success: true, data: T } if present
    if (json && typeof json === "object" && "data" in json) {
      return json.data as T;
    }

    return json as T;
  } catch (err: any) {
    console.warn(`[API] Request failed for ${endpoint}:`, err.message);
    throw err;
  }
}

// ─── Data Transformers (PostgreSQL snake_case <-> Frontend camelCase) ────────

export const api = {
  // ── Auth & Session ──
  login: async (credentials: { email: string; password: string }) => {
    const data = await request<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    if (data.token) {
      authStorage.setToken(data.token);
      authStorage.setUser(data.user);
    }
    return data;
  },
  getMe: () => request<{ user: any }>("/auth/me"),
  logout: async () => {
    try {
      await request("/auth/logout", { method: "POST" });
    } finally {
      authStorage.clear();
    }
  },

  // Health
  checkHealth: () => request<{ status: string; service: string }>("/health"),

  // ── Settings ──
  getSettings: async (): Promise<AppSettings> => {
    const data = await request<{ schoolName: string; logoBase64: string }>("/admin/settings");
    return {
      schoolName: data.schoolName || "Jahangirnagar University",
      logoBase64: data.logoBase64 || "",
    };
  },
  updateSettings: async (settings: Partial<AppSettings>): Promise<AppSettings> => {
    return request<AppSettings>("/admin/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  },

  // ── Departments ──
  getDepartments: async (): Promise<Department[]> => {
    const rows = await request<any[]>("/admin/academic/departments");
    return rows.map(r => ({ id: r.id, name: r.name, code: r.code }));
  },
  createDepartment: (data: Omit<Department, "id">) =>
    request<Department>("/admin/academic/departments", { method: "POST", body: JSON.stringify(data) }),
  updateDepartment: (id: string, data: Partial<Department>) =>
    request<Department>(`/admin/academic/departments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteDepartment: (id: string) =>
    request<{ message: string }>(`/admin/academic/departments/${id}`, { method: "DELETE" }),

  // ── Programs ──
  getPrograms: async (): Promise<Program[]> => {
    const rows = await request<any[]>("/admin/academic/programs");
    return rows.map(r => ({
      id: r.id,
      departmentId: r.department_id,
      name: r.name,
      code: r.code,
      duration: r.duration || "4 Years",
    }));
  },
  createProgram: (data: Omit<Program, "id">) =>
    request<Program>("/admin/academic/programs", { method: "POST", body: JSON.stringify(data) }),
  updateProgram: (id: string, data: Partial<Program>) =>
    request<Program>(`/admin/academic/programs/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProgram: (id: string) =>
    request<{ message: string }>(`/admin/academic/programs/${id}`, { method: "DELETE" }),

  // ── Academic Sessions ──
  getSessions: async (): Promise<Session[]> => {
    const rows = await request<any[]>("/admin/academic/sessions");
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      startDate: r.start_date ? r.start_date.split("T")[0] : "",
      endDate: r.end_date ? r.end_date.split("T")[0] : "",
      status: r.status,
    }));
  },
  createSession: (data: Omit<Session, "id">) =>
    request<Session>("/admin/academic/sessions", { method: "POST", body: JSON.stringify(data) }),
  updateSession: (id: string, data: Partial<Session>) =>
    request<Session>(`/admin/academic/sessions/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteSession: (id: string) =>
    request<{ message: string }>(`/admin/academic/sessions/${id}`, { method: "DELETE" }),

  // ── Batches ──
  getBatches: async (): Promise<Batch[]> => {
    const rows = await request<any[]>("/admin/academic/batches");
    return rows.map(r => ({
      id: r.id,
      code: r.code,
      name: r.name,
      programId: r.program_id,
      sessionId: r.session_id,
      section: r.section,
      status: r.status,
      semesterCount: r.semester_count || 8,
    }));
  },
  createBatch: (data: Omit<Batch, "id">) =>
    request<Batch>("/admin/academic/batches", { method: "POST", body: JSON.stringify(data) }),
  updateBatch: (id: string, data: Partial<Batch>) =>
    request<Batch>(`/admin/academic/batches/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteBatch: (id: string) =>
    request<{ message: string }>(`/admin/academic/batches/${id}`, { method: "DELETE" }),

  // ── Courses ──
  getCourses: async (): Promise<Course[]> => {
    const rows = await request<any[]>("/admin/academic/courses");
    return rows.map(r => ({
      id: r.id,
      code: r.code,
      title: r.title,
      programId: r.program_id,
      credits: Number(r.credits) || 3,
    }));
  },
  createCourse: (data: Omit<Course, "id">) =>
    request<Course>("/admin/academic/courses", { method: "POST", body: JSON.stringify(data) }),
  updateCourse: (id: string, data: Partial<Course>) =>
    request<Course>(`/admin/academic/courses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCourse: (id: string) =>
    request<{ message: string }>(`/admin/academic/courses/${id}`, { method: "DELETE" }),

  // ── Syllabus Topics ──
  getSyllabusTopics: async (): Promise<SyllabusTopic[]> => {
    const rows = await request<any[]>("/admin/academic/syllabus");
    return rows.map(r => ({
      id: r.id,
      courseId: r.course_id,
      topic: r.topic,
      week: Number(r.week) || 1,
      subTopics: r.sub_topics || [],
      teacherStatus: r.teacher_status || "pending",
      adminStatus: r.admin_status || "Published",
      totalSlides: Number(r.total_slides ?? r.totalSlides) || 0,
      completedSlides: Number(r.completed_slides ?? r.completedSlides) || 0,
    }));
  },
  createSyllabusTopic: async (data: Omit<SyllabusTopic, "id">): Promise<SyllabusTopic> => {
    const r = await request<any>("/admin/academic/syllabus", { method: "POST", body: JSON.stringify(data) });
    return {
      id: r.id,
      courseId: r.course_id || r.courseId,
      topic: r.topic,
      week: Number(r.week) || 1,
      subTopics: r.sub_topics || r.subTopics || [],
      teacherStatus: r.teacher_status || r.teacherStatus || "pending",
      adminStatus: r.admin_status || r.adminStatus || "Published",
      totalSlides: Number(r.total_slides ?? r.totalSlides) || 0,
      completedSlides: Number(r.completed_slides ?? r.completedSlides) || 0,
    };
  },
  updateSyllabusTopic: async (id: string, data: Partial<SyllabusTopic>): Promise<SyllabusTopic> => {
    const r = await request<any>(`/admin/academic/syllabus/${id}`, { method: "PUT", body: JSON.stringify(data) });
    return {
      id: r.id,
      courseId: r.course_id || r.courseId,
      topic: r.topic,
      week: Number(r.week) || 1,
      subTopics: r.sub_topics || r.subTopics || [],
      teacherStatus: r.teacher_status || r.teacherStatus || "pending",
      adminStatus: r.admin_status || r.adminStatus || "Published",
      totalSlides: Number(r.total_slides ?? r.totalSlides) || 0,
      completedSlides: Number(r.completed_slides ?? r.completedSlides) || 0,
    };
  },
  deleteSyllabusTopic: (id: string) =>
    request<{ message: string }>(`/admin/academic/syllabus/${id}`, { method: "DELETE" }),

  // ── Teachers ──
  getTeachers: async (): Promise<Teacher[]> => {
    const rows = await request<any[]>("/admin/users/teachers");
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      departmentId: r.department_id || "",
      designation: r.designation || "Faculty",
    }));
  },
  createTeacher: (data: Omit<Teacher, "id">) =>
    request<Teacher>("/admin/users/teachers", { method: "POST", body: JSON.stringify(data) }),
  updateTeacher: (id: string, data: Partial<Teacher>) =>
    request<Teacher>(`/admin/users/teachers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteTeacher: (id: string) =>
    request<{ message: string }>(`/admin/users/teachers/${id}`, { method: "DELETE" }),

  // ── Admins ──
  getAdmins: async (): Promise<AdminUser[]> => {
    const rows = await request<any[]>("/admin/users/admins");
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role || "Super Admin",
    }));
  },
  createAdmin: (data: Omit<AdminUser, "id">) =>
    request<AdminUser>("/admin/users/admins", { method: "POST", body: JSON.stringify(data) }),
  updateAdmin: (id: string, data: Partial<AdminUser>) =>
    request<AdminUser>(`/admin/users/admins/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAdmin: (id: string) =>
    request<{ message: string }>(`/admin/users/admins/${id}`, { method: "DELETE" }),

  // ── Students ──
  getStudents: async (batchId?: string): Promise<Student[]> => {
    const url = batchId ? `/admin/users/students?batchId=${batchId}` : "/admin/users/students";
    const rows = await request<any[]>(url);
    return rows.map(r => ({
      id: r.id,
      rollNo: r.rollNo || r.roll_no || "",
      name: r.name,
      email: r.email,
      batchId: r.batchId || r.batch_id || "",
      phone: r.phone || "",
      documents: Array.isArray(r.documents)
        ? r.documents
        : typeof r.documents === "string"
        ? JSON.parse(r.documents)
        : [],
    }));
  },
  createStudent: (data: Omit<Student, "id">) =>
    request<Student>("/admin/users/students", { method: "POST", body: JSON.stringify(data) }),
  updateStudent: (id: string, data: Partial<Student>) =>
    request<Student>(`/admin/users/students/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteStudent: (id: string) =>
    request<{ message: string }>(`/admin/users/students/${id}`, { method: "DELETE" }),

  // ── Classrooms ──
  getClassrooms: async (): Promise<Classroom[]> => {
    const rows = await request<any[]>("/admin/classrooms");
    return rows.map(r => ({
      id: r.id,
      courseId: r.course_id,
      batchId: r.batch_id,
      teacherId: r.teacher_id,
      room: r.room,
      startDate: r.start_date ? r.start_date.split("T")[0] : "",
      endDate: r.end_date ? r.end_date.split("T")[0] : "",
      status: r.status,
      classesCompleted: Number(r.classes_completed) || 0,
      totalClasses: Number(r.total_classes) || 24,
      colorIndex: Number(r.color_index) || 0,
    }));
  },
  createClassroom: (data: Omit<Classroom, "id">) =>
    request<Classroom>("/admin/classrooms", { method: "POST", body: JSON.stringify(data) }),
  updateClassroom: (id: string, data: Partial<Classroom>) =>
    request<Classroom>(`/admin/classrooms/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteClassroom: (id: string) =>
    request<{ message: string }>(`/admin/classrooms/${id}`, { method: "DELETE" }),

  // ── Class Schedules ──
  getSchedules: async (): Promise<ClassSchedule[]> => {
    const rows = await request<any[]>("/admin/classrooms/schedules/all");
    return rows.map(r => ({
      id: r.id,
      classroomId: r.classroom_id,
      day: r.day,
      startTime: r.start_time,
      endTime: r.end_time,
      room: r.room,
    }));
  },
  createSchedule: (data: Omit<ClassSchedule, "id">) =>
    request<ClassSchedule>("/admin/classrooms/schedules", { method: "POST", body: JSON.stringify(data) }),
  updateSchedule: (id: string, data: Partial<ClassSchedule>) =>
    request<ClassSchedule>(`/admin/classrooms/schedules/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteSchedule: (id: string) =>
    request<{ message: string }>(`/admin/classrooms/schedules/${id}`, { method: "DELETE" }),

  // ── Assignments ──
  getAssignments: async (): Promise<Assignment[]> => {
    const rows = await request<any[]>("/admin/activities/assignments");
    return rows.map(r => ({
      id: r.id,
      classroomId: r.classroom_id,
      title: r.title,
      description: r.description || "",
      dueDate: r.due_date ? r.due_date.split("T")[0] : "",
      totalMarks: Number(r.total_marks) || 20,
      status: r.status,
      submissions: Number(r.submissions) || 0,
    }));
  },
  createAssignment: (data: Omit<Assignment, "id">) =>
    request<Assignment>("/admin/activities/assignments", { method: "POST", body: JSON.stringify(data) }),
  updateAssignment: (id: string, data: Partial<Assignment>) =>
    request<Assignment>(`/admin/activities/assignments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAssignment: (id: string) =>
    request<{ message: string }>(`/admin/activities/assignments/${id}`, { method: "DELETE" }),

  // ── Tests ──
  getTests: async (): Promise<Test[]> => {
    const rows = await request<any[]>("/admin/activities/tests");
    return rows.map(r => ({
      id: r.id,
      classroomId: r.classroom_id,
      title: r.title,
      description: r.description || "",
      testDate: r.test_date ? r.test_date.split("T")[0] : "",
      duration: r.duration || "1h",
      totalMarks: Number(r.total_marks) || 25,
      status: r.status,
      submissions: Number(r.submissions) || 0,
    }));
  },
  createTest: (data: Omit<Test, "id">) =>
    request<Test>("/admin/activities/tests", { method: "POST", body: JSON.stringify(data) }),
  updateTest: (id: string, data: Partial<Test>) =>
    request<Test>(`/admin/activities/tests/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteTest: (id: string) =>
    request<{ message: string }>(`/admin/activities/tests/${id}`, { method: "DELETE" }),

  // ── Class Sessions ──
  getClassSessions: async (): Promise<ClassSession[]> => {
    const rows = await request<any[]>("/admin/activities/sessions");
    return rows.map(r => ({
      id: r.id,
      classroomId: r.classroom_id,
      date: r.date,
      topicCovered: r.topic_covered,
      notes: r.notes || "",
      duration: r.duration || "1h 30m",
      conductedAt: r.conducted_at || r.date,
    }));
  },
  createClassSession: (data: Omit<ClassSession, "id">) =>
    request<ClassSession>("/admin/activities/sessions", { method: "POST", body: JSON.stringify(data) }),

  // ── Attendance Records ──
  getAttendanceRecords: async (): Promise<AttendanceRecord[]> => {
    const rows = await request<any[]>("/admin/activities/attendance");
    return rows.map(r => ({
      id: r.id,
      sessionId: r.session_id,
      classroomId: r.classroom_id,
      studentId: r.student_id,
      status: r.status,
    }));
  },
  saveAttendance: (records: { sessionId: string; classroomId: string; studentId: string; status: string }[]) =>
    request<{ message: string }>("/admin/activities/attendance", { method: "POST", body: JSON.stringify({ records }) }),

  // ── Grade Records ──
  getGradeRecords: async (): Promise<GradeRecord[]> => {
    const rows = await request<any[]>("/admin/activities/results");
    return rows.map(r => ({
      id: r.id,
      classroomId: r.classroom_id,
      studentId: r.student_id,
      assignmentId: r.assignment_id || undefined,
      testId: r.test_id || undefined,
      obtainedMarks: Number(r.obtained_marks),
      totalMarks: Number(r.total_marks),
      remarks: r.remarks || "",
    }));
  },
  saveGradeRecord: (data: Omit<GradeRecord, "id">) =>
    request<GradeRecord>("/admin/activities/results", { method: "POST", body: JSON.stringify(data) }),

  // ── Announcements ──
  getAnnouncements: async (): Promise<Announcement[]> => {
    const rows = await request<any[]>("/admin/announcements");
    return rows.map(r => ({
      id: r.id,
      title: r.title,
      content: r.content,
      date: r.date,
      authorId: r.author_id,
      authorName: r.author_name,
      authorRole: r.author_role,
      audienceType: r.audience_type,
      programId: r.program_id || undefined,
      batchId: r.batch_id || undefined,
      courseId: r.course_id || undefined,
      status: r.status,
      priority: r.priority,
    }));
  },
  createAnnouncement: (data: Omit<Announcement, "id">) =>
    request<Announcement>("/admin/announcements", { method: "POST", body: JSON.stringify(data) }),
  updateAnnouncement: (id: string, data: Partial<Announcement>) =>
    request<Announcement>(`/admin/announcements/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAnnouncement: (id: string) =>
    request<{ message: string }>(`/admin/announcements/${id}`, { method: "DELETE" }),

  // ── Course Materials ──
  getMaterials: async (classroomId?: string): Promise<any[]> => {
    const url = classroomId ? `/admin/activities/materials?classroomId=${classroomId}` : "/admin/activities/materials";
    const rows = await request<any[]>(url);
    return rows.map(r => ({
      id: r.id,
      classroomId: r.classroom_id,
      courseId: r.course_id,
      title: r.title,
      description: r.description || "",
      fileName: r.file_name,
      fileType: r.file_type,
      fileData: r.file_data,
      fileSize: r.file_size,
      uploadedAt: r.uploaded_at,
    }));
  },
  createMaterial: (data: any) =>
    request<any>("/admin/activities/materials", { method: "POST", body: JSON.stringify(data) }),
  deleteMaterial: (id: string) =>
    request<{ message: string }>(`/admin/activities/materials/${id}`, { method: "DELETE" }),

  // ── Class Rescheduling & Teacher Slot Exchange ──
  getReschedules: () => request<ClassReschedule[]>("/teacher/reschedules"),
  createReschedule: (data: Partial<ClassReschedule>) =>
    request<ClassReschedule>("/teacher/reschedules", { method: "POST", body: JSON.stringify(data) }),
  updateRescheduleStatus: (id: string, status: "Approved" | "Rejected" | "Cancelled") =>
    request<ClassReschedule>(`/teacher/reschedules/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),

  // ── Consolidated Dashboard API ──
  getAdminDashboard: () => request<AdminDashboardData>("/admin/dashboard"),
  getTeacherDashboard: () => request<TeacherDashboardData>("/teacher/dashboard"),
  getStudentDashboard: () => request<StudentDashboardData>("/student/dashboard"),

  // ── Student Portal Dedicated APIs ──
  getStudentClassrooms: () => request<any[]>("/student/classrooms"),
  getStudentMaterials: () => request<any[]>("/student/materials"),
  getStudentAssignments: () => request<any[]>("/student/assignments"),
  submitStudentAssignment: (assignmentId: string, classroomId: string, submissionText: string) =>
    request<any>(`/student/assignments/${assignmentId}/submit`, {
      method: "POST",
      body: JSON.stringify({ assignmentId, classroomId, submissionText }),
    }),
  getStudentTests: () => request<any[]>("/student/tests"),
  getStudentAttendance: () => request<any[]>("/student/attendance"),
  getStudentResults: () => request<any>("/student/results"),

  // ── Reports API ──
  getStudentTranscript: (studentId: string) => request<any>(`/admin/reports/transcripts/${studentId}`),
  getSessionSemesterResults: (sessionId: string, batchId: string, semester: string) =>
    request<any>(`/admin/reports/session-semester-results?sessionId=${sessionId}&batchId=${batchId}&semester=${encodeURIComponent(semester)}`),
};


export interface AdminDashboardData {
  metrics: {
    totalStudents: number;
    totalTeachers: number;
    ongoingClassrooms: number;
    totalCourses: number;
    totalBatches: number;
    avgAttendanceRate: number;
  };
  departmentDistribution: Array<{
    id?: string;
    name: string;
    fullName?: string;
    rawCount?: number;
    value: number;
  }>;
  trendData: Array<{
    month: string;
    enrollment: number;
    attendance: number;
  }>;
  recentActivities: Array<{
    id: string;
    user: string;
    action: string;
    target: string;
    time: string;
    color: string;
    timestamp?: string;
  }>;
  ongoingClassrooms: Array<{
    id: string;
    room: string;
    status: string;
    classes_completed: number;
    total_classes: number;
    color_index: number;
    course_title: string;
    course_code: string;
    batch_name: string;
    batch_code: string;
    teacher_name: string;
    student_count: number;
    progress: number;
  }>;
}

export interface TeacherDashboardData {
  teacher: {
    id: string;
    name: string;
  };
  metrics: {
    totalClassrooms: number;
    totalStudents: number;
    totalSessionsConducted: number;
    totalAssignments: number;
    totalTests: number;
    avgAttendanceRate: number;
    todayClassesCount: number;
  };
  myClassrooms: Array<{
    id: string;
    room: string;
    status: string;
    classes_completed: number;
    total_classes: number;
    color_index: number;
    course_id: string;
    course_title: string;
    course_code: string;
    credits: number;
    batch_name: string;
    batch_code: string;
    student_count: number;
    progress: number;
  }>;
  todaySchedules: Array<{
    id: string;
    day: string;
    start_time: string;
    end_time: string;
    room: string;
    course_title: string;
    course_code: string;
    batch_name: string;
  }>;
  syllabusProgress: Array<{
    courseId: string;
    courseCode: string;
    courseTitle: string;
    totalTopics: number;
    completedTopics: number;
    progress: number;
  }>;
  recentSessions: Array<{
    id: string;
    topic_covered: string;
    duration: string;
    date: string;
    course_title: string;
    course_code: string;
    batch_name: string;
    present_count: number;
    total_attendance_count: number;
  }>;
}

export interface StudentDashboardData {
  student: {
    id: string;
    name: string;
    roll_no: string;
    email: string;
    batch_name?: string;
    program_code?: string;
  };
  metrics: {
    enrolledClassroomsCount: number;
    upcomingAssignmentsCount: number;
    upcomingTestsCount: number;
    todayClassesCount: number;
    avgAttendanceRate: number;
  };
  enrolledClassrooms: Array<{
    id: string;
    room: string;
    status: string;
    classes_completed: number;
    total_classes: number;
    course_title: string;
    course_code: string;
    batch_name: string;
    teacher_name: string;
    student_count: number;
  }>;
  todaySchedules: Array<{
    id: string;
    day: string;
    start_time: string;
    end_time: string;
    room: string;
    course_title: string;
    course_code: string;
    teacher_name: string;
  }>;
  upcomingAssignments: Array<{
    id: string;
    title: string;
    due_date: string;
    total_marks: number;
    course_code: string;
    course_title: string;
  }>;
  upcomingTests: Array<{
    id: string;
    title: string;
    test_date: string;
    total_marks: number;
    course_code: string;
    course_title: string;
  }>;
  recentSessions: Array<{
    id: string;
    topic_covered: string;
    conducted_at: string;
    course_code: string;
    course_title: string;
    teacher_name: string;
  }>;
}

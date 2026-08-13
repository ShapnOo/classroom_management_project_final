// ─── Core Entities ─────────────────────────────────────────────────────────

export type Session = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Upcoming" | "Completed";
};

export type Department = {
  id: string;
  name: string;
  code: string;
};

export type Program = {
  id: string;
  departmentId: string;
  name: string;
  code: string;
  duration: string;
};

export type Batch = {
  id: string;
  code: string;
  name: string;
  programId: string;
  sessionId: string;
  section: string;
  status: "Active" | "Upcoming" | "Completed";
};

export type Student = {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  batchId: string;
  phone?: string;
};

export type Teacher = {
  id: string;
  name: string;
  email: string;
  departmentId: string;
  designation: string;
};

// ─── Academic Entities ─────────────────────────────────────────────────────

export type Course = {
  id: string;
  code: string;
  title: string;
  programId: string;
  credits: number;
  semester: number;
};

export type SyllabusTopic = {
  id: string;
  courseId: string;
  topic: string;
  week: number;
  subTopics: string[];
  teacherStatus: "pending" | "current" | "done"; // teacher marks progress
  adminStatus: "Published" | "Draft" | "Archived"; // admin controls visibility
};

/**
 * Classroom = Admin creates this to link:
 *   Course + Batch + Teacher + Room + Dates
 * Teacher sees classrooms assigned to them.
 */
export type Classroom = {
  id: string;
  courseId: string;
  batchId: string;
  teacherId: string;
  room: string;
  startDate: string;
  endDate: string;
  status: "ongoing" | "upcoming" | "completed";
  classesCompleted: number;
  totalClasses: number;
  colorIndex: number; // 0-5, maps to CLASSROOM_COLORS
};

export type ClassSchedule = {
  id: string;
  classroomId: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
};

// ─── Teacher-Created Entities ───────────────────────────────────────────────

export type Assignment = {
  id: string;
  classroomId: string;
  title: string;
  description?: string;
  dueDate: string;
  totalMarks: number;
  status: "Active" | "Upcoming" | "Completed";
  submissions: number;
};

export type Test = {
  id: string;
  classroomId: string;
  title: string;
  testDate: string;
  totalMarks: number;
  status: "Active" | "Upcoming" | "Completed";
  submissions: number;
};

// ─── Derived View Types ─────────────────────────────────────────────────────

/** Enriched classroom with all joined data for display */
export type ClassroomView = {
  classroom: Classroom;
  course: Course;
  batch: Batch;
  teacher: Teacher;
  session: Session;
  program: Program;
  schedules: ClassSchedule[];
  syllabusTopics: SyllabusTopic[];
  students: Student[];
  assignments: Assignment[];
  tests: Test[];
  // computed display
  scheduleLabel: string;
  progress: number;
  studentCount: number;
  colors: { color: string; light: string; text: string };
};

// ─── Color Palette ──────────────────────────────────────────────────────────

export const CLASSROOM_COLORS = [
  { color: "bg-blue-500",    light: "bg-blue-50",    text: "text-blue-700"    },
  { color: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-700" },
  { color: "bg-purple-500",  light: "bg-purple-50",  text: "text-purple-700"  },
  { color: "bg-amber-500",   light: "bg-amber-50",   text: "text-amber-700"   },
  { color: "bg-rose-500",    light: "bg-rose-50",    text: "text-rose-700"    },
  { color: "bg-teal-500",    light: "bg-teal-50",    text: "text-teal-700"    },
] as const;

"use client";

import React, {
  createContext, useContext, useState, useEffect, useCallback, ReactNode
} from "react";
import type {
  Session, Department, Program, Batch, Student, Teacher,
  Course, SyllabusTopic, Classroom, ClassSchedule, Assignment, Test,
  ClassroomView, ClassSession, AttendanceRecord, GradeRecord,
  Announcement, AnnouncementAudienceType, AdminUser
} from "./types";
import { CLASSROOM_COLORS } from "./types";
import {
  seedSessions, seedDepartments, seedPrograms, seedBatches, seedStudents,
  seedTeachers, seedCourses, seedSyllabusTopics, seedClassrooms, seedSchedules,
  seedAssignments, seedTests, seedAnnouncements, seedAdmins, CURRENT_TEACHER_ID,
} from "./seedData";

// ─── State Shape ─────────────────────────────────────────────────────────────

type AppState = {
  sessions: Session[];
  departments: Department[];
  programs: Program[];
  batches: Batch[];
  students: Student[];
  teachers: Teacher[];
  courses: Course[];
  syllabusTopics: SyllabusTopic[];
  classrooms: Classroom[];
  schedules: ClassSchedule[];
  assignments: Assignment[];
  tests: Test[];
  classSessions: ClassSession[];
  attendanceRecords: AttendanceRecord[];
  gradeRecords: GradeRecord[];
  announcements: Announcement[];
  admins: AdminUser[];
};

// ─── Actions ─────────────────────────────────────────────────────────────────

type AppActions = {
  // Sessions
  addSession: (s: Omit<Session, "id">) => void;
  updateSession: (id: string, s: Partial<Session>) => void;
  deleteSession: (id: string) => void;
  // Batches
  addBatch: (b: Omit<Batch, "id">) => void;
  updateBatch: (id: string, b: Partial<Batch>) => void;
  deleteBatch: (id: string) => void;
  // Students
  addStudent: (s: Omit<Student, "id">) => void;
  updateStudent: (id: string, s: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  // Teachers
  addTeacher: (t: Omit<Teacher, "id">) => void;
  updateTeacher: (id: string, t: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;
  // Admins
  addAdmin: (a: Omit<AdminUser, "id">) => void;
  updateAdmin: (id: string, a: Partial<AdminUser>) => void;
  deleteAdmin: (id: string) => void;
  // Courses
  addCourse: (c: Omit<Course, "id">) => void;
  updateCourse: (id: string, c: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  // Syllabus Topics
  addSyllabusTopic: (t: Omit<SyllabusTopic, "id">) => void;
  updateSyllabusTopic: (id: string, t: Partial<SyllabusTopic>) => void;
  deleteSyllabusTopic: (id: string) => void;
  // Classrooms
  addClassroom: (c: Omit<Classroom, "id">) => string;
  updateClassroom: (id: string, c: Partial<Classroom>) => void;
  deleteClassroom: (id: string) => void;
  // Schedules
  addSchedule: (s: Omit<ClassSchedule, "id">) => void;
  updateSchedule: (id: string, s: Partial<ClassSchedule>) => void;
  deleteSchedule: (id: string) => void;
  // Assignments
  addAssignment: (a: Omit<Assignment, "id">) => void;
  updateAssignment: (id: string, a: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  // Tests
  addTest: (t: Omit<Test, "id">) => void;
  updateTest: (id: string, t: Partial<Test>) => void;
  deleteTest: (id: string) => void;
  // Class Sessions
  addClassSession: (s: Omit<ClassSession, "id">) => void;
  updateClassSession: (id: string, s: Partial<ClassSession>) => void;
  deleteClassSession: (id: string) => void;
  // Attendance Records
  addAttendanceRecord: (r: Omit<AttendanceRecord, "id">) => void;
  updateAttendanceRecord: (id: string, r: Partial<AttendanceRecord>) => void;
  upsertAttendance: (sessionId: string, classroomId: string, studentId: string, status: AttendanceRecord["status"]) => void;
  // Grade Records
  addGradeRecord: (r: Omit<GradeRecord, "id">) => void;
  updateGradeRecord: (id: string, r: Partial<GradeRecord>) => void;
  upsertGradeRecord: (data: Omit<GradeRecord, "id">) => void;
  // Announcements
  addAnnouncement: (a: Omit<Announcement, "id">) => void;
  updateAnnouncement: (id: string, a: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  // Derived helpers
  getClassroomView: (classroomId: string) => ClassroomView | null;
  getMyClassroomViews: () => ClassroomView[];
  getAllClassroomViews: () => ClassroomView[];
  getTodaysSchedule: () => (ClassSchedule & { classroomView: ClassroomView })[];
  getUpNextTopic: () => SyllabusTopic | null;
};

type AppStore = AppState & AppActions;

// ─── Context ─────────────────────────────────────────────────────────────────

const StoreContext = createContext<AppStore | null>(null);

const STORAGE_KEY = "scholaris_app_state";
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const initialState: AppState = {
  sessions: seedSessions,
  departments: seedDepartments,
  programs: seedPrograms,
  batches: seedBatches,
  students: seedStudents,
  teachers: seedTeachers,
  courses: seedCourses,
  syllabusTopics: seedSyllabusTopics,
  classrooms: seedClassrooms,
  schedules: seedSchedules,
  assignments: seedAssignments,
  tests: seedTests,
  classSessions: [],
  attendanceRecords: [],
  gradeRecords: [],
  announcements: seedAnnouncements,
  admins: seedAdmins,
};

function loadState(): AppState {
  if (typeof window === "undefined") return initialState;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return initialState;
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  // Load from localStorage on mount
  useEffect(() => {
    setState(loadState());
  }, []);

  // Persist every state change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // ── Generic updater helpers ──
  const update = useCallback(<K extends keyof AppState>(
    key: K,
    updater: (prev: AppState[K]) => AppState[K]
  ) => {
    setState(s => ({ ...s, [key]: updater(s[key]) }));
  }, []);

  // ── Session CRUD ──
  const addSession = (s: Omit<Session, "id">) =>
    update("sessions", prev => [...prev, { ...s, id: genId() }]);
  const updateSession = (id: string, s: Partial<Session>) =>
    update("sessions", prev => prev.map(x => x.id === id ? { ...x, ...s } : x));
  const deleteSession = (id: string) =>
    update("sessions", prev => prev.filter(x => x.id !== id));

  // ── Batch CRUD ──
  const addBatch = (b: Omit<Batch, "id">) =>
    update("batches", prev => [...prev, { ...b, id: genId() }]);
  const updateBatch = (id: string, b: Partial<Batch>) =>
    update("batches", prev => prev.map(x => x.id === id ? { ...x, ...b } : x));
  const deleteBatch = (id: string) =>
    update("batches", prev => prev.filter(x => x.id !== id));

  // ── Student CRUD ──
  const addStudent = (s: Omit<Student, "id">) =>
    update("students", prev => [...prev, { ...s, id: genId() }]);
  const updateStudent = (id: string, s: Partial<Student>) =>
    update("students", prev => prev.map(x => x.id === id ? { ...x, ...s } : x));
  const deleteStudent = (id: string) =>
    update("students", prev => prev.filter(x => x.id !== id));

  // ── Teacher CRUD ──
  const addTeacher = (t: Omit<Teacher, "id">) =>
    update("teachers", prev => [...prev, { ...t, id: genId() }]);
  const updateTeacher = (id: string, t: Partial<Teacher>) =>
    update("teachers", prev => prev.map(x => x.id === id ? { ...x, ...t } : x));
  const deleteTeacher = (id: string) =>
    update("teachers", prev => prev.filter(x => x.id !== id));

  // ── Admin CRUD ──
  const addAdmin = (a: Omit<AdminUser, "id">) =>
    update("admins", prev => [...prev, { ...a, id: genId() }]);
  const updateAdmin = (id: string, a: Partial<AdminUser>) =>
    update("admins", prev => prev.map(x => x.id === id ? { ...x, ...a } : x));
  const deleteAdmin = (id: string) =>
    update("admins", prev => prev.filter(x => x.id !== id));

  // ── Course CRUD ──
  const addCourse = (c: Omit<Course, "id">) =>
    update("courses", prev => [...prev, { ...c, id: genId() }]);
  const updateCourse = (id: string, c: Partial<Course>) =>
    update("courses", prev => prev.map(x => x.id === id ? { ...x, ...c } : x));
  const deleteCourse = (id: string) =>
    update("courses", prev => prev.filter(x => x.id !== id));

  // ── Syllabus CRUD ──
  const addSyllabusTopic = (t: Omit<SyllabusTopic, "id">) =>
    update("syllabusTopics", prev => [...prev, { ...t, id: genId() }]);
  const updateSyllabusTopic = (id: string, t: Partial<SyllabusTopic>) =>
    update("syllabusTopics", prev => prev.map(x => x.id === id ? { ...x, ...t } : x));
  const deleteSyllabusTopic = (id: string) =>
    update("syllabusTopics", prev => prev.filter(x => x.id !== id));

  // ── Classroom CRUD ──
  const addClassroom = (c: Omit<Classroom, "id">) => {
    const id = genId();
    update("classrooms", prev => [...prev, { ...c, id }]);
    return id;
  };
  const updateClassroom = (id: string, c: Partial<Classroom>) =>
    update("classrooms", prev => prev.map(x => x.id === id ? { ...x, ...c } : x));
  const deleteClassroom = (id: string) =>
    update("classrooms", prev => prev.filter(x => x.id !== id));

  // ── Schedule CRUD ──
  const addSchedule = (s: Omit<ClassSchedule, "id">) =>
    update("schedules", prev => [...prev, { ...s, id: genId() }]);
  const updateSchedule = (id: string, s: Partial<ClassSchedule>) =>
    update("schedules", prev => prev.map(x => x.id === id ? { ...x, ...s } : x));
  const deleteSchedule = (id: string) =>
    update("schedules", prev => prev.filter(x => x.id !== id));

  // ── Assignment CRUD ──
  const addAssignment = (a: Omit<Assignment, "id">) =>
    update("assignments", prev => [...prev, { ...a, id: genId() }]);
  const updateAssignment = (id: string, a: Partial<Assignment>) =>
    update("assignments", prev => prev.map(x => x.id === id ? { ...x, ...a } : x));
  const deleteAssignment = (id: string) =>
    update("assignments", prev => prev.filter(x => x.id !== id));

  // ── Test CRUD ──
  const addTest = (t: Omit<Test, "id">) =>
    update("tests", prev => [...prev, { ...t, id: genId() }]);
  const updateTest = (id: string, t: Partial<Test>) =>
    update("tests", prev => prev.map(x => x.id === id ? { ...x, ...t } : x));
  const deleteTest = (id: string) =>
    update("tests", prev => prev.filter(x => x.id !== id));

  // ── ClassSession CRUD ──
  const addClassSession = (s: Omit<ClassSession, "id">) =>
    update("classSessions", prev => [...prev, { ...s, id: genId() }]);
  const updateClassSession = (id: string, s: Partial<ClassSession>) =>
    update("classSessions", prev => prev.map(x => x.id === id ? { ...x, ...s } : x));
  const deleteClassSession = (id: string) =>
    update("classSessions", prev => prev.filter(x => x.id !== id));

  // ── Announcements CRUD ──
  const addAnnouncement = (a: Omit<Announcement, "id">) =>
    update("announcements", prev => [...prev, { ...a, id: genId() }]);
  const updateAnnouncement = (id: string, a: Partial<Announcement>) =>
    update("announcements", prev => prev.map(x => x.id === id ? { ...x, ...a } : x));
  const deleteAnnouncement = (id: string) =>
    update("announcements", prev => prev.filter(x => x.id !== id));

  // ── Attendance CRUD ──
  const addAttendanceRecord = (r: Omit<AttendanceRecord, "id">) =>
    update("attendanceRecords", prev => [...prev, { ...r, id: genId() }]);
  const updateAttendanceRecord = (id: string, r: Partial<AttendanceRecord>) =>
    update("attendanceRecords", prev => prev.map(x => x.id === id ? { ...x, ...r } : x));
  // Upsert: update existing or create new attendance for a student in a session
  const upsertAttendance = (
    sessionId: string, classroomId: string, studentId: string,
    status: AttendanceRecord["status"]
  ) => {
    setState(s => {
      const existing = s.attendanceRecords.find(
        r => r.sessionId === sessionId && r.studentId === studentId
      );
      if (existing) {
        return { ...s, attendanceRecords: s.attendanceRecords.map(r =>
          r.id === existing.id ? { ...r, status } : r
        )};
      }
      return { ...s, attendanceRecords: [
        ...s.attendanceRecords,
        { id: genId(), sessionId, classroomId, studentId, status }
      ]};
    });
  };

  // ── Grade Records ──
  const addGradeRecord = (r: Omit<GradeRecord, "id">) =>
    update("gradeRecords", prev => [...prev, { ...r, id: genId() }]);
  const updateGradeRecord = (id: string, r: Partial<GradeRecord>) =>
    update("gradeRecords", prev => prev.map(x => x.id === id ? { ...x, ...r } : x));
  const upsertGradeRecord = (data: Omit<GradeRecord, "id">) => {
    setState(s => {
      const existing = s.gradeRecords.find(r =>
        r.classroomId === data.classroomId &&
        r.studentId === data.studentId &&
        r.assignmentId === data.assignmentId &&
        r.testId === data.testId
      );
      if (existing) {
        return { ...s, gradeRecords: s.gradeRecords.map(r =>
          r.id === existing.id ? { ...r, ...data } : r
        )};
      }
      return { ...s, gradeRecords: [...s.gradeRecords, { ...data, id: genId() }] };
    });
  };

  // ── Derived: build a fully enriched ClassroomView ──
  const buildView = useCallback((cls: Classroom): ClassroomView | null => {
    const course   = state.courses.find(c => c.id === cls.courseId);
    const batch    = state.batches.find(b => b.id === cls.batchId);
    const teacher  = state.teachers.find(t => t.id === cls.teacherId);
    if (!course || !batch || !teacher) return null;

    const session  = state.sessions.find(s => s.id === batch.sessionId);
    const program  = state.programs.find(p => p.id === batch.programId);
    if (!session || !program) return null;

    const schedules      = state.schedules.filter(s => s.classroomId === cls.id);
    const syllabusTopics = state.syllabusTopics.filter(t => t.courseId === cls.courseId);
    const students       = state.students.filter(s => s.batchId === cls.batchId);
    const assignments    = state.assignments.filter(a => a.classroomId === cls.id);
    const tests          = state.tests.filter(t => t.classroomId === cls.id);

    const days = [...new Set(schedules.map(s => s.day.slice(0, 3)))].join(", ");
    const time = schedules[0] ? `${schedules[0].startTime} – ${schedules[0].endTime}` : "";
    const scheduleLabel = [days, time].filter(Boolean).join(" • ");

    const progress = cls.totalClasses > 0
      ? Math.round((cls.classesCompleted / cls.totalClasses) * 100)
      : 0;

    const colors = CLASSROOM_COLORS[cls.colorIndex % CLASSROOM_COLORS.length];

    return {
      classroom: cls, course, batch, teacher, session, program,
      schedules, syllabusTopics, students, assignments, tests,
      scheduleLabel, progress, studentCount: students.length, colors,
    };
  }, [state]);

  const getClassroomView = useCallback((id: string) => {
    const cls = state.classrooms.find(c => c.id === id);
    return cls ? buildView(cls) : null;
  }, [state.classrooms, buildView]);

  const getMyClassroomViews = useCallback(() =>
    state.classrooms
      .filter(c => c.teacherId === CURRENT_TEACHER_ID)
      .map(c => buildView(c))
      .filter(Boolean) as ClassroomView[]
  , [state.classrooms, buildView]);

  const getAllClassroomViews = useCallback(() =>
    state.classrooms
      .map(c => buildView(c))
      .filter(Boolean) as ClassroomView[]
  , [state.classrooms, buildView]);

  const getTodaysSchedule = useCallback(() => {
    const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const today = dayNames[new Date().getDay()];
    const myClassroomIds = state.classrooms
      .filter(c => c.teacherId === CURRENT_TEACHER_ID)
      .map(c => c.id);
    return state.schedules
      .filter(s => s.day === today && myClassroomIds.includes(s.classroomId))
      .map(s => {
        const view = getClassroomView(s.classroomId);
        return view ? { ...s, classroomView: view } : null;
      })
      .filter(Boolean) as (ClassSchedule & { classroomView: ClassroomView })[];
  }, [state.classrooms, state.schedules, getClassroomView]);

  const getUpNextTopic = useCallback(() => {
    const myCourseIds = state.classrooms
      .filter(c => c.teacherId === CURRENT_TEACHER_ID)
      .map(c => c.courseId);
    return state.syllabusTopics.find(
      t => myCourseIds.includes(t.courseId) && t.teacherStatus === "current"
    ) || null;
  }, [state.classrooms, state.syllabusTopics]);

  const store: AppStore = {
    ...state,
    addSession, updateSession, deleteSession,
    addBatch, updateBatch, deleteBatch,
    addStudent, updateStudent, deleteStudent,
    addTeacher, updateTeacher, deleteTeacher,
    addAdmin, updateAdmin, deleteAdmin,
    addCourse, updateCourse, deleteCourse,
    addSyllabusTopic, updateSyllabusTopic, deleteSyllabusTopic,
    addClassroom, updateClassroom, deleteClassroom,
    addSchedule, updateSchedule, deleteSchedule,
    addAssignment, updateAssignment, deleteAssignment,
    addTest, updateTest, deleteTest,
    addClassSession, updateClassSession, deleteClassSession,
    addAttendanceRecord, updateAttendanceRecord, upsertAttendance,
    addGradeRecord, updateGradeRecord, upsertGradeRecord,
    addAnnouncement, updateAnnouncement, deleteAnnouncement,
    // helpers
    getClassroomView,
    getMyClassroomViews, getAllClassroomViews,
    getTodaysSchedule, getUpNextTopic,
  };

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within <StoreProvider>");
  return ctx;
}

// Re-export for convenience
export { CURRENT_TEACHER_ID };

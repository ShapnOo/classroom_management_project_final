"use client";

import React, {
  createContext, useContext, useState, useEffect, useCallback, ReactNode
} from "react";
import type {
  Session, Department, Program, Batch, Student, Teacher,
  Course, SyllabusTopic, Classroom, ClassSchedule, Assignment, Test,
  ClassroomView, ClassSession, AttendanceRecord, GradeRecord,
  Announcement, AdminUser, AppSettings
} from "./types";
import { CLASSROOM_COLORS } from "./types";
import {
  seedSessions, seedDepartments, seedPrograms, seedBatches, seedStudents,
  seedTeachers, seedCourses, seedSyllabusTopics, seedClassrooms, seedSchedules,
  seedAssignments, seedTests, seedAnnouncements, seedAdmins, CURRENT_TEACHER_ID,
  seedClassSessions, seedAttendanceRecords, seedGradeRecords, seedSettings
} from "./seedData";
import { api } from "./api";

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
  settings: AppSettings;
  isLoading: boolean;
  isBackendConnected: boolean;
};

// ─── Actions ─────────────────────────────────────────────────────────────────

type AppActions = {
  // Sync
  refreshFromBackend: () => Promise<void>;
  // Sessions
  addSession: (s: Omit<Session, "id">) => Promise<void>;
  updateSession: (id: string, s: Partial<Session>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  // Batches
  addBatch: (b: Omit<Batch, "id">) => Promise<void>;
  updateBatch: (id: string, b: Partial<Batch>) => Promise<void>;
  deleteBatch: (id: string) => Promise<void>;
  // Students
  addStudent: (s: Omit<Student, "id">) => Promise<void>;
  updateStudent: (id: string, s: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  // Teachers
  addTeacher: (t: Omit<Teacher, "id">) => Promise<void>;
  updateTeacher: (id: string, t: Partial<Teacher>) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  // Admins
  addAdmin: (a: Omit<AdminUser, "id">) => Promise<void>;
  updateAdmin: (id: string, a: Partial<AdminUser>) => Promise<void>;
  deleteAdmin: (id: string) => Promise<void>;
  // Courses
  addCourse: (c: Omit<Course, "id">) => Promise<void>;
  updateCourse: (id: string, c: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  // Syllabus Topics
  addSyllabusTopic: (t: Omit<SyllabusTopic, "id">) => Promise<void>;
  updateSyllabusTopic: (id: string, t: Partial<SyllabusTopic>) => Promise<void>;
  deleteSyllabusTopic: (id: string) => Promise<void>;
  // Classrooms
  addClassroom: (c: Omit<Classroom, "id">) => string;
  updateClassroom: (id: string, c: Partial<Classroom>) => Promise<void>;
  deleteClassroom: (id: string) => Promise<void>;
  // Schedules
  addSchedule: (s: Omit<ClassSchedule, "id">) => Promise<void>;
  updateSchedule: (id: string, s: Partial<ClassSchedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  // Assignments
  addAssignment: (a: Omit<Assignment, "id">) => Promise<void>;
  updateAssignment: (id: string, a: Partial<Assignment>) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  // Tests
  addTest: (t: Omit<Test, "id">) => Promise<void>;
  updateTest: (id: string, t: Partial<Test>) => Promise<void>;
  deleteTest: (id: string) => Promise<void>;
  // Class Sessions
  addClassSession: (s: Omit<ClassSession, "id">) => Promise<void>;
  updateClassSession: (id: string, s: Partial<ClassSession>) => void;
  deleteClassSession: (id: string) => void;
  // Attendance Records
  addAttendanceRecord: (r: Omit<AttendanceRecord, "id">) => void;
  updateAttendanceRecord: (id: string, r: Partial<AttendanceRecord>) => void;
  upsertAttendance: (sessionId: string, classroomId: string, studentId: string, status: AttendanceRecord["status"]) => Promise<void>;
  // Grade Records
  addGradeRecord: (r: Omit<GradeRecord, "id">) => Promise<void>;
  updateGradeRecord: (id: string, r: Partial<GradeRecord>) => void;
  upsertGradeRecord: (data: Omit<GradeRecord, "id">) => Promise<void>;
  // Announcements
  addAnnouncement: (a: Omit<Announcement, "id">) => Promise<void>;
  updateAnnouncement: (id: string, a: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  // Settings
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
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
  classSessions: seedClassSessions,
  attendanceRecords: seedAttendanceRecords,
  gradeRecords: seedGradeRecords,
  announcements: seedAnnouncements,
  admins: seedAdmins,
  settings: seedSettings,
  isLoading: true,
  isBackendConnected: false,
};

// ─── Provider ────────────────────────────────────────────────────────────────

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  // ── Sync from Backend on Mount ──
  const refreshFromBackend = useCallback(async () => {
    try {
      const [
        departments, programs, sessions, batches, teachers, admins,
        students, courses, syllabusTopics, classrooms, schedules,
        assignments, tests, classSessions, attendanceRecords, gradeRecords,
        announcements, settings
      ] = await Promise.all([
        api.getDepartments().catch(() => seedDepartments),
        api.getPrograms().catch(() => seedPrograms),
        api.getSessions().catch(() => seedSessions),
        api.getBatches().catch(() => seedBatches),
        api.getTeachers().catch(() => seedTeachers),
        api.getAdmins().catch(() => seedAdmins),
        api.getStudents().catch(() => seedStudents),
        api.getCourses().catch(() => seedCourses),
        api.getSyllabusTopics().catch(() => seedSyllabusTopics),
        api.getClassrooms().catch(() => seedClassrooms),
        api.getSchedules().catch(() => seedSchedules),
        api.getAssignments().catch(() => seedAssignments),
        api.getTests().catch(() => seedTests),
        api.getClassSessions().catch(() => seedClassSessions),
        api.getAttendanceRecords().catch(() => seedAttendanceRecords),
        api.getGradeRecords().catch(() => seedGradeRecords),
        api.getAnnouncements().catch(() => seedAnnouncements),
        api.getSettings().catch(() => seedSettings),
      ]);

      setState(prev => ({
        ...prev,
        departments: departments.length > 0 ? departments : seedDepartments,
        programs: programs.length > 0 ? programs : seedPrograms,
        sessions: sessions.length > 0 ? sessions : seedSessions,
        batches: batches.length > 0 ? batches : seedBatches,
        teachers: teachers.length > 0 ? teachers : seedTeachers,
        admins: admins.length > 0 ? admins : seedAdmins,
        students: students.length > 0 ? students : seedStudents,
        courses: courses.length > 0 ? courses : seedCourses,
        syllabusTopics: syllabusTopics.length > 0 ? syllabusTopics : seedSyllabusTopics,
        classrooms: classrooms.length > 0 ? classrooms : seedClassrooms,
        schedules: schedules.length > 0 ? schedules : seedSchedules,
        assignments: assignments.length > 0 ? assignments : seedAssignments,
        tests: tests.length > 0 ? tests : seedTests,
        classSessions: classSessions.length > 0 ? classSessions : seedClassSessions,
        attendanceRecords: attendanceRecords.length > 0 ? attendanceRecords : seedAttendanceRecords,
        gradeRecords: gradeRecords.length > 0 ? gradeRecords : seedGradeRecords,
        announcements: announcements.length > 0 ? announcements : seedAnnouncements,
        settings,
        isLoading: false,
        isBackendConnected: true,
      }));
    } catch (error) {
      console.warn("Backend sync fallback to cached state:", error);
      setState(prev => ({ ...prev, isLoading: false, isBackendConnected: false }));
    }
  }, []);

  useEffect(() => {
    refreshFromBackend();
  }, [refreshFromBackend]);

  // ── Generic updater helpers ──
  const update = useCallback(<K extends keyof AppState>(
    key: K,
    updater: (prev: AppState[K]) => AppState[K]
  ) => {
    setState(s => ({ ...s, [key]: updater(s[key]) }));
  }, []);

  // ── Session CRUD ──
  const addSession = async (s: Omit<Session, "id">) => {
    const tempId = genId();
    update("sessions", prev => [...prev, { ...s, id: tempId }]);
    try {
      const created = await api.createSession(s);
      update("sessions", prev => prev.map(x => x.id === tempId ? created : x));
    } catch (e) {
      console.error("Failed to save session to backend:", e);
    }
  };
  const updateSession = async (id: string, s: Partial<Session>) => {
    update("sessions", prev => prev.map(x => x.id === id ? { ...x, ...s } : x));
    api.updateSession(id, s).catch(console.error);
  };
  const deleteSession = async (id: string) => {
    update("sessions", prev => prev.filter(x => x.id !== id));
    api.deleteSession(id).catch(console.error);
  };

  // ── Batch CRUD ──
  const addBatch = async (b: Omit<Batch, "id">) => {
    const tempId = genId();
    update("batches", prev => [...prev, { ...b, id: tempId }]);
    try {
      const created = await api.createBatch(b);
      update("batches", prev => prev.map(x => x.id === tempId ? created : x));
    } catch (e) {
      console.error("Failed to save batch to backend:", e);
    }
  };
  const updateBatch = async (id: string, b: Partial<Batch>) => {
    update("batches", prev => prev.map(x => x.id === id ? { ...x, ...b } : x));
    api.updateBatch(id, b).catch(console.error);
  };
  const deleteBatch = async (id: string) => {
    update("batches", prev => prev.filter(x => x.id !== id));
    api.deleteBatch(id).catch(console.error);
  };

  // ── Student CRUD ──
  const addStudent = async (s: Omit<Student, "id">) => {
    const tempId = genId();
    update("students", prev => [...prev, { ...s, id: tempId }]);
    try {
      const created = await api.createStudent(s);
      update("students", prev => prev.map(x => x.id === tempId ? created : x));
    } catch (e) {
      console.error("Failed to save student to backend:", e);
    }
  };
  const updateStudent = async (id: string, s: Partial<Student>) => {
    update("students", prev => prev.map(x => x.id === id ? { ...x, ...s } : x));
    api.updateStudent(id, s).catch(console.error);
  };
  const deleteStudent = async (id: string) => {
    update("students", prev => prev.filter(x => x.id !== id));
    api.deleteStudent(id).catch(console.error);
  };

  // ── Teacher CRUD ──
  const addTeacher = async (t: Omit<Teacher, "id">) => {
    const tempId = genId();
    update("teachers", prev => [...prev, { ...t, id: tempId }]);
    try {
      const created = await api.createTeacher(t);
      update("teachers", prev => prev.map(x => x.id === tempId ? created : x));
    } catch (e) {
      console.error("Failed to save teacher to backend:", e);
    }
  };
  const updateTeacher = async (id: string, t: Partial<Teacher>) => {
    update("teachers", prev => prev.map(x => x.id === id ? { ...x, ...t } : x));
    api.updateTeacher(id, t).catch(console.error);
  };
  const deleteTeacher = async (id: string) => {
    update("teachers", prev => prev.filter(x => x.id !== id));
    api.deleteTeacher(id).catch(console.error);
  };

  // ── Admin CRUD ──
  const addAdmin = async (a: Omit<AdminUser, "id">) => {
    const tempId = genId();
    update("admins", prev => [...prev, { ...a, id: tempId }]);
    try {
      const created = await api.createAdmin(a);
      update("admins", prev => prev.map(x => x.id === tempId ? created : x));
    } catch (e) {
      console.error("Failed to save admin to backend:", e);
    }
  };
  const updateAdmin = async (id: string, a: Partial<AdminUser>) => {
    update("admins", prev => prev.map(x => x.id === id ? { ...x, ...a } : x));
    api.updateAdmin(id, a).catch(console.error);
  };
  const deleteAdmin = async (id: string) => {
    update("admins", prev => prev.filter(x => x.id !== id));
    api.deleteAdmin(id).catch(console.error);
  };

  // ── Course CRUD ──
  const addCourse = async (c: Omit<Course, "id">) => {
    const tempId = genId();
    update("courses", prev => [...prev, { ...c, id: tempId }]);
    try {
      const created = await api.createCourse(c);
      update("courses", prev => prev.map(x => x.id === tempId ? created : x));
    } catch (e) {
      console.error("Failed to save course to backend:", e);
    }
  };
  const updateCourse = async (id: string, c: Partial<Course>) => {
    update("courses", prev => prev.map(x => x.id === id ? { ...x, ...c } : x));
    api.updateCourse(id, c).catch(console.error);
  };
  const deleteCourse = async (id: string) => {
    update("courses", prev => prev.filter(x => x.id !== id));
    api.deleteCourse(id).catch(console.error);
  };

  // ── Syllabus CRUD ──
  const addSyllabusTopic = async (t: Omit<SyllabusTopic, "id">) => {
    const tempId = genId();
    update("syllabusTopics", prev => [...prev, { ...t, id: tempId }]);
    try {
      const created = await api.createSyllabusTopic(t);
      update("syllabusTopics", prev => prev.map(x => x.id === tempId ? created : x));
    } catch (e) {
      console.error("Failed to save syllabus topic to backend:", e);
    }
  };
  const updateSyllabusTopic = async (id: string, t: Partial<SyllabusTopic>) => {
    update("syllabusTopics", prev => prev.map(x => x.id === id ? { ...x, ...t } : x));
    api.updateSyllabusTopic(id, t).catch(console.error);
  };
  const deleteSyllabusTopic = async (id: string) => {
    update("syllabusTopics", prev => prev.filter(x => x.id !== id));
    api.deleteSyllabusTopic(id).catch(console.error);
  };

  // ── Classroom CRUD ──
  const addClassroom = (c: Omit<Classroom, "id">): string => {
    const id = genId();
    update("classrooms", prev => [...prev, { ...c, id }]);
    api.createClassroom({ ...c, id } as any).catch(console.error);
    return id;
  };
  const updateClassroom = async (id: string, c: Partial<Classroom>) => {
    update("classrooms", prev => prev.map(x => x.id === id ? { ...x, ...c } : x));
    api.updateClassroom(id, c).catch(console.error);
  };
  const deleteClassroom = async (id: string) => {
    update("classrooms", prev => prev.filter(x => x.id !== id));
    api.deleteClassroom(id).catch(console.error);
  };

  // ── Schedule CRUD ──
  const addSchedule = async (s: Omit<ClassSchedule, "id">) => {
    const tempId = genId();
    update("schedules", prev => [...prev, { ...s, id: tempId }]);
    try {
      const created = await api.createSchedule(s);
      update("schedules", prev => prev.map(x => x.id === tempId ? created : x));
    } catch (e) {
      console.error("Failed to save schedule to backend:", e);
    }
  };
  const updateSchedule = async (id: string, s: Partial<ClassSchedule>) => {
    update("schedules", prev => prev.map(x => x.id === id ? { ...x, ...s } : x));
    api.updateSchedule(id, s).catch(console.error);
  };
  const deleteSchedule = async (id: string) => {
    update("schedules", prev => prev.filter(x => x.id !== id));
    api.deleteSchedule(id).catch(console.error);
  };

  // ── Assignment CRUD ──
  const addAssignment = async (a: Omit<Assignment, "id">) => {
    const tempId = genId();
    update("assignments", prev => [...prev, { ...a, id: tempId }]);
    try {
      const created = await api.createAssignment(a);
      update("assignments", prev => prev.map(x => x.id === tempId ? created : x));
    } catch (e) {
      console.error("Failed to save assignment to backend:", e);
    }
  };
  const updateAssignment = async (id: string, a: Partial<Assignment>) => {
    update("assignments", prev => prev.map(x => x.id === id ? { ...x, ...a } : x));
    api.updateAssignment(id, a).catch(console.error);
  };
  const deleteAssignment = async (id: string) => {
    update("assignments", prev => prev.filter(x => x.id !== id));
    api.deleteAssignment(id).catch(console.error);
  };

  // ── Test CRUD ──
  const addTest = async (t: Omit<Test, "id">) => {
    const tempId = genId();
    update("tests", prev => [...prev, { ...t, id: tempId }]);
    try {
      const created = await api.createTest(t);
      update("tests", prev => prev.map(x => x.id === tempId ? created : x));
    } catch (e) {
      console.error("Failed to save test to backend:", e);
    }
  };
  const updateTest = async (id: string, t: Partial<Test>) => {
    update("tests", prev => prev.map(x => x.id === id ? { ...x, ...t } : x));
    api.updateTest(id, t).catch(console.error);
  };
  const deleteTest = async (id: string) => {
    update("tests", prev => prev.filter(x => x.id !== id));
    api.deleteTest(id).catch(console.error);
  };

  // ── ClassSession CRUD ──
  const addClassSession = async (s: Omit<ClassSession, "id">) => {
    const tempId = genId();
    update("classSessions", prev => [...prev, { ...s, id: tempId }]);
    try {
      const created = await api.createClassSession(s);
      update("classSessions", prev => prev.map(x => x.id === tempId ? created : x));
    } catch (e) {
      console.error("Failed to save class session to backend:", e);
    }
  };
  const updateClassSession = (id: string, s: Partial<ClassSession>) =>
    update("classSessions", prev => prev.map(x => x.id === id ? { ...x, ...s } : x));
  const deleteClassSession = (id: string) =>
    update("classSessions", prev => prev.filter(x => x.id !== id));

  // ── Announcements CRUD ──
  const addAnnouncement = async (a: Omit<Announcement, "id">) => {
    const tempId = genId();
    update("announcements", prev => [...prev, { ...a, id: tempId }]);
    try {
      const created = await api.createAnnouncement(a);
      update("announcements", prev => prev.map(x => x.id === tempId ? created : x));
    } catch (e) {
      console.error("Failed to save announcement to backend:", e);
    }
  };
  const updateAnnouncement = async (id: string, a: Partial<Announcement>) => {
    update("announcements", prev => prev.map(x => x.id === id ? { ...x, ...a } : x));
    api.updateAnnouncement(id, a).catch(console.error);
  };
  const deleteAnnouncement = async (id: string) => {
    update("announcements", prev => prev.filter(x => x.id !== id));
    api.deleteAnnouncement(id).catch(console.error);
  };

  // ── Attendance CRUD ──
  const addAttendanceRecord = (r: Omit<AttendanceRecord, "id">) =>
    update("attendanceRecords", prev => [...prev, { ...r, id: genId() }]);
  const updateAttendanceRecord = (id: string, r: Partial<AttendanceRecord>) =>
    update("attendanceRecords", prev => prev.map(x => x.id === id ? { ...x, ...r } : x));
  
  const upsertAttendance = async (
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

    api.saveAttendance([{ sessionId, classroomId, studentId, status }]).catch(console.error);
  };

  // ── Grade Records ──
  const addGradeRecord = async (r: Omit<GradeRecord, "id">) => {
    const tempId = genId();
    update("gradeRecords", prev => [...prev, { ...r, id: tempId }]);
    api.saveGradeRecord(r).catch(console.error);
  };
  const updateGradeRecord = (id: string, r: Partial<GradeRecord>) =>
    update("gradeRecords", prev => prev.map(x => x.id === id ? { ...x, ...r } : x));
  const upsertGradeRecord = async (data: Omit<GradeRecord, "id">) => {
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
    api.saveGradeRecord(data).catch(console.error);
  };

  // ── Settings ──
  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    setState(s => ({ ...s, settings: { ...s.settings, ...newSettings } }));
    api.updateSettings(newSettings).catch(console.error);
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
    refreshFromBackend,
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
    updateSettings,
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

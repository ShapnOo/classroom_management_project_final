"use client";

import React, {
  createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode
} from "react";
import type {
  Session, Department, Program, Batch, Student, Teacher,
  Course, SyllabusTopic, Classroom, ClassSchedule, Assignment, Test,
  ClassroomView, ClassSession, AttendanceRecord, GradeRecord,
  Announcement, AdminUser, AppSettings, ClassReschedule
} from "./types";
import { CLASSROOM_COLORS } from "./types";
import {
  seedSessions, seedDepartments, seedPrograms, seedBatches, seedStudents,
  seedTeachers, seedCourses, seedSyllabusTopics, seedClassrooms, seedSchedules,
  seedAssignments, seedTests, seedAnnouncements, seedAdmins, CURRENT_TEACHER_ID,
  seedClassSessions, seedAttendanceRecords, seedGradeRecords, seedSettings
} from "./seedData";
import { api, authStorage } from "./api";

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
  materials: any[];
  admins: AdminUser[];
  settings: AppSettings;
  reschedules: ClassReschedule[];
  isLoading: boolean;
  isBackendConnected: boolean;
};

// ─── Actions ─────────────────────────────────────────────────────────────────

type AppActions = {
  // On-demand Granular Fetchers (Page-by-page with smart 15s TTL & request deduplication)
  fetchDepartments: (force?: boolean) => Promise<Department[]>;
  fetchPrograms: (force?: boolean) => Promise<Program[]>;
  fetchSessions: (force?: boolean) => Promise<Session[]>;
  fetchBatches: (force?: boolean) => Promise<Batch[]>;
  fetchTeachers: (force?: boolean) => Promise<Teacher[]>;
  fetchAdmins: (force?: boolean) => Promise<AdminUser[]>;
  fetchStudents: (batchId?: string, force?: boolean) => Promise<Student[]>;
  fetchCourses: (force?: boolean) => Promise<Course[]>;
  fetchSyllabusTopics: (force?: boolean) => Promise<SyllabusTopic[]>;
  fetchClassrooms: (force?: boolean) => Promise<Classroom[]>;
  fetchSchedules: (force?: boolean) => Promise<ClassSchedule[]>;
  fetchAssignments: (force?: boolean) => Promise<Assignment[]>;
  fetchTests: (force?: boolean) => Promise<Test[]>;
  fetchClassSessions: (force?: boolean) => Promise<ClassSession[]>;
  fetchAttendanceRecords: (force?: boolean) => Promise<AttendanceRecord[]>;
  fetchGradeRecords: (force?: boolean) => Promise<GradeRecord[]>;
  fetchAnnouncements: (force?: boolean) => Promise<Announcement[]>;
  fetchMaterials: (classroomId?: string, force?: boolean) => Promise<any[]>;
  fetchSettings: (force?: boolean) => Promise<AppSettings>;
  fetchReschedules: (force?: boolean) => Promise<ClassReschedule[]>;
  createRescheduleRequest: (r: Partial<ClassReschedule>) => Promise<void>;
  respondRescheduleRequest: (id: string, status: "Approved" | "Rejected" | "Cancelled") => Promise<void>;

  // Sync / Refresh & Cache Control
  refreshFromBackend: () => Promise<void>;
  invalidateCache: (key?: string) => void;

  addMaterial: (m: any) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;


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
  materials: [],
  admins: seedAdmins,
  settings: seedSettings,
  reschedules: [],
  isLoading: false,
  isBackendConnected: false,
};

// ─── Provider ────────────────────────────────────────────────────────────────

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  // ── Smart Cache & Request Deduplication Engine ──
  const CACHE_TTL_MS = 15000; // 15s cache lifetime
  const cacheTimestamps = useRef<Record<string, number>>({});
  const inFlightRequests = useRef<Record<string, Promise<any>>>({});
  const stateRef = useRef<AppState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const invalidateCache = useCallback((key?: string) => {
    if (key) {
      delete cacheTimestamps.current[key];
    } else {
      cacheTimestamps.current = {};
    }
  }, []);

  const cachedFetch = useCallback(async <T,>(
    key: string,
    stateKey: keyof AppState,
    fetcher: () => Promise<T[] | T>,
    onSuccess: (data: any) => void,
    fallbackData: any = [],
    force: boolean = false
  ): Promise<any> => {
    const now = Date.now();
    const lastFetched = cacheTimestamps.current[key] || 0;

    // 1. Return cached state if fetch is within TTL duration and not forced
    if (!force && now - lastFetched < CACHE_TTL_MS) {
      const existing = stateRef.current[stateKey];
      if (existing !== undefined) {
        return existing;
      }
    }

    // 2. Deduplicate concurrent requests
    if (Object.prototype.hasOwnProperty.call(inFlightRequests.current, key)) {
      return inFlightRequests.current[key];
    }

    // 3. Issue fresh network request
    const promise = (async () => {
      try {
        const data = await fetcher();
        if (data && (!Array.isArray(data) || data.length > 0 || force)) {
          cacheTimestamps.current[key] = Date.now();
          onSuccess(data);
          return data;
        }
      } catch (e) {
        console.warn(`fetch ${key} fallback:`, e);
      } finally {
        delete inFlightRequests.current[key];
      }
      return fallbackData;
    })();

    inFlightRequests.current[key] = promise;
    return promise;
  }, []);

  // ── Granular On-Demand Fetchers (Deduplicated & Cached) ──

  const fetchDepartments = useCallback(async (force = false) => {
    return cachedFetch('departments', 'departments', () => api.getDepartments(), data => {
      setState(prev => ({ ...prev, departments: data, isBackendConnected: true }));
    }, [], force);
  }, [cachedFetch]);

  const fetchPrograms = useCallback(async (force = false) => {
    return cachedFetch('programs', 'programs', () => api.getPrograms(), data => {
      setState(prev => ({ ...prev, programs: data, isBackendConnected: true }));
    }, [], force);
  }, [cachedFetch]);

  const fetchSessions = useCallback(async (force = false) => {
    return cachedFetch('sessions', 'sessions', () => api.getSessions(), data => {
      setState(prev => ({ ...prev, sessions: data, isBackendConnected: true }));
    }, [], force);
  }, [cachedFetch]);

  const fetchBatches = useCallback(async (force = false) => {
    return cachedFetch('batches', 'batches', () => api.getBatches(), data => {
      setState(prev => ({ ...prev, batches: data, isBackendConnected: true }));
    }, [], force);
  }, [cachedFetch]);

  const fetchTeachers = useCallback(async (force = false) => {
    return cachedFetch('teachers', 'teachers', () => api.getTeachers(), data => {
      setState(prev => ({ ...prev, teachers: data, isBackendConnected: true }));
    }, [], force);
  }, [cachedFetch]);

  const fetchAdmins = useCallback(async (force = false) => {
    return cachedFetch('admins', 'admins', () => api.getAdmins(), data => {
      setState(prev => ({ ...prev, admins: data, isBackendConnected: true }));
    }, [], force);
  }, [cachedFetch]);

  const fetchStudents = useCallback(async (batchId?: string, force = false) => {
    const key = batchId ? `students_${batchId}` : 'students';
    return cachedFetch(key, 'students', () => api.getStudents(batchId), data => {
      setState(prev => ({ ...prev, students: data, isBackendConnected: true }));
    }, [], force);
  }, [cachedFetch]);

  const fetchCourses = useCallback(async (force = false) => {
    return cachedFetch('courses', 'courses', () => api.getCourses(), data => {
      setState(prev => ({ ...prev, courses: data, isBackendConnected: true }));
    }, [], force);
  }, [cachedFetch]);

  const fetchSyllabusTopics = useCallback(async (force = false) => {
    return cachedFetch('syllabusTopics', 'syllabusTopics', () => api.getSyllabusTopics(), data => {
      setState(prev => ({ ...prev, syllabusTopics: data, isBackendConnected: true }));
    }, [], force);
  }, [cachedFetch]);

  const fetchClassrooms = useCallback(async (force = false) => {
    return cachedFetch('classrooms', 'classrooms', () => api.getClassrooms(), data => {
      setState(prev => ({ ...prev, classrooms: data, isBackendConnected: true }));
    }, [], force);
  }, [cachedFetch]);

  const fetchSchedules = useCallback(async (force = false) => {
    return cachedFetch('schedules', 'schedules', () => api.getSchedules(), data => {
      setState(prev => ({ ...prev, schedules: data, isBackendConnected: true }));
    }, [], force);
  }, [cachedFetch]);

  const fetchAssignments = useCallback(async (force = false) => {
    return cachedFetch('assignments', 'assignments', () => api.getAssignments(), data => {
      setState(prev => ({ ...prev, assignments: data, isBackendConnected: true }));
    }, [], force);
  }, [cachedFetch]);

  const fetchTests = useCallback(async (force = false) => {
    return cachedFetch('tests', 'tests', () => api.getTests(), data => {
      setState(prev => ({ ...prev, tests: data, isBackendConnected: true }));
    }, [], force);
  }, [cachedFetch]);

  const fetchClassSessions = useCallback(async (force = false) => {
    return cachedFetch('classSessions', 'classSessions', () => api.getClassSessions(), data => {
      setState(prev => ({ ...prev, classSessions: data, isBackendConnected: true }));
    }, [], force);
  }, [cachedFetch]);

  const fetchAttendanceRecords = useCallback(async (force = false) => {
    return cachedFetch('attendanceRecords', 'attendanceRecords', () => api.getAttendanceRecords(), data => {
      setState(prev => ({ ...prev, attendanceRecords: data, isBackendConnected: true }));
    }, [], force);
  }, [cachedFetch]);

  const fetchGradeRecords = useCallback(async (force = false) => {
    return cachedFetch('gradeRecords', 'gradeRecords', () => api.getGradeRecords(), data => {
      setState(prev => ({ ...prev, gradeRecords: data, isBackendConnected: true }));
    }, [], force);
  }, [cachedFetch]);

  const fetchAnnouncements = useCallback(async (force = false) => {
    return cachedFetch('announcements', 'announcements', () => api.getAnnouncements(), data => {
      setState(prev => ({ ...prev, announcements: data, isBackendConnected: true }));
    }, [], force);
  }, [cachedFetch]);

  const fetchMaterials = useCallback(async (classroomId?: string, force = false) => {
    const key = classroomId ? `materials_${classroomId}` : 'materials';
    return cachedFetch(key, 'materials', () => api.getMaterials(classroomId), data => {
      setState(prev => ({ ...prev, materials: data, isBackendConnected: true }));
    }, [], force);
  }, [cachedFetch]);

  const fetchReschedules = useCallback(async (force = false) => {
    return cachedFetch('reschedules', 'reschedules', () => api.getReschedules(), data => {
      setState(prev => ({ ...prev, reschedules: data, isBackendConnected: true }));
    }, [], force);
  }, [cachedFetch]);

  const createRescheduleRequest = useCallback(async (r: Partial<ClassReschedule>) => {
    try {
      const created = await api.createReschedule(r);
      if (created) {
        invalidateCache('reschedules');
        setState(prev => ({ ...prev, reschedules: [created, ...prev.reschedules] }));
        return;
      }
    } catch (e) {
      console.warn("createRescheduleRequest fallback:", e);
    }
    const fallback: ClassReschedule = {
      id: genId(),
      classroomId: r.classroomId || "",
      scheduleId: r.scheduleId,
      requestType: r.requestType || "Reschedule",
      requestedByTeacherId: r.requestedByTeacherId || "t1000000-0000-4000-a000-000000000001",
      targetTeacherId: r.targetTeacherId,
      originalDate: r.originalDate || "",
      originalTime: r.originalTime || "",
      newDate: r.newDate || "",
      newStartTime: r.newStartTime || "",
      newEndTime: r.newEndTime || "",
      newRoom: r.newRoom,
      reason: r.reason || "",
      status: r.requestType === "Swap" ? "Pending" : "Approved",
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, reschedules: [fallback, ...prev.reschedules] }));
  }, [invalidateCache]);

  const respondRescheduleRequest = useCallback(async (id: string, status: "Approved" | "Rejected" | "Cancelled") => {
    try {
      await api.updateRescheduleStatus(id, status);
      invalidateCache('reschedules');
    } catch (e) {
      console.warn("respondRescheduleRequest fallback:", e);
    }
    setState(prev => ({
      ...prev,
      reschedules: prev.reschedules.map(r => r.id === id ? { ...r, status } : r)
    }));
  }, [invalidateCache]);

  const addMaterial = useCallback(async (m: any) => {
    try {
      const created = await api.createMaterial(m);
      if (created) {
        invalidateCache('materials');
        setState(prev => ({ ...prev, materials: [created, ...prev.materials] }));
        return;
      }
    } catch (e) {
      console.warn("addMaterial fallback:", e);
    }
    setState(prev => ({ ...prev, materials: [{ ...m, id: genId(), uploadedAt: new Date().toISOString() }, ...prev.materials] }));
  }, [invalidateCache]);

  const deleteMaterial = useCallback(async (id: string) => {
    try {
      await api.deleteMaterial(id);
      invalidateCache('materials');
    } catch (e) {
      console.warn("deleteMaterial fallback:", e);
    }
    setState(prev => ({ ...prev, materials: prev.materials.filter(x => x.id !== id) }));
  }, [invalidateCache]);

  const fetchSettings = useCallback(async (force = false) => {
    return cachedFetch('settings', 'settings', () => api.getSettings(), data => {
      setState(prev => ({ ...prev, settings: data, isBackendConnected: true }));
    }, { schoolName: "Jahangirnagar University", logoBase64: "" }, force);
  }, [cachedFetch]);

  // Optional manual full refresh (used only when explicitly triggered)
  const refreshFromBackend = useCallback(async () => {
    invalidateCache();
    await Promise.allSettled([
      fetchDepartments(true),
      fetchPrograms(true),
      fetchSessions(true),
      fetchBatches(true),
      fetchTeachers(true),
      fetchAdmins(true),
      fetchStudents(undefined, true),
      fetchCourses(true),
      fetchSyllabusTopics(true),
      fetchClassrooms(true),
      fetchSchedules(true),
      fetchAssignments(true),
      fetchTests(true),
      fetchClassSessions(true),
      fetchAttendanceRecords(true),
      fetchGradeRecords(true),
      fetchAnnouncements(true),
      fetchSettings(true),
    ]);
  }, [
    invalidateCache, fetchDepartments, fetchPrograms, fetchSessions, fetchBatches, fetchTeachers,
    fetchAdmins, fetchStudents, fetchCourses, fetchSyllabusTopics, fetchClassrooms,
    fetchSchedules, fetchAssignments, fetchTests, fetchClassSessions,
    fetchAttendanceRecords, fetchGradeRecords, fetchAnnouncements, fetchSettings
  ]);

  // On mount, only fetch lightweight university branding settings once
  useEffect(() => {
    fetchSettings();
  }, []);

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
    const tempId = genId();
    setState(s => {
      const existing = s.gradeRecords.find(r =>
        r.classroomId === data.classroomId &&
        r.studentId === data.studentId &&
        (data.assignmentId ? r.assignmentId === data.assignmentId : !r.assignmentId) &&
        (data.testId ? r.testId === data.testId : !r.testId)
      );
      if (existing) {
        return {
          ...s,
          gradeRecords: s.gradeRecords.map(r => r.id === existing.id ? { ...r, ...data } : r)
        };
      }
      return { ...s, gradeRecords: [...s.gradeRecords, { ...data, id: tempId }] };
    });

    try {
      const saved = await api.saveGradeRecord(data);
      if (saved && saved.id) {
        setState(s => ({
          ...s,
          gradeRecords: s.gradeRecords.map(r =>
            (r.id === tempId || (r.classroomId === data.classroomId && r.studentId === data.studentId && (data.assignmentId ? r.assignmentId === data.assignmentId : r.testId === data.testId)))
              ? { ...r, ...saved }
              : r
          )
        }));
      }
    } catch (e) {
      console.error("Failed to save grade record to backend:", e);
      throw e;
    }
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

  const getActiveTeacherId = useCallback(() => {
    const user = authStorage.getUser();
    if (user?.email && state.teachers.length > 0) {
      const found = state.teachers.find(t => t.email.toLowerCase() === user.email.toLowerCase());
      if (found) return found.id;
    }
    return CURRENT_TEACHER_ID;
  }, [state.teachers]);

  const getMyClassroomViews = useCallback(() => {
    const teacherId = getActiveTeacherId();
    return state.classrooms
      .filter(c => c.teacherId === teacherId)
      .map(c => buildView(c))
      .filter(Boolean) as ClassroomView[];
  }, [state.classrooms, buildView, getActiveTeacherId]);

  const getAllClassroomViews = useCallback(() =>
    state.classrooms
      .map(c => buildView(c))
      .filter(Boolean) as ClassroomView[]
  , [state.classrooms, buildView]);

  const getTodaysSchedule = useCallback(() => {
    const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const today = dayNames[new Date().getDay()];
    const teacherId = getActiveTeacherId();
    const myClassroomIds = state.classrooms
      .filter(c => c.teacherId === teacherId)
      .map(c => c.id);
    return state.schedules
      .filter(s => s.day === today && myClassroomIds.includes(s.classroomId))
      .map(s => {
        const view = getClassroomView(s.classroomId);
        return view ? { ...s, classroomView: view } : null;
      })
      .filter(Boolean) as (ClassSchedule & { classroomView: ClassroomView })[];
  }, [state.classrooms, state.schedules, getClassroomView, getActiveTeacherId]);

  const getUpNextTopic = useCallback(() => {
    const teacherId = getActiveTeacherId();
    const myCourseIds = state.classrooms
      .filter(c => c.teacherId === teacherId)
      .map(c => c.courseId);
    return state.syllabusTopics.find(
      t => myCourseIds.includes(t.courseId) && t.teacherStatus === "current"
    ) || null;
  }, [state.classrooms, state.syllabusTopics, getActiveTeacherId]);

  const store: AppStore = {
    ...state,
    fetchDepartments,
    fetchPrograms,
    fetchSessions,
    fetchBatches,
    fetchTeachers,
    fetchAdmins,
    fetchStudents,
    fetchCourses,
    fetchSyllabusTopics,
    fetchClassrooms,
    fetchSchedules,
    fetchAssignments,
    fetchTests,
    fetchClassSessions,
    fetchAttendanceRecords,
    fetchGradeRecords,
    fetchAnnouncements,
    fetchMaterials,
    fetchSettings,
    fetchReschedules,
    createRescheduleRequest,
    respondRescheduleRequest,
    refreshFromBackend,
    invalidateCache,
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
    addMaterial, deleteMaterial,
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

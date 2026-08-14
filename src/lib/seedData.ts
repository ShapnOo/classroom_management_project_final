/**
 * Seed Data — Initial state for the app store.
 * This is what the app loads on first run (before any admin edits).
 * All data is consistent and cross-referenced by IDs.
 */
import type {
  Session, Department, Program, Batch, Student, Teacher,
  Course, SyllabusTopic, Classroom, ClassSchedule, Assignment, Test,
} from "./types";

// The currently "logged-in" teacher (for teacher portal simulation)
export const CURRENT_TEACHER_ID = "teacher-1";

// ─── Sessions ────────────────────────────────────────────────────────────────
export const seedSessions: Session[] = [
  { id: "ses-1", name: "Spring 2026", startDate: "2026-01-15", endDate: "2026-05-31", status: "Active" },
  { id: "ses-2", name: "Fall 2025",   startDate: "2025-08-15", endDate: "2025-12-31", status: "Completed" },
  { id: "ses-3", name: "Fall 2026",   startDate: "2026-08-15", endDate: "2026-12-31", status: "Upcoming" },
];

// ─── Departments ─────────────────────────────────────────────────────────────
export const seedDepartments: Department[] = [
  { id: "dept-1", name: "Computer Science & Engineering", code: "CSE" },
  { id: "dept-2", name: "Mathematics",                   code: "MTH" },
  { id: "dept-3", name: "Physics",                       code: "PHY" },
];

// ─── Programs ────────────────────────────────────────────────────────────────
export const seedPrograms: Program[] = [
  { id: "prog-1", departmentId: "dept-1", name: "B.Sc. in Computer Science", code: "B.Sc. CS",  duration: "4 Years" },
  { id: "prog-2", departmentId: "dept-1", name: "PGDIT",                     code: "PGDIT",     duration: "1 Year"  },
  { id: "prog-3", departmentId: "dept-2", name: "B.Sc. Mathematics",         code: "B.Sc. MTH", duration: "3 Years" },
];

// ─── Teachers ────────────────────────────────────────────────────────────────
export const seedTeachers: Teacher[] = [
  { id: "teacher-1", name: "Dr. Alan Turing",       email: "a.turing@edu",    departmentId: "dept-1", designation: "Associate Professor" },
  { id: "teacher-2", name: "Prof. Sarah Jenkins",   email: "s.jenkins@edu",   departmentId: "dept-1", designation: "Assistant Professor" },
  { id: "teacher-3", name: "Dr. Tim Berners-Lee",   email: "t.berners@edu",   departmentId: "dept-1", designation: "Professor" },
  { id: "teacher-4", name: "Prof. Ada Lovelace",    email: "a.lovelace@edu",  departmentId: "dept-2", designation: "Associate Professor" },
  { id: "teacher-5", name: "Dr. Richard Feynman",   email: "r.feynman@edu",   departmentId: "dept-3", designation: "Professor" },
];

// ─── Batches ─────────────────────────────────────────────────────────────────
export const seedBatches: Batch[] = [
  { id: "batch-1", code: "SP26-A", name: "Spring 2026 — Section A", programId: "prog-1", sessionId: "ses-1", section: "A", status: "Active"    },
  { id: "batch-2", code: "SP26-B", name: "Spring 2026 — Section B", programId: "prog-1", sessionId: "ses-1", section: "B", status: "Active"    },
  { id: "batch-3", code: "FA25-A", name: "Fall 2025 — Section A",   programId: "prog-1", sessionId: "ses-2", section: "A", status: "Completed" },
  { id: "batch-4", code: "FA26-C", name: "Fall 2026 — Section C",   programId: "prog-1", sessionId: "ses-3", section: "C", status: "Upcoming"  },
];

// ─── Students ────────────────────────────────────────────────────────────────
const NAMES_A = [
  "Alice Johnson","Bob Smith","Carol White","David Brown","Eva Martinez","Frank Lee","Grace Kim",
  "Henry Davis","Iris Wilson","Jack Thomas","Kate Anderson","Liam Jackson","Mia Harris","Noah Martin",
  "Olivia Thompson","Paul Garcia","Quinn Martinez","Rachel Robinson","Sam Clark","Tara Lewis",
  "Ulysses Hall","Vera Young","Will Allen","Xena Hernandez","Yara King","Zoe Wright","Aaron Lopez",
  "Bella Hill","Carlos Scott","Diana Green","Ethan Adams","Fiona Baker","George Gonzalez",
  "Hannah Nelson","Ian Carter","Julia Mitchell","Kevin Perez","Laura Roberts","Mike Turner",
  "Nora Phillips","Oscar Campbell","Pam Parker",
];

export const seedStudents: Student[] = [
  // Batch 1 — 42 students
  ...NAMES_A.map((name, i) => ({
    id: `std-b1-${i+1}`, rollNo: `SP26A${String(i+1).padStart(3,"0")}`,
    name, email: `sp26a${i+1}@edu`, batchId: "batch-1",
  })),
  // Batch 2 — 38 students
  ...Array.from({ length: 38 }, (_, i) => ({
    id: `std-b2-${i+1}`, rollNo: `SP26B${String(i+1).padStart(3,"0")}`,
    name: `Student SP26B-${i+1}`, email: `sp26b${i+1}@edu`, batchId: "batch-2",
  })),
  // Batch 3 — 50 students
  ...Array.from({ length: 50 }, (_, i) => ({
    id: `std-b3-${i+1}`, rollNo: `FA25A${String(i+1).padStart(3,"0")}`,
    name: `Student FA25-${i+1}`, email: `fa25a${i+1}@edu`, batchId: "batch-3",
  })),
  // Batch 4 — 45 students
  ...Array.from({ length: 45 }, (_, i) => ({
    id: `std-b4-${i+1}`, rollNo: `FA26C${String(i+1).padStart(3,"0")}`,
    name: `Student FA26-${i+1}`, email: `fa26c${i+1}@edu`, batchId: "batch-4",
  })),
];

// ─── Courses ─────────────────────────────────────────────────────────────────
export const seedCourses: Course[] = [
  { id: "course-1", code: "CSE-305", title: "Database Management Systems", credits: 3 },
  { id: "course-2", code: "CSE-412", title: "Software Engineering",        credits: 3 },
  { id: "course-3", code: "CSE-101", title: "Intro to Computer Science",   credits: 3 },
  { id: "course-4", code: "CSE-425", title: "Artificial Intelligence",     credits: 3 },
  { id: "course-5", code: "CSE-201", title: "Data Structures",             credits: 3 },
];

// ─── Classrooms ──────────────────────────────────────────────────────────────
// Admin creates these to assign courses to batches with a teacher
export const seedClassrooms: Classroom[] = [
  { id: "cls-1", courseId: "course-1", batchId: "batch-1", teacherId: "teacher-1", room: "Room 402, Bldg C", startDate: "2026-01-15", endDate: "2026-05-20", status: "ongoing",   classesCompleted: 18, totalClasses: 26, colorIndex: 0 },
  { id: "cls-2", courseId: "course-2", batchId: "batch-2", teacherId: "teacher-1", room: "Room 305, Bldg A", startDate: "2026-01-16", endDate: "2026-05-22", status: "ongoing",   classesCompleted: 15, totalClasses: 20, colorIndex: 1 },
  { id: "cls-3", courseId: "course-3", batchId: "batch-3", teacherId: "teacher-4", room: "Room 201, Bldg B", startDate: "2025-08-15", endDate: "2025-12-20", status: "completed", classesCompleted: 24, totalClasses: 24, colorIndex: 2 },
  { id: "cls-4", courseId: "course-4", batchId: "batch-1", teacherId: "teacher-1", room: "Lab 2, Bldg D",    startDate: "2026-01-15", endDate: "2026-05-20", status: "ongoing",   classesCompleted: 8,  totalClasses: 24, colorIndex: 2 },
  { id: "cls-5", courseId: "course-5", batchId: "batch-4", teacherId: "teacher-2", room: "Room 101, Bldg B", startDate: "2026-08-15", endDate: "2026-12-20", status: "upcoming",  classesCompleted: 0,  totalClasses: 24, colorIndex: 3 },
];

// ─── Schedules ───────────────────────────────────────────────────────────────
export const seedSchedules: ClassSchedule[] = [
  { id: "sch-1", classroomId: "cls-1", day: "Monday",    startTime: "10:00 AM", endTime: "11:30 AM", room: "Room 402" },
  { id: "sch-2", classroomId: "cls-1", day: "Wednesday", startTime: "10:00 AM", endTime: "11:30 AM", room: "Room 402" },
  { id: "sch-3", classroomId: "cls-2", day: "Tuesday",   startTime: "02:00 PM", endTime: "03:30 PM", room: "Room 305" },
  { id: "sch-4", classroomId: "cls-2", day: "Thursday",  startTime: "02:00 PM", endTime: "03:30 PM", room: "Room 305" },
  { id: "sch-5", classroomId: "cls-4", day: "Monday",    startTime: "12:00 PM", endTime: "01:30 PM", room: "Lab 2"    },
  { id: "sch-6", classroomId: "cls-4", day: "Wednesday", startTime: "12:00 PM", endTime: "01:30 PM", room: "Lab 2"    },
  { id: "sch-7", classroomId: "cls-3", day: "Wednesday", startTime: "09:00 AM", endTime: "11:00 AM", room: "Room 201" },
  { id: "sch-8", classroomId: "cls-5", day: "Friday",    startTime: "09:00 AM", endTime: "12:00 PM", room: "Room 101" },
];

// ─── Syllabus Topics ─────────────────────────────────────────────────────────
export const seedSyllabusTopics: SyllabusTopic[] = [
  // CSE-305 DBMS
  { id: "syl-1",  courseId: "course-1", topic: "Introduction & ER Model",       week: 1, subTopics: ["What is a Database?", "ER Diagrams", "Entity Relationships"], teacherStatus: "done",    adminStatus: "Published" },
  { id: "syl-2",  courseId: "course-1", topic: "Relational Model & SQL",        week: 2, subTopics: ["Relational Algebra", "SQL SELECT", "Joins & Subqueries"],      teacherStatus: "done",    adminStatus: "Published" },
  { id: "syl-3",  courseId: "course-1", topic: "Functional Dependencies",       week: 3, subTopics: ["Armstrong's Axioms", "Closure Sets", "Minimal Cover"],          teacherStatus: "done",    adminStatus: "Published" },
  { id: "syl-4",  courseId: "course-1", topic: "Normalization (1NF–3NF)",       week: 4, subTopics: ["1NF", "2NF", "3NF", "Anomalies"],                              teacherStatus: "done",    adminStatus: "Published" },
  { id: "syl-5",  courseId: "course-1", topic: "BCNF & Denormalization",        week: 5, subTopics: ["3NF Examples", "BCNF Examples", "Practical Problems"],           teacherStatus: "current", adminStatus: "Published" },
  { id: "syl-6",  courseId: "course-1", topic: "Transactions & Concurrency",    week: 6, subTopics: ["ACID Properties", "Deadlocks", "Serializability"],               teacherStatus: "pending", adminStatus: "Published" },
  { id: "syl-7",  courseId: "course-1", topic: "Indexing & Query Optimization", week: 7, subTopics: ["B+ Tree", "Hash Index", "Query Cost"],                           teacherStatus: "pending", adminStatus: "Draft"     },
  // CSE-412 SE
  { id: "syl-8",  courseId: "course-2", topic: "SDLC Models",                   week: 1, subTopics: ["Waterfall", "Agile", "Spiral"],                                  teacherStatus: "done",    adminStatus: "Published" },
  { id: "syl-9",  courseId: "course-2", topic: "Requirements Engineering",      week: 2, subTopics: ["Functional & Non-functional", "Use Case Diagrams"],              teacherStatus: "done",    adminStatus: "Published" },
  { id: "syl-10", courseId: "course-2", topic: "System Design & UML",           week: 3, subTopics: ["Class Diagrams", "Sequence Diagrams"],                           teacherStatus: "current", adminStatus: "Published" },
  { id: "syl-11", courseId: "course-2", topic: "Design Patterns",               week: 4, subTopics: ["Singleton", "Observer", "Factory"],                              teacherStatus: "pending", adminStatus: "Draft"     },
  // CSE-425 AI
  { id: "syl-12", courseId: "course-4", topic: "Intro to AI & Search",          week: 1, subTopics: ["BFS", "DFS", "A* Search"],                                       teacherStatus: "done",    adminStatus: "Published" },
  { id: "syl-13", courseId: "course-4", topic: "Machine Learning Basics",       week: 2, subTopics: ["Supervised Learning", "Unsupervised Learning"],                  teacherStatus: "current", adminStatus: "Published" },
  { id: "syl-14", courseId: "course-4", topic: "Neural Networks",               week: 3, subTopics: ["Perceptrons", "Backpropagation"],                                teacherStatus: "pending", adminStatus: "Draft"     },
];

// ─── Assignments ─────────────────────────────────────────────────────────────
export const seedAssignments: Assignment[] = [
  { id: "asgn-1", classroomId: "cls-1", title: "ER Diagram Design",             dueDate: "2026-10-25", totalMarks: 20, status: "Active",    submissions: 38 },
  { id: "asgn-2", classroomId: "cls-1", title: "SQL Queries Practice",          dueDate: "2026-11-02", totalMarks: 20, status: "Upcoming",  submissions: 0  },
  { id: "asgn-3", classroomId: "cls-2", title: "Agile Case Study",              dueDate: "2026-10-20", totalMarks: 20, status: "Completed", submissions: 38 },
  { id: "asgn-4", classroomId: "cls-2", title: "UML Diagram - Library System",  dueDate: "2026-11-10", totalMarks: 20, status: "Active",    submissions: 5  },
  { id: "asgn-5", classroomId: "cls-4", title: "Search Algorithm Impl.",        dueDate: "2026-11-15", totalMarks: 20, status: "Active",    submissions: 10 },
];

// ─── Tests ───────────────────────────────────────────────────────────────────
export const seedTests: Test[] = [
  { id: "tst-1", classroomId: "cls-1", title: "Midterm: Normalization",      testDate: "2026-10-25", totalMarks: 50,  status: "Active",    submissions: 40 },
  { id: "tst-2", classroomId: "cls-1", title: "Quiz 1: SQL Basics",          testDate: "2026-11-02", totalMarks: 20,  status: "Upcoming",  submissions: 0  },
  { id: "tst-3", classroomId: "cls-2", title: "Final Exam: SE",              testDate: "2026-12-15", totalMarks: 100, status: "Upcoming",  submissions: 0  },
  { id: "tst-4", classroomId: "cls-2", title: "Midterm: SDLC & UML",        testDate: "2026-10-15", totalMarks: 50,  status: "Completed", submissions: 38 },
  { id: "tst-5", classroomId: "cls-4", title: "Lab Test 1: Search Algo.",   testDate: "2026-11-20", totalMarks: 30,  status: "Upcoming",  submissions: 0  },
];

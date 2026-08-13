/**
 * Shared Mock Data Layer
 * 
 * This is the single source of truth for ALL mock data in the app.
 * Both Admin pages and Teacher pages import from here so that the data
 * is always consistent across both views.
 * 
 * Data Flow:
 *   Admin creates → Course (assigns Teacher) → Schedule → Syllabus Topics
 *   Teacher sees → Their assigned Courses → Their Schedules → Their Syllabus
 */

// ─── TEACHERS ─────────────────────────────────────────────────────────────────
export const CURRENT_TEACHER_ID = "teacher-1"; // Simulates logged-in teacher

export type Teacher = {
  id: string;
  name: string;
  email: string;
  department: string;
};

export const teachers: Teacher[] = [
  { id: "teacher-1", name: "Dr. Alan Turing", email: "a.turing@institution.edu", department: "Computer Science" },
  { id: "teacher-2", name: "Prof. Sarah Jenkins", email: "s.jenkins@institution.edu", department: "Computer Science" },
  { id: "teacher-3", name: "Dr. Tim Berners-Lee", email: "t.berners@institution.edu", department: "Computer Science" },
  { id: "teacher-4", name: "Prof. Ada Lovelace", email: "a.lovelace@institution.edu", department: "Mathematics" },
  { id: "teacher-5", name: "Dr. Richard Feynman", email: "r.feynman@institution.edu", department: "Physics" },
];

// ─── SHARED CLASSROOMS (COURSES + THEIR CLASSROOM SETUP) ──────────────────────
// Admin creates courses and assigns to teachers. These same records power the
// Teacher's "My Classrooms" view (filtered by CURRENT_TEACHER_ID).

export type Classroom = {
  id: string;
  courseCode: string;
  courseTitle: string;
  program: string;
  batch: string;
  session: string;
  department: string;
  credits: number;
  room: string;
  schedule: string;    // Human-readable schedule string
  startDate: string;
  endDate: string;
  students: number;
  classesCompleted: number;
  totalClasses: number;
  progress: number;
  teacherId: string;   // Links to teachers[]
  teacher: string;     // Denormalized name for display
  color: string;
  lightColor: string;
  textColor: string;
  status: "ongoing" | "upcoming" | "completed";
};

export const classrooms: Classroom[] = [
  {
    id: "cls-1",
    courseCode: "CSE-305",
    courseTitle: "Database Management Systems",
    program: "B.Sc. CS",
    batch: "Spring 2026 - A",
    session: "Spring 2026",
    department: "Computer Science",
    credits: 3,
    room: "Room 402, Bldg C",
    schedule: "Mon, Wed • 10:00 AM - 11:30 AM",
    startDate: "2026-01-15",
    endDate: "2026-05-20",
    students: 42,
    classesCompleted: 18,
    totalClasses: 26,
    progress: 68,
    teacherId: "teacher-1",
    teacher: "Dr. Alan Turing",
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    textColor: "text-blue-700",
    status: "ongoing",
  },
  {
    id: "cls-2",
    courseCode: "CSE-412",
    courseTitle: "Software Engineering",
    program: "B.Sc. CS",
    batch: "Spring 2026 - B",
    session: "Spring 2026",
    department: "Computer Science",
    credits: 3,
    room: "Room 305, Bldg A",
    schedule: "Tue, Thu • 02:00 PM - 03:30 PM",
    startDate: "2026-01-16",
    endDate: "2026-05-22",
    students: 38,
    classesCompleted: 15,
    totalClasses: 20,
    progress: 74,
    teacherId: "teacher-1",
    teacher: "Dr. Alan Turing",
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    status: "ongoing",
  },
  {
    id: "cls-3",
    courseCode: "CSE-101",
    courseTitle: "Introduction to Computer Science",
    program: "B.Sc. CS",
    batch: "Fall 2025 - A",
    session: "Fall 2025",
    department: "Computer Science",
    credits: 3,
    room: "Room 201, Bldg B",
    schedule: "Mon, Wed • 08:00 AM - 09:30 AM",
    startDate: "2025-08-15",
    endDate: "2025-12-20",
    students: 50,
    classesCompleted: 24,
    totalClasses: 24,
    progress: 100,
    teacherId: "teacher-4",
    teacher: "Prof. Ada Lovelace",
    color: "bg-slate-500",
    lightColor: "bg-slate-50",
    textColor: "text-slate-700",
    status: "completed",
  },
  {
    id: "cls-4",
    courseCode: "CSE-425",
    courseTitle: "Artificial Intelligence",
    program: "B.Sc. CS",
    batch: "Spring 2026 - A",
    session: "Spring 2026",
    department: "Computer Science",
    credits: 3,
    room: "Lab 2, Bldg D",
    schedule: "Mon, Wed • 12:00 PM - 01:30 PM",
    startDate: "2026-01-15",
    endDate: "2026-05-20",
    students: 35,
    classesCompleted: 8,
    totalClasses: 24,
    progress: 33,
    teacherId: "teacher-1",
    teacher: "Dr. Alan Turing",
    color: "bg-purple-500",
    lightColor: "bg-purple-50",
    textColor: "text-purple-700",
    status: "ongoing",
  },
  {
    id: "cls-5",
    courseCode: "CSE-201",
    courseTitle: "Data Structures",
    program: "B.Sc. CS",
    batch: "Fall 2026 - C",
    session: "Fall 2026",
    department: "Computer Science",
    credits: 3,
    room: "Room 101, Bldg B",
    schedule: "Fri • 09:00 AM - 12:00 PM",
    startDate: "2026-08-15",
    endDate: "2026-12-20",
    students: 45,
    classesCompleted: 0,
    totalClasses: 24,
    progress: 0,
    teacherId: "teacher-2",
    teacher: "Prof. Sarah Jenkins",
    color: "bg-amber-500",
    lightColor: "bg-amber-50",
    textColor: "text-amber-700",
    status: "upcoming",
  },
];

/** Returns only the classrooms assigned to the currently logged-in teacher */
export const myClassrooms = classrooms.filter(c => c.teacherId === CURRENT_TEACHER_ID);

// ─── CLASS SCHEDULES ──────────────────────────────────────────────────────────
// Admin creates these. They power "Today's Schedule" on the Teacher Dashboard.

export type Schedule = {
  id: string;
  classroomId: string; // Links to classrooms[]
  courseTitle: string;
  courseCode: string;
  teacherId: string;
  teacher: string;
  batch: string;
  day: string;         // e.g. "Monday"
  startTime: string;   // e.g. "10:00 AM"
  endTime: string;     // e.g. "11:30 AM"
  room: string;
  students: number;
  status: "Active" | "Upcoming" | "Completed";
};

export const schedules: Schedule[] = [
  { id: "sch-1", classroomId: "cls-1", courseTitle: "Database Management Systems", courseCode: "CSE-305", teacherId: "teacher-1", teacher: "Dr. Alan Turing", batch: "Spring 2026 - A", day: "Monday", startTime: "10:00 AM", endTime: "11:30 AM", room: "Room 402", students: 42, status: "Active" },
  { id: "sch-2", classroomId: "cls-1", courseTitle: "Database Management Systems", courseCode: "CSE-305", teacherId: "teacher-1", teacher: "Dr. Alan Turing", batch: "Spring 2026 - A", day: "Wednesday", startTime: "10:00 AM", endTime: "11:30 AM", room: "Room 402", students: 42, status: "Active" },
  { id: "sch-3", classroomId: "cls-2", courseTitle: "Software Engineering", courseCode: "CSE-412", teacherId: "teacher-1", teacher: "Dr. Alan Turing", batch: "Spring 2026 - B", day: "Tuesday", startTime: "02:00 PM", endTime: "03:30 PM", room: "Room 305", students: 38, status: "Active" },
  { id: "sch-4", classroomId: "cls-2", courseTitle: "Software Engineering", courseCode: "CSE-412", teacherId: "teacher-1", teacher: "Dr. Alan Turing", batch: "Spring 2026 - B", day: "Thursday", startTime: "02:00 PM", endTime: "03:30 PM", room: "Room 305", students: 38, status: "Active" },
  { id: "sch-5", classroomId: "cls-4", courseTitle: "Artificial Intelligence", courseCode: "CSE-425", teacherId: "teacher-1", teacher: "Dr. Alan Turing", batch: "Spring 2026 - A", day: "Monday", startTime: "12:00 PM", endTime: "01:30 PM", room: "Lab 2", students: 35, status: "Active" },
  { id: "sch-6", classroomId: "cls-4", courseTitle: "Artificial Intelligence", courseCode: "CSE-425", teacherId: "teacher-1", teacher: "Dr. Alan Turing", batch: "Spring 2026 - A", day: "Wednesday", startTime: "12:00 PM", endTime: "01:30 PM", room: "Lab 2", students: 35, status: "Active" },
  { id: "sch-7", classroomId: "cls-3", courseTitle: "Introduction to Computer Science", courseCode: "CSE-101", teacherId: "teacher-4", teacher: "Prof. Ada Lovelace", batch: "Fall 2025 - A", day: "Wednesday", startTime: "09:00 AM", endTime: "11:00 AM", room: "Lab 2", students: 50, status: "Completed" },
  { id: "sch-8", classroomId: "cls-5", courseTitle: "Data Structures", courseCode: "CSE-201", teacherId: "teacher-2", teacher: "Prof. Sarah Jenkins", batch: "Fall 2026 - C", day: "Friday", startTime: "09:00 AM", endTime: "12:00 PM", room: "Room 101", students: 45, status: "Upcoming" },
];

/** Returns schedules for today's day of the week, filtered for the current teacher */
export const getTodaysSchedule = () => {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = dayNames[new Date().getDay()];
  return schedules.filter(s => s.teacherId === CURRENT_TEACHER_ID && s.day === today);
};

// ─── SYLLABUS ─────────────────────────────────────────────────────────────────
// Admin creates syllabus topics per course. Teachers see these as the
// "Up Next" widget on the dashboard and in Course Continuity tracking.

export type SyllabusStatus = "done" | "current" | "pending";

export type SyllabusTopic = {
  id: string;
  classroomId: string; // Links to classrooms[]
  course: string;      // Course code for display
  topic: string;
  week: number;
  subTopics: string[];
  status: SyllabusStatus;
  adminStatus: "Published" | "Draft" | "Archived"; // Admin-facing status
};

export const syllabus: SyllabusTopic[] = [
  // CSE-305 DBMS Syllabus
  { id: "syl-1", classroomId: "cls-1", course: "CSE-305", topic: "Introduction & ER Model", week: 1, subTopics: ["What is a Database?", "ER Diagrams", "Entity Relationships"], status: "done", adminStatus: "Published" },
  { id: "syl-2", classroomId: "cls-1", course: "CSE-305", topic: "Relational Model & SQL", week: 2, subTopics: ["Relational Algebra", "SQL SELECT", "Joins & Subqueries"], status: "done", adminStatus: "Published" },
  { id: "syl-3", classroomId: "cls-1", course: "CSE-305", topic: "Functional Dependencies", week: 3, subTopics: ["Armstrong's Axioms", "Closure Sets", "Minimal Cover"], status: "done", adminStatus: "Published" },
  { id: "syl-4", classroomId: "cls-1", course: "CSE-305", topic: "Normalization (1NF–3NF)", week: 4, subTopics: ["1NF", "2NF", "3NF", "Anomalies"], status: "done", adminStatus: "Published" },
  { id: "syl-5", classroomId: "cls-1", course: "CSE-305", topic: "BCNF & Denormalization", week: 5, subTopics: ["3NF Examples", "BCNF Examples", "Practical Problems"], status: "current", adminStatus: "Published" },
  { id: "syl-6", classroomId: "cls-1", course: "CSE-305", topic: "Transactions & Concurrency", week: 6, subTopics: ["ACID Properties", "Deadlocks", "Serializability"], status: "pending", adminStatus: "Published" },
  { id: "syl-7", classroomId: "cls-1", course: "CSE-305", topic: "Indexing & Query Optimization", week: 7, subTopics: ["B+ Tree", "Hash Index", "Query Cost"], status: "pending", adminStatus: "Draft" },
  { id: "syl-8", classroomId: "cls-1", course: "CSE-305", topic: "Final Review", week: 8, subTopics: ["Mock Questions", "Past Papers"], status: "pending", adminStatus: "Draft" },

  // CSE-412 Software Engineering Syllabus
  { id: "syl-9",  classroomId: "cls-2", course: "CSE-412", topic: "SDLC Models", week: 1, subTopics: ["Waterfall", "Agile", "Spiral"], status: "done", adminStatus: "Published" },
  { id: "syl-10", classroomId: "cls-2", course: "CSE-412", topic: "Requirements Engineering", week: 2, subTopics: ["Functional & Non-functional", "Use Case Diagrams"], status: "done", adminStatus: "Published" },
  { id: "syl-11", classroomId: "cls-2", course: "CSE-412", topic: "System Design & UML", week: 3, subTopics: ["Class Diagrams", "Sequence Diagrams"], status: "current", adminStatus: "Published" },
  { id: "syl-12", classroomId: "cls-2", course: "CSE-412", topic: "Design Patterns", week: 4, subTopics: ["Singleton", "Observer", "Factory"], status: "pending", adminStatus: "Draft" },

  // CSE-425 AI Syllabus
  { id: "syl-13", classroomId: "cls-4", course: "CSE-425", topic: "Intro to AI & Search", week: 1, subTopics: ["BFS", "DFS", "A* Search"], status: "done", adminStatus: "Published" },
  { id: "syl-14", classroomId: "cls-4", course: "CSE-425", topic: "Machine Learning Basics", week: 2, subTopics: ["Supervised Learning", "Unsupervised Learning"], status: "current", adminStatus: "Published" },
  { id: "syl-15", classroomId: "cls-4", course: "CSE-425", topic: "Neural Networks", week: 3, subTopics: ["Perceptrons", "Backpropagation"], status: "pending", adminStatus: "Draft" },
];

/** Get the next topic in the syllabus for the current teacher's primary course */
export const getUpNextTopic = () => {
  const myClassroomIds = myClassrooms.map(c => c.id);
  return syllabus.find(s => myClassroomIds.includes(s.classroomId) && s.status === "current");
};

/** Get all syllabus topics for a specific classroom */
export const getSyllabusByClassroom = (classroomId: string) =>
  syllabus.filter(s => s.classroomId === classroomId);

// ─── ASSIGNMENTS ──────────────────────────────────────────────────────────────
// Teachers create these. Admin's global view shows ALL assignments.
// Teacher's view shows only assignments for their own classrooms.

export type Assignment = {
  id: string;
  classroomId: string;
  title: string;
  course: string;
  batch: string;
  teacherId: string;
  teacher: string;
  dueDate: string;
  submissions: number;
  totalStudents: number;
  status: "Active" | "Upcoming" | "Completed";
};

export const assignments: Assignment[] = [
  { id: "asgn-1", classroomId: "cls-1", title: "ER Diagram Design", course: "Database Management Systems", batch: "Spring 2026 - A", teacherId: "teacher-1", teacher: "Dr. Alan Turing", dueDate: "Oct 25, 2026", submissions: 38, totalStudents: 42, status: "Active" },
  { id: "asgn-2", classroomId: "cls-1", title: "SQL Queries Practice", course: "Database Management Systems", batch: "Spring 2026 - A", teacherId: "teacher-1", teacher: "Dr. Alan Turing", dueDate: "Nov 02, 2026", submissions: 0, totalStudents: 42, status: "Upcoming" },
  { id: "asgn-3", classroomId: "cls-2", title: "Agile Case Study", course: "Software Engineering", batch: "Spring 2026 - B", teacherId: "teacher-1", teacher: "Dr. Alan Turing", dueDate: "Oct 20, 2026", submissions: 38, totalStudents: 38, status: "Completed" },
  { id: "asgn-4", classroomId: "cls-2", title: "UML Diagram - Library System", course: "Software Engineering", batch: "Spring 2026 - B", teacherId: "teacher-1", teacher: "Dr. Alan Turing", dueDate: "Nov 10, 2026", submissions: 5, totalStudents: 38, status: "Active" },
  { id: "asgn-5", classroomId: "cls-4", title: "Search Algorithm Implementation", course: "Artificial Intelligence", batch: "Spring 2026 - A", teacherId: "teacher-1", teacher: "Dr. Alan Turing", dueDate: "Nov 15, 2026", submissions: 10, totalStudents: 35, status: "Active" },
  { id: "asgn-6", classroomId: "cls-5", title: "Linked List Implementation", course: "Data Structures", batch: "Fall 2026 - C", teacherId: "teacher-2", teacher: "Prof. Sarah Jenkins", dueDate: "Sep 10, 2026", submissions: 0, totalStudents: 45, status: "Upcoming" },
];

/** Returns only assignments belonging to the current teacher's classrooms */
export const myAssignments = assignments.filter(a => a.teacherId === CURRENT_TEACHER_ID);

/** Group assignments by classroom for the TeacherAssignmentsList view */
export const myAssignmentsByClassroom = myClassrooms.map(cls => ({
  ...cls,
  assignments: assignments.filter(a => a.classroomId === cls.id),
  activeAssignments: assignments.filter(a => a.classroomId === cls.id && a.status === "Active").length,
  pendingSubmissions: assignments.filter(a => a.classroomId === cls.id).reduce(
    (sum, a) => sum + (a.totalStudents - a.submissions), 0
  ),
}));

// ─── TESTS ────────────────────────────────────────────────────────────────────
// Teachers schedule these. Admin's global view shows ALL tests.

export type Test = {
  id: string;
  classroomId: string;
  title: string;
  course: string;
  batch: string;
  teacherId: string;
  teacher: string;
  testDate: string;
  submissions: number;
  totalStudents: number;
  totalMarks: number;
  status: "Active" | "Upcoming" | "Completed";
};

export const tests: Test[] = [
  { id: "tst-1", classroomId: "cls-1", title: "Midterm: Normalization", course: "Database Management Systems", batch: "Spring 2026 - A", teacherId: "teacher-1", teacher: "Dr. Alan Turing", testDate: "Oct 25, 2026", submissions: 40, totalStudents: 42, totalMarks: 50, status: "Active" },
  { id: "tst-2", classroomId: "cls-1", title: "Quiz 1: SQL Basics", course: "Database Management Systems", batch: "Spring 2026 - A", teacherId: "teacher-1", teacher: "Dr. Alan Turing", testDate: "Nov 02, 2026", submissions: 0, totalStudents: 42, totalMarks: 20, status: "Upcoming" },
  { id: "tst-3", classroomId: "cls-2", title: "Final Exam: SE", course: "Software Engineering", batch: "Spring 2026 - B", teacherId: "teacher-1", teacher: "Dr. Alan Turing", testDate: "Dec 15, 2026", submissions: 0, totalStudents: 38, totalMarks: 100, status: "Upcoming" },
  { id: "tst-4", classroomId: "cls-2", title: "Midterm: SDLC & UML", course: "Software Engineering", batch: "Spring 2026 - B", teacherId: "teacher-1", teacher: "Dr. Alan Turing", testDate: "Oct 15, 2026", submissions: 38, totalStudents: 38, totalMarks: 50, status: "Completed" },
  { id: "tst-5", classroomId: "cls-4", title: "Lab Test 1: Search Algorithms", course: "Artificial Intelligence", batch: "Spring 2026 - A", teacherId: "teacher-1", teacher: "Dr. Alan Turing", testDate: "Nov 20, 2026", submissions: 0, totalStudents: 35, totalMarks: 30, status: "Upcoming" },
  { id: "tst-6", classroomId: "cls-5", title: "Lab Test 1: Arrays & Recursion", course: "Data Structures", batch: "Fall 2026 - C", teacherId: "teacher-2", teacher: "Prof. Sarah Jenkins", testDate: "Sep 15, 2026", submissions: 0, totalStudents: 45, totalMarks: 30, status: "Upcoming" },
];

/** Returns only tests belonging to the current teacher's classrooms */
export const myTests = tests.filter(t => t.teacherId === CURRENT_TEACHER_ID);

/** Group tests by classroom for the TeacherTestsList view */
export const myTestsByClassroom = myClassrooms.map(cls => ({
  ...cls,
  tests: tests.filter(t => t.classroomId === cls.id),
  activeTests: tests.filter(t => t.classroomId === cls.id && t.status === "Active").length,
  completedTests: tests.filter(t => t.classroomId === cls.id && t.status === "Completed").length,
}));

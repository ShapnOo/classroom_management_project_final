/**
 * Shared Mock Data Layer
 * 
 * Authentic 36-char complex GUID identifiers matching backend PostgreSQL database.
 */
import { SEED_IDS } from "./seedData";

export const CURRENT_TEACHER_ID = SEED_IDS.TEACHER_1; // Simulates logged-in teacher

export type Teacher = {
  id: string;
  name: string;
  email: string;
  department: string;
};

export const teachers: Teacher[] = [
  { id: SEED_IDS.TEACHER_1, name: "Prof. Dr. Shamim Al Mamun", email: "sam@juniv.edu", department: "Computer Science" },
  { id: SEED_IDS.TEACHER_2, name: "Prof. Dr. Risala Tasin Khan", email: "rtkhan@juniv.edu", department: "Computer Science" },
  { id: SEED_IDS.TEACHER_3, name: "Prof. Dr. Mohammad Shahidul Islam", email: "shahidul@juniv.edu", department: "Computer Science" },
  { id: SEED_IDS.TEACHER_4, name: "Prof. Md. Fazlul Karim Patwary", email: "patwary@juniv.edu", department: "Mathematics" },
  { id: SEED_IDS.TEACHER_5, name: "Prof. Dr. M. Mesbahuddin Sarker", email: "mesbah@juniv.edu", department: "Physics" },
];

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
  schedule: string;
  startDate: string;
  endDate: string;
  students: number;
  classesCompleted: number;
  totalClasses: number;
  progress: number;
  teacherId: string;
  teacher: string;
  color: string;
  lightColor: string;
  textColor: string;
  status: "ongoing" | "upcoming" | "completed";
};

export const classrooms: Classroom[] = [
  {
    id: SEED_IDS.CLS_1,
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
    teacherId: SEED_IDS.TEACHER_1,
    teacher: "Prof. Dr. Shamim Al Mamun",
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    textColor: "text-blue-700",
    status: "ongoing",
  },
  {
    id: SEED_IDS.CLS_2,
    courseCode: "CSE-412",
    courseTitle: "Software Engineering & System Design",
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
    teacherId: SEED_IDS.TEACHER_1,
    teacher: "Prof. Dr. Shamim Al Mamun",
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    status: "ongoing",
  },
  {
    id: SEED_IDS.CLS_3,
    courseCode: "CSE-101",
    courseTitle: "Structured Programming Language",
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
    teacherId: SEED_IDS.TEACHER_4,
    teacher: "Prof. Md. Fazlul Karim Patwary",
    color: "bg-slate-500",
    lightColor: "bg-slate-50",
    textColor: "text-slate-700",
    status: "completed",
  },
  {
    id: SEED_IDS.CLS_4,
    courseCode: "CSE-425",
    courseTitle: "Artificial Intelligence & Machine Learning",
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
    teacherId: SEED_IDS.TEACHER_1,
    teacher: "Prof. Dr. Shamim Al Mamun",
    color: "bg-purple-500",
    lightColor: "bg-purple-50",
    textColor: "text-purple-700",
    status: "ongoing",
  },
  {
    id: SEED_IDS.CLS_5,
    courseCode: "CSE-201",
    courseTitle: "Data Structures & Algorithms",
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
    teacherId: SEED_IDS.TEACHER_2,
    teacher: "Prof. Dr. Risala Tasin Khan",
    color: "bg-amber-500",
    lightColor: "bg-amber-50",
    textColor: "text-amber-700",
    status: "upcoming",
  },
];

export const myClassrooms = classrooms.filter(c => c.teacherId === CURRENT_TEACHER_ID);

export type Schedule = {
  id: string;
  classroomId: string;
  courseTitle: string;
  courseCode: string;
  teacherId: string;
  teacher: string;
  batch: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  students: number;
  status: "Active" | "Upcoming" | "Completed";
};

export const schedules: Schedule[] = [
  { id: "26229f17-0c80-4fdc-997c-42644cc8410c", classroomId: SEED_IDS.CLS_1, courseTitle: "Database Management Systems", courseCode: "CSE-305", teacherId: SEED_IDS.TEACHER_1, teacher: "Prof. Dr. Shamim Al Mamun", batch: "Spring 2026 - A", day: "Monday", startTime: "10:00 AM", endTime: "11:30 AM", room: "Room 402", students: 42, status: "Active" },
  { id: "076e5c28-f37e-415a-815c-e368917267e5", classroomId: SEED_IDS.CLS_1, courseTitle: "Database Management Systems", courseCode: "CSE-305", teacherId: SEED_IDS.TEACHER_1, teacher: "Prof. Dr. Shamim Al Mamun", batch: "Spring 2026 - A", day: "Wednesday", startTime: "10:00 AM", endTime: "11:30 AM", room: "Room 402", students: 42, status: "Active" },
  { id: "ee86e2f6-f737-45bb-a777-3f8dd8d32f62", classroomId: SEED_IDS.CLS_2, courseTitle: "Software Engineering & System Design", courseCode: "CSE-412", teacherId: SEED_IDS.TEACHER_1, teacher: "Prof. Dr. Shamim Al Mamun", batch: "Spring 2026 - B", day: "Tuesday", startTime: "02:00 PM", endTime: "03:30 PM", room: "Room 305", students: 38, status: "Active" },
  { id: "e4cbbb7b-0ea9-4bc7-bcac-e1552af17c4c", classroomId: SEED_IDS.CLS_2, courseTitle: "Software Engineering & System Design", courseCode: "CSE-412", teacherId: SEED_IDS.TEACHER_1, teacher: "Prof. Dr. Shamim Al Mamun", batch: "Spring 2026 - B", day: "Thursday", startTime: "02:00 PM", endTime: "03:30 PM", room: "Room 305", students: 38, status: "Active" },
  { id: "d266a3f2-b7ef-49aa-85a6-8304efb8b304", classroomId: SEED_IDS.CLS_4, courseTitle: "Artificial Intelligence & Machine Learning", courseCode: "CSE-425", teacherId: SEED_IDS.TEACHER_1, teacher: "Prof. Dr. Shamim Al Mamun", batch: "Spring 2026 - A", day: "Monday", startTime: "12:00 PM", endTime: "01:30 PM", room: "Lab 2", students: 35, status: "Active" },
  { id: "35ae46e5-ee68-4349-8397-89a86933c83f", classroomId: SEED_IDS.CLS_4, courseTitle: "Artificial Intelligence & Machine Learning", courseCode: "CSE-425", teacherId: SEED_IDS.TEACHER_1, teacher: "Prof. Dr. Shamim Al Mamun", batch: "Spring 2026 - A", day: "Wednesday", startTime: "12:00 PM", endTime: "01:30 PM", room: "Lab 2", students: 35, status: "Active" },
  { id: "12b2cb55-1347-4015-bd17-a53e70835c4a", classroomId: SEED_IDS.CLS_3, courseTitle: "Structured Programming Language", courseCode: "CSE-101", teacherId: SEED_IDS.TEACHER_4, teacher: "Prof. Md. Fazlul Karim Patwary", batch: "Fall 2025 - A", day: "Wednesday", startTime: "09:00 AM", endTime: "11:00 AM", room: "Room 201", students: 50, status: "Completed" },
  { id: "137674a9-cc0c-40bc-9309-913bac658395", classroomId: SEED_IDS.CLS_5, courseTitle: "Data Structures & Algorithms", courseCode: "CSE-201", teacherId: SEED_IDS.TEACHER_2, teacher: "Prof. Dr. Risala Tasin Khan", batch: "Fall 2026 - C", day: "Friday", startTime: "09:00 AM", endTime: "12:00 PM", room: "Room 101", students: 45, status: "Upcoming" },
];

export const getTodaysSchedule = () => {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = dayNames[new Date().getDay()];
  return schedules.filter(s => s.teacherId === CURRENT_TEACHER_ID && s.day === today);
};

export type SyllabusStatus = "done" | "current" | "pending";

export type SyllabusTopic = {
  id: string;
  classroomId: string;
  course: string;
  topic: string;
  week: number;
  subTopics: string[];
  status: SyllabusStatus;
  adminStatus: "Published" | "Draft" | "Archived";
};

export const syllabus: SyllabusTopic[] = [
  { id: "79dadc79-f65a-4e74-b07d-fa921732c109", classroomId: SEED_IDS.CLS_1, course: "CSE-305", topic: "Introduction & ER Model", week: 1, subTopics: ["What is a Database?", "ER Diagrams", "Entity Relationships"], status: "done", adminStatus: "Published" },
  { id: "fa5b9353-62b5-4913-a7e0-4b49ff5ad570", classroomId: SEED_IDS.CLS_1, course: "CSE-305", topic: "Relational Model & SQL", week: 2, subTopics: ["Relational Algebra", "SQL SELECT", "Joins & Subqueries"], status: "done", adminStatus: "Published" },
  { id: "138864af-1cd3-44f2-88a4-c31ec8338413", classroomId: SEED_IDS.CLS_1, course: "CSE-305", topic: "Functional Dependencies", week: 3, subTopics: ["Armstrong's Axioms", "Closure Sets", "Minimal Cover"], status: "done", adminStatus: "Published" },
  { id: "a3fc4511-4ad1-4001-840e-e2e424768669", classroomId: SEED_IDS.CLS_1, course: "CSE-305", topic: "Normalization (1NF–3NF)", week: 4, subTopics: ["1NF", "2NF", "3NF", "Anomalies"], status: "done", adminStatus: "Published" },
  { id: "5754eea2-7aaf-41ac-86b4-ed8783bab36b", classroomId: SEED_IDS.CLS_1, course: "CSE-305", topic: "BCNF & Denormalization", week: 5, subTopics: ["3NF Examples", "BCNF Examples", "Practical Problems"], status: "current", adminStatus: "Published" },
  { id: "481d6bd4-956e-4df7-a8af-9b381115a64e", classroomId: SEED_IDS.CLS_1, course: "CSE-305", topic: "Transactions & Concurrency", week: 6, subTopics: ["ACID Properties", "Deadlocks", "Serializability"], status: "pending", adminStatus: "Published" },
  { id: "8792dc87-96ba-4023-9020-1fe71d38632b", classroomId: SEED_IDS.CLS_1, course: "CSE-305", topic: "Indexing & Query Optimization", week: 7, subTopics: ["B+ Tree", "Hash Index", "Query Cost"], status: "pending", adminStatus: "Draft" },
  { id: "0310039b-27f3-4e59-a661-15cf6c67f9c6", classroomId: SEED_IDS.CLS_2, course: "CSE-412", topic: "SDLC Models", week: 1, subTopics: ["Waterfall", "Agile", "Spiral"], status: "done", adminStatus: "Published" },
  { id: "a744b4e8-8608-425d-ae21-44fc6077253d", classroomId: SEED_IDS.CLS_2, course: "CSE-412", topic: "Requirements Engineering", week: 2, subTopics: ["Functional & Non-functional", "Use Case Diagrams"], status: "done", adminStatus: "Published" },
  { id: "ebfcc667-30f4-4ef5-b321-aae573524b9c", classroomId: SEED_IDS.CLS_2, course: "CSE-412", topic: "System Design & UML", week: 3, subTopics: ["Class Diagrams", "Sequence Diagrams"], status: "current", adminStatus: "Published" },
  { id: "eb0bded6-242e-41ab-ab93-b5c14f3489ae", classroomId: SEED_IDS.CLS_2, course: "CSE-412", topic: "Design Patterns", week: 4, subTopics: ["Singleton", "Observer", "Factory"], status: "pending", adminStatus: "Draft" },
  { id: "676b03ae-9b52-4bfc-8364-8081b8d214ff", classroomId: SEED_IDS.CLS_4, course: "CSE-425", topic: "Intro to AI & Search", week: 1, subTopics: ["BFS", "DFS", "A* Search"], status: "done", adminStatus: "Published" },
  { id: "0a1527cb-aea7-42aa-9605-def58001094d", classroomId: SEED_IDS.CLS_4, course: "CSE-425", topic: "Machine Learning Basics", week: 2, subTopics: ["Supervised Learning", "Unsupervised Learning"], status: "current", adminStatus: "Published" },
  { id: "df7fd4a5-d602-4fe9-b2c3-d5b9a0938def", classroomId: SEED_IDS.CLS_4, course: "CSE-425", topic: "Neural Networks", week: 3, subTopics: ["Perceptrons", "Backpropagation"], status: "pending", adminStatus: "Draft" },
];

export const getUpNextTopic = () => {
  const myClassroomIds = myClassrooms.map(c => c.id);
  return syllabus.find(s => myClassroomIds.includes(s.classroomId) && s.status === "current");
};

export const getSyllabusByClassroom = (classroomId: string) =>
  syllabus.filter(s => s.classroomId === classroomId);

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
  { id: SEED_IDS.ASGN_1, classroomId: SEED_IDS.CLS_1, title: "ER Diagram Design", course: "Database Management Systems", batch: "Spring 2026 - A", teacherId: SEED_IDS.TEACHER_1, teacher: "Prof. Dr. Shamim Al Mamun", dueDate: "Oct 25, 2026", submissions: 38, totalStudents: 42, status: "Active" },
  { id: SEED_IDS.ASGN_2, classroomId: SEED_IDS.CLS_1, title: "SQL Queries Practice", course: "Database Management Systems", batch: "Spring 2026 - A", teacherId: SEED_IDS.TEACHER_1, teacher: "Prof. Dr. Shamim Al Mamun", dueDate: "Nov 02, 2026", submissions: 0, totalStudents: 42, status: "Upcoming" },
  { id: SEED_IDS.ASGN_3, classroomId: SEED_IDS.CLS_2, title: "Agile Case Study", course: "Software Engineering & System Design", batch: "Spring 2026 - B", teacherId: SEED_IDS.TEACHER_1, teacher: "Prof. Dr. Shamim Al Mamun", dueDate: "Oct 20, 2026", submissions: 38, totalStudents: 38, status: "Completed" },
  { id: SEED_IDS.ASGN_4, classroomId: SEED_IDS.CLS_2, title: "UML Diagram - Library System", course: "Software Engineering & System Design", batch: "Spring 2026 - B", teacherId: SEED_IDS.TEACHER_1, teacher: "Prof. Dr. Shamim Al Mamun", dueDate: "Nov 10, 2026", submissions: 5, totalStudents: 38, status: "Active" },
  { id: SEED_IDS.ASGN_5, classroomId: SEED_IDS.CLS_4, title: "Search Algorithm Implementation", course: "Artificial Intelligence & Machine Learning", batch: "Spring 2026 - A", teacherId: SEED_IDS.TEACHER_1, teacher: "Prof. Dr. Shamim Al Mamun", dueDate: "Nov 15, 2026", submissions: 10, totalStudents: 35, status: "Active" },
];

export const myAssignments = assignments.filter(a => a.teacherId === CURRENT_TEACHER_ID);

export const myAssignmentsByClassroom = myClassrooms.map(cls => ({
  ...cls,
  assignments: assignments.filter(a => a.classroomId === cls.id),
  activeAssignments: assignments.filter(a => a.classroomId === cls.id && a.status === "Active").length,
  pendingSubmissions: assignments.filter(a => a.classroomId === cls.id).reduce(
    (sum, a) => sum + (a.totalStudents - a.submissions), 0
  ),
}));

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
  { id: SEED_IDS.TST_1, classroomId: SEED_IDS.CLS_1, title: "Midterm: Normalization", course: "Database Management Systems", batch: "Spring 2026 - A", teacherId: SEED_IDS.TEACHER_1, teacher: "Prof. Dr. Shamim Al Mamun", testDate: "Oct 25, 2026", submissions: 40, totalStudents: 42, totalMarks: 50, status: "Active" },
  { id: SEED_IDS.TST_2, classroomId: SEED_IDS.CLS_1, title: "Quiz 1: SQL Basics", course: "Database Management Systems", batch: "Spring 2026 - A", teacherId: SEED_IDS.TEACHER_1, teacher: "Prof. Dr. Shamim Al Mamun", testDate: "Nov 02, 2026", submissions: 0, totalStudents: 42, totalMarks: 20, status: "Upcoming" },
  { id: SEED_IDS.TST_3, classroomId: SEED_IDS.CLS_2, title: "Final Exam: SE", course: "Software Engineering & System Design", batch: "Spring 2026 - B", teacherId: SEED_IDS.TEACHER_1, teacher: "Prof. Dr. Shamim Al Mamun", testDate: "Dec 15, 2026", submissions: 0, totalStudents: 38, totalMarks: 100, status: "Upcoming" },
  { id: SEED_IDS.TST_4, classroomId: SEED_IDS.CLS_2, title: "Midterm: SDLC & UML", course: "Software Engineering & System Design", batch: "Spring 2026 - B", teacherId: SEED_IDS.TEACHER_1, teacher: "Prof. Dr. Shamim Al Mamun", testDate: "Oct 15, 2026", submissions: 38, totalStudents: 38, totalMarks: 50, status: "Completed" },
  { id: SEED_IDS.TST_5, classroomId: SEED_IDS.CLS_4, title: "Lab Test 1: Search Algorithms", course: "Artificial Intelligence & Machine Learning", batch: "Spring 2026 - A", teacherId: SEED_IDS.TEACHER_1, teacher: "Prof. Dr. Shamim Al Mamun", testDate: "Nov 20, 2026", submissions: 0, totalStudents: 35, totalMarks: 30, status: "Upcoming" },
];

export const myTests = tests.filter(t => t.teacherId === CURRENT_TEACHER_ID);

export const myTestsByClassroom = myClassrooms.map(cls => ({
  ...cls,
  tests: tests.filter(t => t.classroomId === cls.id),
  activeTests: tests.filter(t => t.classroomId === cls.id && t.status === "Active").length,
  completedTests: tests.filter(t => t.classroomId === cls.id && t.status === "Completed").length,
}));

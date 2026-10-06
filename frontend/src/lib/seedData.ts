/**
 * Seed Data — Initial state for the app store.
 * Authentic 36-char complex GUID identifiers matching backend PostgreSQL database.
 */
import type {
  Session, Department, Program, Batch, Student, Teacher,
  Course, SyllabusTopic, Classroom, ClassSchedule, Assignment, Test, AppSettings, AdminUser, Announcement,
  ClassSession, AttendanceRecord, GradeRecord
} from "./types";

export const SEED_IDS = {
  // Departments
  DEPT_CSE: "114914b4-ff80-48d7-8290-ac7ea3cbdfaf",
  DEPT_MTH: "654cc707-b3fc-4428-8bfa-cf0024263142",
  DEPT_PHY: "9f895bcd-bd98-4624-abda-37a22111a378",

  // Programs
  PROG_BSC_CS: "70b58daf-cae1-4e39-b58b-943cd1e45912",
  PROG_PGDIT:  "7a3bcad5-44d5-4ea7-b510-ea234cfd8fa0",
  PROG_BSC_MTH: "1ae5de70-3136-4c3c-85e7-de7f2ce5d58b",

  // Sessions
  SES_SPRING_2026: "59d346bc-a55c-490f-ba0a-69ce85ec3063",
  SES_FALL_2025:   "c088b44a-a372-4953-9e86-bdb8739ed659",
  SES_FALL_2026:   "f1dece0c-a017-48b3-9422-1cc1ada34271",

  // Batches
  BATCH_SP26_A: "98b7201d-f795-4069-9229-42117595fb3f",
  BATCH_SP26_B: "c4ce1ed1-879d-4b4e-a877-da2b376aae1d",
  BATCH_FA25_A: "1bb542f2-202b-4bb7-af5a-0546e2b18407",
  BATCH_FA26_C: "35144c16-c129-4702-ac46-ed049860ae43",

  // Admins
  ADMIN_1: "fc09a540-73c3-4809-9da9-4562372bd0cf",
  ADMIN_2: "19288376-94b8-4e81-a895-6cbc80724486",

  // Teachers
  TEACHER_1: "1a3f6e61-2a04-4f91-9897-1f97b99604c5",
  TEACHER_2: "61fbef9f-b9b2-49f8-bcf3-53f10d69ff9c",
  TEACHER_3: "3209ab89-4eec-423c-9e3b-1adacfa1996b",
  TEACHER_4: "2c5148b5-7a95-4cdf-80dd-af220483c48b",
  TEACHER_5: "1b8be174-4360-4e90-a762-3f7d9ffbd373",

  // Classrooms
  CLS_1: "9f33d641-11fd-4ad1-812f-ec032f67ec4b",
  CLS_2: "5bc205fe-5187-4816-9faf-b1ed01ebc92e",
  CLS_3: "94592bc8-2f7a-4636-bb7c-d7b61ca094bd",
  CLS_4: "93e8e4e0-76ed-429d-ba4a-059130ad2310",
  CLS_5: "68bd42f0-6161-4a90-896e-412f6574da93",

  // Courses
  COURSE_101: "4f07a4a9-8472-4b2a-a92c-63b723577d20",
  COURSE_102: "8c773e34-58cb-4fdf-9730-1b777a83d789",
  COURSE_103: "2e8587d4-8d26-44ec-b82b-8a7155694bb1",
  COURSE_104: "31d60bdf-023a-4467-b501-44759bf896e8",
  COURSE_201: "a43063f2-1a48-4395-8efd-88b449b2c3a5",
  COURSE_202: "732b130e-26f5-4654-a6c3-18873fef4045",
  COURSE_203: "b890a5a2-3f41-4770-985b-cf10928929e7",
  COURSE_204: "94a861d8-f32b-426b-9c71-70bf892cd412",
  COURSE_301: "e6f43702-8692-4463-bfb7-3b2d1d4f2603",
  COURSE_302: "627ab75e-efb8-4c28-98e6-e028bfae6894",
  COURSE_303: "94c8e74e-761a-4d2a-89a1-07bc9d963384",
  COURSE_304: "367175ae-1d89-4a41-b84e-e17088b9a528",
  COURSE_305: "6d7e008a-6b83-4eb0-8be0-b5bf36709fa3",
  COURSE_306: "8e22894b-4b21-42a9-b6aa-4c2ab1e2bb4a",
  COURSE_401: "15c25608-8889-4b82-a720-d3e91129f10a",
  COURSE_402: "119f4a56-0775-4d7a-b9c1-4b1bbcfdf37b",
  COURSE_412: "d2d71597-2a44-42b7-8d9e-10884d592965",
  COURSE_425: "d35a111a-12cf-4b72-9017-d7796dcf906c",
  COURSE_426: "0c78a0d9-0b73-45ab-bc15-e23114949a2a",
  COURSE_499: "ea17c385-e244-469b-83ee-01f6aa3d1796",

  // Assignments
  ASGN_1: "766efb62-1cb2-473d-82d2-ca4b96716091",
  ASGN_2: "a2b0e9a5-76b6-45ef-89a1-5d9c223c34a2",
  ASGN_3: "c4631ab5-8c70-4f9e-9907-fdf027e8d641",
  ASGN_4: "b218413b-280f-4889-a201-995b28d6174a",
  ASGN_5: "f3796d19-4809-43c2-a89e-26fbb10e3049",

  // Tests
  TST_1: "216fa301-447d-4186-b489-8d77bfbb1090",
  TST_2: "627514a0-a7d1-4cb5-85a2-ea1bc41094ab",
  TST_3: "b7e4091a-7b3b-4890-a764-77bfd440938b",
  TST_4: "971846b0-4a87-4340-9e10-da9b02a24911",
  TST_5: "1a8f94cb-5b23-45c1-901a-cf2a912bb302",
};

export const CURRENT_TEACHER_ID = SEED_IDS.TEACHER_1;

export const seedSettings: AppSettings = {
  schoolName: "Jahangirnagar University",
  logoBase64: "",
};

export const seedSessions: Session[] = [
  { id: SEED_IDS.SES_SPRING_2026, name: "Spring 2026", startDate: "2026-01-15", endDate: "2026-05-31", status: "Active" },
  { id: SEED_IDS.SES_FALL_2025,   name: "Fall 2025",   startDate: "2025-08-15", endDate: "2025-12-31", status: "Completed" },
  { id: SEED_IDS.SES_FALL_2026,   name: "Fall 2026",   startDate: "2026-08-15", endDate: "2026-12-31", status: "Upcoming" },
];

export const seedDepartments: Department[] = [
  { id: SEED_IDS.DEPT_CSE, name: "Computer Science & Engineering", code: "CSE" },
  { id: SEED_IDS.DEPT_MTH, name: "Mathematics",                   code: "MTH" },
  { id: SEED_IDS.DEPT_PHY, name: "Physics",                       code: "PHY" },
];

export const seedPrograms: Program[] = [
  { id: SEED_IDS.PROG_BSC_CS, departmentId: SEED_IDS.DEPT_CSE, name: "B.Sc. in Computer Science", code: "B.Sc. CS",  duration: "4 Years" },
  { id: SEED_IDS.PROG_PGDIT,  departmentId: SEED_IDS.DEPT_CSE, name: "PGDIT",                     code: "PGDIT",     duration: "1 Year"  },
  { id: SEED_IDS.PROG_BSC_MTH, departmentId: SEED_IDS.DEPT_MTH, name: "B.Sc. Mathematics",         code: "B.Sc. MTH", duration: "3 Years" },
];

export const seedTeachers: Teacher[] = [
  { id: SEED_IDS.TEACHER_1, name: "Prof. Dr. Shamim Al Mamun",       email: "sam@juniv.edu",    departmentId: SEED_IDS.DEPT_CSE, designation: "Professor & Coordinator PGDIT" },
  { id: SEED_IDS.TEACHER_2, name: "Prof. Dr. Risala Tasin Khan",   email: "rtkhan@juniv.edu",   departmentId: SEED_IDS.DEPT_CSE, designation: "Professor" },
  { id: SEED_IDS.TEACHER_3, name: "Prof. Dr. Mohammad Shahidul Islam",   email: "shahidul@juniv.edu",   departmentId: SEED_IDS.DEPT_CSE, designation: "Professor" },
  { id: SEED_IDS.TEACHER_4, name: "Prof. Md. Fazlul Karim Patwary",    email: "patwary@juniv.edu",  departmentId: SEED_IDS.DEPT_MTH, designation: "Professor" },
  { id: SEED_IDS.TEACHER_5, name: "Prof. Dr. M. Mesbahuddin Sarker",   email: "mesbah@juniv.edu",   departmentId: SEED_IDS.DEPT_PHY, designation: "Professor" },
];

export const seedAdmins: AdminUser[] = [
  { id: SEED_IDS.ADMIN_1, name: "System Admin", email: "admin@edu", role: "Super Admin" },
  { id: SEED_IDS.ADMIN_2, name: "Jane Staff", email: "j.staff@edu", role: "Staff" },
];

export const seedBatches: Batch[] = [
  { id: SEED_IDS.BATCH_SP26_A, code: "SP26-A", name: "Spring 2026 — Section A", programId: SEED_IDS.PROG_BSC_CS, sessionId: SEED_IDS.SES_SPRING_2026, section: "A", status: "Active"    },
  { id: SEED_IDS.BATCH_SP26_B, code: "SP26-B", name: "Spring 2026 — Section B", programId: SEED_IDS.PROG_BSC_CS, sessionId: SEED_IDS.SES_SPRING_2026, section: "B", status: "Active"    },
  { id: SEED_IDS.BATCH_FA25_A, code: "FA25-A", name: "Fall 2025 — Section A",   programId: SEED_IDS.PROG_BSC_CS, sessionId: SEED_IDS.SES_FALL_2025,   section: "A", status: "Completed" },
  { id: SEED_IDS.BATCH_FA26_C, code: "FA26-C", name: "Fall 2026 — Section C",   programId: SEED_IDS.PROG_BSC_CS, sessionId: SEED_IDS.SES_FALL_2026,   section: "C", status: "Upcoming"  },
];

const NAMES_A = [
  "Abdur Rahman", "Ayesha Siddiqa", "Mahmudul Hasan", "Nusrat Jahan", "Kamrul Islam", "Fatema Begum", "Rakibul Hasan",
  "Jannatul Ferdous", "Mehedi Hasan", "Sanjida Akter", "Tariqul Islam", "Sumaiya Akter", "Ariful Islam", "Sadia Afrin",
  "Nazmul Huda", "Farhana Akter", "Imran Hossain", "Tania Rahman", "Rubel Hossain", "Tahmina Akter",
  "Sajedur Rahman", "Ruma Akter", "Samiul Islam", "Mim Akter", "Rashedul Islam", "Tisha Rahman", "Faisal Ahmed",
  "Shirin Akter", "Habibur Rahman", "Salma Khatun", "Ashraful Islam", "Priyanka Roy", "Robiul Islam",
  "Lima Akter", "Saddam Hossain", "Sraboni Das", "Zahid Hasan", "Mitu Akter", "Al Amin",
  "Sharmin Sultana", "Jahangir Alam", "Shila Akter",
];

export const seedStudents: Student[] = [
  ...NAMES_A.map((name, i) => ({
    id: `8a7192bc-0001-4000-a000-${String(i+1).padStart(12,"0")}`, rollNo: `SP26A${String(i+1).padStart(3,"0")}`,
    name, email: `sp26a${i+1}@edu`, batchId: SEED_IDS.BATCH_SP26_A,
  })),
  ...Array.from({ length: 38 }, (_, i) => ({
    id: `8a7192bc-0002-4000-a000-${String(i+1).padStart(12,"0")}`, rollNo: `SP26B${String(i+1).padStart(3,"0")}`,
    name: NAMES_A[i % NAMES_A.length], email: `sp26b${i+1}@edu`, batchId: SEED_IDS.BATCH_SP26_B,
  })),
  ...Array.from({ length: 50 }, (_, i) => ({
    id: `8a7192bc-0003-4000-a000-${String(i+1).padStart(12,"0")}`, rollNo: `FA25A${String(i+1).padStart(3,"0")}`,
    name: NAMES_A[(i + 5) % NAMES_A.length], email: `fa25a${i+1}@edu`, batchId: SEED_IDS.BATCH_FA25_A,
  })),
  ...Array.from({ length: 45 }, (_, i) => ({
    id: `8a7192bc-0004-4000-a000-${String(i+1).padStart(12,"0")}`, rollNo: `FA26C${String(i+1).padStart(3,"0")}`,
    name: NAMES_A[(i + 10) % NAMES_A.length], email: `fa26c${i+1}@edu`, batchId: SEED_IDS.BATCH_FA26_C,
  })),
];

export const seedCourses: Course[] = [
  { id: SEED_IDS.COURSE_305, code: "CSE-305", title: "Database Management Systems", programId: SEED_IDS.PROG_BSC_CS, credits: 3 },
  { id: SEED_IDS.COURSE_412, code: "CSE-412", title: "Software Engineering & System Design", programId: SEED_IDS.PROG_BSC_CS, credits: 3 },
  { id: SEED_IDS.COURSE_101, code: "CSE-101", title: "Structured Programming Language", programId: SEED_IDS.PROG_BSC_CS, credits: 3 },
  { id: SEED_IDS.COURSE_425, code: "CSE-425", title: "Artificial Intelligence & Machine Learning", programId: SEED_IDS.PROG_BSC_CS, credits: 3 },
  { id: SEED_IDS.COURSE_201, code: "CSE-201", title: "Data Structures & Algorithms", programId: SEED_IDS.PROG_BSC_CS, credits: 3 },
];

export const seedClassrooms: Classroom[] = [
  { id: SEED_IDS.CLS_1, courseId: SEED_IDS.COURSE_305, batchId: SEED_IDS.BATCH_SP26_A, teacherId: SEED_IDS.TEACHER_1, room: "Room 402, Bldg C", startDate: "2026-01-15", endDate: "2026-05-20", status: "ongoing",   classesCompleted: 18, totalClasses: 26, colorIndex: 0 },
  { id: SEED_IDS.CLS_2, courseId: SEED_IDS.COURSE_412, batchId: SEED_IDS.BATCH_SP26_B, teacherId: SEED_IDS.TEACHER_1, room: "Room 305, Bldg A", startDate: "2026-01-16", endDate: "2026-05-22", status: "ongoing",   classesCompleted: 15, totalClasses: 20, colorIndex: 1 },
  { id: SEED_IDS.CLS_3, courseId: SEED_IDS.COURSE_101, batchId: SEED_IDS.BATCH_FA25_A, teacherId: SEED_IDS.TEACHER_4, room: "Room 201, Bldg B", startDate: "2025-08-15", endDate: "2025-12-20", status: "completed", classesCompleted: 24, totalClasses: 24, colorIndex: 2 },
  { id: SEED_IDS.CLS_4, courseId: SEED_IDS.COURSE_425, batchId: SEED_IDS.BATCH_SP26_A, teacherId: SEED_IDS.TEACHER_1, room: "Lab 2, Bldg D",    startDate: "2026-01-15", endDate: "2026-05-20", status: "ongoing",   classesCompleted: 8,  totalClasses: 24, colorIndex: 2 },
  { id: SEED_IDS.CLS_5, courseId: SEED_IDS.COURSE_201, batchId: SEED_IDS.BATCH_FA26_C, teacherId: SEED_IDS.TEACHER_2, room: "Room 101, Bldg B", startDate: "2026-08-15", endDate: "2026-12-20", status: "upcoming",  classesCompleted: 0,  totalClasses: 24, colorIndex: 3 },
];

export const seedSchedules: ClassSchedule[] = [
  { id: "26229f17-0c80-4fdc-997c-42644cc8410c", classroomId: SEED_IDS.CLS_1, day: "Monday",    startTime: "10:00 AM", endTime: "11:30 AM", room: "Room 402" },
  { id: "076e5c28-f37e-415a-815c-e368917267e5", classroomId: SEED_IDS.CLS_1, day: "Wednesday", startTime: "10:00 AM", endTime: "11:30 AM", room: "Room 402" },
  { id: "ee86e2f6-f737-45bb-a777-3f8dd8d32f62", classroomId: SEED_IDS.CLS_2, day: "Tuesday",   startTime: "02:00 PM", endTime: "03:30 PM", room: "Room 305" },
  { id: "e4cbbb7b-0ea9-4bc7-bcac-e1552af17c4c", classroomId: SEED_IDS.CLS_2, day: "Thursday",  startTime: "02:00 PM", endTime: "03:30 PM", room: "Room 305" },
  { id: "d266a3f2-b7ef-49aa-85a6-8304efb8b304", classroomId: SEED_IDS.CLS_4, day: "Monday",    startTime: "12:00 PM", endTime: "01:30 PM", room: "Lab 2"    },
  { id: "35ae46e5-ee68-4349-8397-89a86933c83f", classroomId: SEED_IDS.CLS_4, day: "Wednesday", startTime: "12:00 PM", endTime: "01:30 PM", room: "Lab 2"    },
  { id: "12b2cb55-1347-4015-bd17-a53e70835c4a", classroomId: SEED_IDS.CLS_3, day: "Wednesday", startTime: "09:00 AM", endTime: "11:00 AM", room: "Room 201" },
  { id: "137674a9-cc0c-40bc-9309-913bac658395", classroomId: SEED_IDS.CLS_5, day: "Friday",    startTime: "09:00 AM", endTime: "12:00 PM", room: "Room 101" },
];

export const seedSyllabusTopics: SyllabusTopic[] = [
  { id: "79dadc79-f65a-4e74-b07d-fa921732c109", courseId: SEED_IDS.COURSE_305, topic: "Introduction & ER Model",       week: 1, subTopics: ["What is a Database?", "ER Diagrams", "Entity Relationships"], teacherStatus: "done",    adminStatus: "Published" },
  { id: "fa5b9353-62b5-4913-a7e0-4b49ff5ad570", courseId: SEED_IDS.COURSE_305, topic: "Relational Model & SQL",        week: 2, subTopics: ["Relational Algebra", "SQL SELECT", "Joins & Subqueries"],      teacherStatus: "done",    adminStatus: "Published" },
  { id: "138864af-1cd3-44f2-88a4-c31ec8338413", courseId: SEED_IDS.COURSE_305, topic: "Functional Dependencies",       week: 3, subTopics: ["Armstrong's Axioms", "Closure Sets", "Minimal Cover"],          teacherStatus: "done",    adminStatus: "Published" },
  { id: "a3fc4511-4ad1-4001-840e-e2e424768669", courseId: SEED_IDS.COURSE_305, topic: "Normalization (1NF–3NF)",       week: 4, subTopics: ["1NF", "2NF", "3NF", "Anomalies"],                              teacherStatus: "done",    adminStatus: "Published" },
  { id: "5754eea2-7aaf-41ac-86b4-ed8783bab36b", courseId: SEED_IDS.COURSE_305, topic: "BCNF & Denormalization",        week: 5, subTopics: ["3NF Examples", "BCNF Examples", "Practical Problems"],           teacherStatus: "current", adminStatus: "Published" },
  { id: "481d6bd4-956e-4df7-a8af-9b381115a64e", courseId: SEED_IDS.COURSE_305, topic: "Transactions & Concurrency",    week: 6, subTopics: ["ACID Properties", "Deadlocks", "Serializability"],               teacherStatus: "pending", adminStatus: "Published" },
  { id: "8792dc87-96ba-4023-9020-1fe71d38632b", courseId: SEED_IDS.COURSE_305, topic: "Indexing & Query Optimization", week: 7, subTopics: ["B+ Tree", "Hash Index", "Query Cost"],                           teacherStatus: "pending", adminStatus: "Draft"     },
  { id: "0310039b-27f3-4e59-a661-15cf6c67f9c6", courseId: SEED_IDS.COURSE_412, topic: "SDLC Models",                   week: 1, subTopics: ["Waterfall", "Agile", "Spiral"],                                  teacherStatus: "done",    adminStatus: "Published" },
  { id: "a744b4e8-8608-425d-ae21-44fc6077253d", courseId: SEED_IDS.COURSE_412, topic: "Requirements Engineering",      week: 2, subTopics: ["Functional & Non-functional", "Use Case Diagrams"],              teacherStatus: "done",    adminStatus: "Published" },
  { id: "ebfcc667-30f4-4ef5-b321-aae573524b9c", courseId: SEED_IDS.COURSE_412, topic: "System Design & UML",           week: 3, subTopics: ["Class Diagrams", "Sequence Diagrams"],                           teacherStatus: "current", adminStatus: "Published" },
  { id: "eb0bded6-242e-41ab-ab93-b5c14f3489ae", courseId: SEED_IDS.COURSE_412, topic: "Design Patterns",               week: 4, subTopics: ["Singleton", "Observer", "Factory"],                              teacherStatus: "pending", adminStatus: "Draft"     },
  { id: "676b03ae-9b52-4bfc-8364-8081b8d214ff", courseId: SEED_IDS.COURSE_425, topic: "Intro to AI & Search",          week: 1, subTopics: ["BFS", "DFS", "A* Search"],                                       teacherStatus: "done",    adminStatus: "Published" },
  { id: "0a1527cb-aea7-42aa-9605-def58001094d", courseId: SEED_IDS.COURSE_425, topic: "Machine Learning Basics",       week: 2, subTopics: ["Supervised Learning", "Unsupervised Learning"],                  teacherStatus: "current", adminStatus: "Published" },
  { id: "df7fd4a5-d602-4fe9-b2c3-d5b9a0938def", courseId: SEED_IDS.COURSE_425, topic: "Neural Networks",               week: 3, subTopics: ["Perceptrons", "Backpropagation"],                                teacherStatus: "pending", adminStatus: "Draft"     },
];

export const seedAssignments: Assignment[] = [
  { id: SEED_IDS.ASGN_1, classroomId: SEED_IDS.CLS_1, title: "ER Diagram Design",             dueDate: "2026-10-25", totalMarks: 20, status: "Active",    submissions: 38 },
  { id: SEED_IDS.ASGN_2, classroomId: SEED_IDS.CLS_1, title: "SQL Queries Practice",          dueDate: "2026-11-02", totalMarks: 20, status: "Upcoming",  submissions: 0  },
  { id: SEED_IDS.ASGN_3, classroomId: SEED_IDS.CLS_2, title: "Agile Case Study",              dueDate: "2026-10-20", totalMarks: 20, status: "Completed", submissions: 38 },
  { id: SEED_IDS.ASGN_4, classroomId: SEED_IDS.CLS_2, title: "UML Diagram - Library System",  dueDate: "2026-11-10", totalMarks: 20, status: "Active",    submissions: 5  },
  { id: SEED_IDS.ASGN_5, classroomId: SEED_IDS.CLS_4, title: "Search Algorithm Impl.",        dueDate: "2026-11-15", totalMarks: 20, status: "Active",    submissions: 10 },
];

export const seedTests: Test[] = [
  { id: SEED_IDS.TST_1, classroomId: SEED_IDS.CLS_1, title: "Midterm: Normalization",      testDate: "2026-10-25", totalMarks: 50,  status: "Active",    submissions: 40 },
  { id: SEED_IDS.TST_2, classroomId: SEED_IDS.CLS_1, title: "Quiz 1: SQL Basics",          testDate: "2026-11-02", totalMarks: 20,  status: "Upcoming",  submissions: 0  },
  { id: SEED_IDS.TST_3, classroomId: SEED_IDS.CLS_2, title: "Final Exam: SE",              testDate: "2026-12-15", totalMarks: 100, status: "Upcoming",  submissions: 0  },
  { id: SEED_IDS.TST_4, classroomId: SEED_IDS.CLS_2, title: "Midterm: SDLC & UML",        testDate: "2026-10-15", totalMarks: 50,  status: "Completed", submissions: 38 },
  { id: SEED_IDS.TST_5, classroomId: SEED_IDS.CLS_4, title: "Lab Test 1: Search Algo.",   testDate: "2026-11-20", totalMarks: 30,  status: "Upcoming",  submissions: 0  },
];

export const seedAnnouncements: Announcement[] = [
  {
    id: "f2a08a60-fd37-4b63-aad0-b885c114dbd1",
    title: "Welcome to the Spring 2026 Semester!",
    content: "We are excited to welcome all students to the new semester. Please check your course schedules and ensure you have access to all required materials. If you encounter any issues, contact the administration.",
    date: "2026-08-10T09:00:00Z",
    authorId: SEED_IDS.ADMIN_1,
    authorName: "System Admin",
    authorRole: "Admin",
    audienceType: "Global",
    status: "Published",
    priority: "Normal",
  },
  {
    id: "a94229d2-659d-4400-a5f2-dae1d793108a",
    title: "Database System Midterm Update",
    content: "The midterm syllabus for Database Systems has been updated. We will now cover Normalization up to 3NF. BCNF will be moved to the final exam.",
    date: "2026-08-12T14:30:00Z",
    authorId: SEED_IDS.TEACHER_1,
    authorName: "Prof. Dr. Shamim Al Mamun",
    authorRole: "Teacher",
    audienceType: "Course",
    courseId: SEED_IDS.COURSE_305,
    status: "Published",
    priority: "High",
  },
  {
    id: "1fe7d215-eae1-4da4-8c89-2cb372100db9",
    title: "Library Digital Access Upgrade",
    content: "All students and faculty now have unlimited access to IEEE Xplore and ACM Digital Library from both campus Wi-Fi and remote VPN.",
    date: "2026-08-15T11:00:00Z",
    authorId: SEED_IDS.ADMIN_1,
    authorName: "System Admin",
    authorRole: "Admin",
    audienceType: "Global",
    status: "Published",
    priority: "Normal",
  },
];

export const seedClassSessions: ClassSession[] = [];
export const seedAttendanceRecords: AttendanceRecord[] = [];
export const seedGradeRecords: GradeRecord[] = [];

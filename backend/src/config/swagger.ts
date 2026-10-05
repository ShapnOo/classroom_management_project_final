/**
 * OpenAPI 3.0 Specification & Swagger UI Configuration
 * Complete documentation for Scholaris Academic & Classroom Management System API.
 */

export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Academic & Classroom Management System API",
    version: "1.0.0",
    description: "RESTful API documentation for Academic & Classroom Management System (PostgreSQL + Express.js). Developed by Tahmid Afsar Shapno.",
    contact: {
      name: "Tahmid Afsar Shapno",
      email: "shapno.official@gmail.com",
    },
  },
  servers: [
    {
      url: "http://localhost:5001",
      description: "Local Development Server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token in the format: Bearer <token>",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    { name: "Authentication", description: "JWT Authentication, user login, profile retrieval, and logout" },
    { name: "System", description: "Health checks & system metadata" },
    { name: "Teacher Portal & Analytics", description: "Faculty dashboard metrics, assigned classrooms, teacher schedules, and course continuity" },
    { name: "Academic Structure", description: "Departments, Programs, Academic Sessions, Batches, Courses & Syllabus" },
    { name: "Users & Roles", description: "Admins, Teachers, and Students administration" },
    { name: "Classrooms & Schedules", description: "Course-to-batch classroom allocation and weekly timetable" },
    { name: "Class Sessions & Attendance", description: "Lecture logging and student attendance tracking" },
    { name: "Assignments & Tests", description: "Continuous assessment, assignments, exams and grading" },
    { name: "Announcements", description: "Institution and course announcements" },
    { name: "Reports & Analytics", description: "Statistical reports and attendance analytics" },
    { name: "Settings", description: "Application configuration & university branding" },
  ],
  paths: {
    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login with email & password",
        description: "Authenticates any student, teacher, or admin account and returns a signed JWT Bearer token and user details.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                email: "admin@scholaris.edu",
                password: "admin123",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful with token & user data",
            content: {
              "application/json": {
                example: {
                  success: true,
                  message: "Login successful",
                  data: {
                    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    user: {
                      id: "admin-1",
                      name: "Prof. Dr. Shamim Al Mamun",
                      email: "admin@scholaris.edu",
                      role: "admin",
                      departmentId: "dept-1",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Invalid email or password",
          },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get current authenticated user profile",
        description: "Returns the profile of the user identified by the Bearer token.",
        responses: {
          200: {
            description: "Current user profile",
            content: {
              "application/json": {
                example: {
                  success: true,
                  message: "User profile retrieved successfully",
                  data: {
                    user: {
                      id: "admin-1",
                      name: "Prof. Dr. Shamim Al Mamun",
                      email: "admin@scholaris.edu",
                      role: "admin",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized: Missing or invalid token",
          },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Log out current session",
        responses: {
          200: {
            description: "Successfully logged out",
          },
        },
      },
    },
    "/api/admin/dashboard": {
      get: {
        tags: ["Reports & Analytics"],
        summary: "Get consolidated Admin Dashboard summary",
        description: "Returns aggregated metrics (students, teachers, ongoing classes, batches, attendance rate), department distribution, monthly trends, recent activities, and ongoing classrooms in a single fast call.",
        responses: {
          200: {
            description: "Dashboard summary retrieved successfully",
            content: {
              "application/json": {
                example: {
                  success: true,
                  message: "Admin dashboard summary loaded successfully",
                  data: {
                    metrics: {
                      totalStudents: 340,
                      totalTeachers: 28,
                      ongoingClassrooms: 14,
                      totalCourses: 45,
                      totalBatches: 12,
                      avgAttendanceRate: 92,
                    },
                    departmentDistribution: [
                      { id: "dept-1", name: "CSE", fullName: "Computer Science & Engineering", rawCount: 8, value: 45 },
                      { id: "dept-2", name: "EEE", fullName: "Electrical & Electronic Engineering", rawCount: 5, value: 30 }
                    ],
                    trendData: [
                      { month: "Jan", enrollment: 280, attendance: 90 },
                      { month: "Feb", enrollment: 295, attendance: 92 }
                    ],
                    recentActivities: [
                      { id: "ann-1", user: "Admin", action: "published an announcement", target: "Mid-Term Schedule", time: "Recent Notice", color: "bg-blue-50 text-blue-600" }
                    ],
                    ongoingClassrooms: []
                  }
                }
              }
            }
          },
          401: {
            description: "Unauthorized",
          },
          403: {
            description: "Forbidden - Admin access only",
          }
        }
      }
    },
    "/api/admin/dashboard/teacher-stats": {
      get: {
        tags: ["Teacher Portal & Analytics"],
        summary: "Get consolidated Teacher Dashboard summary for authenticated faculty member",
        description: "Returns teacher metrics (classrooms, total students, conducted sessions, assignments, tests, average attendance rate), assigned classrooms with progress, today's schedule, syllabus completion progress, and recent sessions.",
        responses: {
          200: {
            description: "Teacher summary metrics and schedule retrieved successfully",
            content: {
              "application/json": {
                example: {
                  success: true,
                  message: "Teacher dashboard summary loaded successfully",
                  data: {
                    teacher: { id: "teacher-1", name: "Prof. Dr. Shamim Al Mamun" },
                    metrics: {
                      totalClassrooms: 3,
                      totalStudents: 122,
                      totalSessionsConducted: 24,
                      totalAssignments: 5,
                      totalTests: 5,
                      avgAttendanceRate: 94,
                      todayClassesCount: 2
                    },
                    myClassrooms: [],
                    todaySchedules: [],
                    syllabusProgress: [],
                    recentSessions: []
                  }
                }
              }
            }
          },
          401: { description: "Unauthorized: Invalid or missing token" },
          403: { description: "Forbidden" }
        }
      }
    },
    "/api/teacher/dashboard": {
      get: {
        tags: ["Teacher Portal & Analytics"],
        summary: "Get consolidated Teacher Dashboard summary",
        description: "Returns metrics, assigned classrooms, today's class schedule, syllabus progress, and recent sessions filtered by the authenticated teacher's JWT token.",
        responses: {
          200: { description: "Teacher dashboard summary loaded successfully" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/teacher/classrooms": {
      get: {
        tags: ["Teacher Portal & Analytics"],
        summary: "List classrooms assigned to the authenticated teacher",
        description: "Returns only classrooms assigned to the authenticated teacher's profile.",
        responses: {
          200: { description: "Array of assigned classrooms" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/teacher/classrooms/{id}": {
      get: {
        tags: ["Teacher Portal & Analytics"],
        summary: "Get detailed view of an assigned classroom",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Classroom details with joined course and batch info" },
          404: { description: "Classroom not found" },
        },
      },
    },
    "/api/teacher/schedules": {
      get: {
        tags: ["Teacher Portal & Analytics"],
        summary: "List weekly class schedules for teacher",
        responses: { 200: { description: "Array of weekly class schedules" } },
      },
    },
    "/api/teacher/courses": {
      get: {
        tags: ["Teacher Portal & Analytics"],
        summary: "List courses assigned to teacher",
        responses: { 200: { description: "Array of assigned courses" } },
      },
    },
    "/api/teacher/syllabus": {
      get: {
        tags: ["Teacher Portal & Analytics"],
        summary: "List syllabus topics for teacher's courses",
        responses: { 200: { description: "Array of syllabus topics" } },
      },
    },
    "/api/teacher/students": {
      get: {
        tags: ["Teacher Portal & Analytics"],
        summary: "List students enrolled in teacher's batches",
        responses: { 200: { description: "Array of enrolled students" } },
      },
    },
    "/api/teacher/sessions": {
      get: {
        tags: ["Teacher Portal & Analytics"],
        summary: "List conducted lecture sessions",
        responses: { 200: { description: "Array of conducted sessions" } },
      },
      post: {
        tags: ["Teacher Portal & Analytics"],
        summary: "Log a completed lecture session",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { classroomId: "cls-1", date: "2026-10-05T10:00:00Z", topicCovered: "DBMS Normalization", duration: "1h 30m" },
            },
          },
        },
        responses: { 201: { description: "Session logged" } },
      },
    },
    "/api/teacher/attendance": {
      get: {
        tags: ["Teacher Portal & Analytics"],
        summary: "Get student attendance records",
        responses: { 200: { description: "Array of attendance logs" } },
      },
      post: {
        tags: ["Teacher Portal & Analytics"],
        summary: "Save or batch update student attendance",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                records: [
                  { sessionId: "cses-1", classroomId: "cls-1", studentId: "std-1", status: "present" },
                ],
              },
            },
          },
        },
        responses: { 200: { description: "Attendance saved" } },
      },
    },
    "/api/teacher/assignments": {
      get: {
        tags: ["Teacher Portal & Analytics"],
        summary: "List course assignments",
        responses: { 200: { description: "Array of assignments" } },
      },
      post: {
        tags: ["Teacher Portal & Analytics"],
        summary: "Create a new assignment",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { classroomId: "cls-1", title: "Assignment 1: ER Diagram", dueDate: "2026-10-25", totalMarks: 20 },
            },
          },
        },
        responses: { 201: { description: "Assignment created" } },
      },
    },
    "/api/teacher/assignments/{id}": {
      put: {
        tags: ["Teacher Portal & Analytics"],
        summary: "Update an assignment",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Assignment updated" } },
      },
      delete: {
        tags: ["Teacher Portal & Analytics"],
        summary: "Delete an assignment",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Assignment deleted" } },
      },
    },
    "/api/teacher/tests": {
      get: {
        tags: ["Teacher Portal & Analytics"],
        summary: "List tests and exams",
        responses: { 200: { description: "Array of tests" } },
      },
      post: {
        tags: ["Teacher Portal & Analytics"],
        summary: "Schedule a class test or exam",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { classroomId: "cls-1", title: "Mid-Term Exam", testDate: "2026-10-20", totalMarks: 50 },
            },
          },
        },
        responses: { 201: { description: "Test scheduled" } },
      },
    },
    "/api/teacher/tests/{id}": {
      put: {
        tags: ["Teacher Portal & Analytics"],
        summary: "Update a test schedule",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Test updated" } },
      },
      delete: {
        tags: ["Teacher Portal & Analytics"],
        summary: "Delete a test schedule",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Test deleted" } },
      },
    },
    "/api/teacher/results": {
      get: {
        tags: ["Teacher Portal & Analytics"],
        summary: "Get student marks & grade records",
        responses: { 200: { description: "Array of grade records" } },
      },
      post: {
        tags: ["Teacher Portal & Analytics"],
        summary: "Save or update student marks",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { classroomId: "cls-1", studentId: "std-1", testId: "tst-1", obtainedMarks: 45, totalMarks: 50 },
            },
          },
        },
        responses: { 200: { description: "Grade recorded" } },
      },
    },
    "/api/teacher/materials": {
      get: {
        tags: ["Teacher Portal & Analytics"],
        summary: "List learning materials",
        responses: { 200: { description: "Array of materials" } },
      },
      post: {
        tags: ["Teacher Portal & Analytics"],
        summary: "Upload course learning material",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { classroomId: "cls-1", title: "Lecture 1 Slides", type: "pdf", fileUrl: "https://..." },
            },
          },
        },
        responses: { 201: { description: "Material uploaded" } },
      },
    },
    "/api/teacher/materials/{id}": {
      delete: {
        tags: ["Teacher Portal & Analytics"],
        summary: "Delete course learning material",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Material deleted" } },
      },
    },
    "/api/health": {
      get: {
        tags: ["System"],
        summary: "Check API and PostgreSQL connectivity health",
        responses: {
          200: {
            description: "System is healthy and database is connected",
            content: {
              "application/json": {
                example: {
                  status: "healthy",
                  timestamp: "2026-10-05T15:00:00Z",
                  service: "Scholaris Express Backend",
                  database: "PostgreSQL connected",
                },
              },
            },
          },
        },
      },
    },
    "/api/admin/settings": {
      get: {
        tags: ["Settings"],
        summary: "Get application branding and school settings",
        responses: {
          200: {
            description: "Current application settings",
            content: {
              "application/json": {
                example: { schoolName: "Jahangirnagar University", logoBase64: "" },
              },
            },
          },
        },
      },
      put: {
        tags: ["Settings"],
        summary: "Update application branding and school settings",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { schoolName: "Jahangirnagar University", logoBase64: "" },
            },
          },
        },
        responses: {
          200: { description: "Settings updated successfully" },
        },
      },
    },

    // ── ACADEMIC DEPARTMENTS ──
    "/api/admin/academic/departments": {
      get: {
        tags: ["Academic Structure"],
        summary: "List all academic departments",
        responses: { 200: { description: "Array of departments" } },
      },
      post: {
        tags: ["Academic Structure"],
        summary: "Create a new academic department",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { name: "Computer Science & Engineering", code: "CSE" },
            },
          },
        },
        responses: { 201: { description: "Department created" } },
      },
    },
    "/api/admin/academic/departments/{id}": {
      put: {
        tags: ["Academic Structure"],
        summary: "Update an academic department",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { example: { name: "CSE Department", code: "CSE" } } },
        },
        responses: { 200: { description: "Updated" } },
      },
      delete: {
        tags: ["Academic Structure"],
        summary: "Delete an academic department",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Deleted" } },
      },
    },

    // ── PROGRAMS ──
    "/api/admin/academic/programs": {
      get: {
        tags: ["Academic Structure"],
        summary: "List all degree programs",
        responses: { 200: { description: "Array of degree programs" } },
      },
      post: {
        tags: ["Academic Structure"],
        summary: "Create a new degree program",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { departmentId: "dept-1", name: "B.Sc. in Computer Science", code: "B.Sc. CS", duration: "4 Years" },
            },
          },
        },
        responses: { 201: { description: "Program created" } },
      },
    },
    "/api/admin/academic/programs/{id}": {
      put: {
        tags: ["Academic Structure"],
        summary: "Update a degree program",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { example: { name: "B.Sc. Computer Science", code: "CS", duration: "4 Years" } } },
        },
        responses: { 200: { description: "Updated" } },
      },
      delete: {
        tags: ["Academic Structure"],
        summary: "Delete a degree program",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Deleted" } },
      },
    },

    // ── ACADEMIC SESSIONS ──
    "/api/admin/academic/sessions": {
      get: {
        tags: ["Academic Structure"],
        summary: "List academic sessions",
        responses: { 200: { description: "Array of sessions" } },
      },
      post: {
        tags: ["Academic Structure"],
        summary: "Create an academic session",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { name: "Spring 2026", startDate: "2026-01-15", endDate: "2026-05-31", status: "Active" },
            },
          },
        },
        responses: { 201: { description: "Session created" } },
      },
    },
    "/api/admin/academic/sessions/{id}": {
      put: {
        tags: ["Academic Structure"],
        summary: "Update an academic session",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { example: { name: "Spring 2026 (Extended)", status: "Active" } } },
        },
        responses: { 200: { description: "Updated" } },
      },
      delete: {
        tags: ["Academic Structure"],
        summary: "Delete an academic session",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Deleted" } },
      },
    },

    // ── BATCHES ──
    "/api/admin/academic/batches": {
      get: {
        tags: ["Academic Structure"],
        summary: "List all student batches",
        responses: { 200: { description: "Array of batches" } },
      },
      post: {
        tags: ["Academic Structure"],
        summary: "Create a new student batch",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { code: "SP26-A", name: "Spring 2026 — Section A", programId: "prog-1", sessionId: "ses-1", section: "A", status: "Active", semesterCount: 8 },
            },
          },
        },
        responses: { 201: { description: "Batch created" } },
      },
    },
    "/api/admin/academic/batches/{id}": {
      put: {
        tags: ["Academic Structure"],
        summary: "Update a student batch",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { example: { name: "Spring 2026 Section A", status: "Active" } } },
        },
        responses: { 200: { description: "Updated" } },
      },
      delete: {
        tags: ["Academic Structure"],
        summary: "Delete a batch",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Deleted" } },
      },
    },

    // ── COURSES & SYLLABUS ──
    "/api/admin/academic/courses": {
      get: {
        tags: ["Academic Structure"],
        summary: "List all courses",
        responses: { 200: { description: "Array of courses" } },
      },
      post: {
        tags: ["Academic Structure"],
        summary: "Create a new course",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { code: "CSE-305", title: "Database Management Systems", programId: "prog-1", credits: 3 },
            },
          },
        },
        responses: { 201: { description: "Course created" } },
      },
    },
    "/api/admin/academic/syllabus": {
      get: {
        tags: ["Academic Structure"],
        summary: "Get syllabus curriculum topics (optionally filtered by courseId)",
        parameters: [{ name: "courseId", in: "query", schema: { type: "string" } }],
        responses: { 200: { description: "Array of syllabus topics" } },
      },
      post: {
        tags: ["Academic Structure"],
        summary: "Create a syllabus topic",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { courseId: "course-1", topic: "Relational Algebra & SQL", week: 2, subTopics: ["Joins", "Grouping"], adminStatus: "Published" },
            },
          },
        },
        responses: { 201: { description: "Topic created" } },
      },
    },

    // ── USERS (ADMINS, TEACHERS, STUDENTS) ──
    "/api/admin/users/teachers": {
      get: {
        tags: ["Users & Roles"],
        summary: "List all faculty members / teachers",
        responses: { 200: { description: "Array of teachers" } },
      },
      post: {
        tags: ["Users & Roles"],
        summary: "Create a new teacher account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { name: "Prof. Dr. Shamim Al Mamun", email: "sam@juniv.edu", departmentId: "dept-1", designation: "Professor" },
            },
          },
        },
        responses: { 201: { description: "Teacher created" } },
      },
    },
    "/api/admin/users/students": {
      get: {
        tags: ["Users & Roles"],
        summary: "List students (optionally filtered by batchId)",
        parameters: [{ name: "batchId", in: "query", schema: { type: "string" } }],
        responses: { 200: { description: "Array of students" } },
      },
      post: {
        tags: ["Users & Roles"],
        summary: "Enroll a new student",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { rollNo: "SP26A001", name: "Abdur Rahman", email: "sp26a1@edu", batchId: "batch-1", phone: "+880 1711234567" },
            },
          },
        },
        responses: { 201: { description: "Student created" } },
      },
    },
    "/api/admin/users/admins": {
      get: {
        tags: ["Users & Roles"],
        summary: "List administrator users",
        responses: { 200: { description: "Array of admin users" } },
      },
      post: {
        tags: ["Users & Roles"],
        summary: "Create an admin user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { name: "Jane Staff", email: "j.staff@edu", role: "Staff" },
            },
          },
        },
        responses: { 201: { description: "Admin created" } },
      },
    },

    // ── CLASSROOMS & SCHEDULES ──
    "/api/admin/classrooms": {
      get: {
        tags: ["Classrooms & Schedules"],
        summary: "List all assigned classrooms with joined details",
        parameters: [
          { name: "batchId", in: "query", schema: { type: "string" } },
          { name: "teacherId", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string" } },
        ],
        responses: { 200: { description: "Array of classrooms" } },
      },
      post: {
        tags: ["Classrooms & Schedules"],
        summary: "Allocate a new classroom (Course + Batch + Teacher)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                courseId: "course-1",
                batchId: "batch-1",
                teacherId: "teacher-1",
                room: "Room 402, Bldg C",
                startDate: "2026-01-15",
                endDate: "2026-05-20",
                status: "ongoing",
                totalClasses: 26,
                colorIndex: 0,
                schedules: [{ day: "Monday", startTime: "10:00 AM", endTime: "11:30 AM" }],
              },
            },
          },
        },
        responses: { 201: { description: "Classroom allocated" } },
      },
    },
    "/api/admin/classrooms/schedules": {
      get: {
        tags: ["Classrooms & Schedules"],
        summary: "Get weekly timetable schedules",
        responses: { 200: { description: "Array of class schedules" } },
      },
      post: {
        tags: ["Classrooms & Schedules"],
        summary: "Add a weekly timetable slot",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { classroomId: "cls-1", day: "Wednesday", startTime: "10:00 AM", endTime: "11:30 AM", room: "Room 402" },
            },
          },
        },
        responses: { 201: { description: "Schedule added" } },
      },
    },

    // ── ACTIVITIES, ATTENDANCE & GRADES ──
    "/api/admin/activities/sessions": {
      get: {
        tags: ["Class Sessions & Attendance"],
        summary: "List conducted class sessions with attendance counts",
        parameters: [{ name: "classroomId", in: "query", schema: { type: "string" } }],
        responses: { 200: { description: "Array of conducted sessions" } },
      },
      post: {
        tags: ["Class Sessions & Attendance"],
        summary: "Log a completed class lecture session",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                classroomId: "cls-1",
                date: "2026-02-10T10:00:00Z",
                topicCovered: "Topic 3: Normalization",
                notes: "Solved practical examples",
                duration: "1h 30m",
              },
            },
          },
        },
        responses: { 201: { description: "Session recorded" } },
      },
    },
    "/api/admin/activities/attendance": {
      get: {
        tags: ["Class Sessions & Attendance"],
        summary: "Get attendance logs",
        parameters: [
          { name: "classroomId", in: "query", schema: { type: "string" } },
          { name: "sessionId", in: "query", schema: { type: "string" } },
        ],
        responses: { 200: { description: "Array of attendance records" } },
      },
      post: {
        tags: ["Class Sessions & Attendance"],
        summary: "Save or batch update student attendance",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                records: [
                  { sessionId: "cses-1", classroomId: "cls-1", studentId: "std-batch-1-1", status: "present" },
                  { sessionId: "cses-1", classroomId: "cls-1", studentId: "std-batch-1-2", status: "absent" },
                ],
              },
            },
          },
        },
        responses: { 200: { description: "Attendance saved" } },
      },
    },
    "/api/admin/activities/assignments": {
      get: {
        tags: ["Assignments & Tests"],
        summary: "List assignments",
        responses: { 200: { description: "Array of assignments" } },
      },
      post: {
        tags: ["Assignments & Tests"],
        summary: "Create a new assignment",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { classroomId: "cls-1", title: "ER Diagram Design", dueDate: "2026-10-25", totalMarks: 20, status: "Active" },
            },
          },
        },
        responses: { 201: { description: "Assignment created" } },
      },
    },
    "/api/admin/activities/tests": {
      get: {
        tags: ["Assignments & Tests"],
        summary: "List tests and examinations",
        responses: { 200: { description: "Array of tests" } },
      },
      post: {
        tags: ["Assignments & Tests"],
        summary: "Schedule a new test / examination",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { classroomId: "cls-1", title: "Midterm Exam", testDate: "2026-10-25", duration: "1h 30m", totalMarks: 50, status: "Active" },
            },
          },
        },
        responses: { 201: { description: "Test scheduled" } },
      },
    },
    "/api/admin/activities/results": {
      get: {
        tags: ["Assignments & Tests"],
        summary: "Get student marks & grade records",
        responses: { 200: { description: "Array of grade records" } },
      },
      post: {
        tags: ["Assignments & Tests"],
        summary: "Save student test or assignment grade",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { classroomId: "cls-1", studentId: "std-batch-1-1", testId: "tst-1", obtainedMarks: 45, totalMarks: 50, remarks: "Excellent" },
            },
          },
        },
        responses: { 201: { description: "Grade recorded" } },
      },
    },

    // ── ANNOUNCEMENTS ──
    "/api/admin/announcements": {
      get: {
        tags: ["Announcements"],
        summary: "List all announcements",
        responses: { 200: { description: "Array of announcements" } },
      },
      post: {
        tags: ["Announcements"],
        summary: "Publish a new announcement",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                title: "Semester Schedule Notice",
                content: "Final semester tests begin next month.",
                date: "2026-08-10T09:00:00Z",
                authorId: "admin-1",
                authorName: "System Admin",
                authorRole: "Admin",
                audienceType: "Global",
                status: "Published",
                priority: "Normal",
              },
            },
          },
        },
        responses: { 201: { description: "Announcement published" } },
      },
    },

    // ── REPORTS & ANALYTICS ──
    "/api/admin/reports/dashboard-stats": {
      get: {
        tags: ["Reports & Analytics"],
        summary: "Get overall administrative dashboard summary counts",
        responses: { 200: { description: "Counts of teachers, students, active classrooms, sessions" } },
      },
    },
    "/api/admin/reports/attendance": {
      get: {
        tags: ["Reports & Analytics"],
        summary: "Get attendance rate analytics and trends",
        responses: { 200: { description: "Attendance statistics" } },
      },
    },
  },
};

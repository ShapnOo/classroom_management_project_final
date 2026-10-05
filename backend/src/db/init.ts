import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initDatabase() {
  console.log("Initializing PostgreSQL Database Schema...");
  try {
    const schemaSqlPath = path.join(__dirname, "schema.sql");
    const schemaSql = fs.readFileSync(schemaSqlPath, "utf-8");
    await pool.query(schemaSql);
    await pool.query(`
      ALTER TABLE syllabus_topics ADD COLUMN IF NOT EXISTS total_slides INT DEFAULT 0;
      ALTER TABLE syllabus_topics ADD COLUMN IF NOT EXISTS completed_slides INT DEFAULT 0;
    `);
    console.log("Database schema initialized successfully.");

    // Check if initial settings exist
    const { rows } = await pool.query("SELECT id FROM departments LIMIT 1");
    if (rows.length === 0) {
      console.log("Seeding full administrative and academic demo data...");
      await seedInitialData();
    } else {
      console.log("Existing data detected in scholaris_db.");
      await seedStudentTranscripts();
    }
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}

export async function seedInitialData() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 0. App Settings
    await client.query(`
      INSERT INTO app_settings (id, school_name, logo_base64)
      VALUES ('default', 'Jahangirnagar University', '')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 1. Departments
    await client.query(`
      INSERT INTO departments (id, name, code) VALUES
      ('dept-1', 'Computer Science & Engineering', 'CSE'),
      ('dept-2', 'Mathematics', 'MTH'),
      ('dept-3', 'Physics', 'PHY')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 2. Programs
    await client.query(`
      INSERT INTO programs (id, department_id, name, code, duration) VALUES
      ('prog-1', 'dept-1', 'B.Sc. in Computer Science', 'B.Sc. CS', '4 Years'),
      ('prog-2', 'dept-1', 'Postgraduate Diploma in IT', 'PGDIT', '1 Year'),
      ('prog-3', 'dept-2', 'B.Sc. Mathematics', 'B.Sc. MTH', '3 Years')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 3. Academic Sessions
    await client.query(`
      INSERT INTO academic_sessions (id, name, start_date, end_date, status) VALUES
      ('ses-1', 'Spring 2026', '2026-01-15', '2026-05-31', 'Active'),
      ('ses-2', 'Fall 2025', '2025-08-15', '2025-12-31', 'Completed'),
      ('ses-3', 'Fall 2026', '2026-08-15', '2026-12-31', 'Upcoming')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 4. Batches
    await client.query(`
      INSERT INTO batches (id, code, name, program_id, session_id, section, status, semester_count) VALUES
      ('batch-1', 'SP26-A', 'Spring 2026 — Section A', 'prog-1', 'ses-1', 'A', 'Active', 8),
      ('batch-2', 'SP26-B', 'Spring 2026 — Section B', 'prog-1', 'ses-1', 'B', 'Active', 8),
      ('batch-3', 'FA25-A', 'Fall 2025 — Section A', 'prog-1', 'ses-2', 'A', 'Completed', 8),
      ('batch-4', 'FA26-C', 'Fall 2026 — Section C', 'prog-1', 'ses-3', 'C', 'Upcoming', 8)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 5. Admins & Teachers Users
    await client.query(`
      INSERT INTO users (id, name, email, password_hash, role) VALUES
      ('admin-1', 'System Admin', 'admin@edu', 'admin123', 'admin'),
      ('admin-2', 'Jane Staff', 'j.staff@edu', 'admin123', 'admin'),
      ('teacher-1', 'Prof. Dr. Shamim Al Mamun', 'sam@juniv.edu', 'teacher123', 'teacher'),
      ('teacher-2', 'Prof. Dr. Risala Tasin Khan', 'rtkhan@juniv.edu', 'teacher123', 'teacher'),
      ('teacher-3', 'Prof. Dr. Mohammad Shahidul Islam', 'shahidul@juniv.edu', 'teacher123', 'teacher'),
      ('teacher-4', 'Prof. Md. Fazlul Karim Patwary', 'patwary@juniv.edu', 'teacher123', 'teacher'),
      ('teacher-5', 'Prof. Dr. M. Mesbahuddin Sarker', 'mesbah@juniv.edu', 'teacher123', 'teacher')
      ON CONFLICT (id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO admins (id, name, email, role) VALUES
      ('admin-1', 'System Admin', 'admin@edu', 'Super Admin'),
      ('admin-2', 'Jane Staff', 'j.staff@edu', 'Staff')
      ON CONFLICT (id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO teachers (id, name, email, department_id, designation) VALUES
      ('teacher-1', 'Prof. Dr. Shamim Al Mamun', 'sam@juniv.edu', 'dept-1', 'Professor & Coordinator PGDIT'),
      ('teacher-2', 'Prof. Dr. Risala Tasin Khan', 'rtkhan@juniv.edu', 'dept-1', 'Professor'),
      ('teacher-3', 'Prof. Dr. Mohammad Shahidul Islam', 'shahidul@juniv.edu', 'dept-1', 'Professor'),
      ('teacher-4', 'Prof. Md. Fazlul Karim Patwary', 'patwary@juniv.edu', 'dept-2', 'Professor'),
      ('teacher-5', 'Prof. Dr. M. Mesbahuddin Sarker', 'mesbah@juniv.edu', 'dept-3', 'Professor')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 6. 175 Students across 4 Batches
    const studentNames = [
      "Abdur Rahman", "Ayesha Siddiqa", "Mahmudul Hasan", "Nusrat Jahan", "Kamrul Islam", "Fatema Begum", "Rakibul Hasan",
      "Jannatul Ferdous", "Mehedi Hasan", "Sanjida Akter", "Tariqul Islam", "Sumaiya Akter", "Ariful Islam", "Sadia Afrin",
      "Nazmul Huda", "Farhana Akter", "Imran Hossain", "Tania Rahman", "Rubel Hossain", "Tahmina Akter",
      "Sajedur Rahman", "Ruma Akter", "Samiul Islam", "Mim Akter", "Rashedul Islam", "Tisha Rahman", "Faisal Ahmed",
      "Shirin Akter", "Habibur Rahman", "Salma Khatun", "Ashraful Islam", "Priyanka Roy", "Robiul Islam",
      "Lima Akter", "Saddam Hossain", "Sraboni Das", "Zahid Hasan", "Mitu Akter", "Al Amin",
      "Sharmin Sultana", "Jahangir Alam", "Shila Akter"
    ];

    const batches = [
      { id: "batch-1", prefix: "SP26A", count: 42 },
      { id: "batch-2", prefix: "SP26B", count: 38 },
      { id: "batch-3", prefix: "FA25A", count: 50 },
      { id: "batch-4", prefix: "FA26C", count: 45 },
    ];

    for (const b of batches) {
      for (let i = 1; i <= b.count; i++) {
        const studentId = `std-${b.id}-${i}`;
        const rollNo = `${b.prefix}${String(i).padStart(3, "0")}`;
        const name = studentNames[(i - 1) % studentNames.length];
        const email = `${b.prefix.toLowerCase()}${i}@edu`;
        const phone = `+880 171${String(1000000 + i * 137).slice(1)}`;

        await client.query(
          `INSERT INTO users (id, name, email, password_hash, role)
           VALUES ($1, $2, $3, 'student123', 'student')
           ON CONFLICT (id) DO NOTHING`,
          [studentId, name, email]
        );

        await client.query(
          `INSERT INTO students (id, roll_no, name, email, batch_id, phone)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO NOTHING`,
          [studentId, rollNo, name, email, b.id, phone]
        );
      }
    }

    // 7. 20 Academic Courses across 8 Semesters
    await client.query(`
      INSERT INTO courses (id, code, title, program_id, credits) VALUES
      ('course-1', 'CSE-101', 'Structured Programming Language', 'prog-1', 3),
      ('course-2', 'CSE-102', 'Structured Programming Lab', 'prog-1', 1.5),
      ('course-3', 'CSE-103', 'Discrete Mathematics', 'prog-1', 3),
      ('course-4', 'CSE-104', 'Electrical Circuits & Electronics', 'prog-1', 3),
      ('course-5', 'CSE-201', 'Data Structures & Algorithms', 'prog-1', 3),
      ('course-6', 'CSE-202', 'Data Structures Lab', 'prog-1', 1.5),
      ('course-7', 'CSE-203', 'Object Oriented Programming', 'prog-1', 3),
      ('course-8', 'CSE-204', 'Digital Logic Design', 'prog-1', 3),
      ('course-9', 'CSE-301', 'Algorithm Analysis & Design', 'prog-1', 3),
      ('course-10', 'CSE-302', 'Computer Architecture', 'prog-1', 3),
      ('course-11', 'CSE-303', 'Operating Systems', 'prog-1', 3),
      ('course-12', 'CSE-304', 'Operating Systems Lab', 'prog-1', 1.5),
      ('course-13', 'CSE-305', 'Database Management Systems', 'prog-1', 3),
      ('course-14', 'CSE-306', 'Database Management Systems Lab', 'prog-1', 1.5),
      ('course-15', 'CSE-401', 'Computer Networks', 'prog-1', 3),
      ('course-16', 'CSE-402', 'Computer Networks Lab', 'prog-1', 1.5),
      ('course-17', 'CSE-412', 'Software Engineering & System Design', 'prog-1', 3),
      ('course-18', 'CSE-425', 'Artificial Intelligence & Machine Learning', 'prog-1', 3),
      ('course-19', 'CSE-426', 'Artificial Intelligence Lab', 'prog-1', 1.5),
      ('course-20', 'CSE-499', 'B.Sc. Thesis / Capstone Project', 'prog-1', 6)
      ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, credits = EXCLUDED.credits;
    `);

    // 8. Syllabus Topics
    await client.query(`
      INSERT INTO syllabus_topics (id, course_id, topic, week, sub_topics, teacher_status, admin_status) VALUES
      ('syl-1', 'course-1', 'Introduction & ER Model', 1, ARRAY['What is a Database?', 'ER Diagrams', 'Entity Relationships'], 'done', 'Published'),
      ('syl-2', 'course-1', 'Relational Model & SQL', 2, ARRAY['Relational Algebra', 'SQL SELECT', 'Joins & Subqueries'], 'done', 'Published'),
      ('syl-3', 'course-1', 'Functional Dependencies', 3, ARRAY['Armstrong''s Axioms', 'Closure Sets', 'Minimal Cover'], 'done', 'Published'),
      ('syl-4', 'course-1', 'Normalization (1NF–3NF)', 4, ARRAY['1NF', '2NF', '3NF', 'Anomalies'], 'done', 'Published'),
      ('syl-5', 'course-1', 'BCNF & Denormalization', 5, ARRAY['3NF Examples', 'BCNF Examples', 'Practical Problems'], 'current', 'Published'),
      ('syl-6', 'course-1', 'Transactions & Concurrency', 6, ARRAY['ACID Properties', 'Deadlocks', 'Serializability'], 'pending', 'Published'),
      ('syl-7', 'course-1', 'Indexing & Query Optimization', 7, ARRAY['B+ Tree', 'Hash Index', 'Query Cost'], 'pending', 'Draft'),
      ('syl-8', 'course-2', 'SDLC Models', 1, ARRAY['Waterfall', 'Agile', 'Spiral'], 'done', 'Published'),
      ('syl-9', 'course-2', 'Requirements Engineering', 2, ARRAY['Functional & Non-functional', 'Use Case Diagrams'], 'done', 'Published'),
      ('syl-10', 'course-2', 'System Design & UML', 3, ARRAY['Class Diagrams', 'Sequence Diagrams'], 'current', 'Published'),
      ('syl-11', 'course-2', 'Design Patterns', 4, ARRAY['Singleton', 'Observer', 'Factory'], 'pending', 'Draft'),
      ('syl-12', 'course-4', 'Intro to AI & Search', 1, ARRAY['BFS', 'DFS', 'A* Search'], 'done', 'Published'),
      ('syl-13', 'course-4', 'Machine Learning Basics', 2, ARRAY['Supervised Learning', 'Unsupervised Learning'], 'current', 'Published'),
      ('syl-14', 'course-4', 'Neural Networks', 3, ARRAY['Perceptrons', 'Backpropagation'], 'pending', 'Draft')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 9. Classrooms
    await client.query(`
      INSERT INTO classrooms (id, course_id, batch_id, teacher_id, room, start_date, end_date, status, classes_completed, total_classes, color_index) VALUES
      ('cls-1', 'course-1', 'batch-1', 'teacher-1', 'Room 402, Bldg C', '2026-01-15', '2026-05-20', 'ongoing', 18, 26, 0),
      ('cls-2', 'course-2', 'batch-2', 'teacher-1', 'Room 305, Bldg A', '2026-01-16', '2026-05-22', 'ongoing', 15, 20, 1),
      ('cls-3', 'course-3', 'batch-3', 'teacher-4', 'Room 201, Bldg B', '2025-08-15', '2025-12-20', 'completed', 24, 24, 2),
      ('cls-4', 'course-4', 'batch-1', 'teacher-1', 'Lab 2, Bldg D', '2026-01-15', '2026-05-20', 'ongoing', 8, 24, 2),
      ('cls-5', 'course-5', 'batch-4', 'teacher-2', 'Room 101, Bldg B', '2026-08-15', '2026-12-20', 'upcoming', 0, 24, 3)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 10. Class Schedules
    await client.query(`
      INSERT INTO class_schedules (id, classroom_id, day, start_time, end_time, room) VALUES
      ('sch-1', 'cls-1', 'Monday', '10:00 AM', '11:30 AM', 'Room 402'),
      ('sch-2', 'cls-1', 'Wednesday', '10:00 AM', '11:30 AM', 'Room 402'),
      ('sch-3', 'cls-2', 'Tuesday', '02:00 PM', '03:30 PM', 'Room 305'),
      ('sch-4', 'cls-2', 'Thursday', '02:00 PM', '03:30 PM', 'Room 305'),
      ('sch-5', 'cls-4', 'Monday', '12:00 PM', '01:30 PM', 'Lab 2'),
      ('sch-6', 'cls-4', 'Wednesday', '12:00 PM', '01:30 PM', 'Lab 2'),
      ('sch-7', 'cls-3', 'Wednesday', '09:00 AM', '11:00 AM', 'Room 201'),
      ('sch-8', 'cls-5', 'Friday', '09:00 AM', '12:00 PM', 'Room 101')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 11. Class Sessions & Attendance Records
    let sessIdx = 1;
    let attIdx = 1;
    const activeClassrooms = [
      { id: "cls-1", batchId: "batch-1", count: 42, sessions: 10, prefix: "SP26A" },
      { id: "cls-2", batchId: "batch-2", count: 38, sessions: 8, prefix: "SP26B" },
      { id: "cls-4", batchId: "batch-1", count: 42, sessions: 6, prefix: "SP26A" },
    ];

    for (const ac of activeClassrooms) {
      for (let s = 1; s <= ac.sessions; s++) {
        const sessionId = `cses-${sessIdx++}`;
        const sessionDate = `2026-0${Math.floor((s + 1) / 2)}-${String(10 + s).padStart(2, "0")}T10:00:00Z`;

        await client.query(
          `INSERT INTO class_sessions (id, classroom_id, date, topic_covered, notes, duration)
           VALUES ($1, $2, $3, $4, $5, '1h 30m')
           ON CONFLICT (id) DO NOTHING`,
          [sessionId, ac.id, sessionDate, `Topic ${s}: Core Concept Lecture`, `Completed syllabus requirements and live examples for session ${s}`]
        );

        for (let st = 1; st <= ac.count; st++) {
          const studentId = `std-${ac.batchId}-${st}`;
          const hash = (st * 13 + s * 7) % 100;
          const status = hash < 75 ? "present" : hash < 90 ? "late" : "absent";
          const attId = `att-${attIdx++}`;

          await client.query(
            `INSERT INTO attendance_records (id, session_id, classroom_id, student_id, status)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (session_id, student_id) DO NOTHING`,
            [attId, sessionId, ac.id, studentId, status]
          );
        }
      }
    }

    // 12. Assignments
    await client.query(`
      INSERT INTO assignments (id, classroom_id, title, description, due_date, total_marks, status, submissions) VALUES
      ('asgn-1', 'cls-1', 'ER Diagram Design', 'Design an enterprise ER Diagram for university hall management', '2026-10-25', 20, 'Active', 38),
      ('asgn-2', 'cls-1', 'SQL Queries Practice', 'Complex SQL nested joins, grouping, and analytic window functions', '2026-11-02', 20, 'Upcoming', 0),
      ('asgn-3', 'cls-2', 'Agile Case Study', 'Evaluate Scrum vs Kanban for an e-commerce platform migration', '2026-10-20', 20, 'Completed', 38),
      ('asgn-4', 'cls-2', 'UML Diagram - Library System', 'Full class and sequence diagrams following standard OMG UML 2.5', '2026-11-10', 20, 'Active', 5),
      ('asgn-5', 'cls-4', 'Search Algorithm Impl.', 'Implement A* search with Manhattan distance heuristic in Python', '2026-11-15', 20, 'Active', 10)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 13. Tests
    await client.query(`
      INSERT INTO tests (id, classroom_id, title, description, test_date, duration, total_marks, status, submissions) VALUES
      ('tst-1', 'cls-1', 'Midterm: Normalization', 'Written exam on functional dependencies up to 3NF & BCNF', '2026-10-25', '1h 30m', 50, 'Active', 40),
      ('tst-2', 'cls-1', 'Quiz 1: SQL Basics', 'Multiple choice and short SQL query syntax', '2026-11-02', '30m', 20, 'Upcoming', 0),
      ('tst-3', 'cls-2', 'Final Exam: SE', 'Comprehensive final evaluation on software engineering principles', '2026-12-15', '2h', 100, 'Upcoming', 0),
      ('tst-4', 'cls-2', 'Midterm: SDLC & UML', 'Mid-semester theoretical and diagrammatic assessment', '2026-10-15', '1h', 50, 'Completed', 38),
      ('tst-5', 'cls-4', 'Lab Test 1: Search Algo.', 'Hands-on coding exam on graph search algorithms', '2026-11-20', '1h', 30, 'Upcoming', 0)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 14. Grade Records for Completed / Active Tests
    let grdIdx = 1;
    const testGrading = [
      { testId: "tst-4", clsId: "cls-2", batchId: "batch-2", totalMarks: 50, count: 38 },
      { testId: "tst-1", clsId: "cls-1", batchId: "batch-1", totalMarks: 50, count: 40 },
    ];

    for (const tg of testGrading) {
      for (let st = 1; st <= tg.count; st++) {
        const studentId = `std-${tg.batchId}-${st}`;
        const hash = (st * 11 + tg.testId.length * 5) % 100;
        const scorePercent = 60 + (hash % 41); // 60 to 100%
        const obtainedMarks = Math.round((scorePercent / 100) * tg.totalMarks);
        const remarks = scorePercent >= 90 ? "Excellent" : scorePercent >= 80 ? "Good" : scorePercent >= 70 ? "Average" : "Needs Improvement";
        const gradeId = `grd-tst-${grdIdx++}`;

        await client.query(
          `INSERT INTO grade_records (id, classroom_id, student_id, test_id, obtained_marks, total_marks, remarks)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO NOTHING`,
          [gradeId, tg.clsId, studentId, tg.testId, obtainedMarks, tg.totalMarks, remarks]
        );
      }
    }

    // 15. Announcements
    await client.query(`
      INSERT INTO announcements (id, title, content, date, author_id, author_name, author_role, audience_type, status, priority) VALUES
      ('ann-1', 'Welcome to the Spring 2026 Semester!', 'We are excited to welcome all students to the new semester. Please check your course schedules and ensure you have access to all required materials. If you encounter any issues, contact the administration.', '2026-08-10T09:00:00Z', 'admin-1', 'System Admin', 'Admin', 'Global', 'Published', 'Normal'),
      ('ann-2', 'Database System Midterm Update', 'The midterm syllabus for Database Systems has been updated. We will now cover Normalization up to 3NF. BCNF will be moved to the final exam.', '2026-08-12T14:30:00Z', 'teacher-1', 'Prof. Dr. Shamim Al Mamun', 'Teacher', 'Course', 'Published', 'High'),
      ('ann-3', 'Library Digital Access Upgrade', 'All students and faculty now have unlimited access to IEEE Xplore and ACM Digital Library from both campus Wi-Fi and remote VPN.', '2026-08-15T11:00:00Z', 'admin-1', 'System Admin', 'Admin', 'Global', 'Published', 'Normal')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 16. Course Materials
    await client.query(`
      INSERT INTO course_materials (id, classroom_id, course_id, title, description, file_name, file_type, file_size) VALUES
      ('mat-1', 'cls-1', 'course-1', 'Lecture 1: ER Modeling & Relational Diagrams', 'Comprehensive slide deck introducing ER entity types, weak entities, and cardinality constraints.', 'ER_Modeling_Lecture1.pdf', 'application/pdf', '2.4 MB'),
      ('mat-2', 'cls-1', 'course-1', 'SQL Lab Exercises & Sample Dataset', 'Hands-on practice script for inner/outer joins, grouping, and subqueries.', 'SQL_Lab_Practice_Spring2026.sql', 'text/plain', '180 KB'),
      ('mat-3', 'cls-2', 'course-2', 'Agile & Scrum Process Guide', 'Overview of sprint planning, backlog grooming, daily standups, and retrospective templates.', 'Scrum_Guide_2026.pdf', 'application/pdf', '1.8 MB'),
      ('mat-4', 'cls-4', 'course-4', 'A* Search Algorithm Python Notebook', 'Interactive Python code implementing A* search with heuristic visualization.', 'A_Star_Search_Implementation.ipynb', 'application/json', '520 KB')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 17. Seed Student Transcripts
    await seedStudentTranscripts(client);

    await client.query("COMMIT");
    console.log("Full realistic demo data populated successfully in PostgreSQL!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seeding error:", err);
    throw err;
  } finally {
    client.release();
  }
}

export async function seedStudentTranscripts(clientOrPool: any = pool) {
  const allCoursesList = [
    { id: "course-1", semester: "Semester 1" },
    { id: "course-2", semester: "Semester 1" },
    { id: "course-3", semester: "Semester 1" },
    { id: "course-4", semester: "Semester 1" },
    { id: "course-5", semester: "Semester 2" },
    { id: "course-6", semester: "Semester 2" },
    { id: "course-7", semester: "Semester 2" },
    { id: "course-8", semester: "Semester 2" },
    { id: "course-9", semester: "Semester 3" },
    { id: "course-10", semester: "Semester 3" },
    { id: "course-11", semester: "Semester 3" },
    { id: "course-12", semester: "Semester 3" },
    { id: "course-13", semester: "Semester 4" },
    { id: "course-14", semester: "Semester 4" },
    { id: "course-15", semester: "Semester 4" },
    { id: "course-16", semester: "Semester 4" },
    { id: "course-17", semester: "Semester 5" },
    { id: "course-18", semester: "Semester 5" },
    { id: "course-19", semester: "Semester 5" },
    { id: "course-20", semester: "Semester 5" },
  ];

  function calcGradeInfo(score: number) {
    if (score >= 80) return { grade: "A+", gpa: 4.00 };
    if (score >= 75) return { grade: "A", gpa: 3.75 };
    if (score >= 70) return { grade: "A-", gpa: 3.50 };
    if (score >= 65) return { grade: "B+", gpa: 3.25 };
    if (score >= 60) return { grade: "B", gpa: 3.00 };
    if (score >= 55) return { grade: "B-", gpa: 2.75 };
    if (score >= 50) return { grade: "C+", gpa: 2.50 };
    if (score >= 45) return { grade: "C", gpa: 2.25 };
    if (score >= 40) return { grade: "D", gpa: 2.00 };
    return { grade: "F", gpa: 0.00 };
  }

  const { rows: students } = await clientOrPool.query("SELECT id FROM students");
  for (const student of students) {
    const studentId = student.id;
    const studentSeed = studentId.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);

    for (let cIdx = 0; cIdx < allCoursesList.length; cIdx++) {
      const courseInfo = allCoursesList[cIdx];
      const trId = `tr-${studentId}-${courseInfo.id}`;
      const baseSeed = (studentSeed * 13 + (cIdx + 1) * 29) % 100;

      const ctMark = Math.min(15, Math.max(10, Math.round(11.5 + (baseSeed % 4.5))));
      const assnMark = Math.min(10, Math.max(7, Math.round(7.5 + ((baseSeed * 3) % 3))));
      const projMark = Math.min(15, Math.max(11, Math.round(11.5 + ((baseSeed * 5) % 4))));
      const attMark = Math.min(10, Math.max(8, Math.round(8.5 + ((baseSeed * 7) % 2))));
      const midtermMark = Math.min(20, Math.max(14, Math.round(15 + ((baseSeed * 11) % 5.5))));
      const finalExamMark = Math.min(30, Math.max(20, Math.round(22 + ((baseSeed * 17) % 8.5))));

      const totalScore = Math.min(100, ctMark + assnMark + projMark + attMark + midtermMark + finalExamMark);
      const { grade, gpa } = calcGradeInfo(totalScore);

      await clientOrPool.query(`
        INSERT INTO student_transcripts (id, student_id, course_id, semester, ct_mark, assn_mark, proj_mark, att_mark, midterm_mark, final_exam_mark, total_score, letter_grade, grade_point)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE SET
          ct_mark = EXCLUDED.ct_mark,
          assn_mark = EXCLUDED.assn_mark,
          proj_mark = EXCLUDED.proj_mark,
          att_mark = EXCLUDED.att_mark,
          midterm_mark = EXCLUDED.midterm_mark,
          final_exam_mark = EXCLUDED.final_exam_mark,
          total_score = EXCLUDED.total_score,
          letter_grade = EXCLUDED.letter_grade,
          grade_point = EXCLUDED.grade_point
      `, [trId, studentId, courseInfo.id, courseInfo.semester, ctMark, assnMark, projMark, attMark, midtermMark, finalExamMark, totalScore, grade, gpa]);
    }
  }
}

if (process.argv[1] && process.argv[1].endsWith("init.ts")) {
  initDatabase().then(() => {
    console.log("Database initialized and ready.");
    process.exit(0);
  }).catch((err) => {
    console.error("Initialization failed:", err);
    process.exit(1);
  });
}


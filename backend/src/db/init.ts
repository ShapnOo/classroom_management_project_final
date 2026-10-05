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
    console.log("Database schema initialized successfully.");

    // Check if initial settings exist
    const { rows } = await pool.query("SELECT id FROM departments LIMIT 1");
    if (rows.length === 0) {
      console.log("Seeding full administrative and academic demo data...");
      await seedInitialData();
    } else {
      console.log("Existing data detected. Skipping automatic seeding.");
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

    // 5. Admins & Teachers
    await client.query(`
      INSERT INTO users (id, name, email, role) VALUES
      ('admin-1', 'System Admin', 'admin@edu', 'admin'),
      ('admin-2', 'Jane Staff', 'j.staff@edu', 'admin'),
      ('teacher-1', 'Prof. Dr. Shamim Al Mamun', 'sam@juniv.edu', 'teacher'),
      ('teacher-2', 'Prof. Dr. Risala Tasin Khan', 'rtkhan@juniv.edu', 'teacher'),
      ('teacher-3', 'Prof. Dr. Mohammad Shahidul Islam', 'shahidul@juniv.edu', 'teacher'),
      ('teacher-4', 'Prof. Md. Fazlul Karim Patwary', 'patwary@juniv.edu', 'teacher'),
      ('teacher-5', 'Prof. Dr. M. Mesbahuddin Sarker', 'mesbah@juniv.edu', 'teacher')
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO admins (id, name, email, role) VALUES
      ('admin-1', 'System Admin', 'admin@edu', 'Super Admin'),
      ('admin-2', 'Jane Staff', 'j.staff@edu', 'Staff')
      ON CONFLICT (id) DO NOTHING;

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

        await client.query(`
          INSERT INTO users (id, name, email, role)
          VALUES ($1, $2, $3, 'student')
          ON CONFLICT (id) DO NOTHING;

          INSERT INTO students (id, roll_no, name, email, batch_id, phone)
          VALUES ($1, $4, $2, $3, $5, $6)
          ON CONFLICT (id) DO NOTHING;
        `, [studentId, name, email, rollNo, b.id, phone]);
      }
    }

    // 7. Courses
    await client.query(`
      INSERT INTO courses (id, code, title, program_id, credits) VALUES
      ('course-1', 'CSE-305', 'Database Management Systems', 'prog-1', 3),
      ('course-2', 'CSE-412', 'Software Engineering', 'prog-1', 3),
      ('course-3', 'CSE-101', 'Intro to Computer Science', 'prog-1', 3),
      ('course-4', 'CSE-425', 'Artificial Intelligence', 'prog-1', 3),
      ('course-5', 'CSE-201', 'Data Structures', 'prog-1', 3)
      ON CONFLICT (id) DO NOTHING;
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

        await client.query(`
          INSERT INTO class_sessions (id, classroom_id, date, topic_covered, notes, duration)
          VALUES ($1, $2, $3, $4, $5, '1h 30m')
          ON CONFLICT (id) DO NOTHING;
        `, [sessionId, ac.id, sessionDate, `Topic ${s}: Core Concept Lecture`, `Completed syllabus requirements and live examples for session ${s}`]);

        for (let st = 1; st <= ac.count; st++) {
          const studentId = `std-${ac.batchId}-${st}`;
          const hash = (st * 13 + s * 7) % 100;
          const status = hash < 75 ? "present" : hash < 90 ? "late" : "absent";
          const attId = `att-${attIdx++}`;

          await client.query(`
            INSERT INTO attendance_records (id, session_id, classroom_id, student_id, status)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (session_id, student_id) DO NOTHING;
          `, [attId, sessionId, ac.id, studentId, status]);
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

        await client.query(`
          INSERT INTO grade_records (id, classroom_id, student_id, test_id, obtained_marks, total_marks, remarks)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO NOTHING;
        `, [gradeId, tg.clsId, studentId, tg.testId, obtainedMarks, tg.totalMarks, remarks]);
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

if (process.argv[1] && process.argv[1].endsWith("init.ts")) {
  initDatabase().then(() => {
    console.log("Database initialized and ready.");
    process.exit(0);
  }).catch((err) => {
    console.error("Initialization failed:", err);
    process.exit(1);
  });
}

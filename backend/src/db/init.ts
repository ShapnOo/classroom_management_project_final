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
    const { rows } = await pool.query("SELECT * FROM departments LIMIT 1");
    if (rows.length === 0) {
      console.log("Seeding initial administrative and academic data...");
      await seedInitialData();
    }
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}

async function seedInitialData() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Departments
    await client.query(`
      INSERT INTO departments (id, name, code) VALUES
      ('dept-1', 'Computer Science & Engineering', 'CSE'),
      ('dept-2', 'Electrical & Electronic Engineering', 'EEE'),
      ('dept-3', 'Business Administration', 'BBA')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 2. Programs
    await client.query(`
      INSERT INTO programs (id, department_id, name, code, duration) VALUES
      ('prog-1', 'dept-1', 'Postgraduate Diploma in IT', 'PGDIT', '1 Year'),
      ('prog-2', 'dept-1', 'Bachelor of Science in CSE', 'BSc CSE', '4 Years'),
      ('prog-3', 'dept-2', 'Bachelor of Science in EEE', 'BSc EEE', '4 Years')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 3. Sessions
    await client.query(`
      INSERT INTO academic_sessions (id, name, start_date, end_date, status) VALUES
      ('sess-1', 'Spring 2026', '2026-01-01', '2026-06-30', 'Active'),
      ('sess-2', 'Fall 2025', '2025-07-01', '2025-12-31', 'Completed'),
      ('sess-3', 'Summer 2026', '2026-07-01', '2026-12-31', 'Upcoming')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 4. Batches
    await client.query(`
      INSERT INTO batches (id, code, name, program_id, session_id, section, status, semester_count) VALUES
      ('batch-1', 'PGDIT-261', 'PGDIT Spring 2026', 'prog-1', 'sess-1', 'A', 'Active', 2),
      ('batch-2', 'CSE-252', 'BSc CSE Fall 2025', 'prog-2', 'sess-2', 'A', 'Active', 8),
      ('batch-3', 'EEE-261', 'BSc EEE Spring 2026', 'prog-3', 'sess-1', 'A', 'Upcoming', 8)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 5. Teachers
    await client.query(`
      INSERT INTO users (id, name, email, role) VALUES
      ('teacher-1', 'Dr. Sarah Rahman', 'sarah.rahman@scholaris.edu', 'teacher'),
      ('teacher-2', 'Prof. Tariqul Islam', 'tariqul.islam@scholaris.edu', 'teacher'),
      ('admin-1', 'System Administrator', 'admin@scholaris.edu', 'admin')
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO teachers (id, name, email, department_id, designation) VALUES
      ('teacher-1', 'Dr. Sarah Rahman', 'sarah.rahman@scholaris.edu', 'dept-1', 'Associate Professor'),
      ('teacher-2', 'Prof. Tariqul Islam', 'tariqul.islam@scholaris.edu', 'dept-1', 'Professor')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 6. Courses
    await client.query(`
      INSERT INTO courses (id, code, title, program_id, credits) VALUES
      ('course-1', 'PGDIT-101', 'Database Management Systems', 'prog-1', 3),
      ('course-2', 'PGDIT-102', 'Software Engineering & Agile Methodologies', 'prog-1', 3),
      ('course-3', 'CSE-201', 'Web Technologies & Cloud Computing', 'prog-2', 3),
      ('course-4', 'CSE-301', 'Artificial Intelligence & Machine Learning', 'prog-2', 4)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 7. Syllabus Topics
    await client.query(`
      INSERT INTO syllabus_topics (id, course_id, topic, week, sub_topics, teacher_status, admin_status) VALUES
      ('syl-1', 'course-1', 'Database Architecture & ER Modeling', 1, ARRAY['ANSI-SPARC 3-tier', 'Entities and Relationships', 'ERD Diagrams'], 'done', 'Published'),
      ('syl-2', 'course-1', 'Relational Algebra & SQL DDL/DML', 2, ARRAY['Relational Algebra Operators', 'SQL Queries', 'Constraints'], 'done', 'Published'),
      ('syl-3', 'course-1', 'Functional Dependencies & Normalization (1NF to 3NF)', 3, ARRAY['1NF', '2NF', '3NF', 'Lossless Joins'], 'current', 'Published'),
      ('syl-4', 'course-1', 'Boyce-Codd Normal Form (BCNF) & 4NF', 4, ARRAY['BCNF Decomposition', 'Multi-valued Dependencies', '4NF'], 'pending', 'Published'),
      ('syl-5', 'course-1', 'Transaction Management & Concurrency Control', 5, ARRAY['ACID Properties', 'Schedules & Serializability', '2PL Protocol'], 'pending', 'Published')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 8. Classrooms
    await client.query(`
      INSERT INTO classrooms (id, course_id, batch_id, teacher_id, room, start_date, end_date, status, classes_completed, total_classes, color_index) VALUES
      ('cls-1', 'course-1', 'batch-1', 'teacher-1', 'Room 402, IT Lab B', '2026-01-15', '2026-05-30', 'ongoing', 14, 36, 0),
      ('cls-2', 'course-2', 'batch-1', 'teacher-1', 'Room 305, Main Block', '2026-01-15', '2026-05-30', 'ongoing', 10, 30, 1),
      ('cls-3', 'course-3', 'batch-2', 'teacher-2', 'Software Lab 1', '2025-07-15', '2025-12-15', 'completed', 30, 30, 2)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 9. Class Schedules
    await client.query(`
      INSERT INTO class_schedules (id, classroom_id, day, start_time, end_time, room) VALUES
      ('sch-1', 'cls-1', 'Monday', '10:00 AM', '11:30 AM', 'Room 402'),
      ('sch-2', 'cls-1', 'Wednesday', '10:00 AM', '11:30 AM', 'Room 402'),
      ('sch-3', 'cls-2', 'Tuesday', '02:00 PM', '03:30 PM', 'Room 305'),
      ('sch-4', 'cls-2', 'Thursday', '02:00 PM', '03:30 PM', 'Room 305')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 10. Students
    await client.query(`
      INSERT INTO users (id, name, email, role) VALUES
      ('stud-1', 'Alice Johnson', 'alice.johnson@edu.scholaris.org', 'student'),
      ('stud-2', 'Bob Martinez', 'bob.martinez@edu.scholaris.org', 'student'),
      ('stud-3', 'Charlie Davis', 'charlie.davis@edu.scholaris.org', 'student')
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO students (id, roll_no, name, email, batch_id, phone) VALUES
      ('stud-1', '26-001', 'Alice Johnson', 'alice.johnson@edu.scholaris.org', 'batch-1', '+1 555-0101'),
      ('stud-2', '26-002', 'Bob Martinez', 'bob.martinez@edu.scholaris.org', 'batch-1', '+1 555-0102'),
      ('stud-3', '26-003', 'Charlie Davis', 'charlie.davis@edu.scholaris.org', 'batch-1', '+1 555-0103')
      ON CONFLICT (id) DO NOTHING;
    `);

    await client.query("COMMIT");
    console.log("Initial seed data populated successfully.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seeding error:", err);
  } finally {
    client.release();
  }
}

if (process.argv[1] && process.argv[1].endsWith("init.ts")) {
  initDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { pool } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Standard authentic UUID v4 definitions for core seed entities
export const SEED_IDS = {
  // Programs (Top-Level Academic Degrees & Schools) - 12 Programs
  PROG_BSC_CS:  "70b58daf-cae1-4e39-b58b-943cd1e45912",
  PROG_PGDIT:   "7a3bcad5-44d5-4ea7-b510-ea234cfd8fa0",
  PROG_BSC_MTH: "1ae5de70-3136-4c3c-85e7-de7f2ce5d58b",
  PROG_SET:     "11111111-0000-4000-8000-000000000001",
  PROG_SBAS:    "11111111-0000-4000-8000-000000000002",
  PROG_SBLS:    "11111111-0000-4000-8000-000000000003",
  PROG_SSSG:    "11111111-0000-4000-8000-000000000004",
  PROG_FAH:     "11111111-0000-4000-8000-000000000005",
  PROG_SLLS:    "11111111-0000-4000-8000-000000000006",
  PROG_FMAH:    "11111111-0000-4000-8000-000000000007",
  PROG_FAUD:    "11111111-0000-4000-8000-000000000008",
  PROG_EDEP:    "11111111-0000-4000-8000-000000000009",

  // Departments (Under Programs) - 15 Departments
  DEPT_CSE:   "114914b4-ff80-48d7-8290-ac7ea3cbdfaf",
  DEPT_MTH:   "654cc707-b3fc-4428-8bfa-cf0024263142",
  DEPT_PHY:   "9f895bcd-bd98-4624-abda-37a22111a378",
  DEPT_SWE:   "22222222-0000-4000-8000-000000000001",
  DEPT_ITS:   "22222222-0000-4000-8000-000000000002",
  DEPT_CHEM:  "22222222-0000-4000-8000-000000000003",
  DEPT_EEE:   "22222222-0000-4000-8000-000000000004",
  DEPT_CEE:   "22222222-0000-4000-8000-000000000005",
  DEPT_ME:    "22222222-0000-4000-8000-000000000006",
  DEPT_FIN:   "22222222-0000-4000-8000-000000000007",
  DEPT_MKT:   "22222222-0000-4000-8000-000000000008",
  DEPT_PHARM: "22222222-0000-4000-8000-000000000009",
  DEPT_BMB:   "22222222-0000-4000-8000-000000000010",
  DEPT_ECON:  "22222222-0000-4000-8000-000000000011",
  DEPT_LAW:   "22222222-0000-4000-8000-000000000012",

  // Sessions
  SES_SPRING_2026: "59d346bc-a55c-490f-ba0a-69ce85ec3063",
  SES_FALL_2025:   "c088b44a-a372-4953-9e86-bdb8739ed659",
  SES_FALL_2026:   "f1dece0c-a017-48b3-9422-1cc1ada34271",

  // Batches
  BATCH_SP26_A: "98b7201d-f795-4069-9229-42117595fb3f",
  BATCH_SP26_B: "c4ce1ed1-879d-4b4e-a877-da2b376aae1d",
  BATCH_FA25_A: "1bb542f2-202b-4bb7-af5a-0546e2b18407",
  BATCH_FA26_C: "35144c16-c129-4702-ac46-ed049860ae43",
  BATCH_47_EXP: "e5a31b28-4747-4747-8747-exp474747474",
  BATCH_48_QUE: "e5a31b28-4848-4848-8848-que484848484",

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

  // 20 Courses
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

export async function initDatabase() {
  console.log("Initializing PostgreSQL Database Schema...");
  try {
    const schemaSqlPath = path.join(__dirname, "schema.sql");
    const schemaSql = fs.readFileSync(schemaSqlPath, "utf-8");
    await pool.query(schemaSql);
    await pool.query(`
      ALTER TABLE courses ALTER COLUMN credits TYPE NUMERIC(3,1);
      ALTER TABLE departments ADD COLUMN IF NOT EXISTS program_id VARCHAR(64) REFERENCES programs(id) ON DELETE SET NULL;
      ALTER TABLE syllabus_topics ADD COLUMN IF NOT EXISTS total_slides INT DEFAULT 0;
      ALTER TABLE syllabus_topics ADD COLUMN IF NOT EXISTS completed_slides INT DEFAULT 0;
      ALTER TABLE students ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE students ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';
      CREATE TABLE IF NOT EXISTS batch_promotion_logs (
        id VARCHAR(64) PRIMARY KEY,
        batch_id VARCHAR(64) REFERENCES batches(id) ON DELETE CASCADE,
        batch_name VARCHAR(255) NOT NULL,
        batch_code VARCHAR(50) NOT NULL,
        previous_semester INT NOT NULL,
        target_semester INT NOT NULL,
        total_students INT NOT NULL DEFAULT 0,
        promoted_count INT NOT NULL DEFAULT 0,
        held_count INT NOT NULL DEFAULT 0,
        improvement_count INT NOT NULL DEFAULT 0,
        gap_count INT NOT NULL DEFAULT 0,
        drop_count INT NOT NULL DEFAULT 0,
        executed_by VARCHAR(255) DEFAULT 'System Admin',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_student_transcripts_student ON student_transcripts(student_id);
      CREATE INDEX IF NOT EXISTS idx_student_transcripts_course ON student_transcripts(course_id);
      CREATE INDEX IF NOT EXISTS idx_student_transcripts_semester ON student_transcripts(semester);
      CREATE INDEX IF NOT EXISTS idx_students_batch ON students(batch_id);
      CREATE INDEX IF NOT EXISTS idx_classrooms_batch ON classrooms(batch_id);
      CREATE INDEX IF NOT EXISTS idx_grade_records_student ON grade_records(student_id);
      CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON attendance_records(student_id);
    `);
    console.log("Database schema & performance indexes initialized successfully.");

    await seedPromotionLogs();

    const { rows } = await pool.query("SELECT COUNT(*)::int as count FROM departments");
    if (rows.length === 0 || rows[0].count < 10) {
      console.log("Seeding full 12 Academic Programs & 15 Departments hierarchy into scholaris_db...");
      await resetAndSeedInitialData();
    } else {
      console.log("Existing GUID data detected in scholaris_db.");
      await seedStudentTranscripts();
    }
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}

export async function seedPromotionLogs() {
  try {
    const { rows } = await pool.query("SELECT COUNT(*)::int as count FROM batch_promotion_logs");
    if (rows[0].count === 0) {
      const logs = [
        {
          id: "promo_log_1",
          batch_id: SEED_IDS.BATCH_SP26_A,
          batch_name: "Spring 2026 — Section A",
          batch_code: "SP26-A",
          previous_semester: 1,
          target_semester: 2,
          total_students: 42,
          promoted_count: 40,
          held_count: 1,
          improvement_count: 1,
          gap_count: 0,
          drop_count: 0,
          executed_by: "System Admin",
        },
        {
          id: "promo_log_2",
          batch_id: SEED_IDS.BATCH_FA25_A,
          batch_name: "Fall 2025 — Section A",
          batch_code: "FA25-A",
          previous_semester: 7,
          target_semester: 8,
          total_students: 50,
          promoted_count: 48,
          held_count: 1,
          improvement_count: 1,
          gap_count: 0,
          drop_count: 0,
          executed_by: "System Admin",
        },
        {
          id: "promo_log_3",
          batch_id: SEED_IDS.BATCH_SP26_B,
          batch_name: "Spring 2026 — Section B",
          batch_code: "SP26-B",
          previous_semester: 1,
          target_semester: 2,
          total_students: 38,
          promoted_count: 36,
          held_count: 1,
          improvement_count: 1,
          gap_count: 0,
          drop_count: 0,
          executed_by: "System Admin",
        },
        {
          id: "promo_log_4",
          batch_id: SEED_IDS.BATCH_47_EXP,
          batch_name: "Batch 47 (CSE 2021-2025) — Graduated",
          batch_code: "B47-EXP",
          previous_semester: 7,
          target_semester: 8,
          total_students: 45,
          promoted_count: 45,
          held_count: 0,
          improvement_count: 0,
          gap_count: 0,
          drop_count: 0,
          executed_by: "System Admin",
        },
      ];

      for (const log of logs) {
        await pool.query(
          `INSERT INTO batch_promotion_logs 
           (id, batch_id, batch_name, batch_code, previous_semester, target_semester, total_students, promoted_count, held_count, improvement_count, gap_count, drop_count, executed_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           ON CONFLICT (id) DO NOTHING`,
          [
            log.id,
            log.batch_id,
            log.batch_name,
            log.batch_code,
            log.previous_semester,
            log.target_semester,
            log.total_students,
            log.promoted_count,
            log.held_count,
            log.improvement_count,
            log.gap_count,
            log.drop_count,
            log.executed_by,
          ]
        );
      }
    }
  } catch (err) {
    console.error("Failed to seed promotion logs:", err);
  }
}

export async function resetAndSeedInitialData() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query("TRUNCATE TABLE student_transcripts, attendance_records, class_sessions, grade_records, assignments, tests, class_schedules, classrooms, syllabus_topics, course_materials, courses, students, teachers, admins, users, batches, academic_sessions, programs, departments CASCADE;");

    // 0. App Settings
    await client.query(`
      INSERT INTO app_settings (id, school_name, logo_base64)
      VALUES ('default', 'Jahangirnagar University', '')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 1. Programs FIRST (12 Degree / Academic Programs)
    await client.query(`
      INSERT INTO programs (id, name, code, duration) VALUES
      ('${SEED_IDS.PROG_BSC_CS}', 'School of Computer Science & AI', 'SCSAI', '4 Years'),
      ('${SEED_IDS.PROG_PGDIT}', 'Institute of Information Technology', 'IIT', '1 Year'),
      ('${SEED_IDS.PROG_BSC_MTH}', 'School of Physical & Mathematical Sciences', 'SPMS', '4 Years'),
      ('${SEED_IDS.PROG_SET}', 'Faculty of Engineering & Technology', 'FET', '4 Years'),
      ('${SEED_IDS.PROG_SBAS}', 'School of Business & Financial Management', 'SBFM', '4 Years'),
      ('${SEED_IDS.PROG_SBLS}', 'School of Biological & Pharmaceutical Sciences', 'SBPS', '4 Years'),
      ('${SEED_IDS.PROG_SSSG}', 'School of Social Sciences & Public Policy', 'SSSPP', '4 Years'),
      ('${SEED_IDS.PROG_FAH}', 'Faculty of Arts & Cultural Studies', 'FACS', '4 Years'),
      ('${SEED_IDS.PROG_SLLS}', 'School of Law & Legal Studies', 'SLLS', '4 Years'),
      ('${SEED_IDS.PROG_FMAH}', 'Faculty of Medicine & Health Sciences', 'FMHS', '5 Years'),
      ('${SEED_IDS.PROG_FAUD}', 'Faculty of Architecture & Urban Design', 'FAUD', '5 Years'),
      ('${SEED_IDS.PROG_EDEP}', 'Executive & Professional Diploma Program', 'EPDP', '1 Year')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 2. Departments SECOND (15 Departments linked under Programs)
    await client.query(`
      INSERT INTO departments (id, program_id, name, code) VALUES
      ('${SEED_IDS.DEPT_CSE}', '${SEED_IDS.PROG_BSC_CS}', 'Computer Science & Engineering', 'CSE'),
      ('${SEED_IDS.DEPT_SWE}', '${SEED_IDS.PROG_BSC_CS}', 'Software Engineering & Data Science', 'SWE'),
      ('${SEED_IDS.DEPT_ITS}', '${SEED_IDS.PROG_PGDIT}', 'Information Technology Systems', 'ITS'),
      ('${SEED_IDS.DEPT_MTH}', '${SEED_IDS.PROG_BSC_MTH}', 'Mathematics & Applied Statistics', 'MTH'),
      ('${SEED_IDS.DEPT_PHY}', '${SEED_IDS.PROG_BSC_MTH}', 'Physics & Electronics', 'PHY'),
      ('${SEED_IDS.DEPT_CHEM}', '${SEED_IDS.PROG_BSC_MTH}', 'Chemistry & Material Science', 'CHEM'),
      ('${SEED_IDS.DEPT_EEE}', '${SEED_IDS.PROG_SET}', 'Electrical & Electronic Engineering', 'EEE'),
      ('${SEED_IDS.DEPT_CEE}', '${SEED_IDS.PROG_SET}', 'Civil & Environmental Engineering', 'CEE'),
      ('${SEED_IDS.DEPT_ME}', '${SEED_IDS.PROG_SET}', 'Mechanical Engineering', 'ME'),
      ('${SEED_IDS.DEPT_FIN}', '${SEED_IDS.PROG_SBAS}', 'Finance & Investment Banking', 'FIN'),
      ('${SEED_IDS.DEPT_MKT}', '${SEED_IDS.PROG_SBAS}', 'Marketing & Digital Commerce', 'MKT'),
      ('${SEED_IDS.DEPT_PHARM}', '${SEED_IDS.PROG_SBLS}', 'Pharmacy & Clinical Research', 'PHARM'),
      ('${SEED_IDS.DEPT_BMB}', '${SEED_IDS.PROG_SBLS}', 'Biochemistry & Molecular Biology', 'BMB'),
      ('${SEED_IDS.DEPT_ECON}', '${SEED_IDS.PROG_SSSG}', 'Economics & Public Governance', 'ECON'),
      ('${SEED_IDS.DEPT_LAW}', '${SEED_IDS.PROG_SLLS}', 'Jurisprudence & Legal Studies', 'LAW')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 3. Academic Sessions
    await client.query(`
      INSERT INTO academic_sessions (id, name, start_date, end_date, status) VALUES
      ('${SEED_IDS.SES_SPRING_2026}', 'Spring 2026', '2026-01-15', '2026-05-31', 'Active'),
      ('${SEED_IDS.SES_FALL_2025}', 'Fall 2025', '2025-08-15', '2025-12-31', 'Completed'),
      ('${SEED_IDS.SES_FALL_2026}', 'Fall 2026', '2026-08-15', '2026-12-31', 'Upcoming')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 4. Batches
    await client.query(`
      INSERT INTO batches (id, code, name, program_id, session_id, section, status, semester_count) VALUES
      ('${SEED_IDS.BATCH_SP26_A}', 'SP26-A', 'Spring 2026 — Section A', '${SEED_IDS.PROG_BSC_CS}', '${SEED_IDS.SES_SPRING_2026}', 'A', 'Active', 8),
      ('${SEED_IDS.BATCH_SP26_B}', 'SP26-B', 'Spring 2026 — Section B', '${SEED_IDS.PROG_BSC_CS}', '${SEED_IDS.SES_SPRING_2026}', 'B', 'Active', 8),
      ('${SEED_IDS.BATCH_FA25_A}', 'FA25-A', 'Fall 2025 — Section A', '${SEED_IDS.PROG_BSC_CS}', '${SEED_IDS.SES_FALL_2025}', 'A', 'Completed', 8),
      ('${SEED_IDS.BATCH_FA26_C}', 'FA26-C', 'Fall 2026 — Section C', '${SEED_IDS.PROG_BSC_CS}', '${SEED_IDS.SES_FALL_2026}', 'C', 'Upcoming', 8),
      ('${SEED_IDS.BATCH_47_EXP}', 'B47-EXP', 'Batch 47 (CSE 2021-2025) — Graduated', '${SEED_IDS.PROG_BSC_CS}', '${SEED_IDS.SES_FALL_2025}', 'A', 'Completed', 8),
      ('${SEED_IDS.BATCH_48_QUE}', 'B48-QUE', 'Batch 48 (CSE 2022-2026) — Queued', '${SEED_IDS.PROG_BSC_CS}', '${SEED_IDS.SES_SPRING_2026}', 'A', 'Active', 7)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 5. Admins & Teachers Users
    await client.query(`
      INSERT INTO users (id, name, email, password_hash, role) VALUES
      ('${SEED_IDS.ADMIN_1}', 'System Admin', 'admin@edu', 'admin123', 'admin'),
      ('${SEED_IDS.ADMIN_2}', 'Jane Staff', 'j.staff@edu', 'admin123', 'admin'),
      ('${SEED_IDS.TEACHER_1}', 'Prof. Dr. Shamim Al Mamun', 'sam@juniv.edu', 'teacher123', 'teacher'),
      ('${SEED_IDS.TEACHER_2}', 'Prof. Dr. Risala Tasin Khan', 'rtkhan@juniv.edu', 'teacher123', 'teacher'),
      ('${SEED_IDS.TEACHER_3}', 'Prof. Dr. Mohammad Shahidul Islam', 'shahidul@juniv.edu', 'teacher123', 'teacher'),
      ('${SEED_IDS.TEACHER_4}', 'Prof. Md. Fazlul Karim Patwary', 'patwary@juniv.edu', 'teacher123', 'teacher'),
      ('${SEED_IDS.TEACHER_5}', 'Prof. Dr. M. Mesbahuddin Sarker', 'mesbah@juniv.edu', 'teacher123', 'teacher')
      ON CONFLICT (id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO admins (id, name, email, role) VALUES
      ('${SEED_IDS.ADMIN_1}', 'System Admin', 'admin@edu', 'Super Admin'),
      ('${SEED_IDS.ADMIN_2}', 'Jane Staff', 'j.staff@edu', 'Staff')
      ON CONFLICT (id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO teachers (id, name, email, department_id, designation) VALUES
      ('${SEED_IDS.TEACHER_1}', 'Prof. Dr. Shamim Al Mamun', 'sam@juniv.edu', '${SEED_IDS.DEPT_CSE}', 'Professor & Coordinator PGDIT'),
      ('${SEED_IDS.TEACHER_2}', 'Prof. Dr. Risala Tasin Khan', 'rtkhan@juniv.edu', '${SEED_IDS.DEPT_CSE}', 'Professor'),
      ('${SEED_IDS.TEACHER_3}', 'Prof. Dr. Mohammad Shahidul Islam', 'shahidul@juniv.edu', '${SEED_IDS.DEPT_CSE}', 'Professor'),
      ('${SEED_IDS.TEACHER_4}', 'Prof. Md. Fazlul Karim Patwary', 'patwary@juniv.edu', '${SEED_IDS.DEPT_MTH}', 'Professor'),
      ('${SEED_IDS.TEACHER_5}', 'Prof. Dr. M. Mesbahuddin Sarker', 'mesbah@juniv.edu', '${SEED_IDS.DEPT_PHY}', 'Professor')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 6. 175 Students across 4 Batches (with fully random GUIDs)
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
      { id: SEED_IDS.BATCH_SP26_A, prefix: "SP26A", count: 42 },
      { id: SEED_IDS.BATCH_SP26_B, prefix: "SP26B", count: 38 },
      { id: SEED_IDS.BATCH_FA25_A, prefix: "FA25A", count: 50 },
      { id: SEED_IDS.BATCH_FA26_C, prefix: "FA26C", count: 45 },
    ];

    for (const b of batches) {
      for (let i = 1; i <= b.count; i++) {
        const studentId = crypto.randomUUID();
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
    const coursesData = [
      { id: SEED_IDS.COURSE_101, code: 'CSE-101', title: 'Structured Programming Language', program_id: SEED_IDS.PROG_BSC_CS, credits: 3 },
      { id: SEED_IDS.COURSE_102, code: 'CSE-102', title: 'Structured Programming Lab', program_id: SEED_IDS.PROG_BSC_CS, credits: 1.5 },
      { id: SEED_IDS.COURSE_103, code: 'CSE-103', title: 'Discrete Mathematics', program_id: SEED_IDS.PROG_BSC_CS, credits: 3 },
      { id: SEED_IDS.COURSE_104, code: 'CSE-104', title: 'Electrical Circuits & Electronics', program_id: SEED_IDS.PROG_BSC_CS, credits: 3 },
      { id: SEED_IDS.COURSE_201, code: 'CSE-201', title: 'Data Structures & Algorithms', program_id: SEED_IDS.PROG_BSC_CS, credits: 3 },
      { id: SEED_IDS.COURSE_202, code: 'CSE-202', title: 'Data Structures Lab', program_id: SEED_IDS.PROG_BSC_CS, credits: 1.5 },
      { id: SEED_IDS.COURSE_203, code: 'CSE-203', title: 'Object Oriented Programming', program_id: SEED_IDS.PROG_BSC_CS, credits: 3 },
      { id: SEED_IDS.COURSE_204, code: 'CSE-204', title: 'Digital Logic Design', program_id: SEED_IDS.PROG_BSC_CS, credits: 3 },
      { id: SEED_IDS.COURSE_301, code: 'CSE-301', title: 'Algorithm Analysis & Design', program_id: SEED_IDS.PROG_BSC_CS, credits: 3 },
      { id: SEED_IDS.COURSE_302, code: 'CSE-302', title: 'Computer Architecture', program_id: SEED_IDS.PROG_BSC_CS, credits: 3 },
      { id: SEED_IDS.COURSE_303, code: 'CSE-303', title: 'Operating Systems', program_id: SEED_IDS.PROG_BSC_CS, credits: 3 },
      { id: SEED_IDS.COURSE_304, code: 'CSE-304', title: 'Operating Systems Lab', program_id: SEED_IDS.PROG_BSC_CS, credits: 1.5 },
      { id: SEED_IDS.COURSE_305, code: 'CSE-305', title: 'Database Management Systems', program_id: SEED_IDS.PROG_BSC_CS, credits: 3 },
      { id: SEED_IDS.COURSE_306, code: 'CSE-306', title: 'Database Management Systems Lab', program_id: SEED_IDS.PROG_BSC_CS, credits: 1.5 },
      { id: SEED_IDS.COURSE_401, code: 'CSE-401', title: 'Computer Networks', program_id: SEED_IDS.PROG_BSC_CS, credits: 3 },
      { id: SEED_IDS.COURSE_402, code: 'CSE-402', title: 'Computer Networks Lab', program_id: SEED_IDS.PROG_BSC_CS, credits: 1.5 },
      { id: SEED_IDS.COURSE_412, code: 'CSE-412', title: 'Software Engineering & System Design', program_id: SEED_IDS.PROG_BSC_CS, credits: 3 },
      { id: SEED_IDS.COURSE_425, code: 'CSE-425', title: 'Artificial Intelligence & Machine Learning', program_id: SEED_IDS.PROG_BSC_CS, credits: 3 },
      { id: SEED_IDS.COURSE_426, code: 'CSE-426', title: 'Artificial Intelligence Lab', program_id: SEED_IDS.PROG_BSC_CS, credits: 1.5 },
      { id: SEED_IDS.COURSE_499, code: 'CSE-499', title: 'B.Sc. Thesis / Capstone Project', program_id: SEED_IDS.PROG_BSC_CS, credits: 6 },
    ];

    for (const c of coursesData) {
      await client.query(`
        INSERT INTO courses (id, code, title, program_id, credits)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, credits = EXCLUDED.credits;
      `, [c.id, c.code, c.title, c.program_id, c.credits]);
    }

    // 8. Syllabus Topics
    const syllabusData = [
      { id: crypto.randomUUID(), course_id: SEED_IDS.COURSE_305, topic: 'Introduction & ER Model', week: 1, sub_topics: ['What is a Database?', 'ER Diagrams', 'Entity Relationships'], teacher_status: 'done', admin_status: 'Published' },
      { id: crypto.randomUUID(), course_id: SEED_IDS.COURSE_305, topic: 'Relational Model & SQL', week: 2, sub_topics: ['Relational Algebra', 'SQL SELECT', 'Joins & Subqueries'], teacher_status: 'done', admin_status: 'Published' },
      { id: crypto.randomUUID(), course_id: SEED_IDS.COURSE_305, topic: 'Functional Dependencies', week: 3, sub_topics: ["Armstrong's Axioms", 'Closure Sets', 'Minimal Cover'], teacher_status: 'done', admin_status: 'Published' },
      { id: crypto.randomUUID(), course_id: SEED_IDS.COURSE_305, topic: 'Normalization (1NF–3NF)', week: 4, sub_topics: ['1NF', '2NF', '3NF', 'Anomalies'], teacher_status: 'done', admin_status: 'Published' },
      { id: crypto.randomUUID(), course_id: SEED_IDS.COURSE_305, topic: 'BCNF & Denormalization', week: 5, sub_topics: ['3NF Examples', 'BCNF Examples', 'Practical Problems'], teacher_status: 'current', admin_status: 'Published' },
      { id: crypto.randomUUID(), course_id: SEED_IDS.COURSE_305, topic: 'Transactions & Concurrency', week: 6, sub_topics: ['ACID Properties', 'Deadlocks', 'Serializability'], teacher_status: 'pending', admin_status: 'Published' },
      { id: crypto.randomUUID(), course_id: SEED_IDS.COURSE_305, topic: 'Indexing & Query Optimization', week: 7, sub_topics: ['B+ Tree', 'Hash Index', 'Query Cost'], teacher_status: 'pending', admin_status: 'Draft' },
      { id: crypto.randomUUID(), course_id: SEED_IDS.COURSE_412, topic: 'SDLC Models', week: 1, sub_topics: ['Waterfall', 'Agile', 'Spiral'], teacher_status: 'done', admin_status: 'Published' },
      { id: crypto.randomUUID(), course_id: SEED_IDS.COURSE_412, topic: 'Requirements Engineering', week: 2, sub_topics: ['Functional & Non-functional', 'Use Case Diagrams'], teacher_status: 'done', admin_status: 'Published' },
      { id: crypto.randomUUID(), course_id: SEED_IDS.COURSE_412, topic: 'System Design & UML', week: 3, sub_topics: ['Class Diagrams', 'Sequence Diagrams'], teacher_status: 'current', admin_status: 'Published' },
      { id: crypto.randomUUID(), course_id: SEED_IDS.COURSE_412, topic: 'Design Patterns', week: 4, sub_topics: ['Singleton', 'Observer', 'Factory'], teacher_status: 'pending', admin_status: 'Draft' },
      { id: crypto.randomUUID(), course_id: SEED_IDS.COURSE_425, topic: 'Intro to AI & Search', week: 1, sub_topics: ['BFS', 'DFS', 'A* Search'], teacher_status: 'done', admin_status: 'Published' },
      { id: crypto.randomUUID(), course_id: SEED_IDS.COURSE_425, topic: 'Machine Learning Basics', week: 2, sub_topics: ['Supervised Learning', 'Unsupervised Learning'], teacher_status: 'current', admin_status: 'Published' },
      { id: crypto.randomUUID(), course_id: SEED_IDS.COURSE_425, topic: 'Neural Networks', week: 3, sub_topics: ['Perceptrons', 'Backpropagation'], teacher_status: 'pending', admin_status: 'Draft' }
    ];

    for (const s of syllabusData) {
      await client.query(`
        INSERT INTO syllabus_topics (id, course_id, topic, week, sub_topics, teacher_status, admin_status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO NOTHING;
      `, [s.id, s.course_id, s.topic, s.week, s.sub_topics, s.teacher_status, s.admin_status]);
    }

    // 9. Classrooms
    await client.query(`
      INSERT INTO classrooms (id, course_id, batch_id, teacher_id, room, start_date, end_date, status, classes_completed, total_classes, color_index) VALUES
      ('${SEED_IDS.CLS_1}', '${SEED_IDS.COURSE_305}', '${SEED_IDS.BATCH_SP26_A}', '${SEED_IDS.TEACHER_1}', 'Room 402, Bldg C', '2026-01-15', '2026-05-20', 'ongoing', 18, 26, 0),
      ('${SEED_IDS.CLS_2}', '${SEED_IDS.COURSE_412}', '${SEED_IDS.BATCH_SP26_B}', '${SEED_IDS.TEACHER_1}', 'Room 305, Bldg A', '2026-01-16', '2026-05-22', 'ongoing', 15, 20, 1),
      ('${SEED_IDS.CLS_3}', '${SEED_IDS.COURSE_101}', '${SEED_IDS.BATCH_FA25_A}', '${SEED_IDS.TEACHER_4}', 'Room 201, Bldg B', '2025-08-15', '2025-12-20', 'completed', 24, 24, 2),
      ('${SEED_IDS.CLS_4}', '${SEED_IDS.COURSE_425}', '${SEED_IDS.BATCH_SP26_A}', '${SEED_IDS.TEACHER_1}', 'Lab 2, Bldg D', '2026-01-15', '2026-05-20', 'ongoing', 8, 24, 2),
      ('${SEED_IDS.CLS_5}', '${SEED_IDS.COURSE_201}', '${SEED_IDS.BATCH_FA26_C}', '${SEED_IDS.TEACHER_2}', 'Room 101, Bldg B', '2026-08-15', '2026-12-20', 'upcoming', 0, 24, 3)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 10. Class Schedules
    await client.query(`
      INSERT INTO class_schedules (id, classroom_id, day, start_time, end_time, room) VALUES
      ('${crypto.randomUUID()}', '${SEED_IDS.CLS_1}', 'Monday', '10:00 AM', '11:30 AM', 'Room 402'),
      ('${crypto.randomUUID()}', '${SEED_IDS.CLS_1}', 'Wednesday', '10:00 AM', '11:30 AM', 'Room 402'),
      ('${crypto.randomUUID()}', '${SEED_IDS.CLS_2}', 'Tuesday', '02:00 PM', '03:30 PM', 'Room 305'),
      ('${crypto.randomUUID()}', '${SEED_IDS.CLS_2}', 'Thursday', '02:00 PM', '03:30 PM', 'Room 305'),
      ('${crypto.randomUUID()}', '${SEED_IDS.CLS_4}', 'Monday', '12:00 PM', '01:30 PM', 'Lab 2'),
      ('${crypto.randomUUID()}', '${SEED_IDS.CLS_4}', 'Wednesday', '12:00 PM', '01:30 PM', 'Lab 2'),
      ('${crypto.randomUUID()}', '${SEED_IDS.CLS_3}', 'Wednesday', '09:00 AM', '11:00 AM', 'Room 201'),
      ('${crypto.randomUUID()}', '${SEED_IDS.CLS_5}', 'Friday', '09:00 AM', '12:00 PM', 'Room 101')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 11. Class Sessions & Attendance Records
    const activeClassrooms = [
      { id: SEED_IDS.CLS_1, batchId: SEED_IDS.BATCH_SP26_A, count: 42, sessions: 10 },
      { id: SEED_IDS.CLS_2, batchId: SEED_IDS.BATCH_SP26_B, count: 38, sessions: 8 },
      { id: SEED_IDS.CLS_4, batchId: SEED_IDS.BATCH_SP26_A, count: 42, sessions: 6 },
    ];

    for (const ac of activeClassrooms) {
      const { rows: batchStudents } = await client.query("SELECT id FROM students WHERE batch_id = $1", [ac.batchId]);
      for (let s = 1; s <= ac.sessions; s++) {
        const sessionId = crypto.randomUUID();
        const sessionDate = `2026-0${Math.floor((s + 1) / 2)}-${String(10 + s).padStart(2, "0")}T10:00:00Z`;

        await client.query(
          `INSERT INTO class_sessions (id, classroom_id, date, topic_covered, notes, duration)
           VALUES ($1, $2, $3, $4, $5, '1h 30m')
           ON CONFLICT (id) DO NOTHING`,
          [sessionId, ac.id, sessionDate, `Topic ${s}: Core Concept Lecture`, `Completed syllabus requirements and live examples for session ${s}`]
        );

        for (let st = 0; st < batchStudents.length; st++) {
          const studentId = batchStudents[st].id;
          const hash = (st * 13 + s * 7) % 100;
          const status = hash < 75 ? "present" : hash < 90 ? "late" : "absent";
          const attId = crypto.randomUUID();

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
      ('${SEED_IDS.ASGN_1}', '${SEED_IDS.CLS_1}', 'ER Diagram Design', 'Design an enterprise ER Diagram for university hall management', '2026-10-25', 20, 'Active', 38),
      ('${SEED_IDS.ASGN_2}', '${SEED_IDS.CLS_1}', 'SQL Queries Practice', 'Complex SQL nested joins, grouping, and analytic window functions', '2026-11-02', 20, 'Upcoming', 0),
      ('${SEED_IDS.ASGN_3}', '${SEED_IDS.CLS_2}', 'Agile Case Study', 'Evaluate Scrum vs Kanban for an e-commerce platform migration', '2026-10-20', 20, 'Completed', 38),
      ('${SEED_IDS.ASGN_4}', '${SEED_IDS.CLS_2}', 'UML Diagram - Library System', 'Full class and sequence diagrams following standard OMG UML 2.5', '2026-11-10', 20, 'Active', 5),
      ('${SEED_IDS.ASGN_5}', '${SEED_IDS.CLS_4}', 'Search Algorithm Impl.', 'Implement A* search with Manhattan distance heuristic in Python', '2026-11-15', 20, 'Active', 10)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 13. Tests
    await client.query(`
      INSERT INTO tests (id, classroom_id, title, description, test_date, duration, total_marks, status, submissions) VALUES
      ('${SEED_IDS.TST_1}', '${SEED_IDS.CLS_1}', 'Midterm: Normalization', 'Written exam on functional dependencies up to 3NF & BCNF', '2026-10-25', '1h 30m', 50, 'Active', 40),
      ('${SEED_IDS.TST_2}', '${SEED_IDS.CLS_1}', 'Quiz 1: SQL Basics', 'Multiple choice and short SQL query syntax', '2026-11-02', '30m', 20, 'Upcoming', 0),
      ('${SEED_IDS.TST_3}', '${SEED_IDS.CLS_2}', 'Final Exam: SE', 'Comprehensive final evaluation on software engineering principles', '2026-12-15', '2h', 100, 'Upcoming', 0),
      ('${SEED_IDS.TST_4}', '${SEED_IDS.CLS_2}', 'Midterm: SDLC & UML', 'Mid-semester theoretical and diagrammatic assessment', '2026-10-15', '1h', 50, 'Completed', 38),
      ('${SEED_IDS.TST_5}', '${SEED_IDS.CLS_4}', 'Lab Test 1: Search Algo.', 'Hands-on coding exam on graph search algorithms', '2026-11-20', '1h', 30, 'Upcoming', 0)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 14. Grade Records for Completed / Active Tests
    const testGrading = [
      { testId: SEED_IDS.TST_4, clsId: SEED_IDS.CLS_2, batchId: SEED_IDS.BATCH_SP26_B, totalMarks: 50 },
      { testId: SEED_IDS.TST_1, clsId: SEED_IDS.CLS_1, batchId: SEED_IDS.BATCH_SP26_A, totalMarks: 50 },
    ];

    for (const tg of testGrading) {
      const { rows: bStudents } = await client.query("SELECT id FROM students WHERE batch_id = $1", [tg.batchId]);
      for (let st = 0; st < bStudents.length; st++) {
        const studentId = bStudents[st].id;
        const hash = (st * 11 + tg.testId.length * 5) % 100;
        const scorePercent = 60 + (hash % 41);
        const obtainedMarks = Math.round((scorePercent / 100) * tg.totalMarks);
        const remarks = scorePercent >= 90 ? "Excellent" : scorePercent >= 80 ? "Good" : scorePercent >= 70 ? "Average" : "Needs Improvement";
        const gradeId = crypto.randomUUID();

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
      ('${crypto.randomUUID()}', 'Welcome to the Spring 2026 Semester!', 'We are excited to welcome all students to the new semester. Please check your course schedules and ensure you have access to all required materials. If you encounter any issues, contact the administration.', '2026-08-10T09:00:00Z', '${SEED_IDS.ADMIN_1}', 'System Admin', 'Admin', 'Global', 'Published', 'Normal'),
      ('${crypto.randomUUID()}', 'Database System Midterm Update', 'The midterm syllabus for Database Systems has been updated. We will now cover Normalization up to 3NF. BCNF will be moved to the final exam.', '2026-08-12T14:30:00Z', '${SEED_IDS.TEACHER_1}', 'Prof. Dr. Shamim Al Mamun', 'Teacher', 'Course', 'Published', 'High'),
      ('${crypto.randomUUID()}', 'Library Digital Access Upgrade', 'All students and faculty now have unlimited access to IEEE Xplore and ACM Digital Library from both campus Wi-Fi and remote VPN.', '2026-08-15T11:00:00Z', '${SEED_IDS.ADMIN_1}', 'System Admin', 'Admin', 'Global', 'Published', 'Normal')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 16. Course Materials
    await client.query(`
      INSERT INTO course_materials (id, classroom_id, course_id, title, description, file_name, file_type, file_size) VALUES
      ('${crypto.randomUUID()}', '${SEED_IDS.CLS_1}', '${SEED_IDS.COURSE_305}', 'Lecture 1: ER Modeling & Relational Diagrams', 'Comprehensive slide deck introducing ER entity types, weak entities, and cardinality constraints.', 'ER_Modeling_Lecture1.pdf', 'application/pdf', '2.4 MB'),
      ('${crypto.randomUUID()}', '${SEED_IDS.CLS_1}', '${SEED_IDS.COURSE_305}', 'SQL Lab Exercises & Sample Dataset', 'Hands-on practice script for inner/outer joins, grouping, and subqueries.', 'SQL_Lab_Practice_Spring2026.sql', 'text/plain', '180 KB'),
      ('${crypto.randomUUID()}', '${SEED_IDS.CLS_2}', '${SEED_IDS.COURSE_412}', 'Agile & Scrum Process Guide', 'Overview of sprint planning, backlog grooming, daily standups, and retrospective templates.', 'Scrum_Guide_2026.pdf', 'application/pdf', '1.8 MB'),
      ('${crypto.randomUUID()}', '${SEED_IDS.CLS_4}', '${SEED_IDS.COURSE_425}', 'A* Search Algorithm Python Notebook', 'Interactive Python code implementing A* search with heuristic visualization.', 'A_Star_Search_Implementation.ipynb', 'application/json', '520 KB')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 17. Class Reschedules & Teacher Swaps
    await client.query(`
      INSERT INTO class_reschedules (
        id, classroom_id, request_type, requested_by_teacher_id, target_teacher_id,
        original_date, original_time, new_date, new_start_time, new_end_time, new_room, reason, status
      ) VALUES
      ('${crypto.randomUUID()}', '${SEED_IDS.CLS_1}', 'Reschedule', '${SEED_IDS.TEACHER_1}', NULL, '2026-10-12', '10:00 AM - 11:30 AM', '2026-10-15', '03:00 PM', '04:30 PM', 'Room 402, Bldg C', 'Department Faculty Meeting Conflict', 'Approved'),
      ('${crypto.randomUUID()}', '${SEED_IDS.CLS_2}', 'Swap', '${SEED_IDS.TEACHER_1}', '${SEED_IDS.TEACHER_2}', '2026-10-14', '02:00 PM - 03:30 PM', '2026-10-16', '10:00 AM', '11:30 AM', 'Room 305, Bldg A', 'Requested slot exchange for conference attendance', 'Pending')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 17. Seed Student Transcripts
    await seedStudentTranscripts(client);

    await client.query("COMMIT");
    console.log("Full realistic demo data populated with authentic complex GUIDs successfully in PostgreSQL!");
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
    { id: SEED_IDS.COURSE_101, semester: "Semester 1" },
    { id: SEED_IDS.COURSE_102, semester: "Semester 1" },
    { id: SEED_IDS.COURSE_103, semester: "Semester 1" },
    { id: SEED_IDS.COURSE_104, semester: "Semester 1" },
    { id: SEED_IDS.COURSE_201, semester: "Semester 2" },
    { id: SEED_IDS.COURSE_202, semester: "Semester 2" },
    { id: SEED_IDS.COURSE_203, semester: "Semester 2" },
    { id: SEED_IDS.COURSE_204, semester: "Semester 2" },
    { id: SEED_IDS.COURSE_301, semester: "Semester 3" },
    { id: SEED_IDS.COURSE_302, semester: "Semester 3" },
    { id: SEED_IDS.COURSE_303, semester: "Semester 3" },
    { id: SEED_IDS.COURSE_304, semester: "Semester 3" },
    { id: SEED_IDS.COURSE_305, semester: "Semester 4" },
    { id: SEED_IDS.COURSE_306, semester: "Semester 4" },
    { id: SEED_IDS.COURSE_401, semester: "Semester 4" },
    { id: SEED_IDS.COURSE_402, semester: "Semester 4" },
    { id: SEED_IDS.COURSE_412, semester: "Semester 5" },
    { id: SEED_IDS.COURSE_425, semester: "Semester 5" },
    { id: SEED_IDS.COURSE_426, semester: "Semester 5" },
    { id: SEED_IDS.COURSE_499, semester: "Semester 5" },
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
      const trId = crypto.randomUUID();
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
        ON CONFLICT (student_id, course_id) DO UPDATE SET
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
  resetAndSeedInitialData().then(() => {
    console.log("Database reset, re-seeded with authentic complex GUID keys and ready.");
    process.exit(0);
  }).catch((err) => {
    console.error("Initialization failed:", err);
    process.exit(1);
  });
}

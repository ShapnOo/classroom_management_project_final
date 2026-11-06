import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { pool } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Standard authentic UUID v4 definitions for core seed entities
export const SEED_IDS = {
  // Programs (Top-Level Academic Degrees & Schools across the University) - 12 Programs
  PROG_BSC_CS:  "70b58daf-cae1-4e39-b58b-943cd1e45912",
  PROG_BSC_SWE: "11111111-0000-4000-8000-000000000001",
  PROG_BSC_EEE: "11111111-0000-4000-8000-000000000002",
  PROG_BBA:     "11111111-0000-4000-8000-000000000003",
  PROG_PHARM:   "11111111-0000-4000-8000-000000000004",
  PROG_BGE:     "11111111-0000-4000-8000-000000000005",
  PROG_BSC_MTH: "1ae5de70-3136-4c3c-85e7-de7f2ce5d58b",
  PROG_BSC_PHY: "11111111-0000-4000-8000-000000000006",
  PROG_ECON:    "11111111-0000-4000-8000-000000000007",
  PROG_ENG:     "11111111-0000-4000-8000-000000000008",
  PROG_LAW:     "11111111-0000-4000-8000-000000000009",
  PROG_PGDIT:   "7a3bcad5-44d5-4ea7-b510-ea234cfd8fa0",

  // Departments (Under Programs) - 15 Departments
  DEPT_CSE:   "114914b4-ff80-48d7-8290-ac7ea3cbdfaf",
  DEPT_SWE:   "22222222-0000-4000-8000-000000000001",
  DEPT_EEE:   "22222222-0000-4000-8000-000000000002",
  DEPT_FIN:   "22222222-0000-4000-8000-000000000003",
  DEPT_MKT:   "22222222-0000-4000-8000-000000000004",
  DEPT_PHARM: "22222222-0000-4000-8000-000000000005",
  DEPT_BGE:   "22222222-0000-4000-8000-000000000006",
  DEPT_MTH:   "654cc707-b3fc-4428-8bfa-cf0024263142",
  DEPT_PHY:   "9f895bcd-bd98-4624-abda-37a22111a378",
  DEPT_CHEM:  "22222222-0000-4000-8000-000000000007",
  DEPT_ECON:  "22222222-0000-4000-8000-000000000008",
  DEPT_ENG:   "22222222-0000-4000-8000-000000000009",
  DEPT_LAW:   "22222222-0000-4000-8000-000000000010",
  DEPT_BMB:   "22222222-0000-4000-8000-000000000011",
  DEPT_IIT:   "22222222-0000-4000-8000-000000000012",

  // Academic Sessions
  SES_SPRING_2026: "59d346bc-a55c-490f-ba0a-69ce85ec3063",
  SES_FALL_2025:   "c088b44a-a372-4953-9e86-bdb8739ed659",
  SES_SPRING_2025: "f1dece0c-a017-48b3-9422-1cc1ada34271",
  SES_FALL_2024:   "33333333-0000-4000-8000-000000000001",
  SES_SPRING_2024: "33333333-0000-4000-8000-000000000002",

  // Exactly 5 Batches
  BATCH_SP26_A: "98b7201d-f795-4069-9229-42117595fb3f", // Batch 52 (Session 2025-2026) — 1st Year (Semester 1)
  BATCH_FA25_A: "1bb542f2-202b-4bb7-af5a-0546e2b18407", // Batch 51 (Session 2024-2025) — 2nd Year (Semester 3)
  BATCH_SP25_A: "c4ce1ed1-879d-4b4e-a877-da2b376aae1d", // Batch 50 (Session 2023-2024) — 3rd Year (Semester 5)
  BATCH_FA24_A: "35144c16-c129-4702-ac46-ed049860ae43", // Batch 49 (Session 2022-2023) — 4th Year (Semester 7)
  BATCH_SP24_A: "e5a31b28-4848-4848-8848-que484848484", // Batch 48 (Session 2021-2022) — Final Year (Semester 8)

  // Admins
  ADMIN_1: "fc09a540-73c3-4809-9da9-4562372bd0cf",

  // Exactly 3 Teachers
  TEACHER_1: "1a3f6e61-2a04-4f91-9897-1f97b99604c5", // Prof. Dr. Shamim Al Mamun
  TEACHER_2: "61fbef9f-b9b2-49f8-bcf3-53f10d69ff9c", // Prof. Dr. Risala Tasin Khan
  TEACHER_3: "3209ab89-4eec-423c-9e3b-1adacfa1996b", // Prof. Dr. Mohammad Shahidul Islam

  // Classrooms
  CLS_1: "9f33d641-11fd-4ad1-812f-ec032f67ec4b",
  CLS_2: "5bc205fe-5187-4816-9faf-b1ed01ebc92e",
  CLS_3: "94592bc8-2f7a-4636-bb7c-d7b61ca094bd",
  CLS_4: "93e8e4e0-76ed-429d-ba4a-059130ad2310",
  CLS_5: "68bd42f0-6161-4a90-896e-412f6574da93",
  CLS_6: "66666666-0000-4000-8000-000000000006",

  // Core Courses across 8 Semesters
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
  console.log("Checking and initializing PostgreSQL Database Schema...");
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
      ALTER TABLE students ADD COLUMN IF NOT EXISTS profile_info JSONB DEFAULT '{}'::jsonb;
      ALTER TABLE students ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'Pending Verification';
      ALTER TABLE students ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;
      ALTER TABLE students ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMP WITH TIME ZONE;
      ALTER TABLE students ADD COLUMN IF NOT EXISTS father_name VARCHAR(255);
      ALTER TABLE students ADD COLUMN IF NOT EXISTS mother_name VARCHAR(255);
      ALTER TABLE students ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10);
      ALTER TABLE students ADD COLUMN IF NOT EXISTS dob DATE;
      ALTER TABLE students ADD COLUMN IF NOT EXISTS address TEXT;
      ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(50);
      ALTER TABLE students ADD COLUMN IF NOT EXISTS nid_birth_cert VARCHAR(100);

      CREATE TABLE IF NOT EXISTS student_otps (
        id VARCHAR(64) PRIMARY KEY,
        student_id VARCHAR(64) REFERENCES students(id) ON DELETE CASCADE,
        otp VARCHAR(10) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE course_materials ADD COLUMN IF NOT EXISTS last_slide INT DEFAULT 1;
      ALTER TABLE course_materials ADD COLUMN IF NOT EXISTS total_slides INT DEFAULT 1;

      CREATE TABLE IF NOT EXISTS material_slide_states (
        id VARCHAR(64) PRIMARY KEY,
        material_id VARCHAR(64) NOT NULL,
        classroom_id VARCHAR(64),
        teacher_id VARCHAR(64),
        last_slide INT NOT NULL DEFAULT 1,
        total_slides INT NOT NULL DEFAULT 1,
        material_title VARCHAR(255),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_material_deck UNIQUE(material_id)
      );

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
      CREATE INDEX IF NOT EXISTS idx_material_slide_states_mat ON material_slide_states(material_id);
      CREATE INDEX IF NOT EXISTS idx_student_transcripts_student ON student_transcripts(student_id);
      CREATE INDEX IF NOT EXISTS idx_student_transcripts_course ON student_transcripts(course_id);
      CREATE INDEX IF NOT EXISTS idx_student_transcripts_semester ON student_transcripts(semester);
      CREATE INDEX IF NOT EXISTS idx_students_batch ON students(batch_id);
      CREATE INDEX IF NOT EXISTS idx_classrooms_batch ON classrooms(batch_id);
      CREATE INDEX IF NOT EXISTS idx_grade_records_student ON grade_records(student_id);
      CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON attendance_records(student_id);

      ALTER TABLE courses ADD COLUMN IF NOT EXISTS semester VARCHAR(50) DEFAULT 'Semester 1';
      ALTER TABLE classrooms ADD COLUMN IF NOT EXISTS semester VARCHAR(50);
    `);
    console.log("Database schema & performance indexes verified successfully.");

    // Check student count to decide whether to reseed
    const { rows } = await pool.query("SELECT COUNT(*)::int as count FROM students");
    if (rows.length === 0 || rows[0].count !== 100) {
      console.log(`Current student count (${rows[0]?.count || 0}) is not exactly 100. Seeding clean production dataset...`);
      await resetAndSeedInitialData();
    } else {
      console.log("Database already contains exactly 100 verified students.");
    }
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}

// 100 Realistic Student Profiles
const REAL_STUDENT_NAMES = [
  // 1-20 (Batch 52 / SP26-A)
  "Abdur Rahman", "Ayesha Siddiqa", "Mahmudul Hasan", "Nusrat Jahan", "Kamrul Islam",
  "Fatema Begum", "Rakibul Hasan", "Jannatul Ferdous", "Mehedi Hasan", "Sanjida Akter",
  "Tariqul Islam", "Sumaiya Akter", "Ariful Islam", "Sadia Afrin", "Nazmul Huda",
  "Farhana Akter", "Imran Hossain", "Tania Rahman", "Rubel Hossain", "Tahmina Akter",

  // 21-40 (Batch 51 / FA25-A)
  "Sajedur Rahman", "Ruma Akter", "Samiul Islam", "Mim Akter", "Rashedul Islam",
  "Tisha Rahman", "Faisal Ahmed", "Shirin Akter", "Habibur Rahman", "Salma Khatun",
  "Ashraful Islam", "Priyanka Roy", "Robiul Islam", "Lima Akter", "Saddam Hossain",
  "Sraboni Das", "Zahid Hasan", "Mitu Akter", "Al Amin", "Sharmin Sultana",

  // 41-60 (Batch 50 / SP25-A)
  "Tanvir Ahmed", "Nadia Islam", "Shakil Khan", "Afroza Sultana", "Kazi Fahim",
  "Sabrina Rahman", "Asif Mahmud", "Rumana Yesmin", "Shahriar Kabir", "Naznin Nahar",
  "Mustafizur Rahman", "Fariha Tasnim", "Anisur Rahman", "Shamima Nasrin", "Golam Kibria",
  "Mst. Rokeya Begum", "Hasanuzzaman", "Suraiya Parvin", "Monir Hossain", "Nafisa Tabassum",

  // 61-80 (Batch 49 / FA24-A)
  "Shahidul Alam", "Israt Jahan", "Rezaul Karim", "Farzana Yeasmin", "Mahbubur Rahman",
  "Tasnim Fatima", "Sayedur Rahman", "Khadija Tul Kobra", "Saiful Islam", "Mahfuza Khatun",
  "Nasir Uddin", "Sharmin Nahar", "Delwar Hossain", "Dilruba Akter", "Shafiqul Islam",
  "Afsana Mimi", "Enamul Haque", "Zinat Ara", "Mokhlesur Rahman", "Taslima Nasrin",

  // 81-100 (Batch 48 / SP24-A)
  "Kawsar Ahmed", "Shabnam Mustari", "Ziaur Rahman", "Tahmina Chowdhury", "Nurul Islam",
  "Hasina Akter", "Mizanur Rahman", "Pervin Sultana", "Jahangir Alam", "Shila Akter",
  "Moshiur Rahman", "Nazma Begum", "Shahed Ali", "Rowshan Ara", "Azizul Haque",
  "Selina Hossain", "Lutfur Rahman", "Anwara Begum", "Mahfuz Ahmed", "Farida Parvin"
];

const BANGLADESH_DISTRICTS = [
  "Mirpur, Dhaka-1216", "Uttara, Dhaka-1230", "Dhanmondi, Dhaka-1209", "Savar, Dhaka-1342",
  "Agrabad, Chittagong-4100", "GEC Circle, Chittagong-4000", "Zindabazar, Sylhet-3100",
  "Shaheb Bazar, Rajshahi-6000", "Boyra, Khulna-9000", "Sadar Road, Barisal-8200",
  "Kachari Bazar, Rangpur-5400", "Ganginar Par, Mymensingh-2200", "Kandirpar, Comilla-3500",
  "Chashara, Narayanganj-1400", "College Road, Gazipur-1700", "Court Road, Kushtia-7000",
  "New Market, Bogra-5800", "Station Road, Jessore-7400", "Boro Bazar, Tangail-1900", "Purana Paltan, Dhaka-1000"
];

const BLOOD_GROUPS = ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB+"];

export async function resetAndSeedInitialData() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    console.log("Purging all previous garbage/test data from scholaris_db...");

    await client.query(`
      TRUNCATE TABLE 
        material_slide_states,
        assignment_submissions,
        student_transcripts,
        attendance_records,
        class_sessions,
        grade_records,
        assignments,
        tests,
        class_reschedules,
        class_schedules,
        classrooms,
        syllabus_topics,
        course_materials,
        courses,
        student_otps,
        batch_promotion_logs,
        announcements,
        students,
        teachers,
        admins,
        users,
        batches,
        academic_sessions,
        departments,
        programs,
        app_settings
      CASCADE;
    `);

    // 0. App Settings
    await client.query(`
      INSERT INTO app_settings (id, school_name, logo_base64)
      VALUES ('default', 'Jahangirnagar University', '')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 1. Programs (All Top-Level Academic Programs / Faculties of the University)
    await client.query(`
      INSERT INTO programs (id, name, code, duration) VALUES
      ('${SEED_IDS.PROG_BSC_CS}',  'B.Sc. in Computer Science & Engineering', 'CSE',   '4 Years'),
      ('${SEED_IDS.PROG_BSC_SWE}', 'B.Sc. in Software Engineering',           'SWE',   '4 Years'),
      ('${SEED_IDS.PROG_BSC_EEE}', 'B.Sc. in Electrical & Electronic Engineering', 'EEE', '4 Years'),
      ('${SEED_IDS.PROG_BBA}',     'Bachelor of Business Administration (BBA)', 'BBA', '4 Years'),
      ('${SEED_IDS.PROG_PHARM}',   'B.Sc. in Pharmacy',                       'PHARM', '4 Years'),
      ('${SEED_IDS.PROG_BGE}',     'B.Sc. in Biotechnology & Genetic Engineering', 'BGE', '4 Years'),
      ('${SEED_IDS.PROG_BSC_MTH}', 'B.Sc. (Honours) in Mathematics',          'MATH',  '4 Years'),
      ('${SEED_IDS.PROG_BSC_PHY}', 'B.Sc. (Honours) in Physics',              'PHY',   '4 Years'),
      ('${SEED_IDS.PROG_ECON}',    'B.S.S. in Economics',                     'ECON',  '4 Years'),
      ('${SEED_IDS.PROG_ENG}',     'B.A. (Honours) in English Literature',    'ENG',   '4 Years'),
      ('${SEED_IDS.PROG_LAW}',     'LL.B. (Honours) in Law & Justice',        'LAW',   '4 Years'),
      ('${SEED_IDS.PROG_PGDIT}',   'Postgraduate Diploma in Information Technology', 'PGDIT', '1 Year')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 2. Departments under Programs
    await client.query(`
      INSERT INTO departments (id, program_id, name, code) VALUES
      ('${SEED_IDS.DEPT_CSE}',   '${SEED_IDS.PROG_BSC_CS}',  'Department of Computer Science & Engineering', 'CSE'),
      ('${SEED_IDS.DEPT_SWE}',   '${SEED_IDS.PROG_BSC_SWE}', 'Department of Software Engineering',           'SWE'),
      ('${SEED_IDS.DEPT_EEE}',   '${SEED_IDS.PROG_BSC_EEE}', 'Department of Electrical & Electronic Eng.',   'EEE'),
      ('${SEED_IDS.DEPT_FIN}',   '${SEED_IDS.PROG_BBA}',     'Department of Finance & Banking',               'FIN'),
      ('${SEED_IDS.DEPT_MKT}',   '${SEED_IDS.PROG_BBA}',     'Department of Marketing',                       'MKT'),
      ('${SEED_IDS.DEPT_PHARM}', '${SEED_IDS.PROG_PHARM}',   'Department of Pharmacy',                        'PHARM'),
      ('${SEED_IDS.DEPT_BGE}',   '${SEED_IDS.PROG_BGE}',     'Department of Biotechnology & Genetic Eng.',    'BGE'),
      ('${SEED_IDS.DEPT_MTH}',   '${SEED_IDS.PROG_BSC_MTH}', 'Department of Mathematics',                    'MTH'),
      ('${SEED_IDS.DEPT_PHY}',   '${SEED_IDS.PROG_BSC_PHY}', 'Department of Physics',                        'PHY'),
      ('${SEED_IDS.DEPT_CHEM}',  '${SEED_IDS.PROG_BSC_MTH}', 'Department of Chemistry',                      'CHEM'),
      ('${SEED_IDS.DEPT_ECON}',  '${SEED_IDS.PROG_ECON}',    'Department of Economics',                       'ECON'),
      ('${SEED_IDS.DEPT_ENG}',   '${SEED_IDS.PROG_ENG}',     'Department of English',                         'ENG'),
      ('${SEED_IDS.DEPT_LAW}',   '${SEED_IDS.PROG_LAW}',     'Department of Law & Justice',                   'LAW'),
      ('${SEED_IDS.DEPT_BMB}',   '${SEED_IDS.PROG_BGE}',     'Department of Biochemistry & Molecular Biology','BMB'),
      ('${SEED_IDS.DEPT_IIT}',   '${SEED_IDS.PROG_PGDIT}',   'Institute of Information Technology (IIT)',     'IIT')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 3. Academic Sessions
    await client.query(`
      INSERT INTO academic_sessions (id, name, start_date, end_date, status) VALUES
      ('${SEED_IDS.SES_SPRING_2026}', 'Spring 2026', '2026-01-15', '2026-05-31', 'Active'),
      ('${SEED_IDS.SES_FALL_2025}',   'Fall 2025',   '2025-08-15', '2025-12-31', 'Completed'),
      ('${SEED_IDS.SES_SPRING_2025}', 'Spring 2025', '2025-01-15', '2025-05-31', 'Completed'),
      ('${SEED_IDS.SES_FALL_2024}',   'Fall 2024',   '2024-08-15', '2024-12-31', 'Completed'),
      ('${SEED_IDS.SES_SPRING_2024}', 'Spring 2024', '2024-01-15', '2024-05-31', 'Completed')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 4. Exactly 5 Batches across Cohorts
    await client.query(`
      INSERT INTO batches (id, code, name, program_id, session_id, section, status, semester_count) VALUES
      ('${SEED_IDS.BATCH_SP26_A}', 'SP26-A', 'Batch 52 (Session 2025-2026) — Section A', '${SEED_IDS.PROG_BSC_CS}', '${SEED_IDS.SES_SPRING_2026}', 'A', 'Active', 8),
      ('${SEED_IDS.BATCH_FA25_A}', 'FA25-A', 'Batch 51 (Session 2024-2025) — Section A', '${SEED_IDS.PROG_BSC_CS}', '${SEED_IDS.SES_FALL_2025}',   'A', 'Active', 8),
      ('${SEED_IDS.BATCH_SP25_A}', 'SP25-A', 'Batch 50 (Session 2023-2024) — Section A', '${SEED_IDS.PROG_BSC_CS}', '${SEED_IDS.SES_SPRING_2025}', 'A', 'Active', 8),
      ('${SEED_IDS.BATCH_FA24_A}', 'FA24-A', 'Batch 49 (Session 2022-2023) — Section A', '${SEED_IDS.PROG_BSC_CS}', '${SEED_IDS.SES_FALL_2024}',   'A', 'Active', 8),
      ('${SEED_IDS.BATCH_SP24_A}', 'SP24-A', 'Batch 48 (Session 2021-2022) — Section A', '${SEED_IDS.PROG_BSC_CS}', '${SEED_IDS.SES_SPRING_2024}', 'A', 'Active', 8)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 5. Admin (1 Super Admin)
    await client.query(`
      INSERT INTO users (id, name, email, password_hash, role) VALUES
      ('${SEED_IDS.ADMIN_1}', 'System Admin', 'admin@edu', 'admin123', 'admin')
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO admins (id, name, email, role) VALUES
      ('${SEED_IDS.ADMIN_1}', 'System Admin', 'admin@edu', 'Super Admin')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 6. Exactly 3 Teachers
    await client.query(`
      INSERT INTO users (id, name, email, password_hash, role) VALUES
      ('${SEED_IDS.TEACHER_1}', 'Prof. Dr. Shamim Al Mamun',         'sam@juniv.edu',      'teacher123', 'teacher'),
      ('${SEED_IDS.TEACHER_2}', 'Prof. Dr. Risala Tasin Khan',        'rtkhan@juniv.edu',   'teacher123', 'teacher'),
      ('${SEED_IDS.TEACHER_3}', 'Prof. Dr. Mohammad Shahidul Islam',  'shahidul@juniv.edu', 'teacher123', 'teacher')
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO teachers (id, name, email, department_id, designation) VALUES
      ('${SEED_IDS.TEACHER_1}', 'Prof. Dr. Shamim Al Mamun',        'sam@juniv.edu',      '${SEED_IDS.DEPT_CSE}', 'Professor & Chairman'),
      ('${SEED_IDS.TEACHER_2}', 'Prof. Dr. Risala Tasin Khan',       'rtkhan@juniv.edu',   '${SEED_IDS.DEPT_CSE}', 'Professor'),
      ('${SEED_IDS.TEACHER_3}', 'Prof. Dr. Mohammad Shahidul Islam', 'shahidul@juniv.edu', '${SEED_IDS.DEPT_CSE}', 'Professor & Director, IIT')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 7. Exactly 100 Students across the 5 Batches (20 students per batch)
    const batchesConfig = [
      { id: SEED_IDS.BATCH_SP26_A, prefix: "SP26A", startIdx: 0,  count: 20, isFreshAdmission: true  }, // Batch 52 (Freshers)
      { id: SEED_IDS.BATCH_FA25_A, prefix: "FA25A", startIdx: 20, count: 20, isFreshAdmission: false }, // Batch 51 (2nd Year)
      { id: SEED_IDS.BATCH_SP25_A, prefix: "SP25A", startIdx: 40, count: 20, isFreshAdmission: false }, // Batch 50 (3rd Year)
      { id: SEED_IDS.BATCH_FA24_A, prefix: "FA24A", startIdx: 60, count: 20, isFreshAdmission: false }, // Batch 49 (4th Year)
      { id: SEED_IDS.BATCH_SP24_A, prefix: "SP24A", startIdx: 80, count: 20, isFreshAdmission: false }, // Batch 48 (Final Year)
    ];

    const studentIdsList: string[] = [];

    for (const b of batchesConfig) {
      for (let i = 1; i <= b.count; i++) {
        const globalIdx = b.startIdx + (i - 1);
        const studentId = crypto.randomUUID();
        studentIdsList.push(studentId);

        const rollNo = `${b.prefix}${String(i).padStart(3, "0")}`;
        const name = REAL_STUDENT_NAMES[globalIdx];
        const email = `${b.prefix.toLowerCase()}${i}@edu`;
        const phone = `0171${String(1000000 + (globalIdx + 1) * 38271).slice(0, 7)}`;
        const fatherName = `Md. ${name.split(" ")[0]} Senior`;
        const motherName = `Begum ${name.split(" ")[0]} Begum`;
        const bloodGroup = BLOOD_GROUPS[globalIdx % BLOOD_GROUPS.length];
        const birthYear = 2002 + Math.floor(globalIdx / 25);
        const dob = `${birthYear}-0${(globalIdx % 9) + 1}-15`;
        const address = `${BANGLADESH_DISTRICTS[globalIdx % BANGLADESH_DISTRICTS.length]}`;
        const emergencyContact = `0181${String(1000000 + (globalIdx + 2) * 58219).slice(0, 7)}`;
        const nidBirthCert = `199${birthYear}${String(1000000000 + globalIdx * 827361).slice(1)}`;

        // Fresh admission testing: Candidate SP26A001 and first 10 freshers are pending onboarding/verification
        // This allows authentic live demonstration of /onboarding
        let verificationStatus = "Verified";
        let status = "Active";
        let onboardedAt: string | null = "2026-01-10T10:00:00Z";

        if (b.isFreshAdmission && i <= 10) {
          verificationStatus = "Pending Verification";
          status = "Pending";
          onboardedAt = null;
        }

        await client.query(
          `INSERT INTO users (id, name, email, password_hash, role)
           VALUES ($1, $2, $3, 'student123', 'student')
           ON CONFLICT (id) DO NOTHING`,
          [studentId, name, email]
        );

        await client.query(
          `INSERT INTO students (
             id, roll_no, name, email, batch_id, phone,
             father_name, mother_name, blood_group, dob, address,
             emergency_contact, nid_birth_cert, verification_status, status, onboarded_at
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
           ON CONFLICT (id) DO NOTHING`,
          [
            studentId, rollNo, name, email, b.id, phone,
            fatherName, motherName, bloodGroup, dob, address,
            emergencyContact, nidBirthCert, verificationStatus, status, onboardedAt
          ]
        );
      }
    }

    console.log("Exactly 100 authentic university students seeded across 5 batches.");

    // 8. University Courses across Semesters 1 to 8 (from the very beginning)
    const coursesData = [
      // Semester 1 (1st Year, 1st Term)
      { id: SEED_IDS.COURSE_101, code: 'CSE-101', title: 'Structured Programming Language', program_id: SEED_IDS.PROG_BSC_CS, credits: 3.0, semester: 'Semester 1' },
      { id: SEED_IDS.COURSE_102, code: 'CSE-102', title: 'Structured Programming Lab',      program_id: SEED_IDS.PROG_BSC_CS, credits: 1.5, semester: 'Semester 1' },
      { id: SEED_IDS.COURSE_103, code: 'CSE-103', title: 'Discrete Mathematics',            program_id: SEED_IDS.PROG_BSC_CS, credits: 3.0, semester: 'Semester 1' },
      { id: SEED_IDS.COURSE_104, code: 'CSE-104', title: 'Electrical Circuits & Electronics', program_id: SEED_IDS.PROG_BSC_CS, credits: 3.0, semester: 'Semester 1' },

      // Semester 2 (1st Year, 2nd Term)
      { id: SEED_IDS.COURSE_201, code: 'CSE-201', title: 'Data Structures & Algorithms',     program_id: SEED_IDS.PROG_BSC_CS, credits: 3.0, semester: 'Semester 2' },
      { id: SEED_IDS.COURSE_202, code: 'CSE-202', title: 'Data Structures Lab',             program_id: SEED_IDS.PROG_BSC_CS, credits: 1.5, semester: 'Semester 2' },
      { id: SEED_IDS.COURSE_203, code: 'CSE-203', title: 'Object Oriented Programming',     program_id: SEED_IDS.PROG_BSC_CS, credits: 3.0, semester: 'Semester 2' },
      { id: SEED_IDS.COURSE_204, code: 'CSE-204', title: 'Object Oriented Programming Lab', program_id: SEED_IDS.PROG_BSC_CS, credits: 1.5, semester: 'Semester 2' },

      // Semester 3 (2nd Year, 1st Term)
      { id: SEED_IDS.COURSE_301, code: 'CSE-301', title: 'Algorithm Analysis & Design',     program_id: SEED_IDS.PROG_BSC_CS, credits: 3.0, semester: 'Semester 3' },
      { id: SEED_IDS.COURSE_302, code: 'CSE-302', title: 'Algorithm Design Lab',            program_id: SEED_IDS.PROG_BSC_CS, credits: 1.5, semester: 'Semester 3' },
      { id: SEED_IDS.COURSE_303, code: 'CSE-303', title: 'Digital Logic & Architecture',    program_id: SEED_IDS.PROG_BSC_CS, credits: 3.0, semester: 'Semester 3' },
      { id: SEED_IDS.COURSE_304, code: 'CSE-304', title: 'Linear Algebra & Calculus',       program_id: SEED_IDS.PROG_BSC_CS, credits: 3.0, semester: 'Semester 3' },

      // Semester 4 (2nd Year, 2nd Term)
      { id: SEED_IDS.COURSE_305, code: 'CSE-305', title: 'Database Management Systems',      program_id: SEED_IDS.PROG_BSC_CS, credits: 3.0, semester: 'Semester 4' },
      { id: SEED_IDS.COURSE_306, code: 'CSE-306', title: 'Database Management Systems Lab',  program_id: SEED_IDS.PROG_BSC_CS, credits: 1.5, semester: 'Semester 4' },
      { id: crypto.randomUUID(),  code: 'CSE-307', title: 'Theory of Computation & Automata', program_id: SEED_IDS.PROG_BSC_CS, credits: 3.0, semester: 'Semester 4' },
      { id: crypto.randomUUID(),  code: 'CSE-308', title: 'Operating Systems & System Calls', program_id: SEED_IDS.PROG_BSC_CS, credits: 3.0, semester: 'Semester 4' },

      // Semester 5 (3rd Year, 1st Term)
      { id: SEED_IDS.COURSE_401, code: 'CSE-401', title: 'Computer Networks & Protocols',    program_id: SEED_IDS.PROG_BSC_CS, credits: 3.0, semester: 'Semester 5' },
      { id: SEED_IDS.COURSE_402, code: 'CSE-402', title: 'Computer Networks Lab',            program_id: SEED_IDS.PROG_BSC_CS, credits: 1.5, semester: 'Semester 5' },
      { id: crypto.randomUUID(),  code: 'CSE-403', title: 'Microprocessors & Interfacing',    program_id: SEED_IDS.PROG_BSC_CS, credits: 3.0, semester: 'Semester 5' },
      { id: crypto.randomUUID(),  code: 'CSE-405', title: 'Software Engineering Principles',  program_id: SEED_IDS.PROG_BSC_CS, credits: 3.0, semester: 'Semester 5' },

      // Semester 6 (3rd Year, 2nd Term)
      { id: SEED_IDS.COURSE_412, code: 'CSE-412', title: 'Software Architecture & Cloud Design', program_id: SEED_IDS.PROG_BSC_CS, credits: 3.0, semester: 'Semester 6' },
      { id: crypto.randomUUID(),  code: 'CSE-413', title: 'Software Architecture Lab',       program_id: SEED_IDS.PROG_BSC_CS, credits: 1.5, semester: 'Semester 6' },
      { id: crypto.randomUUID(),  code: 'CSE-414', title: 'Compiler Design & Construction',   program_id: SEED_IDS.PROG_BSC_CS, credits: 3.0, semester: 'Semester 6' },
      { id: crypto.randomUUID(),  code: 'CSE-416', title: 'Web Engineering & Microservices',  program_id: SEED_IDS.PROG_BSC_CS, credits: 3.0, semester: 'Semester 6' },

      // Semester 7 (4th Year, 1st Term)
      { id: SEED_IDS.COURSE_425, code: 'CSE-425', title: 'Artificial Intelligence & Machine Learning', program_id: SEED_IDS.PROG_BSC_CS, credits: 3.0, semester: 'Semester 7' },
      { id: SEED_IDS.COURSE_426, code: 'CSE-426', title: 'Artificial Intelligence Lab',       program_id: SEED_IDS.PROG_BSC_CS, credits: 1.5, semester: 'Semester 7' },
      { id: crypto.randomUUID(),  code: 'CSE-427', title: 'Information Security & Cryptography', program_id: SEED_IDS.PROG_BSC_CS, credits: 3.0, semester: 'Semester 7' },
      { id: crypto.randomUUID(),  code: 'CSE-490', title: 'Undergraduate Research Methodology', program_id: SEED_IDS.PROG_BSC_CS, credits: 2.0, semester: 'Semester 7' },

      // Semester 8 (4th Year, 2nd Term)
      { id: crypto.randomUUID(),  code: 'CSE-431', title: 'Distributed Computing & Big Data',  program_id: SEED_IDS.PROG_BSC_CS, credits: 3.0, semester: 'Semester 8' },
      { id: crypto.randomUUID(),  code: 'CSE-432', title: 'Computer Graphics & Visualization', program_id: SEED_IDS.PROG_BSC_CS, credits: 3.0, semester: 'Semester 8' },
      { id: SEED_IDS.COURSE_499, code: 'CSE-499', title: 'Senior Capstone Thesis & Project',   program_id: SEED_IDS.PROG_BSC_CS, credits: 6.0, semester: 'Semester 8' }
    ];

    for (const c of coursesData) {
      await client.query(`
        INSERT INTO courses (id, code, title, program_id, credits, semester)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, credits = EXCLUDED.credits, semester = EXCLUDED.semester;
      `, [c.id, c.code, c.title, c.program_id, c.credits, c.semester]);
    }

    // 9. Classrooms (Assigned across the 3 Teachers and Batches)
    await client.query(`
      INSERT INTO classrooms (id, course_id, batch_id, teacher_id, room, start_date, end_date, status, classes_completed, total_classes, color_index, semester) VALUES
      ('${SEED_IDS.CLS_1}', '${SEED_IDS.COURSE_101}', '${SEED_IDS.BATCH_SP26_A}', '${SEED_IDS.TEACHER_1}', 'Room 402, Academic Bldg 1', '2026-01-15', '2026-05-20', 'ongoing', 12, 24, 0, 'Semester 1'),
      ('${SEED_IDS.CLS_2}', '${SEED_IDS.COURSE_305}', '${SEED_IDS.BATCH_SP25_A}', '${SEED_IDS.TEACHER_1}', 'Room 305, IT Bldg',          '2026-01-15', '2026-05-20', 'ongoing', 18, 26, 1, 'Semester 4'),
      ('${SEED_IDS.CLS_3}', '${SEED_IDS.COURSE_201}', '${SEED_IDS.BATCH_FA25_A}', '${SEED_IDS.TEACHER_2}', 'Room 201, Academic Bldg 2', '2026-01-16', '2026-05-22', 'ongoing', 14, 24, 2, 'Semester 2'),
      ('${SEED_IDS.CLS_4}', '${SEED_IDS.COURSE_412}', '${SEED_IDS.BATCH_FA24_A}', '${SEED_IDS.TEACHER_2}', 'Lab 3, Computer Center',    '2026-01-16', '2026-05-22', 'ongoing', 16, 24, 3, 'Semester 6'),
      ('${SEED_IDS.CLS_5}', '${SEED_IDS.COURSE_425}', '${SEED_IDS.BATCH_FA24_A}', '${SEED_IDS.TEACHER_3}', 'AI Research Lab, IIT',      '2026-01-15', '2026-05-20', 'ongoing', 10, 24, 4, 'Semester 7'),
      ('${SEED_IDS.CLS_6}', '${SEED_IDS.COURSE_499}', '${SEED_IDS.BATCH_SP24_A}', '${SEED_IDS.TEACHER_3}', 'Conference Room 101',      '2026-01-15', '2026-05-20', 'ongoing', 20, 24, 5, 'Semester 8')
      ON CONFLICT (id) DO UPDATE SET semester = EXCLUDED.semester;
    `);

    // 10. Class Schedules
    await client.query(`
      INSERT INTO class_schedules (id, classroom_id, day, start_time, end_time, room) VALUES
      ('${crypto.randomUUID()}', '${SEED_IDS.CLS_1}', 'Monday',    '10:00 AM', '11:30 AM', 'Room 402, Academic Bldg 1'),
      ('${crypto.randomUUID()}', '${SEED_IDS.CLS_1}', 'Wednesday', '10:00 AM', '11:30 AM', 'Room 402, Academic Bldg 1'),
      ('${crypto.randomUUID()}', '${SEED_IDS.CLS_2}', 'Sunday',    '11:30 AM', '01:00 PM', 'Room 305, IT Bldg'),
      ('${crypto.randomUUID()}', '${SEED_IDS.CLS_2}', 'Tuesday',   '11:30 AM', '01:00 PM', 'Room 305, IT Bldg'),
      ('${crypto.randomUUID()}', '${SEED_IDS.CLS_3}', 'Sunday',    '09:30 AM', '11:00 AM', 'Room 201, Academic Bldg 2'),
      ('${crypto.randomUUID()}', '${SEED_IDS.CLS_3}', 'Tuesday',   '09:30 AM', '11:00 AM', 'Room 201, Academic Bldg 2'),
      ('${crypto.randomUUID()}', '${SEED_IDS.CLS_4}', 'Monday',    '02:00 PM', '03:30 PM', 'Lab 3, Computer Center'),
      ('${crypto.randomUUID()}', '${SEED_IDS.CLS_4}', 'Thursday',  '02:00 PM', '03:30 PM', 'Lab 3, Computer Center'),
      ('${crypto.randomUUID()}', '${SEED_IDS.CLS_5}', 'Wednesday', '02:00 PM', '03:30 PM', 'AI Research Lab, IIT'),
      ('${crypto.randomUUID()}', '${SEED_IDS.CLS_6}', 'Thursday',  '10:00 AM', '12:00 PM', 'Conference Room 101')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 11. Syllabus Topics
    const syllabusData = [
      { id: crypto.randomUUID(), course_id: SEED_IDS.COURSE_101, topic: 'Introduction to C & Variable Types', week: 1, sub_topics: ['Basic I/O', 'Data Types', 'Arithmetic Operators'], teacher_status: 'done', admin_status: 'Published' },
      { id: crypto.randomUUID(), course_id: SEED_IDS.COURSE_101, topic: 'Control Statements & Loops', week: 2, sub_topics: ['if-else', 'switch-case', 'while & for loops'], teacher_status: 'done', admin_status: 'Published' },
      { id: crypto.randomUUID(), course_id: SEED_IDS.COURSE_101, topic: 'Arrays & Pointer Fundamentals', week: 3, sub_topics: ['1D/2D Arrays', 'Pointer Arithmetic', 'Pass by Reference'], teacher_status: 'current', admin_status: 'Published' },
      { id: crypto.randomUUID(), course_id: SEED_IDS.COURSE_305, topic: 'Relational Model & SQL DDL/DML', week: 1, sub_topics: ['Relational Algebra', 'CREATE/ALTER', 'SELECT & Joins'], teacher_status: 'done', admin_status: 'Published' },
      { id: crypto.randomUUID(), course_id: SEED_IDS.COURSE_305, topic: 'Functional Dependencies & Normalization', week: 2, sub_topics: ['1NF, 2NF, 3NF', 'Boyce-Codd Normal Form', 'Lossless Joins'], teacher_status: 'done', admin_status: 'Published' },
      { id: crypto.randomUUID(), course_id: SEED_IDS.COURSE_305, topic: 'Indexing, B+ Trees & Transactions', week: 3, sub_topics: ['B+ Tree Indexing', 'ACID Properties', '2-Phase Locking'], teacher_status: 'current', admin_status: 'Published' },
      { id: crypto.randomUUID(), course_id: SEED_IDS.COURSE_412, topic: 'Microservices & Enterprise Architecture', week: 1, sub_topics: ['Monolith vs Microservices', 'API Gateway', 'CQRS & Event Sourcing'], teacher_status: 'done', admin_status: 'Published' },
      { id: crypto.randomUUID(), course_id: SEED_IDS.COURSE_425, topic: 'Heuristic Search & Admissible Cost', week: 1, sub_topics: ['A* Search', 'Manhattan Distance Heuristic', 'Graph Traversal'], teacher_status: 'done', admin_status: 'Published' }
    ];

    for (const s of syllabusData) {
      await client.query(`
        INSERT INTO syllabus_topics (id, course_id, topic, week, sub_topics, teacher_status, admin_status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO NOTHING;
      `, [s.id, s.course_id, s.topic, s.week, s.sub_topics, s.teacher_status, s.admin_status]);
    }

    // 12. Class Sessions & Attendance Records
    const activeClassrooms = [
      { id: SEED_IDS.CLS_1, batchId: SEED_IDS.BATCH_SP26_A, count: 20, sessions: 8 },
      { id: SEED_IDS.CLS_2, batchId: SEED_IDS.BATCH_SP25_A, count: 20, sessions: 10 },
      { id: SEED_IDS.CLS_3, batchId: SEED_IDS.BATCH_FA25_A, count: 20, sessions: 8 },
      { id: SEED_IDS.CLS_4, batchId: SEED_IDS.BATCH_FA24_A, count: 20, sessions: 10 },
      { id: SEED_IDS.CLS_5, batchId: SEED_IDS.BATCH_FA24_A, count: 20, sessions: 6 },
    ];

    for (const ac of activeClassrooms) {
      const { rows: batchStudents } = await client.query("SELECT id FROM students WHERE batch_id = $1", [ac.batchId]);
      for (let s = 1; s <= ac.sessions; s++) {
        const sessionId = crypto.randomUUID();
        const sessionDate = `2026-0${Math.min(4, Math.floor((s + 1) / 2))}-${String(10 + (s % 15)).padStart(2, "0")}T10:00:00Z`;

        await client.query(
          `INSERT INTO class_sessions (id, classroom_id, date, topic_covered, notes, duration)
           VALUES ($1, $2, $3, $4, $5, '1h 30m')
           ON CONFLICT (id) DO NOTHING`,
          [sessionId, ac.id, sessionDate, `Session ${s}: Core Academic Lecture & Lab Practicum`, `Delivered course topics and hands-on demonstrations for session ${s}`]
        );

        for (let st = 0; st < batchStudents.length; st++) {
          const studentId = batchStudents[st].id;
          const hash = (st * 13 + s * 7) % 100;
          const status = hash < 80 ? "present" : hash < 92 ? "late" : "absent";
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

    // 13. Assignments
    await client.query(`
      INSERT INTO assignments (id, classroom_id, title, description, due_date, total_marks, status, submissions) VALUES
      ('${SEED_IDS.ASGN_1}', '${SEED_IDS.CLS_1}', 'C Programming: Dynamic Memory & Pointers', 'Write robust C code to allocate dynamic memory for linked structures without memory leaks', '2026-03-25', 20, 'Active', 18),
      ('${SEED_IDS.ASGN_2}', '${SEED_IDS.CLS_2}', 'Enterprise Relational Schema Design', 'Design an enterprise ER diagram and normalize to 3NF for a hospital management database', '2026-03-28', 25, 'Active', 19),
      ('${SEED_IDS.ASGN_3}', '${SEED_IDS.CLS_3}', 'AVL Tree & Balanced BST Implementation', 'Implement left/right rotations and height balancing in C++ or Python', '2026-03-30', 20, 'Active', 17),
      ('${SEED_IDS.ASGN_4}', '${SEED_IDS.CLS_4}', 'Microservices & Event Broker Architecture', 'Design Docker-compose manifest and Redis pub/sub messaging topology', '2026-04-05', 25, 'Active', 16),
      ('${SEED_IDS.ASGN_5}', '${SEED_IDS.CLS_5}', 'A* Search & 8-Puzzle Heuristic Solver', 'Implement Manhattan distance heuristic state-space traversal', '2026-04-10', 20, 'Upcoming', 0)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 14. Tests
    await client.query(`
      INSERT INTO tests (id, classroom_id, title, description, test_date, duration, total_marks, status, submissions) VALUES
      ('${SEED_IDS.TST_1}', '${SEED_IDS.CLS_1}', 'Midterm Exam: C Programming Syntax & Logic', 'Written exam on loops, arrays, pointers and structures', '2026-03-15', '1h 30m', 50, 'Completed', 20),
      ('${SEED_IDS.TST_2}', '${SEED_IDS.CLS_2}', 'Class Test 1: SQL Window Functions & Joins', 'Query synthesis test on nested subqueries and partitioning', '2026-03-20', '45m', 25, 'Completed', 20),
      ('${SEED_IDS.TST_3}', '${SEED_IDS.CLS_3}', 'Midterm: Asymptotic Notation & Sorting', 'Comprehensive exam on Big-O proofs, QuickSort and HeapSort', '2026-03-22', '1h', 40, 'Completed', 20),
      ('${SEED_IDS.TST_4}', '${SEED_IDS.CLS_4}', 'Quiz 1: Cloud Native Design Patterns', 'Short questions on Circuit Breaker, Saga and CQRS', '2026-04-02', '30m', 20, 'Upcoming', 0),
      ('${SEED_IDS.TST_5}', '${SEED_IDS.CLS_5}', 'Lab Exam: Machine Learning Regression', 'Live coding test on cost functions and gradient descent', '2026-04-18', '1h', 30, 'Upcoming', 0)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 15. Grade Records for Completed Tests
    const testGrading = [
      { testId: SEED_IDS.TST_1, clsId: SEED_IDS.CLS_1, batchId: SEED_IDS.BATCH_SP26_A, totalMarks: 50 },
      { testId: SEED_IDS.TST_2, clsId: SEED_IDS.CLS_2, batchId: SEED_IDS.BATCH_SP25_A, totalMarks: 25 },
      { testId: SEED_IDS.TST_3, clsId: SEED_IDS.CLS_3, batchId: SEED_IDS.BATCH_FA25_A, totalMarks: 40 },
    ];

    for (const tg of testGrading) {
      const { rows: bStudents } = await client.query("SELECT id FROM students WHERE batch_id = $1", [tg.batchId]);
      for (let st = 0; st < bStudents.length; st++) {
        const studentId = bStudents[st].id;
        const hash = (st * 11 + tg.totalMarks * 7) % 100;
        const scorePercent = 65 + (hash % 33);
        const obtainedMarks = Math.round((scorePercent / 100) * tg.totalMarks);
        const remarks = scorePercent >= 85 ? "Excellent" : scorePercent >= 75 ? "Good" : "Satisfactory";
        const gradeId = crypto.randomUUID();

        await client.query(
          `INSERT INTO grade_records (id, classroom_id, student_id, test_id, obtained_marks, total_marks, remarks)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO NOTHING`,
          [gradeId, tg.clsId, studentId, tg.testId, obtainedMarks, tg.totalMarks, remarks]
        );
      }
    }

    // 16. Announcements
    await client.query(`
      INSERT INTO announcements (id, title, content, date, author_id, author_name, author_role, audience_type, status, priority) VALUES
      ('${crypto.randomUUID()}', 'Welcome to Jahangirnagar University Academic Session 2026', 'Heartiest congratulations and welcome to all enrolled students and faculty members. Academic classrooms and laboratory schedules are active.', '2026-01-15T09:00:00Z', '${SEED_IDS.ADMIN_1}', 'System Admin', 'Admin', 'Global', 'Published', 'High'),
      ('${crypto.randomUUID()}', 'Central Verification & Statutory Onboarding Protocol', 'All newly admitted Batch 52 candidates must finalize online statutory document submissions via the central portal before the semester registration deadline.', '2026-01-18T10:30:00Z', '${SEED_IDS.ADMIN_1}', 'System Admin', 'Admin', 'Global', 'Published', 'High'),
      ('${crypto.randomUUID()}', 'Database Systems Midterm Schedule Announced', 'Classroom CLS-2 midterm examination will take place in Room 305 IT Bldg. Topics include normalization up to BCNF and relational algebra.', '2026-02-01T14:00:00Z', '${SEED_IDS.TEACHER_1}', 'Prof. Dr. Shamim Al Mamun', 'Teacher', 'Course', 'Published', 'Normal'),
      ('${crypto.randomUUID()}', 'IEEE Xplore & ACM Digital Library Access', 'Full digital library proxy and campus Wi-Fi access credentials have been renewed for all undergraduate and postgraduate researchers.', '2026-02-10T11:00:00Z', '${SEED_IDS.ADMIN_1}', 'System Admin', 'Admin', 'Global', 'Published', 'Normal')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 17. Course Materials (including PPTX slide decks with active slide states)
    const materialsData = [
      {
        id: "mat-se-pptx-1",
        cls: SEED_IDS.CLS_4,
        course: SEED_IDS.COURSE_412,
        title: "Software Architecture & Cloud Enterprise Systems",
        desc: "Executive slide presentation detailing microservices, API Gateway, and resilient distributed patterns.",
        file: "Presentation1.pptx",
        type: "Slides",
        size: "6.2 MB",
        lastSlide: 14,
        totalSlides: 20
      },
      {
        id: "mat-db-pptx-1",
        cls: SEED_IDS.CLS_2,
        course: SEED_IDS.COURSE_305,
        title: "Relational Database Normalization & BCNF Decomposition",
        desc: "Interactive lecture slides covering functional dependencies, 3NF, BCNF, and multi-valued dependencies.",
        file: "Database_Normalization_BCNF.pptx",
        type: "Slides",
        size: "5.5 MB",
        lastSlide: 16,
        totalSlides: 24
      },
      {
        id: "mat-c-prog-pdf",
        cls: SEED_IDS.CLS_1,
        course: SEED_IDS.COURSE_101,
        title: "Structured C Programming Language Handbook",
        desc: "Comprehensive manual for syntax, control structures, pointers, and memory management.",
        file: "C_Programming_Comprehensive_Guide.pdf",
        type: "application/pdf",
        size: "3.2 MB",
        lastSlide: 1,
        totalSlides: 1
      },
      {
        id: "mat-ai-pdf-1",
        cls: SEED_IDS.CLS_5,
        course: SEED_IDS.COURSE_425,
        title: "Informed Graph Search & Heuristic Formulation",
        desc: "Rigorous proofs of A* admissibility, consistency, and tree search optimality.",
        file: "A_Star_Heuristics_Manual.pdf",
        type: "application/pdf",
        size: "2.8 MB",
        lastSlide: 1,
        totalSlides: 1
      }
    ];

    for (const mat of materialsData) {
      await client.query(`
        INSERT INTO course_materials (id, classroom_id, course_id, title, description, file_name, file_type, file_size, last_slide, total_slides)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          file_name = EXCLUDED.file_name,
          file_type = EXCLUDED.file_type,
          file_size = EXCLUDED.file_size,
          last_slide = EXCLUDED.last_slide,
          total_slides = EXCLUDED.total_slides;
      `, [mat.id, mat.cls, mat.course, mat.title, mat.desc, mat.file, mat.type, mat.size, mat.lastSlide, mat.totalSlides]);

      if (mat.type === "Slides") {
        await client.query(`
          INSERT INTO material_slide_states (id, material_id, classroom_id, teacher_id, last_slide, total_slides, material_title, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
          ON CONFLICT (material_id) DO UPDATE SET
            last_slide = EXCLUDED.last_slide,
            total_slides = EXCLUDED.total_slides,
            material_title = EXCLUDED.material_title,
            updated_at = CURRENT_TIMESTAMP;
        `, [`slide-state-${mat.id}`, mat.id, mat.cls, SEED_IDS.TEACHER_1, mat.lastSlide, mat.totalSlides, mat.title]);
      }
    }

    // 18. Student Academic Transcripts for Completed Semesters
    await seedStudentTranscripts(client);

    await client.query("COMMIT");
    console.log("Database reset & pristine demonstration dataset successfully seeded!");
    console.log("Summary: 1 Admin, 3 Teachers, 5 Batches, Exactly 100 Students, Real University Programs & 8 Semesters.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seeding error:", err);
    throw err;
  } finally {
    client.release();
  }
}

export async function seedStudentTranscripts(clientOrPool: any = pool) {
  function calcGradeInfo(score: number) {
    if (score >= 80) return { grade: "A+", gpa: 4.00 };
    if (score >= 75) return { grade: "A",  gpa: 3.75 };
    if (score >= 70) return { grade: "A-", gpa: 3.50 };
    if (score >= 65) return { grade: "B+", gpa: 3.25 };
    if (score >= 60) return { grade: "B",  gpa: 3.00 };
    if (score >= 55) return { grade: "B-", gpa: 2.75 };
    if (score >= 50) return { grade: "C+", gpa: 2.50 };
    if (score >= 45) return { grade: "C",  gpa: 2.25 };
    if (score >= 40) return { grade: "D",  gpa: 2.00 };
    return { grade: "F", gpa: 0.00 };
  }

  // Get all active courses grouped by semester
  const { rows: courses } = await clientOrPool.query(
    "SELECT id, code, semester FROM courses ORDER BY code ASC"
  );

  // Get all verified students
  const { rows: students } = await clientOrPool.query(
    "SELECT s.id, s.roll_no, b.code as batch_code FROM students s JOIN batches b ON s.batch_id = b.id"
  );

  // Map each batch to how many semesters they have completed
  const batchCompletedSemesters: Record<string, string[]> = {
    "SP26-A": [], // Freshers (0 completed)
    "FA25-A": ["Semester 1", "Semester 2"], // 2nd year (completed 2 semesters)
    "SP25-A": ["Semester 1", "Semester 2", "Semester 3", "Semester 4"], // 3rd year (completed 4 semesters)
    "FA24-A": ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6"], // 4th year (completed 6 semesters)
    "SP24-A": ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7"], // Final year (completed 7 semesters)
  };

  for (const student of students) {
    const completedSemesters = batchCompletedSemesters[student.batch_code] || [];
    if (completedSemesters.length === 0) continue;

    const studentSeed = student.id.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const studentCourses = courses.filter((c: any) => completedSemesters.includes(c.semester));

    for (let cIdx = 0; cIdx < studentCourses.length; cIdx++) {
      const course = studentCourses[cIdx];
      const trId = crypto.randomUUID();
      const baseSeed = (studentSeed * 17 + (cIdx + 1) * 31) % 100;

      const ctMark = Math.min(15, Math.max(10, Math.round(11 + (baseSeed % 4.5))));
      const assnMark = Math.min(10, Math.max(7, Math.round(7.5 + ((baseSeed * 3) % 3))));
      const projMark = Math.min(15, Math.max(11, Math.round(12 + ((baseSeed * 5) % 3.5))));
      const attMark = Math.min(10, Math.max(8, Math.round(8.5 + ((baseSeed * 7) % 2))));
      const midtermMark = Math.min(20, Math.max(14, Math.round(15 + ((baseSeed * 11) % 5))));
      const finalExamMark = Math.min(30, Math.max(20, Math.round(23 + ((baseSeed * 13) % 7.5))));

      const totalScore = Math.min(100, ctMark + assnMark + projMark + attMark + midtermMark + finalExamMark);
      const { grade, gpa } = calcGradeInfo(totalScore);

      await clientOrPool.query(`
        INSERT INTO student_transcripts (
          id, student_id, course_id, semester,
          ct_mark, assn_mark, proj_mark, att_mark,
          midterm_mark, final_exam_mark, total_score, letter_grade, grade_point
        )
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
      `, [trId, student.id, course.id, course.semester, ctMark, assnMark, projMark, attMark, midtermMark, finalExamMark, totalScore, grade, gpa]);
    }
  }
  console.log("Student academic transcripts successfully seeded across completed semesters.");
}

if (process.argv[1] && process.argv[1].endsWith("init.ts")) {
  resetAndSeedInitialData().then(() => {
    console.log("Database reset & seeding completed successfully.");
    process.exit(0);
  }).catch((err) => {
    console.error("Initialization failed:", err);
    process.exit(1);
  });
}

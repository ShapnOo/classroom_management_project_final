-- ════════════════════════════════════════════════════════════════════════════
-- SCHOLARIS DATABASE SCHEMA (PostgreSQL)
-- ════════════════════════════════════════════════════════════════════════════

-- 1. Academic Structure
CREATE TABLE IF NOT EXISTS departments (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS programs (
  id VARCHAR(64) PRIMARY KEY,
  department_id VARCHAR(64) REFERENCES departments(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  duration VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS academic_sessions (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'Active', -- 'Active', 'Upcoming', 'Completed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS batches (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  program_id VARCHAR(64) REFERENCES programs(id) ON DELETE CASCADE,
  session_id VARCHAR(64) REFERENCES academic_sessions(id) ON DELETE CASCADE,
  section VARCHAR(20) DEFAULT 'A',
  status VARCHAR(20) DEFAULT 'Active',
  semester_count INT DEFAULT 4,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users & Roles
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  role VARCHAR(20) NOT NULL, -- 'admin', 'teacher', 'student'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teachers (
  id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  department_id VARCHAR(64) REFERENCES departments(id) ON DELETE SET NULL,
  designation VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  roll_no VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  batch_id VARCHAR(64) REFERENCES batches(id) ON DELETE CASCADE,
  phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Courses & Syllabus Outline
CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  program_id VARCHAR(64) REFERENCES programs(id) ON DELETE CASCADE,
  credits INT DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS syllabus_topics (
  id VARCHAR(64) PRIMARY KEY,
  course_id VARCHAR(64) REFERENCES courses(id) ON DELETE CASCADE,
  topic VARCHAR(255) NOT NULL,
  week INT NOT NULL DEFAULT 1,
  sub_topics TEXT[] DEFAULT '{}',
  teacher_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'current', 'done'
  admin_status VARCHAR(20) DEFAULT 'Draft',     -- 'Draft', 'Published', 'Archived'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Classrooms & Schedules
CREATE TABLE IF NOT EXISTS classrooms (
  id VARCHAR(64) PRIMARY KEY,
  course_id VARCHAR(64) REFERENCES courses(id) ON DELETE CASCADE,
  batch_id VARCHAR(64) REFERENCES batches(id) ON DELETE CASCADE,
  teacher_id VARCHAR(64) REFERENCES teachers(id) ON DELETE CASCADE,
  room VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'upcoming', -- 'ongoing', 'upcoming', 'completed'
  classes_completed INT DEFAULT 0,
  total_classes INT DEFAULT 24,
  color_index INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS class_schedules (
  id VARCHAR(64) PRIMARY KEY,
  classroom_id VARCHAR(64) REFERENCES classrooms(id) ON DELETE CASCADE,
  day VARCHAR(20) NOT NULL,
  start_time VARCHAR(20) NOT NULL,
  end_time VARCHAR(20) NOT NULL,
  room VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Class Sessions & Attendance
CREATE TABLE IF NOT EXISTS class_sessions (
  id VARCHAR(64) PRIMARY KEY,
  classroom_id VARCHAR(64) REFERENCES classrooms(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  topic_covered VARCHAR(255) NOT NULL,
  notes TEXT,
  duration VARCHAR(50) DEFAULT '1h 30m',
  conducted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id VARCHAR(64) PRIMARY KEY,
  session_id VARCHAR(64) REFERENCES class_sessions(id) ON DELETE CASCADE,
  classroom_id VARCHAR(64) REFERENCES classrooms(id) ON DELETE CASCADE,
  student_id VARCHAR(64) REFERENCES students(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL, -- 'present', 'absent', 'late'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_session_student UNIQUE(session_id, student_id)
);

-- 6. Assignments, Tests & Grades
CREATE TABLE IF NOT EXISTS assignments (
  id VARCHAR(64) PRIMARY KEY,
  classroom_id VARCHAR(64) REFERENCES classrooms(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  total_marks NUMERIC(5,2) DEFAULT 20,
  status VARCHAR(20) DEFAULT 'Active',
  submissions INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tests (
  id VARCHAR(64) PRIMARY KEY,
  classroom_id VARCHAR(64) REFERENCES classrooms(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  test_date DATE NOT NULL,
  duration VARCHAR(50) DEFAULT '1h',
  total_marks NUMERIC(5,2) DEFAULT 25,
  status VARCHAR(20) DEFAULT 'Upcoming',
  submissions INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grade_records (
  id VARCHAR(64) PRIMARY KEY,
  classroom_id VARCHAR(64) REFERENCES classrooms(id) ON DELETE CASCADE,
  student_id VARCHAR(64) REFERENCES students(id) ON DELETE CASCADE,
  assignment_id VARCHAR(64) REFERENCES assignments(id) ON DELETE CASCADE,
  test_id VARCHAR(64) REFERENCES tests(id) ON DELETE CASCADE,
  obtained_marks NUMERIC(5,2) NOT NULL,
  total_marks NUMERIC(5,2) NOT NULL,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  date DATE NOT NULL,
  author_id VARCHAR(64) NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  author_role VARCHAR(20) NOT NULL,
  audience_type VARCHAR(20) NOT NULL, -- 'Global', 'Program', 'Batch', 'Course'
  program_id VARCHAR(64) REFERENCES programs(id) ON DELETE SET NULL,
  batch_id VARCHAR(64) REFERENCES batches(id) ON DELETE SET NULL,
  course_id VARCHAR(64) REFERENCES courses(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'Published',
  priority VARCHAR(20) DEFAULT 'Normal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

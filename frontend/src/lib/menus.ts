import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  CalendarDays, 
  ClipboardCheck, 
  Bell, 
  Settings, 
  User, 
  BarChart3, 
  FileText, 
  PlaySquare, 
  FolderOpen,
  MonitorPlay,
  ListTodo,
  TrendingUp,
  Clock,
  Award,
  ArrowRightLeft
} from "lucide-react";

export type MenuItem = {
  title: string;
  icon?: any;
  href?: string;
  submenu?: { title: string; href: string }[];
};

export const adminMenu: MenuItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard/admin" },
  { 
    title: "User Management", icon: Users,
    submenu: [
      { title: "Teachers Directory", href: "/dashboard/admin/users/teachers" },
      { title: "Students Directory", href: "/dashboard/admin/users/students" },
      { title: "System Admins", href: "/dashboard/admin/users/admins" },
    ]
  },
  { 
    title: "Academic Setup", icon: GraduationCap,
    submenu: [
      { title: "Departments & Programs", href: "/dashboard/admin/academic/departments" },
      { title: "Sessions & Batches", href: "/dashboard/admin/academic/batches" },
      { title: "Batch Promotion & Progression", href: "/dashboard/admin/academic/promotions" },
      { title: "Courses & Curriculum", href: "/dashboard/admin/academic/courses" },
      { title: "Syllabus Management", href: "/dashboard/admin/academic/syllabus" },
    ]
  },
  { 
    title: "Classroom Management", icon: MonitorPlay,
    submenu: [
      { title: "All Classrooms", href: "/dashboard/admin/academic/classrooms" },
      { title: "Class Schedules & Routine", href: "/dashboard/admin/academic/schedules" },
      { title: "Class Sessions History", href: "/dashboard/admin/academic/class-sessions" },
    ]
  },
  { 
    title: "Assessments & Grading", icon: BookOpen,
    submenu: [
      { title: "Assignments Monitor", href: "/dashboard/admin/academic/assignments" },
      { title: "Class Tests Monitor", href: "/dashboard/admin/academic/tests" },
      { title: "Attendance Ledger", href: "/dashboard/admin/academic/attendance" },
      { title: "Results & Gradebook", href: "/dashboard/admin/academic/results" },
    ]
  },
  { 
    title: "Reports & Analytics", icon: BarChart3,
    submenu: [
      { title: "Student Transcripts", href: "/dashboard/admin/reports/transcripts" },
      { title: "Semester Results & GPA", href: "/dashboard/admin/reports/results" },
      { title: "Attendance Analytics", href: "/dashboard/admin/reports/attendance" },
      { title: "Test Performance", href: "/dashboard/admin/reports/tests" },
    ]
  },
  { title: "Announcements", icon: Bell, href: "/dashboard/admin/announcements" },
  { title: "Academic Calendar", icon: CalendarDays, href: "/dashboard/admin/calendar" },
  { title: "Settings", icon: Settings, href: "/dashboard/admin/settings" },
  { title: "My Profile", icon: User, href: "/dashboard/admin/profile" },
];

export const teacherMenu: MenuItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard/teacher" },
  { title: "My Classrooms", icon: MonitorPlay, href: "/dashboard/teacher/classrooms" },
  { title: "Course Materials", icon: FolderOpen, href: "/dashboard/teacher/materials" },
  { title: "Students", icon: Users, href: "/dashboard/teacher/students" },
  { title: "Attendance", icon: ClipboardCheck, href: "/dashboard/teacher/attendance" },
  { title: "Assignments", icon: ListTodo, href: "/dashboard/teacher/assignments" },
  { title: "Class Tests", icon: FileText, href: "/dashboard/teacher/tests" },
  { title: "Final Evaluation", icon: Award, href: "/dashboard/teacher/evaluation" },
  { title: "Announcements", icon: Bell, href: "/dashboard/teacher/announcements" },
  { title: "Calendar", icon: CalendarDays, href: "/dashboard/teacher/calendar" },
  { title: "Class Reschedules", icon: ArrowRightLeft, href: "/dashboard/teacher/reschedules" },
  { 
    title: "Progress & Analytics", icon: BarChart3,
    submenu: [
      { title: "Reports & Grades", href: "/dashboard/teacher/results" }
    ]
  },
  { title: "My Profile", icon: User, href: "/dashboard/teacher/profile" },
  { title: "Settings", icon: Settings, href: "/dashboard/teacher/settings" },
];


export const studentMenu: MenuItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard/student" },
  { title: "My Classrooms", icon: MonitorPlay, href: "/dashboard/student/classrooms" },
  { title: "My Courses", icon: BookOpen, href: "/dashboard/student/courses" },
  { title: "Course Materials", icon: FolderOpen, href: "/dashboard/student/materials" },
  { title: "Assignments", icon: ListTodo, href: "/dashboard/student/assignments" },
  { title: "Class Tests", icon: FileText, href: "/dashboard/student/tests" },
  { title: "Attendance", icon: ClipboardCheck, href: "/dashboard/student/attendance" },
  { title: "Academic Performance", icon: BarChart3, href: "/dashboard/student/results" },
  { title: "Calendar", icon: CalendarDays, href: "/dashboard/student/calendar" },
];

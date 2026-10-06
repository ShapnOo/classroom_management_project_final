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
      { title: "Teachers", href: "/dashboard/admin/users/teachers" },
      { title: "Students", href: "/dashboard/admin/users/students" },
      { title: "Admins", href: "/dashboard/admin/users/admins" },
    ]
  },
  { 
    title: "Academic Management", icon: GraduationCap,
    submenu: [
      { title: "Departments", href: "/dashboard/admin/academic/departments" },
      { title: "Programs", href: "/dashboard/admin/academic/programs" },
      { title: "Sessions", href: "/dashboard/admin/academic/sessions" },
      { title: "Batches", href: "/dashboard/admin/academic/batches" },
      { title: "Courses", href: "/dashboard/admin/academic/courses" },
      { title: "Syllabus", href: "/dashboard/admin/academic/syllabus" },
    ]
  },
  { 
    title: "Classroom Management", icon: MonitorPlay,
    submenu: [
      { title: "All Classrooms", href: "/dashboard/admin/academic/classrooms" },
      { title: "Class Schedules", href: "/dashboard/admin/academic/schedules" },
    ]
  },
  { 
    title: "Academic Activities", icon: BookOpen,
    submenu: [
      { title: "Class Sessions", href: "/dashboard/admin/academic/class-sessions" },
      { title: "Attendance", href: "/dashboard/admin/academic/attendance" },
      { title: "Assignments", href: "/dashboard/admin/academic/assignments" },
      { title: "Class Tests", href: "/dashboard/admin/academic/tests" },
      { title: "Results", href: "/dashboard/admin/academic/results" },
    ]
  },
  { title: "Announcements", icon: Bell, href: "/dashboard/admin/announcements" },
  { title: "Calendar", icon: CalendarDays, href: "/dashboard/admin/calendar" },
  { 
    title: "Reports & Analytics", icon: BarChart3,
    submenu: [
      { title: "Student Transcripts", href: "/dashboard/admin/reports/transcripts" },
      { title: "Session & Semester Results", href: "/dashboard/admin/reports/results" },
      { title: "Attendance Reports", href: "/dashboard/admin/reports/attendance" },
      { title: "Course Progress", href: "/dashboard/admin/academic/syllabus" },
      { title: "Assignment Reports", href: "/dashboard/admin/academic/assignments" },
      { title: "Test Results", href: "/dashboard/admin/reports/tests" },
      { title: "Student Performance", href: "/dashboard/admin/academic/results" },
    ]
  },
  { title: "Notifications", icon: Bell, href: "/dashboard/admin/announcements" },
  { title: "Settings", icon: Settings, href: "/dashboard/admin/settings" },
  { title: "My Profile", icon: User, href: "/dashboard/admin/profile" },
];

export const teacherMenu: MenuItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard/teacher" },
  { title: "My Classrooms", icon: MonitorPlay, href: "/dashboard/teacher/classrooms" },
  { title: "My Courses", icon: BookOpen, href: "/dashboard/teacher/courses" },
  { 
    title: "Class Sessions", icon: PlaySquare,
    submenu: [
      { title: "Start Class", href: "/dashboard/teacher/sessions/start" },
      { title: "Class History", href: "/dashboard/teacher/sessions/history" },
    ]
  },
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
      { title: "Reports", href: "/dashboard/teacher/results" }
    ]
  },
  { title: "Notifications", icon: Bell, href: "/dashboard/teacher/announcements" },
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

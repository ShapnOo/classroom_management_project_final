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
  Award
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
      { title: "Teachers", href: "#" },
      { title: "Students", href: "#" },
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
      { title: "Class Sessions", href: "#" },
      { title: "Attendance", href: "#" },
      { title: "Assignments", href: "/dashboard/admin/academic/assignments" },
      { title: "Class Tests", href: "/dashboard/admin/academic/tests" },
      { title: "Results", href: "#" },
    ]
  },
  { title: "Announcements", icon: Bell, href: "#" },
  { title: "Calendar", icon: CalendarDays, href: "#" },
  { 
    title: "Reports & Analytics", icon: BarChart3,
    submenu: [
      { title: "Attendance Reports", href: "#" },
      { title: "Course Progress", href: "#" },
      { title: "Assignment Reports", href: "#" },
      { title: "Test Results", href: "#" },
      { title: "Student Performance", href: "#" },
    ]
  },
  { title: "Notifications", icon: Bell, href: "#" },
  { title: "Settings", icon: Settings, href: "/dashboard/admin/settings" },
  { title: "My Profile", icon: User, href: "#" },
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
  { title: "Course Continuity", icon: TrendingUp, href: "/dashboard/teacher/continuity" },
  { title: "Course Materials", icon: FolderOpen, href: "/dashboard/teacher/materials" },
  { title: "Students", icon: Users, href: "/dashboard/teacher/students" },
  { title: "Attendance", icon: ClipboardCheck, href: "/dashboard/teacher/attendance" },
  { title: "Assignments", icon: ListTodo, href: "/dashboard/teacher/assignments" },
  { title: "Class Tests", icon: FileText, href: "/dashboard/teacher/tests" },
  { title: "Final Evaluation", icon: Award, href: "/dashboard/teacher/evaluation" },
  { title: "Announcements", icon: Bell, href: "#" },
  { title: "Calendar", icon: CalendarDays, href: "#" },
  { 
    title: "Progress & Analytics", icon: BarChart3,
    submenu: [
      { title: "Reports", href: "#" }
    ]
  },
  { title: "Notifications", icon: Bell, href: "#" },
  { title: "My Profile", icon: User, href: "#" },
  { title: "Settings", icon: Settings, href: "#" },
];

export const studentMenu: MenuItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard/student" },
  { title: "My Classrooms", icon: MonitorPlay, href: "#" },
  { title: "My Courses", icon: BookOpen, href: "#" },
  { 
    title: "Class Timeline", icon: Clock,
    submenu: [
      { title: "Class History", href: "#" },
      { title: "Topics Covered", href: "#" },
    ]
  },
  { title: "Course Progress", icon: TrendingUp, href: "#" },
  { title: "Course Materials", icon: FolderOpen, href: "#" },
  { 
    title: "Assignments", icon: ListTodo,
    submenu: [
      { title: "Upcoming", href: "#" },
      { title: "Submitted", href: "#" },
      { title: "Graded", href: "#" },
    ]
  },
  { 
    title: "Class Tests", icon: FileText,
    submenu: [
      { title: "Upcoming Tests", href: "#" },
      { title: "Test History", href: "#" },
      { title: "Results", href: "#" },
    ]
  },
  { title: "Attendance", icon: ClipboardCheck, href: "#" },
  { title: "Academic Performance", icon: BarChart3, href: "#" },
  { title: "Announcements", icon: Bell, href: "#" },
  { title: "Calendar", icon: CalendarDays, href: "#" },
  { title: "Notifications", icon: Bell, href: "#" },
  { title: "My Profile", icon: User, href: "#" },
  { title: "Settings", icon: Settings, href: "#" },
];

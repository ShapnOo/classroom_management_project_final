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
  Clock
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
      { title: "Departments", href: "#" },
      { title: "Programs", href: "#" },
      { title: "Batches", href: "#" },
      { title: "Courses", href: "#" },
      { title: "Syllabus", href: "#" },
    ]
  },
  { 
    title: "Classroom Management", icon: MonitorPlay,
    submenu: [
      { title: "All Classrooms", href: "#" },
      { title: "Class Schedules", href: "#" },
    ]
  },
  { 
    title: "Academic Activities", icon: BookOpen,
    submenu: [
      { title: "Class Sessions", href: "#" },
      { title: "Attendance", href: "#" },
      { title: "Assignments", href: "#" },
      { title: "Class Tests", href: "#" },
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
  { title: "Settings", icon: Settings, href: "#" },
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

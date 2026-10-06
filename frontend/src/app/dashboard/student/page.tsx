import StudentDashboard from "@/components/dashboard/student/StudentDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Dashboard | Classroom Management",
  description: "View enrolled classrooms, class timetable, upcoming assignments, and test dates",
};

export default function StudentDashboardPage() {
  return <StudentDashboard />;
}

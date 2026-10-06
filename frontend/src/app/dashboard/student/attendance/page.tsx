import StudentAttendance from "@/components/dashboard/student/StudentAttendance";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Attendance Record | Student Portal",
  description: "View subject-wise attendance percentage, present, absent, and late counts",
};

export default function StudentAttendancePage() {
  return <StudentAttendance />;
}

import AdminAttendanceReport from "@/components/dashboard/admin/reports/AdminAttendanceReport";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attendance Reports | Admin Dashboard",
  description: "View institution-wide attendance analytics and student participation",
};

export default function AttendanceReportsPage() {
  return <AdminAttendanceReport />;
}

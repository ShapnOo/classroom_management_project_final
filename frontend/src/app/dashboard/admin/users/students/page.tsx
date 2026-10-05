import AdminStudents from "@/components/dashboard/admin/users/AdminStudents";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Students | User Management",
  description: "Manage students in the system",
};

export default function AdminStudentsPage() {
  return <AdminStudents />;
}

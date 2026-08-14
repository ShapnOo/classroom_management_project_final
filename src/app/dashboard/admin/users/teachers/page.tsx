import AdminTeachers from "@/components/dashboard/admin/users/AdminTeachers";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teachers | User Management",
  description: "Manage teachers in the system",
};

export default function AdminTeachersPage() {
  return <AdminTeachers />;
}

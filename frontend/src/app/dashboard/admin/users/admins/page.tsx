import AdminAdmins from "@/components/dashboard/admin/users/AdminAdmins";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Users | User Management",
  description: "Manage administrative access to the platform",
};

export default function AdminAdminsPage() {
  return <AdminAdmins />;
}

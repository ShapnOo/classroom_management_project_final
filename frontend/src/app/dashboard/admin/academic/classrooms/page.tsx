import AdminClassrooms from "@/components/dashboard/admin/AdminClassrooms";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Classrooms | Admin",
  description: "Global overview of all classrooms",
};

export default function AdminAllClassroomsPage() {
  return <AdminClassrooms />;
}

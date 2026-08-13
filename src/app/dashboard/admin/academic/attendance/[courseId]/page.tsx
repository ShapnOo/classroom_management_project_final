"use client";
import { useParams } from "next/navigation";
import AdminAttendance from "@/components/dashboard/admin/AdminAttendance";

export default function AdminAttendanceDetailPage() {
  const params = useParams();
  const courseId = params?.courseId as string;
  return <AdminAttendance courseId={courseId} />;
}

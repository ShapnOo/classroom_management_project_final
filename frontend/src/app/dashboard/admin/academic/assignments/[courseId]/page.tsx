"use client";
import { useParams } from "next/navigation";
import AdminAssignments from "@/components/dashboard/admin/AdminAssignments";

export default function AdminAssignmentsDetailPage() {
  const params = useParams();
  const courseId = params?.courseId as string;
  return <AdminAssignments courseId={courseId} />;
}

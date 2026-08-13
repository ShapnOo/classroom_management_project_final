"use client";
import { useParams } from "next/navigation";
import AdminResults from "@/components/dashboard/admin/AdminResults";

export default function AdminResultsDetailPage() {
  const params = useParams();
  const courseId = params?.courseId as string;
  return <AdminResults courseId={courseId} />;
}

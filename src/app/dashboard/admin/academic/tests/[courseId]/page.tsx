"use client";
import { useParams } from "next/navigation";
import AdminTests from "@/components/dashboard/admin/AdminTests";

export default function AdminTestsDetailPage() {
  const params = useParams();
  const courseId = params?.courseId as string;
  return <AdminTests courseId={courseId} />;
}

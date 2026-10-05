import TeacherClassroomDetail from "@/components/dashboard/teacher/TeacherClassroomDetail";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Classroom Hub | Scholaris",
  description: "View and manage classroom sessions, attendance, materials, and syllabus",
};

export default async function ClassroomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TeacherClassroomDetail classroomId={id} />;
}

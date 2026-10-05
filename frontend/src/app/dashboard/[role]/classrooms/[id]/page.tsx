import TeacherClassroomDetail from "@/components/dashboard/teacher/TeacherClassroomDetail";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Classroom Hub | Scholaris",
  description: "Manage classroom details, sessions, attendance, and syllabus",
};

export default async function RoleClassroomDetailPage({
  params,
}: {
  params: Promise<{ role: string; id: string }>;
}) {
  const { role, id } = await params;

  if (role === "teacher") {
    return <TeacherClassroomDetail classroomId={id} />;
  }

  return (
    <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
      <h2 className="text-sm font-semibold text-slate-800">Classroom View</h2>
      <p className="text-xs text-slate-500 mt-1">
        Classroom detail view is currently tailored for teachers.
      </p>
    </div>
  );
}

import TeacherClassrooms from "@/components/dashboard/teacher/TeacherClassrooms";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Classrooms | Scholaris",
  description: "Manage your classrooms",
};

export default async function ClassroomsPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;

  // Render teacher classrooms if role is teacher
  if (role === "teacher") {
    return <TeacherClassrooms />;
  }

  // Placeholder for other roles
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-sm">🚧</span>
      </div>
      <h2 className="text-sm font-medium text-slate-800 mb-2">Classrooms Under Construction</h2>
      <p className="text-slate-500 max-w-md">
        The classrooms view for the <span className="font-medium text-brand-dark">{role}</span> portal is currently being built. Please check back later.
      </p>
    </div>
  );
}

import TeacherStudents from "@/components/dashboard/teacher/TeacherStudents";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Roster | Scholaris",
  description: "View detailed student information for a specific class.",
};

export default async function StudentsDetailsPage({ params }: { params: Promise<{ role: string, id: string }> }) {
  const { role, id } = await params;

  if (role === "teacher") {
    return <TeacherStudents courseId={id} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-xl">🚧</span>
      </div>
      <h2 className="text-lg font-medium text-slate-800 mb-2">Access Denied</h2>
      <p className="text-slate-500 max-w-md text-[13px]">
        Only teachers can view the student roster from this view.
      </p>
    </div>
  );
}

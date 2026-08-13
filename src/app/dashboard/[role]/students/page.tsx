import TeacherStudentsList from "@/components/dashboard/teacher/TeacherStudentsList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Students | Scholaris",
  description: "View and manage students in your classes.",
};

export default async function StudentsPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;

  if (role === "teacher") {
    return <TeacherStudentsList />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-2xl">🚧</span>
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
      <p className="text-slate-500 max-w-md text-sm">
        Only teachers can view the student list from this view.
      </p>
    </div>
  );
}

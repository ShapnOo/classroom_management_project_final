import TeacherAssignments from "@/components/dashboard/teacher/TeacherAssignments";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assignments Detail | Scholaris",
  description: "View and create assignments for a specific class.",
};

export default async function AssignmentsDetailsPage({ params }: { params: Promise<{ role: string, id: string }> }) {
  const { role, id } = await params;

  if (role === "teacher") {
    return <TeacherAssignments courseId={id} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-2xl">🚧</span>
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
      <p className="text-slate-500 max-w-md text-sm">
        Only teachers can manage assignments from this view.
      </p>
    </div>
  );
}

import TeacherAssignmentsList from "@/components/dashboard/teacher/TeacherAssignmentsList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assignments | Scholaris",
  description: "Manage and create assignments for your classes.",
};

export default async function AssignmentsPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;

  if (role === "teacher") {
    return <TeacherAssignmentsList />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-sm">🚧</span>
      </div>
      <h2 className="text-sm font-medium text-slate-800 mb-2">Access Denied</h2>
      <p className="text-slate-500 max-w-md text-[13px]">
        Only teachers can manage assignments from this view.
      </p>
    </div>
  );
}

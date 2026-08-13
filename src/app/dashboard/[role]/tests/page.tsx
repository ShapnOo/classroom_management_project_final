import TeacherTestsList from "@/components/dashboard/teacher/TeacherTestsList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Class Tests | Scholaris",
  description: "Manage class tests and evaluations",
};

export default async function TestsPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  
  if (role === "teacher") {
    return <TeacherTestsList />;
  }
  
  return (
    <div className="p-6">
      <h1 className="text-sm font-semibold text-slate-900">Class Tests</h1>
      <p className="text-xs text-slate-500 mt-2">This feature is not available for this role yet.</p>
    </div>
  );
}

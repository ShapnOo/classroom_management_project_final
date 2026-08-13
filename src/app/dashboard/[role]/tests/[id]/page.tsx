import TeacherTests from "@/components/dashboard/teacher/TeacherTests";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Class Tests | Scholaris",
  description: "Manage class tests and evaluations",
};

export default async function ClassTestsPage({ params }: { params: Promise<{ role: string, id: string }> }) {
  const { role, id } = await params;
  
  if (role === "teacher") {
    return <TeacherTests courseId={id} />;
  }
  
  return (
    <div className="p-6">
      <h1 className="text-sm font-semibold text-slate-900">Class Tests</h1>
      <p className="text-xs text-slate-500 mt-2">This feature is not available for this role yet.</p>
    </div>
  );
}

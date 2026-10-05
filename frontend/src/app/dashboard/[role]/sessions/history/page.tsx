import TeacherClassHistory from "@/components/dashboard/teacher/TeacherClassHistory";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Class History | Scholaris",
  description: "View the history of all class sessions.",
};

export default async function ClassHistoryPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;

  if (role === "teacher") {
    return <TeacherClassHistory />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-sm">🚧</span>
      </div>
      <h2 className="text-sm font-medium text-slate-800 mb-2">Access Denied</h2>
      <p className="text-slate-500 max-w-md text-[13px]">
        Only teachers can view the class history from this view.
      </p>
    </div>
  );
}

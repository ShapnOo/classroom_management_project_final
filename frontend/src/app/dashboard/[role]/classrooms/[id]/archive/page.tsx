import TeacherClassArchive from "@/components/dashboard/teacher/TeacherClassArchive";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Classroom Archive | Scholaris",
  description: "View historical data for archived classes",
};

export default async function ClassArchivePage({ params }: { params: Promise<{ role: string, id: string }> }) {
  const { role, id } = await params;
  
  if (role === "teacher") {
    return <TeacherClassArchive courseId={id} />;
  }
  
  return (
    <div className="p-6">
      <h1 className="text-sm font-semibold text-slate-900">Classroom Archive</h1>
      <p className="text-xs text-slate-500 mt-2">This feature is not available for this role yet.</p>
    </div>
  );
}

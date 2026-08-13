import TeacherMaterials from "@/components/dashboard/teacher/TeacherMaterials";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Course Materials Details | Scholaris",
  description: "Manage and upload course materials for a specific course.",
};

export default async function MaterialsDetailsPage({ params }: { params: Promise<{ role: string, id: string }> }) {
  const { role, id } = await params;

  if (role === "teacher") {
    return <TeacherMaterials courseId={id} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-2xl">🚧</span>
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
      <p className="text-slate-500 max-w-md text-sm">
        Only teachers can manage course materials from this view.
      </p>
    </div>
  );
}

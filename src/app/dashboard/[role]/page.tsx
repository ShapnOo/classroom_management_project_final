import TeacherDashboard from "@/components/dashboard/teacher/TeacherDashboard";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const resolvedParams = await params;
  const role = resolvedParams.role;

  if (role === "teacher") {
    return <TeacherDashboard />;
  }

  return (
    <div className="w-full h-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-sm font-medium text-slate-800 mb-2 capitalize">{role} Dashboard</h2>
        <p className="text-[13px] text-slate-500">This dashboard view is currently under construction.</p>
      </div>
    </div>
  );
}

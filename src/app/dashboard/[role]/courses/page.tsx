import TeacherCourses from "@/components/dashboard/teacher/TeacherCourses";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Courses | Scholaris",
  description: "View the courses you are assigned to teach.",
};

export default async function CoursesPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;

  if (role === "teacher") {
    return <TeacherCourses />;
  }

  // Fallback for other roles (admin, student)
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-sm">🚧</span>
      </div>
      <h2 className="text-sm font-medium text-slate-800 mb-2">Coming Soon</h2>
      <p className="text-slate-500 max-w-md text-[13px]">
        The courses module for the {role} portal is currently under development.
      </p>
    </div>
  );
}

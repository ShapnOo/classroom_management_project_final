import TeacherTestEvaluate from "@/components/dashboard/teacher/TeacherTestEvaluate";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evaluate Test | Scholaris",
  description: "Evaluate students and enter marks for the selected class test",
};

export default async function EvaluateTestPage({ params }: { params: Promise<{ role: string, id: string }> }) {
  const { role, id } = await params;
  
  if (role === "teacher") {
    return <TeacherTestEvaluate testId={id} />;
  }
  
  return (
    <div className="p-6 text-center text-slate-500">
      Only teachers can evaluate tests.
    </div>
  );
}

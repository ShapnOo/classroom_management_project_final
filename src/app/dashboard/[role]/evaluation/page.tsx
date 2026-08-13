import TeacherEvaluation from "@/components/dashboard/teacher/TeacherEvaluation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Final Evaluation | Scholaris",
  description: "Configure grading policies and generate final result sheets",
};

export default async function EvaluationPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  
  if (role === "teacher") {
    return <TeacherEvaluation />;
  }
  
  return (
    <div className="p-6 text-center text-slate-500">
      Only teachers can access the final evaluation module.
    </div>
  );
}

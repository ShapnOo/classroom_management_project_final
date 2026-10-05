import TeacherEvaluation from "@/components/dashboard/teacher/TeacherEvaluation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Course Evaluation & Grading | Scholaris",
  description: "Configure grading policies and generate final result sheets for this course",
};

export default async function EvaluationDetailPage({ params }: { params: Promise<{ role: string; id: string }> }) {
  const { role, id } = await params;
  
  if (role === "teacher" || role === "admin") {
    return <TeacherEvaluation classroomId={id} />;
  }
  
  return (
    <div className="p-6 text-center text-slate-500">
      Only faculty members can access course evaluation details.
    </div>
  );
}

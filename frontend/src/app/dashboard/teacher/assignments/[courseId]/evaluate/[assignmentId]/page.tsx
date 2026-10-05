import TeacherAssignmentEvaluate from "@/components/dashboard/teacher/TeacherAssignmentEvaluate";
export default async function AssignmentEvaluatePage({ params }: { params: Promise<{ assignmentId: string; courseId: string }> }) {
  const resolvedParams = await params;
  return <TeacherAssignmentEvaluate assignmentId={resolvedParams.assignmentId} courseId={resolvedParams.courseId} />;
}
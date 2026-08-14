import TeacherTestEvaluate from "@/components/dashboard/teacher/TeacherTestEvaluate";
export default async function TestEvaluatePage({ params }: { params: Promise<{ testId: string; courseId: string }> }) {
  const resolvedParams = await params;
  return <TeacherTestEvaluate testId={resolvedParams.testId} courseId={resolvedParams.courseId} />;
}
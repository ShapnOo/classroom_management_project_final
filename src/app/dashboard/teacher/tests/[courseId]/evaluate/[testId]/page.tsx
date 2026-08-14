import TeacherTestEvaluate from "@/components/dashboard/teacher/TeacherTestEvaluate";
export default async function TestEvaluatePage({ params }: { params: Promise<{ testId: string }> }) {
  const resolvedParams = await params;
  return <TeacherTestEvaluate testId={resolvedParams.testId} />;
}
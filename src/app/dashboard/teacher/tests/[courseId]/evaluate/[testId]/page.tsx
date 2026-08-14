import TeacherTestEvaluate from "@/components/dashboard/teacher/TeacherTestEvaluate";

export default function TestEvaluatePage({ params }: { params: { testId: string } }) {
  return <TeacherTestEvaluate testId={params.testId} />;
}

import TeacherTests from "@/components/dashboard/teacher/TeacherTests";
export default async function CourseTestsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = await params;
  return <TeacherTests courseId={resolvedParams.courseId} />;
}
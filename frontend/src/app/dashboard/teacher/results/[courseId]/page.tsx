import TeacherResults from "@/components/dashboard/teacher/TeacherResults";
export default async function CourseResultsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = await params;
  return <TeacherResults courseId={resolvedParams.courseId} />;
}
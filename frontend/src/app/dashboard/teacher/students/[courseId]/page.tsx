import TeacherStudents from "@/components/dashboard/teacher/TeacherStudents";
export default async function CourseStudentsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = await params;
  return <TeacherStudents courseId={resolvedParams.courseId} />;
}
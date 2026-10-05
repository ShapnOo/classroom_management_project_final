import TeacherAssignments from "@/components/dashboard/teacher/TeacherAssignments";
export default async function CourseAssignmentsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = await params;
  return <TeacherAssignments courseId={resolvedParams.courseId} />;
}
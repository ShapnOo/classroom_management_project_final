import TeacherAttendance from "@/components/dashboard/teacher/TeacherAttendance";
export default async function CourseAttendancePage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = await params;
  return <TeacherAttendance courseId={resolvedParams.courseId} />;
}
import TeacherTests from "@/components/dashboard/teacher/TeacherTests";

export default function CourseTestsPage({ params }: { params: { courseId: string } }) {
  return <TeacherTests courseId={params.courseId} />;
}

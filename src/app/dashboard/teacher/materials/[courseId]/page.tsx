import TeacherMaterials from "@/components/dashboard/teacher/TeacherMaterials";
export default async function CourseMaterialsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = await params;
  return <TeacherMaterials courseId={resolvedParams.courseId} />;
}
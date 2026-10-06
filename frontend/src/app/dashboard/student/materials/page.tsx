import StudentMaterials from "@/components/dashboard/student/StudentMaterials";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Course Materials | Student Portal",
  description: "Download lecture slides, reading materials, PDFs, and lecture notes",
};

export default function StudentMaterialsPage() {
  return <StudentMaterials />;
}

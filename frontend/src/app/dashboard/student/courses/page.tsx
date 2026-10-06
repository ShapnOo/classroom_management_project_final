import StudentClassrooms from "@/components/dashboard/student/StudentClassrooms";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Courses | Student Portal",
  description: "View enrolled academic courses, credit hours, and syllabus topics",
};

export default function StudentCoursesPage() {
  return <StudentClassrooms />;
}

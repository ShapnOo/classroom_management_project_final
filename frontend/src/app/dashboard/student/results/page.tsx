import StudentResults from "@/components/dashboard/student/StudentResults";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Academic Transcript & CGPA | Student Portal",
  description: "View semester GPA, CGPA calculation, course grades, and assignment test scores",
};

export default function StudentResultsPage() {
  return <StudentResults />;
}

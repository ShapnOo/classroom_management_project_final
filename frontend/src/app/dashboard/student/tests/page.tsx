import StudentTests from "@/components/dashboard/student/StudentTests";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Class Tests & Exam Schedule | Student Portal",
  description: "View upcoming test dates, durations, and obtained test marks",
};

export default function StudentTestsPage() {
  return <StudentTests />;
}

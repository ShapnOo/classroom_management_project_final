import StudentAssignments from "@/components/dashboard/student/StudentAssignments";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assignments & Tasks | Student Portal",
  description: "View active assignment deadlines, submit solutions, and track grades",
};

export default function StudentAssignmentsPage() {
  return <StudentAssignments />;
}

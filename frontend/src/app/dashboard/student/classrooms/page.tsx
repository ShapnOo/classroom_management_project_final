import StudentClassrooms from "@/components/dashboard/student/StudentClassrooms";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Classrooms | Student Portal",
  description: "View enrolled classrooms, faculty instructor details, and class schedules",
};

export default function StudentClassroomsPage() {
  return <StudentClassrooms />;
}

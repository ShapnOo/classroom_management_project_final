import TeacherClassrooms from "@/components/dashboard/teacher/TeacherClassrooms";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Classrooms | Scholaris",
  description: "View and manage your assigned classrooms, batches, and course sessions",
};

export default function MyClassroomsPage() {
  return <TeacherClassrooms />;
}

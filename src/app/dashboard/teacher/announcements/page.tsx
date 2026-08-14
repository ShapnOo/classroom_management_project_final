import AnnouncementsManager from "@/components/dashboard/shared/AnnouncementsManager";
import { CURRENT_TEACHER_ID } from "@/lib/seedData";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Announcements | Teacher",
  description: "View and manage announcements",
};

export default function TeacherAnnouncementsPage() {
  // In a real app, author ID and Name would come from the auth session.
  return <AnnouncementsManager role="Teacher" authorId={CURRENT_TEACHER_ID} authorName="Dr. Alan Turing" />;
}

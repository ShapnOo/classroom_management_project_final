import AnnouncementsManager from "@/components/dashboard/shared/AnnouncementsManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Announcements | Admin",
  description: "Global overview of all announcements",
};

export default function AdminAnnouncementsPage() {
  return <AnnouncementsManager role="Admin" authorId="admin-1" authorName="System Admin" />;
}

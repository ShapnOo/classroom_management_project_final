import AdminStudentTranscripts from "@/components/dashboard/admin/AdminStudentTranscripts";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Transcripts | Dashboard Reports",
  description: "View and generate detailed student transcripts and CGPA grade sheets",
};

export default function RoleTranscriptsPage() {
  return <AdminStudentTranscripts />;
}

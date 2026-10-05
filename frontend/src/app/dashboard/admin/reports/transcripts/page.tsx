import AdminStudentTranscripts from "@/components/dashboard/admin/AdminStudentTranscripts";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Transcripts | Admin Reports",
  description: "View and generate detailed student transcripts and CGPA grade sheets",
};

export default function AdminTranscriptsPage() {
  return <AdminStudentTranscripts />;
}

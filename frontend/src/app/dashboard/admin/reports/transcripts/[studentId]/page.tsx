import AdminStudentTranscripts from "@/components/dashboard/admin/AdminStudentTranscripts";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Academic Transcript | Admin Reports",
  description: "Detailed course evaluation breakdown and official grade transcript for student",
};

export default function AdminStudentTranscriptDetailPage() {
  return <AdminStudentTranscripts />;
}

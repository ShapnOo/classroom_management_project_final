import AdminSessionSemesterResults from "@/components/dashboard/admin/reports/AdminSessionSemesterResults";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Session & Semester Results | Admin Reports",
  description: "View and print official academic session and semester tabulation result sheets",
};

export default function SessionSemesterResultsPage() {
  return <AdminSessionSemesterResults />;
}

import AdminTestResultsReport from "@/components/dashboard/admin/reports/AdminTestResultsReport";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Test Results | Admin Dashboard",
  description: "View institution-wide test scores and academic performance analytics",
};

export default function TestResultsPage() {
  return <AdminTestResultsReport />;
}

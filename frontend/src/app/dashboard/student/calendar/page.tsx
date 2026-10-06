import CalendarView from "@/components/dashboard/shared/CalendarView";
import { CURRENT_STUDENT_BATCH_ID } from "@/lib/seedData";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Calendar | Student Dashboard",
  description: "View your class schedules, assignment deadlines, and upcoming class tests",
};

export default function StudentCalendarPage() {
  return <CalendarView role="Student" studentBatchId={CURRENT_STUDENT_BATCH_ID} />;
}

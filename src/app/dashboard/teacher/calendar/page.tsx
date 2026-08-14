import CalendarView from "@/components/dashboard/shared/CalendarView";
import { CURRENT_TEACHER_ID } from "@/lib/seedData";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Calendar | Teacher Dashboard",
  description: "View your upcoming classes, tests, and assignment deadlines",
};

export default function TeacherCalendarPage() {
  return <CalendarView role="Teacher" teacherId={CURRENT_TEACHER_ID} />;
}

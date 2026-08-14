import CalendarView from "@/components/dashboard/shared/CalendarView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendar | Admin Dashboard",
  description: "View all academic schedules across the institution",
};

export default function AdminCalendarPage() {
  return <CalendarView role="Admin" />;
}

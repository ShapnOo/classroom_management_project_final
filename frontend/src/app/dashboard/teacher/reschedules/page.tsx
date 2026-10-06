import TeacherReschedulesList from "@/components/dashboard/teacher/TeacherReschedulesList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Class Reschedules & Slot Swaps | Teacher Dashboard",
  description: "Manage class reschedules and exchange time slots with other faculty members",
};

export default function TeacherReschedulesPage() {
  return (
    <div className="w-full mx-auto space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Class Reschedules & Slot Swaps</h1>
        <p className="text-xs text-slate-500 mt-1">
          Request class date/time changes, request slot exchanges with peer teachers, and manage pending approvals.
        </p>
      </div>

      <TeacherReschedulesList />
    </div>
  );
}

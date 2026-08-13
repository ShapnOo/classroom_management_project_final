"use client";

import { useState } from "react";
import { MonitorPlay, Users, CalendarClock, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { DataTable } from "@/components/ui/DataTable";
import Link from "next/link";

type Classroom = {
  id: string;
  course: string;
  batch: string;
  students: number;
  nextClass: string;
  room: string;
};

// Mock data representing the classrooms assigned to the logged-in teacher
const myClassrooms: Classroom[] = [
  { id: "1", course: "Database Management System", batch: "PGDIT Spring 2026", students: 42, nextClass: "Today, 10:00 AM", room: "Room 402" },
  { id: "2", course: "Software Engineering", batch: "PGDIT Spring 2026", students: 38, nextClass: "Tomorrow, 02:00 PM", room: "Room 305" },
  { id: "3", course: "Web Technologies", batch: "BSc CSE Fall 2025", students: 55, nextClass: "Wednesday, 11:30 AM", room: "Lab 1" },
];

export default function MyClassroomsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClassrooms = myClassrooms.filter(c => 
    c.course.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.batch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <PageHeader 
        title="My Classrooms" 
        description="A focused view of the courses and batches assigned to you by the administration."
      />

      <SearchInput 
        placeholder="Search classrooms by course or batch..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <DataTable 
        columns={["Course & Batch", "Students", "Next Schedule", "Actions"]}
        isEmpty={filteredClassrooms.length === 0}
        emptyStateIcon={MonitorPlay}
        emptyStateTitle="No classrooms found"
        emptyStateDescription="You have not been assigned to any classrooms yet."
      >
        {filteredClassrooms.map((classroom) => (
          <tr key={classroom.id} className="hover:bg-slate-50/80 transition-colors group">
            <td className="px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm shrink-0 mt-0.5">
                  <MonitorPlay className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-medium text-[13px] text-slate-900 block mb-1">{classroom.course}</span>
                  <span className="text-[10px] text-brand-dark/70 font-medium bg-brand-dark/5 px-1.5 py-0.5 rounded-md border border-brand-dark/10">
                    {classroom.batch}
                  </span>
                </div>
              </div>
            </td>
            <td className="px-5 py-4">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {classroom.students} Enrolled
              </div>
            </td>
            <td className="px-5 py-4">
              <div className="flex flex-col gap-0.5">
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700">
                  <CalendarClock className="w-3.5 h-3.5 text-slate-400" />
                  {classroom.nextClass}
                </span>
                <span className="text-[10px] text-slate-500 ml-5">{classroom.room}</span>
              </div>
            </td>
            <td className="px-5 py-4 text-right">
              <Link 
                href={`/dashboard/teacher/classrooms/${classroom.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:text-brand-dark transition-colors text-[11px] font-medium shadow-sm"
              >
                Enter Classroom
                <ArrowRight className="w-3 h-3" />
              </Link>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}

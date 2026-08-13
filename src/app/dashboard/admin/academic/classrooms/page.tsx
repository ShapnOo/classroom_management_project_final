"use client";

import { useState } from "react";
import { MonitorPlay, Users, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { DataTable } from "@/components/ui/DataTable";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";

type Classroom = {
  id: string;
  course: string;
  batch: string;
  teacher: string;
  students: number;
  status: "Active" | "Upcoming" | "Completed";
};

// Global overview data for the Admin
const allClassrooms: Classroom[] = [
  { id: "1", course: "Database Management System", batch: "PGDIT Spring 2026", teacher: "Dr. Alan Turing", students: 42, status: "Active" },
  { id: "2", course: "Software Engineering", batch: "PGDIT Spring 2026", teacher: "Prof. Sarah Jenkins", students: 38, status: "Active" },
  { id: "3", course: "Web Technologies", batch: "BSc CSE Fall 2025", teacher: "Dr. Tim Berners-Lee", students: 55, status: "Upcoming" },
  { id: "4", course: "Data Structures", batch: "BSc CSE Fall 2025", teacher: "Prof. Ada Lovelace", students: 60, status: "Active" },
];

export default function AllClassroomsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClassrooms = allClassrooms.filter(c => 
    c.course.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.batch.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <PageHeader 
        title="All Classrooms" 
        description="Global overview of all active classes, assigned teachers, and batch sizes."
      />

      <SearchInput 
        placeholder="Search classrooms by course, batch, or teacher..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <DataTable 
        columns={["Course & Batch", "Assigned Teacher", "Enrolled Students", "Status", "Actions"]}
        isEmpty={filteredClassrooms.length === 0}
        emptyStateIcon={MonitorPlay}
        emptyStateTitle="No classrooms found"
        emptyStateDescription="No classrooms match your search."
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
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-medium text-slate-700">{classroom.teacher}</span>
              </div>
            </td>
            <td className="px-5 py-4">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {classroom.students} Enrolled
              </div>
            </td>
            <td className="px-5 py-4">
              <StatusBadge status={classroom.status} />
            </td>
            <td className="px-5 py-4 text-right">
              <Link 
                href={`#`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:text-brand-dark transition-colors text-[11px] font-medium shadow-sm opacity-0 group-hover:opacity-100"
              >
                View Details
                <ArrowRight className="w-3 h-3" />
              </Link>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}

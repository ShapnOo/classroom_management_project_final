"use client";

import { useState } from "react";
import { ListTodo, Calendar, Users, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable } from "@/components/ui/DataTable";
import Link from "next/link";

type GlobalAssignment = {
  id: string;
  title: string;
  course: string;
  batch: string;
  teacher: string;
  dueDate: string;
  submissions: number;
  totalStudents: number;
  status: "Active" | "Upcoming" | "Completed";
};

const globalAssignments: GlobalAssignment[] = [
  { id: "1", title: "ER Diagram Design", course: "Database Management System", batch: "PGDIT Spring 2026", teacher: "Dr. Alan Turing", dueDate: "Oct 25, 2026", submissions: 38, totalStudents: 42, status: "Active" },
  { id: "2", title: "SQL Queries Practice", course: "Database Management System", batch: "PGDIT Spring 2026", teacher: "Dr. Alan Turing", dueDate: "Nov 02, 2026", submissions: 0, totalStudents: 42, status: "Upcoming" },
  { id: "3", title: "Agile Case Study", course: "Software Engineering", batch: "PGDIT Spring 2026", teacher: "Prof. Sarah Jenkins", dueDate: "Oct 20, 2026", submissions: 38, totalStudents: 38, status: "Completed" },
  { id: "4", title: "HTML/CSS Basics", course: "Web Technologies", batch: "BSc CSE Fall 2025", teacher: "Dr. Tim Berners-Lee", dueDate: "Nov 10, 2026", submissions: 10, totalStudents: 55, status: "Active" },
];

export default function GlobalAssignmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAssignments = globalAssignments.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <PageHeader 
        title="Global Assignments" 
        description="Oversee all assignments created by teachers across all active classrooms."
      />

      <SearchInput 
        placeholder="Search assignments by title, course, or teacher..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <DataTable 
        columns={["Assignment Details", "Classroom & Teacher", "Due Date", "Submission Rate", "Status", "Actions"]}
        isEmpty={filteredAssignments.length === 0}
        emptyStateIcon={ListTodo}
        emptyStateTitle="No assignments found"
        emptyStateDescription="No assignments match your search criteria."
      >
        {filteredAssignments.map((assignment) => (
          <tr key={assignment.id} className="hover:bg-slate-50/80 transition-colors group">
            <td className="px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                  <ListTodo className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium text-[11px] text-slate-900">{assignment.title}</span>
              </div>
            </td>
            <td className="px-5 py-4">
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-[11px] text-slate-800">{assignment.course}</span>
                <span className="text-[10px] text-slate-500">{assignment.batch} • {assignment.teacher}</span>
              </div>
            </td>
            <td className="px-5 py-4">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {assignment.dueDate}
              </div>
            </td>
            <td className="px-5 py-4">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {assignment.submissions} / {assignment.totalStudents}
              </div>
            </td>
            <td className="px-5 py-4">
              <StatusBadge status={assignment.status} />
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

"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, ListTodo, Calendar, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";

type Assignment = {
  id: string;
  title: string;
  classroom: string;
  dueDate: string;
  submissions: number;
  totalStudents: number;
  status: "Active" | "Upcoming" | "Completed";
};

const initialAssignments: Assignment[] = [
  { id: "1", title: "ER Diagram Design", classroom: "DBMS (PGDIT Spring 2026)", dueDate: "Oct 25, 2026", submissions: 38, totalStudents: 42, status: "Active" },
  { id: "2", title: "SQL Queries Practice", classroom: "DBMS (PGDIT Spring 2026)", dueDate: "Nov 02, 2026", submissions: 0, totalStudents: 42, status: "Upcoming" },
  { id: "3", title: "Agile Case Study", classroom: "Software Eng (PGDIT Spring 2026)", dueDate: "Oct 20, 2026", submissions: 38, totalStudents: 38, status: "Completed" },
];

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredAssignments = assignments.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.classroom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <PageHeader 
        title="Class Assignments" 
        description="Create and manage homework assignments for your classrooms."
      />

      <SearchInput 
        placeholder="Search assignments by title or classroom..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        actionButton={
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 bg-brand-dark text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-all font-medium text-[11px] shadow-sm whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Assignment
          </button>
        }
      />

      <DataTable 
        columns={["Assignment Details", "Classroom", "Due Date", "Submissions", "Status", "Actions"]}
        isEmpty={filteredAssignments.length === 0}
        emptyStateIcon={ListTodo}
        emptyStateTitle="No assignments found"
        emptyStateDescription="You haven't created any assignments matching your search."
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
              <span className="text-[10px] text-brand-dark/70 font-medium bg-brand-dark/5 px-1.5 py-0.5 rounded-md border border-brand-dark/10">
                {assignment.classroom}
              </span>
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
              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 text-slate-400 hover:text-brand-dark rounded-md hover:bg-slate-100 transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Assignment"
        footer={
          <>
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="px-3 py-2 text-[11px] font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="px-3 py-2 text-[11px] font-medium text-white bg-brand-dark hover:bg-brand-dark/90 rounded-lg shadow-sm transition-all"
            >
              Publish Assignment
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Assignment Title</label>
            <input type="text" placeholder="e.g. ER Diagram Design" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <label className="text-[11px] font-medium text-slate-700">Assign to Classroom <span className="text-red-500">*</span></label>
            <select required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
              <option value="" disabled selected>Select one of your classrooms</option>
              <option value="DBMS">Database Management System (PGDIT Spring 2026)</option>
              <option value="SE">Software Engineering (PGDIT Spring 2026)</option>
            </select>
            <p className="text-[10px] text-slate-500">The assignment will be distributed to all students enrolled in this specific batch.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Due Date <span className="text-red-500">*</span></label>
              <input required type="date" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Total Marks</label>
              <input type="number" placeholder="e.g. 100" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Instructions / Description</label>
            <textarea rows={3} placeholder="Describe the requirements..." className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all resize-none"></textarea>
          </div>
        </div>
      </Modal>
    </div>
  );
}

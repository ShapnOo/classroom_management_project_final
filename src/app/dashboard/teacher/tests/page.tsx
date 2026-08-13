"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, FileText, Calendar, Users, Award } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";

type ClassTest = {
  id: string;
  title: string;
  classroom: string;
  testDate: string;
  submissions: number;
  totalStudents: number;
  totalMarks: number;
  status: "Active" | "Upcoming" | "Completed";
};

const initialTests: ClassTest[] = [
  { id: "1", title: "Midterm: Normalization", classroom: "DBMS (PGDIT Spring 2026)", testDate: "Oct 25, 2026", submissions: 40, totalStudents: 42, totalMarks: 50, status: "Active" },
  { id: "2", title: "Quiz 1: SQL Basics", classroom: "DBMS (PGDIT Spring 2026)", testDate: "Nov 02, 2026", submissions: 0, totalStudents: 42, totalMarks: 20, status: "Upcoming" },
  { id: "3", title: "Final Exam", classroom: "Software Eng (PGDIT Spring 2026)", testDate: "Dec 15, 2026", submissions: 38, totalStudents: 38, totalMarks: 100, status: "Completed" },
];

export default function ClassTestsPage() {
  const [tests, setTests] = useState<ClassTest[]>(initialTests);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredTests = tests.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.classroom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <PageHeader 
        title="Class Tests & Quizzes" 
        description="Schedule and manage examinations for your classrooms."
      />

      <SearchInput 
        placeholder="Search tests by title or classroom..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        actionButton={
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 bg-brand-dark text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-all font-medium text-[11px] shadow-sm whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Schedule Test
          </button>
        }
      />

      <DataTable 
        columns={["Test Details", "Classroom", "Test Date", "Submissions", "Status", "Actions"]}
        isEmpty={filteredTests.length === 0}
        emptyStateIcon={FileText}
        emptyStateTitle="No tests found"
        emptyStateDescription="You haven't scheduled any tests matching your search."
      >
        {filteredTests.map((test) => (
          <tr key={test.id} className="hover:bg-slate-50/80 transition-colors group">
            <td className="px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600 border border-pink-100 shadow-sm shrink-0 mt-0.5">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-medium text-[11px] text-slate-900 block mb-0.5">{test.title}</span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                    <Award className="w-3 h-3 text-amber-500" />
                    {test.totalMarks} Marks
                  </span>
                </div>
              </div>
            </td>
            <td className="px-5 py-4">
              <span className="text-[10px] text-brand-dark/70 font-medium bg-brand-dark/5 px-1.5 py-0.5 rounded-md border border-brand-dark/10">
                {test.classroom}
              </span>
            </td>
            <td className="px-5 py-4">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {test.testDate}
              </div>
            </td>
            <td className="px-5 py-4">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {test.submissions} / {test.totalStudents}
              </div>
            </td>
            <td className="px-5 py-4">
              <StatusBadge status={test.status} />
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
        title="Schedule Class Test"
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
              Publish Test
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Test Title</label>
            <input type="text" placeholder="e.g. Midterm: Normalization" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <label className="text-[11px] font-medium text-slate-700">Assign to Classroom <span className="text-red-500">*</span></label>
            <select required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
              <option value="" disabled selected>Select one of your classrooms</option>
              <option value="DBMS">Database Management System (PGDIT Spring 2026)</option>
              <option value="SE">Software Engineering (PGDIT Spring 2026)</option>
            </select>
            <p className="text-[10px] text-slate-500">The test will be distributed to all students enrolled in this specific batch.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Test Date <span className="text-red-500">*</span></label>
              <input required type="date" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Total Marks <span className="text-red-500">*</span></label>
              <input required type="number" placeholder="e.g. 50" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Instructions / Details</label>
            <textarea rows={3} placeholder="Describe the topics covered, duration, etc..." className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all resize-none"></textarea>
          </div>
        </div>
      </Modal>
    </div>
  );
}

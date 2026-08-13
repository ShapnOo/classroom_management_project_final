"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";

type Course = {
  id: string;
  code: string;
  name: string;
  batch: string;
  credits: number;
  assignedTeacher: string;
  status: "Active" | "Upcoming" | "Completed";
};

const initialCourses: Course[] = [
  { id: "1", code: "CS101", name: "Introduction to Computer Science", batch: "Batch 28", credits: 3, assignedTeacher: "Dr. Alan Turing", status: "Active" },
  { id: "2", code: "MTH201", name: "Calculus I", batch: "Batch 28", credits: 4, assignedTeacher: "Prof. Sarah Jenkins", status: "Active" },
  { id: "3", code: "PHY101", name: "Physics I", batch: "Batch 29", credits: 3, assignedTeacher: "Dr. Richard Feynman", status: "Upcoming" },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredCourses = courses.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.batch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <PageHeader 
        title="Courses" 
        description="Manage courses within specific batches and assign teachers."
      />

      <SearchInput 
        placeholder="Search courses..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        actionButton={
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 bg-brand-dark text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-all font-medium text-[11px] shadow-sm whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Course
          </button>
        }
      />

      <DataTable 
        columns={["Course Code", "Course Name", "Batch", "Credits", "Assigned Teacher", "Status", "Actions"]}
        isEmpty={filteredCourses.length === 0}
        emptyStateIcon={BookOpen}
        emptyStateTitle="No courses found"
        emptyStateDescription="We couldn't find any courses matching your search."
      >
        {filteredCourses.map((course) => (
          <tr key={course.id} className="hover:bg-slate-50/80 transition-colors group">
            <td className="px-5 py-4">
              <span className="font-semibold text-brand-dark bg-brand-dark/5 px-2 py-0.5 rounded-md text-[11px] border border-brand-dark/10">
                {course.code}
              </span>
            </td>
            <td className="px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium text-[11px] text-slate-900">{course.name}</span>
              </div>
            </td>
            <td className="px-5 py-4 text-[11px] font-medium text-slate-600">{course.batch}</td>
            <td className="px-5 py-4 text-[11px] font-medium text-slate-600">{course.credits} Cr.</td>
            <td className="px-5 py-4 text-[11px] font-medium text-slate-600">{course.assignedTeacher}</td>
            <td className="px-5 py-4">
              <StatusBadge status={course.status} />
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
        title="Add New Course"
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
              Save Course
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Course Code</label>
              <input type="text" placeholder="e.g. CS101" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Credits</label>
              <input type="number" placeholder="e.g. 3" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Course Name</label>
            <input type="text" placeholder="e.g. Introduction to Computer Science" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <label className="text-[11px] font-medium text-slate-700">Assign to Batch <span className="text-red-500">*</span></label>
              <select required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
                <option value="" disabled selected>Select a batch</option>
                <option value="Batch 28">Batch 28</option>
                <option value="Batch 29">Batch 29</option>
                <option value="Batch 27">Batch 27</option>
              </select>
            </div>
            
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <label className="text-[11px] font-medium text-slate-700">Assign Teacher <span className="text-red-500">*</span></label>
              <select required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
                <option value="" disabled selected>Select a teacher</option>
                <option value="Dr. Alan Turing">Dr. Alan Turing</option>
                <option value="Prof. Sarah Jenkins">Prof. Sarah Jenkins</option>
                <option value="Dr. Richard Feynman">Dr. Richard Feynman</option>
              </select>
            </div>
          </div>
          <p className="text-[10px] text-slate-500">A course must be linked to a specific batch and a primary teacher.</p>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Status</label>
            <select className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
              <option value="Upcoming">Upcoming</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}

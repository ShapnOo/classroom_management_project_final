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
  status: "Active" | "Upcoming" | "Completed";
};

const initialCourses: Course[] = [
  { id: "1", code: "CS101", name: "Introduction to Computer Science", batch: "Batch 28", credits: 3, status: "Active" },
  { id: "2", code: "MTH201", name: "Calculus I", batch: "Batch 28", credits: 4, status: "Active" },
  { id: "3", code: "PHY101", name: "Physics I", batch: "Batch 29", credits: 3, status: "Upcoming" },
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
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Academic Courses" 
        description="Manage courses and assign them to specific batches."
        actionButton={
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-brand-dark text-white px-4 py-2.5 rounded-lg hover:bg-brand-dark/90 transition-all font-medium text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Course
          </button>
        }
      />

      <SearchInput 
        placeholder="Search courses by name, code, or batch..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        totalCount={courses.length}
        totalLabel="Total Courses"
      />

      <DataTable 
        columns={["Course Code", "Course Name", "Batch", "Credits", "Status", "Actions"]}
        isEmpty={filteredCourses.length === 0}
        emptyStateIcon={BookOpen}
        emptyStateTitle="No courses found"
        emptyStateDescription="We couldn't find any courses matching your search."
      >
        {filteredCourses.map((course) => (
          <tr key={course.id} className="hover:bg-slate-50/80 transition-colors group">
            <td className="px-6 py-4">
              <span className="font-semibold text-brand-dark bg-brand-dark/5 px-2.5 py-1 rounded-md text-sm border border-brand-dark/10">
                {course.code}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="font-medium text-slate-900">{course.name}</span>
              </div>
            </td>
            <td className="px-6 py-4 text-sm text-slate-600">{course.batch}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{course.credits} Cr.</td>
            <td className="px-6 py-4">
              <StatusBadge status={course.status} />
            </td>
            <td className="px-6 py-4 text-right">
              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-slate-400 hover:text-brand-dark rounded-lg hover:bg-slate-100 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
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
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2.5 text-sm font-medium text-white bg-brand-dark hover:bg-brand-dark/90 rounded-lg shadow-sm transition-all"
            >
              Save Course
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Course Code</label>
              <input type="text" placeholder="e.g. CS101" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Credits</label>
              <input type="number" placeholder="e.g. 3" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Course Name</label>
            <input type="text" placeholder="e.g. Introduction to Computer Science" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Assign to Batch <span className="text-red-500">*</span></label>
            <select required className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all bg-white text-slate-600">
              <option value="" disabled selected>Select a batch</option>
              <option value="Batch 28">Batch 28</option>
              <option value="Batch 29">Batch 29</option>
              <option value="Batch 27">Batch 27</option>
            </select>
            <p className="text-xs text-slate-500">A course must be linked to a specific batch.</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Status</label>
            <select className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all bg-white text-slate-600">
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

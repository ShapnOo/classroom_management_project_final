"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, ListTodo } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";

type SyllabusItem = {
  id: string;
  topic: string;
  course: string;
  week: number;
  status: "Draft" | "Published" | "Archived";
};

const initialSyllabus: SyllabusItem[] = [
  { id: "1", topic: "Introduction & Environment Setup", course: "CS101 (Batch 28)", week: 1, status: "Published" },
  { id: "2", topic: "Basic Data Types & Variables", course: "CS101 (Batch 28)", week: 2, status: "Published" },
  { id: "3", topic: "Functions and Limits", course: "MTH201 (Batch 28)", week: 1, status: "Draft" },
];

export default function SyllabusPage() {
  const [syllabusItems, setSyllabusItems] = useState<SyllabusItem[]>(initialSyllabus);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredItems = syllabusItems.filter(s => 
    s.topic.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColorMap = () => ({
    Published: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Draft: "bg-amber-100 text-amber-700 border-amber-200",
    Archived: "bg-slate-100 text-slate-700 border-slate-200",
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Course Syllabus" 
        description="Manage topics and syllabus items for your courses."
        actionButton={
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-brand-dark text-white px-4 py-2.5 rounded-lg hover:bg-brand-dark/90 transition-all font-medium text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Topic
          </button>
        }
      />

      <SearchInput 
        placeholder="Search syllabus by topic or course..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        totalCount={syllabusItems.length}
        totalLabel="Syllabus Topics"
      />

      <DataTable 
        columns={["Topic / Module", "Course", "Schedule", "Status", "Actions"]}
        isEmpty={filteredItems.length === 0}
        emptyStateIcon={ListTodo}
        emptyStateTitle="No syllabus topics found"
        emptyStateDescription="We couldn't find any topics matching your search."
      >
        {filteredItems.map((item) => (
          <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shadow-sm">
                  <ListTodo className="w-4 h-4" />
                </div>
                <span className="font-medium text-slate-900">{item.topic}</span>
              </div>
            </td>
            <td className="px-6 py-4 text-sm text-slate-600 font-medium">{item.course}</td>
            <td className="px-6 py-4 text-sm text-slate-600">Week {item.week}</td>
            <td className="px-6 py-4">
              <StatusBadge status={item.status} colorMap={getStatusColorMap()} />
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
        title="Add Syllabus Topic"
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
              Save Topic
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Topic Title</label>
            <input type="text" placeholder="e.g. Variables and Functions" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Assign to Course <span className="text-red-500">*</span></label>
            <select required className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all bg-white text-slate-600">
              <option value="" disabled selected>Select a course</option>
              <option value="CS101">CS101 - Intro to CS (Batch 28)</option>
              <option value="MTH201">MTH201 - Calculus I (Batch 28)</option>
              <option value="PHY101">PHY101 - Physics I (Batch 29)</option>
            </select>
            <p className="text-xs text-slate-500">Syllabus topics must be assigned directly to a specific course.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Schedule (Week)</label>
              <input type="number" placeholder="e.g. 1" min="1" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <select className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all bg-white text-slate-600">
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Topic Description</label>
            <textarea rows={3} placeholder="Briefly describe what will be covered..." className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all resize-none"></textarea>
          </div>
        </div>
      </Modal>
    </div>
  );
}

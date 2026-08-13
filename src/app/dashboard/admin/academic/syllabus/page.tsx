"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, ListTodo } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { syllabus, classrooms } from "@/lib/mockData";

const adminStatusColorMap = {
  Published: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Draft: "bg-amber-100 text-amber-700 border-amber-200",
  Archived: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function SyllabusPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredItems = syllabus.filter(s =>
    s.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <PageHeader
        title="Course Syllabus"
        description="Define and manage topics and modules for each course. These topics power the Teacher's continuity tracker."
      />

      <SearchInput
        placeholder="Search syllabus topics..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        actionButton={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 bg-brand-dark text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-all font-medium text-[11px] shadow-sm whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Topic
          </button>
        }
      />

      <DataTable
        columns={["Topic Title", "Key Concepts", "Course", "Week", "Status", "Actions"]}
        isEmpty={filteredItems.length === 0}
        emptyStateIcon={ListTodo}
        emptyStateTitle="No syllabus topics found"
        emptyStateDescription="We couldn't find any topics matching your search."
      >
        {filteredItems.map((item) => (
          <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
            <td className="px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shadow-sm ${
                  item.status === "done" ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                  : item.status === "current" ? "bg-blue-50 text-blue-600 border-blue-100"
                  : "bg-purple-50 text-purple-600 border-purple-100"
                }`}>
                  <ListTodo className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-medium text-[11px] text-slate-900 block">{item.topic}</span>
                  <span className={`text-[9px] font-medium uppercase tracking-wide ${
                    item.status === "done" ? "text-emerald-600"
                    : item.status === "current" ? "text-blue-600"
                    : "text-slate-400"
                  }`}>
                    {item.status === "done" ? "Completed" : item.status === "current" ? "In Progress" : "Pending"}
                  </span>
                </div>
              </div>
            </td>
            <td className="px-5 py-4">
              <div className="flex flex-col gap-1">
                {item.subTopics.map((sub, i) => (
                  <span key={i} className="text-[10px] text-slate-500 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    {sub}
                  </span>
                ))}
              </div>
            </td>
            <td className="px-5 py-4 text-[11px] font-medium text-slate-600">{item.course}</td>
            <td className="px-5 py-4 text-[11px] font-medium text-slate-600">Week {item.week}</td>
            <td className="px-5 py-4">
              <StatusBadge status={item.adminStatus} colorMap={adminStatusColorMap} />
            </td>
            <td className="px-5 py-4 text-right">
              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 text-slate-400 hover:text-brand-dark rounded-md hover:bg-slate-100 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Syllabus Topic"
        footer={
          <>
            <button onClick={() => setIsAddModalOpen(false)} className="px-3 py-2 text-[11px] font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
            <button onClick={() => setIsAddModalOpen(false)} className="px-3 py-2 text-[11px] font-medium text-white bg-brand-dark hover:bg-brand-dark/90 rounded-lg shadow-sm transition-all">Save Topic</button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Topic Title</label>
            <input type="text" placeholder="e.g. Normalization (1NF–3NF)" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700 flex justify-between items-center">
              Key Concepts (Sub-topics)
              <span className="text-[10px] text-brand-dark cursor-pointer hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add Concept</span>
            </label>
            <div className="space-y-2">
              <input type="text" placeholder="e.g. 1NF" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
              <input type="text" placeholder="e.g. 2NF" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
            <p className="text-[10px] text-slate-500 pt-1">These concepts will be checked off by the teacher during class sessions.</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <label className="text-[11px] font-medium text-slate-700">Assign to Course <span className="text-red-500">*</span></label>
            <select required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
              <option value="" disabled>Select a course</option>
              {classrooms.map(c => (
                <option key={c.id} value={c.id}>{c.courseCode} – {c.courseTitle} ({c.batch})</option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500">Syllabus topics must be assigned directly to a specific course.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Week Number</label>
              <input type="number" placeholder="e.g. 1" min="1" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Status</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
                <option>Draft</option><option>Published</option><option>Archived</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

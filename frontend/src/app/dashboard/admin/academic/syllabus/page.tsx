"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, ListTodo } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { useStore } from "@/lib/store";
import type { SyllabusTopic } from "@/lib/types";

type Form = Omit<SyllabusTopic, "id">;
const EMPTY: Form = {
  courseId: "", topic: "", week: 1,
  subTopics: ["", ""], teacherStatus: "pending", adminStatus: "Draft"
};

const statusColors = {
  Published: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Draft:     "bg-amber-100  text-amber-700  border-amber-200",
  Archived:  "bg-slate-100  text-slate-700  border-slate-200",
};

export default function SyllabusPage() {
  const { syllabusTopics, courses, addSyllabusTopic, updateSyllabusTopic, deleteSyllabusTopic } = useStore();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<SyllabusTopic | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);

  const filtered = syllabusTopics.filter(s =>
    s.topic.toLowerCase().includes(search.toLowerCase()) ||
    courses.find(c => c.id === s.courseId)?.title.toLowerCase().includes(search.toLowerCase()) ||
    courses.find(c => c.id === s.courseId)?.code.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setForm(EMPTY); setIsOpen(true); };
  const openEdit = (s: SyllabusTopic) => { setEditing(s); setForm({ courseId: s.courseId, topic: s.topic, week: s.week, subTopics: [...s.subTopics], teacherStatus: s.teacherStatus, adminStatus: s.adminStatus }); setIsOpen(true); };
  const handleSave = () => {
    if (!form.topic || !form.courseId) return;
    const clean = { ...form, subTopics: form.subTopics.filter(t => t.trim()) };
    if (editing) updateSyllabusTopic(editing.id, clean);
    else addSyllabusTopic(clean);
    setIsOpen(false);
  };

  const getCourse = (id: string) => courses.find(c => c.id === id);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <PageHeader title="Course Syllabus" description="Define topics and modules per course. Teachers see these as their continuity tracker and 'Up Next' guide." />

      <SearchInput placeholder="Search by topic or course..." value={search} onChange={e => setSearch(e.target.value)}
        actionButton={
          <button onClick={openAdd} className="flex items-center gap-1.5 bg-brand-dark text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-all font-medium text-[11px] shadow-sm whitespace-nowrap">
            <Plus className="w-3.5 h-3.5" /> Add Topic
          </button>
        }
      />

      <DataTable columns={["Topic Title", "Key Concepts", "Course", "Week", "Teacher Progress", "Status", "Actions"]}
        isEmpty={filtered.length === 0} emptyStateIcon={ListTodo} emptyStateTitle="No syllabus topics" emptyStateDescription="Add topics to courses so teachers can track continuity.">
        {filtered.map(item => {
          const course = getCourse(item.courseId);
          return (
            <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
              <td className="px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shadow-sm ${item.teacherStatus === "done" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : item.teacherStatus === "current" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-purple-50 text-purple-600 border-purple-100"}`}>
                    <ListTodo className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium text-[11px] text-slate-900">{item.topic}</span>
                </div>
              </td>
              <td className="px-5 py-4">
                <div className="flex flex-col gap-0.5">
                  {item.subTopics.map((sub, i) => (
                    <span key={i} className="text-[10px] text-slate-500 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-300" />{sub}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-5 py-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-medium text-slate-800">{course?.title ?? "—"}</span>
                  <span className="text-[9px] font-medium text-brand-dark bg-brand-dark/5 px-1.5 py-0.5 rounded w-fit">{course?.code}</span>
                </div>
              </td>
              <td className="px-5 py-4 text-[11px] font-medium text-slate-600">Week {item.week}</td>
              <td className="px-5 py-4">
                <span className={`text-[9px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full ${item.teacherStatus === "done" ? "bg-emerald-100 text-emerald-700" : item.teacherStatus === "current" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                  {item.teacherStatus}
                </span>
              </td>
              <td className="px-5 py-4">
                <StatusBadge status={item.adminStatus} colorMap={statusColors} />
              </td>
              <td className="px-5 py-4 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(item)} className="p-1.5 text-slate-400 hover:text-brand-dark rounded-md hover:bg-slate-100 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteSyllabusTopic(item.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </td>
            </tr>
          );
        })}
      </DataTable>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? "Edit Topic" : "Add Syllabus Topic"}
        footer={<>
          <button onClick={() => setIsOpen(false)} className="px-3 py-2 text-[11px] font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-3 py-2 text-[11px] font-medium text-white bg-brand-dark hover:bg-brand-dark/90 rounded-lg shadow-sm transition-all">Save Topic</button>
        </>}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Topic Title <span className="text-red-500">*</span></label>
            <input type="text" placeholder="e.g. Normalization (1NF–3NF)" value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700 flex justify-between items-center">
              Key Concepts (Sub-topics)
              <button type="button" onClick={() => setForm(f => ({ ...f, subTopics: [...f.subTopics, ""] }))} className="text-[10px] text-brand-dark hover:underline flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add
              </button>
            </label>
            <div className="space-y-2">
              {form.subTopics.map((sub, i) => (
                <input key={i} type="text" placeholder={`Concept ${i+1}`} value={sub} onChange={e => setForm(f => ({ ...f, subTopics: f.subTopics.map((s, j) => j === i ? e.target.value : s) }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
              ))}
            </div>
            <p className="text-[10px] text-slate-500">Teachers will see these as a checklist during class.</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <label className="text-[11px] font-medium text-slate-700">Assign to Course <span className="text-red-500">*</span></label>
            <select value={form.courseId} onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
              <option value="">Select a course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Week Number</label>
              <input type="number" min={1} value={form.week} onChange={e => setForm(f => ({ ...f, week: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Status</label>
              <select value={form.adminStatus} onChange={e => setForm(f => ({ ...f, adminStatus: e.target.value as SyllabusTopic["adminStatus"] }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
                <option>Draft</option><option>Published</option><option>Archived</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

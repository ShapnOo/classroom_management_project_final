"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { useStore } from "@/lib/store";
import type { Course } from "@/lib/types";

type Form = Omit<Course, "id">;
const EMPTY: Form = { code: "", title: "", programId: "", credits: 3, semester: 1 };

// Classroom status mapping for display
const CLASSROOM_STATUS_MAP: Record<string, "Active" | "Upcoming" | "Completed"> = {
  ongoing: "Active", upcoming: "Upcoming", completed: "Completed"
};

export default function CoursesPage() {
  const { courses, programs, classrooms, teachers, addCourse, updateCourse, deleteCourse } = useStore();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setForm(EMPTY); setIsOpen(true); };
  const openEdit = (c: Course) => { setEditing(c); setForm({ code: c.code, title: c.title, programId: c.programId, credits: c.credits, semester: c.semester }); setIsOpen(true); };
  const handleSave = () => {
    if (!form.code || !form.title || !form.programId) return;
    if (editing) updateCourse(editing.id, form);
    else addCourse(form);
    setIsOpen(false);
  };

  const getClassroomsForCourse = (courseId: string) => classrooms.filter(cls => cls.courseId === courseId);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <PageHeader title="Courses" description="Create courses and assign them to programs. Courses are then assigned to batches + teachers via Classrooms." />

      <SearchInput placeholder="Search courses by name or code..." value={search} onChange={e => setSearch(e.target.value)}
        actionButton={
          <button onClick={openAdd} className="flex items-center gap-1.5 bg-brand-dark text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-all font-medium text-[11px] shadow-sm whitespace-nowrap">
            <Plus className="w-3.5 h-3.5" /> Add Course
          </button>
        }
      />

      <DataTable columns={["Course Code", "Course Name", "Program", "Credits", "Active Classrooms", "Actions"]}
        isEmpty={filtered.length === 0} emptyStateIcon={BookOpen} emptyStateTitle="No courses found" emptyStateDescription="Add courses to assign them to classrooms.">
        {filtered.map(course => {
          const program = programs.find(p => p.id === course.programId);
          const activeClassrooms = getClassroomsForCourse(course.id);
          const teacher = activeClassrooms.length > 0
            ? teachers.find(t => t.id === activeClassrooms[0].teacherId)
            : null;
          return (
            <tr key={course.id} className="hover:bg-slate-50/80 transition-colors group">
              <td className="px-5 py-4">
                <span className="font-semibold text-brand-dark bg-brand-dark/5 px-2 py-0.5 rounded-md text-[11px] border border-brand-dark/10">{course.code}</span>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm"><BookOpen className="w-3.5 h-3.5" /></div>
                  <div>
                    <span className="font-medium text-[11px] text-slate-900 block">{course.title}</span>
                    {teacher && <span className="text-[9px] text-slate-500">Teacher: {teacher.name}</span>}
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-[11px] font-medium text-slate-600">{program?.code ?? "—"}</td>
              <td className="px-5 py-4 text-[11px] font-medium text-slate-600">{course.credits} Cr.</td>
              <td className="px-5 py-4">
                <div className="flex gap-1.5 flex-wrap">
                  {activeClassrooms.length > 0
                    ? activeClassrooms.map(cls => (
                      <StatusBadge key={cls.id} status={CLASSROOM_STATUS_MAP[cls.status]} />
                    ))
                    : <span className="text-[10px] text-slate-400">No classrooms</span>
                  }
                </div>
              </td>
              <td className="px-5 py-4 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(course)} className="p-1.5 text-slate-400 hover:text-brand-dark rounded-md hover:bg-slate-100 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteCourse(course.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </td>
            </tr>
          );
        })}
      </DataTable>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? "Edit Course" : "Add New Course"}
        footer={<>
          <button onClick={() => setIsOpen(false)} className="px-3 py-2 text-[11px] font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-3 py-2 text-[11px] font-medium text-white bg-brand-dark hover:bg-brand-dark/90 rounded-lg shadow-sm transition-all">Save Course</button>
        </>}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Course Code <span className="text-red-500">*</span></label>
              <input type="text" placeholder="e.g. CSE-305" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Credits</label>
              <input type="number" min={1} max={6} value={form.credits} onChange={e => setForm(f => ({ ...f, credits: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Course Title <span className="text-red-500">*</span></label>
            <input type="text" placeholder="e.g. Database Management Systems" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Program <span className="text-red-500">*</span></label>
              <select value={form.programId} onChange={e => setForm(f => ({ ...f, programId: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
                <option value="">Select a program</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Semester</label>
              <input type="number" min={1} max={12} value={form.semester} onChange={e => setForm(f => ({ ...f, semester: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">After creating a course, go to <strong>Classrooms</strong> to assign it to a batch and teacher.</p>
        </div>
      </Modal>
    </div>
  );
}

"use client";

import {
  FileText, Search, Plus, ArrowLeft, Calendar,
  Users, Edit2, Trash2, Clock, CheckCircle2
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import type { Test } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";

interface AdminTestsProps {
  courseId?: string; // classroomId
}

type Form = Omit<Test, "id" | "submissions">;
const EMPTY: Form = {
  classroomId: "", title: "", description: "",
  testDate: "", duration: "1h 30m", totalMarks: 50, status: "Upcoming"
};

function pct(a: number, b: number) {
  return b === 0 ? 0 : Math.round((a / b) * 100);
}

export default function AdminTests({ courseId }: AdminTestsProps) {
  const { getAllClassroomViews, tests, addTest, updateTest, deleteTest } = useStore();
  const allClassrooms = getAllClassroomViews();

  const [search, setSearch]   = useState("");
  const [isOpen, setIsOpen]   = useState(false);
  const [editing, setEditing] = useState<Test | null>(null);
  const [form, setForm]       = useState<Form>({ ...EMPTY, classroomId: courseId ?? "" });

  // ── CLASSROOM PICKER ──────────────────────────────────────────────────────
  if (!courseId) {
    return (
      <div className="space-y-4 animate-in fade-in duration-500 pb-12">
        <div className="pb-4 border-b border-slate-200">
          <h2 className="text-[13px] font-medium text-slate-900">Class Tests</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Select a classroom to manage its tests and quizzes.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allClassrooms.map(({ classroom: cls, course, batch, session, tests: clsTests, colors }) => {
            const upcoming = clsTests.filter(t => t.status === "Upcoming").length;
            const done = clsTests.filter(t => t.status === "Completed").length;
            return (
              <Link key={cls.id} href={`/dashboard/admin/academic/tests/${cls.id}`} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-brand-dark/40 hover:shadow-md transition-all group block">
                <div className={`h-1 w-full rounded-full ${colors.color} mb-4`} />
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded uppercase ${colors.light} ${colors.text}`}>{course.code}</span>
                  <span className="text-[10px] text-slate-400">{session.name}</span>
                </div>
                <h3 className="text-[13px] font-medium text-slate-900 group-hover:text-brand-dark transition-colors">{course.title}</h3>
                <p className="text-[10px] text-slate-500 mt-1">{batch.name} • {clsTests.length} tests</p>
                <div className="mt-4 flex gap-3 text-[11px]">
                  {upcoming > 0 && <span className="text-blue-600 font-medium">{upcoming} Upcoming</span>}
                  {done > 0 && <span className="text-emerald-600 font-medium">{done} Done</span>}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // ── CLASSROOM DETAIL ──────────────────────────────────────────────────────
  const view = allClassrooms.find(v => v.classroom.id === courseId);
  if (!view) return <div className="text-[11px] text-slate-500 py-8 text-center">Classroom not found.</div>;

  const { classroom: cls, course, batch, session, students, colors } = view;
  const clsTests = tests.filter(t => t.classroomId === courseId);
  const filtered = clsTests.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY, classroomId: courseId }); setIsOpen(true); };
  const openEdit = (t: Test) => { setEditing(t); setForm({ classroomId: t.classroomId, title: t.title, description: t.description ?? "", testDate: t.testDate, duration: t.duration ?? "1h 30m", totalMarks: t.totalMarks, status: t.status }); setIsOpen(true); };
  const handleSave = () => {
    if (!form.title || !form.testDate) return;
    if (editing) updateTest(editing.id, form);
    else addTest({ ...form, submissions: 0 });
    setIsOpen(false);
  };

  const DURATIONS = ["15m","30m","45m","1h","1h 15m","1h 30m","2h","2h 30m","3h"];

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin/academic/tests" className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 transition-colors shadow-sm shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-semibold px-2 py-0.5 rounded uppercase ${colors.light} ${colors.text}`}>{course.code}</span>
              <span className="text-[10px] text-slate-500">{session.name} • {batch.name}</span>
            </div>
            <h1 className="text-[13px] font-semibold text-slate-900 mt-0.5">{course.title}</h1>
          </div>
        </div>
        <button onClick={openAdd} className="flex items-center gap-1.5 bg-brand-dark text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-all font-medium text-[11px] shadow-sm whitespace-nowrap">
          <Plus className="w-3.5 h-3.5" /> Add Test
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Tests", value: clsTests.length, color: "text-slate-700", bg: "bg-slate-50" },
          { label: "Upcoming", value: clsTests.filter(t => t.status === "Upcoming").length, color: "text-blue-700", bg: "bg-blue-50" },
          { label: "Active", value: clsTests.filter(t => t.status === "Active").length, color: "text-amber-700", bg: "bg-amber-50" },
          { label: "Completed", value: clsTests.filter(t => t.status === "Completed").length, color: "text-emerald-700", bg: "bg-emerald-50" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl border border-slate-200 p-4 text-center`}>
            <p className={`text-[18px] font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-slate-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-full max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input type="text" placeholder="Search tests..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-dark/20 focus:border-brand-dark" />
      </div>

      {/* Test Cards */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center bg-slate-50 rounded-xl border border-slate-200 border-dashed">
          <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="text-[11px] font-medium text-slate-700">No tests yet</p>
          <p className="text-[10px] text-slate-500 mt-0.5 mb-3">Create quizzes, CT, or exams for this classroom</p>
          <button onClick={openAdd} className="text-[11px] font-medium bg-brand-dark text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors shadow-sm">+ Add Test</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(test => (
            <div key={test.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col group overflow-hidden">
              <div className="p-4 flex-1">
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
                    test.status === "Active"    ? "bg-amber-100 text-amber-700" :
                    test.status === "Upcoming"  ? "bg-blue-100 text-blue-700" :
                                                   "bg-emerald-100 text-emerald-700"
                  }`}>{test.status}</span>
                  <div className="flex gap-0.5">
                    <button onClick={() => openEdit(test)} className="p-1.5 text-slate-300 hover:text-slate-600 rounded transition-colors"><Edit2 className="w-3 h-3" /></button>
                    <button onClick={() => deleteTest(test.id)} className="p-1.5 text-slate-300 hover:text-red-500 rounded transition-colors"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
                <h3 className="text-[13px] font-medium text-slate-900 group-hover:text-brand-dark transition-colors line-clamp-2 mb-3">{test.title}</h3>
                {test.description && <p className="text-[10px] text-slate-500 mb-3 line-clamp-2">{test.description}</p>}
                <div className="space-y-2 text-[11px] text-slate-600">
                  <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-slate-400" />Date: <strong className="text-slate-900">{new Date(test.testDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</strong></div>
                  <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-slate-400" />Duration: <strong className="text-slate-900">{test.duration ?? "N/A"}</strong></div>
                  <div className="flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-slate-400" />Max Marks: <strong className="text-slate-900">{test.totalMarks}</strong></div>
                </div>
                {test.status === "Completed" && (
                  <div className="mt-4">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-slate-500 flex items-center gap-1"><Users className="w-3 h-3" />Submissions</span>
                      <span className="font-medium text-brand-dark">{test.submissions}/{students.length}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-dark rounded-full" style={{ width: `${pct(test.submissions, students.length)}%` }} />
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex gap-2">
                <button onClick={() => openEdit(test)} className="flex-1 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-[11px] font-medium hover:bg-slate-100 transition-colors shadow-sm">Edit</button>
                <Link href={`/dashboard/admin/academic/tests/${courseId}/evaluate/${test.id}`} className="flex-1 py-1.5 bg-brand-dark text-white rounded-lg text-[11px] font-medium hover:bg-slate-800 transition-colors shadow-sm text-center">Enter Marks</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? "Edit Test" : "Add Test / Quiz"}
        footer={<>
          <button onClick={() => setIsOpen(false)} className="px-3 py-2 text-[11px] font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-3 py-2 text-[11px] font-medium text-white bg-brand-dark hover:bg-brand-dark/90 rounded-lg shadow-sm transition-all">{editing ? "Update" : "Create Test"}</button>
        </>}
      >
        <div className="space-y-4">
          <div className="bg-brand-dark/5 border border-brand-dark/10 rounded-lg px-3 py-2.5">
            <p className="text-[10px] font-medium text-brand-dark uppercase tracking-wide mb-0.5">For Classroom</p>
            <p className="text-[12px] font-semibold text-slate-900">{course.title}</p>
            <p className="text-[10px] text-slate-500">{batch.name} • {students.length} students</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Test Title <span className="text-red-500">*</span></label>
            <input type="text" placeholder="e.g. Midterm Exam / SQL Quiz 1" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Description (Optional)</label>
            <textarea rows={2} placeholder="Topics covered, instructions..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Test Date <span className="text-red-500">*</span></label>
              <input type="date" value={form.testDate} onChange={e => setForm(f => ({ ...f, testDate: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Duration</label>
              <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
                {DURATIONS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Total Marks</label>
              <input type="number" min={1} value={form.totalMarks} onChange={e => setForm(f => ({ ...f, totalMarks: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Test["status"] }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
                <option>Upcoming</option><option>Active</option><option>Completed</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

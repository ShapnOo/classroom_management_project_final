"use client";

import {
  ListTodo, Search, Plus, ArrowLeft, Calendar, Users,
  X, FileCheck, Paperclip, MoreVertical, CheckCircle2,
  Clock, Edit2, Trash2, BookOpen
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import type { Assignment } from "@/lib/types";

interface AdminAssignmentsProps {
  courseId?: string; // classroomId
}



export default function AdminAssignments({ courseId }: AdminAssignmentsProps) {
  const { getAllClassroomViews, assignments } = useStore();
  const allClassrooms = getAllClassroomViews();

  const [search, setSearch] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  // ── BATCH / CLASSROOM PICKER ──────────────────────────────────────────────────────
  if (!courseId) {
    if (!selectedBatchId) {
      const uniqueBatches = Array.from(new Map(allClassrooms.map(c => [c.batch.id, c.batch])).values());
      return (
        <div className="space-y-4 animate-in fade-in duration-500 pb-12">
          <div className="pb-4 border-b border-slate-200">
            <h2 className="text-[13px] font-medium text-slate-900">Select Batch</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Select a batch to manage its assignments.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uniqueBatches.map(b => {
              const batchClasses = allClassrooms.filter(c => c.batch.id === b.id);
              return (
                <button key={b.id} onClick={() => setSelectedBatchId(b.id)} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-brand-dark/40 hover:shadow-md transition-all group block text-left">
                  <div className="h-1 w-full rounded-full bg-slate-200 group-hover:bg-brand-dark/40 transition-colors mb-4" />
                  <h3 className="text-[13px] font-medium text-slate-900 group-hover:text-brand-dark transition-colors">{b.name}</h3>
                  <p className="text-[10px] text-slate-500 mt-1">{batchClasses.length} courses</p>
                </button>
              );
            })}
          </div>
        </div>
      );
    } else {
      const batchClasses = allClassrooms.filter(c => c.batch.id === selectedBatchId);
      const batchInfo = batchClasses[0]?.batch;
      return (
        <div className="space-y-4 animate-in fade-in duration-500 pb-12">
          <div className="pb-4 border-b border-slate-200 flex items-center gap-3">
            <button onClick={() => setSelectedBatchId(null)} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 text-slate-600 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-[13px] font-medium text-slate-900">Courses in {batchInfo?.name}</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Select a course to manage its assignments.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batchClasses.map(({ classroom: cls, course, batch, session, assignments: clsAssn, colors }) => {
              const active = clsAssn.filter(a => a.status === "Active").length;
              const pending = clsAssn.reduce((s, a) => s + (a.status !== "Completed" ? a.submissions : 0), 0);
              return (
                <Link key={cls.id} href={`/dashboard/admin/academic/assignments/${cls.id}`} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-brand-dark/40 hover:shadow-md transition-all group block">
                  <div className={`h-1 w-full rounded-full ${colors.color} mb-4`} />
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded uppercase ${colors.light} ${colors.text}`}>{course.code}</span>
                    <span className="text-[10px] text-slate-400">{session.name}</span>
                  </div>
                  <h3 className="text-[13px] font-medium text-slate-900 group-hover:text-brand-dark transition-colors">{course.title}</h3>
                  <p className="text-[10px] text-slate-500 mt-1">{batch.name} • {clsAssn.length} total</p>
                  <div className="mt-4 flex gap-3 text-[11px]">
                    <span className="text-amber-600 font-medium flex items-center gap-1"><Clock className="w-3 h-3" />{active} Active</span>
                    {pending > 0 && <span className="text-red-600 font-medium">{pending} to Grade</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      );
    }
  }

  // ── CLASSROOM DETAIL ──────────────────────────────────────────────────────
  const view = allClassrooms.find(v => v.classroom.id === courseId);
  if (!view) return <div className="text-[11px] text-slate-500 py-8 text-center">Classroom not found.</div>;

  const { classroom: cls, course, batch, session, students, colors } = view;
  const clsAssignments = assignments.filter(a => a.classroomId === courseId);
  const filtered = clsAssignments.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));



  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin/academic/assignments" className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 transition-colors shadow-sm shrink-0">
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
        </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: clsAssignments.length, color: "text-slate-700", bg: "bg-slate-50" },
          { label: "Active", value: clsAssignments.filter(a => a.status === "Active").length, color: "text-amber-700", bg: "bg-amber-50" },
          { label: "Completed", value: clsAssignments.filter(a => a.status === "Completed").length, color: "text-emerald-700", bg: "bg-emerald-50" },
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
        <input type="text" placeholder="Search assignments..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-dark/20 focus:border-brand-dark" />
      </div>

      {/* Assignment Cards */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center bg-slate-50 rounded-xl border border-slate-200 border-dashed">
          <ListTodo className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="text-[11px] font-medium text-slate-700">No assignments yet</p>
          <p className="text-[10px] text-slate-500 mt-0.5 mb-3">No assignments for this classroom</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(asn => (
            <div key={asn.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col group overflow-hidden">
              <div className="p-4 flex-1">
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
                    asn.status === "Active" ? "bg-amber-100 text-amber-700" :
                    asn.status === "Upcoming" ? "bg-blue-100 text-blue-700" :
                    "bg-emerald-100 text-emerald-700"
                  }`}>
                    {asn.status}
                  </span>
                </div>
                <h3 className="text-[13px] font-medium text-slate-900 group-hover:text-brand-dark transition-colors line-clamp-2 mb-3">{asn.title}</h3>
                {asn.description && <p className="text-[10px] text-slate-500 mb-3 line-clamp-2">{asn.description}</p>}
                <div className="space-y-2 text-[11px] text-slate-600">
                  <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-slate-400" />Due: <strong className="text-slate-900">{asn.dueDate}</strong></div>
                  <div className="flex items-center gap-2"><FileCheck className="w-3.5 h-3.5 text-slate-400" />Max Marks: <strong className="text-slate-900">{asn.totalMarks}</strong></div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-slate-500 flex items-center gap-1"><Users className="w-3 h-3" />Submissions</span>
                    <span className="font-medium text-brand-dark">{asn.submissions}/{students.length}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-dark rounded-full" style={{ width: `${pct(asn.submissions, students.length)}%` }} />
                  </div>
                  {asn.status === "Active" && students.length - asn.submissions > 0 && (
                    <p className="text-[10px] text-amber-600 font-medium mt-1.5 text-right">{students.length - asn.submissions} pending</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

function pct(a: number, b: number) {
  return b === 0 ? 0 : Math.round((a / b) * 100);
}

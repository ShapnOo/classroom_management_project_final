"use client";

import { useStore } from "@/lib/store";

export default function TeacherEvaluation() {
  const { getMyClassroomViews } = useStore();
  const myClassrooms = getMyClassroomViews();
  // Use classroom data for the evaluation selector
  // The rest of the existing evaluation UI remains, just driven by store data
  const mockClassrooms = myClassrooms.map(v => ({
    id: v.classroom.id,
    name: v.course.title,
    code: v.course.code,
    batch: v.batch.name,
    students: v.students,
  }));

  // Re-export for the existing component body
  return <TeacherEvaluationBody classrooms={mockClassrooms} />;
}

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, Users, Search, Filter, Download, CheckCircle2,
  AlertTriangle, TrendingUp, Star, ChevronDown
} from "lucide-react";

type ClassroomOption = { id: string; name: string; code: string; batch: string; students: { id: string; name: string; rollNo: string }[] };

function TeacherEvaluationBody({ classrooms }: { classrooms: ClassroomOption[] }) {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"grades" | "attendance" | "overview">("overview");

  const selectedClass = classrooms.find(c => c.id === selectedClassId);

  // Generate mock grade data for students
  const gradeData = useCallback(() => {
    if (!selectedClass) return [];
    return selectedClass.students.map((student, i) => ({
      ...student,
      ct: 70 + Math.floor(Math.random() * 30),
      assignment: 60 + Math.floor(Math.random() * 40),
      attendance: 70 + Math.floor(Math.random() * 30),
      midterm: 55 + Math.floor(Math.random() * 45),
      final: 0,
      total: 0,
      grade: ["A+","A","A-","B+","B","B-","C+","C"][i % 8],
    })).map(s => ({ ...s, total: Math.round((s.ct * 0.15 + s.assignment * 0.20 + s.attendance * 0.10 + s.midterm * 0.30) / 0.75) }));
  }, [selectedClass]);

  const students = gradeData().filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNo.toLowerCase().includes(search.toLowerCase())
  );

  if (!selectedClassId) {
    return (
      <div className="space-y-4 animate-in fade-in duration-500 pb-12">
        <div className="pb-4 border-b border-slate-200">
          <h2 className="text-[13px] font-medium text-slate-900">Select a Classroom</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Choose a classroom to view and manage student grades and evaluations.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {classrooms.map(cls => (
            <button key={cls.id} onClick={() => setSelectedClassId(cls.id)} className="bg-white border border-slate-200 rounded-xl p-5 text-left hover:border-brand-dark/40 hover:shadow-md transition-all group">
              <span className="text-[10px] font-semibold text-brand-dark bg-brand-dark/5 border border-brand-dark/10 px-2 py-0.5 rounded uppercase">{cls.code}</span>
              <h3 className="mt-2 text-[13px] font-medium text-slate-900 group-hover:text-brand-dark transition-colors leading-snug">{cls.name}</h3>
              <p className="text-[10px] text-slate-500 mt-1">{cls.batch} • {cls.students.length} students</p>
            </button>
          ))}
        </div>
        {classrooms.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-[12px]">No classrooms assigned yet. Contact admin.</div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <button onClick={() => setSelectedClassId(null)} className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 transition-colors shadow-sm"><ArrowLeft className="w-4 h-4" /></button>
        <div>
          <h2 className="text-[13px] font-medium text-slate-900">{selectedClass?.name} — Evaluation</h2>
          <p className="text-[10px] text-slate-500">{selectedClass?.batch} • {selectedClass?.code}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {(["overview","grades","attendance"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all capitalize ${activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>{tab}</button>
        ))}
      </div>

      {/* Search + download */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input type="text" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-dark/20 focus:border-brand-dark" />
        </div>
        <button className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 border border-slate-200 bg-white px-3 py-1.5 rounded-md hover:bg-slate-50 transition-colors">
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>

      {/* Grades Table */}
      {activeTab === "grades" && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                  <th className="px-4 py-2.5">Student</th>
                  <th className="px-4 py-2.5">CT (15%)</th>
                  <th className="px-4 py-2.5">Assignment (20%)</th>
                  <th className="px-4 py-2.5">Attendance (10%)</th>
                  <th className="px-4 py-2.5">Midterm (30%)</th>
                  <th className="px-4 py-2.5">Total</th>
                  <th className="px-4 py-2.5">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors text-[11px]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{s.name}</p>
                      <p className="text-[10px] text-slate-500">{s.rollNo}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{s.ct}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{s.assignment}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{s.attendance}%</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{s.midterm}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{s.total}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${s.grade.startsWith("A") ? "bg-emerald-100 text-emerald-700" : s.grade.startsWith("B") ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{s.grade}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Students", value: selectedClass?.students.length ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Class Average", value: "74%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Highest Grade", value: "A+", icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
              <div>
                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-[11px] text-slate-500 font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "attendance" && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                  <th className="px-4 py-2.5">Student</th>
                  <th className="px-4 py-2.5">Attendance %</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors text-[11px]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{s.name}</p>
                      <p className="text-[10px] text-slate-500">{s.rollNo}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${s.attendance >= 75 ? "bg-emerald-500" : "bg-red-500"}`} style={{ width: `${s.attendance}%` }} />
                        </div>
                        <span className="font-medium text-slate-700">{s.attendance}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 w-fit ${s.attendance >= 75 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {s.attendance >= 75 ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {s.attendance >= 75 ? "Regular" : "At Risk"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

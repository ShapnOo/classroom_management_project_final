"use client";

import {
  ClipboardCheck, Search, ArrowLeft, Download, Calendar,
  Users, AlertCircle, CheckCircle2, Clock, ChevronDown
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";

interface AdminAttendanceProps {
  courseId?: string; // classroomId
}

function pct(a: number, b: number) {
  return b === 0 ? 0 : Math.round((a / b) * 100);
}

function statusColor(p: number) {
  if (p >= 85) return { bg: "bg-emerald-100", text: "text-emerald-700", label: "Excellent" };
  if (p >= 75) return { bg: "bg-blue-100", text: "text-blue-700", label: "Good" };
  if (p >= 60) return { bg: "bg-amber-100", text: "text-amber-700", label: "Warning" };
  return { bg: "bg-red-100", text: "text-red-700", label: "Critical" };
}

export default function AdminAttendance({ courseId }: AdminAttendanceProps) {
  const { getAllClassroomViews, classSessions, attendanceRecords } = useStore();
  const allClassrooms = getAllClassroomViews();

  const [activeTab, setActiveTab] = useState<"students" | "sessions">("students");
  const [search, setSearch] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  // If a classroomId is provided, show that classroom's attendance
  const view = courseId ? allClassrooms.find(v => v.classroom.id === courseId) : null;

  // ── BATCH / CLASSROOM PICKER ──────────────────────────────────────────────────────
  if (!courseId || !view) {
    if (!selectedBatchId) {
      const uniqueBatches = Array.from(new Map(allClassrooms.map(c => [c.batch.id, c.batch])).values());
      return (
        <div className="space-y-4 animate-in fade-in duration-500 pb-12">
          <div className="pb-4 border-b border-slate-200">
            <h2 className="text-[13px] font-medium text-slate-900">Select Batch</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Select a batch to view its attendance records.</p>
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
              <p className="text-[11px] text-slate-500 mt-0.5">Select a course to view its attendance records.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batchClasses.map(({ classroom: cls, course, batch, students, colors, teacher }) => {
              const sessions = classSessions.filter(s => s.classroomId === cls.id);
              const totalPresent = attendanceRecords.filter(r => r.classroomId === cls.id && r.status === "present").length;
              const totalMarked  = attendanceRecords.filter(r => r.classroomId === cls.id).length;
              const classAvg = pct(totalPresent, totalMarked);
              const sc = statusColor(classAvg);
              return (
                <Link key={cls.id} href={`/dashboard/admin/academic/attendance/${cls.id}`} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-brand-dark/40 hover:shadow-md transition-all group block">
                  <div className={`h-1 w-full rounded-full ${colors.color} mb-4`} />
                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded uppercase ${colors.light} ${colors.text}`}>{course.code}</span>
                  <h3 className="mt-2 text-[13px] font-medium text-slate-900 group-hover:text-brand-dark transition-colors">{course.title}</h3>
                  <p className="text-[10px] text-slate-500 mt-1">{batch.name} • Teacher: {teacher.name}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-[10px] text-slate-500">{sessions.length} sessions conducted</div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                      {classAvg > 0 ? `${classAvg}% avg` : "No data"}
                    </span>
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
  const { classroom: cls, course, batch, session, students, colors } = view;
  const sessions = classSessions
    .filter(s => s.classroomId === cls.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Per-student stats
  const studentStats = students.map(student => {
    const records = attendanceRecords.filter(r => r.classroomId === cls.id && r.studentId === student.id);
    const present = records.filter(r => r.status === "present").length;
    const absent  = records.filter(r => r.status === "absent").length;
    const late    = records.filter(r => r.status === "late").length;
    const percentage = pct(present + late, sessions.length);
    return { ...student, present, absent, late, total: sessions.length, percentage };
  });

  const filteredStudents = studentStats.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNo.toLowerCase().includes(search.toLowerCase())
  );

  // Summary
  const avgAttendance = students.length > 0
    ? Math.round(studentStats.reduce((sum, s) => sum + s.percentage, 0) / students.length)
    : 0;
  const atRisk = studentStats.filter(s => s.percentage < 75).length;

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <Link href="/dashboard/admin/academic/attendance" className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 transition-colors shadow-sm shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded uppercase ${colors.light} ${colors.text}`}>{course.code}</span>
            <span className="text-[10px] text-slate-500">{session.name}</span>
          </div>
          <h1 className="text-[13px] font-semibold text-slate-900 mt-0.5">{course.title}</h1>
          <p className="text-[10px] text-slate-500">{batch.name}</p>
        </div>
        <div className="ml-auto">
          <button className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 border border-slate-200 bg-white px-3 py-1.5 rounded-md hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Sessions", value: sessions.length, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Total Students", value: students.length, icon: Users, color: "text-slate-600", bg: "bg-slate-50" },
          { label: "Avg Attendance", value: `${avgAttendance}%`, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "At Risk (<75%)", value: atRisk, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${stat.bg}`}><stat.icon className={`w-4 h-4 ${stat.color}`} /></div>
            <div>
              <p className="text-[17px] font-bold text-slate-900">{stat.value}</p>
              <p className="text-[10px] text-slate-500 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {(["students","sessions"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 text-[11px] font-medium rounded-md transition-all capitalize ${activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>{tab}</button>
        ))}
      </div>

      {/* Search */}
      {activeTab === "students" && (
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input type="text" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-dark/20 focus:border-brand-dark" />
        </div>
      )}

      {/* Students Tab */}
      {activeTab === "students" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {sessions.length === 0 ? (
            <div className="py-10 text-center text-[11px] text-slate-500">
              <ClipboardCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              No sessions conducted yet. Start a class session to mark attendance.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                    <th className="px-4 py-2.5">#</th>
                    <th className="px-4 py-2.5">Student</th>
                    <th className="px-4 py-2.5 text-center">Present</th>
                    <th className="px-4 py-2.5 text-center">Absent</th>
                    <th className="px-4 py-2.5 text-center">Late</th>
                    <th className="px-4 py-2.5">Attendance %</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((s, idx) => {
                    const sc = statusColor(s.percentage);
                    return (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors text-[11px]">
                        <td className="px-4 py-3 text-slate-400 font-medium">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{s.name}</p>
                          <p className="text-[10px] text-slate-500">{s.rollNo}</p>
                        </td>
                        <td className="px-4 py-3 text-center font-medium text-emerald-700">{s.present}</td>
                        <td className="px-4 py-3 text-center font-medium text-red-600">{s.absent}</td>
                        <td className="px-4 py-3 text-center font-medium text-amber-600">{s.late}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${s.percentage >= 75 ? "bg-emerald-500" : "bg-red-500"}`} style={{ width: `${s.percentage}%` }} />
                            </div>
                            <span className="font-semibold text-slate-800">{s.percentage}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>{sc.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === "sessions" && (
        <div className="space-y-2">
          {sessions.length === 0 ? (
            <div className="py-10 text-center text-[11px] text-slate-500 bg-white rounded-xl border border-slate-200">
              No sessions conducted yet.
            </div>
          ) : sessions.map((sess, idx) => {
            const sessRecords   = attendanceRecords.filter(r => r.sessionId === sess.id);
            const presentCount  = sessRecords.filter(r => r.status === "present").length;
            const absentCount   = sessRecords.filter(r => r.status === "absent").length;
            const lateCount     = sessRecords.filter(r => r.status === "late").length;
            const sessPct       = pct(presentCount + lateCount, students.length);
            return (
              <div key={sess.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0 mt-0.5`}>
                      {sessions.length - idx}
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-slate-900">{sess.topicCovered}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{new Date(sess.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} • {sess.duration}</p>
                      {sess.notes && <p className="text-[10px] text-slate-500 mt-1 italic">{sess.notes}</p>}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-[14px] font-bold ${sessPct >= 75 ? "text-emerald-700" : "text-red-600"}`}>{sessPct}%</p>
                    <p className="text-[9px] text-slate-500">attendance</p>
                  </div>
                </div>
                {sessRecords.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4 text-[11px]">
                    <span className="text-emerald-700 font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />{presentCount} Present</span>
                    <span className="text-red-600 font-medium">{absentCount} Absent</span>
                    <span className="text-amber-600 font-medium">{lateCount} Late</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

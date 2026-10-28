"use client";

import {
  ClipboardCheck, Search, ArrowLeft, Download, Calendar,
  Users, AlertCircle, CheckCircle2, Clock, ChevronDown,
  LayoutGrid, List as ListIcon, BookOpen, User, Eye
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { DataTable } from "@/components/ui/DataTable";
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
  const { 
    getAllClassroomViews, classSessions, attendanceRecords,
    fetchAttendanceRecords, fetchClassSessions, fetchClassrooms, fetchStudents, fetchBatches
  } = useStore();
  const allClassrooms = getAllClassroomViews();

  useEffect(() => {
    fetchAttendanceRecords();
    fetchClassSessions();
    fetchClassrooms();
    fetchStudents();
    fetchBatches();
  }, []);

  const [activeTab, setActiveTab] = useState<"students" | "sessions">("students");
  const [search, setSearch] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "cards">("list");

  // If a classroomId is provided, show that classroom's attendance
  const view = courseId ? allClassrooms.find(v => v.classroom.id === courseId) : null;

  // ── CLASSROOM DETAIL VIEW (when courseId is provided) ─────────────────────────────
  if (courseId && view) {
    const { classroom: cls, course, batch, session, students, colors } = view;
    const sessions = classSessions
      .filter(s => s.classroomId === cls.id)
      .sort((a, b) => b.conductedAt ? new Date(b.conductedAt).getTime() - new Date(a.conductedAt).getTime() : 0);

    // Per-student stats
    const studentStats = students.map(student => {
      const records = attendanceRecords.filter(r => r.classroomId === cls.id && r.studentId === student.id);
      const present = records.filter(r => r.status === "present").length;
      const absent  = records.filter(r => r.status === "absent").length;
      const late    = records.filter(r => r.status === "late").length;
      const percentage = pct(present + late, Math.max(sessions.length, 1));
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
          <Link href="/dashboard/admin/academic/attendance" className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 transition-colors shadow-2xs shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-semibold px-2 py-0.5 rounded uppercase ${colors.light} ${colors.text}`}>{course.code}</span>
              <span className="text-[10px] text-slate-500">{session.name}</span>
            </div>
            <h1 className="text-[13px] font-semibold text-slate-900 mt-0.5">{course.title} Attendance</h1>
            <p className="text-[10px] text-slate-500">{batch.name}</p>
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

        {/* Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
            {(["students","sessions"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 text-[11px] font-medium rounded-md transition-all capitalize ${activeTab === tab ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-700"}`}>{tab}</button>
            ))}
          </div>

          {activeTab === "students" && (
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input type="text" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-dark/20 focus:border-brand-dark" />
            </div>
          )}
        </div>

        {/* Students Tab */}
        {activeTab === "students" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {sessions.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500">
                <ClipboardCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                No sessions conducted yet. Start a class session to mark attendance.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
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
                        <tr key={s.id} className="hover:bg-slate-50 transition-colors text-xs">
                          <td className="px-4 py-3 text-slate-400 font-medium">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-900">{s.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{s.rollNo}</p>
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-emerald-700">{s.present}</td>
                          <td className="px-4 py-3 text-center font-bold text-red-600">{s.absent}</td>
                          <td className="px-4 py-3 text-center font-bold text-amber-600">{s.late}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${s.percentage >= 75 ? "bg-emerald-500" : "bg-red-500"}`} style={{ width: `${s.percentage}%` }} />
                              </div>
                              <span className="font-bold text-slate-800">{s.percentage}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>{sc.label}</span>
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
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {sessions.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500">
                <ClipboardCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                No class sessions logged yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                      <th className="px-4 py-2.5">Date</th>
                      <th className="px-4 py-2.5">Topic Covered</th>
                      <th className="px-4 py-2.5">Duration</th>
                      <th className="px-4 py-2.5 text-center">Present</th>
                      <th className="px-4 py-2.5 text-center">Absent</th>
                      <th className="px-4 py-2.5 text-center">Turnout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sessions.map((sess) => {
                      const records = attendanceRecords.filter(r => r.sessionId === sess.id);
                      const present = records.filter(r => r.status === "present").length;
                      const absent = records.filter(r => r.status === "absent").length;
                      const turnout = pct(present, Math.max(records.length, 1));
                      return (
                        <tr key={sess.id} className="hover:bg-slate-50 transition-colors text-xs">
                          <td className="px-4 py-3 font-medium text-slate-700">
                            {new Date(sess.conductedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900">{sess.topicCovered}</td>
                          <td className="px-4 py-3 text-slate-600">{sess.duration}</td>
                          <td className="px-4 py-3 text-center font-bold text-emerald-700">{present}</td>
                          <td className="px-4 py-3 text-center font-bold text-red-600">{absent}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-bold text-slate-800">{turnout}%</span>
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
      </div>
    );
  }

  // ── GLOBAL ATTENDANCE LEDGER VIEW ────────────────────────────────────────────────
  const uniqueBatches = Array.from(new Map(allClassrooms.map(c => [c.batch.id, c.batch])).values());

  const attendanceViews = allClassrooms.map(clsView => {
    const { classroom: cls } = clsView;
    const sessions = classSessions.filter(s => s.classroomId === cls.id);
    const totalPresent = attendanceRecords.filter(r => r.classroomId === cls.id && r.status === "present").length;
    const totalMarked = attendanceRecords.filter(r => r.classroomId === cls.id).length;
    const classAvg = pct(totalPresent, totalMarked);
    const sc = statusColor(classAvg);
    return {
      clsView,
      sessionsCount: sessions.length,
      classAvg,
      sc
    };
  });

  const filtered = attendanceViews.filter(({ clsView, classAvg }) => {
    if (selectedBatchId && selectedBatchId !== "all" && clsView.batch.id !== selectedBatchId) return false;
    if (statusFilter === "good" && classAvg < 75) return false;
    if (statusFilter === "at_risk" && classAvg >= 75) return false;
    const matchSearch =
      clsView.course.title.toLowerCase().includes(search.toLowerCase()) ||
      clsView.course.code.toLowerCase().includes(search.toLowerCase()) ||
      clsView.teacher.name.toLowerCase().includes(search.toLowerCase()) ||
      clsView.batch.name.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const globalAvg = attendanceViews.length > 0
    ? Math.round(attendanceViews.reduce((acc, v) => acc + v.classAvg, 0) / attendanceViews.length)
    : 0;

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-[13px] font-medium text-slate-900">Attendance Ledger</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Centralized tracking of classroom attendance, session frequencies, and student presence rates.</p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Active Classrooms", value: allClassrooms.length, color: "text-slate-700", bg: "bg-slate-50" },
          { label: "Total Sessions Held", value: classSessions.length, color: "text-blue-700", bg: "bg-blue-50" },
          { label: "Global Attendance Avg", value: `${globalAvg}%`, color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "Courses At Risk (<75%)", value: attendanceViews.filter(v => v.classAvg < 75 && v.sessionsCount > 0).length, color: "text-amber-700", bg: "bg-amber-50" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl border border-slate-200 p-4 text-center`}>
            <p className={`text-[18px] font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-slate-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters & View Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search course, teacher, or batch..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 placeholder:text-slate-400"
            />
          </div>

          <select
            value={selectedBatchId}
            onChange={e => setSelectedBatchId(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold outline-none focus:border-indigo-500"
          >
            <option value="all">All Batches ({allClassrooms.length} courses)</option>
            {uniqueBatches.map(b => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold outline-none focus:border-indigo-500"
          >
            <option value="all">All Attendance Levels</option>
            <option value="good">Good (≥ 75%)</option>
            <option value="at_risk">At Risk (&lt; 75%)</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg p-0.5 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === "list"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
            title="List View"
          >
            <ListIcon className="w-3.5 h-3.5" /> List
          </button>
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === "cards"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
            title="Cards View"
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Cards
          </button>
        </div>
      </div>

      {/* Content: List (Default) or Cards */}
      {viewMode === "list" ? (
        <DataTable
          columns={["Course / Classroom", "Batch", "Teacher", "Sessions Conducted", "Attendance Avg", "Status", "Actions"]}
          isEmpty={filtered.length === 0}
          emptyStateIcon={ClipboardCheck}
          emptyStateTitle="No attendance records found"
          emptyStateDescription="Try adjusting your filters or record attendance in active sessions."
        >
          {filtered.map(({ clsView, sessionsCount, classAvg, sc }) => (
            <tr key={clsView.classroom.id} className="hover:bg-slate-50/80 transition-colors group text-xs">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${clsView.colors.light} ${clsView.colors.text}`}>
                        {clsView.course.code}
                      </span>
                      <p className="font-semibold text-slate-900 text-xs">{clsView.course.title}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">{clsView.session.name}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3.5 text-slate-600 font-medium">
                {clsView.batch.name}
              </td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {clsView.teacher.name}
                </div>
              </td>
              <td className="px-5 py-3.5 font-medium text-slate-700">
                {sessionsCount} sessions
              </td>
              <td className="px-5 py-3.5">
                <div className="w-28">
                  <div className="flex justify-between text-[10px] mb-1 font-semibold">
                    <span className="text-slate-800">{classAvg > 0 ? `${classAvg}%` : "No data"}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${classAvg >= 75 ? "bg-emerald-500" : classAvg > 0 ? "bg-amber-500" : "bg-slate-200"}`} style={{ width: `${Math.max(classAvg, 4)}%` }} />
                  </div>
                </div>
              </td>
              <td className="px-5 py-3.5">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                  {classAvg > 0 ? sc.label : "Unrecorded"}
                </span>
              </td>
              <td className="px-5 py-3.5 text-right">
                <Link
                  href={`/dashboard/admin/academic/attendance/${clsView.classroom.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[11px] font-medium hover:bg-slate-800 transition-colors shadow-2xs whitespace-nowrap"
                >
                  <Eye className="w-3 h-3 text-indigo-300" /> View Ledger
                </Link>
              </td>
            </tr>
          ))}
        </DataTable>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(({ clsView, sessionsCount, classAvg, sc }) => (
            <Link
              key={clsView.classroom.id}
              href={`/dashboard/admin/academic/attendance/${clsView.classroom.id}`}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-400 hover:shadow-md transition-all group block"
            >
              <div className={`h-1 w-full rounded-full ${clsView.colors.color} mb-4`} />
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${clsView.colors.light} ${clsView.colors.text}`}>
                  {clsView.course.code}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                  {classAvg > 0 ? `${classAvg}% avg` : "No data"}
                </span>
              </div>
              <h3 className="text-[13px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{clsView.course.title}</h3>
              <p className="text-[10px] text-slate-500 mt-1">{clsView.batch.name} • Teacher: {clsView.teacher.name}</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>{sessionsCount} sessions conducted</span>
                <span className="text-indigo-600 font-bold group-hover:translate-x-0.5 transition-transform">View →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

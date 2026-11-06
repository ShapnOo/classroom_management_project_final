"use client";

import { 
  MonitorPlay,
  Search,
  BookOpen,
  GraduationCap,
  Clock,
  MapPin,
  User,
  ListTodo,
  FileText,
  Calendar,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Sparkles,
  LayoutGrid,
  List as ListIcon
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import { TableSkeleton } from "@/components/ui/Skeleton";
import Link from "next/link";

export default function StudentClassrooms() {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "ongoing" | "upcoming" | "completed">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  useEffect(() => {
    loadClassrooms();
  }, []);

  const loadClassrooms = () => {
    setLoading(true);
    api.getStudentClassrooms()
      .then((data) => {
        setClassrooms(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.warn("Could not load student classrooms API:", err);
      })
      .finally(() => setLoading(false));
  };

  const filtered = useMemo(() => {
    return classrooms.filter((cls) => {
      if (statusFilter !== "all" && cls.status?.toLowerCase() !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        cls.course_title?.toLowerCase().includes(q) ||
        cls.course_code?.toLowerCase().includes(q) ||
        cls.teacher_name?.toLowerCase().includes(q) ||
        cls.room?.toLowerCase().includes(q) ||
        (cls.semester && cls.semester.toLowerCase().includes(q))
      );
    });
  }, [classrooms, statusFilter, searchQuery]);

  if (loading && classrooms.length === 0) {
    return <TableSkeleton rows={6} cols={5} />;
  }

  return (
    <div className="w-full mx-auto space-y-5 pb-12 animate-in fade-in duration-300">
      
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MonitorPlay className="w-5 h-5 text-brand-dark" />
            My Enrolled Classrooms ({classrooms.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active course sections, designated lecture halls, faculty contacts, and syllabus progression
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search course, semester, faculty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400 shadow-2xs"
            />
          </div>

          {/* View Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "list" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
              title="Compact List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "grid" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
              title="Card / Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={loadClassrooms}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs cursor-pointer"
            title="Refresh Classrooms"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Filter Pills ───────────────────────────────────────────────────── */}
      <div className="flex items-center flex-wrap gap-1.5 bg-slate-50/70 p-2 rounded-xl border border-slate-200/80">
        {(["all", "ongoing", "upcoming", "completed"] as const).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer ${
              statusFilter === st
                ? "bg-brand-dark text-white shadow-xs"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
            }`}
          >
            {st === "all" ? "All Courses" : st === "ongoing" ? "Running / Ongoing" : st} ({st === "all" ? classrooms.length : classrooms.filter((c) => c.status?.toLowerCase() === st).length})
          </button>
        ))}
      </div>

      {/* ── Classrooms List or Grid Display ─────────────────────────────────── */}
      {viewMode === "list" ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-2.5 px-4">Course Info</th>
                  <th className="py-2.5 px-4">Semester</th>
                  <th className="py-2.5 px-4">Instructor</th>
                  <th className="py-2.5 px-4">Room & Schedule</th>
                  <th className="py-2.5 px-4">Syllabus Progress</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((cls) => {
                  const progress = cls.progress || 50;
                  const schedules = cls.schedules || [];
                  const isOngoing = cls.status === "ongoing";
                  const isCompleted = cls.status === "completed";

                  return (
                    <tr key={cls.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="font-bold text-slate-900">{cls.course_title}</div>
                        <div className="text-[11px] font-mono text-brand-dark font-semibold">
                          {cls.course_code} • {cls.course_credits || 3} Credits
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="font-bold text-slate-800">{cls.semester || "Semester 1"}</span>
                        <div className="text-[11px] text-slate-500">{cls.batch_name}</div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-slate-800">{cls.teacher_name}</div>
                        <div className="text-[10px] text-slate-400">{cls.teacher_designation || "Faculty Member"}</div>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        <div className="font-semibold text-slate-800">{cls.room}</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {schedules.length > 0
                            ? `${schedules[0].day?.slice(0, 3)}: ${schedules[0].start_time}`
                            : "Scheduled"}
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-brand-dark h-full rounded-full" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="font-bold text-slate-700 text-[11px]">{progress}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider inline-flex items-center gap-1 ${
                            isOngoing
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              : isCompleted
                              ? "bg-slate-100 text-slate-600"
                              : "bg-amber-50 text-amber-700 border border-amber-200/60"
                          }`}
                        >
                          {isOngoing && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                          {cls.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href="/dashboard/student/materials"
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                          >
                            <BookOpen className="w-3 h-3" />
                            Materials
                          </Link>
                          <Link
                            href="/dashboard/student/assignments"
                            className="px-2.5 py-1 bg-brand-dark hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition-all shadow-xs inline-flex items-center gap-1"
                          >
                            <ListTodo className="w-3 h-3" />
                            Assignments
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((cls) => {
            const progress = cls.progress || 50;
            const schedules = cls.schedules || [];

            return (
              <div 
                key={cls.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-brand-dark/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  {/* Course Header & Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-brand-dark bg-brand-dark/10 px-2 py-0.5 rounded">
                          {cls.course_code}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {cls.semester || "Semester 1"}
                        </span>
                        {cls.course_credits && (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {cls.course_credits} Cr
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          cls.status === 'ongoing' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : cls.status === 'completed'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-amber-100 text-amber-800'
                        }`}>
                          {cls.status}
                        </span>
                      </div>

                      <h2 className="text-sm font-bold text-slate-900 leading-snug">
                        {cls.course_title}
                      </h2>
                    </div>
                  </div>

                  {/* Faculty & Room Details */}
                  <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Instructor:</span>
                      <strong className="text-slate-800 font-bold">{cls.teacher_name}</strong>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Location:</span>
                      <span className="text-slate-700 font-semibold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {cls.room}
                      </span>
                    </div>
                  </div>

                  {/* Schedule Timings */}
                  {schedules.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex flex-wrap gap-1">
                        {schedules.map((s: any, idx: number) => (
                          <span key={idx} className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {s.day.slice(0, 3)}: {s.start_time} - {s.end_time}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Syllabus Progress */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-slate-500">Syllabus Completion</span>
                      <span className="text-brand-dark font-bold">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-200/80 flex items-center justify-between gap-2">
                  <Link
                    href="/dashboard/student/materials"
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Materials</span>
                  </Link>

                  <Link
                    href="/dashboard/student/assignments"
                    className="px-2.5 py-1 bg-brand-dark hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <ListTodo className="w-3.5 h-3.5" />
                    <span>Assignments</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="py-12 text-center bg-white rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-slate-700">No matching classrooms found</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Try adjusting your search query or status filter.</p>
        </div>
      )}

    </div>
  );
}

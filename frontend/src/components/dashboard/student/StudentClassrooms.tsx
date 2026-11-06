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
  Sparkles
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
        cls.room?.toLowerCase().includes(q)
      );
    });
  }, [classrooms, statusFilter, searchQuery]);

  if (loading && classrooms.length === 0) {
    return <TableSkeleton rows={6} cols={5} />;
  }

  return (
    <div className="w-full mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search course or faculty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400 shadow-xs"
            />
          </div>

          <button
            type="button"
            onClick={loadClassrooms}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-xs"
            title="Refresh Classrooms"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Filter Pills ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {(["all", "ongoing", "upcoming", "completed"] as const).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
              statusFilter === st
                ? "bg-brand-dark text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            {st} ({st === "all" ? classrooms.length : classrooms.filter((c) => c.status?.toLowerCase() === st).length})
          </button>
        ))}
      </div>

      {/* ── High-Density Classrooms List ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((cls) => {
          const progress = cls.progress || 50;
          const schedules = cls.schedules || [];

          return (
            <div 
              key={cls.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-brand-dark/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                
                {/* Course Header & Badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-brand-dark bg-brand-dark/10 px-2 py-0.5 rounded">
                        {cls.course_code}
                      </span>
                      {cls.course_credits && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {cls.course_credits} Credits
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
                <div className="p-3 bg-slate-50 rounded-lg space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Instructor:</span>
                    <strong className="text-slate-800 font-bold">{cls.teacher_name}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Designation:</span>
                    <span className="text-slate-600">{cls.teacher_designation || "Faculty Member"}</span>
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
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weekly Timetable Slots</p>
                    <div className="flex flex-wrap gap-1.5">
                      {schedules.map((s: any, idx: number) => (
                        <span key={idx} className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {s.day.slice(0, 3)}: {s.start_time} - {s.end_time}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Syllabus Progress */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-slate-500">Syllabus Completion</span>
                    <span className="text-brand-dark font-bold">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  {cls.current_topic && (
                    <p className="text-[10px] text-slate-500">
                      Current Focus: <strong className="text-slate-700">{cls.current_topic}</strong>
                    </p>
                  )}
                </div>

              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3.5 border-t border-slate-200/80 flex items-center justify-between gap-2">
                <Link
                  href="/dashboard/student/materials"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Course Materials</span>
                </Link>

                <Link
                  href="/dashboard/student/assignments"
                  className="px-3 py-1.5 bg-brand-dark hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <ListTodo className="w-3.5 h-3.5" />
                  <span>Assignments</span>
                </Link>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border border-slate-200">
            <p className="text-sm font-semibold text-slate-700">No matching classrooms found</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or status filter.</p>
          </div>
        )}
      </div>

    </div>
  );
}

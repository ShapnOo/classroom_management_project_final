"use client";

import {
  Users, Clock, Play, FolderOpen, ClipboardCheck,
  Search, MoreVertical, CalendarDays, BookOpen, LayoutGrid,
  List as ListIcon, Info, MapPin, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";

export default function TeacherClassrooms() {
  const { getMyClassroomViews } = useStore();
  const myClassrooms = getMyClassroomViews();

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  const filtered = myClassrooms.filter(v => {
    if (selectedBatchId && v.batch.id !== selectedBatchId) return false;
    const matchSearch =
      v.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.batch.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || v.classroom.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (!selectedBatchId) {
    const uniqueBatches = Array.from(new Map(myClassrooms.map(c => [c.batch.id, c.batch])).values());
    return (
      <div className="space-y-4 animate-in fade-in duration-500 pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-[13px] font-medium text-slate-900">Select Batch</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Your assigned classrooms — created and configured by the administration.</p>
            <p className="text-[10px] text-blue-600 bg-blue-50 border border-blue-100 rounded px-2 py-1 mt-1.5 flex items-center gap-1.5 w-fit">
              <Info className="w-3 h-3 shrink-0" />
              Classrooms are assigned to you by the Admin. Contact admin to add or modify classrooms.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {uniqueBatches.map(b => {
            const batchClasses = myClassrooms.filter(c => c.batch.id === b.id);
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
  }

  const batchInfo = myClassrooms.find(c => c.batch.id === selectedBatchId)?.batch;

  return (
    <div className="w-full mx-auto space-y-4 pb-8 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedBatchId(null)} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 text-slate-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-[13px] font-medium text-slate-900">Courses in {batchInfo?.name}</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Select a classroom to view details or start a session.</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" placeholder="Search classrooms..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400" />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-2 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-md text-[11px] font-medium outline-none focus:border-brand-dark w-full sm:w-auto cursor-pointer">
              <option value="all">All Status</option>
              <option value="ongoing">Ongoing</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
            <div className="flex items-center border border-slate-200 rounded-md bg-white p-0.5 shrink-0">
              <button onClick={() => setViewMode("grid")} className={`p-1 rounded ${viewMode === "grid" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600"}`}><LayoutGrid className="w-3.5 h-3.5" /></button>
              <button onClick={() => setViewMode("list")} className={`p-1 rounded ${viewMode === "list" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600"}`}><ListIcon className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(({ classroom: cls, course, batch, session, schedules, students, colors, progress }) => (
            <div key={cls.id} className={`bg-white rounded-lg border shadow-sm overflow-hidden flex flex-col transition-all group ${cls.status === "completed" ? "border-slate-200/60 opacity-80" : "border-slate-200 hover:border-brand-dark/30 hover:shadow-md"}`}>
              <div className={`h-1.5 w-full ${cls.status === "completed" ? "bg-slate-300" : colors.color}`} />
              <div className="p-3.5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2.5">
                  <div>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-medium tracking-wider uppercase mb-1 ${cls.status === "completed" ? "bg-slate-100 text-slate-600" : `${colors.light} ${colors.text}`}`}>
                      {course.code} • {cls.status}
                    </span>
                    <h3 className="text-[13px] font-medium text-slate-900 leading-tight group-hover:text-brand-dark transition-colors line-clamp-1">{course.title}</h3>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-50 transition-colors"><MoreVertical className="w-3.5 h-3.5" /></button>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-[10px] font-medium mb-1">
                    <span className="text-slate-500">Course Progress</span>
                    <span className={cls.status === "completed" ? "text-slate-600" : colors.text}>{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${cls.status === "completed" ? "bg-slate-400" : colors.color} rounded-full`} style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="space-y-2 mb-3 flex-1">
                  <div className="flex items-start gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-medium text-slate-700">{batch.name}</p>
                      <p className="text-[9px] text-slate-500">{session.name} • {students.length} Students</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                    <div className="text-[10px] text-slate-600 font-medium pt-0.5">
                      {new Date(cls.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – {new Date(cls.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                    <div className="text-[10px] text-slate-600 font-medium pt-0.5">
                      {schedules.length > 0 ? `${[...new Set(schedules.map(s => s.day.slice(0,3)))].join(", ")} • ${schedules[0].startTime}` : "No schedule set yet"}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                    <div className="text-[10px] text-slate-600 pt-0.5">{cls.room}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 mt-auto pt-3 border-t border-slate-100">
                  <Link href={cls.status === "completed" ? `/dashboard/teacher/classrooms/${cls.id}/archive` : `/dashboard/teacher/sessions/start?classId=${cls.id}`} className={`col-span-3 mb-1.5 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-medium rounded shadow-sm transition-colors ${cls.status === "completed" ? "bg-slate-200 text-slate-600 hover:bg-slate-300" : "bg-brand-dark text-white hover:bg-slate-800"}`}>
                    {cls.status === "completed" ? <FolderOpen className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    {cls.status === "completed" ? "View Archive" : "Start Session"}
                  </Link>
                  <Link href={`/dashboard/teacher/materials/${cls.id}`} className="col-span-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded bg-slate-50 hover:bg-slate-100 transition-colors text-slate-600 hover:text-brand-dark">
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-medium">Materials</span>
                  </Link>
                  <Link href={`/dashboard/teacher/attendance/${cls.id}`} className="col-span-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded bg-slate-50 hover:bg-slate-100 transition-colors text-slate-600 hover:text-brand-dark">
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-medium">Attendance</span>
                  </Link>
                  <button className="col-span-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded bg-slate-50 hover:bg-slate-100 transition-colors text-slate-600 hover:text-brand-dark">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-medium">{cls.classesCompleted}/{cls.totalClasses}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {viewMode === "list" && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                  <th className="px-4 py-2.5">Course</th>
                  <th className="px-4 py-2.5">Batch / Session</th>
                  <th className="px-4 py-2.5">Students</th>
                  <th className="px-4 py-2.5">Schedule</th>
                  <th className="px-4 py-2.5">Progress</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {filtered.map(({ classroom: cls, course, batch, session, students, schedules, colors, progress }) => (
                  <tr key={cls.id} className={`hover:bg-slate-50 transition-colors ${cls.status === "completed" ? "opacity-70" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-8 rounded-full ${cls.status === "completed" ? "bg-slate-300" : colors.color}`} />
                        <div>
                          <p className="font-medium text-slate-900">{course.title}</p>
                          <span className={`text-[8px] font-medium px-1.5 rounded-sm uppercase ${cls.status === "completed" ? "bg-slate-200 text-slate-600" : `${colors.light} ${colors.text}`}`}>{course.code} • {cls.status}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700">{batch.name}</p>
                      <p className="text-[10px] text-slate-500">{session.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-700">{students.length}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700 text-[10px]">{schedules.length > 0 ? [...new Set(schedules.map(s => s.day.slice(0,3)))].join(", ") : "—"}</p>
                      <p className="text-[10px] text-slate-500">{schedules[0]?.startTime ?? ""}</p>
                    </td>
                    <td className="px-4 py-3 w-44">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${cls.status === "completed" ? "bg-slate-400" : colors.color} rounded-full`} style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-[10px] font-medium text-slate-600">{progress}%</span>
                      </div>
                      <p className="text-[9px] text-slate-500 mt-1">{cls.classesCompleted}/{cls.totalClasses} classes</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/dashboard/teacher/classrooms/${cls.id}`} className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-[10px] font-medium transition-colors ${cls.status === "completed" ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-brand-dark text-white hover:bg-slate-800"}`}>
                        {cls.status === "completed" ? "Archive" : "Enter"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-50 rounded-lg border border-slate-200 border-dashed">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-2">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <h3 className="text-[11px] font-medium text-slate-900 mb-0.5">No classrooms found</h3>
          <p className="text-[10px] text-slate-500">Contact admin if you expect to see classrooms here.</p>
        </div>
      )}
    </div>
  );
}

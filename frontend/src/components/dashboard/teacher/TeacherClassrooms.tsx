"use client";

import {
  Users, Clock, Play, FolderOpen, ClipboardCheck,
  Search, MoreVertical, CalendarDays, BookOpen, LayoutGrid,
  List as ListIcon, Info, MapPin, ArrowLeft, ArrowRight,
  TrendingUp, Sparkles, Filter, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";

export default function TeacherClassrooms() {
  const {
    getMyClassroomViews,
    fetchClassrooms, fetchCourses, fetchBatches, fetchSessions, fetchPrograms,
    fetchSchedules, fetchStudents, fetchSyllabusTopics,
  } = useStore();

  useEffect(() => {
    fetchClassrooms();
    fetchCourses();
    fetchBatches();
    fetchSessions();
    fetchPrograms();
    fetchSchedules();
    fetchStudents();
    fetchSyllabusTopics();
  }, []);

  const myClassrooms = getMyClassroomViews();


  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  const filtered = myClassrooms.filter((v) => {
    if (selectedBatchId && selectedBatchId !== "all" && v.batch.id !== selectedBatchId) return false;
    const matchSearch =
      v.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.batch.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || v.classroom.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const uniqueBatches = Array.from(new Map(myClassrooms.map((c) => [c.batch.id, c.batch])).values());

  // If no batch is selected yet and teacher has batches, show batch selector with option to view all
  if (selectedBatchId === null && uniqueBatches.length > 1) {
    return (
      <div className="space-y-5 animate-in fade-in duration-300 pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">My Assigned Classrooms</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an academic batch to view assigned courses, or explore all classrooms.
            </p>
          </div>
          <button
            onClick={() => setSelectedBatchId("all")}
            className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-brand-dark/30 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-all shadow-xs flex items-center gap-1.5 self-start md:self-auto"
          >
            View All Classrooms ({myClassrooms.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {uniqueBatches.map((b) => {
            const batchClasses = myClassrooms.filter((c) => c.batch.id === b.id);
            const totalStudents = batchClasses[0]?.students.length || 0;
            const ongoingCount = batchClasses.filter((c) => c.classroom.status === "ongoing").length;

            return (
              <button
                key={b.id}
                onClick={() => setSelectedBatchId(b.id)}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-brand-dark hover:shadow-md transition-all group block text-left relative overflow-hidden"
              >
                <div className="h-1.5 w-full rounded-full bg-slate-200 group-hover:bg-brand-dark transition-colors mb-4" />
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Academic Batch
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-dark transition-colors mt-0.5">
                      {b.name}
                    </h3>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-dark group-hover:translate-x-0.5 transition-all" />
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1.5 font-medium">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    {batchClasses.length} Course{batchClasses.length > 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {totalStudents} Students
                  </span>
                </div>

                {ongoingCount > 0 && (
                  <div className="mt-2 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {ongoingCount} Ongoing course{ongoingCount > 1 ? "s" : ""}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const batchInfo = uniqueBatches.find((c) => c.id === selectedBatchId);

  return (
    <div className="w-full mx-auto space-y-4 pb-8 relative animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          {selectedBatchId && uniqueBatches.length > 1 && (
            <button
              onClick={() => setSelectedBatchId(null)}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors shadow-xs shrink-0"
              title="Change Batch"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                {selectedBatchId === "all" || !selectedBatchId
                  ? "All My Classrooms"
                  : `Classrooms in ${batchInfo?.name}`}
              </h2>
              {selectedBatchId !== "all" && selectedBatchId && (
                <button
                  onClick={() => setSelectedBatchId("all")}
                  className="text-[10px] font-semibold text-brand-dark hover:underline"
                >
                  (Show All)
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Click &quot;Enter Classroom&quot; to manage syllabus, live sessions, materials, and student grades.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search classrooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-medium outline-none focus:border-brand-dark w-full sm:w-auto cursor-pointer shadow-xs"
            >
              <option value="all">All Status</option>
              <option value="ongoing">Ongoing</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>

            <div className="flex items-center border border-slate-200 rounded-lg bg-white p-0.5 shrink-0 shadow-xs">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "grid" ? "bg-slate-100 text-slate-900 font-bold" : "text-slate-400 hover:text-slate-600"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "list" ? "bg-slate-100 text-slate-900 font-bold" : "text-slate-400 hover:text-slate-600"
                }`}
                title="List View"
              >
                <ListIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(
            ({ classroom: cls, course, batch, session, schedules, students, colors, progress }) => {
              const classroomUrl = `/dashboard/teacher/classrooms/${cls.id}`;

              return (
                <div
                  key={cls.id}
                  className={`bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col transition-all group ${
                    cls.status === "completed"
                      ? "border-slate-200/70 opacity-90"
                      : "border-slate-200 hover:border-brand-dark/40 hover:shadow-md"
                  }`}
                >
                  <div className={`h-2 w-full ${cls.status === "completed" ? "bg-slate-300" : colors.color}`} />
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Top Badges */}
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${
                              cls.status === "completed"
                                ? "bg-slate-100 text-slate-600"
                                : `${colors.light} ${colors.text}`
                            }`}
                          >
                            {course.code}
                          </span>
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold capitalize ${
                              cls.status === "ongoing"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : cls.status === "upcoming"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {cls.status}
                          </span>
                        </div>
                      </div>

                      {/* Course Title (Clickable) */}
                      <Link href={classroomUrl} className="block group-hover:text-brand-dark transition-colors">
                        <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                          {course.title}
                        </h3>
                      </Link>

                      {/* Progress Bar */}
                      <div className="my-3">
                        <div className="flex items-center justify-between text-[10px] font-semibold mb-1">
                          <span className="text-slate-500">
                            Progress ({cls.classesCompleted}/{cls.totalClasses} classes)
                          </span>
                          <span className={cls.status === "completed" ? "text-slate-600" : colors.text}>
                            {progress}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              cls.status === "completed" ? "bg-slate-400" : colors.color
                            } rounded-full transition-all`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Metadata Items */}
                      <div className="space-y-2 py-2 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium truncate">
                            {batch.name} • <span className="text-slate-500 font-normal">{students.length} Students</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {schedules.length > 0
                              ? `${[...new Set(schedules.map((s) => s.day.slice(0, 3)))].join(", ")} • ${
                                  schedules[0].startTime
                                }`
                              : "No routine assigned"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{cls.room || "Room TBA"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Hub Buttons */}
                    <div className="pt-3 mt-3 border-t border-slate-100 space-y-2">
                      {/* Primary ENTER CLASSROOM Button */}
                      <Link
                        href={classroomUrl}
                        className="w-full py-2 px-3 bg-brand-dark hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs group/btn"
                      >
                        Enter Classroom Hub
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>

                      {/* Secondary Quick Action Row */}
                      <div className="grid grid-cols-3 gap-1.5">
                        <Link
                          href={`/dashboard/teacher/sessions/start?classId=${cls.id}`}
                          className="py-1.5 px-2 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-md text-[10px] font-semibold border border-slate-200/60 flex items-center justify-center gap-1 transition-colors"
                        >
                          <Play className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                          <span>Start Class</span>
                        </Link>
                        <Link
                          href={`/dashboard/teacher/attendance/${cls.id}`}
                          className="py-1.5 px-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-md text-[10px] font-semibold border border-slate-200/60 flex items-center justify-center gap-1 transition-colors"
                        >
                          <ClipboardCheck className="w-3 h-3 text-blue-600" />
                          <span>Attendance</span>
                        </Link>
                        <Link
                          href={`/dashboard/teacher/continuity/${cls.id}`}
                          className="py-1.5 px-2 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 rounded-md text-[10px] font-semibold border border-slate-200/60 flex items-center justify-center gap-1 transition-colors"
                        >
                          <TrendingUp className="w-3 h-3 text-purple-600" />
                          <span>Syllabus</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="px-5 py-3">Course</th>
                  <th className="px-5 py-3">Batch / Session</th>
                  <th className="px-5 py-3">Students</th>
                  <th className="px-5 py-3">Schedule</th>
                  <th className="px-5 py-3">Progress</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map(
                  ({ classroom: cls, course, batch, session, students, schedules, colors, progress }) => (
                    <tr
                      key={cls.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        cls.status === "completed" ? "opacity-75" : ""
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-1.5 h-10 rounded-full shrink-0 ${
                              cls.status === "completed" ? "bg-slate-300" : colors.color
                            }`}
                          />
                          <div>
                            <Link
                              href={`/dashboard/teacher/classrooms/${cls.id}`}
                              className="font-bold text-slate-900 hover:text-brand-dark transition-colors"
                            >
                              {course.title}
                            </Link>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                  cls.status === "completed"
                                    ? "bg-slate-200 text-slate-600"
                                    : `${colors.light} ${colors.text}`
                                }`}
                              >
                                {course.code}
                              </span>
                              <span className="text-[10px] text-slate-400 capitalize">• {cls.status}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-800">{batch.name}</p>
                        <p className="text-[10px] text-slate-500">{session.name}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-slate-800">{students.length}</span>
                        <span className="text-slate-400 text-[10px] ml-1">enrolled</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-800 text-[11px]">
                          {schedules.length > 0
                            ? [...new Set(schedules.map((s) => s.day.slice(0, 3)))].join(", ")
                            : "—"}
                        </p>
                        <p className="text-[10px] text-slate-500">{schedules[0]?.startTime ?? ""}</p>
                      </td>
                      <td className="px-5 py-3.5 w-44">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                cls.status === "completed" ? "bg-slate-400" : colors.color
                              } rounded-full`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700">{progress}%</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {cls.classesCompleted}/{cls.totalClasses} classes
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/dashboard/teacher/sessions/start?classId=${cls.id}`}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200/60"
                            title="Start Live Class"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </Link>
                          <Link
                            href={`/dashboard/teacher/classrooms/${cls.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-dark text-white hover:bg-slate-800 transition-colors shadow-xs"
                          >
                            Enter <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-50 rounded-xl border border-slate-200 border-dashed">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-semibold text-slate-900 mb-0.5">No classrooms found</h3>
          <p className="text-[11px] text-slate-500">
            {searchTerm ? "Try adjusting your search terms or filters." : "Contact admin if you expect to see assigned courses here."}
          </p>
        </div>
      )}
    </div>
  );
}

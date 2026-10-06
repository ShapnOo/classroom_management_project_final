"use client";

import { useState, useEffect, useMemo } from "react";
import { ListTodo, ArrowRight, FileCheck, Clock, Search, BookOpen, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/store";

export default function TeacherAssignmentsList() {
  const { getMyClassroomViews, fetchClassrooms, fetchCourses, fetchBatches, fetchAssignments } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"running" | "completed" | "all">("running");

  useEffect(() => {
    fetchClassrooms();
    fetchCourses();
    fetchBatches();
    fetchAssignments();
  }, []);

  const myClassrooms = getMyClassroomViews();

  const filteredClassrooms = useMemo(() => {
    return myClassrooms.filter((c) => {
      // 1. Status Filter
      if (statusFilter === "running" && c.classroom.status === "completed") return false;
      if (statusFilter === "completed" && c.classroom.status !== "completed") return false;

      // 2. Search Query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.course.title.toLowerCase().includes(q) ||
        c.course.code.toLowerCase().includes(q) ||
        c.batch.name.toLowerCase().includes(q)
      );
    });
  }, [myClassrooms, statusFilter, searchQuery]);

  const runningCount = myClassrooms.filter((c) => c.classroom.status !== "completed").length;
  const completedCount = myClassrooms.filter((c) => c.classroom.status === "completed").length;

  return (
    <div className="w-full mx-auto space-y-5 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-brand-dark" />
            Classroom Assignments Directory
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Select a course to create assignments, grade submissions, or manage deadlines
          </p>
        </div>

        {/* Search Input Box */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by course code, title, or batch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400 shadow-xs"
          />
        </div>
      </div>

      {/* Status Filter Tabs (Running by default) */}
      <div className="flex items-center gap-2 text-xs bg-slate-50 p-2 rounded-xl border border-slate-200">
        <button
          onClick={() => setStatusFilter("running")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            statusFilter === "running"
              ? "bg-brand-dark text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Running Courses ({runningCount})
        </button>
        <button
          onClick={() => setStatusFilter("completed")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            statusFilter === "completed"
              ? "bg-brand-dark text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Completed Courses ({completedCount})
        </button>
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            statusFilter === "all"
              ? "bg-brand-dark text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          All Courses ({myClassrooms.length})
        </button>
      </div>

      {/* Clean List View Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Course Code</th>
                <th className="px-5 py-3.5">Course Title</th>
                <th className="px-5 py-3.5">Academic Batch</th>
                <th className="px-5 py-3.5">Assignments Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredClassrooms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <ListTodo className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No matching assignment classrooms found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      No courses match the selected status filter (&quot;{statusFilter}&quot;) or search query.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredClassrooms.map(({ classroom: cls, course, batch, assignments, colors }) => {
                  const activeAssignments = assignments.filter((a) => a.status === "Active").length;
                  const pendingGrade = assignments.reduce(
                    (sum, a) => sum + (a.status !== "Completed" ? a.submissions : 0),
                    0
                  );

                  return (
                    <tr key={cls.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-5 py-4 font-bold text-slate-900">
                        <span className={`inline-block px-2.5 py-1 rounded text-[11px] font-bold ${colors.light} ${colors.text}`}>
                          {course.code}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-brand-dark transition-colors" />
                          <span className="group-hover:text-brand-dark transition-colors">{course.title}</span>
                          {cls.status === "completed" && (
                            <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Completed</span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4 text-slate-400" />
                          <span>{batch.name}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-700">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-slate-700">
                            <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                            {activeAssignments} Active ({assignments.length} total)
                          </span>
                          <span>•</span>
                          <span className={`flex items-center gap-1 ${pendingGrade > 0 ? "text-amber-600 font-bold" : "text-slate-500"}`}>
                            <Clock className="w-3.5 h-3.5" />
                            {pendingGrade} to Grade
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/dashboard/teacher/assignments/${cls.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 hover:border-brand-dark/40 text-slate-700 hover:text-brand-dark font-semibold text-xs rounded-lg transition-all shadow-2xs group-hover:bg-brand-dark/5"
                        >
                          <span>Manage Assignments</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

"use client";

import { 
  ClipboardCheck,
  ArrowRight,
  GraduationCap,
  Users,
  Search,
  BookOpen
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";

export default function TeacherAttendanceList() {
  const {
    getMyClassroomViews, classSessions, attendanceRecords,
    fetchClassrooms, fetchCourses, fetchBatches, fetchSessions, fetchStudents,
    fetchClassSessions, fetchAttendanceRecords,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"running" | "completed" | "all">("running");

  useEffect(() => {
    fetchClassrooms();
    fetchCourses();
    fetchBatches();
    fetchSessions();
    fetchStudents();
    fetchClassSessions();
    fetchAttendanceRecords();
  }, []);

  const myClassrooms = getMyClassroomViews();

  const formattedCourses = useMemo(() => {
    return myClassrooms.map(({ classroom: cls, course, batch, students, colors }) => {
      const sessions = classSessions.filter(s => s.classroomId === cls.id);
      const totalPresent = attendanceRecords.filter(r => r.classroomId === cls.id && (r.status === "present" || r.status === "late")).length;
      const totalMarked = attendanceRecords.filter(r => r.classroomId === cls.id).length;
      const avgAttendance = totalMarked > 0 ? Math.round((totalPresent / totalMarked) * 100) : 85;

      return {
        id: cls.id,
        status: cls.status,
        name: course.title,
        batch: batch.name,
        code: course.code,
        colors,
        studentCount: students.length,
        avgAttendance,
        classesConducted: sessions.length || cls.classesCompleted,
      };
    });
  }, [myClassrooms, classSessions, attendanceRecords]);

  const filteredCourses = useMemo(() => {
    return formattedCourses.filter((c) => {
      // 1. Status Filter
      if (statusFilter === "running" && c.status === "completed") return false;
      if (statusFilter === "completed" && c.status !== "completed") return false;

      // 2. Search Query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.batch.toLowerCase().includes(q)
      );
    });
  }, [formattedCourses, statusFilter, searchQuery]);

  const runningCount = formattedCourses.filter((c) => c.status !== "completed").length;
  const completedCount = formattedCourses.filter((c) => c.status === "completed").length;

  return (
    <div className="w-full mx-auto space-y-5 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-brand-dark" />
            Classroom Attendance Directory
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Select a course to record attendance, mark student presence, or review past session stats
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
          All Courses ({formattedCourses.length})
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
                <th className="px-5 py-3.5">Conducted & Students</th>
                <th className="px-5 py-3.5">Avg. Attendance Rate</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <ClipboardCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No matching attendance classrooms found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      No courses match the selected status filter (&quot;{statusFilter}&quot;) or search query.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-5 py-4 font-bold text-slate-900">
                      <span className={`inline-block px-2.5 py-1 rounded text-[11px] font-bold ${course.colors.light} ${course.colors.text}`}>
                        {course.code}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-brand-dark transition-colors" />
                        <span className="group-hover:text-brand-dark transition-colors">{course.name}</span>
                        {course.status === "completed" && (
                          <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Completed</span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-slate-400" />
                        <span>{course.batch}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-600">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-slate-700"><Users className="w-3.5 h-3.5 text-slate-400" /> {course.studentCount} Students</span>
                        <span>•</span>
                        <span className="text-slate-600">{course.classesConducted} Sessions</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-700">
                      <div className="flex items-center gap-2 max-w-[140px]">
                        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              course.avgAttendance >= 90 ? 'bg-emerald-500' : 
                              course.avgAttendance >= 80 ? 'bg-brand-dark' : 
                              'bg-red-500'
                            }`} 
                            style={{ width: `${course.avgAttendance}%` }}
                          />
                        </div>
                        <span className={`text-[11px] font-bold ${
                          course.avgAttendance >= 90 ? 'text-emerald-600' : 
                          course.avgAttendance >= 80 ? 'text-brand-dark' : 
                          'text-red-600'
                        }`}>{course.avgAttendance}%</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/dashboard/teacher/attendance/${course.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 hover:border-brand-dark/40 text-slate-700 hover:text-brand-dark font-semibold text-xs rounded-lg transition-all shadow-2xs group-hover:bg-brand-dark/5"
                      >
                        <span>Manage Attendance</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

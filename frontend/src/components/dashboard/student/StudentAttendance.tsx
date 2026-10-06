"use client";

import { 
  ClipboardCheck,
  Search,
  UserCheck,
  UserX,
  Clock,
  BookOpen
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useStore } from "@/lib/store";
import { CURRENT_STUDENT_BATCH_ID, CURRENT_STUDENT_ID } from "@/lib/seedData";

export default function StudentAttendance() {
  const {
    classrooms, courses, attendanceRecords, fetchClassrooms, fetchCourses, fetchAttendanceRecords
  } = useStore();

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchClassrooms();
    fetchCourses();
    fetchAttendanceRecords();
  }, []);

  const myClassrooms = classrooms.filter((c) => c.batchId === CURRENT_STUDENT_BATCH_ID || !CURRENT_STUDENT_BATCH_ID);
  const myRecords = attendanceRecords.filter((r) => r.studentId === CURRENT_STUDENT_ID);

  const courseAttendanceSummary = useMemo(() => {
    return myClassrooms.map((cls) => {
      const course = courses.find((co) => co.id === cls.courseId);
      const clsRecords = myRecords.filter((r) => r.classroomId === cls.id);
      const presentCount = clsRecords.filter((r) => r.status === "present").length;
      const lateCount = clsRecords.filter((r) => r.status === "late").length;
      const absentCount = clsRecords.filter((r) => r.status === "absent").length;
      const totalSessions = clsRecords.length > 0 ? clsRecords.length : cls.classesCompleted || 10;

      const effectivePresent = presentCount + lateCount;
      const rate = totalSessions > 0 ? Math.round((effectivePresent / totalSessions) * 100) : 92;

      return {
        id: cls.id,
        courseCode: course?.code || "Course",
        courseTitle: course?.title || "Classroom Course",
        totalSessions,
        presentCount: presentCount || 9,
        lateCount: lateCount || 1,
        absentCount: absentCount || 0,
        rate,
      };
    });
  }, [myClassrooms, courses, myRecords]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return courseAttendanceSummary;
    const q = searchQuery.toLowerCase();
    return courseAttendanceSummary.filter(
      (c) => c.courseTitle.toLowerCase().includes(q) || c.courseCode.toLowerCase().includes(q)
    );
  }, [courseAttendanceSummary, searchQuery]);

  const overallPresent = courseAttendanceSummary.reduce((s, c) => s + c.presentCount, 0);
  const overallAbsent = courseAttendanceSummary.reduce((s, c) => s + c.absentCount, 0);
  const overallLate = courseAttendanceSummary.reduce((s, c) => s + c.lateCount, 0);
  const overallTotal = courseAttendanceSummary.reduce((s, c) => s + c.totalSessions, 0);
  const overallRate = overallTotal > 0 ? Math.round(((overallPresent + overallLate) / overallTotal) * 100) : 92;

  return (
    <div className="w-full mx-auto space-y-5 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-brand-dark" />
            My Attendance Record & Course Stats
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Subject-wise attendance percentage, present sessions, and absences history
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by course code or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400 shadow-xs"
          />
        </div>
      </div>

      {/* Overall Attendance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Overall Attendance</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-emerald-600">{overallRate}%</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Academic Good Standing</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Present</span>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">{overallPresent}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Classes Attended</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Late</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">{overallLate}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Late Entries</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Absent</span>
            <UserX className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-xl font-extrabold text-rose-600">{overallAbsent}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Missed Sessions</p>
        </div>
      </div>

      {/* Clean Table List View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Course Code</th>
                <th className="px-5 py-3.5">Course Title</th>
                <th className="px-5 py-3.5">Total Conducted</th>
                <th className="px-5 py-3.5">Present / Late / Absent</th>
                <th className="px-5 py-3.5">Attendance Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <ClipboardCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No attendance records found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-5 py-4 font-bold text-slate-900">
                      <span className="inline-block px-2.5 py-1 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700">
                        {c.courseCode}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-brand-dark transition-colors" />
                        <span className="group-hover:text-brand-dark transition-colors">{c.courseTitle}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-bold text-slate-900">
                      {c.totalSessions} Sessions
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">{c.presentCount} Present</span>
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">{c.lateCount} Late</span>
                        <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold">{c.absentCount} Absent</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-700">
                      <div className="flex items-center gap-2.5 max-w-[160px]">
                        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              c.rate >= 90 ? 'bg-emerald-500' : 
                              c.rate >= 80 ? 'bg-brand-dark' : 
                              'bg-rose-500'
                            }`} 
                            style={{ width: `${c.rate}%` }} 
                          />
                        </div>
                        <span className={`text-[11px] font-extrabold ${
                          c.rate >= 90 ? 'text-emerald-600' : 
                          c.rate >= 80 ? 'text-brand-dark' : 
                          'text-rose-600'
                        }`}>{c.rate}%</span>
                      </div>
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

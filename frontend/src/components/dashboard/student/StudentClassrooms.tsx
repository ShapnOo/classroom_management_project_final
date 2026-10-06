"use client";

import { 
  MonitorPlay,
  Search,
  BookOpen,
  GraduationCap,
  Clock,
  MapPin,
  User
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useStore } from "@/lib/store";
import { CURRENT_STUDENT_BATCH_ID } from "@/lib/seedData";

export default function StudentClassrooms() {
  const {
    classrooms, courses, batches, teachers, schedules,
    fetchClassrooms, fetchCourses, fetchBatches, fetchTeachers, fetchSchedules
  } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"running" | "completed" | "all">("running");

  useEffect(() => {
    fetchClassrooms();
    fetchCourses();
    fetchBatches();
    fetchTeachers();
    fetchSchedules();
  }, []);

  // Filter classrooms for student's batch
  const studentBatchId = CURRENT_STUDENT_BATCH_ID;
  const myClassrooms = classrooms.filter((c) => c.batchId === studentBatchId || !studentBatchId);

  const formattedClassrooms = useMemo(() => {
    return myClassrooms.map((cls) => {
      const course = courses.find((co) => co.id === cls.courseId);
      const batch = batches.find((ba) => ba.id === cls.batchId);
      const teacher = teachers.find((t) => t.id === cls.teacherId);
      const classroomSchedules = schedules.filter((s) => s.classroomId === cls.id);
      const scheduleLabel = classroomSchedules.length > 0
        ? classroomSchedules.map((s) => `${s.day.slice(0, 3)} ${s.startTime}-${s.endTime}`).join(" • ")
        : "Scheduled";

      const progress = cls.totalClasses > 0 ? Math.round((cls.classesCompleted / cls.totalClasses) * 100) : 35;

      return {
        id: cls.id,
        status: cls.status,
        room: cls.room,
        classesCompleted: cls.classesCompleted,
        totalClasses: cls.totalClasses,
        progress,
        courseCode: course?.code || "Course",
        courseTitle: course?.title || "Classroom Course",
        batchName: batch?.name || "Academic Batch",
        teacherName: teacher?.name || "Faculty Member",
        teacherDesignation: teacher?.designation || "Lecturer",
        scheduleLabel,
      };
    });
  }, [myClassrooms, courses, batches, teachers, schedules]);

  const filtered = useMemo(() => {
    return formattedClassrooms.filter((c) => {
      if (statusFilter === "running" && c.status === "completed") return false;
      if (statusFilter === "completed" && c.status !== "completed") return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.courseTitle.toLowerCase().includes(q) ||
        c.courseCode.toLowerCase().includes(q) ||
        c.teacherName.toLowerCase().includes(q) ||
        c.batchName.toLowerCase().includes(q)
      );
    });
  }, [formattedClassrooms, statusFilter, searchQuery]);

  return (
    <div className="w-full mx-auto space-y-5 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MonitorPlay className="w-4 h-4 text-brand-dark" />
            My Enrolled Classrooms
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            View course details, faculty assignment, class schedule timings, and syllabus completion
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by course code, title, faculty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400 shadow-xs"
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 text-xs bg-slate-50 p-2 rounded-xl border border-slate-200">
        <button
          onClick={() => setStatusFilter("running")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            statusFilter === "running"
              ? "bg-brand-dark text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Running Courses ({formattedClassrooms.filter((c) => c.status !== "completed").length})
        </button>
        <button
          onClick={() => setStatusFilter("completed")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            statusFilter === "completed"
              ? "bg-brand-dark text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Completed Courses ({formattedClassrooms.filter((c) => c.status === "completed").length})
        </button>
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            statusFilter === "all"
              ? "bg-brand-dark text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          All Courses ({formattedClassrooms.length})
        </button>
      </div>

      {/* Table View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Course Code</th>
                <th className="px-5 py-3.5">Course Title</th>
                <th className="px-5 py-3.5">Faculty Instructor</th>
                <th className="px-5 py-3.5">Schedule & Location</th>
                <th className="px-5 py-3.5">Syllabus Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <MonitorPlay className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No enrolled classrooms found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">No classrooms match the selected filter or search query.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((cls) => (
                  <tr key={cls.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-5 py-4 font-bold text-slate-900">
                      <span className="inline-block px-2.5 py-1 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700">
                        {cls.courseCode}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-brand-dark transition-colors" />
                        <span className="group-hover:text-brand-dark transition-colors">{cls.courseTitle}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <div>
                          <p className="font-bold text-slate-900">{cls.teacherName}</p>
                          <p className="text-[10px] text-slate-400">{cls.teacherDesignation}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-600">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{cls.scheduleLabel}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>Room: {cls.room}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-700">
                      <div className="flex items-center gap-2.5 max-w-[150px]">
                        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${cls.progress}%` }} />
                        </div>
                        <span className="text-[11px] font-bold text-emerald-600">{cls.progress}%</span>
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

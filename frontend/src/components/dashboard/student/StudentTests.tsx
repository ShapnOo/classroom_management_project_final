"use client";

import { 
  FileText,
  Search,
  ClipboardList,
  Clock,
  BookOpen,
  Award,
  CheckCircle2
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useStore } from "@/lib/store";
import { CURRENT_STUDENT_BATCH_ID } from "@/lib/seedData";

export default function StudentTests() {
  const {
    classrooms, courses, tests, fetchClassrooms, fetchCourses, fetchTests
  } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Completed">("All");

  useEffect(() => {
    fetchClassrooms();
    fetchCourses();
    fetchTests();
  }, []);

  const myClassroomIds = classrooms.filter((c) => c.batchId === CURRENT_STUDENT_BATCH_ID).map((c) => c.id);

  const studentTests = tests.filter(
    (t) => !t.classroomId || myClassroomIds.includes(t.classroomId)
  );

  const formattedTests = useMemo(() => {
    return studentTests.map((t) => {
      const classroom = classrooms.find((c) => c.id === t.classroomId);
      const course = courses.find((co) => co.id === classroom?.courseId);

      return {
        id: t.id,
        title: t.title,
        description: t.description || "Class Test Examination",
        testDate: new Date(t.testDate).toLocaleDateString("en-GB"),
        duration: t.duration || "1 Hour",
        totalMarks: t.totalMarks,
        status: t.status,
        courseCode: course?.code || "Course",
        courseTitle: course?.title || "Class Test",
      };
    });
  }, [studentTests, classrooms, courses]);

  const filtered = useMemo(() => {
    return formattedTests.filter((t) => {
      if (statusFilter !== "All" && t.status !== statusFilter) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.courseCode.toLowerCase().includes(q) ||
        t.courseTitle.toLowerCase().includes(q)
      );
    });
  }, [formattedTests, statusFilter, searchQuery]);

  return (
    <div className="w-full mx-auto space-y-5 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-dark" />
            Class Tests & Exam Timetable
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Review upcoming class test dates, syllabus topics covered, test durations, and total marks
          </p>
        </div>

        {/* Search Input Box */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tests by title or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400 shadow-xs"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs bg-slate-50 p-2 rounded-xl border border-slate-200">
        {(["All", "Active", "Completed"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === tab
                ? "bg-brand-dark text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {tab === "All" ? `All Class Tests (${formattedTests.length})` : tab === "Active" ? `Upcoming Active (${formattedTests.filter(t => t.status === "Active").length})` : `Completed History (${formattedTests.filter(t => t.status === "Completed").length})`}
          </button>
        ))}
      </div>

      {/* Clean Table List View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Test Title</th>
                <th className="px-5 py-3.5">Course</th>
                <th className="px-5 py-3.5">Exam Date & Duration</th>
                <th className="px-5 py-3.5">Total Marks</th>
                <th className="px-5 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No class tests found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">No test entries match your filter.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-rose-50 text-rose-600 shrink-0">
                          <ClipboardList className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-brand-dark transition-colors">{t.title}</p>
                          <p className="text-[10px] text-slate-400 font-normal">{t.description}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {t.courseCode}
                        </span>
                        <span className="text-slate-600 line-clamp-1">{t.courseTitle}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-700">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-slate-900 font-bold">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{t.testDate}</span>
                        </div>
                        <p className="text-[10px] text-slate-400">Duration: {t.duration}</p>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-bold text-slate-900">
                      <div className="flex items-center gap-1 text-rose-700">
                        <Award className="w-3.5 h-3.5" />
                        <span>{t.totalMarks} Marks</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right font-medium">
                      {t.status === "Active" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                          <Clock className="w-3 h-3 text-rose-600 animate-pulse" /> Active Test
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-slate-500" /> Completed
                        </span>
                      )}
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

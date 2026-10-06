"use client";

import { 
  BarChart3,
  Award,
  GraduationCap,
  BookOpen,
  FileText,
  Search,
  CheckCircle2
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useStore } from "@/lib/store";
import { CURRENT_STUDENT_BATCH_ID } from "@/lib/seedData";

export default function StudentResults() {
  const {
    classrooms, courses, assignments, tests, fetchClassrooms, fetchCourses, fetchAssignments, fetchTests
  } = useStore();

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchClassrooms();
    fetchCourses();
    fetchAssignments();
    fetchTests();
  }, []);

  const myClassrooms = classrooms.filter((c) => c.batchId === CURRENT_STUDENT_BATCH_ID || !CURRENT_STUDENT_BATCH_ID);

  const courseResults = useMemo(() => {
    return myClassrooms.map((cls) => {
      const course = courses.find((co) => co.id === cls.courseId);
      const clsAssignments = assignments.filter((a) => a.classroomId === cls.id);
      const clsTests = tests.filter((t) => t.classroomId === cls.id);

      // Grade math
      const assignmentScore = clsAssignments.length > 0 ? 90 : 85;
      const testScore = clsTests.length > 0 ? 88 : 82;
      const totalScore = Math.round((assignmentScore + testScore) / 2);
      
      let letterGrade = "A+";
      let gradePoint = 4.0;
      if (totalScore < 80 && totalScore >= 75) { letterGrade = "A"; gradePoint = 3.75; }
      else if (totalScore < 75 && totalScore >= 70) { letterGrade = "A-"; gradePoint = 3.5; }
      else if (totalScore < 70) { letterGrade = "B+"; gradePoint = 3.25; }

      return {
        id: cls.id,
        courseCode: course?.code || "Course",
        courseTitle: course?.title || "Academic Course",
        credits: course?.credits || 3,
        assignmentScore,
        testScore,
        totalScore,
        letterGrade,
        gradePoint,
      };
    });
  }, [myClassrooms, courses, assignments, tests]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return courseResults;
    const q = searchQuery.toLowerCase();
    return courseResults.filter(
      (c) => c.courseTitle.toLowerCase().includes(q) || c.courseCode.toLowerCase().includes(q)
    );
  }, [courseResults, searchQuery]);

  return (
    <div className="w-full mx-auto space-y-5 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-dark" />
            Academic Performance & Grade Transcript
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Semester GPA, CGPA calculation, assignment marks, and class test grades
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

      {/* GPA / CGPA Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-brand-dark text-white rounded-xl p-4 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Semester GPA</span>
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">3.88</p>
          <p className="text-[10px] text-slate-300 mt-0.5">First Class Distinction</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Cumulative CGPA</span>
            <GraduationCap className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">3.85</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Overall CGPA Score</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Credits Completed</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">78 Credits</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Passed Courses</p>
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
                <th className="px-5 py-3.5">Credit Hours</th>
                <th className="px-5 py-3.5">Assignment & Test Scores</th>
                <th className="px-5 py-3.5 text-right">Grade Point / Letter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No academic results found</p>
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
                      {c.credits} CH
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-700">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-600">Assign: <strong>{c.assignmentScore}%</strong></span>
                        <span>•</span>
                        <span className="text-slate-600">Test: <strong>{c.testScore}%</strong></span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right font-bold">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs">
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{c.letterGrade} ({c.gradePoint.toFixed(2)})</span>
                      </span>
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

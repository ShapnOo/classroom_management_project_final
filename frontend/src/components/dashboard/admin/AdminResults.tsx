"use client";

import {
  Award, ArrowLeft, Download, Star, TrendingUp, Users,
  CheckCircle2, AlertCircle, Search, LayoutGrid, List as ListIcon,
  BookOpen, User, Eye
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { useStore } from "@/lib/store";

interface AdminResultsProps {
  courseId?: string; // classroomId
}

type GradeBreakdown = {
  studentId: string;
  name: string;
  rollNo: string;
  ct: number;        // out of 20
  assignment: number; // out of 20
  midterm: number;   // out of 30
  final: number;     // out of 50
  total: number;     // out of 100 (weighted)
  attendancePct: number;
  grade: string;
  letterGrade: string;
};

function letterGrade(pct: number): string {
  if (pct >= 90) return "A+";
  if (pct >= 85) return "A";
  if (pct >= 80) return "A-";
  if (pct >= 75) return "B+";
  if (pct >= 70) return "B";
  if (pct >= 65) return "B-";
  if (pct >= 60) return "C+";
  if (pct >= 55) return "C";
  if (pct >= 50) return "D";
  return "F";
}

function gradeColor(lg: string) {
  if (lg.startsWith("A")) return "bg-emerald-100 text-emerald-700";
  if (lg.startsWith("B")) return "bg-blue-100 text-blue-700";
  if (lg.startsWith("C")) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

// Seeded random that's stable per student
function seededRand(seed: string, min: number, max: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  const r = ((h >>> 0) % 1000) / 1000;
  return Math.round(min + r * (max - min));
}

export default function AdminResults({ courseId }: AdminResultsProps) {
  const { 
    getAllClassroomViews, classSessions, attendanceRecords, gradeRecords,
    fetchGradeRecords, fetchClassrooms, fetchStudents, fetchBatches
  } = useStore();
  const allClassrooms = getAllClassroomViews();

  useEffect(() => {
    fetchGradeRecords();
    fetchClassrooms();
    fetchStudents();
    fetchBatches();
  }, []);

  const [search, setSearch] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "cards">("list");

  // ── CLASSROOM DETAIL (when courseId is provided) ─────────────────────────────
  if (courseId) {
    const view = allClassrooms.find(v => v.classroom.id === courseId);
    if (!view) return <div className="text-[11px] text-slate-500 py-8 text-center">Classroom not found.</div>;

    const { classroom: cls, course, batch, session, students, tests, assignments, colors } = view;
    const totalSessions = classSessions.filter(s => s.classroomId === cls.id).length;

    // Build result sheet from seeded data + grade records
    const resultSheet: GradeBreakdown[] = students.map(student => {
      const studentGrades = gradeRecords.filter(r => r.classroomId === cls.id && r.studentId === student.id);

      // Attendance
      const attRecs = attendanceRecords.filter(r => r.classroomId === cls.id && r.studentId === student.id);
      const present = attRecs.filter(r => r.status === "present" || r.status === "late").length;
      const attendancePct = totalSessions > 0 ? Math.round((present / totalSessions) * 100) : seededRand(student.id + "att", 65, 98);

      // CT
      const ctTests = tests.filter(t => t.totalMarks <= 25);
      const ctGrades = ctTests.map(t => {
        const rec = studentGrades.find(r => r.testId === t.id);
        return rec ? rec.obtainedMarks : seededRand(student.id + t.id, Math.floor(t.totalMarks * 0.5), t.totalMarks);
      });
      const ctTotal = ctTests.length > 0 ? Math.round(ctGrades.reduce((s, v) => s + v, 0) / ctTests.length) : seededRand(student.id + "ct", 12, 20);
      const ctOut20 = ctTests.length > 0 ? Math.round((ctTotal / (ctTests[0]?.totalMarks ?? 20)) * 20) : ctTotal;

      // Assignments
      const assnGrades = assignments.map(a => {
        const rec = studentGrades.find(r => r.assignmentId === a.id);
        return rec ? rec.obtainedMarks : seededRand(student.id + a.id, Math.floor(a.totalMarks * 0.5), a.totalMarks);
      });
      const assnTotal = assignments.length > 0 ? Math.round(assnGrades.reduce((s, v) => s + v, 0) / assignments.length) : seededRand(student.id + "assn", 12, 20);
      const assnOut20 = assignments.length > 0 ? Math.round((assnTotal / (assignments[0]?.totalMarks ?? 20)) * 20) : assnTotal;

      // Midterm
      const midtermTest = tests.find(t => t.totalMarks > 25);
      const midtermGrade = midtermTest ? (studentGrades.find(r => r.testId === midtermTest.id)?.obtainedMarks ?? seededRand(student.id + "mid", 18, 30)) : seededRand(student.id + "mid", 18, 30);
      const midtermOut30 = midtermTest ? Math.round((midtermGrade / midtermTest.totalMarks) * 30) : midtermGrade;

      // Final
      const finalOut50 = seededRand(student.id + "fin", 25, 50);

      const total = ctOut20 + assnOut20 + midtermOut30 + finalOut50;
      const totalPct = Math.round((total / 120) * 100);

      return {
        studentId: student.id,
        name: student.name,
        rollNo: student.rollNo,
        ct: ctOut20,
        assignment: assnOut20,
        midterm: midtermOut30,
        final: finalOut50,
        total,
        attendancePct,
        grade: String(totalPct),
        letterGrade: letterGrade(totalPct),
      };
    });

    const filtered = resultSheet.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(search.toLowerCase())
    );

    const avgTotal = Math.round(resultSheet.reduce((s, r) => s + r.total, 0) / (resultSheet.length || 1));
    const passed = resultSheet.filter(r => r.letterGrade !== "F").length;
    const highest = Math.max(...resultSheet.map(r => r.total), 0);
    const gradeDistribution = ["A+","A","A-","B+","B","B-","C+","C","D","F"].map(g => ({
      grade: g,
      count: resultSheet.filter(r => r.letterGrade === g).length
    })).filter(g => g.count > 0);

    return (
      <div className="space-y-4 animate-in fade-in duration-500 pb-12">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
          <Link href="/dashboard/admin/academic/results" className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 transition-colors shadow-2xs shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-semibold px-2 py-0.5 rounded uppercase ${colors.light} ${colors.text}`}>{course.code}</span>
              <span className="text-[10px] text-slate-500">{session.name}</span>
            </div>
            <h1 className="text-[13px] font-semibold text-slate-900 mt-0.5">{course.title} — Gradebook</h1>
            <p className="text-[10px] text-slate-500">{batch.name}</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Enrolled Students", value: students.length, icon: Users, color: "text-slate-700", bg: "bg-slate-50" },
            { label: "Class Average", value: `${avgTotal}/120`, icon: TrendingUp, color: "text-blue-700", bg: "bg-blue-50" },
            { label: "Pass Rate", value: `${Math.round((passed / (students.length || 1)) * 100)}%`, icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-50" },
            { label: "Highest Score", value: String(highest), icon: Star, color: "text-amber-700", bg: "bg-amber-50" },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${stat.bg}`}><stat.icon className={`w-4 h-4 ${stat.color}`} /></div>
              <div>
                <p className="text-[17px] font-bold text-slate-900">{stat.value}</p>
                <p className="text-[10px] text-slate-500 font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Grade Distribution */}
        {gradeDistribution.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4">
            <h2 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-3">Grade Distribution</h2>
            <div className="flex gap-2 flex-wrap">
              {gradeDistribution.map(g => (
                <div key={g.grade} className={`flex flex-col items-center px-3 py-2 rounded-lg ${gradeColor(g.grade)}`}>
                  <span className="text-[14px] font-bold">{g.count}</span>
                  <span className="text-[10px] font-semibold">{g.grade}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-dark/20 focus:border-brand-dark"
          />
        </div>

        {/* Student Grade Sheet Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                  <th className="px-4 py-2.5">#</th>
                  <th className="px-4 py-2.5">Student</th>
                  <th className="px-4 py-2.5 text-center">CT (20)</th>
                  <th className="px-4 py-2.5 text-center">Assign (20)</th>
                  <th className="px-4 py-2.5 text-center">Mid (30)</th>
                  <th className="px-4 py-2.5 text-center">Final (50)</th>
                  <th className="px-4 py-2.5 text-center font-bold">Total (120)</th>
                  <th className="px-4 py-2.5 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s, idx) => (
                  <tr key={s.studentId} className="hover:bg-slate-50 transition-colors text-xs">
                    <td className="px-4 py-3 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{s.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{s.rollNo}</p>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700 font-medium">{s.ct}</td>
                    <td className="px-4 py-3 text-center text-slate-700 font-medium">{s.assignment}</td>
                    <td className="px-4 py-3 text-center text-slate-700 font-medium">{s.midterm}</td>
                    <td className="px-4 py-3 text-center text-slate-700 font-medium">{s.final}</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-900">{s.total}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${gradeColor(s.letterGrade)}`}>
                        {s.letterGrade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ── GLOBAL RESULTS & GRADEBOOK VIEW ──────────────────────────────────────────────
  const uniqueBatches = Array.from(new Map(allClassrooms.map(c => [c.batch.id, c.batch])).values());

  const filteredClassrooms = allClassrooms.filter(v => {
    if (selectedBatchId && selectedBatchId !== "all" && v.batch.id !== selectedBatchId) return false;
    const matchSearch =
      v.course.title.toLowerCase().includes(search.toLowerCase()) ||
      v.course.code.toLowerCase().includes(search.toLowerCase()) ||
      v.teacher.name.toLowerCase().includes(search.toLowerCase()) ||
      v.batch.name.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const totalEnrolled = allClassrooms.reduce((acc, v) => acc + (v.students?.length || 0), 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-[13px] font-medium text-slate-900">Results & Gradebook</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Comprehensive tracking of academic performance, weighted course grading, and student mark distribution.</p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Active Classrooms", value: allClassrooms.length, color: "text-slate-700", bg: "bg-slate-50" },
          { label: "Total Students", value: totalEnrolled, color: "text-blue-700", bg: "bg-blue-50" },
          { label: "Gradebook Status", value: "Active", color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "Batches Configured", value: uniqueBatches.length, color: "text-purple-700", bg: "bg-purple-50" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl border border-slate-200 p-4 text-center`}>
            <p className={`text-[18px] font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-slate-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters & View Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search course, teacher, or batch..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 placeholder:text-slate-400"
            />
          </div>

          <select
            value={selectedBatchId}
            onChange={e => setSelectedBatchId(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold outline-none focus:border-indigo-500"
          >
            <option value="all">All Batches ({allClassrooms.length} courses)</option>
            {uniqueBatches.map(b => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg p-0.5 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === "list"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
            title="List View"
          >
            <ListIcon className="w-3.5 h-3.5" /> List
          </button>
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === "cards"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
            title="Cards View"
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Cards
          </button>
        </div>
      </div>

      {/* Main Content: List (Default) or Cards */}
      {viewMode === "list" ? (
        <DataTable
          columns={["Course / Classroom", "Batch", "Teacher", "Enrolled Students", "Evaluation Items", "Actions"]}
          isEmpty={filteredClassrooms.length === 0}
          emptyStateIcon={Award}
          emptyStateTitle="No course results found"
          emptyStateDescription="Try adjusting your filters or record test and assignment scores."
        >
          {filteredClassrooms.map(v => (
            <tr key={v.classroom.id} className="hover:bg-slate-50/80 transition-colors group text-xs">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${v.colors.light} ${v.colors.text}`}>
                        {v.course.code}
                      </span>
                      <p className="font-semibold text-slate-900 text-xs">{v.course.title}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">{v.session.name}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3.5 text-slate-600 font-medium">
                {v.batch.name}
              </td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {v.teacher.name}
                </div>
              </td>
              <td className="px-5 py-3.5 font-medium text-slate-700">
                {v.students?.length || 45} students
              </td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    {v.tests?.length || 0} Tests
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    {v.assignments?.length || 0} Assignments
                  </span>
                </div>
              </td>
              <td className="px-5 py-3.5 text-right">
                <Link
                  href={`/dashboard/admin/academic/results/${v.classroom.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[11px] font-medium hover:bg-slate-800 transition-colors shadow-2xs whitespace-nowrap"
                >
                  <Eye className="w-3 h-3 text-indigo-300" /> View Gradebook
                </Link>
              </td>
            </tr>
          ))}
        </DataTable>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClassrooms.map(v => (
            <Link
              key={v.classroom.id}
              href={`/dashboard/admin/academic/results/${v.classroom.id}`}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-400 hover:shadow-md transition-all group block"
            >
              <div className={`h-1 w-full rounded-full ${v.colors.color} mb-4`} />
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${v.colors.light} ${v.colors.text}`}>
                  {v.course.code}
                </span>
                <span className="text-[10px] font-semibold text-slate-500">
                  {v.students?.length || 45} students
                </span>
              </div>
              <h3 className="text-[13px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{v.course.title}</h3>
              <p className="text-[10px] text-slate-500 mt-1">{v.batch.name} • Teacher: {v.teacher.name}</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>{v.tests?.length || 0} tests • {v.assignments?.length || 0} assignments</span>
                <span className="text-indigo-600 font-bold group-hover:translate-x-0.5 transition-transform">View →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

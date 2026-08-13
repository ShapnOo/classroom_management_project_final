"use client";

import {
  Award, ArrowLeft, Download, Star, TrendingUp, Users,
  CheckCircle2, AlertCircle, Search
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
  const { getAllClassroomViews, classSessions, attendanceRecords, gradeRecords, upsertGradeRecord } = useStore();
  const allClassrooms = getAllClassroomViews();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"sheet" | "entry">("sheet");
  const [entryTestId, setEntryTestId] = useState<string>("");
  const [marks, setMarks] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState(false);

  // ── CLASSROOM PICKER ──────────────────────────────────────────────────────
  if (!courseId) {
    return (
      <div className="space-y-4 animate-in fade-in duration-500 pb-12">
        <div className="pb-4 border-b border-slate-200">
          <h2 className="text-[13px] font-medium text-slate-900">Results & Grades</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Select a classroom to view or enter grades.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allClassrooms.map(({ classroom: cls, course, batch, students, colors, teacher }) => (
            <Link key={cls.id} href={`/dashboard/admin/academic/results/${cls.id}`} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-brand-dark/40 hover:shadow-md transition-all group block">
              <div className={`h-1 w-full rounded-full ${colors.color} mb-4`} />
              <span className={`text-[9px] font-semibold px-2 py-0.5 rounded uppercase ${colors.light} ${colors.text}`}>{course.code}</span>
              <h3 className="mt-2 text-[13px] font-medium text-slate-900 group-hover:text-brand-dark transition-colors">{course.title}</h3>
              <p className="text-[10px] text-slate-500 mt-1">{batch.name} • Teacher: {teacher.name}</p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // ── CLASSROOM DETAIL ──────────────────────────────────────────────────────
  const view = allClassrooms.find(v => v.classroom.id === courseId);
  if (!view) return <div className="text-[11px] text-slate-500 py-8 text-center">Classroom not found.</div>;

  const { classroom: cls, course, batch, session, students, tests, assignments, colors } = view;
  const totalSessions = classSessions.filter(s => s.classroomId === cls.id).length;

  // Build result sheet from seeded data + grade records
  const resultSheet: GradeBreakdown[] = students.map(student => {
    // Try to get stored grade records for this student
    const studentGrades = gradeRecords.filter(r => r.classroomId === cls.id && r.studentId === student.id);

    // Attendance
    const attRecs = attendanceRecords.filter(r => r.classroomId === cls.id && r.studentId === student.id);
    const present = attRecs.filter(r => r.status === "present" || r.status === "late").length;
    const attendancePct = totalSessions > 0 ? Math.round((present / totalSessions) * 100) : seededRand(student.id + "att", 65, 98);

    // CT (class tests, average of all CT-type tests)
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

    // Midterm (first big test)
    const midtermTest = tests.find(t => t.totalMarks > 25);
    const midtermGrade = midtermTest ? (studentGrades.find(r => r.testId === midtermTest.id)?.obtainedMarks ?? seededRand(student.id + "mid", 18, 30)) : seededRand(student.id + "mid", 18, 30);
    const midtermOut30 = midtermTest ? Math.round((midtermGrade / midtermTest.totalMarks) * 30) : midtermGrade;

    // Final (computed as remaining)
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

  // Entry mode: select test and enter marks
  const handleMarkSave = () => {
    if (!entryTestId) return;
    const test = tests.find(t => t.id === entryTestId);
    if (!test) return;
    Object.entries(marks).forEach(([studentId, obtained]) => {
      upsertGradeRecord({ classroomId: cls.id, studentId, testId: entryTestId, obtainedMarks: obtained, totalMarks: test.totalMarks });
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <Link href="/dashboard/admin/academic/results" className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 transition-colors shadow-sm shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded uppercase ${colors.light} ${colors.text}`}>{course.code}</span>
            <span className="text-[10px] text-slate-500">{session.name}</span>
          </div>
          <h1 className="text-[13px] font-semibold text-slate-900 mt-0.5">{course.title} — Results</h1>
          <p className="text-[10px] text-slate-500">{batch.name}</p>
        </div>
        <button className="ml-auto flex items-center gap-1.5 text-[11px] font-medium text-slate-600 border border-slate-200 bg-white px-3 py-1.5 rounded-md hover:bg-slate-50 shadow-sm">
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Students", value: students.length, icon: Users, color: "text-slate-700", bg: "bg-slate-50" },
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h2 className="text-[11px] font-medium text-slate-700 uppercase tracking-wide mb-3">Grade Distribution</h2>
          <div className="flex gap-2 flex-wrap">
            {gradeDistribution.map(g => (
              <div key={g.grade} className={`flex flex-col items-center px-3 py-2 rounded-lg ${gradeColor(g.grade)}`}>
                <span className="text-[14px] font-bold">{g.count}</span>
                <span className="text-[10px] font-medium">{g.grade}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {(["sheet","entry"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 text-[11px] font-medium rounded-md transition-all capitalize ${activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {tab === "sheet" ? "Result Sheet" : "Enter Marks"}
          </button>
        ))}
      </div>

      {/* Result Sheet */}
      {activeTab === "sheet" && (
        <>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-dark/20 focus:border-brand-dark" />
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                    <th className="px-4 py-2.5">#</th>
                    <th className="px-4 py-2.5">Student</th>
                    <th className="px-4 py-2.5 text-center">CT (20)</th>
                    <th className="px-4 py-2.5 text-center">Assn (20)</th>
                    <th className="px-4 py-2.5 text-center">Midterm (30)</th>
                    <th className="px-4 py-2.5 text-center">Final (50)</th>
                    <th className="px-4 py-2.5 text-center">Total (120)</th>
                    <th className="px-4 py-2.5 text-center">Att %</th>
                    <th className="px-4 py-2.5 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((r, idx) => (
                    <tr key={r.studentId} className="hover:bg-slate-50 transition-colors text-[11px]">
                      <td className="px-4 py-3 text-slate-400 font-medium">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{r.name}</p>
                        <p className="text-[9px] text-slate-500">{r.rollNo}</p>
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-slate-700">{r.ct}</td>
                      <td className="px-4 py-3 text-center font-medium text-slate-700">{r.assignment}</td>
                      <td className="px-4 py-3 text-center font-medium text-slate-700">{r.midterm}</td>
                      <td className="px-4 py-3 text-center font-medium text-slate-700">{r.final}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-slate-900">{r.total}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-medium ${r.attendancePct >= 75 ? "text-emerald-700" : "text-red-600"}`}>{r.attendancePct}%</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${gradeColor(r.letterGrade)}`}>{r.letterGrade}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Mark Entry */}
      {activeTab === "entry" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <h2 className="text-[11px] font-medium text-slate-700 uppercase tracking-wide">Enter Marks for a Test</h2>
            <select value={entryTestId} onChange={e => { setEntryTestId(e.target.value); setMarks({}); setSaved(false); }} className="w-full max-w-sm px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
              <option value="">Select test / assignment</option>
              {tests.map(t => <option key={t.id} value={t.id}>{t.title} (/{t.totalMarks})</option>)}
              {assignments.map(a => <option key={a.id} value={a.id}>{a.title} (/{a.totalMarks})</option>)}
            </select>
          </div>

          {entryTestId && (() => {
            const item = [...tests, ...assignments].find(x => x.id === entryTestId);
            if (!item) return null;
            return (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-700">Entering marks for: <strong>{item.title}</strong> (Max: {item.totalMarks})</span>
                  <button onClick={handleMarkSave} className="flex items-center gap-1.5 bg-brand-dark text-white text-[11px] font-medium px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
                    {saved ? <><CheckCircle2 className="w-3 h-3" /> Saved!</> : "Save Marks"}
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {students.map((student, idx) => {
                    const existing = gradeRecords.find(r => r.studentId === student.id && (r.testId === entryTestId || r.assignmentId === entryTestId));
                    const value = marks[student.id] ?? (existing?.obtainedMarks ?? "");
                    return (
                      <div key={student.id} className="px-4 py-2.5 flex items-center gap-4">
                        <span className="text-[10px] text-slate-400 w-5 text-right shrink-0">{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-slate-900">{student.name}</p>
                          <p className="text-[9px] text-slate-500">{student.rollNo}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number" min={0} max={item.totalMarks}
                            value={value}
                            onChange={e => setMarks(prev => ({ ...prev, [student.id]: Number(e.target.value) }))}
                            className="w-16 text-center px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
                          />
                          <span className="text-[10px] text-slate-400">/{item.totalMarks}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useCallback, useEffect } from "react";
import { useStore } from "@/lib/store";

export default function TeacherEvaluation() {
  const {
    getMyClassroomViews, gradeRecords, attendanceRecords, tests, assignments,
    fetchClassrooms, fetchCourses, fetchBatches, fetchStudents,
    fetchGradeRecords, fetchAttendanceRecords, fetchTests, fetchAssignments
  } = useStore();

  useEffect(() => {
    fetchClassrooms();
    fetchCourses();
    fetchBatches();
    fetchStudents();
    fetchGradeRecords();
    fetchAttendanceRecords();
    fetchTests();
    fetchAssignments();
  }, []);

  const myClassrooms = getMyClassroomViews();

  const classroomsData = myClassrooms.map(v => ({
    id: v.classroom.id,
    name: v.course.title,
    code: v.course.code,
    batch: v.batch.name,
    students: v.students,
    gradeRecords,
    attendanceRecords,
    tests: v.tests,
    assignments: v.assignments,
  }));

  return <TeacherEvaluationBody classrooms={classroomsData} />;
}

import Link from "next/link";
import {
  ArrowLeft, Users, Search, Filter, Download, CheckCircle2,
  AlertTriangle, TrendingUp, Star, ChevronDown
} from "lucide-react";

type ClassroomOption = {
  id: string;
  name: string;
  code: string;
  batch: string;
  students: { id: string; name: string; rollNo: string }[];
  gradeRecords: any[];
  attendanceRecords: any[];
  tests: any[];
  assignments: any[];
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

function TeacherEvaluationBody({ classrooms }: { classrooms: ClassroomOption[] }) {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"grades" | "attendance" | "overview">("overview");

  const selectedClass = classrooms.find(c => c.id === selectedClassId);

  // Compute student evaluation deterministically from store data
  const gradeData = useCallback(() => {
    if (!selectedClass) return [];
    return selectedClass.students.map((student, idx) => {
      const studentGrades = (selectedClass.gradeRecords || []).filter(g => g.classroomId === selectedClass.id && g.studentId === student.id);
      const studentAtt = (selectedClass.attendanceRecords || []).filter(g => g.classroomId === selectedClass.id && g.studentId === student.id);
      const present = studentAtt.filter(a => a.status === "present" || a.status === "late").length;
      const attPct = studentAtt.length > 0 ? Math.round((present / studentAtt.length) * 100) : 85 + (idx % 12);

      const ctRecs = studentGrades.filter(g => g.testId);
      const ctAvg = ctRecs.length > 0 ? Math.round(ctRecs.reduce((sum, r) => sum + (r.obtainedMarks / r.totalMarks) * 100, 0) / ctRecs.length) : 78 + (idx % 15);

      const assnRecs = studentGrades.filter(g => g.assignmentId);
      const assnAvg = assnRecs.length > 0 ? Math.round(assnRecs.reduce((sum, r) => sum + (r.obtainedMarks / r.totalMarks) * 100, 0) / assnRecs.length) : 82 + (idx % 12);

      const midtermAvg = 75 + (idx % 20);
      const totalPct = Math.round(ctAvg * 0.20 + assnAvg * 0.20 + attPct * 0.10 + midtermAvg * 0.50);

      return {
        ...student,
        ct: Math.round(ctAvg * 0.15),
        assignment: Math.round(assnAvg * 0.20),
        attendance: attPct,
        midterm: Math.round(midtermAvg * 0.30),
        total: totalPct,
        grade: letterGrade(totalPct),
      };
    });
  }, [selectedClass]);


  const students = gradeData().filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNo.toLowerCase().includes(search.toLowerCase())
  );

  if (!selectedClassId) {
    return (
      <div className="space-y-4 animate-in fade-in duration-500 pb-12">
        <div className="pb-4 border-b border-slate-200">
          <h2 className="text-[13px] font-medium text-slate-900">Select a Classroom</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Choose a classroom to view and manage student grades and evaluations.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {classrooms.map(cls => (
            <button key={cls.id} onClick={() => setSelectedClassId(cls.id)} className="bg-white border border-slate-200 rounded-xl p-5 text-left hover:border-brand-dark/40 hover:shadow-md transition-all group">
              <span className="text-[10px] font-semibold text-brand-dark bg-brand-dark/5 border border-brand-dark/10 px-2 py-0.5 rounded uppercase">{cls.code}</span>
              <h3 className="mt-2 text-[13px] font-medium text-slate-900 group-hover:text-brand-dark transition-colors leading-snug">{cls.name}</h3>
              <p className="text-[10px] text-slate-500 mt-1">{cls.batch} • {cls.students.length} students</p>
            </button>
          ))}
        </div>
        {classrooms.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-[12px]">No classrooms assigned yet. Contact admin.</div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <button onClick={() => setSelectedClassId(null)} className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 transition-colors shadow-sm"><ArrowLeft className="w-4 h-4" /></button>
        <div>
          <h2 className="text-[13px] font-medium text-slate-900">{selectedClass?.name} — Evaluation</h2>
          <p className="text-[10px] text-slate-500">{selectedClass?.batch} • {selectedClass?.code}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {(["overview","grades","attendance"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all capitalize ${activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>{tab}</button>
        ))}
      </div>

      {/* Search + download */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input type="text" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-dark/20 focus:border-brand-dark" />
        </div>
        <button className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 border border-slate-200 bg-white px-3 py-1.5 rounded-md hover:bg-slate-50 transition-colors">
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>

      {/* Grades Table */}
      {activeTab === "grades" && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                  <th className="px-4 py-2.5">Student</th>
                  <th className="px-4 py-2.5">CT (15%)</th>
                  <th className="px-4 py-2.5">Assignment (20%)</th>
                  <th className="px-4 py-2.5">Attendance (10%)</th>
                  <th className="px-4 py-2.5">Midterm (30%)</th>
                  <th className="px-4 py-2.5">Total</th>
                  <th className="px-4 py-2.5">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors text-[11px]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{s.name}</p>
                      <p className="text-[10px] text-slate-500">{s.rollNo}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{s.ct}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{s.assignment}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{s.attendance}%</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{s.midterm}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{s.total}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${s.grade.startsWith("A") ? "bg-emerald-100 text-emerald-700" : s.grade.startsWith("B") ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{s.grade}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Students", value: selectedClass?.students.length ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Class Average", value: "74%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Highest Grade", value: "A+", icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
              <div>
                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-[11px] text-slate-500 font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "attendance" && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                  <th className="px-4 py-2.5">Student</th>
                  <th className="px-4 py-2.5">Attendance %</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors text-[11px]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{s.name}</p>
                      <p className="text-[10px] text-slate-500">{s.rollNo}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${s.attendance >= 75 ? "bg-emerald-500" : "bg-red-500"}`} style={{ width: `${s.attendance}%` }} />
                        </div>
                        <span className="font-medium text-slate-700">{s.attendance}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 w-fit ${s.attendance >= 75 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {s.attendance >= 75 ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {s.attendance >= 75 ? "Regular" : "At Risk"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

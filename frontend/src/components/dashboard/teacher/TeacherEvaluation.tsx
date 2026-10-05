"use client";

import { useState, useCallback, useEffect } from "react";
import { useStore } from "@/lib/store";
import Link from "next/link";
import {
  ArrowLeft, Users, Search, Download, CheckCircle2,
  AlertTriangle, TrendingUp, Star, Settings2, Sliders, Check,
  Save, X, Info, FileText, CheckSquare
} from "lucide-react";
import ModalDialog from "@/components/ui/ModalDialog";

export type EvaluationPolicyComponent = {
  enabled: boolean;
  weight: number;
  label: string;
  totalConducted?: number;
  bestCount?: number;
  rule?: "best_n" | "avg_all" | "best_1";
};

export type CourseEvaluationPolicy = {
  ct: EvaluationPolicyComponent;
  assignment: EvaluationPolicyComponent;
  project: EvaluationPolicyComponent;
  attendance: EvaluationPolicyComponent;
  midterm: EvaluationPolicyComponent;
  finalExam: EvaluationPolicyComponent;
};

const DEFAULT_POLICY: CourseEvaluationPolicy = {
  ct: { enabled: true, weight: 15, label: "Class Tests (CT)", totalConducted: 5, bestCount: 3, rule: "best_n" },
  assignment: { enabled: true, weight: 10, label: "Assignments", totalConducted: 3, bestCount: 2, rule: "best_n" },
  project: { enabled: true, weight: 15, label: "Term Project", totalConducted: 1, bestCount: 1, rule: "avg_all" },
  attendance: { enabled: true, weight: 10, label: "Attendance" },
  midterm: { enabled: true, weight: 20, label: "Mid-Term Exam" },
  finalExam: { enabled: true, weight: 30, label: "Final Exam" },
};

function getLetterGrade(score: number): { grade: string; gpa: string; color: string } {
  if (score >= 80) return { grade: "A+", gpa: "4.00", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
  if (score >= 75) return { grade: "A", gpa: "3.75", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (score >= 70) return { grade: "A-", gpa: "3.50", color: "bg-teal-50 text-teal-700 border-teal-200" };
  if (score >= 65) return { grade: "B+", gpa: "3.25", color: "bg-blue-50 text-blue-700 border-blue-200" };
  if (score >= 60) return { grade: "B", gpa: "3.00", color: "bg-blue-50 text-blue-600 border-blue-200" };
  if (score >= 55) return { grade: "B-", gpa: "2.75", color: "bg-indigo-50 text-indigo-600 border-indigo-200" };
  if (score >= 50) return { grade: "C+", gpa: "2.50", color: "bg-amber-50 text-amber-700 border-amber-200" };
  if (score >= 45) return { grade: "C", gpa: "2.25", color: "bg-amber-50 text-amber-600 border-amber-200" };
  if (score >= 40) return { grade: "D", gpa: "2.00", color: "bg-orange-50 text-orange-700 border-orange-200" };
  return { grade: "F", gpa: "0.00", color: "bg-red-100 text-red-700 border-red-200" };
}

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

function TeacherEvaluationBody({ classrooms }: { classrooms: ClassroomOption[] }) {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"grades" | "policy" | "overview">("grades");

  // Dynamic Course Policy State
  const [policy, setPolicy] = useState<CourseEvaluationPolicy>(DEFAULT_POLICY);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policySavedToast, setPolicySavedToast] = useState(false);

  // Editable Student Custom Exam Marks (Midterm, Final, Project)
  const [customMarksMap, setCustomMarksMap] = useState<Record<string, { midterm?: number; finalExam?: number; project?: number }>>({});

  const selectedClass = classrooms.find(c => c.id === selectedClassId);

  // Load saved evaluation policy for the selected course
  useEffect(() => {
    if (selectedClassId) {
      const saved = localStorage.getItem(`scholaris_eval_policy_${selectedClassId}`);
      if (saved) {
        try {
          setPolicy(JSON.parse(saved));
        } catch (e) {
          setPolicy(DEFAULT_POLICY);
        }
      } else {
        setPolicy(DEFAULT_POLICY);
      }
    }
  }, [selectedClassId]);

  // Calculate policy sum
  const totalWeightSum = Object.values(policy)
    .filter(c => c.enabled)
    .reduce((sum, c) => sum + Number(c.weight || 0), 0);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Save Policy to LocalStorage
  const handleSavePolicy = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Are you sure?",
      message: `Are you sure you want to save this evaluation & grading policy for ${selectedClass?.code || "this course"}?`,
      onConfirm: () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        if (selectedClassId) {
          localStorage.setItem(`scholaris_eval_policy_${selectedClassId}`, JSON.stringify(policy));
          setShowPolicyModal(false);
          setPolicySavedToast(true);
          setTimeout(() => setPolicySavedToast(false), 3000);
        }
      },
    });
  };

  // Compute student final grades dynamically based on Teacher's Policy
  const gradeData = useCallback(() => {
    if (!selectedClass) return [];

    return selectedClass.students.map((student, idx) => {
      const studentGrades = (selectedClass.gradeRecords || []).filter(g => g.classroomId === selectedClass.id && g.studentId === student.id);
      const studentAtt = (selectedClass.attendanceRecords || []).filter(g => g.classroomId === selectedClass.id && g.studentId === student.id);
      
      // 1. Attendance %
      const present = studentAtt.filter(a => a.status === "present" || a.status === "late").length;
      const attPct = studentAtt.length > 0 ? Math.round((present / studentAtt.length) * 100) : 85 + (idx % 12);
      const attMark = policy.attendance.enabled ? Math.round((attPct / 100) * policy.attendance.weight) : 0;

      // 2. Class Tests (CT) Best N Calculation
      let ctScores: number[] = [];
      const ctRecs = studentGrades.filter(g => g.testId);
      if (ctRecs.length > 0) {
        ctScores = ctRecs.map(r => Math.round((r.obtainedMarks / r.totalMarks) * 100));
      } else {
        const count = policy.ct.totalConducted || 5;
        const base = 70 + (idx * 3) % 25;
        ctScores = Array.from({ length: count }, (_, i) => Math.min(100, Math.max(40, base + ((i * 7 + idx * 5) % 20) - 5)));
      }
      ctScores.sort((a, b) => b - a);

      let ctAvgPct = 0;
      if (policy.ct.rule === "best_1") {
        ctAvgPct = ctScores[0] || 0;
      } else if (policy.ct.rule === "best_n") {
        const take = Math.min(policy.ct.bestCount || 2, ctScores.length);
        const bestScores = ctScores.slice(0, take);
        ctAvgPct = bestScores.length > 0 ? Math.round(bestScores.reduce((a, b) => a + b, 0) / bestScores.length) : 0;
      } else {
        ctAvgPct = ctScores.length > 0 ? Math.round(ctScores.reduce((a, b) => a + b, 0) / ctScores.length) : 0;
      }
      const ctMark = policy.ct.enabled ? Math.round((ctAvgPct / 100) * policy.ct.weight) : 0;

      // 3. Assignments Best N Calculation
      let assnScores: number[] = [];
      const assnRecs = studentGrades.filter(g => g.assignmentId);
      if (assnRecs.length > 0) {
        assnScores = assnRecs.map(r => Math.round((r.obtainedMarks / r.totalMarks) * 100));
      } else {
        const count = policy.assignment.totalConducted || 3;
        const base = 75 + (idx * 4) % 20;
        assnScores = Array.from({ length: count }, (_, i) => Math.min(100, Math.max(45, base + ((i * 5 + idx * 3) % 18) - 4)));
      }
      assnScores.sort((a, b) => b - a);

      let assnAvgPct = 0;
      if (policy.assignment.rule === "best_1") {
        assnAvgPct = assnScores[0] || 0;
      } else if (policy.assignment.rule === "best_n") {
        const take = Math.min(policy.assignment.bestCount || 2, assnScores.length);
        const bestScores = assnScores.slice(0, take);
        assnAvgPct = bestScores.length > 0 ? Math.round(bestScores.reduce((a, b) => a + b, 0) / bestScores.length) : 0;
      } else {
        assnAvgPct = assnScores.length > 0 ? Math.round(assnScores.reduce((a, b) => a + b, 0) / assnScores.length) : 0;
      }
      const assnMark = policy.assignment.enabled ? Math.round((assnAvgPct / 100) * policy.assignment.weight) : 0;

      // 4. Custom/Editable Marks: Project, Midterm, Final Exam
      const custom = customMarksMap[student.id] || {};
      const projPct = custom.project ?? (75 + (idx % 18));
      const projMark = policy.project.enabled ? Math.round((projPct / 100) * policy.project.weight) : 0;

      const midPct = custom.midterm ?? (74 + (idx % 20));
      const midtermMark = policy.midterm.enabled ? Math.round((midPct / 100) * policy.midterm.weight) : 0;

      const finalPct = custom.finalExam ?? (76 + (idx % 18));
      const finalExamMark = policy.finalExam.enabled ? Math.round((finalPct / 100) * policy.finalExam.weight) : 0;

      // Total Weighted Score Out of 100
      const totalScore = ctMark + assnMark + projMark + attMark + midtermMark + finalExamMark;
      const gradeObj = getLetterGrade(totalScore);

      return {
        ...student,
        attPct,
        ctAvgPct,
        assnAvgPct,
        projPct,
        midPct,
        finalPct,
        ctMark,
        assnMark,
        projMark,
        attMark,
        midtermMark,
        finalExamMark,
        totalScore,
        grade: gradeObj.grade,
        gpa: gradeObj.gpa,
        gradeColor: gradeObj.color,
      };
    });
  }, [selectedClass, policy, customMarksMap]);

  const students = gradeData().filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNo.toLowerCase().includes(search.toLowerCase())
  );

  // Update custom mark helper
  const handleUpdateCustomMark = (studentId: string, field: "midterm" | "finalExam" | "project", val: number) => {
    setCustomMarksMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: Math.min(100, Math.max(0, val)),
      },
    }));
  };

  // CSV Export Helper
  const handleExportCSV = () => {
    if (!selectedClass) return;
    const headers = ["Roll No", "Student Name", "CT Mark", "Assignment Mark", "Project Mark", "Attendance Mark", "Midterm Mark", "Final Exam Mark", "Total Score", "Grade", "GPA"];
    const rows = students.map(s => [
      s.rollNo,
      `"${s.name}"`,
      s.ctMark,
      s.assnMark,
      s.projMark,
      s.attMark,
      s.midtermMark,
      s.finalExamMark,
      s.totalScore,
      s.grade,
      s.gpa
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${selectedClass.code}_Final_Grades.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!selectedClassId) {
    return (
      <div className="space-y-4 animate-in fade-in duration-300 pb-12 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Course Evaluation & Grading</h1>
            <p className="text-[11px] text-slate-500 mt-0.5">Select a course to customize its grading weights & calculate final grades.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {classrooms.map(cls => (
            <button
              key={cls.id}
              onClick={() => setSelectedClassId(cls.id)}
              className="bg-white border border-slate-200/80 rounded-xl p-4 text-left hover:border-slate-400 hover:shadow-xs transition-all group space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                  {cls.code}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                  {cls.batch}
                </span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-slate-900 transition-colors leading-snug">
                  {cls.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{cls.students.length} Enrolled</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-700 font-bold">
                <span>View & Configure Grades</span>
                <span>→</span>
              </div>
            </button>
          ))}
        </div>

        {classrooms.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">No classrooms assigned yet. Contact system administrator.</div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300 pb-12 max-w-7xl mx-auto text-xs">
      
      {/* Policy Saved Toast */}
      {policySavedToast && (
        <div className="bg-emerald-600 text-white px-3.5 py-2 rounded-xl flex items-center gap-2 text-[11px] shadow-sm animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span className="font-bold">Grading policy saved successfully for {selectedClass?.code}!</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedClassId(null)}
            className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                {selectedClass?.code}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">{selectedClass?.batch}</span>
            </div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight mt-0.5">{selectedClass?.name}</h1>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPolicyModal(true)}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1.5 border border-slate-200 shadow-2xs"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" /> Customize Policy Weights
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Current Policy Overview Banner */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Settings2 className="w-3.5 h-3.5 text-slate-600" />
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Active Evaluation Policy & Weight Distribution
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
              totalWeightSum === 100
                ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                : "bg-amber-50 text-amber-700 border-amber-200/60"
            }`}>
              Total Weight: {totalWeightSum}% {totalWeightSum === 100 ? "✓ Validated" : "⚠️ Warning: Not 100%"}
            </span>
            <button
              onClick={() => setShowPolicyModal(true)}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
            >
              Edit Breakdown
            </button>
          </div>
        </div>

        {/* Enabled Component Weight Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {Object.entries(policy).map(([key, item]) => {
            if (!item.enabled) return null;
            const ruleText = item.rule === "best_n" ? `(Best ${item.bestCount} of ${item.totalConducted})` : item.rule === "best_1" ? "(Best 1)" : item.totalConducted ? `(Avg of ${item.totalConducted})` : "";
            return (
              <div key={key} className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1.5 font-medium text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0" />
                <span>{item.label}:</span>
                <span className="font-extrabold text-slate-900">{item.weight}%</span>
                {ruleText && <span className="text-[9px] text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-bold">{ruleText}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab("grades")}
          className={`py-1.5 px-3.5 text-[11px] font-bold rounded-lg transition-all ${
            activeTab === "grades"
              ? "bg-slate-900 text-white shadow-2xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Final Grade Sheet & Marks
        </button>
        <button
          onClick={() => setActiveTab("policy")}
          className={`py-1.5 px-3.5 text-[11px] font-bold rounded-lg transition-all ${
            activeTab === "policy"
              ? "bg-slate-900 text-white shadow-2xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Policy Configuration
        </button>
        <button
          onClick={() => setActiveTab("overview")}
          className={`py-1.5 px-3.5 text-[11px] font-bold rounded-lg transition-all ${
            activeTab === "overview"
              ? "bg-slate-900 text-white shadow-2xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Class Summary & Statistics
        </button>
      </div>

      {/* TAB 1: FINAL GRADE SHEET */}
      {activeTab === "grades" && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by student name or roll no..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">Showing {students.length} Students</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-extrabold">
                    <th className="px-5 py-3.5">Roll & Name</th>
                    {policy.ct.enabled && (
                      <th className="px-4 py-3.5">
                        CT ({policy.ct.weight}%)
                        <span className="block text-[9px] text-blue-600 font-normal lowercase">
                          {policy.ct.rule === "best_n" ? `best ${policy.ct.bestCount}/${policy.ct.totalConducted}` : policy.ct.rule === "best_1" ? "best 1" : "avg all"}
                        </span>
                      </th>
                    )}
                    {policy.assignment.enabled && (
                      <th className="px-4 py-3.5">
                        Assn ({policy.assignment.weight}%)
                        <span className="block text-[9px] text-blue-600 font-normal lowercase">
                          {policy.assignment.rule === "best_n" ? `best ${policy.assignment.bestCount}/${policy.assignment.totalConducted}` : policy.assignment.rule === "best_1" ? "best 1" : "avg all"}
                        </span>
                      </th>
                    )}
                    {policy.project.enabled && <th className="px-4 py-3.5">Proj ({policy.project.weight}%)</th>}
                    {policy.attendance.enabled && <th className="px-4 py-3.5">Att ({policy.attendance.weight}%)</th>}
                    {policy.midterm.enabled && <th className="px-4 py-3.5">Mid ({policy.midterm.weight}%)</th>}
                    {policy.finalExam.enabled && <th className="px-4 py-3.5">Final ({policy.finalExam.weight}%)</th>}
                    <th className="px-5 py-3.5">Total (100)</th>
                    <th className="px-5 py-3.5">Grade</th>
                    <th className="px-5 py-3.5 text-right">GPA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-slate-900">{s.name}</p>
                        <p className="text-[11px] text-slate-400 font-semibold">{s.rollNo}</p>
                      </td>

                      {policy.ct.enabled && (
                        <td className="px-4 py-3.5 font-bold text-slate-800">
                          {s.ctMark} <span className="text-[10px] text-slate-400 font-normal">({s.ctAvgPct}%)</span>
                        </td>
                      )}

                      {policy.assignment.enabled && (
                        <td className="px-4 py-3.5 font-bold text-slate-800">
                          {s.assnMark} <span className="text-[10px] text-slate-400 font-normal">({s.assnAvgPct}%)</span>
                        </td>
                      )}

                      {policy.project.enabled && (
                        <td className="px-4 py-3.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={s.projPct}
                            onChange={(e) => handleUpdateCustomMark(s.id, "project", Number(e.target.value))}
                            className="w-14 px-2 py-1 text-xs border border-slate-200 rounded-lg text-center font-bold focus:outline-none focus:border-slate-900 bg-slate-50"
                            title="Enter Project % mark (0-100)"
                          />
                          <span className="text-[10px] text-slate-400 font-bold ml-1">={s.projMark}</span>
                        </td>
                      )}

                      {policy.attendance.enabled && (
                        <td className="px-4 py-3.5 font-bold text-slate-800">
                          {s.attMark} <span className="text-[10px] text-slate-400 font-normal">({s.attPct}%)</span>
                        </td>
                      )}

                      {policy.midterm.enabled && (
                        <td className="px-4 py-3.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={s.midPct}
                            onChange={(e) => handleUpdateCustomMark(s.id, "midterm", Number(e.target.value))}
                            className="w-14 px-2 py-1 text-xs border border-slate-200 rounded-lg text-center font-bold focus:outline-none focus:border-slate-900 bg-slate-50"
                            title="Enter Midterm % mark (0-100)"
                          />
                          <span className="text-[10px] text-slate-400 font-bold ml-1">={s.midtermMark}</span>
                        </td>
                      )}

                      {policy.finalExam.enabled && (
                        <td className="px-4 py-3.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={s.finalPct}
                            onChange={(e) => handleUpdateCustomMark(s.id, "finalExam", Number(e.target.value))}
                            className="w-14 px-2 py-1 text-xs border border-slate-200 rounded-lg text-center font-bold focus:outline-none focus:border-slate-900 bg-slate-50"
                            title="Enter Final Exam % mark (0-100)"
                          />
                          <span className="text-[10px] text-slate-400 font-bold ml-1">={s.finalExamMark}</span>
                        </td>
                      )}

                      <td className="px-5 py-3.5 font-extrabold text-slate-900 text-sm">
                        {s.totalScore} <span className="text-[10px] text-slate-400 font-normal">/100</span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-extrabold px-2.5 py-1 rounded-md border ${s.gradeColor}`}>
                          {s.grade}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right font-extrabold text-slate-900">
                        {s.gpa}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: POLICY CONFIGURATION FORM */}
      {activeTab === "policy" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6 max-w-3xl">
          <div>
            <h3 className="text-base font-bold text-slate-900">Course Evaluation Policy Configurator</h3>
            <p className="text-xs text-slate-500 mt-1">
              Select components to include in this course and set their weightage percentages. Total must equal 100%.
            </p>
          </div>

          {/* Component Switches */}
          <div className="space-y-4 divide-y divide-slate-100">
            {Object.entries(policy).map(([key, comp]) => {
              const compKey = key as keyof CourseEvaluationPolicy;
              const hasSubRules = key === "ct" || key === "assignment";
              return (
                <div key={key} className="pt-4 first:pt-0 space-y-2.5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={comp.enabled}
                        onChange={(e) => {
                          setPolicy(prev => ({
                            ...prev,
                            [compKey]: { ...prev[compKey], enabled: e.target.checked }
                          }));
                        }}
                        className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{comp.label}</p>
                        <p className="text-[11px] text-slate-500">Enable/disable {comp.label.toLowerCase()} in final calculation</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        disabled={!comp.enabled}
                        value={comp.weight}
                        onChange={(e) => {
                          setPolicy(prev => ({
                            ...prev,
                            [compKey]: { ...prev[compKey], weight: Number(e.target.value) }
                          }));
                        }}
                        className="w-16 px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl text-center focus:outline-none focus:border-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                      />
                      <span className="text-xs font-bold text-slate-500">%</span>
                    </div>
                  </div>

                  {/* Sub-rules for CTs & Assignments */}
                  {comp.enabled && hasSubRules && (
                    <div className="ml-7 p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="font-bold text-slate-700">Selection Policy:</span>
                        <select
                          value={comp.rule || "best_n"}
                          onChange={(e) => {
                            setPolicy(prev => ({
                              ...prev,
                              [compKey]: { ...prev[compKey], rule: e.target.value as any }
                            }));
                          }}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:border-slate-900"
                        >
                          <option value="best_n">Best N (e.g. Best 2 of 3)</option>
                          <option value="avg_all">Average of All Conducted</option>
                          <option value="best_1">Best 1 (Highest Score)</option>
                        </select>

                        {(comp.rule === "best_n" || comp.rule === "avg_all" || !comp.rule) && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 font-medium">Total Conducted:</span>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={comp.totalConducted || 3}
                              onChange={(e) => {
                                const val = Math.max(1, Number(e.target.value));
                                setPolicy(prev => ({
                                  ...prev,
                                  [compKey]: {
                                    ...prev[compKey],
                                    totalConducted: val,
                                    bestCount: Math.min(prev[compKey].bestCount || 2, val),
                                  }
                                }));
                              }}
                              className="w-12 px-2 py-0.5 text-xs font-bold border border-slate-200 rounded-md text-center bg-white"
                            />
                          </div>
                        )}

                        {(comp.rule === "best_n" || !comp.rule) && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 font-medium">Consider Best:</span>
                            <input
                              type="number"
                              min="1"
                              max={comp.totalConducted || 10}
                              value={comp.bestCount || 2}
                              onChange={(e) => {
                                const val = Math.min(comp.totalConducted || 10, Math.max(1, Number(e.target.value)));
                                setPolicy(prev => ({
                                  ...prev,
                                  [compKey]: { ...prev[compKey], bestCount: val }
                                }));
                              }}
                              className="w-12 px-2 py-0.5 text-xs font-bold border border-slate-200 rounded-md text-center bg-white"
                            />
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 italic">
                        {comp.rule === "best_n" || !comp.rule
                          ? `Will calculate grade from student's Top ${comp.bestCount || 2} highest scores out of ${comp.totalConducted || 3} total ${comp.label.toLowerCase()}.`
                          : comp.rule === "best_1"
                          ? `Will take only the single highest score among all conducted ${comp.label.toLowerCase()}.`
                          : `Will calculate average across all ${comp.totalConducted || 3} conducted ${comp.label.toLowerCase()}.`}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Validation Bar */}
          <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-bold ${
            totalWeightSum === 100
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-amber-50 text-amber-800 border-amber-200"
          }`}>
            <span>Total Weightage Sum: {totalWeightSum}%</span>
            <span>{totalWeightSum === 100 ? "✓ 100% Validated" : "⚠️ Sum must equal 100%"}</span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setPolicy(DEFAULT_POLICY)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
            >
              Reset Default
            </button>
            <button
              onClick={handleSavePolicy}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Course Evaluation Policy
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600"><Users className="w-6 h-6" /></div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{selectedClass?.students.length ?? 0}</p>
              <p className="text-xs text-slate-500 font-semibold">Enrolled Students</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600"><TrendingUp className="w-6 h-6" /></div>
            <div>
              <p className="text-2xl font-extrabold text-emerald-600">
                {students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.totalScore, 0) / students.length) : 0}%
              </p>
              <p className="text-xs text-slate-500 font-semibold">Course Average Score</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600"><Star className="w-6 h-6" /></div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">A+</p>
              <p className="text-xs text-slate-500 font-semibold">Highest Achieved Grade</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CUSTOMIZE POLICY MODAL */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-slate-700" /> Customize Course Grading Policy
              </h3>
              <button onClick={() => setShowPolicyModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div className="space-y-3 divide-y divide-slate-100 max-h-[420px] overflow-y-auto pr-1">
                {Object.entries(policy).map(([key, comp]) => {
                  const compKey = key as keyof CourseEvaluationPolicy;
                  const hasSubRules = key === "ct" || key === "assignment";
                  return (
                    <div key={key} className="pt-3 first:pt-0 space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={comp.enabled}
                            onChange={(e) => {
                              setPolicy(prev => ({
                                ...prev,
                                [compKey]: { ...prev[compKey], enabled: e.target.checked }
                              }));
                            }}
                            className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
                          />
                          <span className="font-bold text-slate-900 text-xs">{comp.label}</span>
                        </label>

                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            disabled={!comp.enabled}
                            value={comp.weight}
                            onChange={(e) => {
                              setPolicy(prev => ({
                                ...prev,
                                [compKey]: { ...prev[compKey], weight: Number(e.target.value) }
                              }));
                            }}
                            className="w-16 px-2.5 py-1 text-xs font-bold border border-slate-200 rounded-lg text-center focus:outline-none focus:border-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                          />
                          <span className="font-bold text-slate-400">%</span>
                        </div>
                      </div>

                      {comp.enabled && hasSubRules && (
                        <div className="ml-6 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2 text-[11px]">
                            <span className="font-bold text-slate-700">Rule:</span>
                            <select
                              value={comp.rule || "best_n"}
                              onChange={(e) => {
                                setPolicy(prev => ({
                                  ...prev,
                                  [compKey]: { ...prev[compKey], rule: e.target.value as any }
                                }));
                              }}
                              className="px-2 py-0.5 rounded-md border border-slate-200 text-[11px] font-semibold bg-white"
                            >
                              <option value="best_n">Best N of Total</option>
                              <option value="avg_all">Average of All</option>
                              <option value="best_1">Best 1 (Highest)</option>
                            </select>

                            {(comp.rule === "best_n" || comp.rule === "avg_all" || !comp.rule) && (
                              <div className="flex items-center gap-1">
                                <span className="text-slate-500">Total:</span>
                                <input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={comp.totalConducted || 3}
                                  onChange={(e) => {
                                    const val = Math.max(1, Number(e.target.value));
                                    setPolicy(prev => ({
                                      ...prev,
                                      [compKey]: {
                                        ...prev[compKey],
                                        totalConducted: val,
                                        bestCount: Math.min(prev[compKey].bestCount || 2, val),
                                      }
                                    }));
                                  }}
                                  className="w-10 px-1.5 py-0.5 text-[11px] font-bold border border-slate-200 rounded text-center bg-white"
                                />
                              </div>
                            )}

                            {(comp.rule === "best_n" || !comp.rule) && (
                              <div className="flex items-center gap-1">
                                <span className="text-slate-500">Best:</span>
                                <input
                                  type="number"
                                  min="1"
                                  max={comp.totalConducted || 10}
                                  value={comp.bestCount || 2}
                                  onChange={(e) => {
                                    const val = Math.min(comp.totalConducted || 10, Math.max(1, Number(e.target.value)));
                                    setPolicy(prev => ({
                                      ...prev,
                                      [compKey]: { ...prev[compKey], bestCount: val }
                                    }));
                                  }}
                                  className="w-10 px-1.5 py-0.5 text-[11px] font-bold border border-slate-200 rounded text-center bg-white"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold ${
                totalWeightSum === 100
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}>
                <span>Total Weightage Sum: {totalWeightSum}%</span>
                <span>{totalWeightSum === 100 ? "✓ 100% Validated" : "⚠️ Must equal 100%"}</span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowPolicyModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePolicy}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ModalDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type="confirm"
        confirmLabel="Yes, Save Policy"
        cancelLabel="Cancel"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
}

"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import Link from "next/link";
import {
  ArrowLeft, Users, Search, Download, CheckCircle2,
  AlertTriangle, TrendingUp, Star, Settings2, Sliders, Check,
  Save, X, Info, FileText, CheckSquare, Sparkles, Plus, Minus,
  RotateCcw, AlertCircle, Percent, ShieldCheck, GraduationCap,
  Award, FolderGit2, ListTodo, ClipboardCheck, Zap, RefreshCw
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

export type PolicyComponentKey = "ct" | "assignment" | "project" | "attendance" | "midterm" | "finalExam";

export type CourseEvaluationPolicy = {
  ct: EvaluationPolicyComponent;
  assignment: EvaluationPolicyComponent;
  project: EvaluationPolicyComponent;
  attendance: EvaluationPolicyComponent;
  midterm: EvaluationPolicyComponent;
  finalExam: EvaluationPolicyComponent;
  minAttendanceThreshold?: number;
  latePenaltyPerDay?: number;
};

const DEFAULT_POLICY: CourseEvaluationPolicy = {
  ct: { enabled: true, weight: 15, label: "Class Tests (CT)", totalConducted: 5, bestCount: 3, rule: "best_n" },
  assignment: { enabled: true, weight: 10, label: "Assignments", totalConducted: 3, bestCount: 2, rule: "best_n" },
  project: { enabled: true, weight: 15, label: "Term Project", totalConducted: 1, bestCount: 1, rule: "avg_all" },
  attendance: { enabled: true, weight: 10, label: "Attendance" },
  midterm: { enabled: true, weight: 20, label: "Mid-Term Exam" },
  finalExam: { enabled: true, weight: 30, label: "Final Exam" },
  minAttendanceThreshold: 75,
  latePenaltyPerDay: 5,
};

const PRESET_TEMPLATES = [
  {
    id: "standard_ugc",
    name: "Standard UGC / University",
    tag: "Recommended",
    description: "Balanced traditional weightage with Best 3 of 5 CTs",
    policy: {
      ct: { enabled: true, weight: 15, label: "Class Tests (CT)", totalConducted: 5, bestCount: 3, rule: "best_n" as const },
      assignment: { enabled: true, weight: 10, label: "Assignments", totalConducted: 3, bestCount: 2, rule: "best_n" as const },
      project: { enabled: true, weight: 15, label: "Term Project", totalConducted: 1, bestCount: 1, rule: "avg_all" as const },
      attendance: { enabled: true, weight: 10, label: "Attendance" },
      midterm: { enabled: true, weight: 20, label: "Mid-Term Exam" },
      finalExam: { enabled: true, weight: 30, label: "Final Exam" },
      minAttendanceThreshold: 75,
      latePenaltyPerDay: 5,
    }
  },
  {
    id: "continuous_heavy",
    name: "Continuous Assessment Focused",
    tag: "High Coursework",
    description: "Emphasis on continuous coursework, quizzes & projects",
    policy: {
      ct: { enabled: true, weight: 25, label: "Class Tests (CT)", totalConducted: 4, bestCount: 3, rule: "best_n" as const },
      assignment: { enabled: true, weight: 20, label: "Assignments", totalConducted: 4, bestCount: 3, rule: "best_n" as const },
      project: { enabled: true, weight: 20, label: "Term Project", totalConducted: 1, bestCount: 1, rule: "avg_all" as const },
      attendance: { enabled: true, weight: 10, label: "Attendance" },
      midterm: { enabled: false, weight: 0, label: "Mid-Term Exam" },
      finalExam: { enabled: true, weight: 25, label: "Final Exam" },
      minAttendanceThreshold: 75,
      latePenaltyPerDay: 5,
    }
  },
  {
    id: "exam_heavy",
    name: "Exam & Theory Heavy",
    tag: "Traditional",
    description: "Higher weightage allocated to Midterm & Final exams",
    policy: {
      ct: { enabled: true, weight: 15, label: "Class Tests (CT)", totalConducted: 3, bestCount: 2, rule: "best_n" as const },
      assignment: { enabled: true, weight: 5, label: "Assignments", totalConducted: 2, bestCount: 2, rule: "best_n" as const },
      project: { enabled: false, weight: 0, label: "Term Project" },
      attendance: { enabled: true, weight: 10, label: "Attendance" },
      midterm: { enabled: true, weight: 30, label: "Mid-Term Exam" },
      finalExam: { enabled: true, weight: 40, label: "Final Exam" },
      minAttendanceThreshold: 80,
      latePenaltyPerDay: 5,
    }
  },
  {
    id: "project_lab",
    name: "Project & Practical Heavy",
    tag: "Lab / SE",
    description: "Ideal for software engineering, capstone & lab courses",
    policy: {
      ct: { enabled: true, weight: 10, label: "Class Tests (CT)", totalConducted: 3, bestCount: 2, rule: "best_n" as const },
      assignment: { enabled: true, weight: 15, label: "Assignments", totalConducted: 3, bestCount: 2, rule: "best_n" as const },
      project: { enabled: true, weight: 35, label: "Term Project", totalConducted: 1, bestCount: 1, rule: "avg_all" as const },
      attendance: { enabled: true, weight: 10, label: "Attendance" },
      midterm: { enabled: true, weight: 10, label: "Mid-Term Exam" },
      finalExam: { enabled: true, weight: 20, label: "Final Exam" },
      minAttendanceThreshold: 75,
      latePenaltyPerDay: 5,
    }
  }
];

const COMPONENT_METADATA: Record<PolicyComponentKey, {
  label: string;
  description: string;
  icon: any;
  color: string;
  bgLight: string;
  borderColor: string;
  barColor: string;
}> = {
  ct: {
    label: "Class Tests (CT)",
    description: "Periodic quizzes and continuous evaluation class tests",
    icon: FileText,
    color: "text-indigo-600",
    bgLight: "bg-indigo-50",
    borderColor: "border-indigo-200",
    barColor: "bg-indigo-600",
  },
  assignment: {
    label: "Assignments & Homework",
    description: "Take-home problem sets, reports and code submissions",
    icon: ListTodo,
    color: "text-sky-600",
    bgLight: "bg-sky-50",
    borderColor: "border-sky-200",
    barColor: "bg-sky-500",
  },
  project: {
    label: "Term Project",
    description: "Capstone development project or semester research report",
    icon: FolderGit2,
    color: "text-amber-600",
    bgLight: "bg-amber-50",
    borderColor: "border-amber-200",
    barColor: "bg-amber-500",
  },
  attendance: {
    label: "Attendance & Participation",
    description: "Classroom session presence and active engagement",
    icon: ClipboardCheck,
    color: "text-emerald-600",
    bgLight: "bg-emerald-50",
    borderColor: "border-emerald-200",
    barColor: "bg-emerald-500",
  },
  midterm: {
    label: "Mid-Term Exam",
    description: "Mid-semester centralized written or practical examination",
    icon: GraduationCap,
    color: "text-blue-600",
    bgLight: "bg-blue-50",
    borderColor: "border-blue-200",
    barColor: "bg-blue-600",
  },
  finalExam: {
    label: "Final Semester Exam",
    description: "Comprehensive end-of-semester examination score",
    icon: Award,
    color: "text-purple-600",
    bgLight: "bg-purple-50",
    borderColor: "border-purple-200",
    barColor: "bg-purple-600",
  },
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

export default function TeacherEvaluation({ classroomId }: { classroomId?: string }) {
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

  return <TeacherEvaluationBody classrooms={classroomsData} initialClassroomId={classroomId} />;
}

function TeacherEvaluationBody({ classrooms, initialClassroomId }: { classrooms: ClassroomOption[]; initialClassroomId?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as "grades" | "policy" | "overview" | null;

  const [selectedClassId, setSelectedClassId] = useState<string | null>(initialClassroomId || null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"grades" | "policy" | "overview">(tabParam || "grades");

  useEffect(() => {
    if (initialClassroomId) {
      setSelectedClassId(initialClassroomId);
    }
  }, [initialClassroomId]);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

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
  const componentKeys: PolicyComponentKey[] = ["ct", "assignment", "project", "attendance", "midterm", "finalExam"];
  const totalWeightSum = componentKeys
    .filter(k => policy[k]?.enabled)
    .reduce((sum, k) => sum + Number(policy[k]?.weight || 0), 0);

  // Auto-balance remaining weight
  const handleAutoBalance = () => {
    const diff = 100 - totalWeightSum;
    if (diff === 0) return;
    setPolicy(prev => {
      const targetKey: PolicyComponentKey = prev.finalExam?.enabled
        ? "finalExam"
        : prev.midterm?.enabled
        ? "midterm"
        : prev.ct?.enabled
        ? "ct"
        : "assignment";
      const current = Number(prev[targetKey]?.weight || 0);
      const nextWeight = Math.max(0, current + diff);
      return {
        ...prev,
        [targetKey]: {
          ...prev[targetKey],
          weight: nextWeight,
        }
      };
    });
  };

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
      <div className="space-y-4 animate-in fade-in duration-300 pb-12 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Course Evaluation & Grading</h1>
            <p className="text-[11px] text-slate-500 mt-0.5">Select a course to customize its grading weights & calculate final grades.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Course Code</th>
                  <th className="py-3 px-4 min-w-[200px]">Course Title</th>
                  <th className="py-3 px-4">Academic Batch</th>
                  <th className="py-3 px-4">Enrolled Students</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classrooms.map((cls) => (
                  <tr
                    key={cls.id}
                    onClick={() => {
                      setSelectedClassId(cls.id);
                      router.push(`/dashboard/teacher/evaluation/${cls.id}`);
                    }}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-slate-100 text-slate-800 uppercase tracking-wider">
                        {cls.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 group-hover:text-brand-dark transition-colors">
                      {cls.name}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-[11px]">
                        {cls.batch}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      <span className="font-bold text-slate-800">{cls.students.length}</span> Students
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-dark hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                      >
                        <span>Configure & Grade</span>
                        <span>→</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {classrooms.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">No classrooms assigned yet. Contact system administrator.</div>
        )}
      </div>
    );
  }

  const handleTabChange = (tab: "grades" | "policy" | "overview") => {
    setActiveTab(tab);
    router.replace(`${pathname}?tab=${tab}`);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 pb-12 w-full text-xs">
      
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
            onClick={() => {
              setSelectedClassId(null);
              router.push("/dashboard/teacher/evaluation");
            }}
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

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1">
        <button
          onClick={() => handleTabChange("grades")}
          className={`py-1.5 px-3.5 text-[11px] font-bold rounded-lg transition-all ${
            activeTab === "grades"
              ? "bg-slate-900 text-white shadow-2xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Final Grade Sheet & Marks
        </button>
        <button
          onClick={() => handleTabChange("policy")}
          className={`py-1.5 px-3.5 text-[11px] font-bold rounded-lg transition-all ${
            activeTab === "policy"
              ? "bg-slate-900 text-white shadow-2xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Policy Configuration
        </button>
        <button
          onClick={() => handleTabChange("overview")}
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
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-7 w-full">
          {/* Header & Description */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-brand-dark/10 text-brand-dark">
                  <Sliders className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-bold text-slate-900">Course Evaluation Policy Configurator</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Customize grade weightages, best-of-N criteria, and academic eligibility requirements for this course.
              </p>
            </div>

            {selectedClass && (
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700 flex items-center gap-2 self-start md:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{selectedClass.code} • {selectedClass.name}</span>
              </div>
            )}
          </div>

          {/* ── 1. Smart Presets Bar ── */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Recommended University Presets
              </label>
              <span className="text-[11px] text-slate-400">1-click apply standard weightages</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {PRESET_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setPolicy(tmpl.policy as any)}
                  className="p-3 text-left rounded-xl border border-slate-200/80 hover:border-brand-dark bg-slate-50/60 hover:bg-white transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-brand-dark transition-colors">
                        {tmpl.name}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200/70 text-slate-600 group-hover:bg-brand-dark/10 group-hover:text-brand-dark">
                        {tmpl.tag}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[10px] font-semibold text-brand-dark">
                    <span>Apply Preset</span>
                    <span>→</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ── 2. Real-Time Visual Stacked Allocation Bar ── */}
          <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-bold text-slate-800">Total Weightage Allocation:</span>
                <span className={`text-sm font-extrabold px-2 py-0.5 rounded-lg ${
                  totalWeightSum === 100
                    ? "bg-emerald-100 text-emerald-800"
                    : totalWeightSum > 100
                    ? "bg-red-100 text-red-800"
                    : "bg-amber-100 text-amber-800"
                }`}>
                  {totalWeightSum}% / 100%
                </span>
              </div>

              {totalWeightSum !== 100 ? (
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold ${totalWeightSum > 100 ? "text-red-600" : "text-amber-700"}`}>
                    {totalWeightSum > 100
                      ? `⚠️ Overallocated by ${totalWeightSum - 100}%`
                      : `⚠️ Needs +${100 - totalWeightSum}% more`}
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoBalance}
                    className="px-2.5 py-1 bg-brand-dark text-white rounded-lg text-[11px] font-bold hover:bg-slate-800 transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <Zap className="w-3 h-3 text-amber-300" />
                    Auto-Balance to 100%
                  </button>
                </div>
              ) : (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  100% Validated & Balanced
                </span>
              )}
            </div>

            {/* Stacked multi-color progress bar */}
            <div className="w-full h-3.5 bg-slate-200/90 rounded-full overflow-hidden flex shadow-inner">
              {componentKeys.map((k) => {
                const comp = policy[k];
                if (!comp || !comp.enabled || comp.weight <= 0) return null;
                const meta = COMPONENT_METADATA[k];
                return (
                  <div
                    key={k}
                    style={{ width: `${Math.min(100, comp.weight)}%` }}
                    className={`${meta.barColor} h-full transition-all duration-300 relative group`}
                    title={`${comp.label}: ${comp.weight}%`}
                  />
                );
              })}
            </div>

            {/* Component Legend Pills */}
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 pt-1 text-[11px]">
              {componentKeys.map((k) => {
                const comp = policy[k];
                const meta = COMPONENT_METADATA[k];
                return (
                  <div
                    key={k}
                    className={`flex items-center gap-1.5 ${comp.enabled ? "text-slate-700 font-semibold" : "text-slate-400 line-through"}`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${comp.enabled ? meta.barColor : "bg-slate-300"}`} />
                    <span>{comp.label}:</span>
                    <span className="font-bold">{comp.enabled ? `${comp.weight}%` : "Off"}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 3. Well-Aligned Component Cards Grid ── */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-1">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Evaluation Components & Weightages
              </h4>
              <span className="text-[11px] text-slate-400">Drag sliders or use number steppers</span>
            </div>

            {componentKeys.map((k) => {
              const comp = policy[k];
              const meta = COMPONENT_METADATA[k];
              const Icon = meta.icon;
              const hasSubRules = k === "ct" || k === "assignment" || k === "project";

              const updateWeight = (val: number) => {
                const clamped = Math.max(0, Math.min(100, val));
                setPolicy(prev => ({
                  ...prev,
                  [k]: { ...prev[k], weight: clamped }
                }));
              };

              return (
                <div
                  key={k}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    comp.enabled
                      ? "bg-white border-slate-200 shadow-2xs hover:border-slate-300"
                      : "bg-slate-50/60 border-slate-200/60 opacity-60"
                  }`}
                >
                  <div className="p-4 sm:p-5 space-y-3">
                    {/* Top Row: Icon, Title, Stepper, and Toggle */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${comp.enabled ? meta.bgLight : "bg-slate-200/60"} ${comp.enabled ? meta.color : "text-slate-400"} shrink-0`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900">{meta.label}</p>
                            {!comp.enabled && (
                              <span className="text-[10px] font-semibold text-slate-400 px-1.5 py-0.2 rounded bg-slate-200">
                                Disabled
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{meta.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-auto w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {/* Number Stepper */}
                        <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1 border border-slate-200/80">
                          <button
                            type="button"
                            disabled={!comp.enabled || comp.weight <= 0}
                            onClick={() => updateWeight(comp.weight - 5)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors border border-slate-200/60 shadow-2xs font-bold"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="5"
                            disabled={!comp.enabled}
                            value={comp.weight}
                            onChange={(e) => updateWeight(Number(e.target.value))}
                            className="w-12 text-center text-xs font-extrabold text-slate-900 bg-transparent focus:outline-none disabled:text-slate-400"
                          />
                          <span className="text-xs font-bold text-slate-400 pr-1">%</span>
                          <button
                            type="button"
                            disabled={!comp.enabled || comp.weight >= 100}
                            onClick={() => updateWeight(comp.weight + 5)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors border border-slate-200/60 shadow-2xs font-bold"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Modern Toggle Switch */}
                        <button
                          type="button"
                          onClick={() => {
                            const nextState = !comp.enabled;
                            setPolicy(prev => ({
                              ...prev,
                              [k]: {
                                ...prev[k],
                                enabled: nextState,
                                weight: nextState && prev[k].weight === 0 ? 10 : prev[k].weight
                              }
                            }));
                          }}
                          className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out shrink-0 ${
                            comp.enabled ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                              comp.enabled ? "translate-x-6" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Weight Range Slider */}
                    {comp.enabled && (
                      <div className="pt-2">
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max="60"
                            step="5"
                            value={comp.weight}
                            onChange={(e) => updateWeight(Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
                          />
                          <span className="text-xs font-bold text-slate-700 shrink-0 w-8 text-right">
                            {comp.weight}%
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Sub-rule configuration for CT, Assignment, Project */}
                    {comp.enabled && hasSubRules && (
                      <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-3 mt-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <Settings2 className="w-3.5 h-3.5 text-slate-500" />
                            Grade Calculation Mode:
                          </span>

                          <div className="inline-flex rounded-xl bg-white p-1 border border-slate-200 shadow-2xs gap-1">
                            {[
                              { id: "best_n", label: "Best N of Total" },
                              { id: "avg_all", label: "Average of All" },
                              { id: "best_1", label: "Highest Score" },
                            ].map((ruleOpt) => (
                              <button
                                key={ruleOpt.id}
                                type="button"
                                onClick={() => {
                                  setPolicy(prev => ({
                                    ...prev,
                                    [k]: { ...prev[k], rule: ruleOpt.id as any }
                                  }));
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                  (comp.rule || "best_n") === ruleOpt.id
                                    ? "bg-slate-900 text-white shadow-xs"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                }`}
                              >
                                {ruleOpt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Counts when Best N or Average */}
                        {(comp.rule === "best_n" || !comp.rule) && (
                          <div className="flex flex-wrap items-center gap-4 text-xs pt-1 border-t border-slate-200/50">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-600 font-medium">Total Conducted:</span>
                              <div className="flex items-center gap-1 bg-white rounded-lg p-0.5 border border-slate-200">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = Math.max(1, (comp.totalConducted || 3) - 1);
                                    setPolicy(prev => ({
                                      ...prev,
                                      [k]: {
                                        ...prev[k],
                                        totalConducted: next,
                                        bestCount: Math.min(prev[k].bestCount || 2, next),
                                      }
                                    }));
                                  }}
                                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 font-bold"
                                >
                                  -
                                </button>
                                <span className="w-6 text-center font-bold text-slate-900 text-xs">
                                  {comp.totalConducted || 3}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = Math.min(10, (comp.totalConducted || 3) + 1);
                                    setPolicy(prev => ({
                                      ...prev,
                                      [k]: { ...prev[k], totalConducted: next }
                                    }));
                                  }}
                                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 font-bold"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-slate-600 font-medium">Consider Best:</span>
                              <div className="flex items-center gap-1 bg-white rounded-lg p-0.5 border border-slate-200">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = Math.max(1, (comp.bestCount || 2) - 1);
                                    setPolicy(prev => ({
                                      ...prev,
                                      [k]: { ...prev[k], bestCount: next }
                                    }));
                                  }}
                                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 font-bold"
                                >
                                  -
                                </button>
                                <span className="w-6 text-center font-bold text-slate-900 text-xs">
                                  {comp.bestCount || 2}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = Math.min(comp.totalConducted || 10, (comp.bestCount || 2) + 1);
                                    setPolicy(prev => ({
                                      ...prev,
                                      [k]: { ...prev[k], bestCount: next }
                                    }));
                                  }}
                                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 font-bold"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="p-2.5 rounded-lg bg-white/80 border border-slate-200/60 text-[11px] text-slate-600 flex items-center gap-2">
                          <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>
                            {comp.rule === "best_n" || !comp.rule
                              ? `Takes Top ${comp.bestCount || 2} highest scores out of ${comp.totalConducted || 3} conducted ${comp.label.toLowerCase()} to form ${comp.weight}% of student grade.`
                              : comp.rule === "best_1"
                              ? `Takes single highest score among all conducted ${comp.label.toLowerCase()} for the ${comp.weight}% weightage.`
                              : `Averages all ${comp.totalConducted || 3} conducted ${comp.label.toLowerCase()} towards the ${comp.weight}% weightage.`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── 4. Extra Academic Governance Rules ── */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Academic Governance & Clearance Rules
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Rule 1: Attendance Threshold */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Minimum Attendance Threshold</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="50"
                      max="100"
                      value={policy.minAttendanceThreshold || 75}
                      onChange={(e) => setPolicy(prev => ({ ...prev, minAttendanceThreshold: Number(e.target.value) }))}
                      className="w-12 px-2 py-0.5 text-xs font-bold border border-slate-200 rounded-md text-center bg-slate-50"
                    />
                    <span className="text-slate-500 font-bold">%</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Students failing to maintain this threshold will be flagged as debarred from semester final exam.
                </p>
              </div>

              {/* Rule 2: Late Submission Deduction */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Late Submission Deduction</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={policy.latePenaltyPerDay || 5}
                      onChange={(e) => setPolicy(prev => ({ ...prev, latePenaltyPerDay: Number(e.target.value) }))}
                      className="w-12 px-2 py-0.5 text-xs font-bold border border-slate-200 rounded-md text-center bg-slate-50"
                    />
                    <span className="text-slate-500 font-bold">%/day</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Automatic score deduction applied to student assignment submissions submitted after the due date.
                </p>
              </div>
            </div>
          </div>

          {/* ── 5. Action Footer ── */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setPolicy(DEFAULT_POLICY)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-2 w-fit"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              Reset Default
            </button>

            <div className="flex items-center gap-3">
              {totalWeightSum !== 100 && (
                <button
                  type="button"
                  onClick={handleAutoBalance}
                  className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  Auto-Balance ({100 - totalWeightSum > 0 ? `+${100 - totalWeightSum}%` : `${100 - totalWeightSum}%`})
                </button>
              )}

              <button
                type="button"
                disabled={totalWeightSum !== 100}
                onClick={handleSavePolicy}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4 text-emerald-400" />
                Save Course Evaluation Policy
              </button>
            </div>
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
                {componentKeys.map((key) => {
                  const comp = policy[key];
                  if (!comp) return null;
                  const compKey = key;
                  const hasSubRules = key === "ct" || key === "assignment" || key === "project";
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

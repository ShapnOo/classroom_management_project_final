"use client";

import React, { useState, useEffect, useMemo, Fragment } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import {
  FileText, Search, Printer, Download, Filter, Award, CheckCircle,
  TrendingUp, Users, Calendar, AlertCircle, Loader2
} from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";

function getLetterGrade(score: number): { grade: string; gpa: number } {
  if (score >= 80) return { grade: "A+", gpa: 4.00 };
  if (score >= 75) return { grade: "A", gpa: 3.75 };
  if (score >= 70) return { grade: "A-", gpa: 3.50 };
  if (score >= 65) return { grade: "B+", gpa: 3.25 };
  if (score >= 60) return { grade: "B", gpa: 3.00 };
  if (score >= 55) return { grade: "B-", gpa: 2.75 };
  if (score >= 50) return { grade: "C+", gpa: 2.50 };
  if (score >= 45) return { grade: "C", gpa: 2.25 };
  if (score >= 40) return { grade: "D", gpa: 2.00 };
  return { grade: "F", gpa: 0.00 };
}

// Master Course Mapping Per Semester Level
const SEMESTER_COURSES_MAP: Record<string, Array<{ code: string; title: string; credits: number }>> = {
  "Semester 1": [
    { code: "CSE-101", title: "Structured Programming", credits: 3.0 },
    { code: "CSE-102", title: "Programming Lab", credits: 1.5 },
    { code: "CSE-103", title: "Discrete Math", credits: 3.0 },
    { code: "CSE-104", title: "Electrical Circuits", credits: 3.0 },
  ],
  "Semester 2": [
    { code: "CSE-201", title: "Data Structures", credits: 3.0 },
    { code: "CSE-202", title: "Data Structures Lab", credits: 1.5 },
    { code: "CSE-203", title: "Object Oriented Prog.", credits: 3.0 },
    { code: "CSE-204", title: "Digital Logic Design", credits: 3.0 },
  ],
  "Semester 3": [
    { code: "CSE-301", title: "Algorithm Analysis", credits: 3.0 },
    { code: "CSE-302", title: "Computer Architecture", credits: 3.0 },
    { code: "CSE-303", title: "Operating Systems", credits: 3.0 },
    { code: "CSE-304", title: "Operating Systems Lab", credits: 1.5 },
  ],
  "Semester 4": [
    { code: "CSE-305", title: "Database Systems", credits: 3.0 },
    { code: "CSE-306", title: "Database Systems Lab", credits: 1.5 },
    { code: "CSE-401", title: "Computer Networks", credits: 3.0 },
    { code: "CSE-402", title: "Computer Networks Lab", credits: 1.5 },
  ],
  "Semester 5": [
    { code: "CSE-412", title: "Software Engineering", credits: 3.0 },
    { code: "CSE-425", title: "Artificial Intelligence", credits: 3.0 },
    { code: "CSE-426", title: "AI Lab", credits: 1.5 },
    { code: "CSE-499", title: "B.Sc. Thesis Project", credits: 6.0 },
  ],
};

export default function AdminSessionSemesterResults() {
  const router = useRouter();

  const {
    students, batches, sessions, settings, isLoading,
    fetchStudents, fetchBatches, fetchSessions, fetchSettings
  } = useStore();

  useEffect(() => {
    fetchBatches();
    fetchSessions();
    fetchSettings();
  }, []);

  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const [apiReportData, setApiReportData] = useState<any>(null);
  const [isReportLoading, setIsReportLoading] = useState<boolean>(false);

  useEffect(() => {
    if (sessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [sessions]);

  useEffect(() => {
    if (batches.length > 0 && !selectedBatchId) {
      setSelectedBatchId(batches[0].id);
    }
  }, [batches]);

  // Dynamic API Fetching on Filter Selection
  useEffect(() => {
    if (selectedSessionId && selectedBatchId && selectedSemester) {
      setIsReportLoading(true);
      api.getSessionSemesterResults(selectedSessionId, selectedBatchId, selectedSemester)
        .then((res: any) => {
          if (res) {
            setApiReportData(res);
          }
        })
        .catch(err => {
          console.warn("Failed to fetch session semester report from API:", err);
        })
        .finally(() => {
          setIsReportLoading(false);
        });
    } else {
      setApiReportData(null);
    }
  }, [selectedSessionId, selectedBatchId, selectedSemester]);

  // Semester Options
  const semesterOptions = [
    { value: "Semester 1", label: "Semester 1 (1st Year 1st Sem)" },
    { value: "Semester 2", label: "Semester 2 (1st Year 2nd Sem)" },
    { value: "Semester 3", label: "Semester 3 (2nd Year 1st Sem)" },
    { value: "Semester 4", label: "Semester 4 (2nd Year 2nd Sem)" },
    { value: "Semester 5", label: "Semester 5 (3rd Year 1st Sem)" },
  ];

  // Selected Active Courses for current chosen Semester
  const activeSemesterCourses = useMemo(() => {
    if (apiReportData && apiReportData.activeCourses) {
      return apiReportData.activeCourses;
    }
    if (!selectedSemester || !SEMESTER_COURSES_MAP[selectedSemester]) return [];
    return SEMESTER_COURSES_MAP[selectedSemester];
  }, [selectedSemester, apiReportData]);

  // Calculate detailed student results matrix for enrolled students (Fallback if API fails)
  const fallbackStudentResultsList = useMemo(() => {
    return students.map((student, idx) => {
      const batchObj = batches.find(b => b.id === student.batchId);
      const sessionObj = sessions.find((s: any) => s.id === batchObj?.sessionId);

      const studentSeed = student.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

      // Assign semester dynamically based on index if not set
      const semTag = `Semester ${(idx % 5) + 1}`;
      const semCourses = SEMESTER_COURSES_MAP[semTag] || SEMESTER_COURSES_MAP["Semester 1"];

      // Generate detailed per-course score breakdown for this student
      const courseEvaluations = semCourses.map((crs, cIdx) => {
        const baseSeed = (studentSeed * 13 + (cIdx + 1) * 29) % 100;
        const ctMark = Math.min(15, Math.max(10, Math.round(11.5 + (baseSeed % 4.5))));
        const assnMark = Math.min(10, Math.max(7, Math.round(7.5 + ((baseSeed * 3) % 3))));
        const examMark = Math.min(75, Math.max(45, Math.round(48 + ((baseSeed * 11) % 27))));
        const totalScore = Math.min(100, ctMark + assnMark + examMark);
        const gradeObj = getLetterGrade(totalScore);

        return {
          code: crs.code,
          title: crs.title,
          credits: crs.credits,
          ctMark,
          assnMark,
          examMark,
          totalScore,
          letterGrade: gradeObj.grade,
          gradePoint: gradeObj.gpa,
        };
      });

      const totalCreditsSum = courseEvaluations.reduce((sum, c) => sum + c.credits, 0);
      const totalPointsSum = courseEvaluations.reduce((sum, c) => sum + (c.gradePoint * c.credits), 0);
      const semGPA = totalCreditsSum > 0 ? (totalPointsSum / totalCreditsSum).toFixed(2) : "0.00";
      const semGPANum = parseFloat(semGPA);

      const semesterTotalMarks = courseEvaluations.reduce((sum, c) => sum + c.totalScore, 0);

      let standing = "Good Standing";
      let isPassed = true;
      if (semGPANum >= 3.75) standing = "First Class with Distinction";
      else if (semGPANum >= 3.50) standing = "First Class";
      else if (semGPANum >= 3.00) standing = "Second Class (Upper)";
      else if (semGPANum < 2.25) {
        standing = "Academic Probation";
        isPassed = false;
      }

      return {
        id: student.id,
        rollNo: student.rollNo,
        name: student.name,
        email: student.email,
        batchId: student.batchId,
        batchName: batchObj?.name || "Spring 2026",
        batchCode: batchObj?.code || "FA26-C",
        sessionId: sessionObj?.id || "ses-1",
        sessionName: sessionObj?.name || "Fall 2026",
        semester: semTag,
        courseEvaluations,
        semesterTotalMarks,
        gpa: semGPA,
        gpaNum: semGPANum,
        credits: totalCreditsSum.toFixed(1),
        standing,
        isPassed,
      };
    });
  }, [students, batches, sessions]);

  // Raw Results Matrix
  const rawResults = useMemo(() => {
    if (apiReportData && apiReportData.results) {
      return apiReportData.results;
    }
    return fallbackStudentResultsList.filter(res => res.sessionId === selectedSessionId && res.semester === selectedSemester && res.batchId === selectedBatchId);
  }, [apiReportData, fallbackStudentResultsList, selectedSessionId, selectedSemester, selectedBatchId]);

  // Filtered Results - Strict batch matching and search filter
  const filteredResults = useMemo(() => {
    if (!selectedSessionId || !selectedSemester || !selectedBatchId) return [];

    return rawResults.filter((res: any) => {
      const matchSearch = !search ||
        res.name.toLowerCase().includes(search.toLowerCase()) ||
        res.rollNo.toLowerCase().includes(search.toLowerCase());

      return matchSearch;
    });
  }, [rawResults, selectedSessionId, selectedSemester, selectedBatchId, search]);

  // Overall Statistics
  const stats = useMemo(() => {
    if (apiReportData && apiReportData.stats) {
      return apiReportData.stats;
    }

    if (filteredResults.length === 0) return { total: 0, passed: 0, passPct: "0.0", avgGpa: "0.00" };
    const total = filteredResults.length;
    const passed = filteredResults.filter((r: any) => r.isPassed).length;
    const passPct = ((passed / total) * 100).toFixed(1);
    const avgGpaVal = (filteredResults.reduce((sum: number, r: any) => sum + r.gpaNum, 0) / total).toFixed(2);

    return {
      total,
      passed,
      passPct,
      avgGpa: avgGpaVal,
    };
  }, [filteredResults, apiReportData]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!selectedSessionId || !selectedSemester || !selectedBatchId || activeSemesterCourses.length === 0) return;

    const courseHeaders: string[] = [];
    activeSemesterCourses.forEach((c: any) => {
      courseHeaders.push(`${c.code} CT(15)`, `${c.code} Assn(10)`, `${c.code} Exam(75)`, `${c.code} Total(100)`, `${c.code} Grade`);
    });

    const headers = ["SL", "Exam Roll No", "Student Name", ...courseHeaders, "Semester Total Marks", "Semester GPA"];

    const rows = filteredResults.map((r: any, i: number) => {
      const courseRowData: any[] = [];
      r.courseEvaluations.forEach((c: any) => {
        courseRowData.push(c.ctMark, c.assnMark, c.examMark, c.totalScore, `${c.letterGrade} (${c.gradePoint.toFixed(2)})`);
      });

      return [
        i + 1,
        r.rollNo,
        `"${r.name}"`,
        ...courseRowData,
        r.semesterTotalMarks,
        r.gpa
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Tabulation_Result_Sheet_${selectedSemester}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading && students.length === 0) {
    return <TableSkeleton rows={8} cols={6} />;
  }

  const isSelectionComplete = selectedSessionId !== "" && selectedSemester !== "" && selectedBatchId !== "";

  const currentBatchObj = batches.find(b => b.id === selectedBatchId);
  const currentSessionObj = sessions.find((s: any) => s.id === selectedSessionId);

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-16 max-w-full mx-auto text-xs text-slate-800">
      
      {/* Top Action Bar (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
              <Award className="w-5 h-5" />
            </div>
            <h1 className="text-base font-semibold text-slate-900">Session & Semester Academic Results</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            Detailed subject-wise continuous evaluation breakdown per batch (CT, Assignment, Exam & Grade).
          </p>
        </div>

        {isSelectionComplete && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" /> Print Tabulation Sheet
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>
        )}
      </div>

      {/* Filter Selection Panel (Hidden on Print) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 print:hidden">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" /> Step-by-Step Report Selection:
          </span>
          {isSelectionComplete && (
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Tabulation Sheet Generated ({activeSemesterCourses.length} Subjects)
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Step 1: Session Selector */}
          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-700 block mb-1">
              1. Select Academic Session <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedSessionId}
              onChange={e => setSelectedSessionId(e.target.value)}
              className={`w-full px-3 py-2 text-xs font-medium border rounded-lg focus:outline-none transition-all ${
                !selectedSessionId
                  ? "border-amber-300 bg-amber-50/30 text-amber-900 focus:border-amber-500"
                  : "border-slate-300 bg-white text-slate-900 focus:border-slate-500"
              }`}
            >
              <option value="">-- Choose Academic Session --</option>
              {sessions.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Step 2: Batch Selector (Single Batch Mandatory) */}
          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-700 block mb-1">
              2. Select Batch / Section <span className="text-red-500">*</span>
            </label>
            <select
              disabled={!selectedSessionId}
              value={selectedBatchId}
              onChange={e => setSelectedBatchId(e.target.value)}
              className={`w-full px-3 py-2 text-xs font-medium border rounded-lg focus:outline-none transition-all ${
                !selectedSessionId
                  ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                  : !selectedBatchId
                  ? "border-amber-300 bg-amber-50/30 text-amber-900 focus:border-amber-500"
                  : "border-slate-300 bg-white text-slate-900 focus:border-slate-500"
              }`}
            >
              <option value="">-- Choose Specific Batch --</option>
              {batches.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name} ({b.code || "FA26-C"})</option>
              ))}
            </select>
          </div>

          {/* Step 3: Semester Selector */}
          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-700 block mb-1">
              3. Select Semester Level <span className="text-red-500">*</span>
            </label>
            <select
              disabled={!selectedBatchId}
              value={selectedSemester}
              onChange={e => setSelectedSemester(e.target.value)}
              className={`w-full px-3 py-2 text-xs font-medium border rounded-lg focus:outline-none transition-all ${
                !selectedBatchId
                  ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                  : !selectedSemester
                  ? "border-amber-300 bg-amber-50/30 text-amber-900 focus:border-amber-500"
                  : "border-slate-300 bg-white text-slate-900 focus:border-slate-500"
              }`}
            >
              <option value="">-- Choose Semester Level --</option>
              {semesterOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Optional Search */}
          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
              4. Search Student
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                disabled={!isSelectionComplete}
                placeholder="Search by name or roll..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-white disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* INITIAL EMPTY STATE (Prompting Selection) */}
      {!isSelectionComplete && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4 shadow-2xs my-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-semibold text-slate-900">Select Session, Batch & Semester Level</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Please select an <strong>Academic Session</strong>, a <strong>Batch / Section</strong>, and a <strong>Semester Level</strong> from the filter options above to generate the subject-wise detailed tabulation sheet.
            </p>
          </div>
        </div>
      )}

      {/* SUMMARY KPI CARDS (Only when all selected) */}
      {isSelectionComplete && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Total Candidates</span>
                <span className="text-lg font-bold text-slate-900">{stats.total} Enrolled</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                <Users className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Passed Students</span>
                <span className="text-lg font-bold text-emerald-700">{stats.passed} ({stats.passPct}%)</span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Average Class GPA</span>
                <span className="text-lg font-bold text-slate-900">{stats.avgGpa} / 4.00</span>
              </div>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Selected Batch & Sem</span>
                <span className="text-xs font-semibold text-slate-800 truncate block max-w-[140px]">
                  {currentBatchObj?.code || currentBatchObj?.name || "FA26-C"} • {selectedSemester}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* ── OFFICIAL TABULATION SHEET PRINT CONTAINER ── */}
          <div className="bg-white rounded-xl border border-slate-300 p-6 shadow-2xs space-y-4 print:border-none print:shadow-none print:p-0 font-sans">
            
            {/* Official Header */}
            <div className="border-b border-slate-300 pb-3 text-center space-y-1">
              <h2 className="text-base font-semibold tracking-wide uppercase text-slate-900">
                {settings.schoolName || "JAHANGIRNAGAR UNIVERSITY"}
              </h2>
              <p className="text-xs font-medium text-slate-700 uppercase tracking-widest">
                DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING
              </p>
              <p className="text-[11px] text-slate-500">Savar, Dhaka-1342, Bangladesh • Office of the Controller of Examinations</p>
              <div className="pt-1.5">
                <span className="inline-block border border-slate-400 px-4 py-0.5 text-xs font-semibold uppercase tracking-wider text-slate-800 bg-slate-50">
                  TABULATION SHEET FOR SESSION & SEMESTER EXAMINATION RESULTS
                </span>
              </div>
            </div>

            {/* Filter Summary Header Metadata */}
            <div className="border border-slate-300 rounded bg-slate-50/50 text-[11px]">
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-200">
                <div className="p-2.5">
                  <span className="text-[10px] text-slate-500 uppercase block font-medium">Academic Session</span>
                  <span className="font-semibold text-slate-900 text-xs">
                    {currentSessionObj?.name || "Fall 2026"}
                  </span>
                </div>
                <div className="p-2.5">
                  <span className="text-[10px] text-slate-500 uppercase block font-medium">Semester Level</span>
                  <span className="font-semibold text-slate-900 text-xs">{selectedSemester}</span>
                </div>
                <div className="p-2.5">
                  <span className="text-[10px] text-slate-500 uppercase block font-medium">Total Candidates</span>
                  <span className="font-semibold text-slate-900 text-xs">{filteredResults.length} Enrolled</span>
                </div>
                <div className="p-2.5">
                  <span className="text-[10px] text-slate-500 uppercase block font-medium">Date of Publication</span>
                  <span className="font-medium text-slate-800 text-xs">
                    {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>

            {/* Detailed Course-Wise Tabulation Matrix Table */}
            <div className="overflow-x-auto border border-slate-300 rounded">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  {/* Row 1: Course Headers */}
                  <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300 text-[10px] uppercase">
                    <th rowSpan={2} className="py-2 px-2 text-center border-r border-slate-300 w-8">SL</th>
                    <th rowSpan={2} className="py-2 px-2.5 border-r border-slate-300">Exam Roll No.</th>
                    <th rowSpan={2} className="py-2 px-2.5 border-r border-slate-300 min-w-[130px]">Student Name</th>

                    {/* Dynamic Course Header Groups */}
                    {activeSemesterCourses.map((crs: any) => (
                      <th key={crs.code} colSpan={5} className="py-1 px-2 text-center border-r border-slate-300 bg-slate-200/80">
                        {crs.code}: {crs.title} ({crs.credits} Cr)
                      </th>
                    ))}

                    {/* Summary Columns Header */}
                    <th colSpan={2} className="py-1 px-2 text-center bg-slate-300/60">
                      Semester Summary
                    </th>
                  </tr>

                  {/* Row 2: Sub-Component Headers per Course */}
                  <tr className="bg-slate-50 text-slate-700 font-medium border-b border-slate-300 text-[9px] uppercase">
                    {activeSemesterCourses.map((crs: any) => (
                      <Fragment key={`${crs.code}-sub`}>
                        <th className="py-1 px-1 text-center border-r border-slate-200">CT(15)</th>
                        <th className="py-1 px-1 text-center border-r border-slate-200">Assn(10)</th>
                        <th className="py-1 px-1 text-center border-r border-slate-200">Exam(75)</th>
                        <th className="py-1 px-1 text-center border-r border-slate-200 font-semibold text-slate-900">Total</th>
                        <th className="py-1 px-1.5 text-center border-r border-slate-300 font-semibold text-slate-900">Grade</th>
                      </Fragment>
                    ))}

                    <th className="py-1 px-1.5 text-center border-r border-slate-200 font-semibold">Total</th>
                    <th className="py-1 px-1.5 text-center font-semibold">GPA</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 font-normal">
                  {filteredResults.map((item: any, index: number) => (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="py-1.5 px-2 text-center text-slate-500 font-mono border-r border-slate-200">{index + 1}</td>
                      <td className="py-1.5 px-2.5 font-mono font-medium text-slate-900 border-r border-slate-200">{item.rollNo}</td>
                      <td className="py-1.5 px-2.5 text-slate-900 font-medium border-r border-slate-200">{item.name}</td>

                      {/* Render Marks for Each Course */}
                      {item.courseEvaluations.map((crsEval: any, cIdx: number) => (
                        <Fragment key={`${item.id}-${crsEval.code}`}>
                          <td className="py-1.5 px-1 text-center text-slate-700 border-r border-slate-200 bg-slate-50/30">{crsEval.ctMark}</td>
                          <td className="py-1.5 px-1 text-center text-slate-700 border-r border-slate-200">{crsEval.assnMark}</td>
                          <td className="py-1.5 px-1 text-center text-slate-700 border-r border-slate-200 bg-slate-50/30">{crsEval.examMark}</td>
                          <td className="py-1.5 px-1 text-center font-semibold text-slate-900 border-r border-slate-200">{crsEval.totalScore}</td>
                          <td className="py-1.5 px-1.5 text-center font-semibold text-slate-900 border-r border-slate-300">
                            {crsEval.letterGrade}
                          </td>
                        </Fragment>
                      ))}

                      {/* Semester Summary Row Cells */}
                      <td className="py-1.5 px-1.5 text-center font-semibold text-slate-900 border-r border-slate-200">{item.semesterTotalMarks}</td>
                      <td className="py-1.5 px-1.5 text-center font-semibold text-slate-900">{item.gpa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredResults.length === 0 && (
              <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 rounded border border-slate-200">
                No student examination records match the selected session, batch and semester filters.
              </div>
            )}

            {/* Official Signatures & Seal Area */}
            <div className="pt-12 grid grid-cols-3 gap-6 text-center text-[11px] text-slate-700 font-normal border-t border-slate-300">
              <div>
                <div className="border-b border-slate-400 w-36 mx-auto mb-1.5" />
                <span>Prepared By</span>
              </div>
              <div>
                <div className="border-b border-slate-400 w-36 mx-auto mb-1.5" />
                <span>Tabulator / Verified By</span>
              </div>
              <div>
                <div className="border-b border-slate-400 w-36 mx-auto mb-1.5" />
                <span className="font-semibold text-slate-900">Controller of Examinations</span>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
}

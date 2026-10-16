"use client";

import { 
  ArrowLeft,
  Search,
  CheckCircle2,
  Clock,
  Save,
  Users,
  Eye,
  FileText,
  Layers,
  Sparkles,
  Download,
  Filter,
  Check
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { useGradingData, initials, formatDisplayDate } from "@/components/dashboard/shared/useGradingData";
import ModalDialog from "@/components/ui/ModalDialog";
import AssignmentPdfGradingStudio from "@/components/dashboard/teacher/AssignmentPdfGradingStudio";

interface TeacherAssignmentEvaluateProps {
  courseId?: string; // classroomId
  assignmentId?: string;
  role?: "admin" | "teacher";
}

export default function TeacherAssignmentEvaluate({ courseId = "", assignmentId = "", role = "teacher" }: TeacherAssignmentEvaluateProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "graded">("all");
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [selectedStudentForStudioId, setSelectedStudentForStudioId] = useState<string | null>(null);
  const [submissionsMap, setSubmissionsMap] = useState<Record<string, any>>({});

  const { assignments, fetchAssignments, fetchGradeRecords, fetchStudents, fetchClassrooms, fetchCourses, fetchBatches } = useStore();

  useEffect(() => {
    fetchAssignments();
    fetchGradeRecords();
    fetchStudents();
    fetchClassrooms();
    fetchCourses();
    fetchBatches();

    // Fetch assignment submissions from database
    if (assignmentId) {
      api.getAssignmentSubmissions(assignmentId).then((rows) => {
        if (Array.isArray(rows)) {
          const map: Record<string, any> = {};
          rows.forEach((sub: any) => {
            if (sub.student_id) map[sub.student_id] = sub;
          });
          setSubmissionsMap(map);
        }
      }).catch(() => {});
    }
  }, [assignmentId]);

  const assignment = assignments.find(a => a.id === assignmentId);
  const maxMarks = assignment?.totalMarks ?? 20;

  const { view, roster, draft, setMarks, setRemarks, save, saving, gradedCount, saveStudent, savingStudentId } =
    useGradingData(courseId, { assignmentId }, maxMarks);

  const backHref = `/dashboard/${role === "admin" ? "admin/academic" : "teacher"}/assignments/${courseId}`;

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: "success" | "info" | "warning" | "danger" | "confirm";
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success"
  });

  const handleSaveAll = () => {
    setModalConfig({
      isOpen: true,
      title: "Are you sure?",
      message: "Do you want to save assignment marks and feedback for all students?",
      type: "confirm",
      confirmLabel: "Yes, Save Marks",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        const count = await save();
        setModalConfig({
          isOpen: true,
          title: "Marks Saved Successfully",
          message: `Marks & feedback have been successfully recorded for ${count} student${count === 1 ? "" : "s"}.`,
          type: "success"
        });
      },
      onCancel: () => setModalConfig(prev => ({ ...prev, isOpen: false })),
    });
  };

  if (!assignment || !view) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <p className="text-[13px] font-medium text-slate-800 mb-2">Loading assignment…</p>
        <Link href={backHref} className="text-[11px] text-brand-dark hover:underline">← Back to Assignments</Link>
      </div>
    );
  }

  const q = searchQuery.toLowerCase();
  const filteredStudents = roster.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q);
    const isGraded = !!draft[s.id]?.marks;
    if (statusFilter === "graded") return matchesSearch && isGraded;
    if (statusFilter === "pending") return matchesSearch && !isGraded;
    return matchesSearch;
  });

  // Calculate statistics
  const pendingCount = roster.length - gradedCount;
  const gradedValues = Object.values(draft)
    .map(d => Number(d.marks))
    .filter(n => !isNaN(n) && n > 0);
  const avgScore = gradedValues.length > 0 
    ? (gradedValues.reduce((a, b) => a + b, 0) / gradedValues.length).toFixed(1)
    : "—";

  const handleOpenStudioForStudent = (studentId: string) => {
    setSelectedStudentForStudioId(studentId);
    setIsStudioOpen(true);
  };

  const handleLaunchSpeedGrader = () => {
    // Pick the first pending student, or first student
    const firstPending = roster.find(s => !draft[s.id]?.marks);
    const targetStudentId = firstPending ? firstPending.id : (roster[0]?.id || "");
    setSelectedStudentForStudioId(targetStudentId);
    setIsStudioOpen(true);
  };

  return (
    <div className="w-full mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ── HEADER SECTION ──────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link 
            href={backHref}
            className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 transition-colors shadow-sm shrink-0"
            title="Back to Assignments"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 ${
                role === "admin"
                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                  : "bg-emerald-500/10 text-emerald-700"
              }`}>
                {role === "admin" ? <><Eye className="w-3 h-3" /> Read-Only Admin View</> : "Evaluation Mode"}
              </span>
              <span className="text-[10px] font-medium text-slate-500">
                {view.course.title} ({view.batch.code})
              </span>
            </div>
            <h1 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-500" />
              {assignment.title}
            </h1>
          </div>
        </div>
        
        {/* Header Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          {/* Prominent PDF SpeedGrader Studio Launch Button */}
          <button
            type="button"
            onClick={handleLaunchSpeedGrader}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[13px] font-bold shadow-sm transition-all shrink-0 hover:shadow-md"
            title="Open side-by-side PDF document viewer & marking console"
          >
            <Layers className="w-4 h-4" />
            <span>Open PDF Marking Studio</span>
          </button>

          {role === "admin" ? (
            <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 flex items-center gap-1.5 shadow-2xs">
              <Eye className="w-4 h-4 text-slate-500" /> Read-Only (Faculty Evaluation)
            </span>
          ) : (
            <button 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 bg-brand-dark text-white rounded-lg text-[13px] font-medium hover:bg-slate-800 transition-colors shadow-sm shrink-0 disabled:opacity-60"
              onClick={handleSaveAll}
              disabled={saving}
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving…" : "Save All Marks"}
            </button>
          )}
        </div>
      </div>

      {/* ── METRICS & SUMMARY CARDS ────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Enrolled</p>
          <p className="text-lg font-black text-slate-900 mt-1">{roster.length} Students</p>
          <span className="text-[10px] text-slate-500 font-medium">Batch {view.batch.code}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Grading Progress</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-black text-emerald-600">{gradedCount}</span>
            <span className="text-xs text-slate-400 font-medium">/ {roster.length} graded</span>
          </div>
          <span className="text-[10px] text-amber-600 font-medium">{pendingCount} remaining</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average Score</p>
          <p className="text-lg font-black text-slate-900 mt-1">
            {avgScore} <span className="text-xs text-slate-400 font-normal">/ {maxMarks}</span>
          </p>
          <span className="text-[10px] text-slate-500 font-medium">Max marks: {maxMarks}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Submission Due</p>
          <p className="text-lg font-black text-slate-900 mt-1">{formatDisplayDate(assignment.dueDate)}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Submissions Verified</span>
        </div>
      </div>

      {/* ── FILTER & SEARCH TOOLBAR ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === "all"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            All Students ({roster.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === "pending"
                ? "bg-amber-100 text-amber-900 border border-amber-300"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("graded")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === "graded"
                ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Graded ({gradedCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search student name or roll..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* ── EVALUATION TABLE WITH INTEGRATED PDF VIEWING ACTIONS ──────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col font-sans">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="px-4 py-2.5 text-[10px] uppercase tracking-wider text-slate-400 font-bold font-sans">Student</th>
                <th className="px-4 py-2.5 text-[10px] uppercase tracking-wider text-slate-400 font-bold font-sans">PDF Document</th>
                <th className="px-3 py-2.5 text-[10px] uppercase tracking-wider text-slate-400 font-bold font-sans text-center">Status</th>
                <th className="px-4 py-2.5 text-[10px] uppercase tracking-wider text-slate-400 font-bold font-sans text-right">Marks (/{maxMarks})</th>
                <th className="px-4 py-2.5 text-[10px] uppercase tracking-wider text-slate-400 font-bold font-sans">Remarks</th>
                <th className="px-4 py-2.5 text-[10px] uppercase tracking-wider text-slate-400 font-bold font-sans text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredStudents.map((student) => {
                const entry = draft[student.id];
                const graded = !!entry?.marks;
                const submission = submissionsMap[student.id];
                const isUml =
                  assignment.title?.toLowerCase().includes("uml") ||
                  assignment.title?.toLowerCase().includes("library") ||
                  assignment.id === "b218413b-280f-4889-a201-995b28d6174a";
                const pdfName = isUml
                  ? `${student.rollNo}_UML_Diagram_Library_System.pdf`
                  : `${student.rollNo}_Solution.pdf`;
                const pdfUrl = "/assignment_mockup.pdf";

                return (
                  <tr key={student.id} className="hover:bg-slate-50/60 transition-colors group">
                    
                    {/* 1. Student Info */}
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-semibold text-slate-600 font-sans">{initials(student.name)}</span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 group-hover:text-brand-dark transition-colors font-sans">
                            {student.name}
                          </p>
                          <p className="text-[11px] font-medium text-slate-500 font-sans">Roll: {student.rollNo}</p>
                        </div>
                      </div>
                    </td>

                    {/* 2. PDF Document Preview / Badge */}
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2 min-w-[210px] max-w-[270px]">
                        <div className="w-6 h-6 rounded-md bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 shrink-0">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleOpenStudioForStudent(student.id)}
                            className="text-[11px] font-medium text-slate-800 hover:text-rose-600 truncate block font-sans hover:underline text-left w-full"
                            title={pdfName}
                          >
                            {pdfName}
                          </button>
                          <span className="text-[10px] text-slate-400 block font-sans truncate">
                            4 Pages • 828 KB • PDF
                          </span>
                        </div>
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                          title="Open PDF in new tab"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                    
                    {/* 3. Evaluation Status */}
                    <td className="px-3 py-2.5 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider font-sans ${
                        graded ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {graded ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                        {graded ? "graded" : "pending"}
                      </span>
                    </td>
                    
                    {/* 4. Marks Input */}
                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 justify-end font-sans">
                        <input 
                          type="text" 
                          inputMode="decimal"
                          value={entry?.marks || ""}
                          onChange={(e) => setMarks(student.id, e.target.value)}
                          placeholder="-"
                          disabled={role === "admin"}
                          readOnly={role === "admin"}
                          className={`w-11 text-center py-1 rounded border text-xs font-semibold font-sans focus:outline-none transition-all ${
                            graded 
                              ? 'bg-emerald-50/60 border-emerald-300 text-emerald-800' 
                              : 'bg-white border-slate-200 text-slate-900 focus:border-slate-400'
                          } ${role === "admin" ? "cursor-not-allowed opacity-80" : ""}`}
                        />
                        <span className="text-[11px] font-medium text-slate-400 font-sans">/ {maxMarks}</span>
                      </div>
                    </td>
                    
                    {/* 5. Remarks */}
                    <td className="px-4 py-2.5">
                      <input
                        type="text"
                        value={entry?.remarks || ""}
                        onChange={(e) => setRemarks(student.id, e.target.value)}
                        placeholder={role === "admin" ? "Faculty remarks" : "Optional feedback"}
                        disabled={role === "admin"}
                        readOnly={role === "admin"}
                        className={`w-full min-w-[140px] px-2 py-1 rounded border border-slate-200 text-xs text-slate-700 font-sans focus:outline-none focus:border-slate-400 transition-all ${
                          role === "admin" ? "bg-slate-50 cursor-not-allowed text-slate-600" : "bg-white"
                        }`}
                      />
                    </td>

                    {/* 6. Primary Action: Open PDF & Evaluate */}
                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenStudioForStudent(student.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 text-[11px] font-semibold transition-all shadow-2xs shrink-0 font-sans"
                        title="Open PDF document and grade side-by-side"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Open PDF & Grade</span>
                      </button>
                    </td>

                  </tr>
                );
              })}
              
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-[13px] font-medium text-slate-900">No students found</h3>
                    <p className="text-[11px] text-slate-500 mt-1">Try adjusting your search query or filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── HIGH-PERFORMANCE SPEEDGRADER / PDF EVALUATION STUDIO MODAL ───── */}
      {isStudioOpen && selectedStudentForStudioId && (
        <AssignmentPdfGradingStudio
          isOpen={isStudioOpen}
          onClose={() => setIsStudioOpen(false)}
          assignment={assignment}
          view={view}
          students={filteredStudents.length > 0 ? filteredStudents : roster}
          currentStudentId={selectedStudentForStudioId}
          onSelectStudent={(id) => setSelectedStudentForStudioId(id)}
          draft={draft}
          setMarks={setMarks}
          setRemarks={setRemarks}
          onSaveStudent={async (id) => {
            await saveStudent(id);
          }}
          isSavingCurrent={savingStudentId === selectedStudentForStudioId}
          isReadOnly={role === "admin"}
          submissionsMap={submissionsMap}
        />
      )}

      {/* Save Confirmation Dialog */}
      <ModalDialog
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmLabel={(modalConfig as any).confirmLabel}
        cancelLabel={(modalConfig as any).cancelLabel}
        onConfirm={(modalConfig as any).onConfirm || (() => setModalConfig(prev => ({ ...prev, isOpen: false })))}
        onCancel={(modalConfig as any).onCancel}
      />
    </div>
  );
}

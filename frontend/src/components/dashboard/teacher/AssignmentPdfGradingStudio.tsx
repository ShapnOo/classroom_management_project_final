"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Minimize2,
  Check,
  Save,
  ArrowRight
} from "lucide-react";
import type { Student, Assignment, ClassroomView } from "@/lib/types";

interface AssignmentPdfGradingStudioProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment;
  view: ClassroomView;
  students: Student[];
  currentStudentId: string;
  onSelectStudent: (studentId: string) => void;
  draft: Record<string, { marks: string; remarks: string }>;
  setMarks: (studentId: string, marks: string) => void;
  setRemarks: (studentId: string, remarks: string) => void;
  onSaveStudent: (studentId: string) => Promise<boolean | void>;
  isSavingCurrent?: boolean;
  isReadOnly?: boolean;
  submissionsMap?: Record<string, any>;
}

export default function AssignmentPdfGradingStudio({
  isOpen,
  onClose,
  assignment,
  view,
  students,
  currentStudentId,
  onSelectStudent,
  draft,
  setMarks,
  setRemarks,
  onSaveStudent,
  isSavingCurrent = false,
  isReadOnly = false,
  submissionsMap = {},
}: AssignmentPdfGradingStudioProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const maxMarks = assignment.totalMarks || 20;

  const currentIndex = students.findIndex((s) => s.id === currentStudentId);
  const currentStudent = students[currentIndex] || students[0];

  const currentGrade = draft[currentStudent?.id] || { marks: "", remarks: "" };
  const isGraded = !!currentGrade.marks;

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA");

      // Save & Next: Cmd+Enter or Ctrl+Enter
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleSaveAndNext();
        return;
      }

      if (isInput) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevStudent();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextStudent();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, students, currentGrade]);

  if (!isOpen || !currentStudent) return null;

  const handlePrevStudent = () => {
    if (currentIndex > 0) {
      onSelectStudent(students[currentIndex - 1].id);
    }
  };

  const handleNextStudent = () => {
    if (currentIndex < students.length - 1) {
      onSelectStudent(students[currentIndex + 1].id);
    }
  };

  const handleSaveAndNext = async () => {
    if (isReadOnly) {
      handleNextStudent();
      return;
    }
    await onSaveStudent(currentStudent.id);
    if (currentIndex < students.length - 1) {
      handleNextStudent();
    } else {
      onClose();
    }
  };

  const handleSaveAndClose = async () => {
    if (isReadOnly) {
      onClose();
      return;
    }
    await onSaveStudent(currentStudent.id);
    onClose();
  };

  // Determine PDF URL: use custom attachment if present, otherwise default mockup PDF
  const submissionRecord = submissionsMap[currentStudent.id];
  const customPdfUrl =
    submissionRecord?.attachment_urls?.[0]?.url ||
    submissionRecord?.attachment_urls?.find((a: any) => a.name?.endsWith(".pdf"))?.url;
  const pdfSourceUrl = (customPdfUrl && !customPdfUrl.startsWith("#")) ? customPdfUrl : "/assignment_mockup.pdf";

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden animate-in fade-in duration-150">
      
      {/* ── CLEAN TOP BAR ────────────────────────────────────────── */}
      <div className="h-13 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 text-white">
        
        {/* Left: Course & Assignment Info */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-sans">
                {view.course.code}
              </span>
              <span className="text-xs text-slate-400 truncate hidden sm:inline font-sans">
                {view.course.title}
              </span>
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-white truncate flex items-center gap-1.5 font-sans">
              <FileText className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              {assignment.title}
            </h2>
          </div>
        </div>

        {/* Center: Student Switcher */}
        <div className="flex items-center gap-2 bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-700 font-sans">
          <button
            onClick={handlePrevStudent}
            disabled={currentIndex === 0}
            className="p-1 rounded hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Previous Student (←)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <select
            value={currentStudent.id}
            onChange={(e) => onSelectStudent(e.target.value)}
            className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-3 font-sans"
          >
            {students.map((s, idx) => {
              const sGraded = !!draft[s.id]?.marks;
              return (
                <option key={s.id} value={s.id} className="bg-slate-900 text-white font-sans">
                  {idx + 1}. {s.rollNo} - {s.name} {sGraded ? "✓" : "○"}
                </option>
              );
            })}
          </select>

          <span className="text-[10px] text-slate-400 font-sans">
            ({currentIndex + 1}/{students.length})
          </span>

          <button
            onClick={handleNextStudent}
            disabled={currentIndex === students.length - 1}
            className="p-1 rounded hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Next Student (→)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Fullscreen Toggle */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

      </div>

      {/* ── MAIN WORKSPACE ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden font-sans">
        
        {/* ── LEFT: PURE CLEAN PDF VIEWER (70% width) ────────────── */}
        <div className="flex-1 lg:w-[70%] bg-slate-950 p-2 sm:p-3 overflow-hidden flex flex-col">
          <div className="w-full h-full flex-1 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
            <iframe
              src={`${pdfSourceUrl}#toolbar=1`}
              className="w-full h-full border-0"
              title={`${currentStudent.name} - Submission PDF`}
            />
          </div>
        </div>

        {/* ── RIGHT: MARKING & REMARKS ONLY (30% width) ──────────── */}
        <div className="w-full lg:w-[30%] bg-slate-900 border-l border-slate-800 flex flex-col justify-between shrink-0 font-sans">
          
          <div className="p-5 space-y-6 overflow-y-auto">
            
            {/* Student Info */}
            <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-sans">
                  {currentStudent.name}
                </h3>
                <p className="text-xs text-slate-400 font-sans">Roll: {currentStudent.rollNo}</p>
              </div>

              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-sans ${
                isGraded ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}>
                {isGraded ? "Graded" : "Pending"}
              </span>
            </div>

            {/* Marking Option */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                Marks
              </label>

              <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700 p-3 rounded-xl">
                <input
                  type="text"
                  inputMode="decimal"
                  value={currentGrade.marks}
                  onChange={(e) => setMarks(currentStudent.id, e.target.value)}
                  placeholder="0"
                  disabled={isReadOnly}
                  autoFocus
                  className="w-20 py-1.5 px-2 bg-slate-900 border border-slate-600 rounded-lg text-lg font-bold text-white text-center focus:outline-none focus:border-brand-light"
                />
                <span className="text-sm font-semibold text-slate-400">
                  / <strong className="text-white">{maxMarks}</strong>
                </span>
              </div>
            </div>

            {/* Remarks Option */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                Remarks
              </label>

              <textarea
                value={currentGrade.remarks || ""}
                onChange={(e) => setRemarks(currentStudent.id, e.target.value)}
                placeholder="Optional feedback for student..."
                disabled={isReadOnly}
                rows={6}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-light resize-none leading-relaxed"
              />
            </div>

          </div>

          {/* ── BOTTOM ACTIONS ───────────────────────────────────── */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveAndNext}
              disabled={isSavingCurrent}
              className="flex-1 py-2.5 px-3 bg-brand-dark hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {isSavingCurrent ? (
                <span>Saving…</span>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Save & Next</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5 text-slate-300" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSaveAndClose}
              disabled={isSavingCurrent || isReadOnly}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs border border-slate-700 transition-colors disabled:opacity-40 flex items-center gap-1.5"
              title="Save marks and close"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Save</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

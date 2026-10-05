"use client";

import { 
  ArrowLeft,
  FileText,
  Users,
  CheckCircle2,
  Save,
  Clock,
  Download,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { useGradingData, initials, formatDisplayDate } from "@/components/dashboard/shared/useGradingData";

import ModalDialog from "@/components/ui/ModalDialog";

import { useState, useEffect } from "react";

interface TeacherTestEvaluateProps {
  courseId?: string; // classroomId
  testId?: string;
  role?: "admin" | "teacher";
}

export default function TeacherTestEvaluate({ courseId = "", testId = "", role = "teacher" }: TeacherTestEvaluateProps) {
  const { tests, fetchTests, fetchGradeRecords, fetchStudents, fetchClassrooms, fetchCourses, fetchBatches } = useStore();

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

  useEffect(() => {
    fetchTests();
    fetchGradeRecords();
    fetchStudents();
    fetchClassrooms();
    fetchCourses();
    fetchBatches();
  }, []);

  const test = tests.find(t => t.id === testId);
  const maxMarks = test?.totalMarks ?? 0;

  const { view, roster, draft, setMarks, save, saving, gradedCount } =
    useGradingData(courseId, { testId }, maxMarks);

  const handleSave = () => {
    setModalConfig({
      isOpen: true,
      title: "Are you sure?",
      message: "Do you want to save class test marks for all students?",
      type: "confirm",
      confirmLabel: "Yes, Save Marks",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        const count = await save();
        setModalConfig({
          isOpen: true,
          title: "Class Test Marks Saved",
          message: `Test marks have been successfully recorded into the database for ${count} student${count === 1 ? "" : "s"}.`,
          type: "success"
        });
      },
      onCancel: () => setModalConfig(prev => ({ ...prev, isOpen: false })),
    });
  };

  const handleExport = () => {
    const rows = [["Roll No", "Name", "Marks", "Total"]];
    roster.forEach(s => rows.push([s.rollNo, s.name, draft[s.id]?.marks ?? "", String(maxMarks)]));
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${test?.title || "test"}-marks.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!test || !view) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <p className="text-[13px] font-medium text-slate-800 mb-2">Loading test…</p>
        <Link href={`/dashboard/${role === "admin" ? "admin/academic" : "teacher"}/tests/${courseId}`} className="text-[11px] text-brand-dark hover:underline">
          ← Back to Class Tests
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link 
            href={`/dashboard/${role === "admin" ? "admin/academic" : "teacher"}/tests/${courseId}`}
            className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 transition-colors shadow-sm shrink-0"
            title="Back to Class Tests"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded uppercase bg-brand-light/30 text-brand-dark flex items-center gap-1">
                <FileText className="w-3 h-3" /> Evaluating
              </span>
              <span className="text-[10px] font-medium text-slate-500">{formatDisplayDate(test.testDate)}</span>
            </div>
            <h1 className="text-sm font-semibold text-slate-900">{test.title} <span className="text-slate-500 font-normal">({view.course.title} • {view.batch.code})</span></h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors shadow-sm shrink-0">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-dark text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm shrink-0 disabled:opacity-60">
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : "Save Marks"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Main Marking Interface */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
              <h2 className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" /> Student List
              </h2>
              <span className="text-[11px] font-medium text-slate-500">Max Marks: <span className="text-brand-dark">{maxMarks}</span></span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                    <th className="px-5 py-3">Student Details</th>
                    <th className="px-5 py-3 w-48 text-right">Marks Obtained</th>
                    <th className="px-5 py-3 w-16 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-[11px]">
                  {roster.length === 0 && (
                    <tr><td colSpan={3} className="px-5 py-10 text-center text-slate-400">No students enrolled in this batch.</td></tr>
                  )}
                  {roster.map((student) => {
                    const studentMark = draft[student.id]?.marks || "";
                    const isGraded = studentMark !== "";
                    
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] font-semibold text-slate-600 shrink-0">
                              {initials(student.name)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 text-xs mb-0.5">{student.name}</p>
                              <p className="text-[10px] text-slate-500">{student.rollNo}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <input 
                              type="number" 
                              min="0" 
                              max={maxMarks}
                              value={studentMark}
                              onChange={(e) => setMarks(student.id, e.target.value)}
                              placeholder="--"
                              className="w-16 px-2 py-1.5 text-center border border-slate-200 rounded-md text-xs font-semibold focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark outline-none bg-slate-50 focus:bg-white transition-all text-slate-900"
                            />
                            <span className="text-slate-400 font-medium text-[10px]">/ {maxMarks}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-center">
                          {isGraded ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-slate-200 mx-auto"></div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Stats & Info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sticky top-6">
            <h3 className="text-xs font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" /> Evaluation Progress
            </h3>
            
            <div className="flex items-center justify-center mb-6 relative">
              <div className="w-32 h-32 rounded-full border-8 border-slate-100 flex items-center justify-center relative">
                <div className="text-center">
                  <span className="block text-2xl font-bold text-brand-dark leading-none mb-1">{gradedCount}</span>
                  <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-medium">Graded</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-medium text-slate-600">Total Students</span>
                <span className="text-xs font-semibold text-slate-900">{roster.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-medium text-slate-600">Remaining</span>
                <span className="text-xs font-semibold text-amber-600">{roster.length - gradedCount}</span>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-brand-light/30 border border-brand-light flex gap-3">
              <AlertCircle className="w-5 h-5 text-brand-dark shrink-0" />
              <div>
                <p className="text-[11px] font-medium text-brand-dark mb-1">Saved to Database</p>
                <p className="text-[10px] text-brand-dark/70">Previously saved marks are loaded automatically. Re-saving updates existing grades.</p>
              </div>
            </div>
            
            <button onClick={handleSave} disabled={saving} className="w-full mt-4 flex justify-center items-center gap-2 py-2.5 bg-brand-dark text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-60">
              <CheckCircle2 className="w-4 h-4" /> Finalize Marks
            </button>
          </div>
        </div>

      </div>

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

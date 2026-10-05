"use client";

import { 
  ArrowLeft,
  Search,
  CheckCircle2,
  Clock,
  Save,
  Users
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { useGradingData, initials, formatDisplayDate } from "@/components/dashboard/shared/useGradingData";

interface TeacherAssignmentEvaluateProps {
  courseId?: string; // classroomId
  assignmentId?: string;
  role?: "admin" | "teacher";
}

export default function TeacherAssignmentEvaluate({ courseId = "", assignmentId = "", role = "teacher" }: TeacherAssignmentEvaluateProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { assignments, fetchAssignments, fetchGradeRecords, fetchStudents, fetchClassrooms, fetchCourses, fetchBatches } = useStore();

  useEffect(() => {
    fetchAssignments();
    fetchGradeRecords();
    fetchStudents();
    fetchClassrooms();
    fetchCourses();
    fetchBatches();
  }, []);

  const assignment = assignments.find(a => a.id === assignmentId);
  const maxMarks = assignment?.totalMarks ?? 0;

  const { view, roster, draft, setMarks, setRemarks, save, saving, gradedCount } =
    useGradingData(courseId, { assignmentId }, maxMarks);

  const backHref = `/dashboard/${role === "admin" ? "admin/academic" : "teacher"}/assignments/${courseId}`;

  const handleSave = async () => {
    const count = await save();
    alert(`Marks saved for ${count} student${count === 1 ? "" : "s"}.`);
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
  const filteredStudents = roster.filter(s => s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q));

  return (
    <div className="w-full mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
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
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded uppercase bg-emerald-500/10 text-emerald-700">
                Evaluation Mode
              </span>
              <span className="text-[10px] font-medium text-slate-500">
                {view.course.title} ({view.batch.code})
              </span>
            </div>
            <h1 className="text-sm font-semibold text-slate-900">{assignment.title}</h1>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-dark text-white rounded-lg text-[13px] font-medium hover:bg-slate-800 transition-colors shadow-sm shrink-0 disabled:opacity-60"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : "Save Marks"}
          </button>
        </div>
      </div>

      {/* Summary and Filters */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        
        <div className="flex items-center gap-6">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">Due Date</p>
            <p className="text-[13px] font-medium text-slate-900">{formatDisplayDate(assignment.dueDate)}</p>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">Max Marks</p>
            <p className="text-[13px] font-medium text-slate-900">{maxMarks}</p>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">Progress</p>
            <p className="text-[13px] font-medium text-slate-900">
              <span className="text-emerald-600">{gradedCount}</span> Graded / {roster.length} Students
            </p>
          </div>
        </div>

        <div className="relative w-full xl:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search student..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400"
          />
        </div>
        
      </div>

      {/* Evaluation Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-400 font-medium">Student</th>
                <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-400 font-medium">Status</th>
                <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-400 font-medium text-right">Marks (/{maxMarks})</th>
                <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-400 font-medium">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => {
                const entry = draft[student.id];
                const graded = !!entry?.marks;
                return (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                    
                    {/* Student Info */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-medium text-slate-500">{initials(student.name)}</span>
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-slate-900 group-hover:text-brand-dark transition-colors">
                            {student.name}
                          </p>
                          <p className="text-[11px] font-medium text-slate-500">Roll: {student.rollNo}</p>
                        </div>
                      </div>
                    </td>
                    
                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium uppercase tracking-wider ${
                        graded ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {graded ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {graded ? "graded" : "pending"}
                      </div>
                    </td>
                    
                    {/* Marks Input */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1 justify-end">
                        <input 
                          type="text" 
                          inputMode="decimal"
                          value={entry?.marks || ""}
                          onChange={(e) => setMarks(student.id, e.target.value)}
                          placeholder="-"
                          className={`w-12 text-center py-1.5 rounded-md text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-brand-dark/20 transition-all ${
                            graded 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 border focus:border-emerald-500' 
                              : 'bg-white border-slate-200 text-slate-900 border focus:border-brand-dark'
                          }`}
                        />
                        <span className="text-[13px] font-medium text-slate-400">/ {maxMarks}</span>
                      </div>
                    </td>
                    
                    {/* Remarks */}
                    <td className="px-5 py-3.5">
                      <input
                        type="text"
                        value={entry?.remarks || ""}
                        onChange={(e) => setRemarks(student.id, e.target.value)}
                        placeholder="Optional feedback"
                        className="w-full min-w-[160px] px-2.5 py-1.5 rounded-md border border-slate-200 text-[12px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400"
                      />
                    </td>

                  </tr>
                );
              })}
              
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-[13px] font-medium text-slate-900">No students found</h3>
                    <p className="text-[11px] text-slate-500 mt-1">Try adjusting your search query.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

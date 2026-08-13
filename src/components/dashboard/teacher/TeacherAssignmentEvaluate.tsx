"use client";

import { 
  ArrowLeft,
  Search,
  CheckCircle2,
  Clock,
  Save,
  FileText,
  MessageSquare,
  Users
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface TeacherAssignmentEvaluateProps {
  courseId: string;
  assignmentId: string;
}

// Mock Data
const mockSubmissions = [
  { id: "24201", name: "Mainul Hasan", status: "submitted", file: "ER_Diagram_Mainul.pdf", submittedAt: "14 Aug 2026, 10:30 AM", marks: "8" },
  { id: "24202", name: "Waliullah", status: "submitted", file: "Waliullah_Assignment1.zip", submittedAt: "14 Aug 2026, 11:45 AM", marks: "9" },
  { id: "24203", name: "Fariha Rahman", status: "submitted", file: "Fariha_DB_Design.pdf", submittedAt: "15 Aug 2026, 09:15 AM", marks: "" },
  { id: "24204", name: "Ahmed Kabir", status: "pending", file: null, submittedAt: null, marks: "" },
  { id: "24205", name: "Sarah Islam", status: "submitted", file: "Sarah_ERD.docx", submittedAt: "15 Aug 2026, 01:20 PM", marks: "" },
  { id: "24206", name: "Tanvir Ahmed", status: "pending", file: null, submittedAt: null, marks: "" },
];

export default function TeacherAssignmentEvaluate({ courseId, assignmentId }: TeacherAssignmentEvaluateProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Local state for marks
  const [marksState, setMarksState] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    mockSubmissions.forEach(sub => {
      if (sub.marks) initial[sub.id] = sub.marks;
    });
    return initial;
  });

  // Mock course & assignment details
  const courseName = courseId === "cls-2" ? "Software Engineering" : "Database Management Systems";
  const batch = "Spring 2026";
  const assignmentTitle = assignmentId === "asn-2" ? "SQL Queries Practice" : "ER Diagram Assignment";
  const maxMarks = assignmentId === "asn-2" ? "20" : "10";
  const dueDate = "15 Aug 2026";

  const filteredSubmissions = mockSubmissions.filter(sub => 
    sub.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    sub.id.includes(searchQuery)
  );

  const handleMarkChange = (studentId: string, value: string) => {
    // Basic validation to only allow numbers up to maxMarks
    const numValue = parseInt(value);
    if (value === "" || (!isNaN(numValue) && numValue >= 0 && numValue <= parseInt(maxMarks))) {
      setMarksState(prev => ({
        ...prev,
        [studentId]: value
      }));
    }
  };

  const submittedCount = mockSubmissions.filter(s => s.status === 'submitted').length;
  const gradedCount = Object.keys(marksState).filter(k => marksState[k] !== "").length;

  return (
    <div className="w-full mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link 
            href={`/dashboard/teacher/assignments/${courseId}`}
            className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 transition-colors shadow-sm shrink-0"
            title="Back to Assignments"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-sm shrink-0">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded uppercase bg-emerald-500/10 text-emerald-700">
                Evaluation Mode
              </span>
              <span className="text-[10px] font-medium text-slate-500">
                {courseName} ({batch})
              </span>
            </div>
            <h1 className="text-base font-medium text-slate-900 tracking-tight">{assignmentTitle}</h1>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-dark text-white rounded-lg text-[13px] font-medium hover:bg-slate-800 transition-colors shadow-sm shrink-0"
            onClick={() => alert("Marks saved successfully!")}
          >
            <Save className="w-4 h-4" />
            Save Marks
          </button>
        </div>
      </div>

      {/* Summary and Filters */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Due Date</p>
            <p className="text-[13px] font-medium text-slate-900">{dueDate}</p>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Max Marks</p>
            <p className="text-[13px] font-medium text-slate-900">{maxMarks}</p>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Progress</p>
            <p className="text-[13px] font-medium text-slate-900">
              <span className="text-emerald-600">{gradedCount}</span> Graded / {submittedCount} Submitted
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
                <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-400 font-medium">Submission</th>
                <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-400 font-medium text-right">Marks (/{maxMarks})</th>
                <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-400 font-medium text-right">Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubmissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors group">
                  
                  {/* Student Info */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-medium text-slate-500">
                          {sub.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-slate-900 group-hover:text-brand-dark transition-colors">
                          {sub.name}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500">ID: {sub.id}</p>
                      </div>
                    </div>
                  </td>
                  
                  {/* Status */}
                  <td className="px-5 py-3.5">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium uppercase tracking-wider ${
                      sub.status === 'submitted' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {sub.status === 'submitted' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {sub.status}
                    </div>
                  </td>

                  {/* Submission File */}
                  <td className="px-5 py-3.5">
                    {sub.status === 'submitted' ? (
                      <div>
                        <button className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-dark hover:text-brand-dark/80 transition-colors">
                          <FileText className="w-4 h-4" /> 📄 View
                        </button>
                        <p className="text-[10px] text-slate-500 mt-0.5">{sub.submittedAt}</p>
                      </div>
                    ) : (
                      <span className="text-[13px] font-medium text-slate-400">—</span>
                    )}
                  </td>
                  
                  {/* Marks Input */}
                  <td className="px-5 py-3.5 text-right">
                    {sub.status === 'submitted' ? (
                      <div className="inline-flex items-center gap-1 justify-end">
                        <input 
                          type="text" 
                          value={marksState[sub.id] || ""}
                          onChange={(e) => handleMarkChange(sub.id, e.target.value)}
                          placeholder="-"
                          className={`w-12 text-center py-1.5 rounded-md text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-brand-dark/20 transition-all ${
                            marksState[sub.id] 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 border focus:border-emerald-500' 
                              : 'bg-white border-slate-200 text-slate-900 border focus:border-brand-dark'
                          }`}
                        />
                        <span className="text-[13px] font-medium text-slate-400">/ {maxMarks}</span>
                      </div>
                    ) : (
                      <span className="text-[13px] font-medium text-slate-400">—</span>
                    )}
                  </td>
                  
                  {/* Feedback Action */}
                  <td className="px-5 py-3.5 text-right">
                    <button 
                      className="w-8 h-8 rounded-full inline-flex items-center justify-center text-slate-400 hover:bg-white hover:text-brand-dark border border-transparent hover:border-slate-200 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={sub.status !== 'submitted'}
                      title="Add Feedback"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </td>

                </tr>
              ))}
              
              {filteredSubmissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-[13px] font-medium text-slate-900">No students found</h3>
                    <p className="text-xs text-slate-500 mt-1">Try adjusting your search query.</p>
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

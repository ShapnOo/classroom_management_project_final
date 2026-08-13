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
import { useState } from "react";

interface TeacherTestEvaluateProps {
  testId?: string;
}

// Mock Data
const mockTest = {
  id: "test-1",
  title: "Midterm Examination",
  class: "Database Management Systems",
  date: "15 Aug 2026",
  maxMarks: 50,
  totalStudents: 45,
};

const mockStudents = [
  { id: "STD-001", name: "Mainul Hasan", profile: "MH" },
  { id: "STD-002", name: "Waliullah Ovi", profile: "WO" },
  { id: "STD-003", name: "Rahim Uddin", profile: "RU" },
  { id: "STD-004", name: "Karim Ahmed", profile: "KA" },
  { id: "STD-005", name: "Sarah Khan", profile: "SK" },
];

export default function TeacherTestEvaluate({ testId }: TeacherTestEvaluateProps) {
  const [marks, setMarks] = useState<Record<string, string>>({});

  const handleSave = () => {
    alert(`Marks saved successfully for ${Object.keys(marks).length} students!`);
  };

  const gradedCount = Object.keys(marks).filter(k => marks[k] !== "").length;

  return (
    <div className="w-full mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/teacher/tests"
            className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 transition-colors shadow-sm shrink-0"
            title="Back to Tests"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded uppercase bg-brand-light/30 text-brand-dark flex items-center gap-1">
                <FileText className="w-3 h-3" /> Evaluating
              </span>
              <span className="text-[10px] font-medium text-slate-500">{mockTest.date}</span>
            </div>
            <h1 className="text-sm font-semibold text-slate-900">{mockTest.title} <span className="text-slate-500 font-normal">({mockTest.class})</span></h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors shadow-sm shrink-0">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button onClick={handleSave} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-dark text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm shrink-0">
            <Save className="w-4 h-4" />
            Save Marks
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
              <span className="text-[11px] font-medium text-slate-500">Max Marks: <span className="text-brand-dark">{mockTest.maxMarks}</span></span>
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
                  {mockStudents.map((student) => {
                    const studentMark = marks[student.id] || "";
                    const isGraded = studentMark !== "";
                    
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] font-semibold text-slate-600 shrink-0">
                              {student.profile}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 text-xs mb-0.5">{student.name}</p>
                              <p className="text-[10px] text-slate-500">{student.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <input 
                              type="number" 
                              min="0" 
                              max={mockTest.maxMarks}
                              value={studentMark}
                              onChange={(e) => setMarks({...marks, [student.id]: e.target.value})}
                              placeholder="--"
                              className="w-16 px-2 py-1.5 text-center border border-slate-200 rounded-md text-xs font-semibold focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark outline-none bg-slate-50 focus:bg-white transition-all text-slate-900"
                            />
                            <span className="text-slate-400 font-medium text-[10px]">/ {mockTest.maxMarks}</span>
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
              {/* Circular Progress Placeholder */}
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
                <span className="text-xs font-semibold text-slate-900">{mockStudents.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-medium text-slate-600">Remaining</span>
                <span className="text-xs font-semibold text-amber-600">{mockStudents.length - gradedCount}</span>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-brand-light/30 border border-brand-light flex gap-3">
              <AlertCircle className="w-5 h-5 text-brand-dark shrink-0" />
              <div>
                <p className="text-[11px] font-medium text-brand-dark mb-1">Auto-Save Enabled</p>
                <p className="text-[10px] text-brand-dark/70">Marks are automatically saved locally as you type. Don't forget to push changes when finished.</p>
              </div>
            </div>
            
            <button onClick={handleSave} className="w-full mt-4 flex justify-center items-center gap-2 py-2.5 bg-brand-dark text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm">
              <CheckCircle2 className="w-4 h-4" /> Finalize Marks
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

"use client";

import { 
  Award, 
  Settings2,
  CheckCircle2,
  Save,
  Calculator,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

// Mock Data
const mockClassrooms = [
  { id: "cls-1", name: "Database Management Systems", code: "CSE-305", batch: "Spring 2026 - A" },
  { id: "cls-2", name: "Software Engineering", code: "CSE-412", batch: "Spring 2026 - B" },
];

export default function TeacherEvaluation() {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  
  // Grading Policy State
  const [ctPolicy, setCtPolicy] = useState("best-of");
  const [ctBestOf, setCtBestOf] = useState("3");
  
  const [assignmentPolicy, setAssignmentPolicy] = useState("average");
  const [assignmentBestOf, setAssignmentBestOf] = useState("2");
  
  // Mark Distribution State
  const [distribution, setDistribution] = useState({
    ct: 20,
    assignment: 10,
    attendance: 10,
    midterm: 20,
    final: 40
  });

  const totalMarks = Object.values(distribution).reduce((a, b) => Number(a) + Number(b), 0);

  const selectedClass = mockClassrooms.find(c => c.id === selectedClassId);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalMarks !== 100) {
      alert("Total distribution must be exactly 100.");
      return;
    }
    alert(`Grading Policy Saved!\n\nGenerating final result sheet preview...`);
  };

  if (!selectedClassId) {
    return (
      <div className="w-full mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-dark flex items-center justify-center shadow-sm shrink-0">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-900">Final Evaluation</h1>
              <p className="text-[11px] text-slate-500 mt-0.5">Select a classroom to configure grading policies and generate final results.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockClassrooms.map(cls => (
            <div 
              key={cls.id}
              onClick={() => setSelectedClassId(cls.id)}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-brand-dark/30 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-brand-dark/10 transition-colors">
                <Calculator className="w-5 h-5 text-slate-500 group-hover:text-brand-dark transition-colors" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">{cls.name}</h3>
              <p className="text-[11px] text-slate-500">{cls.code} • {cls.batch}</p>
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">Pending Evaluation</span>
                <span className="text-[11px] font-medium text-brand-dark group-hover:underline">Configure &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-right-4 duration-300">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSelectedClassId(null)}
            className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 transition-colors shadow-sm"
          >
            &larr;
          </button>
          <div>
            <h1 className="text-sm font-semibold text-slate-900">Grading Policy Setup</h1>
            <p className="text-[11px] text-slate-500 mt-0.5">{selectedClass?.name} ({selectedClass?.code})</p>
          </div>
        </div>
        
        <button 
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-dark text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm"
        >
          <CheckCircle2 className="w-4 h-4" /> Generate Final Result Sheet
        </button>
      </div>

      <div className="space-y-6">
        
        {/* Top Section: Mark Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-[13px] font-medium text-slate-900 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-slate-500" />
                Mark Distribution Breakdown
              </h2>
              <p className="text-[10px] text-slate-500 mt-1">Set the final weightage (%) for each category. All raw marks will be scaled to these percentages.</p>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${totalMarks === 100 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
              <span className="text-[11px] font-semibold">Total: {totalMarks}%</span>
              {totalMarks === 100 ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            </div>
          </div>
          
          <div className="p-6">
            {/* Visual Distribution Bar */}
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex mb-8 border border-slate-200/50 shadow-inner">
              {distribution.attendance > 0 && <div style={{width: `${distribution.attendance}%`}} className="bg-emerald-400 h-full transition-all duration-300" title={`Attendance: ${distribution.attendance}%`}></div>}
              {distribution.ct > 0 && <div style={{width: `${distribution.ct}%`}} className="bg-blue-400 h-full transition-all duration-300" title={`Class Tests: ${distribution.ct}%`}></div>}
              {distribution.assignment > 0 && <div style={{width: `${distribution.assignment}%`}} className="bg-purple-400 h-full transition-all duration-300" title={`Assignments: ${distribution.assignment}%`}></div>}
              {distribution.midterm > 0 && <div style={{width: `${distribution.midterm}%`}} className="bg-amber-400 h-full transition-all duration-300" title={`Midterm: ${distribution.midterm}%`}></div>}
              {distribution.final > 0 && <div style={{width: `${distribution.final}%`}} className="bg-rose-400 h-full transition-all duration-300" title={`Final: ${distribution.final}%`}></div>}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { id: 'attendance', label: 'Attendance', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                { id: 'ct', label: 'Class Tests', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                { id: 'assignment', label: 'Assignments', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
                { id: 'midterm', label: 'Midterm Exam', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                { id: 'final', label: 'Final Exam', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' }
              ].map((item) => (
                <div key={item.id} className={`p-3 rounded-xl border ${item.border} ${item.bg} flex flex-col items-center justify-center text-center transition-all hover:shadow-sm`}>
                  <label className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${item.color}`}>{item.label}</label>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      min="0"
                      max="100"
                      value={distribution[item.id as keyof typeof distribution]}
                      onChange={(e) => setDistribution({...distribution, [item.id]: e.target.value})}
                      className="w-14 px-2 py-1 text-center bg-white border border-slate-200 rounded-md text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark outline-none transition-all"
                    />
                    <span className="text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>
              ))}
            </div>

            {totalMarks !== 100 && (
              <div className="mt-5 p-3 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-[11px] font-medium text-red-700">Total distribution is currently {totalMarks}%. Please adjust the values so they equal exactly 100%.</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Evaluation Rules */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-100 px-5 py-4">
            <h2 className="text-[13px] font-medium text-slate-900 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-slate-500" />
              Evaluation Rules
            </h2>
            <p className="text-[10px] text-slate-500 mt-1">Configure how multiple items in a category are combined before scaling.</p>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Class Tests Rule */}
            <div className={`space-y-3 p-4 border rounded-xl transition-all ${Number(distribution.ct) > 0 ? 'bg-white border-blue-100' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">Class Tests Policy</label>
                {Number(distribution.ct) === 0 && <span className="text-[9px] text-slate-400">Disabled (0%)</span>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select 
                  disabled={Number(distribution.ct) === 0}
                  value={ctPolicy}
                  onChange={(e) => setCtPolicy(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[11px] outline-none focus:border-brand-dark bg-slate-50 focus:bg-white disabled:bg-slate-100"
                >
                  <option value="average">Average of all</option>
                  <option value="sum">Sum of all</option>
                  <option value="best-of">Best of N tests</option>
                </select>
                
                {ctPolicy === 'best-of' && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">Best</span>
                    <input 
                      type="number" 
                      min="1"
                      disabled={Number(distribution.ct) === 0}
                      value={ctBestOf}
                      onChange={(e) => setCtBestOf(e.target.value)}
                      className="w-full px-2 py-2 text-center border border-slate-200 rounded-lg text-[11px] outline-none focus:border-brand-dark bg-slate-50 focus:bg-white disabled:bg-slate-100"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Assignments Rule */}
            <div className={`space-y-3 p-4 border rounded-xl transition-all ${Number(distribution.assignment) > 0 ? 'bg-white border-purple-100' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">Assignments Policy</label>
                {Number(distribution.assignment) === 0 && <span className="text-[9px] text-slate-400">Disabled (0%)</span>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select 
                  disabled={Number(distribution.assignment) === 0}
                  value={assignmentPolicy}
                  onChange={(e) => setAssignmentPolicy(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[11px] outline-none focus:border-brand-dark bg-slate-50 focus:bg-white disabled:bg-slate-100"
                >
                  <option value="average">Average of all</option>
                  <option value="sum">Sum of all</option>
                  <option value="best-of">Best of N</option>
                </select>
                
                {assignmentPolicy === 'best-of' && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">Best</span>
                    <input 
                      type="number" 
                      min="1"
                      disabled={Number(distribution.assignment) === 0}
                      value={assignmentBestOf}
                      onChange={(e) => setAssignmentBestOf(e.target.value)}
                      className="w-full px-2 py-2 text-center border border-slate-200 rounded-lg text-[11px] outline-none focus:border-brand-dark bg-slate-50 focus:bg-white disabled:bg-slate-100"
                    />
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

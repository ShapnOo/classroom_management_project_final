"use client";

import { 
  TrendingUp,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Calendar,
  History,
  ArrowRight,
  BookMarked,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

interface TeacherCourseContinuityProps {
  courseId?: string;
}

// Mock Data
const topicProgress = [
  { topic: "Introduction", progress: 100 },
  { topic: "ER Model", progress: 100 },
  { topic: "Relational Model", progress: 100 },
  { topic: "Normalization", progress: 80 },
  { topic: "SQL", progress: 40 },
  { topic: "Transactions", progress: 0 }
];

export default function TeacherCourseContinuity({ courseId }: TeacherCourseContinuityProps) {
  // In a real app, you'd fetch the course details based on the courseId
  // For now we'll just mock it.
  const courseName = courseId === "cls-2" ? "Software Engineering" : "Database Management Systems";
  const batch = "Spring 2026";
  const code = courseId === "cls-2" ? "CSE-412" : "CSE-305";
  const progress = courseId === "cls-2" ? 74 : 68;

  return (
    <div className="w-full mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/teacher/continuity"
            className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 transition-colors shadow-sm shrink-0"
            title="Back to Course List"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-dark to-slate-800 flex items-center justify-center shadow-sm shrink-0">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded uppercase bg-brand-dark/10 text-brand-dark">
                {code} • {batch}
              </span>
            </div>
            <h1 className="text-base font-medium text-slate-900 tracking-tight">{courseName} Continuity</h1>
          </div>
        </div>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Overall Progress */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <BarChart3 className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> Overall Course Progress
            </h3>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{progress}</span>
              <span className="text-sm font-medium text-slate-400 mb-0.5">%</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-brand-dark rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-[11px] font-medium text-slate-500 text-right">{100 - progress}% Syllabus Remaining</p>
          </div>
        </div>

        {/* Completion Forecast */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Calendar className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> Completion Forecast
            </h3>
            <div className="space-y-4 mt-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-[13px] font-medium text-slate-600">Classes Completed</span>
                <span className="text-[13px] font-medium text-slate-900">18 Sessions</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-[13px] font-medium text-slate-600">Classes Remaining</span>
                <span className="text-[13px] font-medium text-brand-dark">8 Sessions (Est.)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Class Quick Action */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 shadow-md relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BookMarked className="w-24 h-24 text-white" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xs font-medium text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> Next Class Readiness
            </h3>
            <h4 className="text-sm font-medium text-white leading-tight mb-2">Continue → BCNF Examples</h4>
            <p className="text-xs text-slate-400 mb-4">Based on continuity from Class #18</p>
          </div>
          <Link 
            href="/dashboard/teacher/sessions/start"
            className="relative z-10 inline-flex items-center justify-center gap-2 w-full py-2.5 bg-brand-dark text-white rounded-lg text-[13px] font-medium hover:bg-white hover:text-brand-dark transition-colors shadow-sm"
          >
            Start Next Class <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Continuity Engine Display (What was covered last) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="bg-slate-50 border-b border-slate-100 px-5 py-4">
            <h2 className="text-[13px] font-medium text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-brand-dark" />
              Continuity Engine
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Where the last class ended and where to begin next.</p>
          </div>
          
          <div className="p-5 flex-1 flex flex-col gap-5">
            <div className="border border-slate-200 rounded-lg p-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
              <h3 className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider mb-2">Previous Class (Class #18)</h3>
              <p className="text-[13px] font-medium text-slate-900 mb-3">Topic: Normalization (3NF & Intro to BCNF)</p>
              
              <div className="space-y-1.5 mb-3">
                <p className="text-xs font-medium text-slate-500 border-b border-slate-100 pb-1 mb-2">Coverage Complete:</p>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-xs font-medium text-slate-700">3NF</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-xs font-medium text-slate-700">Functional Dependency</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-xs font-medium text-slate-700">BCNF Introduction</span>
                </div>
              </div>
            </div>

            <div className="border border-brand-dark/20 bg-brand-dark/5 rounded-lg p-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-dark"></div>
              <h3 className="text-[10px] font-medium text-brand-dark uppercase tracking-wider mb-2">Remaining / Rollover</h3>
              
              <div className="space-y-1.5">
                <div className="flex items-start gap-2">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-brand-dark/40 mt-0.5 shrink-0"></div>
                  <span className="text-xs font-medium text-slate-800">BCNF Examples</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-brand-dark/40 mt-0.5 shrink-0"></div>
                  <span className="text-xs font-medium text-slate-800">Practical Problems</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Topic Progress Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-[13px] font-medium text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-dark" />
                Topic Progress
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Syllabus breakdown and completion status.</p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-slate-200 text-[10px] font-medium text-slate-600 shadow-sm">
              6 Topics Total
            </span>
          </div>
          
          <div className="overflow-y-auto flex-1 max-h-[360px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400 font-medium bg-white sticky top-0 z-10">
                  <th className="px-5 py-3">Topic</th>
                  <th className="px-5 py-3 w-32">Progress</th>
                  <th className="px-5 py-3 w-16 text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topicProgress.map((topic, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <p className={`text-[13px] font-medium ${topic.progress === 100 ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-900'}`}>
                        {topic.topic}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${topic.progress === 100 ? 'bg-emerald-500' : 'bg-brand-dark'}`}
                          style={{ width: `${topic.progress}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`text-xs font-medium ${topic.progress === 100 ? 'text-emerald-600' : 'text-brand-dark'}`}>
                        {topic.progress}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

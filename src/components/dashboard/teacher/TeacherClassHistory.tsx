"use client";

import { 
  History, 
  Search, 
  Filter, 
  ChevronDown,
  Calendar,
  MoreVertical,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

// Mock Data
const mockCourses = [
  "Database Management Systems",
  "Software Engineering",
  "Computer Networks",
  "Web Programming"
];

const mockHistory = [
  {
    id: "session-4",
    classNumber: "#04",
    date: "20 Jul 2026",
    topic: "Normalization",
    course: "Database Management Systems",
    batch: "Spring 2026",
    progress: 100,
    status: "Completed",
    materials: 2,
    attendance: "95%",
  },
  {
    id: "session-3",
    classNumber: "#03",
    date: "17 Jul 2026",
    topic: "Normalization",
    course: "Database Management Systems",
    batch: "Spring 2026",
    progress: 70,
    status: "Partial",
    materials: 1,
    attendance: "88%",
  },
  {
    id: "session-2",
    classNumber: "#02",
    date: "13 Jul 2026",
    topic: "ER Model",
    course: "Database Management Systems",
    batch: "Spring 2026",
    progress: 100,
    status: "Completed",
    materials: 3,
    attendance: "100%",
  },
  {
    id: "session-1",
    classNumber: "#01",
    date: "10 Jul 2026",
    topic: "Introduction to DBMS",
    course: "Database Management Systems",
    batch: "Spring 2026",
    progress: 100,
    status: "Completed",
    materials: 1,
    attendance: "92%",
  }
];

export default function TeacherClassHistory() {
  const [selectedCourse, setSelectedCourse] = useState("All Courses");
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Completed":
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
      case "Partial":
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 shadow-sm"><Clock className="w-3 h-3" /> Partial</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-slate-50 text-slate-700 border border-slate-200 shadow-sm">{status}</span>;
    }
  };

  return (
    <div className="w-full mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          
          <div>
            
            <p className="text-[11px] text-slate-500 mt-0.5">Review previous sessions, topics covered, and course continuity.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/teacher/sessions/start"
            className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-dark hover:border-brand-dark/30 transition-colors shadow-sm"
          >
            Start New Class
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by topic..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-48">
            <select 
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-3 pr-8 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark cursor-pointer shadow-sm"
            >
              <option value="All Courses">All Courses</option>
              {mockCourses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          
          <button className="flex items-center justify-center w-10 h-10 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-brand-dark transition-colors shadow-sm shrink-0">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                <th className="px-5 py-4 w-20">Class</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Topic & Course</th>
                <th className="px-5 py-4 w-48">Coverage Progress</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13px]">
              {mockHistory.map((session) => (
                <tr key={session.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center justify-center px-2 py-1 bg-slate-100 text-slate-600 rounded text-[11px] font-medium font-mono">
                      {session.classNumber}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-[13px]">{session.date}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-dark/5 flex items-center justify-center text-brand-dark shrink-0 mt-0.5">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 group-hover:text-brand-dark transition-colors">{session.topic}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-slate-500 font-medium">{session.course}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase tracking-wide">
                            {session.batch}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-600">{session.progress}% Complete</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${session.progress === 100 ? 'bg-emerald-500' : 'bg-brand-dark'}`}
                          style={{ width: `${session.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {getStatusBadge(session.status)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link 
                      href={`/dashboard/teacher/sessions/history/${session.id}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-brand-dark hover:bg-brand-dark/5 transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}

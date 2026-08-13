"use client";

import { 
  ArrowLeft,
  FolderOpen,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  Award,
  Download,
  BookOpen
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface TeacherClassArchiveProps {
  courseId?: string;
}

// Mock Data for the archive
const mockArchivedClass = {
  id: "cls-archived",
  name: "Introduction to Algorithms",
  code: "CSE-201",
  batch: "Fall 2025 - A",
  completedDate: "15 Dec 2025",
  totalStudents: 45,
  overallAttendance: 88, // %
  averageGrade: "A-",
  totalSessions: 24,
  sessions: [
    { id: "ses-24", date: "10 Dec 2025", topic: "Final Review & Q/A", attendance: 42, materials: 2 },
    { id: "ses-23", date: "08 Dec 2025", topic: "Dynamic Programming Advanced", attendance: 40, materials: 3 },
    { id: "ses-22", date: "03 Dec 2025", topic: "Graph Algorithms - Dijkstra", attendance: 43, materials: 1 },
    { id: "ses-21", date: "01 Dec 2025", topic: "Graph Theory Basics", attendance: 44, materials: 2 },
  ]
};

export default function TeacherClassArchive({ courseId }: TeacherClassArchiveProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "sessions" | "grades">("overview");

  return (
    <div className="w-full mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/teacher/classrooms"
            className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 transition-colors shadow-sm shrink-0"
            title="Back to Classrooms"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded uppercase bg-slate-200 text-slate-600">
                {mockArchivedClass.code} • {mockArchivedClass.batch}
              </span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded uppercase bg-amber-100 text-amber-700 flex items-center gap-1">
                <FolderOpen className="w-3 h-3" /> Archived
              </span>
            </div>
            <h1 className="text-sm font-semibold text-slate-900">{mockArchivedClass.name}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors shadow-sm shrink-0">
            <Download className="w-4 h-4" />
            Download Full Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200">
        {[
          { id: "overview", label: "Course Overview" },
          { id: "sessions", label: "Session History" },
          { id: "grades", label: "Final Grades" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-xs font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-brand-dark text-brand-dark' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[11px] font-medium uppercase tracking-wider">Completed On</span>
              </div>
              <p className="text-sm font-semibold text-slate-900">{mockArchivedClass.completedDate}</p>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Students</span>
              </div>
              <p className="text-sm font-semibold text-slate-900">{mockArchivedClass.totalStudents}</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-[11px] font-medium uppercase tracking-wider">Overall Attendance</span>
              </div>
              <p className="text-sm font-semibold text-brand-dark">{mockArchivedClass.overallAttendance}%</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Award className="w-4 h-4" />
                <span className="text-[11px] font-medium uppercase tracking-wider">Average Grade</span>
              </div>
              <p className="text-sm font-semibold text-emerald-600">{mockArchivedClass.averageGrade}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 text-center text-slate-500">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <h3 className="text-sm font-medium text-slate-700">Course Archived</h3>
            <p className="text-[11px] mt-1 max-w-md mx-auto">This course has been marked as completed. You can no longer add new sessions or assignments, but all historical data remains available for your records.</p>
          </div>
        </div>
      )}

      {activeTab === "sessions" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Topic Covered</th>
                <th className="px-5 py-3 text-center">Attendance</th>
                <th className="px-5 py-3 text-right">Materials</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {mockArchivedClass.sessions.map(session => (
                <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-slate-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {session.date}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-900 font-medium">{session.topic}</td>
                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md font-medium">
                      {session.attendance} / {mockArchivedClass.totalStudents}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-100 transition-colors shadow-sm font-medium">
                      <BookOpen className="w-3 h-3 text-brand-dark" />
                      {session.materials} Files
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "grades" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center animate-in fade-in duration-300">
          <Award className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h3 className="text-sm font-medium text-slate-700">Final Grades Ledger</h3>
          <p className="text-[11px] mt-1 text-slate-500">The detailed grades sheet for {mockArchivedClass.totalStudents} students is available for download.</p>
          <button className="mt-4 px-4 py-2 bg-brand-dark text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
            Export Grades (CSV)
          </button>
        </div>
      )}

    </div>
  );
}

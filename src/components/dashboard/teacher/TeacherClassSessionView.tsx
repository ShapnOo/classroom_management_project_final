"use client";

import { 
  ArrowLeft,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  FileText,
  Users2,
  Download,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface TeacherClassSessionViewProps {
  sessionId: string;
}

export default function TeacherClassSessionView({ sessionId }: TeacherClassSessionViewProps) {
  // Mock data for the session based on requirements
  const session = {
    classNumber: "#09",
    date: "12 Aug 2026",
    time: "10:00 AM - 11:30 AM",
    course: "Database Management Systems",
    batch: "Spring 2026",
    room: "Room 402",
    progress: 65,
    coveredTopics: [
      "3NF",
      "Functional Dependency",
      "BCNF Introduction"
    ],
    remainingTopics: [
      "BCNF Examples",
      "Practical Problems"
    ],
    nextClassTopic: "Continue → BCNF Examples",
    materials: [
      { name: "Lecture Slides (PDF)", size: "2.4 MB" },
      { name: "Code Examples (ZIP)", size: "1.1 MB" }
    ],
    attendance: {
      present: 40,
      absent: 2,
      late: 0,
      total: 42
    },
    teacherNotes: "Students grasped 3NF well, but we need more time on BCNF examples next class."
  };

  return (
    <div className="w-full mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/teacher/sessions/history"
            className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 transition-colors shadow-sm shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded uppercase bg-brand-dark/10 text-brand-dark">
                {session.course} • {session.batch}
              </span>
            </div>
            <h1 className="text-lg font-medium text-slate-900 tracking-tight">
              Class {session.classNumber} Details
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm text-[13px] font-medium text-slate-600">
          <Calendar className="w-4 h-4 text-slate-400" /> {session.date}
          <span className="text-slate-300">|</span>
          <Clock className="w-4 h-4 text-slate-400" /> {session.time}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Course Continuity (Core Academic Timeline) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-medium text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-dark" />
                Course Continuity & Coverage
              </h2>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Today's Coverage */}
              <div>
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
                  Today's Coverage
                </h3>
                <ul className="space-y-3">
                  {session.coveredTopics.map((topic, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-[13px] font-medium text-slate-800">{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Progress Bar */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-600">Overall Course Progress</span>
                  <span className="text-[13px] font-medium text-brand-dark">{session.progress}% Completed</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-dark rounded-full" 
                    style={{ width: `${session.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Remaining */}
              <div>
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
                  Remaining Topics
                </h3>
                <ul className="space-y-3">
                  {session.remainingTopics.map((topic, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 mt-0.5 shrink-0 flex items-center justify-center"></div>
                      <span className="text-[13px] font-medium text-slate-600">{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Next Class Focus */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-medium text-amber-800 uppercase tracking-wider mb-1">Next Class Focus</h4>
                  <p className="text-[13px] font-medium text-amber-900">{session.nextClassTopic}</p>
                </div>
              </div>

            </div>
          </div>

          {/* Teacher Notes */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
              Private Teacher Notes
            </h3>
            <p className="text-[13px] text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100 italic">
              "{session.teacherNotes}"
            </p>
          </div>

        </div>

        {/* Right Column: Attendance & Materials */}
        <div className="space-y-6">
          
          {/* Attendance Summary */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-4">
              <h2 className="text-[13px] font-medium flex items-center gap-2">
                <Users2 className="w-4 h-4 opacity-80" />
                Attendance Summary
              </h2>
            </div>
            
            <div className="p-5">
              <div className="flex items-end gap-2 mb-6">
                <span className="text-3xl font-medium text-slate-900 leading-none">{session.attendance.present}</span>
                <span className="text-[13px] font-medium text-slate-500 mb-1">/ {session.attendance.total} Present</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-[13px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-medium text-slate-700">Present</span>
                  </div>
                  <span className="font-medium text-slate-900">{session.attendance.present}</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="font-medium text-slate-700">Late</span>
                  </div>
                  <span className="font-medium text-slate-900">{session.attendance.late}</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span className="font-medium text-slate-700">Absent</span>
                  </div>
                  <span className="font-medium text-slate-900">{session.attendance.absent}</span>
                </div>
              </div>

              <button className="w-full mt-6 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-colors">
                View Full Attendance List
              </button>
            </div>
          </div>

          {/* Materials Used */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-[13px] font-medium text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                Materials Used
              </h2>
            </div>
            
            <div className="p-3 space-y-2">
              {session.materials.map((mat, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-brand-dark/5 flex items-center justify-center text-brand-dark shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-900">{mat.name}</p>
                      <p className="text-[10px] text-slate-500">{mat.size}</p>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-brand-dark/10 hover:text-brand-dark transition-colors opacity-0 group-hover:opacity-100">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

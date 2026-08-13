"use client";

import { 
  ClipboardCheck,
  Search,
  ArrowLeft,
  Download,
  Calendar,
  Users,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface TeacherAttendanceProps {
  courseId?: string;
}

// Mock Data
const mockPastClasses = [
  { id: "cls-10", date: "12 Aug 2026", topic: "Normalization (3NF)", present: 40, total: 42, percentage: 95 },
  { id: "cls-09", date: "05 Aug 2026", topic: "Normalization (1NF, 2NF)", present: 38, total: 42, percentage: 90 },
  { id: "cls-08", date: "29 Jul 2026", topic: "Entity Relationship Model", present: 42, total: 42, percentage: 100 },
  { id: "cls-07", date: "22 Jul 2026", topic: "Relational Algebra", present: 35, total: 42, percentage: 83 },
  { id: "cls-06", date: "15 Jul 2026", topic: "SQL Basics", present: 41, total: 42, percentage: 98 },
];

const mockStudents = [
  { id: "24201", name: "Mainul Hasan", attended: 16, total: 18, percentage: 89, status: "Good" },
  { id: "24202", name: "Waliullah", attended: 15, total: 18, percentage: 83, status: "Good" },
  { id: "24203", name: "Fariha Rahman", attended: 18, total: 18, percentage: 100, status: "Excellent" },
  { id: "24204", name: "Ahmed Kabir", attended: 10, total: 18, percentage: 55, status: "Critical" },
  { id: "24205", name: "Sarah Islam", attended: 17, total: 18, percentage: 94, status: "Excellent" },
  { id: "24206", name: "Tanvir Ahmed", attended: 12, total: 18, percentage: 67, status: "Warning" },
];

export default function TeacherAttendance({ courseId }: TeacherAttendanceProps) {
  const [activeTab, setActiveTab] = useState<"students" | "classes">("students");
  const [searchQuery, setSearchQuery] = useState("");

  // In a real app, fetch the course details based on the courseId
  const courseName = courseId === "cls-2" ? "Software Engineering" : "Database Management Systems";
  const batch = "Spring 2026";
  const code = courseId === "cls-2" ? "CSE-412" : "CSE-305";

  // Filter students
  const filteredStudents = mockStudents.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    student.id.includes(searchQuery)
  );

  return (
    <div className="w-full mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/teacher/attendance"
            className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 transition-colors shadow-sm shrink-0"
            title="Back to Course List"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded uppercase bg-brand-dark/10 text-brand-dark">
                {code} • {batch}
              </span>
            </div>
            
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-[13px] font-medium hover:bg-slate-50 transition-colors shadow-sm shrink-0"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-dark/10 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-brand-dark" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">Total Students</p>
            <h3 className="text-sm font-medium text-slate-900">42</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <ClipboardCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">Avg. Attendance</p>
            <h3 className="text-sm font-medium text-slate-900">92%</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">Low Attendance</p>
            <h3 className="text-sm font-medium text-slate-900">4 <span className="text-[13px] font-medium text-slate-500 normal-case">Students</span></h3>
          </div>
        </div>
      </div>

      {/* Tabs and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
        
        {/* Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab("students")}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all shadow-sm whitespace-nowrap flex items-center gap-2 ${
              activeTab === "students" 
                ? "bg-brand-dark text-white" 
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Users className="w-4 h-4" /> Student Report
          </button>
          <button
            onClick={() => setActiveTab("classes")}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all shadow-sm whitespace-nowrap flex items-center gap-2 ${
              activeTab === "classes" 
                ? "bg-brand-dark text-white" 
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Calendar className="w-4 h-4" /> Class Report
          </button>
        </div>

        {/* Search - Only show on students tab */}
        {activeTab === "students" && (
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search student..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400 shadow-sm"
            />
          </div>
        )}
      </div>

      {/* Tables */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Students Table */}
        {activeTab === "students" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-400 font-medium">Student</th>
                  <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-400 font-medium text-center">Classes Attended</th>
                  <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-400 font-medium text-center">Attendance %</th>
                  <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-400 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-medium text-slate-500">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-slate-900">
                            {student.name}
                          </p>
                          <p className="text-[11px] font-medium text-slate-500">ID: {student.id}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-[13px] font-medium text-slate-700">{student.attended} / {student.total}</span>
                    </td>
                    
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col items-center">
                        <span className={`text-[13px] font-medium ${
                          student.percentage >= 90 ? 'text-emerald-600' :
                          student.percentage >= 75 ? 'text-brand-dark' :
                          'text-red-600'
                        }`}>
                          {student.percentage}%
                        </span>
                        <div className="w-16 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              student.percentage >= 90 ? 'bg-emerald-500' :
                              student.percentage >= 75 ? 'bg-brand-dark' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${student.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium uppercase tracking-wider ${
                        student.status === 'Excellent' ? 'bg-emerald-100 text-emerald-700' :
                        student.status === 'Good' ? 'bg-blue-100 text-blue-700' :
                        student.status === 'Warning' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Classes Table */}
        {activeTab === "classes" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-400 font-medium">Class Session</th>
                  <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-400 font-medium">Topic</th>
                  <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-400 font-medium text-center">Present</th>
                  <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-400 font-medium text-right">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockPastClasses.map((cls) => (
                  <tr key={cls.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-[13px] font-medium text-slate-900">{cls.id.replace('cls-', 'Class #')}</p>
                      <p className="text-[11px] text-slate-500">{cls.date}</p>
                    </td>
                    <td className="px-5 py-4 text-[13px] font-medium text-slate-700">
                      {cls.topic}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-[13px] font-medium text-slate-700">{cls.present} / {cls.total}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={`text-[13px] font-medium ${
                        cls.percentage >= 90 ? 'text-emerald-600' :
                        cls.percentage >= 75 ? 'text-brand-dark' :
                        'text-red-600'
                      }`}>
                        {cls.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}

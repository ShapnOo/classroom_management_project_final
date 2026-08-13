"use client";

import { 
  Users,
  Search,
  MessageSquare,
  MoreVertical,
  ChevronRight,
  ArrowLeft,
  Mail,
  GraduationCap
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface TeacherStudentsProps {
  courseId?: string;
}

// Mock Data
const mockStudents = [
  { id: "24201", name: "Mainul Hasan", attendance: 92, assignments: "8/10", avgMarks: 82, avatar: "/avatars/avatar-1.jpg" },
  { id: "24202", name: "Waliullah", attendance: 87, assignments: "7/10", avgMarks: 76, avatar: "/avatars/avatar-2.jpg" },
  { id: "24203", name: "Fariha Rahman", attendance: 98, assignments: "10/10", avgMarks: 94, avatar: "/avatars/avatar-3.jpg" },
  { id: "24204", name: "Ahmed Kabir", attendance: 75, assignments: "6/10", avgMarks: 65, avatar: "/avatars/avatar-4.jpg" },
  { id: "24205", name: "Sarah Islam", attendance: 89, assignments: "9/10", avgMarks: 88, avatar: "/avatars/avatar-5.jpg" },
  { id: "24206", name: "Tanvir Ahmed", attendance: 65, assignments: "5/10", avgMarks: 58, avatar: "/avatars/avatar-6.jpg" },
];

export default function TeacherStudents({ courseId }: TeacherStudentsProps) {
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
            href="/dashboard/teacher/students"
            className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 transition-colors shadow-sm shrink-0"
            title="Back to Course List"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-dark to-slate-800 flex items-center justify-center shadow-sm shrink-0">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded uppercase bg-brand-dark/10 text-brand-dark">
                {code} • {batch}
              </span>
            </div>
            <h1 className="text-lg font-medium text-slate-900 tracking-tight">{courseName} Students</h1>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-[13px] font-medium hover:bg-slate-50 transition-colors shadow-sm shrink-0"
          >
            <Mail className="w-4 h-4" />
            Message All
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-brand-dark font-medium text-xs shadow-sm">
            {mockStudents.length}
          </div>
          <span className="text-[13px] font-medium text-slate-600">Total Enrolled</span>
        </div>

        {/* Search */}
        <div className="relative w-full xl:w-80 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400 shadow-sm"
          />
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-400 font-medium">Student</th>
                <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-400 font-medium text-center">Attendance</th>
                <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-400 font-medium text-center">Assignments</th>
                <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-400 font-medium text-center">Avg. Marks</th>
                <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-400 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                        {/* Fallback to initials if no image is available (using initials in UI for simplicity) */}
                        <span className="text-xs font-medium text-slate-500">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-slate-900 group-hover:text-brand-dark transition-colors">
                          {student.name}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500">ID: {student.id}</p>
                      </div>
                    </div>
                  </td>
                  
                  {/* Attendance */}
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col items-center">
                      <span className={`text-[13px] font-medium ${
                        student.attendance >= 90 ? 'text-emerald-600' :
                        student.attendance >= 75 ? 'text-brand-dark' :
                        'text-red-600'
                      }`}>
                        {student.attendance}%
                      </span>
                      <div className="w-16 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            student.attendance >= 90 ? 'bg-emerald-500' :
                            student.attendance >= 75 ? 'bg-brand-dark' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${student.attendance}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Assignments */}
                  <td className="px-5 py-3.5 text-center">
                    <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-slate-100 text-xs font-medium text-slate-700">
                      {student.assignments}
                    </span>
                  </td>
                  
                  {/* Avg Marks */}
                  <td className="px-5 py-3.5 text-center">
                    <span className={`text-[13px] font-medium ${
                        student.avgMarks >= 80 ? 'text-emerald-600' :
                        student.avgMarks >= 60 ? 'text-slate-700' :
                        'text-red-600'
                      }`}>
                      {student.avgMarks}%
                    </span>
                  </td>
                  
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-white hover:text-brand-dark border border-transparent hover:border-slate-200 hover:shadow-sm transition-all">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded text-xs font-medium hover:bg-slate-50 hover:text-brand-dark transition-colors shadow-sm">
                        Profile <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
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

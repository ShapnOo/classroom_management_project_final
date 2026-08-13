"use client";

import { 
  ClipboardCheck,
  ArrowRight,
  GraduationCap,
  Users
} from "lucide-react";
import Link from "next/link";

// Mock Data for courses
const mockCourses = [
  { 
    id: "cls-1", 
    name: "Database Management Systems", 
    batch: "Spring 2026", 
    code: "CSE-305",
    studentCount: 42,
    avgAttendance: 92,
    classesConducted: 18
  },
  { 
    id: "cls-2", 
    name: "Software Engineering", 
    batch: "Spring 2026", 
    code: "CSE-412",
    studentCount: 38,
    avgAttendance: 85,
    classesConducted: 15
  },
  { 
    id: "cls-3", 
    name: "Computer Networks", 
    batch: "Fall 2025", 
    code: "CSE-301",
    studentCount: 55,
    avgAttendance: 78,
    classesConducted: 24
  }
];

export default function TeacherAttendanceList() {
  return (
    <div className="w-full mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-dark to-slate-800 flex items-center justify-center shadow-sm shrink-0">
            <ClipboardCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-medium text-slate-900 tracking-tight">Attendance Manager</h1>
            <p className="text-xs text-slate-500 mt-0.5">Select a class to take or review attendance records.</p>
          </div>
        </div>
      </div>

      {/* Course List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group">
            <div className="p-5 flex-1 flex flex-col">
              
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded uppercase bg-brand-dark/10 text-brand-dark">
                  {course.code}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded uppercase bg-slate-100 text-slate-600">
                  {course.batch}
                </span>
              </div>
              
              <div className="flex items-start justify-between gap-2 mb-4">
                <h3 className="text-sm font-medium text-slate-900 group-hover:text-brand-dark transition-colors line-clamp-2">
                  {course.name}
                </h3>
                <ClipboardCheck className="w-8 h-8 text-slate-300 shrink-0 group-hover:text-brand-dark/20 transition-colors" />
              </div>

              <div className="space-y-3 mt-auto">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-slate-600">Avg. Attendance</span>
                    <span className={`text-xs font-medium ${
                      course.avgAttendance >= 90 ? 'text-emerald-600' : 
                      course.avgAttendance >= 80 ? 'text-brand-dark' : 
                      'text-red-600'
                    }`}>{course.avgAttendance}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        course.avgAttendance >= 90 ? 'bg-emerald-500' : 
                        course.avgAttendance >= 80 ? 'bg-brand-dark' : 
                        'bg-red-500'
                      }`} 
                      style={{ width: `${course.avgAttendance}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {course.studentCount} Enrolled
                </div>
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {course.classesConducted} Classes
                </div>
              </div>

            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <Link 
                href={`/dashboard/teacher/attendance/${course.id}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-[13px] font-medium hover:bg-slate-100 hover:text-brand-dark transition-colors shadow-sm group-hover:border-brand-dark/30"
              >
                Manage Attendance <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

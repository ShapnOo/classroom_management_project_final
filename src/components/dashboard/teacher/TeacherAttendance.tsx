"use client";

import { 
  ClipboardCheck,
  Search,
  ChevronDown,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  Users,
  Save
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

interface TeacherAttendanceProps {
  courseId?: string;
}

// Mock Data
const mockSessions = [
  { id: "sess-9", label: "Class #09 — 12 Aug 2026" },
  { id: "sess-8", label: "Class #08 — 05 Aug 2026" },
  { id: "sess-7", label: "Class #07 — 29 Jul 2026" }
];

const mockStudents = [
  { id: "24201", name: "Mainul Hasan" },
  { id: "24202", name: "Waliullah" },
  { id: "24203", name: "Fariha Rahman" },
  { id: "24204", name: "Ahmed Kabir" },
  { id: "24205", name: "Sarah Islam" },
  { id: "24206", name: "Tanvir Ahmed" },
];

export default function TeacherAttendance({ courseId }: TeacherAttendanceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSession, setSelectedSession] = useState(mockSessions[0].id);
  
  // State to hold attendance marks: 'present', 'absent', 'late', or null
  const [attendanceState, setAttendanceState] = useState<Record<string, string>>({});

  // Initialize all to present by default when component loads (or from DB in real app)
  useEffect(() => {
    const initial: Record<string, string> = {};
    mockStudents.forEach(student => {
      initial[student.id] = "present";
    });
    setAttendanceState(initial);
  }, [selectedSession]);

  // In a real app, fetch the course details based on the courseId
  const courseName = courseId === "cls-2" ? "Software Engineering" : "Database Management Systems";
  const batch = "Spring 2026";
  const code = courseId === "cls-2" ? "CSE-412" : "CSE-305";

  // Filter students
  const filteredStudents = mockStudents.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    student.id.includes(searchQuery)
  );

  const markStudent = (studentId: string, status: string) => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const markAll = (status: string) => {
    const newState: Record<string, string> = {};
    mockStudents.forEach(student => {
      newState[student.id] = status;
    });
    setAttendanceState(newState);
  };

  const presentCount = Object.values(attendanceState).filter(status => status === "present" || status === "late").length;
  const totalCount = mockStudents.length;
  const attendancePercentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-dark to-slate-800 flex items-center justify-center shadow-sm shrink-0">
            <ClipboardCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-brand-dark/10 text-brand-dark">
                {code} • {batch}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{courseName} Attendance</h1>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Session Selector */}
          <div className="relative w-full sm:w-64">
            <select 
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2.5 pl-4 pr-10 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark cursor-pointer shadow-sm transition-all"
            >
              {mockSessions.map(session => (
                <option key={session.id} value={session.id}>{session.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <button 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-dark text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm shrink-0"
          >
            <Save className="w-4 h-4" />
            Save Attendance
          </button>
        </div>
      </div>

      {/* Summary and Bulk Actions */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        
        {/* Real-time Summary */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-dark/20 flex items-center justify-center">
            <span className="text-sm font-bold text-brand-dark">{attendancePercentage}%</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Attendance Summary</h3>
            <p className="text-xs text-slate-500">
              <span className="font-bold text-slate-700">{presentCount} / {totalCount}</span> Present
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search student..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400"
            />
          </div>
          
          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

          {/* Bulk Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={() => markAll('present')}
              className="flex-1 sm:flex-none px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
            >
              Mark All Present
            </button>
            <button 
              onClick={() => markAll('absent')}
              className="flex-1 sm:flex-none px-3 py-2 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors"
            >
              Mark All Absent
            </button>
          </div>
        </div>
        
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-400 font-bold w-16">No.</th>
                <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-400 font-bold">Student</th>
                <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-400 font-bold text-right">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student, index) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-5 py-3.5 text-xs font-medium text-slate-400">
                    {String(index + 1).padStart(2, '0')}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-slate-500">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {student.name}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500">ID: {student.id}</p>
                      </div>
                    </div>
                  </td>
                  
                  {/* Attendance Toggles */}
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-inner">
                      
                      {/* Present */}
                      <button
                        onClick={() => markStudent(student.id, 'present')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                          attendanceState[student.id] === 'present' 
                            ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/50' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Present
                      </button>

                      {/* Late */}
                      <button
                        onClick={() => markStudent(student.id, 'late')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                          attendanceState[student.id] === 'late' 
                            ? 'bg-white text-amber-600 shadow-sm border border-slate-200/50' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" /> Late
                      </button>

                      {/* Absent */}
                      <button
                        onClick={() => markStudent(student.id, 'absent')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                          attendanceState[student.id] === 'absent' 
                            ? 'bg-white text-red-600 shadow-sm border border-slate-200/50' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" /> Absent
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-12 text-center">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-slate-900">No students found</h3>
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

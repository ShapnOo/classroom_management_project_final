"use client";

import { 
  Users, 
  Clock, 
  CalendarDays, 
  BookOpen, 
  LayoutGrid, 
  List as ListIcon, 
  Search,
  MapPin,
  TrendingUp,
  ArrowRight,
  User
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const allClassrooms = [
  {
    id: "cls-1",
    courseCode: "CSE-305",
    courseTitle: "Database Management Systems",
    program: "B.Sc. CS",
    batch: "Spring 2026 - A",
    room: "Room 402, Bldg C",
    schedule: "Mon, Wed • 10:00 AM - 11:30 AM",
    startDate: "2026-01-15",
    endDate: "2026-05-20",
    students: 42,
    classesCompleted: 18,
    totalClasses: 26,
    progress: 68,
    teacher: "Dr. Alan Turing",
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    textColor: "text-blue-700",
    status: "ongoing"
  },
  {
    id: "cls-2",
    courseCode: "CSE-412",
    courseTitle: "Software Engineering",
    program: "B.Sc. CS",
    batch: "Spring 2026 - B",
    room: "Room 305, Bldg A",
    schedule: "Tue, Thu • 02:00 PM - 03:30 PM",
    startDate: "2026-01-16",
    endDate: "2026-05-22",
    students: 38,
    classesCompleted: 15,
    totalClasses: 20,
    progress: 74,
    teacher: "Prof. Sarah Jenkins",
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    status: "ongoing"
  },
  {
    id: "cls-3",
    courseCode: "CSE-101",
    courseTitle: "Introduction to Computer Science",
    program: "B.Sc. CS",
    batch: "Fall 2025 - A",
    room: "Room 201, Bldg B",
    schedule: "Mon, Wed • 08:00 AM - 09:30 AM",
    startDate: "2025-08-15",
    endDate: "2025-12-20",
    students: 50,
    classesCompleted: 24,
    totalClasses: 24,
    progress: 100,
    teacher: "Prof. Ada Lovelace",
    color: "bg-slate-500",
    lightColor: "bg-slate-50",
    textColor: "text-slate-700",
    status: "completed"
  },
  {
    id: "cls-4",
    courseCode: "CSE-425",
    courseTitle: "Artificial Intelligence",
    program: "B.Sc. CS",
    batch: "Spring 2026 - A",
    room: "Lab 2, Bldg D",
    schedule: "Mon, Wed • 12:00 PM - 01:30 PM",
    startDate: "2026-01-15",
    endDate: "2026-05-20",
    students: 35,
    classesCompleted: 8,
    totalClasses: 24,
    progress: 33,
    teacher: "Dr. Tim Berners-Lee",
    color: "bg-purple-500",
    lightColor: "bg-purple-50",
    textColor: "text-purple-700",
    status: "ongoing"
  },
  {
    id: "cls-5",
    courseCode: "CSE-201",
    courseTitle: "Data Structures",
    program: "B.Sc. CS",
    batch: "Fall 2026 - C",
    room: "Room 101, Bldg B",
    schedule: "Fri • 09:00 AM - 12:00 PM",
    startDate: "2026-08-15",
    endDate: "2026-12-20",
    students: 45,
    classesCompleted: 0,
    totalClasses: 24,
    progress: 0,
    teacher: "Prof. Sarah Jenkins",
    color: "bg-amber-500",
    lightColor: "bg-amber-50",
    textColor: "text-amber-700",
    status: "upcoming"
  },
];

export default function AdminClassrooms() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredClassrooms = allClassrooms.filter(cls => {
    const matchesSearch = 
      cls.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.teacher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || cls.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full mx-auto space-y-4 pb-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-[13px] font-medium text-slate-900 leading-tight">All Classrooms</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Global overview of all active classes, assigned teachers, and course progress.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search classrooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-md text-[11px] font-medium outline-none focus:border-brand-dark w-full sm:w-auto cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="ongoing">Ongoing</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>

            <div className="flex items-center border border-slate-200 rounded-md bg-white p-0.5 shrink-0">
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-1 rounded ${viewMode === "grid" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`p-1 rounded ${viewMode === "list" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
              >
                <ListIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredClassrooms.map((cls) => (
            <div 
              key={cls.id} 
              className={`bg-white rounded-lg border shadow-sm overflow-hidden flex flex-col transition-all group ${cls.status === 'completed' ? 'border-slate-200/60 opacity-80' : 'border-slate-200 hover:border-brand-dark/30 hover:shadow-md'}`}
            >
              <div className={`h-1.5 w-full ${cls.status === 'completed' ? 'bg-slate-300' : cls.color}`} />
              <div className="p-3.5 flex-1 flex flex-col">
                
                <div className="flex justify-between items-start mb-2.5">
                  <div>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-medium tracking-wider uppercase mb-1 ${cls.status === 'completed' ? 'bg-slate-100 text-slate-600' : cls.lightColor + ' ' + cls.textColor}`}>
                      {cls.courseCode} • {cls.status}
                    </span>
                    <h3 className="text-[13px] font-medium text-slate-900 leading-tight group-hover:text-brand-dark transition-colors line-clamp-1">
                      {cls.courseTitle}
                    </h3>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-[10px] font-medium mb-1">
                    <span className="text-slate-500">Course Progress</span>
                    <span className={cls.status === 'completed' ? 'text-slate-600' : cls.textColor}>{cls.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${cls.status === 'completed' ? 'bg-slate-400' : cls.color} rounded-full`} 
                      style={{ width: `${cls.progress}%` }}
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-3 flex-1">
                  <div className="flex items-start gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] font-medium text-slate-700">{cls.teacher}</p>
                      <p className="text-[9px] text-slate-500">Assigned Teacher</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] font-medium text-slate-700">{cls.batch}</p>
                      <p className="text-[9px] text-slate-500">{cls.program} • {cls.students} Students</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <div className="text-[10px] text-slate-600 font-medium pt-0.5">
                      {new Date(cls.startDate).toLocaleDateString('en-GB', {day: 'numeric', month: 'short'})} – {new Date(cls.endDate).toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'})}
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <div className="text-[10px] text-slate-600 font-medium pt-0.5">
                      {cls.schedule}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-1.5 mt-auto pt-3 border-t border-slate-100">
                  <Link 
                    href={`/dashboard/admin/academic/classrooms/${cls.id}`}
                    className={`col-span-3 mb-1.5 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-medium rounded shadow-sm transition-colors ${cls.status === 'completed' ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-brand-dark text-white hover:bg-slate-800'}`}
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    View Details
                  </Link>
                  
                  <div className="col-span-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded bg-slate-50 text-slate-500 text-center">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-medium">{cls.classesCompleted}/{cls.totalClasses}</span>
                  </div>
                  
                  <div className="col-span-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded bg-slate-50 text-slate-500 text-center">
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-medium">{cls.students} Students</span>
                  </div>

                  <div className="col-span-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded bg-slate-50 text-slate-500 text-center">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-medium">{cls.progress}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                  <th className="px-4 py-2.5">Course</th>
                  <th className="px-4 py-2.5">Teacher</th>
                  <th className="px-4 py-2.5">Batch / Duration</th>
                  <th className="px-4 py-2.5">Schedule & Room</th>
                  <th className="px-4 py-2.5">Progress</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {filteredClassrooms.map((cls) => (
                  <tr key={cls.id} className={`hover:bg-slate-50 transition-colors ${cls.status === 'completed' ? 'opacity-70' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-8 rounded-full ${cls.status === 'completed' ? 'bg-slate-300' : cls.color}`} />
                        <div>
                          <p className="font-medium text-slate-900">{cls.courseTitle}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] font-medium text-slate-500">{cls.courseCode}</span>
                            <span className={`text-[8px] font-medium px-1.5 rounded-sm uppercase ${cls.status === 'completed' ? 'bg-slate-200 text-slate-600' : cls.lightColor + ' ' + cls.textColor}`}>
                              {cls.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="font-medium text-slate-700">{cls.teacher}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700">{cls.batch}</p>
                      <p className="text-[10px] text-slate-500">{new Date(cls.startDate).toLocaleDateString('en-GB', {day: 'numeric', month: 'short'})} to {new Date(cls.endDate).toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: '2-digit'})}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700">{cls.schedule}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <p className="text-[10px] text-slate-500">{cls.room}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 w-44">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${cls.status === 'completed' ? 'bg-slate-400' : cls.color} rounded-full`} 
                            style={{ width: `${cls.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-medium text-slate-600">{cls.progress}%</span>
                      </div>
                      <p className="text-[9px] text-slate-500 mt-1">{cls.classesCompleted} of {cls.totalClasses} classes done</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link 
                        href={`/dashboard/admin/academic/classrooms/${cls.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-[10px] font-medium transition-colors bg-brand-dark text-white hover:bg-slate-800"
                      >
                        View <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredClassrooms.length === 0 && (
        <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-50 rounded-lg border border-slate-200 border-dashed">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-2">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <h3 className="text-[11px] font-medium text-slate-900 mb-0.5">No classrooms found</h3>
          <p className="text-[10px] text-slate-500">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}

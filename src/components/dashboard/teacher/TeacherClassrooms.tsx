"use client";

import { 
  Users, 
  MapPin, 
  Clock, 
  Play, 
  FolderOpen, 
  ClipboardCheck,
  Search,
  Filter,
  MoreVertical,
  CalendarDays
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const mockClassrooms = [
  {
    id: "cls-1",
    courseCode: "CSE-305",
    courseTitle: "Database Management Systems",
    program: "B.Sc. in Computer Science",
    batch: "Spring 2026 - Section A",
    room: "Room 402, Building C",
    schedule: "Mon, Wed • 10:00 AM - 11:30 AM",
    students: 42,
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    textColor: "text-blue-700",
    status: "ongoing"
  },
  {
    id: "cls-2",
    courseCode: "CSE-412",
    courseTitle: "Software Engineering",
    program: "B.Sc. in Computer Science",
    batch: "Spring 2026 - Section B",
    room: "Room 305, Building A",
    schedule: "Tue, Thu • 02:00 PM - 03:30 PM",
    students: 38,
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    status: "ongoing"
  },
  {
    id: "cls-3",
    courseCode: "CSE-425",
    courseTitle: "Artificial Intelligence",
    program: "B.Sc. in Computer Science",
    batch: "Spring 2026 - Section A",
    room: "Lab 2, Building D",
    schedule: "Mon, Wed • 12:00 PM - 01:30 PM",
    students: 35,
    color: "bg-purple-500",
    lightColor: "bg-purple-50",
    textColor: "text-purple-700",
    status: "ongoing"
  },
  {
    id: "cls-4",
    courseCode: "CSE-201",
    courseTitle: "Data Structures",
    program: "B.Sc. in Computer Science",
    batch: "Fall 2025 - Section C",
    room: "Room 101, Building B",
    schedule: "Fri • 09:00 AM - 12:00 PM",
    students: 45,
    color: "bg-amber-500",
    lightColor: "bg-amber-50",
    textColor: "text-amber-700",
    status: "upcoming"
  },
  {
    id: "cls-5",
    courseCode: "CSE-350",
    courseTitle: "Computer Networks",
    program: "B.Sc. in Computer Science",
    batch: "Spring 2026 - Section A",
    room: "Room 205, Building C",
    schedule: "Tue, Thu • 10:00 AM - 11:30 AM",
    students: 40,
    color: "bg-indigo-500",
    lightColor: "bg-indigo-50",
    textColor: "text-indigo-700",
    status: "ongoing"
  },
];

export default function TeacherClassrooms() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClassrooms = mockClassrooms.filter(cls => 
    cls.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full mx-auto space-y-6 pb-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">My Classrooms</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your active classes, materials, and student attendance.</p>
        </div>
        
        {/* Actions & Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search classrooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm w-full sm:w-auto shrink-0">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Classrooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredClassrooms.map((cls) => (
          <div 
            key={cls.id} 
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-brand-dark/30 hover:shadow-md transition-all group"
          >
            {/* Card Header */}
            <div className={`h-2 w-full ${cls.color}`}></div>
            <div className="p-5 flex-1 flex flex-col relative">
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase mb-2 ${cls.lightColor} ${cls.textColor}`}>
                    {cls.courseCode}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-brand-dark transition-colors line-clamp-2">
                    {cls.courseTitle}
                  </h3>
                </div>
                <button className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-50 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Details List */}
              <div className="space-y-2.5 mb-6 flex-1">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5"><Users className="w-4 h-4 text-slate-400" /></div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{cls.program}</p>
                    <p className="text-[11px] text-slate-500">{cls.batch} • {cls.students} Students</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5"><Clock className="w-4 h-4 text-slate-400" /></div>
                  <div className="text-xs text-slate-600 font-medium pt-0.5">
                    {cls.schedule}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5"><MapPin className="w-4 h-4 text-slate-400" /></div>
                  <div className="text-xs text-slate-600 font-medium pt-0.5">
                    {cls.room}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-slate-100">
                <Link href={`/dashboard/teacher/classrooms/${cls.id}`} className="col-span-3 mb-2 flex items-center justify-center gap-2 py-2.5 bg-brand-dark text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm">
                  <Play className="w-4 h-4 fill-white" />
                  Enter Classroom
                </Link>
                
                <button className="col-span-1 flex flex-col items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 hover:text-brand-dark border border-transparent hover:border-slate-200 group/btn">
                  <FolderOpen className="w-4 h-4 text-slate-400 group-hover/btn:text-brand-dark transition-colors" />
                  <span className="text-[10px] font-semibold">Materials</span>
                </button>
                
                <button className="col-span-1 flex flex-col items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 hover:text-brand-dark border border-transparent hover:border-slate-200 group/btn">
                  <ClipboardCheck className="w-4 h-4 text-slate-400 group-hover/btn:text-brand-dark transition-colors" />
                  <span className="text-[10px] font-semibold">Attendance</span>
                </button>

                <button className="col-span-1 flex flex-col items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 hover:text-brand-dark border border-transparent hover:border-slate-200 group/btn">
                  <CalendarDays className="w-4 h-4 text-slate-400 group-hover/btn:text-brand-dark transition-colors" />
                  <span className="text-[10px] font-semibold">Schedule</span>
                </button>
              </div>

            </div>
          </div>
        ))}

        {filteredClassrooms.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-slate-50 rounded-xl border border-slate-200 border-dashed">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">No classrooms found</h3>
            <p className="text-xs text-slate-500">We couldn't find any classrooms matching your search.</p>
          </div>
        )}
      </div>

    </div>
  );
}

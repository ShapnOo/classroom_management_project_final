"use client";

import { 
  BookOpen, 
  Search,
  Filter,
  GraduationCap,
  ListTodo,
  FileText,
  PlaySquare,
  MoreVertical,
  X,
  CheckCircle2,
  LayoutGrid,
  List as ListIcon
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const mockCourses = [
  {
    id: "crs-1",
    courseCode: "CSE-305",
    courseTitle: "Database Management Systems",
    department: "Computer Science & Engineering",
    credits: "3.0",
    semester: "5th Semester",
    type: "Core",
    activeBatches: 2,
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    textColor: "text-blue-700",
    syllabus: [
      "Introduction to Database Systems",
      "Entity-Relationship Model",
      "Relational Model and Algebra",
      "SQL and Advanced SQL",
      "Database Normalization (1NF to BCNF)",
      "Transaction Management & Concurrency",
      "Database Security and Recovery"
    ]
  },
  {
    id: "crs-2",
    courseCode: "CSE-412",
    courseTitle: "Software Engineering",
    department: "Computer Science & Engineering",
    credits: "3.0",
    semester: "7th Semester",
    type: "Core",
    activeBatches: 1,
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    syllabus: [
      "Software Development Life Cycles (SDLC)",
      "Agile and Scrum Methodologies",
      "Requirements Engineering",
      "System Modeling (UML)",
      "Software Architecture and Design Patterns",
      "Software Testing and Quality Assurance",
      "Project Management & Estimation"
    ]
  },
  {
    id: "crs-3",
    courseCode: "CSE-101",
    courseTitle: "Introduction to Computer Science",
    department: "Computer Science & Engineering",
    credits: "2.0",
    semester: "1st Semester",
    type: "Foundation",
    activeBatches: 1,
    color: "bg-slate-500",
    lightColor: "bg-slate-50",
    textColor: "text-slate-700",
    syllabus: [
      "History of Computing",
      "Computer Hardware & Architecture basics",
      "Number Systems and Logic Gates",
      "Introduction to Operating Systems",
      "Basics of Computer Networks",
      "Problem Solving and Algorithms",
      "Introduction to Programming (C/Python)"
    ]
  },
  {
    id: "crs-4",
    courseCode: "CSE-425",
    courseTitle: "Artificial Intelligence",
    department: "Computer Science & Engineering",
    credits: "3.0",
    semester: "8th Semester",
    type: "Core",
    activeBatches: 1,
    color: "bg-purple-500",
    lightColor: "bg-purple-50",
    textColor: "text-purple-700",
    syllabus: [
      "Intelligent Agents & Problem Solving",
      "Search Algorithms (A*, Minimax)",
      "Knowledge Representation (Propositional Logic)",
      "Machine Learning Basics",
      "Neural Networks & Deep Learning",
      "Natural Language Processing",
      "AI Ethics and Future Trends"
    ]
  },
];

export default function TeacherCourses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCourse, setSelectedCourse] = useState<typeof mockCourses[0] | null>(null);

  const filteredCourses = mockCourses.filter(course => 
    course.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full mx-auto space-y-4 pb-8 relative">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">My Assigned Courses</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Master definitions and syllabuses for the subjects you teach.</p>
        </div>
        
        {/* Actions & Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-md text-[11px] font-medium hover:bg-slate-50 transition-colors shadow-sm shrink-0 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5" />
              Filter Department
            </button>

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
          {filteredCourses.map((course) => (
            <div 
              key={course.id} 
              className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all hover:border-brand-dark/30 hover:shadow-md group"
            >
              {/* Card Header Accent */}
              <div className={`h-1 w-full ${course.color}`}></div>
              
              <div className="p-4 flex-1 flex flex-col">
                
                {/* Title Area */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase mb-1.5 ${course.lightColor} ${course.textColor}`}>
                      {course.courseCode} • {course.type}
                    </span>
                    <h3 className="text-[13px] font-bold text-slate-900 leading-tight group-hover:text-brand-dark transition-colors">
                      {course.courseTitle}
                    </h3>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-50 transition-colors shrink-0">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Meta Data */}
                <div className="grid grid-cols-2 gap-2 mb-3 flex-1">
                  <div className="bg-slate-50 rounded p-2 border border-slate-100">
                    <span className="block text-[9px] text-slate-500 font-medium mb-0.5">Credits</span>
                    <span className="text-[11px] font-bold text-slate-800">{course.credits}</span>
                  </div>
                  <div className="bg-slate-50 rounded p-2 border border-slate-100">
                    <span className="block text-[9px] text-slate-500 font-medium mb-0.5">Semester</span>
                    <span className="text-[11px] font-bold text-slate-800">{course.semester}</span>
                  </div>
                  <div className="bg-slate-50 rounded p-2 border border-slate-100 col-span-2">
                    <span className="block text-[9px] text-slate-500 font-medium mb-0.5">Department</span>
                    <span className="text-[11px] font-bold text-slate-800">{course.department}</span>
                  </div>
                </div>

                {/* Active Classes Summary */}
                <div className="flex items-center gap-2 py-2 mb-3 border-y border-slate-100">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${course.lightColor} ${course.textColor}`}>
                    <PlaySquare className="w-3 h-3" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-600 font-medium">Currently Teaching</p>
                    <p className="text-[11px] font-bold text-slate-900">{course.activeBatches} Active {course.activeBatches === 1 ? 'Batch' : 'Batches'}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-auto pt-1">
                  <button 
                    onClick={() => setSelectedCourse(course)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white border border-slate-200 text-slate-700 rounded text-[11px] font-bold hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    View Syllabus
                  </button>
                  <Link 
                    href="/dashboard/teacher/classrooms"
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-brand-dark text-white rounded text-[11px] font-bold hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    Go to Classes
                  </Link>
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
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  <th className="px-4 py-2.5">Course Information</th>
                  <th className="px-4 py-2.5">Academic Details</th>
                  <th className="px-4 py-2.5">Teaching Status</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-10 rounded-full ${course.color}`}></div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs mb-0.5">{course.courseTitle}</p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-500">{course.courseCode}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase ${course.lightColor} ${course.textColor}`}>
                              {course.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-700">{course.department}</p>
                      <p className="text-[10px] text-slate-500">{course.semester} • {course.credits} Credits</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <PlaySquare className="w-3.5 h-3.5 text-brand-dark" />
                        <span className="font-semibold text-slate-700">{course.activeBatches} Active Batches</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => setSelectedCourse(course)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 rounded text-[10px] font-bold hover:bg-slate-50 transition-colors shadow-sm"
                        >
                          <FileText className="w-3 h-3" />
                          Syllabus
                        </button>
                        <Link 
                          href="/dashboard/teacher/classrooms"
                          className="inline-flex items-center px-2.5 py-1.5 bg-brand-dark text-white rounded text-[10px] font-bold hover:bg-slate-800 transition-colors shadow-sm"
                        >
                          Batches
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredCourses.length === 0 && (
        <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-50 rounded-lg border border-slate-200 border-dashed">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-2">
            <BookOpen className="w-4 h-4 text-slate-400" />
          </div>
          <h3 className="text-[11px] font-bold text-slate-900 mb-0.5">No courses found</h3>
          <p className="text-[10px] text-slate-500">You are not assigned to any courses matching that search.</p>
        </div>
      )}

      {/* Syllabus Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className={`p-4 md:p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50 rounded-t-xl`}>
              <div>
                <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase mb-1.5 ${selectedCourse.lightColor} ${selectedCourse.textColor}`}>
                  {selectedCourse.courseCode} • {selectedCourse.credits} Credits
                </span>
                <h2 className="text-base font-bold text-slate-900">{selectedCourse.courseTitle}</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">{selectedCourse.department}</p>
              </div>
              <button 
                onClick={() => setSelectedCourse(null)}
                className="p-1.5 bg-white text-slate-400 rounded-full border border-slate-200 hover:bg-slate-100 hover:text-slate-700 transition-colors shadow-sm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 md:p-5 overflow-y-auto">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <ListTodo className="w-4 h-4 text-brand-dark" />
                <h3 className="text-sm font-bold text-slate-800">Course Syllabus</h3>
              </div>

              <div className="space-y-3">
                {selectedCourse.syllabus.map((topic, idx) => (
                  <div key={idx} className="flex gap-3 items-start group">
                    <div className="flex flex-col items-center mt-0.5">
                      <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-500 group-hover:bg-brand-dark group-hover:text-white group-hover:border-brand-dark transition-colors">
                        {idx + 1}
                      </div>
                      {idx !== selectedCourse.syllabus.length - 1 && (
                        <div className="w-px h-6 bg-slate-200 my-0.5 group-hover:bg-brand-dark/30 transition-colors"></div>
                      )}
                    </div>
                    <div className="pt-0.5 pb-2 flex-1">
                      <p className="text-[12px] font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{topic}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-b-xl">
              <span className="text-[10px] text-slate-500 font-medium">Total {selectedCourse.syllabus.length} Modules</span>
              <button 
                onClick={() => setSelectedCourse(null)}
                className="px-5 py-1.5 bg-brand-dark text-white rounded-md text-[11px] font-bold hover:bg-slate-800 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

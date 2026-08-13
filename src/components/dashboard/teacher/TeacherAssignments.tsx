"use client";

import { 
  ListTodo,
  Search,
  Plus,
  ArrowLeft,
  Calendar,
  Users,
  X,
  FileCheck,
  Paperclip,
  MoreVertical,
  CheckCircle2,
  Clock
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface TeacherAssignmentsProps {
  courseId?: string;
}

// Mock Data
const mockAssignments = [
  { 
    id: "asn-1", 
    title: "ER Diagram Assignment", 
    dueDate: "15 Aug 2026", 
    submitted: 36, 
    total: 42, 
    status: "active",
    maxMarks: 10
  },
  { 
    id: "asn-2", 
    title: "SQL Queries Practice", 
    dueDate: "01 Aug 2026", 
    submitted: 42, 
    total: 42, 
    status: "graded",
    maxMarks: 20
  },
  { 
    id: "asn-3", 
    title: "Normalization Exercises", 
    dueDate: "10 Jul 2026", 
    submitted: 40, 
    total: 42, 
    status: "graded",
    maxMarks: 15
  }
];

export default function TeacherAssignments({ courseId }: TeacherAssignmentsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for creating an assignment
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxMarks, setMaxMarks] = useState("10");

  // In a real app, fetch the course details based on the courseId
  const courseName = courseId === "cls-2" ? "Software Engineering" : "Database Management Systems";
  const batch = "Spring 2026";
  const code = courseId === "cls-2" ? "CSE-412" : "CSE-305";

  // Filter assignments
  const filteredAssignments = mockAssignments.filter(asn => 
    asn.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/teacher/assignments"
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
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-dark text-white rounded-lg text-[13px] font-medium hover:bg-slate-800 transition-colors shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Create Assignment
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-brand-dark font-medium text-[11px] shadow-sm">
            {mockAssignments.length}
          </div>
          <span className="text-[13px] font-medium text-slate-600">Total Assignments</span>
        </div>

        {/* Search */}
        <div className="relative w-full xl:w-80 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search assignments..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400 shadow-sm"
          />
        </div>
      </div>

      {/* Assignment List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredAssignments.map((asn) => (
          <div key={asn.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group overflow-hidden">
            <div className="p-5 flex-1">
              
              <div className="flex items-start justify-between mb-3">
                <div className={`px-2.5 py-1 rounded-md text-[10px] font-medium uppercase tracking-wider inline-flex items-center gap-1.5 ${
                  asn.status === 'active' 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {asn.status === 'active' ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                  {asn.status}
                </div>
                
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-xs font-medium text-slate-900 group-hover:text-brand-dark transition-colors line-clamp-2 mb-4">
                {asn.title}
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-[13px] text-slate-600">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium">Due: <span className="text-slate-900">{asn.dueDate}</span></span>
                </div>
                
                <div className="flex items-center gap-3 text-[13px] text-slate-600">
                  <FileCheck className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium">Max Marks: <span className="text-slate-900">{asn.maxMarks}</span></span>
                </div>
              </div>

              {/* Progress Bar for Submissions */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium text-slate-600 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Submissions
                  </span>
                  <span className="text-[11px] font-medium text-brand-dark">{asn.submitted}/{asn.total}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-brand-dark transition-all duration-1000"
                    style={{ width: `${(asn.submitted / asn.total) * 100}%` }}
                  ></div>
                </div>
                {asn.status === 'active' && asn.total - asn.submitted > 0 && (
                  <p className="text-[10px] text-amber-600 font-medium mt-2 text-right">
                    {asn.total - asn.submitted} Pending
                  </p>
                )}
              </div>

            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2">
              <button className="flex-1 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-[11px] font-medium hover:bg-slate-100 transition-colors shadow-sm">
                Edit
              </button>
              <Link 
                href={`/dashboard/teacher/assignments/${courseId || 'cls-1'}/evaluate/${asn.id}`}
                className="flex-1 py-2 bg-brand-dark text-white rounded-lg text-[11px] font-medium hover:bg-slate-800 transition-colors shadow-sm text-center"
              >
                Evaluate
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Create Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-xs font-medium text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand-dark" />
                Create New Assignment
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Target Class Context */}
              <div className="bg-brand-dark/5 p-4 rounded-xl border border-brand-dark/10 flex items-center justify-between">
                <div>
                  <label className="text-[10px] font-medium text-brand-dark uppercase tracking-wider mb-1 block">Assigning to Classroom</label>
                  <p className="text-[13px] font-medium text-slate-900">{courseName}</p>
                  <p className="text-[11px] font-medium text-slate-500">{batch} • {code}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-700">Assignment Title <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="e.g., ER Diagram Assignment"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-700">Description & Instructions</label>
                  <textarea 
                    rows={4}
                    placeholder="Enter detailed instructions for the students..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all resize-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-700">Due Date <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="date" 
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all text-slate-700"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-700">Maximum Marks <span className="text-red-500">*</span></label>
                    <input 
                      type="number" 
                      value={maxMarks}
                      onChange={(e) => setMaxMarks(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all text-slate-700"
                    />
                  </div>
                </div>

                {/* File Attachment Area */}
                <div className="space-y-1.5 mt-2">
                  <label className="text-[11px] font-medium text-slate-700">Attachments (Optional)</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center mb-3">
                      <Paperclip className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-[13px] font-medium text-slate-900">Click to upload reference materials</p>
                    <p className="text-[11px] text-slate-500 mt-1">PDF, DOCX, ZIP (Max 10MB)</p>
                  </div>
                </div>
              </div>

            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-lg text-[13px] font-medium text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  alert("Assignment created successfully!");
                  setIsModalOpen(false);
                }}
                className="px-6 py-2.5 bg-brand-dark text-white rounded-lg text-[13px] font-medium hover:bg-slate-800 transition-colors shadow-sm"
              >
                Publish Assignment
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}

"use client";

import { 
  FileText,
  Search,
  Plus,
  ArrowLeft,
  Calendar,
  Users,
  X,
  FileCheck,
  MoreVertical,
  CheckCircle2,
  Clock
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface TeacherTestsProps {
  courseId?: string;
}

// Mock Data
const mockTests = [
  { 
    id: "tst-1", 
    title: "Midterm Examination", 
    date: "15 Aug 2026",
    time: "10:00 AM",
    duration: "1h 30m",
    submitted: 36, 
    total: 42, 
    status: "upcoming",
    maxMarks: 50
  },
  { 
    id: "tst-2", 
    title: "SQL Quiz 1", 
    date: "01 Aug 2026", 
    time: "11:00 AM",
    duration: "30m",
    submitted: 42, 
    total: 42, 
    status: "evaluated",
    maxMarks: 20
  },
  { 
    id: "tst-3", 
    title: "Normalization Test", 
    date: "10 Jul 2026", 
    time: "02:00 PM",
    duration: "45m",
    submitted: 40, 
    total: 42, 
    status: "evaluated",
    maxMarks: 25
  }
];

export default function TeacherTests({ courseId }: TeacherTestsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for creating a test
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [maxMarks, setMaxMarks] = useState("50");

  // In a real app, fetch the course details based on the courseId
  const courseName = courseId === "cls-2" ? "Software Engineering" : "Database Management Systems";
  const batch = "Spring 2026";
  const code = courseId === "cls-2" ? "CSE-412" : "CSE-305";

  // Filter tests
  const filteredTests = mockTests.filter(tst => 
    tst.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/teacher/tests"
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
            <h1 className="text-sm font-semibold text-slate-900">{courseName}</h1>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-dark text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Create Test
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-brand-dark font-medium text-[11px] shadow-sm">
            {mockTests.length}
          </div>
          <span className="text-xs font-medium text-slate-600">Total Tests</span>
        </div>

        {/* Search */}
        <div className="relative w-full xl:w-80 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search tests..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400 shadow-sm"
          />
        </div>
      </div>

      {/* Test List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredTests.map((tst) => (
          <div key={tst.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group overflow-hidden">
            <div className="p-5 flex-1">
              
              <div className="flex items-start justify-between mb-3">
                <div className={`px-2.5 py-1 rounded-md text-[10px] font-medium uppercase tracking-wider inline-flex items-center gap-1.5 ${
                  tst.status === 'upcoming' 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {tst.status === 'upcoming' ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                  {tst.status}
                </div>
                
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-brand-dark transition-colors line-clamp-2 mb-4">
                {tst.title}
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium">{tst.date} at {tst.time}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium">Duration: <span className="text-slate-900">{tst.duration}</span></span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <FileCheck className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium">Max Marks: <span className="text-slate-900">{tst.maxMarks}</span></span>
                </div>
              </div>

              {/* Progress Bar for Attendance/Submissions */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium text-slate-600 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Appeared
                  </span>
                  <span className="text-[11px] font-medium text-brand-dark">{tst.submitted}/{tst.total}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-brand-dark transition-all duration-1000"
                    style={{ width: `${(tst.submitted / tst.total) * 100}%` }}
                  ></div>
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2">
              <button className="flex-1 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-[11px] font-medium hover:bg-slate-100 transition-colors shadow-sm">
                Edit
              </button>
              <button 
                className="flex-1 py-2 bg-brand-dark text-white rounded-lg text-[11px] font-medium hover:bg-slate-800 transition-colors shadow-sm text-center"
              >
                {tst.status === 'upcoming' ? 'Start Test' : 'Enter Marks'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Test Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-dark/10 flex items-center justify-center text-brand-dark">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Create New Test</h2>
                  <p className="text-[11px] text-slate-500">Add a class test for {code}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Test Title <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Midterm Examination"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Instructions / Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Test instructions or syllabus..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Date <span className="text-red-500">*</span></label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Time <span className="text-red-500">*</span></label>
                  <input 
                    type="time" 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Duration (mins) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="60"
                    min="5"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Total Marks <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(e.target.value)}
                    placeholder="50"
                    min="1"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  // In a real app, save the test
                  setIsModalOpen(false);
                }}
                className="px-6 py-2.5 bg-brand-dark text-white hover:bg-slate-800 rounded-xl text-xs font-medium transition-colors shadow-sm"
              >
                Create Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

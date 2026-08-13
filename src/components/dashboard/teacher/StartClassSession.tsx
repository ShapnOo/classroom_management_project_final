"use client";

import { 
  PlaySquare, 
  ChevronDown, 
  CheckCircle2, 
  History, 
  ArrowRight,
  Clock,
  Calendar,
  FileText,
  Users2,
  Check,
  X,
  AlertCircle,
  Save,
  BookOpen,
  ArrowLeft,
  CalendarDays,
  MoreVertical
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

// Mock Data
const mockClassrooms = [
  { 
    id: "cls-1", 
    name: "Database Management Systems", 
    batch: "Spring 2026 - A", 
    code: "CSE-305",
    time: "10:00 AM - 11:30 AM",
    room: "Room 402",
    progress: 68,
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    textColor: "text-blue-700"
  },
  { 
    id: "cls-2", 
    name: "Software Engineering", 
    batch: "Spring 2026 - B", 
    code: "CSE-412",
    time: "02:00 PM - 03:30 PM",
    room: "Room 305",
    progress: 74,
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50",
    textColor: "text-emerald-700"
  }
];

const mockStudents = [
  { id: "STD-001", name: "Mainul Hasan", profile: "MH" },
  { id: "STD-002", name: "Waliullah Ovi", profile: "WO" },
  { id: "STD-003", name: "Rahim Uddin", profile: "RU" },
  { id: "STD-004", name: "Karim Ahmed", profile: "KA" },
  { id: "STD-005", name: "Sarah Khan", profile: "SK" },
];

const mockMaterials = [
  "Lecture Slides (PDF)", "Code Examples (ZIP)", "Topic Overview (Doc)"
];

export default function StartClassSession() {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [topic, setTopic] = useState("3NF and BCNF Examples");
  const [description, setDescription] = useState("Exploring practical examples of Third Normal Form and Boyce-Codd Normal Form.");
  const [progress, setProgress] = useState(68);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:30");
  
  // Attendance State
  const [attendance, setAttendance] = useState<Record<string, "Present" | "Absent" | "Late">>(() => {
    const initial: Record<string, "Present" | "Absent" | "Late"> = {};
    mockStudents.forEach(s => initial[s.id] = "Present"); // Default all present
    return initial;
  });

  const selectedClass = mockClassrooms.find(c => c.id === selectedClassId);

  const markAll = (status: "Present" | "Absent" | "Late") => {
    const next: Record<string, "Present" | "Absent" | "Late"> = {};
    mockStudents.forEach(s => next[s.id] = status);
    setAttendance(next);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save
    alert(`Class Session Saved Successfully!\n\nTopic: ${topic}\nProgress: ${progress}%\nAttendance: ${Object.values(attendance).filter(a => a === 'Present').length}/${mockStudents.length} Present`);
    setSelectedClassId(null); // Go back to list after saving
  };

  if (!selectedClassId) {
    return (
      <div className="w-full mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-dark flex items-center justify-center shadow-sm shrink-0">
              <PlaySquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Select Class to Start</h1>
              <p className="text-xs text-slate-500 mt-0.5">Choose a class from your active schedule to log today's session.</p>
            </div>
          </div>
        </div>

        {/* Classroom List View */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  <th className="px-5 py-3">Course / Batch</th>
                  <th className="px-5 py-3">Schedule</th>
                  <th className="px-5 py-3">Course Progress</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {mockClassrooms.map((cls) => (
                  <tr key={cls.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => setSelectedClassId(cls.id)}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-10 rounded-full ${cls.color}`}></div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm mb-0.5 group-hover:text-brand-dark transition-colors">{cls.name}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-bold text-slate-500">{cls.code}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${cls.lightColor} ${cls.textColor}`}>
                              {cls.batch}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-700">{cls.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-[10px]">
                        <Users2 className="w-3 h-3" />
                        <span>{mockStudents.length} Students enrolled</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 w-48">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${cls.color} rounded-full`} 
                            style={{ width: `${cls.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600">{cls.progress}%</span>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1">Ready for Class #09</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedClassId(cls.id); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-dark text-white rounded-md text-[11px] font-bold hover:bg-slate-800 transition-colors shadow-sm"
                      >
                        <PlaySquare className="w-3.5 h-3.5 fill-current" />
                        Start Session
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Page Header (Form View) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSelectedClassId(null)}
            className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${selectedClass?.lightColor} ${selectedClass?.textColor}`}>
                {selectedClass?.code} • {selectedClass?.batch}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{selectedClass?.name}</h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Continuity & Session Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Continuity Context (Previous Class) */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-slate-500" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Course Continuity</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Last Class */}
              <div className="bg-white rounded-lg p-4 border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300"></div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Previous Session (Class #08)</p>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Entity-Relationship Model</h3>
                <p className="text-xs text-slate-600 mb-3">Completed 100% • 05 Aug 2026</p>
                <Link href="#" className="text-xs font-bold text-brand-dark hover:underline flex items-center gap-1">
                  View Notes <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Recommended Next */}
              <div className="bg-white rounded-lg p-4 border border-brand-dark/20 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-dark"></div>
                <div className="absolute top-2 right-2 flex gap-1">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-dark opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-dark"></span>
                  </span>
                </div>
                <p className="text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Recommended Next Topic</p>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Normalization (1NF to 3NF)</h3>
                <p className="text-xs text-slate-600 mb-3">Based on your syllabus mapping.</p>
                <button type="button" onClick={() => setTopic("Normalization (1NF to 3NF)")} className="text-xs font-bold text-brand-dark hover:underline flex items-center gap-1">
                  Use this Topic <CheckCircle2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Today's Session Form */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-dark" />
                Today's Session Details (Class #09)
              </h2>
            </div>
            
            <div className="p-5 space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark outline-none text-slate-700" />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Start Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark outline-none text-slate-700" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">End Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark outline-none text-slate-700" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Topic Covered <span className="text-red-500">*</span></label>
                <input required type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="What are you teaching today?" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark outline-none" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Session Summary / Notes</label>
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Add private notes or summary of what was discussed..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark outline-none resize-none"></textarea>
              </div>

              {/* Progress Slider */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Overall Course Completion</label>
                  <span className="text-sm font-bold text-brand-dark">{progress}%</span>
                </div>
                <div className="relative pt-1">
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={progress} 
                    onChange={e => setProgress(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-dark" 
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-medium">
                    <span>0% (Start)</span>
                    <span>50% (Midterm)</span>
                    <span>100% (Final)</span>
                  </div>
                </div>
              </div>

              {/* Materials Attached */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Materials Used (Optional)</label>
                  <button type="button" className="text-[10px] font-bold text-brand-dark hover:underline">Browse Library</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {mockMaterials.map((mat, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-md text-[11px] font-medium shadow-sm">
                      <FileText className="w-3 h-3 text-slate-400" />
                      {mat}
                      <button type="button" className="ml-1 text-slate-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  <button type="button" className="inline-flex items-center justify-center px-3 py-1.5 bg-slate-50 border border-slate-200 border-dashed text-slate-500 hover:text-brand-dark hover:border-brand-dark hover:bg-brand-dark/5 transition-colors rounded-md text-[11px] font-bold">
                    + Attach File
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Attendance */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden sticky top-6">
            
            <div className="bg-slate-900 text-white p-4">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Users2 className="w-4 h-4 opacity-80" />
                Take Attendance
              </h2>
              <div className="flex justify-between items-end mt-3">
                <div>
                  <p className="text-[11px] text-slate-300 font-medium mb-0.5">Students Present</p>
                  <p className="text-2xl font-bold leading-none">
                    {Object.values(attendance).filter(a => a === 'Present').length} <span className="text-sm font-normal text-slate-400">/ {mockStudents.length}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-medium text-white/80 border border-white/10">
                    {Object.values(attendance).filter(a => a === 'Late').length} Late
                  </span>
                  <span className="px-2 py-1 bg-red-500/20 rounded text-[10px] font-medium text-red-200 border border-red-500/20">
                    {Object.values(attendance).filter(a => a === 'Absent').length} Absent
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-[11px] font-bold text-slate-600">Quick Actions</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => markAll("Present")} className="text-[10px] font-bold text-brand-dark hover:underline">Mark All Present</button>
                <span className="text-slate-300">|</span>
                <button type="button" onClick={() => markAll("Absent")} className="text-[10px] font-bold text-slate-500 hover:underline">All Absent</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1.5">
                {mockStudents.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600 shrink-0">
                        {student.profile}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 leading-tight">{student.name}</p>
                        <p className="text-[9px] text-slate-500">{student.id}</p>
                      </div>
                    </div>
                    
                    <div className="flex bg-slate-100 rounded-md p-0.5 shrink-0">
                      <button 
                        type="button"
                        onClick={() => setAttendance(prev => ({...prev, [student.id]: "Present"}))}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold transition-colors ${attendance[student.id] === 'Present' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        P
                      </button>
                      <button 
                        type="button"
                        onClick={() => setAttendance(prev => ({...prev, [student.id]: "Late"}))}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold transition-colors ${attendance[student.id] === 'Late' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        L
                      </button>
                      <button 
                        type="button"
                        onClick={() => setAttendance(prev => ({...prev, [student.id]: "Absent"}))}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold transition-colors ${attendance[student.id] === 'Absent' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        A
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-white">
              <button 
                type="submit" 
                className="w-full flex items-center justify-center gap-2 py-3 bg-brand-dark text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                <Save className="w-4 h-4" />
                Save & Complete Class
              </button>
              <p className="text-center text-[10px] text-slate-400 mt-2 font-medium flex items-center justify-center gap-1">
                <AlertCircle className="w-3 h-3" />
                This will finalize the session and update student portals.
              </p>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
}

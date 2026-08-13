"use client";

import { 
  FolderOpen,
  Search,
  Upload,
  MoreVertical,
  FileText,
  Video,
  Code,
  Download,
  Trash2,
  Edit2,
  X,
  FileDown,
  MonitorPlay,
  ArrowLeft
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface TeacherMaterialsProps {
  courseId?: string;
}

// Mock Data
const mockMaterials = [
  { id: "mat-1", name: "Normalization.pdf", type: "PDF", classNo: "Class #08", date: "05 Aug 2026", size: "2.4 MB" },
  { id: "mat-2", name: "DBMS Lecture 08.pptx", type: "Slides", classNo: "Class #08", date: "05 Aug 2026", size: "5.1 MB" },
  { id: "mat-3", name: "Normalization.sql", type: "Practical", classNo: "Class #09", date: "12 Aug 2026", size: "1.1 MB" },
  { id: "mat-4", name: "ER Diagram Intro.mp4", type: "Video", classNo: "Class #02", date: "13 Jul 2026", size: "45.0 MB" },
  { id: "mat-5", name: "Entity Types Summary.docx", type: "Lecture Notes", classNo: "Class #02", date: "13 Jul 2026", size: "850 KB" }
];

const filterTypes = ["All", "Lecture Notes", "Slides", "PDF", "Video", "Practical", "Reference"];

export default function TeacherMaterials({ courseId }: TeacherMaterialsProps) {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // In a real app, fetch the course details based on the courseId
  const courseName = courseId === "cls-2" ? "Software Engineering" : "Database Management Systems";
  const batch = "Spring 2026";
  const code = courseId === "cls-2" ? "CSE-412" : "CSE-305";

  // Helper for file icons based on type
  const getFileIcon = (type: string) => {
    switch(type) {
      case "PDF": return <FileText className="w-6 h-6 text-red-500" />;
      case "Slides": return <MonitorPlay className="w-6 h-6 text-orange-500" />;
      case "Practical": return <Code className="w-6 h-6 text-blue-500" />;
      case "Video": return <Video className="w-6 h-6 text-purple-500" />;
      case "Lecture Notes": return <FileText className="w-6 h-6 text-blue-500" />;
      default: return <FileDown className="w-6 h-6 text-slate-500" />;
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    // handle files here
  };

  return (
    <div className="w-full mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/teacher/materials"
            className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 transition-colors shadow-sm shrink-0"
            title="Back to Course List"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-dark to-slate-800 flex items-center justify-center shadow-sm shrink-0">
            <FolderOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded uppercase bg-brand-dark/10 text-brand-dark">
                {code} • {batch}
              </span>
            </div>
            <h1 className="text-lg font-medium text-slate-900 tracking-tight">{courseName} Materials</h1>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-dark text-white rounded-lg text-[13px] font-medium hover:bg-slate-800 transition-colors shadow-sm shrink-0"
          >
            <Upload className="w-4 h-4" />
            Upload Material
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
        
        {/* Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {filterTypes.map(type => (
            <button
              key={type}
              onClick={() => setSelectedFilter(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm ${
                selectedFilter === type 
                  ? "bg-brand-dark text-white" 
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full xl:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search materials..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400 shadow-sm"
          />
        </div>
        
      </div>

      {/* Material List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mockMaterials.map((mat) => (
          <div key={mat.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-4 group flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                {getFileIcon(mat.type)}
              </div>
              <div className="relative group/menu">
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
                {/* Dropdown Mock */}
                <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 shadow-lg rounded-lg overflow-hidden opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
                  <button className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-slate-400" /> Download
                  </button>
                  <button className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <Edit2 className="w-3.5 h-3.5 text-slate-400" /> Rename
                  </button>
                  <button className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" /> Delete
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mb-4 flex-1">
              <h3 className="text-[13px] font-medium text-slate-900 line-clamp-2 mb-1 group-hover:text-brand-dark transition-colors" title={mat.name}>
                {mat.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded uppercase bg-slate-100 text-slate-600">
                  {mat.type}
                </span>
                <span className="text-[10px] font-medium text-slate-400">
                  {mat.size}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-medium text-slate-500">
              <span className="text-brand-dark font-medium">{mat.classNo}</span>
              <span>{mat.date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-medium text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-brand-dark" />
                Upload Course Material
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
              
              {/* Target Class Context */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">Upload Destination</label>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-slate-900 line-clamp-1">{courseName}</p>
                    <p className="text-xs font-medium text-slate-500">{batch}</p>
                  </div>
                </div>
              </div>

              {/* Drag and Drop Area */}
              <div 
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all ${
                  dragActive ? "border-brand-dark bg-brand-dark/5" : "border-slate-300 bg-slate-50 hover:bg-slate-100/50"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center mb-4">
                  <Upload className={`w-5 h-5 ${dragActive ? "text-brand-dark" : "text-slate-400"}`} />
                </div>
                <h3 className="text-[13px] font-medium text-slate-900 mb-1">Click to upload or drag and drop</h3>
                <p className="text-xs text-slate-500 mb-4">PDF, PPTX, MP4, ZIP (Max 50MB)</p>
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                  Select Files
                </button>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Material Type</label>
                  <select className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2.5 px-3 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark">
                    {filterTypes.filter(t => t !== "All").map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Link to Session (Optional)</label>
                  <select className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2.5 px-3 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark">
                    <option value="">None (General)</option>
                    <option value="class-9">Class #09</option>
                    <option value="class-8">Class #08</option>
                    <option value="class-7">Class #07</option>
                  </select>
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-lg text-[13px] font-medium text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  alert("Material uploaded successfully!");
                  setIsModalOpen(false);
                }}
                className="px-6 py-2.5 bg-brand-dark text-white rounded-lg text-[13px] font-medium hover:bg-slate-800 transition-colors shadow-sm"
              >
                Upload File
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}

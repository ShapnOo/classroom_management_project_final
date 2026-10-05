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
import { useState, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";

interface TeacherMaterialsProps {
  courseId?: string; // classroomId
}

const filterTypes = ["All", "Lecture Notes", "Slides", "PDF", "Video", "Practical", "Reference"];

import { TableSkeleton } from "@/components/ui/Skeleton";

export default function TeacherMaterials({ courseId }: TeacherMaterialsProps) {
  const {
    getMyClassroomViews, materials, isLoading, addMaterial, deleteMaterial,
    fetchClassrooms, fetchCourses, fetchBatches, fetchMaterials
  } = useStore();

  useEffect(() => {
    fetchClassrooms();
    fetchCourses();
    fetchBatches();
    fetchMaterials(courseId);
  }, [courseId]);

  if (isLoading && materials.length === 0) {
    return <TableSkeleton rows={5} cols={4} />;
  }

  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newFileType, setNewFileType] = useState("PDF");

  const myClassrooms = getMyClassroomViews();
  const view = courseId ? myClassrooms.find(v => v.classroom.id === courseId) : myClassrooms[0];

  const courseName = view?.course.title || "Database Management Systems";
  const batch = view?.batch.name || "Spring 2026";
  const code = view?.course.code || "CSE-305";

  // Filter materials for this classroom / course
  const currentMaterials = materials.filter(m => !courseId || m.classroomId === courseId || m.courseId === view?.course.id);

  const formattedMaterials = currentMaterials.map(m => ({
    id: m.id,
    name: m.title || m.fileName,
    type: m.fileType || "PDF",
    classNo: m.description ? m.description.slice(0, 12) : "Class Resource",
    date: m.uploadedAt ? new Date(m.uploadedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Recent",
    size: m.fileSize || "1.5 MB",
  }));

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
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all shadow-sm ${
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
        {formattedMaterials.length === 0 ? (
          <div className="col-span-full py-12 text-center text-[11px] text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No course materials uploaded yet. Click "Upload Material" to share slides, PDFs, or lecture notes.
          </div>
        ) : formattedMaterials.filter(mat => selectedFilter === "All" || mat.type === selectedFilter).filter(mat => mat.name.toLowerCase().includes(searchQuery.toLowerCase())).map((mat) => (
          <div key={mat.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-4 group flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                {getFileIcon(mat.type)}
              </div>
              <div className="relative group/menu">
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
                {/* Dropdown menu */}
                <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 shadow-lg rounded-lg overflow-hidden opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
                  <button onClick={() => deleteMaterial(mat.id)} className="w-full text-left px-4 py-2 text-[11px] font-medium text-red-600 hover:bg-red-50 flex items-center gap-2">
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

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-500">
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
              <h2 className="text-xs font-medium text-slate-900 flex items-center gap-2">
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
                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2 block">Upload Destination</label>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-slate-900 line-clamp-1">{courseName}</p>
                    <p className="text-[11px] font-medium text-slate-500">{batch}</p>
                  </div>
                </div>
              </div>

              {/* Title & description inputs */}
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-700 block mb-1">Material Title / Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Chapter 4 Relational Algebra Notes"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 text-[11px] border border-slate-200 rounded-lg focus:outline-none focus:border-brand-dark"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 block mb-1">Short Note / Topic (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Class #08"
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    className="w-full px-3 py-2 text-[11px] border border-slate-200 rounded-lg focus:outline-none focus:border-brand-dark"
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-700">Material Type</label>
                  <select
                    value={newFileType}
                    onChange={e => setNewFileType(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2.5 px-3 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark"
                  >
                    {filterTypes.filter(t => t !== "All").map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
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
                onClick={async () => {
                  if (!newTitle.trim()) return;
                  await addMaterial({
                    classroomId: courseId || view?.classroom.id,
                    courseId: view?.course.id,
                    title: newTitle,
                    description: newDesc || "Course Resource",
                    fileName: `${newTitle.replace(/\s+/g, '_')}.${newFileType === "PDF" ? "pdf" : "docx"}`,
                    fileType: newFileType,
                    fileSize: "2.4 MB",
                  });
                  setIsModalOpen(false);
                  setNewTitle("");
                  setNewDesc("");
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

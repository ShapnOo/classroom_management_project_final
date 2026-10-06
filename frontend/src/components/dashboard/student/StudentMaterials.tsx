"use client";

import { 
  FolderOpen,
  Search,
  FileText,
  Video,
  Code,
  Download,
  FileDown,
  MonitorPlay,
  BookOpen
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useStore } from "@/lib/store";
import { CURRENT_STUDENT_BATCH_ID } from "@/lib/seedData";

export default function StudentMaterials() {
  const {
    classrooms, courses, materials, fetchClassrooms, fetchCourses, fetchMaterials
  } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFileType, setSelectedFileType] = useState("All");

  useEffect(() => {
    fetchClassrooms();
    fetchCourses();
    fetchMaterials();
  }, []);

  // Filter materials for student's batch
  const myClassroomIds = classrooms.filter((c) => c.batchId === CURRENT_STUDENT_BATCH_ID).map((c) => c.id);

  const studentMaterials = materials.filter(
    (m) => !m.classroomId || myClassroomIds.includes(m.classroomId)
  );

  const formattedMaterials = useMemo(() => {
    return studentMaterials.map((m) => {
      const classroom = classrooms.find((c) => c.id === m.classroomId);
      const course = courses.find((co) => co.id === m.courseId || co.id === classroom?.courseId);

      return {
        id: m.id,
        title: m.title || m.fileName,
        description: m.description || "Lecture Resource",
        fileName: m.fileName,
        fileType: m.fileType || "PDF",
        fileSize: m.fileSize || "1.8 MB",
        uploadedAt: m.uploadedAt ? new Date(m.uploadedAt).toLocaleDateString("en-GB") : "Recent",
        courseCode: course?.code || "Course",
        courseTitle: course?.title || "Class Resource",
      };
    });
  }, [studentMaterials, classrooms, courses]);

  const filtered = useMemo(() => {
    return formattedMaterials.filter((m) => {
      if (selectedFileType !== "All" && m.fileType !== selectedFileType) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.courseCode.toLowerCase().includes(q) ||
        m.courseTitle.toLowerCase().includes(q) ||
        m.fileName.toLowerCase().includes(q)
      );
    });
  }, [formattedMaterials, selectedFileType, searchQuery]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case "PDF": return <FileText className="w-5 h-5 text-red-500" />;
      case "Slides": return <MonitorPlay className="w-5 h-5 text-orange-500" />;
      case "Practical": return <Code className="w-5 h-5 text-blue-500" />;
      case "Video": return <Video className="w-5 h-5 text-purple-500" />;
      default: return <FileDown className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="w-full mx-auto space-y-5 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-brand-dark" />
            Course Materials & Lecture Resources
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Access lecture slides, reading materials, PDFs, and notes uploaded by your course faculty
          </p>
        </div>

        {/* Search Input Box */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search materials by title or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400 shadow-xs"
          />
        </div>
      </div>

      {/* File Type Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
        {["All", "PDF", "Slides", "Lecture Notes", "Video", "Practical"].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedFileType(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedFileType === type
                ? "bg-brand-dark text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Clean Table List View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Resource Title</th>
                <th className="px-5 py-3.5">Course</th>
                <th className="px-5 py-3.5">Type & Size</th>
                <th className="px-5 py-3.5">Uploaded Date</th>
                <th className="px-5 py-3.5 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <FolderOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No course materials found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">No files match the selected filter or search query.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((mat) => (
                  <tr key={mat.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 border border-slate-200/60 shrink-0">
                          {getFileIcon(mat.fileType)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-brand-dark transition-colors">{mat.title}</p>
                          <p className="text-[10px] text-slate-400 font-normal">{mat.description}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {mat.courseCode}
                        </span>
                        <span className="text-slate-600 line-clamp-1">{mat.courseTitle}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-600">
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded uppercase">
                        {mat.fileType}
                      </span>
                      <span className="ml-2 text-slate-400 text-[11px]">{mat.fileSize}</span>
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-500">
                      {mat.uploadedAt}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => alert(`Downloading ${mat.fileName}...`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-brand-dark/40 text-brand-dark font-semibold text-xs rounded-lg transition-all shadow-2xs hover:bg-brand-dark/5"
                      >
                        <Download className="w-3.5 h-3.5 text-brand-dark" />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

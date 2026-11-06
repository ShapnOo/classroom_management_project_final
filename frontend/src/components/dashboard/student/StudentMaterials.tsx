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
  BookOpen,
  Eye,
  Clock,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Tv
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import { TableSkeleton } from "@/components/ui/Skeleton";
import SlideDeckPresenterModal from "@/components/dashboard/teacher/SlideDeckPresenterModal";

export default function StudentMaterials() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFileType, setSelectedFileType] = useState("All");

  // In-App Slide Presenter modal for students
  const [presenterMaterial, setPresenterMaterial] = useState<any | null>(null);
  const [isPresenterOpen, setIsPresenterOpen] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = () => {
    setLoading(true);
    api.getStudentMaterials()
      .then((data) => {
        setMaterials(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.warn("Could not load student materials API:", err);
      })
      .finally(() => setLoading(false));
  };

  const formattedMaterials = useMemo(() => {
    return materials.map((m) => {
      const type = (m.file_type || m.fileType || "PDF").toLowerCase();
      let normType = "PDF";
      if (type.includes("slide") || type.includes("ppt")) normType = "Slides";
      else if (type.includes("code") || type.includes("sql") || type.includes("plain")) normType = "Code";
      else if (type.includes("json") || type.includes("notebook")) normType = "Notebook";

      return {
        id: m.id,
        title: m.title || m.file_name || "Lecture Material",
        description: m.description || "Lecture study resource and reference document.",
        fileName: m.file_name || m.fileName || "material.pdf",
        fileType: normType,
        rawFileType: m.file_type,
        fileSize: m.file_size || m.fileSize || "1.8 MB",
        uploadedAt: m.uploaded_at ? new Date(m.uploaded_at).toLocaleDateString("en-GB") : "Recent",
        courseCode: m.course_code || "Course",
        courseTitle: m.course_title || "Academic Course",
        uploaderName: m.uploader_name || "Course Instructor",
        currentSlide: m.current_slide || m.last_slide || 1,
        totalSlides: m.deck_total_slides || m.total_slides || 20,
        fileUrl: m.file_url || (m.file_name ? `/uploads/${m.file_name}` : "/uploads/sample.pdf"),
      };
    });
  }, [materials]);

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
      case "PDF": return <FileText className="w-5 h-5 text-rose-500" />;
      case "Slides": return <MonitorPlay className="w-5 h-5 text-amber-500" />;
      case "Code": return <Code className="w-5 h-5 text-blue-500" />;
      case "Notebook": return <BookOpen className="w-5 h-5 text-emerald-500" />;
      default: return <FileDown className="w-5 h-5 text-slate-500" />;
    }
  };

  const handleOpenSlideViewer = (item: any) => {
    setPresenterMaterial({
      id: item.id,
      title: item.title,
      description: item.description,
      fileType: item.fileType,
      fileName: item.fileName,
      pdfUrl: item.fileUrl,
      fileUrl: item.fileUrl,
      totalSlides: item.totalSlides,
      lastSlide: item.currentSlide,
    });
    setIsPresenterOpen(true);
  };

  if (loading && materials.length === 0) {
    return <TableSkeleton rows={6} cols={4} />;
  }

  return (
    <div className="w-full mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-brand-dark" />
            Course Materials & Lecture Slides ({materials.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Access lecture slide decks, syllabus reading materials, and code scripts uploaded by faculty
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents or slides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400 shadow-xs"
            />
          </div>

          <button
            type="button"
            onClick={loadMaterials}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-xs"
            title="Refresh Materials"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Filter Pills ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {["All", "Slides", "PDF", "Code", "Notebook"].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setSelectedFileType(type)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              selectedFileType === type
                ? "bg-brand-dark text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* ── Materials Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const isSlide = item.fileType === "Slides";

          return (
            <div 
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-brand-dark/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                
                {/* Header & Badges */}
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl shrink-0">
                    {getFileIcon(item.fileType)}
                  </div>

                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-brand-dark bg-brand-dark/10 px-2 py-0.5 rounded">
                        {item.courseCode}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                        {item.fileSize}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug mt-1">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Slide Memory Progress Badge (For PPTX Decks) */}
                {isSlide && (
                  <div className="p-2.5 bg-amber-50/80 border border-amber-200/70 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Tv className="w-3.5 h-3.5 text-amber-700" />
                      <span className="text-[11px] font-bold text-amber-900">
                        Class Lecture Progress:
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                      Slide {item.currentSlide} of {item.totalSlides}
                    </span>
                  </div>
                )}

                <div className="text-[11px] text-slate-400 space-y-0.5 pt-1">
                  <div>Instructor: <strong className="text-slate-600">{item.uploaderName}</strong></div>
                  <div>Uploaded: {item.uploadedAt}</div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3.5 border-t border-slate-200/80 flex items-center gap-2">
                {isSlide ? (
                  <button
                    type="button"
                    onClick={() => handleOpenSlideViewer(item)}
                    className="flex-1 py-1.5 bg-brand-dark hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>Open Slide Viewer</span>
                  </button>
                ) : (
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 bg-brand-dark hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview Document</span>
                  </a>
                )}

                <a
                  href={item.fileUrl}
                  download={item.fileName}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors shadow-xs"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border border-slate-200">
            <p className="text-sm font-semibold text-slate-700">No matching study materials found</p>
            <p className="text-xs text-slate-500 mt-1">Try selecting &apos;All&apos; or adjusting your search keyword.</p>
          </div>
        )}
      </div>

      {/* ── Slide Presenter Runner Modal for Students ───────────────────────── */}
      {isPresenterOpen && presenterMaterial && (
        <SlideDeckPresenterModal
          material={presenterMaterial}
          isOpen={isPresenterOpen}
          onClose={() => setIsPresenterOpen(false)}
          initialSlide={presenterMaterial?.lastSlide || 1}
        />
      )}

    </div>
  );
}

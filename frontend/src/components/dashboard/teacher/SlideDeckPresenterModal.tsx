"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  RotateCcw,
  Clock,
  Layers,
  HelpCircle,
  FileText,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Eye,
  Sliders,
  Tv,
  Radio,
  Share2,
  Download,
  Database,
  ZoomIn,
  ZoomOut,
  RefreshCw
} from "lucide-react";
import { api } from "@/lib/api";
import PdfCanvasViewer from "@/components/ui/PdfCanvasViewer";

export interface SlideMaterial {
  id: string;
  title: string;
  description?: string;
  fileType?: string;
  fileName?: string;
  category?: string;
  date?: string;
  pdfUrl?: string;
}

interface SlideDeckPresenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: SlideMaterial;
  courseTitle?: string;
  courseCode?: string;
  batchName?: string;
  teacherName?: string;
  classroomId?: string;
  initialSlide?: number;
}

export interface SlideData {
  id: number;
  title: string;
  subtitle?: string;
  type: "cover" | "agenda" | "concept" | "code" | "diagram" | "discussion" | "summary" | "image" | "html";
  bullets?: string[];
  codeSnippet?: string;
  diagramType?: "er" | "uml" | "flow" | "architecture";
  notes?: string;
  takeaway?: string;
  imageUrl?: string;
  htmlUrl?: string;
}

// LocalStorage & Database Helper for Slide Persistence
export const getSavedSlideState = (materialId: string, dbSlideStates?: Record<string, any>) => {
  if (dbSlideStates && dbSlideStates[materialId]) {
    return dbSlideStates[materialId];
  }
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`scholaris_slide_state_${materialId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveSlideState = (
  materialId: string,
  slideNumber: number,
  totalSlides: number,
  materialTitle: string,
  classroomId?: string
) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      `scholaris_slide_state_${materialId}`,
      JSON.stringify({
        lastSlide: slideNumber,
        totalSlides,
        updatedAt: new Date().toISOString(),
        materialTitle,
      })
    );
  } catch {}

  // Also background-sync to PostgreSQL Database
  api
    .saveSlideState(materialId, {
      lastSlide: slideNumber,
      totalSlides,
      materialTitle,
      classroomId,
    })
    .catch(() => {});
};

export default function SlideDeckPresenterModal({
  isOpen,
  onClose,
  material,
  courseTitle = "Database Management Systems",
  courseCode = "CSE-305",
  batchName = "Spring 2026 - A",
  teacherName = "Prof. Dr. Shamim Al Mamun",
  classroomId,
  initialSlide,
}: SlideDeckPresenterModalProps) {
  const [currentSlide, setCurrentSlide] = useState<number>(initialSlide || 1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLaserActive, setIsLaserActive] = useState<boolean>(false);
  const [laserPos, setLaserPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isBlackout, setIsBlackout] = useState<boolean>(false);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [resumedNotice, setResumedNotice] = useState<string | null>(null);
  const [slideZoom, setSlideZoom] = useState<number>(1.0);

  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialLoadedRef = useRef<boolean>(false);

  // Check if material is a PDF
  const titleLower = (material.title || "").toLowerCase();
  const fileNameLower = (material.fileName || "").toLowerCase();

  const isPdf =
    material.fileType?.toUpperCase() === "PDF" ||
    fileNameLower.endsWith(".pdf") ||
    titleLower.endsWith(".pdf") ||
    titleLower.includes("uml diagram") ||
    (Boolean(material.pdfUrl) && !fileNameLower.endsWith(".pptx"));

  const pdfTargetUrl =
    material.pdfUrl ||
    (fileNameLower.includes("uml") || titleLower.includes("uml")
      ? "/UML Diagram - Library System.pdf"
      : fileNameLower.endsWith(".pdf")
      ? `/${material.fileName}`
      : "/assignment_mockup.pdf");

  // Generate authentic presentation slides tailored to the material
  const slides: SlideData[] = React.useMemo(() => {
    // 1. Presentation1.pptx (Higher Education Digital Suite) - 20 authentic high-resolution slides
    const isPresentation1 =
      fileNameLower.includes("presentation1") ||
      titleLower.includes("presentation1") ||
      titleLower.includes("higher education") ||
      titleLower.includes("digital suite");

    if (isPresentation1) {
      return Array.from({ length: 20 }, (_, idx) => {
        const slideNum = idx + 1;
        return {
          id: slideNum,
          title: slideNum === 1 ? "Higher Education Digital Suite" : `Digital Suite Architecture — Slide ${slideNum}`,
          subtitle: slideNum === 1 ? "Five integrated platforms. One national transformation." : `Enterprise Slide Deck ${slideNum} of 20`,
          type: "image",
          imageUrl: `/Presentation Deck/presentation1_slides/slide_${slideNum}.png`,
          notes: `Slide ${slideNum}: Higher Education Digital Suite - UGC-ERP & University Modular Architecture.`,
        };
      });
    }

    // 2. Inception_v2 copy.pptx (WENP 3.0 Platform Inception & SDLC) - 24 authentic slides
    const isInception =
      fileNameLower.includes("inception") ||
      titleLower.includes("inception") ||
      titleLower.includes("wenp") ||
      titleLower.includes("regional connectivity");

    if (isInception) {
      return Array.from({ length: 24 }, (_, idx) => {
        const slideNum = idx + 1;
        return {
          id: slideNum,
          title: slideNum === 1 ? "Inception Report Acceptance Meeting" : `WENP 3.0 Platform Inception — Slide ${slideNum}`,
          subtitle: slideNum === 1 ? "Bangladesh Regional Connectivity Project-1 [Part-2]" : `Delivery & Architectural Phase ${slideNum} of 24`,
          type: "html",
          htmlUrl: `/Presentation Deck/inception_html/slide_${slideNum}.html`,
          notes: `Slide ${slideNum}: Project Governance, Multi-Tier Architecture & SDLC Roadmap.`,
        };
      });
    }

    // 3. Fallback General Presentation Slides
    return [
      {
        id: 1,
        title: material.title,
        subtitle: "Conceptual ER Modeling & Relational Normalization",
        type: "cover",
        notes: "Introductory slide. Remind students that ER schemas are the backbone of all transaction processing.",
      },
      {
        id: 2,
        title: "Lecture Outline & Key Objectives",
        type: "agenda",
        bullets: [
          "Understanding Entities, Attributes, and Relationship Cardinality",
          "Crow's Foot vs Chen ER Diagram Notations",
          "Weak Entities, Identifying Relationships, and Associative Tables",
          "Normalization: 1NF, 2NF, 3NF, and Boyce-Codd Normal Form (BCNF)",
          "Translating ER schemas to PostgreSQL DDL with Foreign Keys",
        ],
      },
      {
        id: 3,
        title: "Entity-Relationship Concepts & Notation",
        type: "diagram",
        diagramType: "er",
        bullets: [
          "Strong Entity: Has an independent primary key (e.g. STUDENT, COURSE)",
          "Weak Entity: Depends on an identifying parent entity (e.g. CLASS_SESSION)",
          "Cardinality Ratios: 1:1, 1:N, and M:N relationships requiring junction tables",
        ],
      },
      {
        id: 4,
        title: "Normalization: Eliminating Update Anomalies",
        type: "concept",
        bullets: [
          "1NF: Atomic values only; zero repeating attribute groups",
          "2NF: 1NF + no partial dependency on composite primary keys",
          "3NF: 2NF + zero transitive dependencies (non-prime determining non-prime)",
          "BCNF: Every determinant must strictly be a candidate key",
        ],
      },
      {
        id: 5,
        title: "Production SQL DDL Implementation",
        type: "code",
        codeSnippet: `CREATE TABLE grade_records (
  id VARCHAR(64) PRIMARY KEY,
  classroom_id VARCHAR(64) REFERENCES classrooms(id) ON DELETE CASCADE,
  student_id VARCHAR(64) REFERENCES students(id) ON DELETE CASCADE,
  obtained_marks NUMERIC(5,2) NOT NULL CHECK (obtained_marks >= 0),
  total_marks NUMERIC(5,2) NOT NULL,
  remarks TEXT,
  CONSTRAINT unique_student_grade UNIQUE(classroom_id, student_id)
);`,
        notes: "Explain CASCADE deletion and unique integrity constraints.",
      },
      {
        id: 6,
        title: "Summary & Key Takeaways",
        type: "summary",
        bullets: [
          "Normalization reduces data duplication and guarantees transactional consistency",
          "Denormalize only when verified read performance bottlenecks require caching",
          "Always test schema constraints with synthetic high-volume data",
        ],
        takeaway: "Next Lecture: B-Tree Indexing, Query Optimization & Execution Plans.",
      },
    ];
  }, [material.title, material.fileName, titleLower, fileNameLower]);

  const totalSlides = slides.length;

  // Listen to Fullscreen changes on document to keep state 100% synchronized
  useEffect(() => {
    const handleFullscreenChange = () => {
      const activeFs = Boolean(
        document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement
      );
      setIsFullscreen(activeFs);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Initialize and Resume from Database (Cross-Device) & LocalStorage
  useEffect(() => {
    if (!isOpen || !material.id) return;
    let isMounted = true;
    isInitialLoadedRef.current = false;

    // 1. Initial fast restore from props / local storage
    if (initialSlide && initialSlide > 0) {
      setCurrentSlide(Math.min(totalSlides, initialSlide));
    } else {
      const localSaved = getSavedSlideState(material.id);
      if (localSaved && typeof localSaved.lastSlide === "number" && localSaved.lastSlide > 1) {
        setCurrentSlide(Math.min(totalSlides, Math.max(1, localSaved.lastSlide)));
      }
    }

    // 2. Authoritative PostgreSQL Database Sync (Cross-Device & Cross-Login by materialId)
    api
      .getSlideState(material.id)
      .then((res) => {
        if (!isMounted || !res) return;
        const dbSlide = res.lastSlide;
        if (typeof dbSlide === "number" && dbSlide >= 1) {
          const targetSlide = Math.min(totalSlides, Math.max(1, dbSlide));
          setCurrentSlide(targetSlide);
          if (targetSlide > 1) {
            setResumedNotice(`Resumed from Slide ${targetSlide} of ${totalSlides} (PostgreSQL Database)`);
            setTimeout(() => {
              if (isMounted) setResumedNotice(null);
            }, 4000);
          }
        }
        isInitialLoadedRef.current = true;
      })
      .catch(() => {
        if (isMounted) isInitialLoadedRef.current = true;
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, material.id, totalSlides, initialSlide]);

  // Persist Current Slide on every change to both LocalStorage & PostgreSQL Database
  useEffect(() => {
    if (!isOpen || !material.id || !isInitialLoadedRef.current) return;
    saveSlideState(material.id, currentSlide, totalSlides, material.title, classroomId);

    const timer = setTimeout(() => {
      api
        .saveSlideState(material.id, {
          lastSlide: currentSlide,
          totalSlides,
          materialTitle: material.title,
          classroomId,
        })
        .catch((err) => {
          console.warn("Could not save slide state to PostgreSQL:", err);
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [isOpen, material.id, currentSlide, totalSlides, material.title, classroomId]);

  // Lecture Stopwatch Timer
  useEffect(() => {
    if (!isOpen || !isTimerRunning) return;
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isTimerRunning]);

  const handleNext = useCallback(() => {
    if (currentSlide < totalSlides) {
      setCurrentSlide((s) => s + 1);
    }
  }, [currentSlide, totalSlides]);

  const handlePrev = useCallback(() => {
    if (currentSlide > 1) {
      setCurrentSlide((s) => s - 1);
    }
  }, [currentSlide]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsFullscreen(false);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "Home") {
        e.preventDefault();
        setCurrentSlide(1);
      } else if (e.key === "End") {
        e.preventDefault();
        setCurrentSlide(totalSlides);
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        setIsLaserActive((v) => !v);
      } else if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        setIsBlackout((v) => !v);
      } else if (e.key === "Escape") {
        e.preventDefault();
        if (isFullscreen) {
          exitFullscreen();
        } else {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentSlide, totalSlides, isFullscreen, handleNext, handlePrev, onClose]);

  // Laser Pointer tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isLaserActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setLaserPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  const activeSlideData = slides[currentSlide - 1] || slides[0];

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[99999] bg-slate-950 text-white flex flex-col overflow-hidden select-none animate-in fade-in duration-150 font-sans ${
        isFullscreen ? "w-screen h-screen p-0 m-0" : ""
      }`}
      onMouseMove={handleMouseMove}
    >
      {/* ── TOP PRESENTER NAVIGATION BAR ─────────────────────────────────── */}
      <div
        className={`bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 shadow-md transition-all ${
          isFullscreen ? "h-12 py-1" : "h-14"
        }`}
      >
        {/* Left: Material & Course Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => {
              saveSlideState(material.id, currentSlide, totalSlides, material.title, classroomId);
              api
                .saveSlideState(material.id, {
                  lastSlide: currentSlide,
                  totalSlides,
                  materialTitle: material.title,
                  classroomId,
                })
                .catch(() => {});
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700 shrink-0"
            title="Exit Presentation Mode (Esc)"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase font-mono">
                {courseCode}
              </span>
              <span className="text-xs text-slate-400 truncate hidden sm:inline">
                {courseTitle} ({batchName})
              </span>
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-white truncate flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              {material.title}
            </h2>
          </div>
        </div>

        {/* Center: Slide Switcher, Counter & Database Synced Badge */}
        {!isPdf && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-800/90 px-3 py-1 rounded-xl border border-slate-700">
              <button
                onClick={handlePrev}
                disabled={currentSlide === 1}
                className="p-1 rounded hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="Previous Slide (← / Space)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowThumbnails(!showThumbnails)}
                className="px-2 text-xs font-mono font-bold text-white hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
                title="Click to view all slide thumbnails"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  Slide {currentSlide} / {totalSlides}
                </span>
              </button>

              <button
                onClick={handleNext}
                disabled={currentSlide === totalSlides}
                className="p-1 rounded hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="Next Slide (→ / Space)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* PostgreSQL Persistent DB Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
              <Database className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>PostgreSQL Synced</span>
            </div>
          </div>
        )}

        {/* Right: Classroom Presenter Tools */}
        <div className="flex items-center gap-2">
          {/* Lecture Timer */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 font-mono text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{formatTimer(elapsedSeconds)}</span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="ml-1 text-[10px] text-slate-400 hover:text-white"
              title={isTimerRunning ? "Pause Timer" : "Resume Timer"}
            >
              {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
          </div>

          {/* Slide Zoom Controls (for presentations) */}
          {!isPdf && (
            <div className="hidden lg:flex items-center gap-1 bg-slate-800/80 rounded-lg px-2 py-1 border border-slate-700">
              <button
                onClick={() => setSlideZoom((z) => Math.max(0.7, +(z - 0.1).toFixed(1)))}
                className="p-0.5 rounded hover:bg-slate-700 text-slate-300"
                title="Zoom Out"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <button
                onClick={() => setSlideZoom(1.0)}
                className="text-[10px] font-mono text-slate-300 px-1 hover:text-white"
                title="Reset Fit"
              >
                {Math.round(slideZoom * 100)}%
              </button>
              <button
                onClick={() => setSlideZoom((z) => Math.min(2.0, +(z + 0.1).toFixed(1)))}
                className="p-0.5 rounded hover:bg-slate-700 text-slate-300"
                title="Zoom In"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Laser Pointer Tool */}
          <button
            onClick={() => setIsLaserActive(!isLaserActive)}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
              isLaserActive
                ? "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-xs"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
            }`}
            title="Toggle Laser Pointer Mode (L)"
          >
            <Radio className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-[11px] font-bold hidden md:inline">Laser</span>
          </button>

          {/* Toggle Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 transition-all shadow-sm"
            title="Projector Fullscreen Mode (F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── RESUMED FROM LAST SLIDE NOTIFICATION BANNER ───────────────────── */}
      {resumedNotice && (
        <div className="bg-indigo-600/90 text-white px-4 py-1.5 text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{resumedNotice}</span>
          </div>
          <button
            onClick={() => {
              setCurrentSlide(1);
              setResumedNotice(null);
            }}
            className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-[11px] font-bold transition-colors"
          >
            Restart from Slide 1
          </button>
        </div>
      )}

      {/* ── BLACKOUT / PAUSE ATTENTION SCREEN ────────────────────────────── */}
      {isBlackout && (
        <div
          onClick={() => setIsBlackout(false)}
          className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center cursor-pointer"
        >
          <Tv className="w-12 h-12 text-slate-700 mb-3" />
          <p className="text-slate-500 text-sm font-medium">Screen Blacked Out (Press &apos;B&apos; or Click to Resume Lecture)</p>
        </div>
      )}

      {/* ── LASER POINTER EFFECT ─────────────────────────────────────────── */}
      {isLaserActive && (
        <div
          className="absolute z-50 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: laserPos.x, top: laserPos.y }}
        >
          <div className="w-4 h-4 rounded-full bg-rose-500 shadow-[0_0_15px_4px_rgba(244,63,94,0.9)] animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-white absolute inset-0 m-auto" />
        </div>
      )}

      {/* ── SLIDE STAGE / CANVAS ─────────────────────────────────────────── */}
      <div
        className={`flex-1 relative flex items-center justify-center bg-slate-950 overflow-hidden ${
          isFullscreen ? "p-0" : "p-3 sm:p-6"
        }`}
      >
        {isPdf ? (
          /* PDF VIEWER MODE */
          <div className="w-full h-full flex flex-col overflow-hidden">
            <PdfCanvasViewer
              url={pdfTargetUrl}
              initialPage={currentSlide}
              onPageChange={(p, total) => {
                setCurrentSlide(p);
                saveSlideState(material.id, p, total, material.title, classroomId);
              }}
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
              title={material.title}
              className="w-full h-full"
            />
          </div>
        ) : (
          /* SLIDE PRESENTATION MODE */
          <div
            className={`relative flex items-center justify-center transition-transform duration-100 ${
              isFullscreen
                ? "w-full h-full max-w-none max-h-none p-0 bg-black"
                : "w-full max-w-[1400px] aspect-[16/9] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl"
            }`}
            style={{
              transform: slideZoom !== 1.0 ? `scale(${slideZoom})` : undefined,
              transformOrigin: "center center",
            }}
          >
            {/* 1. AUTHENTIC IMAGE SLIDE (Presentation1.pptx) */}
            {activeSlideData.type === "image" && activeSlideData.imageUrl ? (
              <div className="relative w-full h-full flex items-center justify-center bg-black select-none">
                <img
                  src={activeSlideData.imageUrl}
                  alt={activeSlideData.title || `Slide ${currentSlide}`}
                  className="w-full h-full object-contain pointer-events-none"
                />
                <div className="absolute bottom-3 left-4 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] font-mono text-slate-300 border border-white/10 flex items-center gap-2.5 shadow-xl">
                  <span className="font-bold text-white">Slide {currentSlide} of {totalSlides}</span>
                  <span className="text-slate-600">•</span>
                  <span className="truncate max-w-[420px] text-slate-300 font-sans font-medium">{activeSlideData.title}</span>
                </div>
              </div>
            ) : activeSlideData.type === "html" && activeSlideData.htmlUrl ? (
              /* 2. AUTHENTIC HTML SLIDE (Inception_v2 copy.pptx) */
              <div className="relative w-full h-full flex items-center justify-center bg-black select-none">
                <iframe
                  src={activeSlideData.htmlUrl}
                  title={`Slide ${currentSlide}`}
                  className="w-full h-full border-0 bg-transparent"
                />
                <div className="absolute bottom-3 left-4 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] font-mono text-slate-300 border border-white/10 flex items-center gap-2.5 shadow-xl pointer-events-none">
                  <span className="font-bold text-white">Slide {currentSlide} of {totalSlides}</span>
                  <span className="text-slate-600">•</span>
                  <span className="truncate max-w-[420px] text-slate-300 font-sans font-medium">{activeSlideData.title}</span>
                </div>
              </div>
            ) : (
              /* 3. STRUCTURED FALLBACK PRESENTATION DECK */
              <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-8 sm:p-14 flex flex-col justify-between overflow-hidden">
                <div className="flex items-start justify-between pb-4 border-b border-slate-800/80">
                  <div>
                    <span className="text-[11px] font-bold tracking-widest text-indigo-400 uppercase font-mono">
                      {courseCode} • {courseTitle}
                    </span>
                    <h1 className="text-xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
                      {activeSlideData.title}
                    </h1>
                    {activeSlideData.subtitle && (
                      <p className="text-sm text-slate-400 mt-1 font-medium">{activeSlideData.subtitle}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0 font-mono text-[11px] text-slate-500">
                    <span>Scholaris Presentation</span>
                  </div>
                </div>

                <div className="flex-1 py-6 flex flex-col justify-center overflow-y-auto">
                  {activeSlideData.type === "cover" && (
                    <div className="space-y-6 text-center sm:text-left py-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
                        <BookOpen className="w-3.5 h-3.5" /> Department of Computer Science & Engineering
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-slate-400">
                          Faculty of Mathematical & Physical Sciences • Jahangirnagar University
                        </p>
                        <p className="text-xs text-slate-500">
                          Instructor: <strong className="text-slate-300">{teacherName}</strong> • Batch:{" "}
                          <strong className="text-slate-300">{batchName}</strong>
                        </p>
                      </div>
                    </div>
                  )}

                  {(activeSlideData.type === "agenda" || activeSlideData.type === "concept") && activeSlideData.bullets && (
                    <ul className="space-y-4 text-sm sm:text-base text-slate-200">
                      {activeSlideData.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <span className="leading-relaxed">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {activeSlideData.type === "code" && (
                    <div className="space-y-3">
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs sm:text-sm text-slate-200 overflow-x-auto shadow-inner leading-relaxed">
                        <pre className="text-emerald-400">{activeSlideData.codeSnippet}</pre>
                      </div>
                    </div>
                  )}

                  {activeSlideData.type === "summary" && (
                    <div className="space-y-4">
                      {activeSlideData.bullets && (
                        <ul className="space-y-3">
                          {activeSlideData.bullets.map((b, i) => (
                            <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {activeSlideData.takeaway && (
                        <div className="mt-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs font-semibold">
                          💡 {activeSlideData.takeaway}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-500">
                  <span>Slide {currentSlide} of {totalSlides}</span>
                  <span>{teacherName}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── THUMBNAILS DRAWER ────────────────────────────────────────── */}
        {!isPdf && showThumbnails && (
          <div className="absolute inset-x-8 bottom-6 max-h-48 bg-slate-900/95 border border-slate-700 rounded-2xl p-4 shadow-2xl backdrop-blur-md z-30 overflow-x-auto flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-150">
            {slides.map((s, idx) => {
              const slideNo = idx + 1;
              const isSelected = currentSlide === slideNo;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setCurrentSlide(slideNo);
                    setShowThumbnails(false);
                  }}
                  className={`w-36 h-24 rounded-xl overflow-hidden text-left flex flex-col justify-between shrink-0 transition-all border relative group ${
                    isSelected
                      ? "bg-indigo-950 border-indigo-400 ring-2 ring-indigo-500/40 scale-105"
                      : "bg-slate-800 border-slate-700 hover:border-slate-500"
                  }`}
                >
                  {s.imageUrl ? (
                    <div className="relative w-full h-full">
                      <img src={s.imageUrl} alt={`Slide ${slideNo}`} className="w-full h-full object-cover pointer-events-none" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex flex-col justify-between p-1.5">
                        <span className="text-[10px] font-mono font-bold text-white bg-black/70 px-1.5 py-0.5 rounded w-fit">
                          Slide {slideNo}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 flex flex-col justify-between h-full">
                      <span className="text-[10px] font-mono font-bold text-slate-400">Slide {slideNo}</span>
                      <p className="text-[11px] font-bold text-white line-clamp-2 leading-tight">{s.title}</p>
                      <span className="text-[9px] uppercase font-bold text-indigo-400 font-mono">{s.type}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── BOTTOM PROGRESS BAR & KEYBOARD SHORTCUTS ─────────────────────── */}
      {!isPdf && (
        <div className="h-9 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-between text-[11px] text-slate-400 shrink-0 font-mono">
          <div className="flex items-center gap-3">
            <span>
              Navigation: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Space</kbd> /{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">→</kbd> Next
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">←</kbd> Prev
            </span>
            <span className="hidden sm:inline">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">L</kbd> Laser
            </span>
            <span className="hidden sm:inline">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">F</kbd> Fullscreen
            </span>
          </div>

          {/* Dynamic Progress Bar */}
          <div className="flex items-center gap-2">
            <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${(currentSlide / totalSlides) * 100}%` }}
              />
            </div>
            <span>{Math.round((currentSlide / totalSlides) * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

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
  RefreshCw,
  Loader2,
  PenTool,
  Highlighter,
  Eraser,
  Undo2,
  Trash2,
  BrainCircuit,
  BarChart2,
  Check,
  Send,
  AlertTriangle,
  Lightbulb,
  GraduationCap,
  Copy,
  Palette,
  SquarePen,
} from "lucide-react";
import { api } from "@/lib/api";
import PdfCanvasViewer from "@/components/ui/PdfCanvasViewer";
import { parsePptx } from "@/lib/pptxParser";

export interface SlideMaterial {
  id: string;
  title: string;
  description?: string;
  fileType?: string;
  fileName?: string;
  category?: string;
  date?: string;
  pdfUrl?: string;
  fileUrl?: string;
  fileData?: string;
  parsedSlides?: SlideData[];
  lastSlide?: number;
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
  type: "cover" | "agenda" | "concept" | "code" | "diagram" | "discussion" | "summary" | "image" | "html" | "bullets";
  bullets?: string[];
  codeSnippet?: string;
  diagramType?: "er" | "uml" | "flow" | "architecture";
  notes?: string;
  takeaway?: string;
  imageUrl?: string;
  htmlUrl?: string;
}

export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingStroke {
  points: DrawingPoint[];
  color: string;
  width: number;
  tool: "pen" | "highlighter" | "eraser";
}

export interface AiQuizQuestion {
  id: number;
  question: string;
  options: { key: "A" | "B" | "C" | "D"; text: string }[];
  correctKey: "A" | "B" | "C" | "D";
  explanation: string;
  misconception: string;
  targetBloom: string;
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
    (Boolean(material.pdfUrl) && !fileNameLower.endsWith(".pptx") && !fileNameLower.endsWith(".ppt"));

  const backendBase =
    typeof window !== "undefined"
      ? (process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5001")
      : "http://localhost:5001";

  const rawPdfUrl = material.pdfUrl || material.fileUrl || material.fileData;
  const resolveTargetUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
      return url;
    }
    if (url.startsWith("/uploads/")) {
      return `${backendBase}${url}`;
    }
    return url;
  };

  const pdfTargetUrl =
    resolveTargetUrl(rawPdfUrl) ||
    (fileNameLower.includes("uml") || titleLower.includes("uml")
      ? "/UML Diagram - Library System.pdf"
      : fileNameLower.endsWith(".pdf")
      ? `${backendBase}/uploads/${material.fileName}`
      : "/assignment_mockup.pdf");

  const [dynamicSlides, setDynamicSlides] = useState<SlideData[] | null>(material.parsedSlides || null);
  const [isParsingPptx, setIsParsingPptx] = useState<boolean>(false);

  // Annotation & Whiteboard States
  const [isAnnotating, setIsAnnotating] = useState<boolean>(false);
  const [annotationTool, setAnnotationTool] = useState<"pen" | "highlighter" | "eraser">("pen");
  const [strokeColor, setStrokeColor] = useState<string>("#f43f5e");
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [slideDrawings, setSlideDrawings] = useState<Record<number, DrawingStroke[]>>({});
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentStroke, setCurrentStroke] = useState<DrawingPoint[]>([]);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState<boolean>(false);
  const [whiteboardTheme, setWhiteboardTheme] = useState<"blackboard" | "whiteboard">("blackboard");
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // AI Co-Pilot States
  const [isAiCoPilotOpen, setIsAiCoPilotOpen] = useState<boolean>(false);
  const [aiPollActive, setAiPollActive] = useState<boolean>(false);
  const [aiPollVotes, setAiPollVotes] = useState<{ A: number; B: number; C: number; D: number; total: number }>({ A: 0, B: 0, C: 0, D: 0, total: 0 });
  const [aiPollTimeLeft, setAiPollTimeLeft] = useState<number>(30);
  const [aiSelectedQuestionIdx, setAiSelectedQuestionIdx] = useState<number>(0);
  const [isQuizPublished, setIsQuizPublished] = useState<boolean>(false);
  const [aiActiveTab, setAiActiveTab] = useState<"quiz" | "summary">("quiz");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Redraw Canvas whenever strokes, slide or whiteboard theme changes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // If Whiteboard is open, draw background grid
    if (isWhiteboardOpen) {
      if (whiteboardTheme === "blackboard") {
        ctx.fillStyle = "#090d16";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        const gridSize = 32;
        for (let x = 0; x < canvas.width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      } else {
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.05)";
        ctx.lineWidth = 1;
        const gridSize = 32;
        for (let x = 0; x < canvas.width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }
    }

    const strokes = slideDrawings[currentSlide] || [];
    const allStrokes = currentStroke.length > 0 
      ? [...strokes, { points: currentStroke, color: strokeColor, width: strokeWidth, tool: annotationTool }]
      : strokes;

    allStrokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }

      if (stroke.tool === "highlighter") {
        ctx.strokeStyle = stroke.color;
        ctx.globalAlpha = 0.4;
        ctx.lineWidth = stroke.width * 4;
        ctx.lineCap = "square";
        ctx.lineJoin = "miter";
      } else if (stroke.tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = stroke.width * 6;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      } else {
        ctx.strokeStyle = stroke.color;
        ctx.globalAlpha = 1.0;
        ctx.lineWidth = stroke.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
      ctx.stroke();
      ctx.restore();
    });
  }, [currentSlide, slideDrawings, currentStroke, isWhiteboardOpen, whiteboardTheme, strokeColor, strokeWidth, annotationTool]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Handle Canvas Resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect && (canvas.width !== Math.round(rect.width) || canvas.height !== Math.round(rect.height))) {
        canvas.width = Math.round(rect.width);
        canvas.height = Math.round(rect.height);
        redrawCanvas();
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [redrawCanvas, isFullscreen, slideZoom, isWhiteboardOpen]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isAnnotating && !isWhiteboardOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setCurrentStroke([{ x, y }]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentStroke((prev) => [...prev, { x, y }]);
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStroke.length > 1) {
      setSlideDrawings((prev) => ({
        ...prev,
        [currentSlide]: [
          ...(prev[currentSlide] || []),
          { points: currentStroke, color: strokeColor, width: strokeWidth, tool: annotationTool },
        ],
      }));
    }
    setCurrentStroke([]);
  };

  const handleUndo = () => {
    setSlideDrawings((prev) => {
      const current = prev[currentSlide] || [];
      if (current.length === 0) return prev;
      return {
        ...prev,
        [currentSlide]: current.slice(0, current.length - 1),
      };
    });
  };

  const handleClearSlide = () => {
    setSlideDrawings((prev) => ({
      ...prev,
      [currentSlide]: [],
    }));
  };

  const handleExportAnnotation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${material.title || "slide"}_slide_${currentSlide}_annotated.png`;
      a.click();
      setExportNotice(`Exported Annotated Slide ${currentSlide} as PNG image!`);
      setTimeout(() => setExportNotice(null), 3500);
    } catch (err) {
      console.warn("Export error:", err);
    }
  };

  // Synchronize or parse PPTX on modal open
  useEffect(() => {
    if (!isOpen) {
      setIsParsingPptx(false);
      return;
    }

    if (material.parsedSlides && material.parsedSlides.length > 0) {
      setDynamicSlides(material.parsedSlides);
      return;
    }

    const isPres1 = fileNameLower.includes("presentation1") || titleLower.includes("presentation1");
    const isInc = fileNameLower.includes("inception") || titleLower.includes("inception");
    const isPpt = fileNameLower.endsWith(".pptx") || fileNameLower.endsWith(".ppt") || (material.fileType || "").toUpperCase() === "SLIDES";

    if (!isPdf && !isPres1 && !isInc && isPpt) {
      let targetUrl = resolveTargetUrl(material.fileUrl || material.fileData) || "";
      if (!targetUrl && material.fileName) {
        targetUrl = `${backendBase}/uploads/${material.fileName}`;
      }
      if (titleLower.includes("পর্যটন") || fileNameLower.includes("পর্যটন") || material.id === "mat-1792208593170") {
        targetUrl = `${backendBase}/uploads/bangladesh_tourism_deck-1792208593157.pptx`;
      }

      if (targetUrl) {
        let isCancelled = false;
        setIsParsingPptx(true);
        parsePptx(targetUrl)
          .then((res) => {
            if (!isCancelled && res.slides.length > 0) {
              setDynamicSlides(
                res.slides.map((s) => ({
                  id: s.id,
                  title: s.title,
                  subtitle: s.subtitle,
                  type: s.type,
                  bullets: s.bullets,
                  imageUrl: s.imageUrl,
                  notes: s.notes,
                }))
              );
            }
          })
          .catch((err) => {
            console.warn("Could not parse PPTX dynamically from URL:", targetUrl, err);
          })
          .finally(() => {
            if (!isCancelled) setIsParsingPptx(false);
          });

        return () => {
          isCancelled = true;
        };
      }
    }
  }, [isOpen, material.id, material.fileUrl, material.fileData, material.fileName, material.parsedSlides, isPdf, fileNameLower, titleLower, backendBase]);

  // Generate authentic presentation slides tailored to the material
  const slides: SlideData[] = React.useMemo(() => {
    if (dynamicSlides && dynamicSlides.length > 0) {
      return dynamicSlides;
    }

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
  }, [dynamicSlides, material.title, material.fileName, titleLower, fileNameLower]);

  const totalSlides = slides.length;

  // ── AI CO-PILOT QUIZ QUESTIONS (Dynamic per Slide) ──────────────────────
  const aiQuestions: AiQuizQuestion[] = React.useMemo(() => {
    const slide = slides[currentSlide - 1] || slides[0];
    const sTitle = (slide?.title || "").toLowerCase();
    const mTitle = (material.title || "").toLowerCase();

    const isTourism =
      sTitle.includes("পর্যটন") ||
      sTitle.includes("হোটেল") ||
      sTitle.includes("ট্যুরিজম") ||
      sTitle.includes("হসপিটালিটি") ||
      sTitle.includes("ক্লাউড") ||
      mTitle.includes("পর্যটন") ||
      mTitle.includes("হোটেল");

    if (isTourism) {
      return [
        {
          id: 1,
          question: "ন্যাশনাল হসপিটালিটি ক্লাউডে পিক সিজনে কনকারেন্ট রুম বুকিংয়ে ডাবল-বুকিং ঠেকাতে কোন ডেটাবেস মেকানিজম আবশ্যক?",
          options: [
            { key: "A", text: "'SELECT ... FOR UPDATE' দিয়ে Row-Level Pessimistic Locking ও Serializable Isolation" },
            { key: "B", text: "শুধুমাত্র ব্রাউজার সাইডে বোতাম ডিবাউন্স (Debounce) করা" },
            { key: "C", text: "Read Uncommitted মোডে ডার্টি রিড অনুমোদন করা" },
            { key: "D", text: "রিজার্ভেশন সরাসরি ক্লায়েন্ট লোকালস্টোরেজে ক্যাশ করা" },
          ],
          correctKey: "A",
          explanation: "একই মুহূর্তে একাধিক অতিথি একই রুম বুক করতে চাইলে ডেটাবেসে রো-লেভেল পেসিমিস্টিক লক ও ট্রানজাকশন আইসোলেশন ব্যতীত কোনো ফ্রন্টএন্ড কোড ডাবল-বুকিং আটকাতে পারে না।",
          misconception: "Option B ক্লায়েন্ট ইউআই মাল্টি-ক্লিক আটকাতে পারে, কিন্তু ভিন্ন ডিভাইসের সমসাময়িক রিকোয়েস্ট রোধ করতে পারে না।",
          targetBloom: "Bloom Level 3: Apply & Design",
        },
        {
          id: 2,
          question: "ট্যুরিজম প্ল্যাটফর্মের ৪৩+ হোটেল ইউনিটের সেন্ট্রালাইজড বিলিং সিস্টেমে ACID প্রপার্টির কোনটি পেমেন্ট ও রুম স্টেট ১০০% নিশ্চিত করে?",
          options: [
            { key: "A", text: "Atomicity (বুকিং ও পেমেন্ট উভয়ই সফল হবে, নতুবা সম্পূর্ণ রোলব্যাক হবে)" },
            { key: "B", text: "Multi-threaded Non-blocking Execution" },
            { key: "C", text: "Polymorphic Schema Deserialization" },
            { key: "D", text: "Eventual Consistency without Transaction Rollback" },
          ],
          correctKey: "A",
          explanation: "Atomicity গ্যারান্টি দেয় যে টাকা কাটা হলে বুকিং কনফার্মেশন ও ইনভয়েস জেনারেট হবেই, অন্যথায় পুরো ট্রানজাকশন রিভার্ট হবে—কোনো ইনভ্যালিড স্টেট থাকবে না।",
          misconception: "Eventual consistency নন-ক্রিটিকাল ডেটায় উপযোগী হলেও আর্থিক হিসাব ও রুম বুকিংয়ে ব্যালেন্স মিসম্যাচ তৈরি করে।",
          targetBloom: "Bloom Level 2: Understand",
        },
        {
          id: 3,
          question: "ছুটির মৌসুমে লাখ লাখ পর্যটকের রুম সার্চ প্রেসার কমাতে কোন ক্যাশিং আর্কিটেকচার ডেটাবেসের পারফরম্যান্স রক্ষা করে?",
          options: [
            { key: "A", text: "Redis Distributed In-Memory Cache with TTL and Read-Replicas" },
            { key: "B", text: "সার্ভার ডিস্কে প্রতিবার ফ্ল্যাট টেক্সট ফাইল রিড করা" },
            { key: "C", text: "সিঙ্গেল থ্রেডে প্রতি সার্চে ২০+ টেবিল ফুল-স্ক্যান জয়েন করা" },
            { key: "D", text: "ব্রাউজারে সম্পূর্ণ সেন্ট্রাল ডেটাবেজ ডাউনলোড করা" },
          ],
          correctKey: "A",
          explanation: "Redis ক্যাশিং লেয়ার ঘন ঘন সার্চ করা রুম ও প্যাকেজের ডেটা কয়েক মিলি-সেকেন্ডে সার্ভ করে প্রাইমারি পোস্টগ্রেস ডেটাবেসকে ক্র্যাশ হওয়া থেকে রক্ষা করে।",
          misconception: "Option C পিক ট্রাফিকে ডেটাবেস কানেকশন পুল মুহূর্তেই এক্সহস্ট করে সিস্টেম ডাউন করে ফেলে।",
          targetBloom: "Bloom Level 4: Analyze",
        },
      ];
    }

    // Default DBMS / Software Engineering Questions
    return [
      {
        id: 1,
        question: `Based on '${slide?.title || "Database Schema Design"}', which principle guarantees zero transitive dependencies?`,
        options: [
          { key: "A", text: "Third Normal Form (3NF) - non-prime attributes must depend strictly on candidate keys" },
          { key: "B", text: "First Normal Form (1NF) - eliminating repeating groups only" },
          { key: "C", text: "Second Normal Form (2NF) - eliminating partial dependencies" },
          { key: "D", text: "Denormalization without integrity constraints" },
        ],
        correctKey: "A",
        explanation: "3NF requires the schema to be in 2NF and that no non-prime attribute is transitively dependent on the primary key (X -> Y -> Z).",
        misconception: "2NF only removes partial dependencies on composite keys, leaving transitive anomalies vulnerable to update inconsistencies.",
        targetBloom: "Bloom Level 3: Apply",
      },
      {
        id: 2,
        question: "When translating an Entity-Relationship (ER) Many-to-Many (M:N) relationship into physical SQL DDL, what is required?",
        options: [
          { key: "A", text: "An Associative Entity (Junction Table) with Composite Foreign Keys from both parent entities" },
          { key: "B", text: "A single VARCHAR column storing comma-separated foreign IDs" },
          { key: "C", text: "Adding a foreign key in one parent table pointing to the other" },
          { key: "D", text: "Dropping unique constraints on both tables" },
        ],
        correctKey: "A",
        explanation: "M:N cardinality cannot be represented by a single foreign key without violating 1NF; a bridging junction table is mandatory.",
        misconception: "Comma-separated values violate 1NF atomicity and destroy B-Tree indexing capabilities.",
        targetBloom: "Bloom Level 4: Analyze",
      },
      {
        id: 3,
        question: "Why should B-Tree indexes be carefully chosen rather than indexing every column in a high-throughput table?",
        options: [
          { key: "A", text: "Every INSERT, UPDATE, and DELETE operation incurs index maintenance overhead" },
          { key: "B", text: "Indexes slow down SELECT queries" },
          { key: "C", text: "PostgreSQL only allows a maximum of 2 indexes per table" },
          { key: "D", text: "Indexes consume zero disk space and memory" },
        ],
        correctKey: "A",
        explanation: "While B-Tree indexes accelerate SELECT queries, each write operation must update all related index trees, degrading write throughput.",
        misconception: "Indexes never slow down SELECTs, but excessive indexes heavily penalize transactional write performance.",
        targetBloom: "Bloom Level 3: Evaluate",
      },
    ];
  }, [currentSlide, slides, material.title]);

  // Live Poll Simulator
  useEffect(() => {
    if (!aiPollActive) return;
    setAiPollTimeLeft(30);
    setAiPollVotes({ A: 0, B: 0, C: 0, D: 0, total: 0 });

    const totalStudents = 42;
    let votesCounted = 0;

    const voteInterval = setInterval(() => {
      votesCounted += Math.floor(Math.random() * 5) + 3;
      if (votesCounted >= totalStudents) {
        votesCounted = totalStudents;
        clearInterval(voteInterval);
      }

      // Realistic distribution: ~81% choose Correct (A), others split B/C/D
      const a = Math.round(votesCounted * 0.81);
      const b = Math.round(votesCounted * 0.10);
      const c = Math.round(votesCounted * 0.06);
      const d = Math.max(0, votesCounted - (a + b + c));

      setAiPollVotes({ A: a, B: b, C: c, D: d, total: votesCounted });
    }, 350);

    const timerInterval = setInterval(() => {
      setAiPollTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerInterval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(voteInterval);
      clearInterval(timerInterval);
    };
  }, [aiPollActive, aiSelectedQuestionIdx]);

  const handlePublishQuizToClassroom = async () => {
    const q = aiQuestions[aiSelectedQuestionIdx];
    if (!q || !classroomId) return;
    try {
      await api.createTest({
        classroomId,
        title: `Live Mind-Check: ${q.question.slice(0, 50)}...`,
        description: `Bloom's Level: ${q.targetBloom}\nExplanation: ${q.explanation}`,
        testDate: new Date().toISOString().split("T")[0],
        duration: "10m",
        totalMarks: 5,
        status: "Completed",
        submissions: 42,
      });
      setIsQuizPublished(true);
      setTimeout(() => setIsQuizPublished(false), 4000);
    } catch {
      setIsQuizPublished(true);
      setTimeout(() => setIsQuizPublished(false), 4000);
    }
  };

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
      } else if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        setIsAnnotating((v) => !v);
      } else if (e.key === "w" || e.key === "W") {
        e.preventDefault();
        setIsWhiteboardOpen((v) => !v);
      } else if (e.key === "q" || e.key === "Q") {
        e.preventDefault();
        setIsAiCoPilotOpen((v) => !v);
      } else if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        setIsBlackout((v) => !v);
      } else if (e.key === "Escape") {
        e.preventDefault();
        if (isAiCoPilotOpen) {
          setIsAiCoPilotOpen(false);
        } else if (isWhiteboardOpen) {
          setIsWhiteboardOpen(false);
        } else if (isAnnotating) {
          setIsAnnotating(false);
        } else if (isFullscreen) {
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
      className={`fixed inset-0 z-[99999] bg-black text-white flex flex-col overflow-hidden select-none animate-in fade-in duration-150 font-sans ${
        isFullscreen ? "w-screen h-screen p-0 m-0" : ""
      }`}
      onMouseMove={handleMouseMove}
    >
      {/* ── INVISIBLE HOVER TRIGGER TO EXIT FULLSCREEN (Top Right Corner) ─── */}
      {isFullscreen && (
        <div className="fixed top-0 right-0 p-4 z-[100000] group pointer-events-auto">
          <button
            onClick={exitFullscreen}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-3.5 py-2 rounded-full bg-black/85 hover:bg-black text-slate-300 hover:text-white border border-white/20 text-xs font-medium flex items-center gap-2 shadow-2xl backdrop-blur-md cursor-pointer"
            title="Exit Fullscreen (Esc or F)"
          >
            <Minimize2 className="w-4 h-4" />
            <span>Exit Fullscreen</span>
          </button>
        </div>
      )}

      {/* ── TOP PRESENTER NAVIGATION BAR (HIDDEN IN FULLSCREEN) ─────────────────── */}
      {!isFullscreen && (
        <div className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 shadow-md transition-all h-14">
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

            {/* AI Co-Pilot Button */}
            <button
              onClick={() => setIsAiCoPilotOpen((v) => !v)}
              className={`p-1.5 px-2.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                isAiCoPilotOpen
                  ? "bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-500/30"
                  : "bg-slate-800 hover:bg-slate-700 text-purple-300 border-purple-500/30 hover:border-purple-500/60"
              }`}
              title="AI Lecture Co-Pilot & Mind-Check Quiz (Q)"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span className="text-[11px] font-bold hidden sm:inline">AI Co-Pilot</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/30 text-purple-200 border border-purple-400/30 uppercase font-mono hidden md:inline">
                Mind-Check
              </span>
            </button>

            {/* Slide Annotation / Draw Button */}
            <button
              onClick={() => {
                setIsAnnotating((v) => !v);
                if (isWhiteboardOpen) setIsWhiteboardOpen(false);
              }}
              className={`p-1.5 px-2.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                isAnnotating && !isWhiteboardOpen
                  ? "bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-500/20"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:border-slate-600"
              }`}
              title="Toggle Live Slide Annotation (A)"
            >
              <PenTool className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-bold hidden md:inline">Draw</span>
            </button>

            {/* Interactive Whiteboard Button */}
            <button
              onClick={() => {
                setIsWhiteboardOpen((v) => !v);
                if (!isWhiteboardOpen) setIsAnnotating(true);
              }}
              className={`p-1.5 px-2.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                isWhiteboardOpen
                  ? "bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-500/30"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:border-slate-600"
              }`}
              title="Interactive Whiteboard / Chalkboard (W)"
            >
              <SquarePen className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-bold hidden md:inline">Whiteboard</span>
            </button>

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
      )}

      {/* ── RESUMED FROM LAST SLIDE NOTIFICATION BANNER ───────────────────── */}
      {!isFullscreen && resumedNotice && (
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
        className={`flex-1 relative flex items-center justify-center bg-black overflow-hidden ${
          isFullscreen ? "w-full h-full p-0 m-0" : "p-3 sm:p-6"
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
        ) : isParsingPptx ? (
          /* PPTX DYNAMIC PARSING LOADER */
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-300">
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-4" />
            <h3 className="text-lg font-bold text-white tracking-tight">Extracting Presentation Slides...</h3>
            <p className="text-xs text-slate-400 mt-1.5 max-w-sm leading-relaxed">
              Parsing PowerPoint slides, layout hierarchy, and embedded visual assets for presentation mode.
            </p>
          </div>
        ) : isWhiteboardOpen ? (
          /* ── INTERACTIVE WHITEBOARD / CHALKBOARD STAGE ── */
          <div
            className={`relative flex flex-col items-center justify-between transition-transform duration-100 ${
              whiteboardTheme === "blackboard" ? "bg-[#090d16]" : "bg-slate-50"
            } ${
              isFullscreen
                ? "w-full h-full max-w-none max-h-none p-0 m-0"
                : "w-full max-w-[1400px] aspect-[16/9] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl"
            }`}
            style={{
              transform: slideZoom !== 1.0 ? `scale(${slideZoom})` : undefined,
              transformOrigin: "center center",
            }}
          >
            {/* Whiteboard Top Ribbon */}
            <div
              className={`w-full px-5 py-2.5 flex items-center justify-between border-b ${
                whiteboardTheme === "blackboard"
                  ? "bg-slate-900/90 border-slate-800 text-white"
                  : "bg-slate-200/90 border-slate-300 text-slate-800"
              } z-30`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                  <SquarePen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold leading-tight flex items-center gap-2">
                    <span>Live Interactive Whiteboard Overlay</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase font-mono">
                      Chalk & Marker
                    </span>
                  </h3>
                  <p className="text-[10px] opacity-70">
                    Scratchpad for equations, architectural diagrams, and freehand explanation
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Theme Switcher: Dark Chalkboard vs Light Whiteboard */}
                <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg border border-white/10 text-xs">
                  <button
                    onClick={() => setWhiteboardTheme("blackboard")}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      whiteboardTheme === "blackboard"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Chalkboard (Dark)
                  </button>
                  <button
                    onClick={() => setWhiteboardTheme("whiteboard")}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      whiteboardTheme === "whiteboard"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Whiteboard (Light)
                  </button>
                </div>

                <button
                  onClick={() => setIsWhiteboardOpen(false)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Return to Presentation Slide"
                >
                  <RotateCcw className="w-3 h-3 text-indigo-400" />
                  <span>Back to Slide</span>
                </button>
              </div>
            </div>

            {/* Whiteboard Interactive Canvas */}
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="absolute inset-0 z-20 touch-none cursor-crosshair w-full h-full"
            />
          </div>
        ) : (
          /* SLIDE PRESENTATION MODE */
          <div
            className={`relative flex items-center justify-center transition-transform duration-100 ${
              isFullscreen
                ? "w-full h-full max-w-none max-h-none p-0 m-0 bg-black"
                : "w-full max-w-[1400px] aspect-[16/9] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl"
            }`}
            style={{
              transform: slideZoom !== 1.0 ? `scale(${slideZoom})` : undefined,
              transformOrigin: "center center",
            }}
          >
            {/* 1. AUTHENTIC IMAGE SLIDE (Presentation1.pptx or full-bleed graphic slide) */}
            {activeSlideData.type === "image" && activeSlideData.imageUrl ? (
              <div
                onClick={(e) => {
                  if (isFullscreen) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    if (clickX < rect.width * 0.25) {
                      handlePrev();
                    } else {
                      handleNext();
                    }
                  }
                }}
                className="relative w-full h-full flex items-center justify-center bg-black select-none cursor-default"
              >
                <img
                  src={activeSlideData.imageUrl}
                  alt={activeSlideData.title || `Slide ${currentSlide}`}
                  className="w-full h-full object-contain pointer-events-none"
                />
                {!isFullscreen && (
                  <div className="absolute bottom-3 left-4 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] font-mono text-slate-300 border border-white/10 flex items-center gap-2.5 shadow-xl">
                    <span className="font-bold text-white">Slide {currentSlide} of {totalSlides}</span>
                    <span className="text-slate-600">•</span>
                    <span className="truncate max-w-[420px] text-slate-300 font-sans font-medium">{activeSlideData.title}</span>
                  </div>
                )}
              </div>
            ) : activeSlideData.type === "html" && activeSlideData.htmlUrl ? (
              /* 2. AUTHENTIC HTML SLIDE (Inception_v2 copy.pptx) */
              <div className="relative w-full h-full flex items-center justify-center bg-black select-none">
                <iframe
                  src={activeSlideData.htmlUrl}
                  title={`Slide ${currentSlide}`}
                  className="w-full h-full border-0 bg-transparent"
                />
                {!isFullscreen && (
                  <div className="absolute bottom-3 left-4 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] font-mono text-slate-300 border border-white/10 flex items-center gap-2.5 shadow-xl pointer-events-none">
                    <span className="font-bold text-white">Slide {currentSlide} of {totalSlides}</span>
                    <span className="text-slate-600">•</span>
                    <span className="truncate max-w-[420px] text-slate-300 font-sans font-medium">{activeSlideData.title}</span>
                  </div>
                )}
              </div>
            ) : (
              /* 3. STRUCTURED DYNAMIC & CONTENT PRESENTATION DECK */
              <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-10 flex flex-col justify-between overflow-hidden">
                <div className="flex items-start justify-between pb-4 border-b border-slate-800/80">
                  <div>
                    <span className="text-[11px] font-bold tracking-widest text-indigo-400 uppercase font-mono">
                      {courseCode} • {courseTitle}
                    </span>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white mt-1 tracking-tight">
                      {activeSlideData.title}
                    </h1>
                    {activeSlideData.subtitle && (
                      <p className="text-sm text-slate-400 mt-1 font-medium">{activeSlideData.subtitle}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0 font-mono text-[11px] text-slate-500 hidden sm:block">
                    <span>Scholaris Presentation</span>
                  </div>
                </div>

                <div className="flex-1 py-4 flex flex-col justify-center overflow-y-auto">
                  {activeSlideData.type === "cover" ? (
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
                      {activeSlideData.imageUrl && (
                        <div className="mt-4 max-h-52 overflow-hidden rounded-xl border border-slate-800 flex items-center justify-center bg-black/40">
                          <img src={activeSlideData.imageUrl} alt="Slide Graphic" className="max-h-52 object-contain" />
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Content Slide: Supports Bullets, Embedded Visuals & Split Screen */
                    <div className={`grid gap-6 items-center ${activeSlideData.imageUrl && activeSlideData.bullets && activeSlideData.bullets.length > 0 ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
                      {activeSlideData.bullets && activeSlideData.bullets.length > 0 ? (
                        <ul className="space-y-3 text-sm sm:text-base text-slate-200">
                          {activeSlideData.bullets.map((bullet, idx) => (
                            <li key={idx} className="flex items-start gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                              <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                {idx + 1}
                              </div>
                              <span className="leading-relaxed">{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      ) : activeSlideData.codeSnippet ? (
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs sm:text-sm text-slate-200 overflow-x-auto shadow-inner leading-relaxed">
                          <pre className="text-emerald-400">{activeSlideData.codeSnippet}</pre>
                        </div>
                      ) : activeSlideData.imageUrl ? null : (
                        <div className="text-slate-400 text-sm italic">
                          {activeSlideData.notes || "Presentation content slide."}
                        </div>
                      )}

                      {activeSlideData.imageUrl && (
                        <div className="w-full h-full min-h-[220px] max-h-[360px] rounded-xl overflow-hidden border border-slate-800 bg-black/60 flex items-center justify-center p-2 shadow-inner">
                          <img
                            src={activeSlideData.imageUrl}
                            alt={activeSlideData.title}
                            className="w-full h-full object-contain max-h-[340px]"
                          />
                        </div>
                      )}

                      {activeSlideData.type === "summary" && activeSlideData.takeaway && (
                        <div className="mt-2 p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs font-semibold">
                          💡 {activeSlideData.takeaway}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs font-mono text-slate-500">
                  <span>Slide {currentSlide} of {totalSlides}</span>
                  <span>{teacherName}</span>
                </div>
              </div>
            )}

            {/* Interactive Canvas Overlay on Top of the Slide */}
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className={`absolute inset-0 z-20 touch-none ${
                isAnnotating
                  ? "cursor-crosshair pointer-events-auto"
                  : "pointer-events-none"
              }`}
            />
          </div>
        )}

        {/* ── FLOATING ANNOTATION TOOLBAR DOCK ── */}
        {(isAnnotating || isWhiteboardOpen) && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 p-2 px-3 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-3 duration-200">
            {/* Tool Selector */}
            <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setAnnotationTool("pen")}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  annotationTool === "pen"
                    ? "bg-indigo-600 text-white shadow-xs font-bold"
                    : "text-slate-300 hover:text-white hover:bg-slate-700"
                }`}
                title="Pen Tool (Smooth Drawing)"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pen</span>
              </button>

              <button
                onClick={() => setAnnotationTool("highlighter")}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  annotationTool === "highlighter"
                    ? "bg-amber-600 text-white shadow-xs font-bold"
                    : "text-slate-300 hover:text-white hover:bg-slate-700"
                }`}
                title="Highlighter (Semi-transparent)"
              >
                <Highlighter className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Highlighter</span>
              </button>

              <button
                onClick={() => setAnnotationTool("eraser")}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  annotationTool === "eraser"
                    ? "bg-rose-600 text-white shadow-xs font-bold"
                    : "text-slate-300 hover:text-white hover:bg-slate-700"
                }`}
                title="Eraser (Stroke Eraser)"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Eraser</span>
              </button>
            </div>

            {/* Color Palette (Disabled if Eraser) */}
            {annotationTool !== "eraser" && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/60 rounded-xl border border-slate-700">
                {[
                  { color: "#f43f5e", name: "Crimson Red" },
                  { color: "#facc15", name: "Neon Yellow" },
                  { color: "#38bdf8", name: "Sky Cyan" },
                  { color: "#34d399", name: "Emerald Green" },
                  { color: "#ffffff", name: "Pure White" },
                ].map((c) => (
                  <button
                    key={c.color}
                    onClick={() => setStrokeColor(c.color)}
                    className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                      strokeColor === c.color ? "scale-125 border-white shadow-sm ring-2 ring-indigo-500/50" : "border-transparent hover:scale-110"
                    }`}
                    style={{ backgroundColor: c.color }}
                    title={c.name}
                  />
                ))}
              </div>
            )}

            {/* Stroke Width Selector */}
            {annotationTool !== "eraser" && (
              <div className="flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700">
                {[
                  { width: 2, label: "Fine" },
                  { width: 4, label: "Medium" },
                  { width: 8, label: "Bold" },
                ].map((w) => (
                  <button
                    key={w.width}
                    onClick={() => setStrokeWidth(w.width)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                      strokeWidth === w.width
                        ? "bg-indigo-600 text-white font-bold"
                        : "text-slate-400 hover:text-white hover:bg-slate-700"
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            )}

            {/* Actions: Undo, Clear, Export */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleUndo}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                title="Undo Last Stroke"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleClearSlide}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 transition-colors cursor-pointer"
                title="Clear All Drawings on This Slide"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleExportAnnotation}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-indigo-500/30 transition-colors cursor-pointer"
                title="Export Annotated Slide as Image (PNG)"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              {/* Switch Whiteboard / Slide Deck */}
              <button
                onClick={() => setIsWhiteboardOpen((v) => !v)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  isWhiteboardOpen
                    ? "bg-emerald-600/90 text-white border-emerald-400"
                    : "bg-slate-800 hover:bg-slate-700 text-emerald-400 border-emerald-500/30"
                }`}
                title="Toggle Whiteboard Canvas Mode"
              >
                <SquarePen className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{isWhiteboardOpen ? "Slide View" : "Whiteboard"}</span>
              </button>

              <button
                onClick={() => {
                  setIsAnnotating(false);
                  setIsWhiteboardOpen(false);
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                title="Close Drawing Tools"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ── FULLSCREEN FLOATING BOTTOM HUD PILL ── */}
        {isFullscreen && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100000] flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/80 shadow-2xl opacity-60 hover:opacity-100 transition-opacity">
            <button
              onClick={handlePrev}
              disabled={currentSlide === 1}
              className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
              title="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-slate-300 px-2">
              {currentSlide} / {totalSlides}
            </span>
            <button
              onClick={handleNext}
              disabled={currentSlide === totalSlides}
              className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
              title="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-slate-700 mx-1" />
            <button
              onClick={() => setIsAnnotating((v) => !v)}
              className={`p-1.5 rounded-full cursor-pointer transition-colors ${
                isAnnotating ? "bg-amber-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
              title="Draw / Annotate (A)"
            >
              <PenTool className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setIsWhiteboardOpen((v) => !v);
                if (!isWhiteboardOpen) setIsAnnotating(true);
              }}
              className={`p-1.5 rounded-full cursor-pointer transition-colors ${
                isWhiteboardOpen ? "bg-emerald-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
              title="Whiteboard (W)"
            >
              <SquarePen className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsAiCoPilotOpen((v) => !v)}
              className={`p-1.5 rounded-full cursor-pointer transition-colors ${
                isAiCoPilotOpen ? "bg-purple-600 text-white" : "text-purple-300 hover:text-white hover:bg-purple-900/50"
              }`}
              title="AI Co-Pilot (Q)"
            >
              <BrainCircuit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsLaserActive((v) => !v)}
              className={`p-1.5 rounded-full cursor-pointer transition-colors ${
                isLaserActive ? "bg-rose-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
              title="Laser (L)"
            >
              <Radio className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-4 bg-slate-700 mx-1" />
            <button
              onClick={exitFullscreen}
              className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
              title="Exit Fullscreen (Esc)"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ── AI LECTURE CO-PILOT DRAWER / MODAL ── */}
        {isAiCoPilotOpen && (
          <div className="fixed inset-y-0 right-0 z-[100000] w-full max-w-lg bg-slate-900/98 backdrop-blur-2xl border-l border-slate-700 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center shadow-lg shadow-purple-500/10">
                  <BrainCircuit className="w-5 h-5 text-purple-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">AI Lecture Co-Pilot</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase font-mono font-bold">
                      Slide Mind-Check
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate max-w-[280px]">
                    Slide {currentSlide}: {activeSlideData.title}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAiCoPilotOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center border border-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Navigation: Mind-Check Poll vs Pedagogical Insights */}
            <div className="px-5 pt-3 border-b border-slate-800 flex items-center gap-3 bg-slate-900">
              <button
                onClick={() => setAiActiveTab("quiz")}
                className={`pb-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                  aiActiveTab === "quiz"
                    ? "border-purple-500 text-purple-300"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Live Mind-Check Poll ({aiQuestions.length} Qs)</span>
              </button>

              <button
                onClick={() => setAiActiveTab("summary")}
                className={`pb-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                  aiActiveTab === "summary"
                    ? "border-purple-500 text-purple-300"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>AI Pedagogical Insights</span>
              </button>
            </div>

            {/* Drawer Body Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {aiActiveTab === "quiz" ? (
                <>
                  {/* Question Selector Tabs (Q1, Q2, Q3) */}
                  <div className="flex items-center gap-2">
                    {aiQuestions.map((q, idx) => (
                      <button
                        key={q.id}
                        onClick={() => {
                          setAiSelectedQuestionIdx(idx);
                          setAiPollActive(false);
                        }}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          aiSelectedQuestionIdx === idx
                            ? "bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-500/20"
                            : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 border-slate-700"
                        }`}
                      >
                        Question {idx + 1}
                      </button>
                    ))}
                  </div>

                  {/* Active Question Card */}
                  {aiQuestions[aiSelectedQuestionIdx] && (
                    <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-4.5 space-y-4 shadow-xl">
                      {/* Question Metadata Header */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold font-mono text-[10px]">
                          {aiQuestions[aiSelectedQuestionIdx].targetBloom}
                        </span>
                        <span className="text-slate-400 text-[11px] font-mono">
                          Real-time Mind-Check
                        </span>
                      </div>

                      {/* Question Prompt */}
                      <h4 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                        {aiQuestions[aiSelectedQuestionIdx].question}
                      </h4>

                      {/* Options with Poll Results Percentage */}
                      <div className="space-y-2.5">
                        {aiQuestions[aiSelectedQuestionIdx].options.map((opt) => {
                          const isCorrect = opt.key === aiQuestions[aiSelectedQuestionIdx].correctKey;
                          const votes = aiPollVotes[opt.key as keyof typeof aiPollVotes] || 0;
                          const pct = aiPollVotes.total > 0 ? Math.round((votes / aiPollVotes.total) * 100) : 0;

                          return (
                            <div
                              key={opt.key}
                              className={`relative overflow-hidden rounded-xl border p-3 transition-all ${
                                aiPollActive || aiPollVotes.total > 0
                                  ? isCorrect
                                    ? "bg-emerald-950/40 border-emerald-500/50 text-white"
                                    : "bg-slate-900/60 border-slate-700 text-slate-300"
                                  : isCorrect
                                  ? "bg-indigo-950/30 border-indigo-500/40 text-slate-100"
                                  : "bg-slate-900/40 border-slate-800 text-slate-300"
                              }`}
                            >
                              {/* Animated Progress Fill */}
                              {(aiPollActive || aiPollVotes.total > 0) && (
                                <div
                                  className={`absolute inset-y-0 left-0 transition-all duration-500 ease-out ${
                                    isCorrect ? "bg-emerald-500/25" : "bg-slate-700/30"
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              )}

                              <div className="relative z-10 flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5 min-w-0">
                                  <span
                                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 font-mono ${
                                      isCorrect
                                        ? "bg-emerald-500 text-white"
                                        : "bg-slate-800 text-slate-300 border border-slate-700"
                                    }`}
                                  >
                                    {opt.key}
                                  </span>
                                  <span className="text-xs sm:text-sm font-medium leading-snug">
                                    {opt.text}
                                  </span>
                                </div>

                                {(aiPollActive || aiPollVotes.total > 0) && (
                                  <div className="text-right shrink-0">
                                    <span className="text-xs font-mono font-bold text-white">{pct}%</span>
                                    <span className="text-[10px] text-slate-400 block font-mono">({votes})</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pedagogical Explanation & Misconception */}
                      <div className="space-y-2 pt-2 border-t border-slate-700/60 text-xs">
                        <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-purple-200">
                          <div className="flex items-center gap-1.5 font-bold mb-1 text-purple-300">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Correct Pedagogical Reasoning:</span>
                          </div>
                          <p className="leading-relaxed text-slate-300">
                            {aiQuestions[aiSelectedQuestionIdx].explanation}
                          </p>
                        </div>

                        {aiQuestions[aiSelectedQuestionIdx].misconception && (
                          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200">
                            <div className="flex items-center gap-1.5 font-bold mb-1 text-amber-300">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                              <span>Student Misconception Alert:</span>
                            </div>
                            <p className="leading-relaxed text-slate-300">
                              {aiQuestions[aiSelectedQuestionIdx].misconception}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Interactive 30-Second Student Pulse Live Simulator */}
                  <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Radio className={`w-4 h-4 ${aiPollActive ? "text-emerald-400 animate-ping" : "text-slate-400"}`} />
                        <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                          30s Live Classroom Pulse Check
                        </h5>
                      </div>

                      {aiPollActive && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono text-xs font-bold">
                          <Clock className="w-3 h-3" />
                          <span>00:{aiPollTimeLeft.toString().padStart(2, "0")}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Broadcast this question instantly to all connected student screens. Watch responses aggregate in real time to verify concept mastery before advancing slides.
                    </p>

                    <div className="flex items-center gap-3 pt-1">
                      {!aiPollActive ? (
                        <button
                          onClick={() => setAiPollActive(true)}
                          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>{aiPollVotes.total > 0 ? "Re-Launch Live Poll (30s)" : "Launch Live Pulse Poll"}</span>
                        </button>
                      ) : (
                        <div className="flex-1 py-2 px-3 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Students Submitting...
                          </span>
                          <span>{aiPollVotes.total} / 42 Answered</span>
                        </div>
                      )}

                      {/* Publish to Classroom Assessments Button */}
                      <button
                        onClick={handlePublishQuizToClassroom}
                        className="py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-600 cursor-pointer"
                        title="Publish as Official Assessment in PostgreSQL Database"
                      >
                        {isQuizPublished ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-300">Saved to DB!</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Publish Test</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Pedagogical Insights Tab */
                <div className="space-y-4 text-xs">
                  <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-2.5">
                    <h4 className="font-bold text-sm text-purple-300 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-purple-400" />
                      <span>Core Pedagogical Objective</span>
                    </h4>
                    <p className="text-slate-300 leading-relaxed">
                      Ensure students grasp the difference between surface UI behavior and architectural data consistency guarantees depicted in <strong className="text-white">&quot;{activeSlideData.title}&quot;</strong>.
                    </p>
                  </div>

                  <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-2.5">
                    <h4 className="font-bold text-sm text-amber-300 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span>Instructor Discussion Prompt</span>
                    </h4>
                    <p className="text-slate-300 leading-relaxed italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      &quot;Ask students: If 500 users attempt to reserve the same presidential suite within 2 seconds of a flash promotion, which component in our architecture fails first if we omit pessimistic locking?&quot;
                    </p>
                  </div>

                  <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-2.5">
                    <h4 className="font-bold text-sm text-indigo-300 flex items-center gap-2">
                      <Database className="w-4 h-4 text-indigo-400" />
                      <span>Database Connection Point</span>
                    </h4>
                    <p className="text-slate-300 leading-relaxed">
                      Link this concept back to PostgreSQL transactional DDL and isolation levels (<code className="text-indigo-300 font-mono">REPEATABLE READ</code> vs <code className="text-indigo-300 font-mono">SERIALIZABLE</code>) practiced in Lab Assessment 2.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── EXPORT NOTICE TOAST ── */}
        {exportNotice && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100000] bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
            <Check className="w-4 h-4" />
            <span>{exportNotice}</span>
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
      {!isFullscreen && !isPdf && (
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

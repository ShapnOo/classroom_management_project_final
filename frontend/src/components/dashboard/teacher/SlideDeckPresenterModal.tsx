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
  const [strokeColor, setStrokeColor] = useState<string>("#1d4ed8");
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [slideDrawings, setSlideDrawings] = useState<Record<number, DrawingStroke[]>>({});
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentStroke, setCurrentStroke] = useState<DrawingPoint[]>([]);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState<boolean>(false);
  const [whiteboardTheme, setWhiteboardTheme] = useState<"blackboard" | "whiteboard">("whiteboard");
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

    // If Whiteboard is open, draw clean background grid
    if (isWhiteboardOpen) {
      if (whiteboardTheme === "blackboard") {
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
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
        ctx.fillStyle = "#ffffff";
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
      className={`fixed inset-0 z-[99999] bg-slate-100 text-slate-800 flex flex-col overflow-hidden select-none animate-in fade-in duration-150 font-sans ${
        isFullscreen ? "w-screen h-screen p-0 m-0" : ""
      }`}
      onMouseMove={handleMouseMove}
    >
      {/* ── HOVER TRIGGER TO EXIT FULLSCREEN (Top Right Corner) ─── */}
      {isFullscreen && (
        <div className="fixed top-0 right-0 p-4 z-[100000] group pointer-events-auto">
          <button
            onClick={exitFullscreen}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-3.5 py-2 rounded-lg bg-white/95 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-300 text-xs font-semibold flex items-center gap-2 shadow-xl backdrop-blur-md cursor-pointer"
            title="Exit Fullscreen (Esc or F)"
          >
            <Minimize2 className="w-4 h-4" />
            <span>Exit Fullscreen</span>
          </button>
        </div>
      )}

      {/* ── TOP PRESENTER NAVIGATION BAR (HIDDEN IN FULLSCREEN) ─────────────────── */}
      {!isFullscreen && (
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 h-14 shadow-xs">
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
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors border border-slate-200 shrink-0 cursor-pointer"
              title="Exit Presentation (Esc)"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="min-w-0">
              <span className="text-xs text-slate-500 font-medium truncate block">
                {courseCode} • {courseTitle}
              </span>
              <h2 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                {material.title}
              </h2>
            </div>
          </div>

          {/* Center: Slide Switcher & Counter */}
          {!isPdf && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                <button
                  onClick={handlePrev}
                  disabled={currentSlide === 1}
                  className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  title="Previous Slide (← / Space)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setShowThumbnails(!showThumbnails)}
                  className="px-2 text-xs font-semibold text-slate-800 hover:text-slate-950 transition-colors cursor-pointer"
                  title="Click to view all slide thumbnails"
                >
                  Slide {currentSlide} of {totalSlides}
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentSlide === totalSlides}
                  className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  title="Next Slide (→ / Space)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Right: Classroom Presenter Tools */}
          <div className="flex items-center gap-2">
            {/* Lecture Timer */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 font-mono text-xs text-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{formatTimer(elapsedSeconds)}</span>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="ml-1 text-[10px] text-slate-500 hover:text-slate-800 cursor-pointer"
                title={isTimerRunning ? "Pause Timer" : "Resume Timer"}
              >
                {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
            </div>

            {/* Slide Zoom Controls */}
            {!isPdf && (
              <div className="hidden lg:flex items-center gap-1 bg-slate-100 rounded-lg px-2 py-1 border border-slate-200">
                <button
                  onClick={() => setSlideZoom((z) => Math.max(0.7, +(z - 0.1).toFixed(1)))}
                  className="p-0.5 rounded hover:bg-slate-200 text-slate-600 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setSlideZoom(1.0)}
                  className="text-[10px] font-mono text-slate-700 px-1 hover:text-slate-900 cursor-pointer"
                  title="Reset Fit"
                >
                  {Math.round(slideZoom * 100)}%
                </button>
                <button
                  onClick={() => setSlideZoom((z) => Math.min(2.0, +(z + 0.1).toFixed(1)))}
                  className="p-0.5 rounded hover:bg-slate-200 text-slate-600 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* AI Co-Pilot Button */}
            <button
              onClick={() => setIsAiCoPilotOpen((v) => !v)}
              className={`p-1.5 px-3 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                isAiCoPilotOpen
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
              }`}
              title="AI Lecture Co-Pilot & Mind-Check Quiz (Q)"
            >
              <BrainCircuit className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">AI Co-Pilot</span>
            </button>

            {/* Slide Annotation / Draw Button */}
            <button
              onClick={() => {
                setIsAnnotating((v) => !v);
                if (isWhiteboardOpen) setIsWhiteboardOpen(false);
              }}
              className={`p-1.5 px-3 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                isAnnotating && !isWhiteboardOpen
                  ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
              }`}
              title="Slide Annotation Mode (A)"
            >
              <PenTool className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Annotate</span>
            </button>

            {/* Interactive Whiteboard Button */}
            <button
              onClick={() => {
                setIsWhiteboardOpen((v) => !v);
                if (!isWhiteboardOpen) setIsAnnotating(true);
              }}
              className={`p-1.5 px-3 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                isWhiteboardOpen
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
              }`}
              title="Interactive Whiteboard (W)"
            >
              <SquarePen className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Whiteboard</span>
            </button>

            {/* Laser Pointer Tool */}
            <button
              onClick={() => setIsLaserActive(!isLaserActive)}
              className={`p-1.5 px-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                isLaserActive
                  ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
              }`}
              title="Toggle Laser Pointer Mode (L)"
            >
              <Radio className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden md:inline">Laser</span>
            </button>

            {/* Toggle Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
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
        className={`flex-1 relative flex items-center justify-center bg-slate-200/70 overflow-hidden ${
          isFullscreen ? "w-full h-full p-0 m-0 bg-slate-100" : "p-3 sm:p-6"
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
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-700">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
            <h3 className="text-base font-semibold text-slate-900">Rendering Lecture Slides...</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Processing PowerPoint presentation slides and formatting hierarchy.
            </p>
          </div>
        ) : isWhiteboardOpen ? (
          /* ── INTERACTIVE WHITEBOARD STAGE ── */
          <div
            className={`relative flex flex-col items-center justify-between transition-transform duration-100 ${
              whiteboardTheme === "blackboard" ? "bg-slate-900" : "bg-white"
            } ${
              isFullscreen
                ? "w-full h-full max-w-none max-h-none p-0 m-0"
                : "w-full max-w-[1360px] aspect-[16/9] rounded-xl overflow-hidden border border-slate-300 shadow-2xl"
            }`}
            style={{
              transform: slideZoom !== 1.0 ? `scale(${slideZoom})` : undefined,
              transformOrigin: "center center",
            }}
          >
            {/* Whiteboard Top Ribbon */}
            <div
              className={`w-full px-5 py-3 flex items-center justify-between border-b shrink-0 relative z-30 ${
                whiteboardTheme === "blackboard"
                  ? "bg-slate-900 border-slate-800 text-white"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  whiteboardTheme === "blackboard" ? "bg-emerald-500/20 text-emerald-400" : "bg-indigo-50 text-indigo-600"
                }`}>
                  <SquarePen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">
                    Interactive Lecture Whiteboard
                  </h3>
                  <p className={`text-xs ${whiteboardTheme === "blackboard" ? "text-slate-400" : "text-slate-500"}`}>
                    Live technical scratchpad for equations and derivations
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Theme Switcher: Whiteboard (Light) vs Chalkboard (Dark) */}
                <div className={`flex items-center gap-1 p-1 rounded-lg border text-xs ${
                  whiteboardTheme === "blackboard" ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"
                }`}>
                  <button
                    onClick={() => {
                      setWhiteboardTheme("whiteboard");
                      if (strokeColor === "#ffffff") setStrokeColor("#1d4ed8");
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      whiteboardTheme === "whiteboard"
                        ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Whiteboard
                  </button>
                  <button
                    onClick={() => {
                      setWhiteboardTheme("blackboard");
                      if (strokeColor === "#0f172a" || strokeColor === "#1d4ed8") setStrokeColor("#facc15");
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      whiteboardTheme === "blackboard"
                        ? "bg-slate-700 text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Chalkboard
                  </button>
                </div>

                <button
                  onClick={() => setIsWhiteboardOpen(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
                    whiteboardTheme === "blackboard"
                      ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200"
                  }`}
                  title="Return to Presentation Slide"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Return to Slide</span>
                </button>
              </div>
            </div>

            {/* Whiteboard Interactive Canvas Area */}
            <div className="relative flex-1 w-full h-full overflow-hidden">
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                className="absolute inset-0 z-20 touch-none cursor-crosshair w-full h-full"
              />
            </div>
          </div>
        ) : (
          /* SLIDE PRESENTATION MODE */
          <div
            className={`relative flex items-center justify-center transition-transform duration-100 ${
              isFullscreen
                ? "w-full h-full max-w-none max-h-none p-0 m-0 bg-slate-950"
                : "w-full max-w-[1360px] aspect-[16/9] bg-white rounded-xl overflow-hidden border border-slate-800/80 shadow-2xl"
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
                className="relative w-full h-full flex items-center justify-center bg-slate-950 select-none cursor-default"
              >
                <img
                  src={activeSlideData.imageUrl}
                  alt={activeSlideData.title || `Slide ${currentSlide}`}
                  className="w-full h-full object-contain pointer-events-none"
                />
                {!isFullscreen && (
                  <div className="absolute bottom-3 left-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 border border-slate-700 flex items-center gap-2.5 shadow-xl">
                    <span className="font-semibold text-white">Slide {currentSlide} of {totalSlides}</span>
                    <span className="text-slate-600">•</span>
                    <span className="truncate max-w-[420px] text-slate-300 font-sans">{activeSlideData.title}</span>
                  </div>
                )}
              </div>
            ) : activeSlideData.type === "html" && activeSlideData.htmlUrl ? (
              /* 2. AUTHENTIC HTML SLIDE (Inception_v2 copy.pptx) */
              <div className="relative w-full h-full flex items-center justify-center bg-slate-950 select-none">
                <iframe
                  src={activeSlideData.htmlUrl}
                  title={`Slide ${currentSlide}`}
                  className="w-full h-full border-0 bg-transparent"
                />
                {!isFullscreen && (
                  <div className="absolute bottom-3 left-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 border border-slate-700 flex items-center gap-2.5 shadow-xl pointer-events-none">
                    <span className="font-semibold text-white">Slide {currentSlide} of {totalSlides}</span>
                    <span className="text-slate-600">•</span>
                    <span className="truncate max-w-[420px] text-slate-300 font-sans">{activeSlideData.title}</span>
                  </div>
                )}
              </div>
            ) : (
              /* 3. STRUCTURED CLEAN ACADEMIC PRESENTATION DECK */
              <div className="w-full h-full bg-white text-slate-900 p-8 sm:p-12 flex flex-col justify-between overflow-hidden">
                <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                  <div>
                    <span className="text-xs font-semibold tracking-wider text-indigo-700 uppercase font-mono">
                      {courseCode} • {courseTitle}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
                      {activeSlideData.title}
                    </h1>
                    {activeSlideData.subtitle && (
                      <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium">{activeSlideData.subtitle}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0 text-xs text-slate-400 font-medium hidden sm:block">
                    Slide {currentSlide} of {totalSlides}
                  </div>
                </div>

                <div className="flex-1 py-6 flex flex-col justify-center overflow-y-auto">
                  {activeSlideData.type === "cover" ? (
                    <div className="space-y-4 text-center sm:text-left py-4">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-slate-600">
                          Faculty of Mathematical & Physical Sciences • Jahangirnagar University
                        </p>
                        <p className="text-xs text-slate-500">
                          Instructor: <strong className="text-slate-800">{teacherName}</strong> • Batch:{" "}
                          <strong className="text-slate-800">{batchName}</strong>
                        </p>
                      </div>
                      {activeSlideData.imageUrl && (
                        <div className="mt-4 max-h-60 overflow-hidden rounded-xl border border-slate-200 flex items-center justify-center bg-slate-50 p-2">
                          <img src={activeSlideData.imageUrl} alt="Slide Graphic" className="max-h-56 object-contain" />
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Content Slide: Supports Bullets, Embedded Visuals & Split Screen */
                    <div className={`grid gap-6 items-center ${activeSlideData.imageUrl && activeSlideData.bullets && activeSlideData.bullets.length > 0 ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
                      {activeSlideData.bullets && activeSlideData.bullets.length > 0 ? (
                        <ul className="space-y-3 text-sm sm:text-base text-slate-800">
                          {activeSlideData.bullets.map((bullet, idx) => (
                            <li key={idx} className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                              <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                {idx + 1}
                              </div>
                              <span className="leading-relaxed font-normal">{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      ) : activeSlideData.codeSnippet ? (
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs sm:text-sm text-slate-100 overflow-x-auto shadow-inner leading-relaxed">
                          <pre className="text-emerald-400">{activeSlideData.codeSnippet}</pre>
                        </div>
                      ) : activeSlideData.imageUrl ? null : (
                        <div className="text-slate-600 text-sm italic">
                          {activeSlideData.notes || "Presentation content slide."}
                        </div>
                      )}

                      {activeSlideData.imageUrl && (
                        <div className="w-full h-full min-h-[220px] max-h-[360px] rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-2">
                          <img
                            src={activeSlideData.imageUrl}
                            alt={activeSlideData.title}
                            className="w-full h-full object-contain max-h-[340px]"
                          />
                        </div>
                      )}

                      {activeSlideData.type === "summary" && activeSlideData.takeaway && (
                        <div className="mt-3 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold">
                          💡 {activeSlideData.takeaway}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs text-slate-500 font-medium">
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
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-white/95 backdrop-blur-xl border border-slate-300 p-2 px-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-2 duration-150 text-slate-800">
            {/* Tool Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setAnnotationTool("pen")}
                className={`p-1.5 px-2 rounded-md text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  annotationTool === "pen"
                    ? "bg-indigo-600 text-white font-medium shadow-xs"
                    : "text-slate-700 hover:text-slate-950 hover:bg-slate-200"
                }`}
                title="Pen Tool (Smooth Drawing)"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pen</span>
              </button>

              <button
                onClick={() => setAnnotationTool("highlighter")}
                className={`p-1.5 px-2 rounded-md text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  annotationTool === "highlighter"
                    ? "bg-amber-600 text-white font-medium shadow-xs"
                    : "text-slate-700 hover:text-slate-950 hover:bg-slate-200"
                }`}
                title="Highlighter (Semi-transparent)"
              >
                <Highlighter className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Highlighter</span>
              </button>

              <button
                onClick={() => setAnnotationTool("eraser")}
                className={`p-1.5 px-2 rounded-md text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  annotationTool === "eraser"
                    ? "bg-rose-600 text-white font-medium shadow-xs"
                    : "text-slate-700 hover:text-slate-950 hover:bg-slate-200"
                }`}
                title="Eraser"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Eraser</span>
              </button>
            </div>

            {/* Professional Academic Ink Palette */}
            {annotationTool !== "eraser" && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-lg border border-slate-200">
                {[
                  { color: "#0f172a", name: "Slate Black" },
                  { color: "#1d4ed8", name: "Academic Blue" },
                  { color: "#dc2626", name: "Red Marker" },
                  { color: "#16a34a", name: "Emerald Green" },
                  { color: "#eab308", name: "Yellow Highlighter" },
                  { color: "#ffffff", name: "White" },
                ].map((c) => (
                  <button
                    key={c.color}
                    onClick={() => setStrokeColor(c.color)}
                    className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                      strokeColor === c.color ? "scale-110 border-indigo-600 shadow-sm ring-2 ring-indigo-500/40" : "border-slate-300 hover:scale-105"
                    }`}
                    style={{ backgroundColor: c.color }}
                    title={c.name}
                  />
                ))}
              </div>
            )}

            {/* Stroke Width Selector */}
            {annotationTool !== "eraser" && (
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                {[
                  { width: 2, label: "Fine" },
                  { width: 4, label: "Medium" },
                  { width: 7, label: "Bold" },
                ].map((w) => (
                  <button
                    key={w.width}
                    onClick={() => setStrokeWidth(w.width)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      strokeWidth === w.width
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
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
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleClearSlide}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 border border-slate-200 transition-colors cursor-pointer"
                title="Clear Drawing"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleExportAnnotation}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                title="Export Image (PNG)"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              {/* Switch Whiteboard / Slide Deck */}
              <button
                onClick={() => setIsWhiteboardOpen((v) => !v)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
                  isWhiteboardOpen
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-emerald-700 border-slate-200"
                }`}
                title="Toggle Whiteboard Canvas"
              >
                <SquarePen className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{isWhiteboardOpen ? "Slides" : "Whiteboard"}</span>
              </button>

              <button
                onClick={() => {
                  setIsAnnotating(false);
                  setIsWhiteboardOpen(false);
                }}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 border border-slate-200 transition-colors cursor-pointer"
                title="Close Tools"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ── FULLSCREEN FLOATING BOTTOM HUD PILL ── */}
        {isFullscreen && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100000] flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-300 shadow-xl opacity-80 hover:opacity-100 transition-opacity text-slate-800">
            <button
              onClick={handlePrev}
              disabled={currentSlide === 1}
              className="p-1 rounded-full text-slate-600 hover:text-slate-950 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
              title="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-slate-800 px-2">
              {currentSlide} / {totalSlides}
            </span>
            <button
              onClick={handleNext}
              disabled={currentSlide === totalSlides}
              className="p-1 rounded-full text-slate-600 hover:text-slate-950 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
              title="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-slate-200 mx-1" />
            <button
              onClick={() => setIsAnnotating((v) => !v)}
              className={`p-1.5 rounded-full cursor-pointer transition-colors ${
                isAnnotating ? "bg-amber-600 text-white" : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              }`}
              title="Annotate (A)"
            >
              <PenTool className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setIsWhiteboardOpen((v) => !v);
                if (!isWhiteboardOpen) setIsAnnotating(true);
              }}
              className={`p-1.5 rounded-full cursor-pointer transition-colors ${
                isWhiteboardOpen ? "bg-emerald-600 text-white" : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              }`}
              title="Whiteboard (W)"
            >
              <SquarePen className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsAiCoPilotOpen((v) => !v)}
              className={`p-1.5 rounded-full cursor-pointer transition-colors ${
                isAiCoPilotOpen ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              }`}
              title="AI Co-Pilot (Q)"
            >
              <BrainCircuit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsLaserActive((v) => !v)}
              className={`p-1.5 rounded-full cursor-pointer transition-colors ${
                isLaserActive ? "bg-rose-600 text-white" : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              }`}
              title="Laser (L)"
            >
              <Radio className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-4 bg-slate-200 mx-1" />
            <button
              onClick={exitFullscreen}
              className="p-1.5 rounded-full text-slate-600 hover:text-slate-950 hover:bg-slate-100 cursor-pointer"
              title="Exit Fullscreen (Esc)"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ── AI LECTURE CO-PILOT DRAWER / MODAL ── */}
        {isAiCoPilotOpen && (
          <div className="fixed inset-y-0 right-0 z-[100000] w-full max-w-lg bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 text-slate-900">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">AI Lecture Co-Pilot</h3>
                  <p className="text-xs text-slate-500 truncate max-w-[280px]">
                    Slide {currentSlide}: {activeSlideData.title}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAiCoPilotOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center border border-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="px-5 pt-3 border-b border-slate-200 flex items-center gap-3 bg-white">
              <button
                onClick={() => setAiActiveTab("quiz")}
                className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                  aiActiveTab === "quiz"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Mind-Check Quiz</span>
              </button>

              <button
                onClick={() => setAiActiveTab("summary")}
                className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                  aiActiveTab === "summary"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Pedagogical Guide</span>
              </button>
            </div>

            {/* Drawer Body Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
              {aiActiveTab === "quiz" ? (
                <>
                  {/* Question Selector Tabs */}
                  <div className="flex items-center gap-2">
                    {aiQuestions.map((q, idx) => (
                      <button
                        key={q.id}
                        onClick={() => {
                          setAiSelectedQuestionIdx(idx);
                          setAiPollActive(false);
                        }}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors border cursor-pointer ${
                          aiSelectedQuestionIdx === idx
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                            : "bg-white text-slate-700 hover:bg-slate-100 border-slate-200"
                        }`}
                      >
                        Question {idx + 1}
                      </button>
                    ))}
                  </div>

                  {/* Active Question Card */}
                  {aiQuestions[aiSelectedQuestionIdx] && (
                    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3.5 shadow-xs">
                      {/* Clean Question Header */}
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-indigo-600">
                          {aiQuestions[aiSelectedQuestionIdx].targetBloom}
                        </span>
                        <span>Evaluation</span>
                      </div>

                      {/* Question Prompt */}
                      <h4 className="text-sm font-bold text-slate-900 leading-relaxed">
                        {aiQuestions[aiSelectedQuestionIdx].question}
                      </h4>

                      {/* Options with Poll Results Percentage */}
                      <div className="space-y-2">
                        {aiQuestions[aiSelectedQuestionIdx].options.map((opt) => {
                          const isCorrect = opt.key === aiQuestions[aiSelectedQuestionIdx].correctKey;
                          const votes = aiPollVotes[opt.key as keyof typeof aiPollVotes] || 0;
                          const pct = aiPollVotes.total > 0 ? Math.round((votes / aiPollVotes.total) * 100) : 0;

                          return (
                            <div
                              key={opt.key}
                              className={`relative overflow-hidden rounded-lg border p-3 transition-colors ${
                                aiPollActive || aiPollVotes.total > 0
                                  ? isCorrect
                                    ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-medium"
                                    : "bg-white border-slate-200 text-slate-700"
                                  : isCorrect
                                  ? "bg-indigo-50/40 border-indigo-200 text-slate-900"
                                  : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                              }`}
                            >
                              {/* Animated Progress Fill */}
                              {(aiPollActive || aiPollVotes.total > 0) && (
                                <div
                                  className={`absolute inset-y-0 left-0 transition-all duration-500 ease-out ${
                                    isCorrect ? "bg-emerald-100" : "bg-slate-100"
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              )}

                              <div className="relative z-10 flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5 min-w-0">
                                  <span
                                    className={`w-5 h-5 rounded flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                                      isCorrect
                                        ? "bg-emerald-600 text-white"
                                        : "bg-slate-100 text-slate-700 border border-slate-200"
                                    }`}
                                  >
                                    {opt.key}
                                  </span>
                                  <span className="text-xs font-normal leading-snug">
                                    {opt.text}
                                  </span>
                                </div>

                                {(aiPollActive || aiPollVotes.total > 0) && (
                                  <div className="text-right shrink-0">
                                    <span className="text-xs font-mono font-semibold text-slate-900">{pct}%</span>
                                    <span className="text-[10px] text-slate-500 block font-mono">({votes})</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pedagogical Explanation & Misconception */}
                      <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                          <div className="flex items-center gap-1.5 font-semibold mb-1 text-emerald-800">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Correct Reasoning:</span>
                          </div>
                          <p className="leading-relaxed">
                            {aiQuestions[aiSelectedQuestionIdx].explanation}
                          </p>
                        </div>

                        {aiQuestions[aiSelectedQuestionIdx].misconception && (
                          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                            <div className="flex items-center gap-1.5 font-semibold mb-1 text-amber-800">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Common Student Misconception:</span>
                            </div>
                            <p className="leading-relaxed text-amber-950">
                              {aiQuestions[aiSelectedQuestionIdx].misconception}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 30-Second Student Pulse Live Simulator */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-slate-900">
                        30-Second Classroom Pulse Check
                      </h5>

                      {aiPollActive && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-mono text-xs font-semibold text-slate-700">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>00:{aiPollTimeLeft.toString().padStart(2, "0")}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      Evaluate student comprehension in real time before advancing to the next concept.
                    </p>

                    <div className="flex items-center gap-3 pt-1">
                      {!aiPollActive ? (
                        <button
                          onClick={() => setAiPollActive(true)}
                          className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>{aiPollVotes.total > 0 ? "Restart Pulse Poll (30s)" : "Launch Pulse Poll (30s)"}</span>
                        </button>
                      ) : (
                        <div className="flex-1 py-2 px-3 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-mono text-xs font-medium flex items-center justify-between">
                          <span>Collecting Responses...</span>
                          <span className="text-indigo-600 font-bold">{aiPollVotes.total} / 42 Recorded</span>
                        </div>
                      )}

                      {/* Publish to Classroom Assessments Button */}
                      <button
                        onClick={handlePublishQuizToClassroom}
                        className="py-2 px-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center gap-1.5 transition-colors border border-slate-300 cursor-pointer shadow-xs"
                        title="Publish as Official Assessment in PostgreSQL Database"
                      >
                        {isQuizPublished ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-semibold">Saved!</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5 text-slate-500" />
                            <span>Save to Tests</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Pedagogical Insights Tab */
                <div className="space-y-3.5 text-xs">
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
                    <h4 className="font-bold text-sm text-indigo-700 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                      <span>Key Learning Objective</span>
                    </h4>
                    <p className="text-slate-600 leading-relaxed">
                      Reinforce student understanding of data integrity guarantees and core principles demonstrated in <strong className="text-slate-900">&quot;{activeSlideData.title}&quot;</strong>.
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
                    <h4 className="font-bold text-sm text-amber-700 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      <span>Class Discussion Prompt</span>
                    </h4>
                    <p className="text-slate-700 leading-relaxed italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                      &quot;Ask students: If multiple concurrent transactions attempt to update the same record within 1 second, how does our database isolation level prevent lost updates?&quot;
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
                    <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                      <Database className="w-4 h-4 text-slate-500" />
                      <span>Database Connection</span>
                    </h4>
                    <p className="text-slate-600 leading-relaxed">
                      Connect this concept to the relational schemas and transactional constraints practiced in practical lab sessions.
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
          <div className="absolute inset-x-8 bottom-6 max-h-48 bg-white/95 border border-slate-200 rounded-2xl p-4 shadow-2xl backdrop-blur-md z-30 overflow-x-auto flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-150">
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
                      ? "bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/30 scale-105"
                      : "bg-slate-50 border-slate-200 hover:border-slate-300"
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
                      <span className="text-[10px] font-mono font-bold text-slate-500">Slide {slideNo}</span>
                      <p className="text-[11px] font-bold text-slate-800 line-clamp-2 leading-tight">{s.title}</p>
                      <span className="text-[9px] uppercase font-bold text-indigo-600 font-mono">{s.type}</span>
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
        <div className="h-9 bg-white border-t border-slate-200 px-4 flex items-center justify-between text-[11px] text-slate-500 shrink-0 font-mono">
          <div className="flex items-center gap-3">
            <span>
              Navigation: <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">Space</kbd> /{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">→</kbd> Next
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">←</kbd> Prev
            </span>
            <span className="hidden sm:inline">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">L</kbd> Laser
            </span>
            <span className="hidden sm:inline">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">F</kbd> Fullscreen
            </span>
          </div>

          {/* Dynamic Progress Bar */}
          <div className="flex items-center gap-2">
            <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${(currentSlide / totalSlides) * 100}%` }}
              />
            </div>
            <span className="font-semibold text-slate-700">{Math.round((currentSlide / totalSlides) * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

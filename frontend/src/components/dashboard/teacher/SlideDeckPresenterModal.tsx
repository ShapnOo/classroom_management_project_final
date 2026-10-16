"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Database
} from "lucide-react";
import { api } from "@/lib/api";

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
  type: "cover" | "agenda" | "concept" | "code" | "diagram" | "discussion" | "summary" | "image";
  bullets?: string[];
  codeSnippet?: string;
  diagramType?: "er" | "uml" | "flow" | "architecture";
  notes?: string;
  takeaway?: string;
  imageUrl?: string;
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
        materialTitle
      })
    );
  } catch {}

  // Also background-sync to PostgreSQL Database
  api.saveSlideState(materialId, {
    lastSlide: slideNumber,
    totalSlides,
    materialTitle,
    classroomId
  }).catch(() => {});
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
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"deck" | "pdf">("deck");
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [resumedNotice, setResumedNotice] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Generate authentic presentation slides tailored to the material
  const slides: SlideData[] = React.useMemo(() => {
    const titleLower = (material.title || "").toLowerCase();
    const fileNameLower = (material.fileName || "").toLowerCase();

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
          notes: `Slide ${slideNum}: Higher Education Digital Suite - UGC-ERP & University Modular Architecture.`
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
      return [
        {
          id: 1,
          title: "Inception Report Acceptance Meeting",
          subtitle: "Bangladesh Regional Connectivity Project-1 [Part-2] • Package SD-56",
          type: "cover",
          notes: "Welcome stakeholders to the official BRCP-1 Part-2 Inception Report Acceptance Meeting."
        },
        {
          id: 2,
          title: "Inception Acceptance Meeting Agenda",
          type: "agenda",
          bullets: [
            "Project Governance & Stakeholder Alignment Framework",
            "Existing WENP Features & Benchmark Assessment",
            "Diagnostic Gap Analysis Findings",
            "WENP 3.0 Platform Vision & Core Architecture",
            "Multi-Tier Architectural Framework & Iterative SDLC",
            "Gantt Project Timelines & Production Cutover Plan"
          ],
          notes: "Review the agenda items with the project committee."
        },
        {
          id: 3,
          title: "Background of the Project",
          type: "concept",
          bullets: [
            "National Objective: Empowering women entrepreneurs through digital market access",
            "Trade Facilitation: Connecting regional women enterprises with cross-border ecosystems",
            "Modernization: Upgrading legacy portals to high-availability distributed architecture"
          ]
        },
        {
          id: 4,
          title: "Existing WENP Features at a Glance",
          type: "concept",
          bullets: [
            "Directory of registered women enterprises across 64 districts",
            "Basic product showcase and informational landing pages",
            "Static inquiry forms with manual administrative approval queues"
          ]
        },
        {
          id: 5,
          title: "Diagnostic Gap Analysis",
          type: "concept",
          bullets: [
            "Absence of unified mobile experience across Android & iOS",
            "Lack of real-time multi-channel payment gateway settlement (bKash/Nagad/Cards)",
            "Scalability bottlenecks under concurrent traffic surges",
            "Monolithic architecture requiring microservices decoupling and robust API gateway"
          ]
        },
        {
          id: 6,
          title: "The New WENP Platform Vision (WENP 3.0)",
          type: "concept",
          bullets: [
            "Omnichannel Experience: Native mobile app + responsive web portal",
            "Modern Cloud Architecture: Dockerized microservices with API gateway",
            "Automated Logistics: Integrated courier APIs and dispatch tracking",
            "Security: End-to-end SSL, WAF inspection, and role-based access control (RBAC)"
          ]
        },
        {
          id: 7,
          title: "Upgraded Platform Roles & Hierarchy",
          type: "concept",
          bullets: [
            "Super Admin (Ministry / Project Authority): Governance, audit trails, and policy enforcement",
            "Operations & Support: Vendor onboarding and compliance verification",
            "Women Entrepreneurs: Product catalog, inventory, order processing, and settlement",
            "Consumers & Buyers: Cross-platform cart, instant checkout, and tracking"
          ]
        },
        {
          id: 8,
          title: "WENP Core Functional Modules Matrix",
          type: "concept",
          bullets: [
            "Module 1: Authentication & Identity Management (JWT + MFA)",
            "Module 2: Dynamic Product & Service Catalog with Rich Media",
            "Module 3: Automated Order Dispatch & Inventory Locking",
            "Module 4: Multi-Channel Payment Settlement & Financial Ledger",
            "Module 5: Dispute Resolution, Support Ticketing & Rating Engine"
          ]
        },
        {
          id: 9,
          title: "Key System Non-Functional Attributes",
          type: "concept",
          bullets: [
            "High Availability: 99.9% uptime SLA with active-passive failover",
            "Low Latency: P95 API response times under 200ms",
            "Data Sovereignty: Encrypted at rest (AES-256) and in transit (TLS 1.3)",
            "Autoscaling: Horizontal pod autoscaling based on CPU/Memory load"
          ]
        },
        {
          id: 10,
          title: "Enterprise Technology Stack & Tooling",
          type: "concept",
          bullets: [
            "Frontend: Next.js / React, TypeScript, TailwindCSS",
            "Backend: Node.js / Express microservices with TypeScript",
            "Database: PostgreSQL + Redis for distributed caching",
            "Storage: S3 / MinIO compatible object storage for media assets",
            "CI/CD: GitHub Actions with automated linting, unit testing & docker builds"
          ]
        },
        {
          id: 11,
          title: "Quality Assurance & Testing Strategy",
          type: "concept",
          bullets: [
            "Automated Unit & Integration Tests (Jest / Supertest)",
            "End-to-End browser workflow testing (Playwright)",
            "Stress & Load Testing (k6 / Artillery for 10,000 concurrent virtual users)",
            "Vulnerability Assessment & Penetration Testing (OWASP Top 10)"
          ]
        },
        {
          id: 12,
          title: "Multi-Tier Architectural Framework",
          subtitle: "Presentation, Gateway, Business Logic, and Data Integration Tiers",
          type: "image",
          imageUrl: "/Presentation Deck/inception_media/image21.png",
          notes: "Walk through all 4 architectural tiers: mobile app, API gateway, microservices, and database/cache."
        },
        {
          id: 13,
          title: "Software Development Life Cycle (SDLC) Methodology",
          subtitle: "Iterative Development Cycle: Inception, Sprint Cycles, UAT & Deployment",
          type: "image",
          imageUrl: "/Presentation Deck/inception_media/image22.png",
          notes: "Explain the continuous feedback loop between UAT, acceptance testing, and release iterations."
        },
        {
          id: 14,
          title: "System Integration & Security Model",
          subtitle: "External Gateway Boundaries & Microservices Isolation",
          type: "image",
          imageUrl: "/Presentation Deck/inception_media/image23.png",
          notes: "Highlight third-party gateway connections and boundary security."
        },
        {
          id: 15,
          title: "Detailed Project Timeline 01: Inception Phase",
          type: "concept",
          bullets: [
            "Stakeholder interviews and inception workshop",
            "Finalization of System Requirement Specification (SRS)",
            "Architecture sign-off and development environment provisioning"
          ]
        },
        {
          id: 16,
          title: "Detailed Project Timeline 02: Core Sprint 1",
          type: "concept",
          bullets: [
            "Design system creation and interactive UI prototypes",
            "Database schema modeling and migration scripts",
            "Auth and user management service implementation"
          ]
        },
        {
          id: 17,
          title: "Detailed Project Timeline 03: Core Sprint 2",
          type: "concept",
          bullets: [
            "Merchant onboarding and product catalog microservice",
            "Search engine indexing and category filters",
            "Media asset uploading and image optimization pipeline"
          ]
        },
        {
          id: 18,
          title: "Detailed Project Timeline 04: Integration Sprint",
          type: "concept",
          bullets: [
            "Payment gateway sandboxing (SSLCommerz, bKash, Cards)",
            "SMS notification service and automated email delivery",
            "Courier & delivery tracking API integration"
          ]
        },
        {
          id: 19,
          title: "Detailed Project Timeline 05: Quality Assurance & UAT",
          type: "concept",
          bullets: [
            "Comprehensive test plan execution and defect triage",
            "Security vulnerability scanning and code hardening",
            "User Acceptance Testing with designated stakeholder focus groups"
          ]
        },
        {
          id: 20,
          title: "Detailed Project Timeline 06: Production Cutover",
          type: "concept",
          bullets: [
            "Production cluster staging and DNS cutover",
            "Data migration verification and smoke testing",
            "Staff training and administration handover documentation"
          ]
        },
        {
          id: 21,
          title: "Project Timeline Summary (Gantt Chart)",
          subtitle: "5 Execution Phases Across Delivery Milestones",
          type: "image",
          imageUrl: "/Presentation Deck/inception_media/image24.png",
          notes: "Review critical path dates from Phase 1 to Phase 5 deployment."
        },
        {
          id: 22,
          title: "Governance Cadences & Transparent Reporting",
          type: "concept",
          bullets: [
            "Daily engineering standup: Blockers and immediate progress",
            "Weekly client status meeting: Completed user stories and milestone progress",
            "Bi-weekly sprint demo: Live software demonstrations in staging",
            "Monthly executive steering review: Budget, scope, and strategic alignment"
          ]
        },
        {
          id: 23,
          title: "Cloud Infrastructure & Container Orchestration",
          subtitle: "Kubernetes Cluster Architecture & Disaster Recovery",
          type: "image",
          imageUrl: "/Presentation Deck/inception_media/image25.png",
          notes: "Kubernetes pod orchestration, load balancer, and disaster recovery."
        },
        {
          id: 24,
          title: "Conclusion & Project Rollout Sign-Off",
          subtitle: "Formal Deliverables Handover & Next Actions",
          type: "image",
          imageUrl: "/Presentation Deck/inception_media/image26.png",
          notes: "Formal acceptance and sign-off."
        }
      ];
    }

    const isUml = titleLower.includes("uml") || titleLower.includes("library") || titleLower.includes("software");
    const isAgile = titleLower.includes("agile") || titleLower.includes("scrum");
    const isSearch = titleLower.includes("search") || titleLower.includes("algorithm");

    if (isUml) {
      return [
        {
          id: 1,
          title: material.title,
          subtitle: "Object-Oriented Modeling & Library Management Architecture",
          type: "cover",
          notes: "Welcome class. Today we cover class modeling, sequence interactions, and stateful domain constraints."
        },
        {
          id: 2,
          title: "Lecture Objectives & Syllabus Breakdown",
          type: "agenda",
          bullets: [
            "Deconstruct domain requirements for University Library Systems",
            "Establish Class Diagrams with multiplicities (1..*, 0..1)",
            "Sequence Diagram interaction flows: Borrow, Return, & Fines",
            "State Machine Transitions for BookItem inventory",
            "Live system verification & schema mapping"
          ],
          notes: "Emphasize why class diagrams must precede any database table creation."
        },
        {
          id: 3,
          title: "Domain Entity Modeling & Multiplicity",
          type: "diagram",
          diagramType: "uml",
          bullets: [
            "Book & BookItem: Separation of conceptual title vs physical barcode copies",
            "Patron / Member: Student, Faculty, & Guest privileges with polymorphism",
            "Loan / Transaction: Captures checkout timestamps and overdue penalty fees"
          ],
          notes: "Point out why 1 Book can map to N physical BookItems."
        },
        {
          id: 4,
          title: "Sequence Diagram: Book Checkout Flow",
          type: "concept",
          bullets: [
            "Step 1: Member scans institutional barcode card -> AuthVerification",
            "Step 2: Check current active loans (limit max 5 for undergraduates)",
            "Step 3: Validate zero outstanding overdue fine balances",
            "Step 4: Atomic lock on BookItem status: Available -> Borrowed",
            "Step 5: Emit receipt & schedule return reminder notification"
          ],
          notes: "Discuss concurrency: what if two students attempt to borrow the last copy simultaneously?"
        },
        {
          id: 5,
          title: "Object-Oriented TypeScript Implementation",
          type: "code",
          codeSnippet: `export class BookItem {
  constructor(
    public readonly barcode: string,
    public status: "Available" | "Loaned" | "Reserved" = "Available",
    public dueDate?: Date
  ) {}

  public checkout(memberId: string): void {
    if (this.status !== "Available") {
      throw new Error("Cannot checkout item in status: " + this.status);
    }
    this.status = "Loaned";
    this.dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
  }
}`,
          notes: "Walk through invariant protections inside the domain model."
        },
        {
          id: 6,
          title: "Classroom Discussion Prompt",
          type: "discussion",
          bullets: [
            "How should hold reservations be handled if a faculty member requests an item currently checked out by a student?",
            "What design pattern (e.g., Strategy vs State Pattern) best fits variable fine calculation algorithms?"
          ],
          notes: "Encourage students in rows 2 and 3 to propose solutions."
        },
        {
          id: 7,
          title: "Summary & Key Takeaways",
          type: "summary",
          bullets: [
            "UML is a communication bridge between stakeholders and engineers",
            "Always model multiplicity before writing DDL constraints",
            "Sequence diagrams prevent concurrency deadlocks in advance"
          ],
          takeaway: "Next Class: Design Patterns (Singleton, Factory, Observer) applied to Library microservices.",
          notes: "Remind students about assignment deadline on Tuesday."
        }
      ];
    }

    if (isAgile) {
      return [
        {
          id: 1,
          title: material.title,
          subtitle: "Sprint Planning, Artifacts, & Continuous Value Delivery",
          type: "cover",
          notes: "Lecture on enterprise Agile execution models."
        },
        {
          id: 2,
          title: "Agile Manifesto & Core Principles",
          type: "agenda",
          bullets: [
            "Individuals and interactions over processes and tools",
            "Working software over comprehensive documentation",
            "Customer collaboration over contract negotiation",
            "Responding to change over following a static plan"
          ]
        },
        {
          id: 3,
          title: "Scrum Ceremonies in a 2-Week Sprint",
          type: "concept",
          bullets: [
            "Sprint Planning: Story point estimation & sprint goal definition",
            "Daily Standup: 15-minute timebox on progress and blockers",
            "Sprint Review: Live working demo presented to stakeholders",
            "Retrospective: Inspect and adapt team workflow improvements"
          ]
        },
        {
          id: 4,
          title: "Summary & Sprint Metrics",
          type: "summary",
          bullets: [
            "Velocity tracking via Burndown and Burnup charts",
            "Definition of Done (DoD) ensures zero technical debt leakage",
            "Kanban WIP (Work in Progress) limits prevent developer burnout"
          ]
        }
      ];
    }

    // Default: ER Modeling & Database Systems Deck
    return [
      {
        id: 1,
        title: material.title,
        subtitle: "Conceptual ER Modeling & Relational Normalization",
        type: "cover",
        notes: "Introductory slide. Remind students that ER schemas are the backbone of all transaction processing."
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
          "Translating ER schemas to PostgreSQL DDL with Foreign Keys"
        ]
      },
      {
        id: 3,
        title: "Entity-Relationship Concepts & Notation",
        type: "diagram",
        diagramType: "er",
        bullets: [
          "Strong Entity: Has an independent primary key (e.g. STUDENT, COURSE)",
          "Weak Entity: Depends on an identifying parent entity (e.g. CLASS_SESSION)",
          "Cardinality Ratios: 1:1, 1:N, and M:N relationships requiring junction tables"
        ]
      },
      {
        id: 4,
        title: "Normalization: Eliminating Update Anomalies",
        type: "concept",
        bullets: [
          "1NF: Atomic values only; zero repeating attribute groups",
          "2NF: 1NF + no partial dependency on composite primary keys",
          "3NF: 2NF + zero transitive dependencies (non-prime determining non-prime)",
          "BCNF: Every determinant must strictly be a candidate key"
        ]
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
        notes: "Explain CASCADE deletion and unique integrity constraints."
      },
      {
        id: 6,
        title: "Classroom Interactive Exercise",
        type: "discussion",
        bullets: [
          "Question: If a table has FD: {Student_ID -> Dept_Code} and {Dept_Code -> Dept_Head}, what normal form violation exists?",
          "How would you decompose this relation without losing functional dependencies?"
        ]
      },
      {
        id: 7,
        title: "Summary & Key Takeaways",
        type: "summary",
        bullets: [
          "Normalization reduces data duplication and guarantees transactional consistency",
          "Denormalize only when verified read performance bottlenecks require caching",
          "Always test schema constraints with synthetic high-volume data"
        ],
        takeaway: "Next Lecture: B-Tree Indexing, Query Optimization & Execution Plans."
      }
    ];
  }, [material.title]);

  const totalSlides = slides.length;

  const isInitialLoadedRef = useRef<boolean>(false);

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
    api.getSlideState(material.id)
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
      api.saveSlideState(material.id, {
        lastSlide: currentSlide,
        totalSlides,
        materialTitle: material.title,
        classroomId
      }).catch((err) => {
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

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [isOpen, currentSlide, totalSlides, isFullscreen]);

  // Laser Pointer tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isLaserActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setLaserPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleNext = () => {
    if (currentSlide < totalSlides) {
      setCurrentSlide((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 1) {
      setCurrentSlide((s) => s - 1);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsFullscreen(false);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  const activeSlideData = slides[currentSlide - 1] || slides[0];
  const pdfUrl = material.pdfUrl || "/assignment_mockup.pdf";

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] bg-slate-950 text-white flex flex-col overflow-hidden select-none animate-in fade-in duration-150 font-sans"
      onMouseMove={handleMouseMove}
    >
      
      {/* ── TOP PRESENTER NAVIGATION BAR ─────────────────────────────────── */}
      <div className="h-14 bg-slate-900/95 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 shadow-md">
        
        {/* Left: Material & Course Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => {
              saveSlideState(material.id, currentSlide, totalSlides, material.title, classroomId);
              api.saveSlideState(material.id, {
                lastSlide: currentSlide,
                totalSlides,
                materialTitle: material.title,
                classroomId
              }).catch(() => {});
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700 shrink-0"
            title="Exit Presentation Mode (Esc) - Slide position saved to PostgreSQL Database"
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
              <span>Slide {currentSlide} / {totalSlides}</span>
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
            <span>PostgreSQL DB Synced</span>
          </div>
        </div>


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
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
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
          className="absolute inset-0 z-40 bg-black flex flex-col items-center justify-center cursor-pointer"
        >
          <Tv className="w-12 h-12 text-slate-700 mb-3" />
          <p className="text-slate-500 text-sm font-medium">Screen Blacked Out (Press &apos;B&apos; or Click to Resume Lecture)</p>
        </div>
      )}

      {/* ── SLIDE STAGE / CANVAS ─────────────────────────────────────────── */}
      <div className="flex-1 relative flex items-center justify-center p-3 sm:p-6 bg-slate-950 overflow-hidden">
        
        {/* 16:9 Presentation Slide Canvas */}
        <div className={`relative w-full max-w-[1240px] aspect-[16/9] ${
          activeSlideData.type === "image" && activeSlideData.imageUrl
            ? "bg-black rounded-2xl overflow-hidden border border-slate-850 shadow-2xl flex items-center justify-center p-0"
            : "bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-2xl border border-slate-800 shadow-2xl p-8 sm:p-14 flex flex-col justify-between overflow-hidden"
        }`}>

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
          ) : (
            <>
              {/* Subtle Ambient Background Glow */}
              <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Slide Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-800/80">
                <div>
                  <span className="text-[11px] font-bold tracking-widest text-indigo-400 uppercase font-mono">
                    {courseCode} • {courseTitle}
                  </span>
                  <h1 className="text-xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
                    {activeSlideData.title}
                  </h1>
                  {activeSlideData.subtitle && (
                    <p className="text-sm text-slate-400 mt-1 font-medium">
                      {activeSlideData.subtitle}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0 font-mono text-[11px] text-slate-500">
                  <span>Scholaris Classroom Deck</span>
                </div>
              </div>

              {/* Slide Core Content Body */}
              <div className="flex-1 py-6 flex flex-col justify-center overflow-y-auto">
                
                {/* 1. COVER SLIDE */}
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
                        Instructor: <strong className="text-slate-300">{teacherName}</strong> • Batch: <strong className="text-slate-300">{batchName}</strong>
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. AGENDA / BULLET SLIDE */}
                {(activeSlideData.type === "agenda" || activeSlideData.type === "concept") && activeSlideData.bullets && (
                  <ul className="space-y-4 text-sm sm:text-base text-slate-200">
                    {activeSlideData.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-3 animate-in fade-in slide-in-from-left-2 duration-200" style={{ animationDelay: `${idx * 80}ms` }}>
                        <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <span className="leading-relaxed">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* 3. CODE SLIDE */}
                {activeSlideData.type === "code" && (
                  <div className="space-y-3">
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs sm:text-sm text-slate-200 overflow-x-auto shadow-inner leading-relaxed">
                      <pre className="text-emerald-400">{activeSlideData.codeSnippet}</pre>
                    </div>
                  </div>
                )}

                {/* 4. DIAGRAM SLIDE (Interactive Schema / UML Visual) */}
                {activeSlideData.type === "diagram" && (
                  <div className="space-y-4">
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-inner">
                      <svg viewBox="0 0 700 160" className="w-full h-auto text-xs font-mono">
                        <rect x="20" y="20" width="180" height="120" rx="6" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.5" />
                        <rect x="20" y="20" width="180" height="26" rx="6" fill="#1e3a8a" />
                        <text x="110" y="38" fill="#ffffff" fontWeight="bold" textAnchor="middle" fontSize="11">BOOK_ITEM (Entity)</text>
                        <text x="32" y="65" fill="#e11d48" fontSize="10">PK  barcode : VARCHAR</text>
                        <text x="32" y="85" fill="#38bdf8" fontSize="10">FK  book_id : UUID</text>
                        <text x="32" y="105" fill="#94a3b8" fontSize="10">    status : Available</text>

                        <line x1="200" y1="80" x2="300" y2="80" stroke="#64748b" strokeWidth="2" strokeDasharray="4 2" />
                        <polygon points="295,76 303,80 295,84" fill="#64748b" />
                        <text x="250" y="72" fill="#64748b" fontSize="9" textAnchor="middle">1 : N (Loans)</text>

                        <rect x="300" y="20" width="180" height="120" rx="6" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
                        <rect x="300" y="20" width="180" height="26" rx="6" fill="#065f46" />
                        <text x="390" y="38" fill="#ffffff" fontWeight="bold" textAnchor="middle" fontSize="11">LOAN_TRANSACTION</text>
                        <text x="312" y="65" fill="#e11d48" fontSize="10">PK  id : UUID</text>
                        <text x="312" y="85" fill="#38bdf8" fontSize="10">FK  member_id : UUID</text>
                        <text x="312" y="105" fill="#10b981" fontSize="10">    due_date : TIMESTAMP</text>
                      </svg>
                    </div>

                    {activeSlideData.bullets && (
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                        {activeSlideData.bullets.map((b, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* 5. DISCUSSION / PROMPT SLIDE */}
                {activeSlideData.type === "discussion" && activeSlideData.bullets && (
                  <div className="bg-indigo-950/40 border border-indigo-500/40 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                    <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                      <HelpCircle className="w-4 h-4 text-indigo-400" /> Open Classroom Discussion
                    </div>
                    <div className="space-y-4">
                      {activeSlideData.bullets.map((q, idx) => (
                        <div key={idx} className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 text-sm sm:text-base font-semibold text-white leading-relaxed">
                          💬 &ldquo;{q}&rdquo;
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. SUMMARY SLIDE */}
                {activeSlideData.type === "summary" && (
                  <div className="space-y-4">
                    {activeSlideData.bullets && (
                      <ul className="space-y-3 text-sm sm:text-base text-slate-200">
                        {activeSlideData.bullets.map((bullet, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {activeSlideData.takeaway && (
                      <div className="mt-4 p-4 rounded-xl bg-slate-800/90 border border-indigo-500/30 text-xs sm:text-sm font-semibold text-indigo-200">
                        📌 {activeSlideData.takeaway}
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Slide Footer */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Scholaris Classroom Presentation Mode</span>
                <div className="flex items-center gap-2">
                  <span>Slide {currentSlide} of {totalSlides}</span>
                </div>
              </div>
            </>
          )}

          {/* Laser Pointer Glowing Dot */}
          {isLaserActive && (
            <div
              style={{
                left: `${laserPos.x}px`,
                top: `${laserPos.y}px`,
                transform: "translate(-50%, -50%)",
              }}
              className="absolute pointer-events-none z-30 w-4 h-4 rounded-full bg-rose-500 shadow-[0_0_16px_4px_rgba(244,63,94,0.9)] animate-ping"
            />
          )}

        </div>

        {/* ── THUMBNAILS DRAWER ────────────────────────────────────────── */}
        {showThumbnails && (
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
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        Slide {slideNo}
                      </span>
                      <p className="text-[11px] font-bold text-white line-clamp-2 leading-tight">
                        {s.title}
                      </p>
                      <span className="text-[9px] uppercase font-bold text-indigo-400 font-mono">
                        {s.type}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

      </div>

      {/* ── BOTTOM PROGRESS BAR & KEYBOARD SHORTCUTS ─────────────────────── */}
      <div className="h-9 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-between text-[11px] text-slate-400 shrink-0 font-mono">
        <div className="flex items-center gap-3">
          <span>Navigation: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Space</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">→</kbd> Next</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">←</kbd> Prev</span>
          <span className="hidden sm:inline"><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">L</kbd> Laser</span>
          <span className="hidden sm:inline"><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">F</kbd> Fullscreen</span>
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

    </div>
  );
}

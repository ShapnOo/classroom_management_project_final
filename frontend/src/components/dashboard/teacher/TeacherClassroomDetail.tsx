"use client";

import {
  Users, Clock, Play, FolderOpen, ClipboardCheck,
  Search, CalendarDays, BookOpen, LayoutGrid,
  Info, MapPin, ArrowLeft, CheckCircle2, Circle, TrendingUp,
  Plus, Edit2, Trash2, FileText, ListTodo, Bell, Download, ChevronRight,
  Sparkles, Award, AlertCircle, X, ExternalLink, Filter,
  Check, Calendar, Megaphone, Share2, Layers, CheckSquare,
  UserCheck, UserX, Clock3, RotateCcw, Sliders, Presentation, Tv, Database,
  FileCode, Eye, MessageSquare, PlusCircle, ChevronLeft, CornerDownRight,
  ZoomIn, ZoomOut, Maximize2, Tag, ThumbsUp, FileCheck, StickyNote, Highlighter,
  Upload, Loader2
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import type { SyllabusTopic, Assignment, Test, Announcement, AttendanceRecord } from "@/lib/types";
import ModalDialog from "@/components/ui/ModalDialog";
import { ClassroomDetailSkeleton } from "@/components/ui/Skeleton";
import SlideDeckPresenterModal, { getSavedSlideState } from "./SlideDeckPresenterModal";
import { parsePptx } from "@/lib/pptxParser";

interface TeacherClassroomDetailProps {
  classroomId: string;
}

type AttendanceStatus = AttendanceRecord["status"];

const getMockStudentSubmissionCode = (studentName: string, title: string) => {
  return `/**
 * Submission Title: ${title}
 * Student: ${studentName}
 * Submitted via Classroom Portal
 */

import React, { useState, useEffect } from 'react';

// Custom Hook for Classroom Activity Management
export function useClassroomAnalytics(classroomId: string) {
  const [metrics, setMetrics] = useState<{ totalStudents: number; averageScore: number }>({
    totalStudents: 32,
    averageScore: 84.5,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadMetrics() {
      try {
        // Fetch submission data for student ${studentName}
        const res = await fetch(\`/api/analytics/\${classroomId}\`);
        if (!res.ok) throw new Error("Failed to load metrics");
        const json = await res.json();
        if (isMounted) setMetrics(json);
      } catch (err) {
        console.error("Error loading analytics:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadMetrics();
    return () => { isMounted = false; };
  }, [classroomId]);

  return { metrics, loading };
}

export default function StudentSubmission() {
  const { metrics, loading } = useClassroomAnalytics("cls-9902");

  if (loading) return <div className="p-4">Loading solution...</div>;

  return (
    <div className="p-6 bg-slate-900 text-slate-100 rounded-xl">
      <h1 className="text-xl font-bold">Student Solution: ${title}</h1>
      <p className="mt-2 text-sm text-slate-300">Total Enrolled: {metrics.totalStudents}</p>
      <p className="text-sm text-emerald-400 font-semibold">Average Batch Score: {metrics.averageScore}%</p>
    </div>
  );
}`;
};

export default function TeacherClassroomDetail({ classroomId }: TeacherClassroomDetailProps) {
  const {
    getClassroomView, isLoading,
    classSessions,
    attendanceRecords,
    announcements,
    syllabusTopics,
    addSyllabusTopic,
    updateSyllabusTopic,
    deleteSyllabusTopic,
    addClassSession,
    upsertAttendance,
    addAssignment,
    addTest,
    addAnnouncement,
    updateClassroom,
    fetchClassrooms,
    fetchCourses,
    fetchBatches,
    fetchStudents,
    fetchSyllabusTopics,
    fetchClassSessions,
    fetchAttendanceRecords,
    fetchAssignments,
    fetchTests,
    fetchAnnouncements,
    fetchMaterials,
    materials: storeMaterials,
    addMaterial,
    slideStates,
    fetchSlideStates,
  } = useStore();

  useEffect(() => {
    fetchClassrooms();
    fetchCourses();
    fetchBatches();
    fetchStudents();
    fetchSyllabusTopics();
    fetchClassSessions();
    fetchAttendanceRecords();
    fetchAssignments();
    fetchTests();
    fetchAnnouncements();
    fetchMaterials(classroomId);
    fetchSlideStates();
  }, [classroomId]);

  const view = getClassroomView(classroomId);

  const [activeTab, setActiveTab] = useState<
    "live" | "outline" | "attendance" | "assignments" | "tests" | null
  >(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab && ["live", "outline", "attendance", "assignments", "tests"].includes(tab)) {
        setActiveTab(tab as any);
      }
    }
  }, []);

  // Filter & Search states
  const [studentSearch, setStudentSearch] = useState("");
  const [syllabusFilter, setSyllabusFilter] = useState<"all" | "done" | "current" | "pending">("all");
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  // Modals state
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);
  const [showEvaluationPolicyModal, setShowEvaluationPolicyModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showGradebookModal, setShowGradebookModal] = useState(false);
  const [presenterMaterial, setPresenterMaterial] = useState<any | null>(null);
  const [isPresenterOpen, setIsPresenterOpen] = useState(false);
  const [evaluatingTarget, setEvaluatingTarget] = useState<{
    type: "assignment" | "test";
    id: string;
    title: string;
    totalMarks: number;
  } | null>(null);
  const [evaluatingDraft, setEvaluatingDraft] = useState<Record<string, { marks: string; remarks: string }>>({});
  const [gradebookDraft, setGradebookDraft] = useState<Record<string, { ct: string; assn: string; midterm: string; final: string }>>({});
  const [upsertGradeRecord, fetchGradeRecordsStore] = [useStore().upsertGradeRecord, useStore().fetchGradeRecords];

  // Feature #2: Student Submission Preview & Inline Annotation state
  const [reviewerMode, setReviewerMode] = useState<"split" | "list">("split");
  const [reviewingStudentIndex, setReviewingStudentIndex] = useState(0);
  const [submissionViewTab, setSubmissionViewTab] = useState<"code" | "pdf" | "text">("code");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [annotations, setAnnotations] = useState<
    Record<
      string,
      Array<{
        id: string;
        lineNo?: number;
        comment: string;
        author: string;
        createdAt: string;
        tag?: "bug" | "suggestion" | "praise";
      }>
    >
  >({});
  const [selectedLineForAnnotation, setSelectedLineForAnnotation] = useState<number | null>(null);
  const [inlineCommentInput, setInlineCommentInput] = useState("");
  const [annotationTag, setAnnotationTag] = useState<"bug" | "suggestion" | "praise">("suggestion");
  const [rubricScores, setRubricScores] = useState({
    correctness: 40,
    quality: 30,
    documentation: 20,
  });
  const [singleSaveToast, setSingleSaveToast] = useState<string | null>(null);

  const handleSaveSingleStudentEvaluation = async (studentId: string, autoAdvance = true) => {
    if (!evaluatingTarget || !view) return;
    const currentDraft = evaluatingDraft[studentId] || { marks: String(evaluatingTarget.totalMarks), remarks: "" };
    const studentsList = view.students || [];

    const key = `${evaluatingTarget.id}_${studentId}`;
    const studentAnnotations = annotations[key] || [];
    let finalRemarks = currentDraft.remarks;
    if (studentAnnotations.length > 0 && !finalRemarks.includes("[Inline Notes]")) {
      const notesSummary = studentAnnotations.map((a) => `• ${a.lineNo ? `L${a.lineNo}: ` : ""}${a.comment}`).join("; ");
      finalRemarks = finalRemarks ? `${finalRemarks} | [Inline Notes: ${notesSummary}]` : `[Inline Notes: ${notesSummary}]`;
    }

    await upsertGradeRecord({
      classroomId: view.classroom.id,
      studentId,
      assignmentId: evaluatingTarget.type === "assignment" ? evaluatingTarget.id : undefined,
      testId: evaluatingTarget.type === "test" ? evaluatingTarget.id : undefined,
      obtainedMarks: Number(currentDraft.marks) || 0,
      totalMarks: evaluatingTarget.totalMarks,
      remarks: finalRemarks,
    });

    await fetchGradeRecordsStore(true);
    setSingleSaveToast("Marks saved to database!");
    setTimeout(() => setSingleSaveToast(null), 2500);

    if (autoAdvance && studentsList.length > 0) {
      setReviewingStudentIndex((prev) => (prev + 1) % studentsList.length);
      setSelectedLineForAnnotation(null);
      setInlineCommentInput("");
    }
  };

  const handleAddAnnotation = (targetKey: string, lineNo?: number) => {
    if (!inlineCommentInput.trim()) return;
    const newNote = {
      id: "note-" + Date.now(),
      lineNo: lineNo ?? selectedLineForAnnotation ?? undefined,
      comment: inlineCommentInput.trim(),
      author: "Teacher",
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tag: annotationTag,
    };
    setAnnotations((prev) => ({
      ...prev,
      [targetKey]: [...(prev[targetKey] || []), newNote],
    }));
    setInlineCommentInput("");
    setSelectedLineForAnnotation(null);
  };

  const handleDeleteAnnotation = (targetKey: string, noteId: string) => {
    setAnnotations((prev) => ({
      ...prev,
      [targetKey]: (prev[targetKey] || []).filter((a) => a.id !== noteId),
    }));
  };
  const [editingSyllabus, setEditingSyllabus] = useState<SyllabusTopic | null>(null);
  const [syllabusForm, setSyllabusForm] = useState({
    topic: "",
    week: 1,
    subTopics: ["", ""],
    teacherStatus: "pending" as SyllabusTopic["teacherStatus"],
    totalSlides: 20,
    completedSlides: 0,
    materialId: "",
    materialTitle: "",
    materialFileName: "",
  });
  const [slideUploadFeedback, setSlideUploadFeedback] = useState<{
    fileName: string;
    slides: number;
    size: string;
    isPdf: boolean;
  } | null>(null);
  const [isParsingSlide, setIsParsingSlide] = useState<boolean>(false);
  const [attendanceSuccessMessage, setAttendanceSuccessMessage] = useState(false);

  // Confirmation & Success Dialog States
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: "confirm" | "danger" | "success" | "warning";
    confirmLabel?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  // Quick Attendance Form State
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [sessionTopic, setSessionTopic] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [sessionDuration, setSessionDuration] = useState("1h 30m");
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);

  // Form states
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    totalMarks: 20,
  });

  const [newTest, setNewTest] = useState({
    title: "",
    description: "",
    testDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    duration: "1h",
    totalMarks: 25,
  });

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    priority: "Normal" as "Normal" | "High",
  });

  // Local materials list
  const [materials, setMaterials] = useState([
    {
      id: "mat-1",
      title: "Lecture 1-3 Slides: Core Architecture & Schema Design",
      category: "Slides",
      fileType: "PDF",
      size: "3.4 MB",
      date: "2 days ago",
      downloads: 38,
    },
    {
      id: "mat-2",
      title: "Lab Assignment 1 Starter Code & Sample Datasets",
      category: "Lab & Code",
      fileType: "ZIP",
      size: "8.1 MB",
      date: "5 days ago",
      downloads: 42,
    },
    {
      id: "mat-3",
      title: "Reference Text: Chapter 4 Normalization Exercises",
      category: "Reading",
      fileType: "PDF",
      size: "1.8 MB",
      date: "1 week ago",
      downloads: 29,
    },
  ]);

  const [newMaterial, setNewMaterial] = useState<{
    title: string;
    category: string;
    fileType: string;
    fileName: string;
    size: string;
    totalSlides: number;
  }>({
    title: "",
    category: "Slides",
    fileType: "PDF",
    fileName: "",
    size: "2.5 MB",
    totalSlides: 20,
  });
  const [isUploadingMaterialFile, setIsUploadingMaterialFile] = useState(false);
  const [attachedMaterialFile, setAttachedMaterialFile] = useState<File | null>(null);
  const [attachedParsedSlides, setAttachedParsedSlides] = useState<any[] | null>(null);

  const backendBase =
    typeof window !== "undefined"
      ? (process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5001")
      : "http://localhost:5001";

  const resolveFileUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
      return url;
    }
    if (url.startsWith("/uploads/")) {
      return `${backendBase}${url}`;
    }
    return `${backendBase}/uploads/${url}`;
  };

  // Populate default attendance to "present"
  useEffect(() => {
    if (view && view.students) {
      const initial: Record<string, AttendanceStatus> = {};
      view.students.forEach((s) => {
        initial[s.id] = "present";
      });
      setAttendanceMap(initial);

      // Preselect current syllabus topic
      const cur = view.syllabusTopics.find((t) => t.teacherStatus === "current") ||
                  view.syllabusTopics.find((t) => t.teacherStatus === "pending") ||
                  view.syllabusTopics[0];
      if (cur) {
        setSessionTopic(cur.topic);
      }
    }
  }, [classroomId, view?.students?.length]);

  const { gradeRecords } = useStore();

  const openEvaluationModal = (type: "assignment" | "test", item: { id: string; title: string; totalMarks: number }) => {
    const targetId = item.id;
    const initialDraft: Record<string, { marks: string; remarks: string }> = {};
    if (view && view.students) {
      view.students.forEach((s) => {
        const existing = gradeRecords.find(
          (g) => g.studentId === s.id && (type === "assignment" ? g.assignmentId === targetId : g.testId === targetId)
        );
        initialDraft[s.id] = {
          marks: existing ? String(existing.obtainedMarks) : "",
          remarks: existing?.remarks || "",
        };
      });
    }
    setEvaluatingDraft(initialDraft);
    setEvaluatingTarget({ type, id: item.id, title: item.title, totalMarks: item.totalMarks });
  };

  const openGradebookModal = () => {
    const initialGb: Record<string, { ct: string; assn: string; midterm: string; final: string }> = {};
    if (view && view.students) {
      view.students.forEach((s, idx) => {
        const studentGrades = gradeRecords.filter((g) => g.studentId === s.id);
        const latestTest = studentGrades.find((g) => g.testId);
        const latestAssn = studentGrades.find((g) => g.assignmentId);
        initialGb[s.id] = {
          ct: latestTest ? String(latestTest.obtainedMarks) : String(Math.min(20, Math.round(15 + (idx % 5)))),
          assn: latestAssn ? String(latestAssn.obtainedMarks) : String(Math.min(20, Math.round(16 + ((idx * 2) % 4)))),
          midterm: String(Math.min(30, Math.round(22 + ((idx * 3) % 7)))),
          final: String(Math.min(50, Math.round(38 + ((idx * 4) % 11)))),
        };
      });
    }
    setGradebookDraft(initialGb);
    setShowGradebookModal(true);
  };

  const handleSaveEvaluationMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingTarget || !view) return;
    setConfirmDialog({
      isOpen: true,
      title: "Save Marks to Database?",
      message: `Are you sure you want to save evaluation marks for "${evaluatingTarget.title}"? This will persist directly to PostgreSQL database.`,
      type: "confirm",
      confirmLabel: "Yes, Save Marks",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        const entries = Object.entries(evaluatingDraft).filter(([, v]) => v.marks.trim() !== "");
        await Promise.all(
          entries.map(([studentId, v]) =>
            upsertGradeRecord({
              classroomId: view.classroom.id,
              studentId,
              assignmentId: evaluatingTarget.type === "assignment" ? evaluatingTarget.id : undefined,
              testId: evaluatingTarget.type === "test" ? evaluatingTarget.id : undefined,
              obtainedMarks: Number(v.marks),
              totalMarks: evaluatingTarget.totalMarks,
              remarks: v.remarks,
            })
          )
        );
        await fetchGradeRecordsStore(true);
        const targetTitle = evaluatingTarget.title;
        setEvaluatingTarget(null);
        setSuccessModal({
          isOpen: true,
          title: "Marks Saved Successfully",
          message: `Evaluation marks for "${targetTitle}" have been saved to database for ${entries.length} students.`,
        });
      },
    });
  };

  const handleSaveGradebook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!view) return;
    setConfirmDialog({
      isOpen: true,
      title: "Save Gradebook to Database?",
      message: "Are you sure you want to finalize and save the continuous evaluation gradebook for all students?",
      type: "confirm",
      confirmLabel: "Yes, Save Gradebook",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        const entries = Object.entries(gradebookDraft);
        await Promise.all(
          entries.map(([studentId, v]) =>
            upsertGradeRecord({
              classroomId: view.classroom.id,
              studentId,
              obtainedMarks: Number(v.ct) || 0,
              totalMarks: 20,
              remarks: `Continuous Evaluation CT: ${v.ct}, Assn: ${v.assn}`,
            })
          )
        );
        await fetchGradeRecordsStore(true);
        setShowGradebookModal(false);
        setSuccessModal({
          isOpen: true,
          title: "Gradebook Saved",
          message: "All student continuous evaluation marks have been synced to official academic database.",
        });
      },
    });
  };

  if (isLoading && !view) {
    return <ClassroomDetailSkeleton />;
  }

  if (!view) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <BookOpen className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Classroom Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">
            The requested classroom does not exist or is not assigned to your profile.
          </p>
        </div>
        <Link
          href="/dashboard/teacher/classrooms"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Classrooms
        </Link>
      </div>
    );
  }

  const { classroom: cls, course, batch, session, program, schedules, syllabusTopics: courseSyllabus, students, assignments, tests, colors, progress } = view;

  // Filtered class sessions for this classroom
  const classroomSessions = classSessions
    .filter((s) => s.classroomId === cls.id)
    .sort((a, b) => b.conductedAt.localeCompare(a.conductedAt));

  // Targeted announcements for this course/batch
  const classAnnouncements = announcements.filter(
    (a) =>
      a.courseId === course.id ||
      a.batchId === batch.id ||
      a.audienceType === "Global" ||
      (a.audienceType === "Program" && a.programId === program.id)
  );

  // Calculate overall attendance rate for this classroom
  const classroomAttendanceRecords = attendanceRecords.filter((r) => r.classroomId === cls.id);
  const totalAttendanceEntries = classroomAttendanceRecords.length;
  const presentAttendanceEntries = classroomAttendanceRecords.filter(
    (r) => r.status === "present" || r.status === "late"
  ).length;
  const avgAttendanceRate =
    totalAttendanceEntries > 0
      ? Math.round((presentAttendanceEntries / totalAttendanceEntries) * 100)
      : 94;

  // Current active topic from Admin's syllabus or user selection
  const currentTopic =
    courseSyllabus.find((t) => t.id === selectedTopicId) ||
    courseSyllabus.find((t) => t.teacherStatus === "current") ||
    courseSyllabus.find((t) => t.teacherStatus === "pending") ||
    courseSyllabus[0];

  const topicSessions = classroomSessions.filter(
    (s) =>
      currentTopic &&
      (s.topicCovered.toLowerCase().includes(currentTopic.topic.toLowerCase()) ||
        currentTopic.topic.toLowerCase().includes(s.topicCovered.toLowerCase()))
  );
  const completedTopicsCount = courseSyllabus.filter((t) => t.teacherStatus === "done").length;

  // Attendance tallies
  const presentCount = Object.values(attendanceMap).filter((s) => s === "present").length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === "absent").length;
  const lateCount = Object.values(attendanceMap).filter((s) => s === "late").length;

  // Attendance Toggle helper
  const toggleStudentAttendance = (studentId: string) => {
    setAttendanceMap((prev) => {
      const cur = prev[studentId] ?? "present";
      const next: AttendanceStatus = cur === "present" ? "absent" : cur === "absent" ? "late" : "present";
      return { ...prev, [studentId]: next };
    });
  };

  const setAllAttendance = (status: AttendanceStatus) => {
    const next: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      next[s.id] = status;
    });
    setAttendanceMap(next);
  };

  const availableMaterials: any[] = [
    { id: "mat_pres1", title: "Presentation1.pptx", fileName: "Presentation1.pptx", type: "Slides", totalSlides: 20 },
    { id: "mat_incep2", title: "Inception_v2 copy.pptx", fileName: "Inception_v2 copy.pptx", type: "Slides", totalSlides: 24 },
    { id: "mat_uml", title: "UML Diagram - Library System.pdf", fileName: "UML Diagram - Library System.pdf", type: "PDF", totalSlides: 12 },
    ...(storeMaterials.length > 0 ? storeMaterials : (materials || [])).map((m: any) => ({
      id: m.id,
      title: m.title,
      fileName: m.fileName || m.title,
      type: m.type || m.fileType || "Slides",
      totalSlides: m.totalSlides || 15,
      fileUrl: m.fileUrl,
      fileData: m.fileData,
      parsedSlides: m.parsedSlides,
    })),
  ];

  const handleOpenSlidePresenter = (topic?: SyllabusTopic) => {
    const targetTopic = topic || currentTopic;
    const targetFileName = targetTopic?.materialFileName || "Presentation1.pptx";
    const matched = availableMaterials.find(
      (m) => (m.fileName && m.fileName.toLowerCase() === targetFileName.toLowerCase()) ||
             (targetTopic?.materialId && m.id === targetTopic.materialId)
    ) || availableMaterials[0];

    const currentSlide = targetTopic?.completedSlides ? targetTopic.completedSlides + 1 : 1;
    const isMatchedPdf =
      matched.type === "PDF" ||
      targetFileName.toLowerCase().endsWith(".pdf") ||
      (matched.fileName && matched.fileName.toLowerCase().endsWith(".pdf")) ||
      Boolean(targetTopic?.topic && targetTopic.topic.toLowerCase().includes("uml"));

    const resolvedFileUrl = matched.fileUrl || matched.fileData;

    setPresenterMaterial({
      id: matched.id || targetTopic?.id || "deck_1",
      title: targetTopic?.materialTitle || matched.title || targetTopic?.topic || "Lecture Presentation",
      fileName: targetFileName,
      fileType: isMatchedPdf ? "PDF" : (matched.type || "Slides"),
      fileUrl: resolvedFileUrl,
      fileData: matched.fileData,
      parsedSlides: matched.parsedSlides,
      pdfUrl: isMatchedPdf
        ? (resolvedFileUrl ? resolveFileUrl(resolvedFileUrl) : (targetFileName.toLowerCase().includes("uml") || (targetTopic?.topic && targetTopic.topic.toLowerCase().includes("uml"))
            ? "/UML Diagram - Library System.pdf"
            : `${backendBase}/uploads/${targetFileName}`))
        : undefined,
      lastSlide: currentSlide,
    });
    setIsPresenterOpen(true);
  };

  const handleStepSlide = (delta: number) => {
    if (!currentTopic) return;
    const maxSlides = currentTopic.totalSlides || 20;
    const currentCompleted = currentTopic.completedSlides || 0;
    const newCompleted = Math.max(0, Math.min(maxSlides, currentCompleted + delta));
    updateSyllabusTopic(currentTopic.id, { completedSlides: newCompleted });
  };

  const handleJumpToSlide = (slideNum: number) => {
    if (!currentTopic) return;
    const maxSlides = currentTopic.totalSlides || 20;
    const newCompleted = Math.max(0, Math.min(maxSlides, slideNum - 1));
    updateSyllabusTopic(currentTopic.id, { completedSlides: newCompleted });
  };

  const activeSlideNum = currentTopic ? Math.min((currentTopic.completedSlides || 0) + 1, currentTopic.totalSlides || 20) : 1;
  const totalSlidesCount = currentTopic?.totalSlides || 20;
  const currentFileNameLower = (currentTopic?.materialFileName || "").toLowerCase();
  const currentTopicLower = (currentTopic?.topic || "").toLowerCase();
  const isPdfTopic =
    currentFileNameLower.endsWith(".pdf") ||
    currentTopicLower.includes("uml") ||
    currentTopicLower.includes(".pdf");
  const isInception = !isPdfTopic && (currentFileNameLower.includes("inception") || currentTopicLower.includes("inception") || currentTopicLower.includes("wenp"));
  const isPresentation1 = !isInception && !isPdfTopic && (currentFileNameLower.includes("presentation1") || (!currentTopic?.materialFileName && true));
  const currentMatchedMaterial = availableMaterials.find(
    (m) => (m.fileName && m.fileName.toLowerCase() === currentFileNameLower) ||
           (currentTopic?.materialId && m.id === currentTopic.materialId)
  );

  // Submit Quick Attendance
  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTopic) return;

    setConfirmDialog({
      isOpen: true,
      title: "Are you sure?",
      message: `Are you sure you want to finalize and save class session & attendance for "${sessionTopic}"?`,
      type: "confirm",
      confirmLabel: "Yes, Save Attendance",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        const newSessionId = Date.now().toString(36);

        // 1. Add Class Session record
        addClassSession({
          classroomId: cls.id,
          date: sessionDate,
          topicCovered: sessionTopic,
          notes: sessionNotes,
          duration: sessionDuration,
          conductedAt: new Date().toISOString(),
        });

        // 2. Save Attendance Records for all enrolled students
        Object.entries(attendanceMap).forEach(([studentId, status]) => {
          upsertAttendance(newSessionId, cls.id, studentId, status);
        });

        // 3. Increment Classes Completed for Classroom
        updateClassroom(cls.id, {
          classesCompleted: (cls.classesCompleted || 0) + 1,
        });

        // 4. If matched a syllabus topic, update status
        const matchedTopic = courseSyllabus.find((t) => t.topic.toLowerCase() === sessionTopic.toLowerCase());
        if (matchedTopic && matchedTopic.teacherStatus !== "done") {
          updateSyllabusTopic(matchedTopic.id, { teacherStatus: "done" });
        }

        setShowAttendanceModal(false);
        setSessionNotes("");
        setSuccessModal({
          isOpen: true,
          title: "Attendance Saved Successfully",
          message: `Attendance & session details for "${sessionTopic}" have been recorded for ${students.length} students.`,
        });
      },
    });
  };

  // Syllabus Status toggle
  const handleMarkTopicStatus = (topicId: string, status: "pending" | "current" | "done") => {
    updateSyllabusTopic(topicId, { teacherStatus: status });
  };

  const handleSyllabusSlideFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingSlide(true);
    const fileName = file.name;
    const isPdf = fileName.toLowerCase().endsWith(".pdf");
    const cleanTitle = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    const formattedSize =
      file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(1)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    let detectedSlides = 20;
    let parsedSlidesFromPptx: any[] | undefined = undefined;

    try {
      if (isPdf) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdfjs = await import("pdfjs-dist");
          pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
          const doc = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
          detectedSlides = doc.numPages;
        } catch {
          const arrayBuffer = await file.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          let binaryStr = "";
          const len = Math.min(bytes.byteLength, 500000);
          for (let i = 0; i < len; i += 8192) {
            binaryStr += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, Math.min(i + 8192, len))));
          }
          const matches = binaryStr.match(/\/Type\s*\/Page[^s]/g);
          if (matches && matches.length > 0) detectedSlides = matches.length;
        }
      } else {
        // Universal PPTX Parser: extracts slides, titles, bullets and visual assets
        try {
          const parseResult = await parsePptx(file);
          if (parseResult && parseResult.slides.length > 0) {
            detectedSlides = parseResult.totalSlides;
            parsedSlidesFromPptx = parseResult.slides;
          }
        } catch (pptxErr) {
          console.warn("Could not parse PPTX with pptxParser:", pptxErr);
          // Fallback to manifest slide counting
          const arrayBuffer = await file.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          let binaryStr = "";
          const len = bytes.byteLength;
          for (let i = 0; i < len; i += 8192) {
            binaryStr += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, Math.min(i + 8192, len))));
          }
          const slideMatches = binaryStr.match(/ppt\/slides\/slide[0-9]+\.xml/g);
          if (slideMatches && slideMatches.length > 0) {
            detectedSlides = new Set(slideMatches).size;
          }
        }
      }
    } catch (err) {
      console.warn("Could not auto-count slides from file:", err);
    }

    // 1. Physically upload file to backend/uploads directory
    let serverFileUrl = "";
    let serverFileName = fileName;
    try {
      const uploadRes = await api.uploadFile(file);
      if (uploadRes && uploadRes.fileUrl) {
        serverFileUrl = uploadRes.fileUrl;
        serverFileName = uploadRes.fileName || fileName;
      }
    } catch (uploadErr) {
      console.warn("Upload to backend /uploads notice:", uploadErr);
    }

    // 2. Register into Course Materials repository & PostgreSQL database
    const newMatId = `mat-${Date.now()}`;
    const newMaterialObj = {
      id: newMatId,
      classroomId: view?.classroom?.id || classroomId,
      courseId: view?.course?.id || course?.id,
      title: cleanTitle,
      fileName: fileName,
      fileUrl: serverFileUrl || undefined,
      fileData: serverFileUrl || undefined,
      fileType: isPdf ? "PDF" : "Slides",
      fileSize: formattedSize,
      size: formattedSize,
      date: "Just now",
      downloads: 0,
      totalSlides: detectedSlides,
      lastSlide: 1,
      category: "Slides",
      parsedSlides: parsedSlidesFromPptx,
    };

    addMaterial(newMaterialObj);
    setMaterials((prev) => [newMaterialObj, ...prev]);
    api.createMaterial(newMaterialObj).catch(() => {});

    // 3. Auto-update syllabus form state
    setSyllabusForm((prev) => ({
      ...prev,
      topic: prev.topic.trim() ? prev.topic : cleanTitle,
      materialFileName: fileName,
      materialTitle: cleanTitle,
      materialId: newMatId,
      totalSlides: detectedSlides,
      completedSlides: 0,
    }));

    setSlideUploadFeedback({
      fileName,
      slides: detectedSlides,
      size: formattedSize,
      isPdf,
    });
    setIsParsingSlide(false);
  };

  const openAddSyllabus = () => {
    setEditingSyllabus(null);
    setSlideUploadFeedback(null);
    setIsParsingSlide(false);
    setSyllabusForm({
      topic: "",
      week: courseSyllabus.length ? Math.max(...courseSyllabus.map((s) => s.week)) + 1 : 1,
      subTopics: ["", ""],
      teacherStatus: "pending",
      totalSlides: 20,
      completedSlides: 0,
      materialId: "mat_pres1",
      materialTitle: "Presentation1.pptx",
      materialFileName: "Presentation1.pptx",
    });
    setShowSyllabusModal(true);
  };

  const openEditSyllabus = (top: SyllabusTopic) => {
    setEditingSyllabus(top);
    setSlideUploadFeedback(null);
    setIsParsingSlide(false);

    // Resolve material attachment: lookup from available materials or fallback to week defaults
    const matchedMat = availableMaterials.find(
      (m) =>
        (top.materialId && m.id === top.materialId) ||
        (top.materialFileName && m.fileName && m.fileName.toLowerCase() === top.materialFileName.toLowerCase()) ||
        (m.title && top.materialTitle && m.title.toLowerCase() === top.materialTitle.toLowerCase())
    );

    const resolvedFileName =
      top.materialFileName ||
      matchedMat?.fileName ||
      (top.week === 1 ? "Presentation1.pptx" : top.week === 2 ? "Inception_v2 copy.pptx" : "Presentation1.pptx");

    const resolvedTitle =
      top.materialTitle ||
      matchedMat?.title ||
      resolvedFileName.replace(/\.[^/.]+$/, "");

    const resolvedId =
      top.materialId ||
      matchedMat?.id ||
      (resolvedFileName.toLowerCase().includes("presentation1")
        ? "mat_pres1"
        : resolvedFileName.toLowerCase().includes("inception")
        ? "mat_incep2"
        : `mat_${Date.now()}`);

    const resolvedSlides =
      top.totalSlides && top.totalSlides > 0
        ? top.totalSlides
        : matchedMat?.totalSlides && matchedMat.totalSlides > 0
        ? matchedMat.totalSlides
        : resolvedFileName.toLowerCase().includes("inception")
        ? 24
        : 20;

    setSyllabusForm({
      topic: top.topic,
      week: top.week,
      subTopics: top.subTopics && top.subTopics.length ? [...top.subTopics] : ["", ""],
      teacherStatus: top.teacherStatus || "pending",
      totalSlides: resolvedSlides,
      completedSlides: top.completedSlides || 0,
      materialId: resolvedId,
      materialTitle: resolvedTitle,
      materialFileName: resolvedFileName,
    });
    setShowSyllabusModal(true);
  };

  const handleSaveSyllabus = () => {
    if (!syllabusForm.topic.trim()) return;
    setConfirmDialog({
      isOpen: true,
      title: "Are you sure?",
      message: editingSyllabus
        ? `Are you sure you want to update topic "${syllabusForm.topic}"?`
        : `Are you sure you want to add "${syllabusForm.topic}" to the course outline?`,
      type: "confirm",
      confirmLabel: "Yes, Save Topic",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        const cleanSubTopics = syllabusForm.subTopics.filter((t) => t.trim());
        if (editingSyllabus) {
          await updateSyllabusTopic(editingSyllabus.id, {
            topic: syllabusForm.topic,
            week: syllabusForm.week,
            subTopics: cleanSubTopics,
            teacherStatus: syllabusForm.teacherStatus,
            totalSlides: Number(syllabusForm.totalSlides) || 0,
            completedSlides: Number(syllabusForm.completedSlides) || 0,
            materialId: syllabusForm.materialId || undefined,
            materialTitle: syllabusForm.materialTitle || undefined,
            materialFileName: syllabusForm.materialFileName || undefined,
          });
        } else {
          await addSyllabusTopic({
            courseId: course.id,
            topic: syllabusForm.topic,
            week: syllabusForm.week,
            subTopics: cleanSubTopics,
            teacherStatus: syllabusForm.teacherStatus,
            adminStatus: "Published",
            totalSlides: Number(syllabusForm.totalSlides) || 0,
            completedSlides: Number(syllabusForm.completedSlides) || 0,
            materialId: syllabusForm.materialId || undefined,
            materialTitle: syllabusForm.materialTitle || undefined,
            materialFileName: syllabusForm.materialFileName || undefined,
          });
        }
        setShowSyllabusModal(false);
        setSuccessModal({
          isOpen: true,
          title: "Syllabus Topic Saved",
          message: `The course outline topic "${syllabusForm.topic}" has been saved successfully.`,
        });
      },
    });
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignment.title) return;
    setConfirmDialog({
      isOpen: true,
      title: "Are you sure?",
      message: `Are you sure you want to create and publish assignment "${newAssignment.title}"?`,
      type: "confirm",
      confirmLabel: "Yes, Create Assignment",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        addAssignment({
          classroomId: cls.id,
          title: newAssignment.title,
          description: newAssignment.description,
          dueDate: newAssignment.dueDate,
          totalMarks: Number(newAssignment.totalMarks) || 20,
          status: "Active",
          submissions: 0,
        });
        setNewAssignment({
          title: "",
          description: "",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          totalMarks: 20,
        });
        setShowAssignmentModal(false);
        setSuccessModal({
          isOpen: true,
          title: "Assignment Published",
          message: `Assignment "${newAssignment.title}" has been published to all enrolled students.`,
        });
      },
    });
  };

  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTest.title) return;
    setConfirmDialog({
      isOpen: true,
      title: "Are you sure?",
      message: `Are you sure you want to schedule class test "${newTest.title}"?`,
      type: "confirm",
      confirmLabel: "Yes, Schedule Test",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        addTest({
          classroomId: cls.id,
          title: newTest.title,
          description: newTest.description,
          testDate: newTest.testDate,
          duration: newTest.duration,
          totalMarks: Number(newTest.totalMarks) || 25,
          status: "Upcoming",
          submissions: 0,
        });
        setNewTest({
          title: "",
          description: "",
          testDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          duration: "1h",
          totalMarks: 25,
        });
        setShowTestModal(false);
        setSuccessModal({
          isOpen: true,
          title: "Class Test Scheduled",
          message: `Class test "${newTest.title}" has been scheduled successfully.`,
        });
      },
    });
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) return;
    setConfirmDialog({
      isOpen: true,
      title: "Are you sure?",
      message: `Are you sure you want to post this announcement to students?`,
      type: "confirm",
      confirmLabel: "Yes, Post Announcement",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        addAnnouncement({
          title: newAnnouncement.title,
          content: newAnnouncement.content,
          date: new Date().toISOString().split("T")[0],
          authorId: cls.teacherId,
          authorName: view.teacher.name,
          authorRole: "Teacher",
          audienceType: "Course",
          courseId: course.id,
          batchId: batch.id,
          status: "Published",
          priority: newAnnouncement.priority,
        });
        setNewAnnouncement({
          title: "",
          content: "",
          priority: "Normal",
        });
        setShowAnnouncementModal(false);
        setSuccessModal({
          isOpen: true,
          title: "Announcement Posted",
          message: `Your announcement has been posted successfully.`,
        });
      },
    });
  };

  const handleMaterialFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMaterialFile(true);
    setAttachedMaterialFile(file);
    const fileName = file.name;
    const isPdf = fileName.toLowerCase().endsWith(".pdf");
    const isPptx = fileName.toLowerCase().endsWith(".pptx") || fileName.toLowerCase().endsWith(".ppt");
    const cleanTitle = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    const formattedSize =
      file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(1)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    let detectedSlides = isPptx ? 20 : isPdf ? 12 : 1;

    try {
      if (isPdf) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdfjs = await import("pdfjs-dist");
          pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
          const doc = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
          detectedSlides = doc.numPages;
        } catch {
          const arrayBuffer = await file.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          let binaryStr = "";
          const len = Math.min(bytes.byteLength, 500000);
          for (let i = 0; i < len; i += 8192) {
            binaryStr += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, Math.min(i + 8192, len))));
          }
          const matches = binaryStr.match(/\/Type\s*\/Page[^s]/g);
          if (matches && matches.length > 0) detectedSlides = matches.length;
        }
      } else if (isPptx) {
        try {
          const parseResult = await parsePptx(file);
          if (parseResult && parseResult.slides.length > 0) {
            detectedSlides = parseResult.totalSlides;
            setAttachedParsedSlides(parseResult.slides);
          }
        } catch (pptxErr) {
          console.warn("Could not parse PPTX:", pptxErr);
          const arrayBuffer = await file.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          let binaryStr = "";
          const len = bytes.byteLength;
          for (let i = 0; i < len; i += 8192) {
            binaryStr += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, Math.min(i + 8192, len))));
          }
          const slideMatches = binaryStr.match(/ppt\/slides\/slide[0-9]+\.xml/g);
          if (slideMatches && slideMatches.length > 0) {
            detectedSlides = new Set(slideMatches).size;
          }
        }
      }
    } catch (err) {
      console.warn("Could not auto-count slides from file:", err);
    }

    setNewMaterial((prev) => ({
      ...prev,
      title: prev.title.trim() ? prev.title : cleanTitle,
      fileName: fileName,
      fileType: isPdf ? "PDF" : isPptx ? "Slides" : fileName.split(".").pop()?.toUpperCase() || "File",
      category: isPptx || isPdf ? "Slides" : prev.category,
      size: formattedSize,
      totalSlides: detectedSlides,
    }));

    setIsUploadingMaterialFile(false);
  };

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.title) return;
    setConfirmDialog({
      isOpen: true,
      title: "Confirm Material Upload",
      message: `Are you sure you want to upload material "${newMaterial.title}" to the classroom repository?`,
      type: "confirm",
      confirmLabel: "Yes, Upload",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));

        // 1. Physically upload to backend/uploads directory if file attached
        let serverFileUrl = "";
        let serverFileName = newMaterial.fileName || `${newMaterial.title}.${newMaterial.fileType.toLowerCase()}`;
        if (attachedMaterialFile) {
          try {
            const upRes = await api.uploadFile(attachedMaterialFile);
            if (upRes && upRes.fileUrl) {
              serverFileUrl = upRes.fileUrl;
              serverFileName = upRes.fileName || serverFileName;
            }
          } catch (uploadErr) {
            console.warn("Upload to backend /uploads notice:", uploadErr);
          }
        }

        const newMatId = `mat-${Date.now()}`;
        const newMatObj = {
          id: newMatId,
          classroomId: view?.classroom?.id || classroomId,
          courseId: view?.course?.id || course?.id,
          title: newMaterial.title,
          fileName: serverFileName,
          fileUrl: serverFileUrl || undefined,
          fileData: serverFileUrl || undefined,
          category: newMaterial.category,
          fileType: newMaterial.fileType,
          fileSize: newMaterial.size || "2.5 MB",
          size: newMaterial.size || "2.5 MB",
          totalSlides: newMaterial.totalSlides || (newMaterial.fileType === "PDF" ? 12 : 20),
          lastSlide: 1,
          date: "Just now",
          downloads: 0,
          parsedSlides: attachedParsedSlides || undefined,
        };

        addMaterial(newMatObj);
        setMaterials((prev) => [newMatObj, ...prev]);
        api.createMaterial(newMatObj).catch(() => {});

        setNewMaterial({
          title: "",
          category: "Slides",
          fileType: "PDF",
          fileName: "",
          size: "2.5 MB",
          totalSlides: 20,
        });
        setAttachedMaterialFile(null);
        setShowMaterialModal(false);
        setSuccessModal({
          isOpen: true,
          title: "Material Uploaded",
          message: `Material "${newMatObj.title}" has been uploaded and added to Course Materials successfully.`,
        });
      },
    });
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredSyllabus = courseSyllabus.filter((t) => {
    if (syllabusFilter === "all") return true;
    return t.teacherStatus === syllabusFilter;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      
      {/* ── Success Toast Notification ── */}
      {attendanceSuccessMessage && (
        <div className="bg-emerald-500 text-white px-4 py-3 rounded-2xl flex items-center justify-between text-xs shadow-lg animate-in slide-in-from-top-3 duration-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <div>
              <p className="font-bold">Attendance Logged Successfully!</p>
              <p className="text-emerald-100 text-[11px]">{presentCount} present out of {students.length} enrolled students.</p>
            </div>
          </div>
          <button onClick={() => setAttendanceSuccessMessage(false)} className="text-emerald-100 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Header Breadcrumb & Classroom Overview Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link
              href="/dashboard/teacher/classrooms"
              className="hover:text-slate-900 transition-colors flex items-center gap-1.5 font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Classrooms
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-600 font-medium">{batch.name}</span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-900">{course.code}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              {course.title}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
              cls.status === "ongoing"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                : cls.status === "upcoming"
                ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                : "bg-slate-100 text-slate-600"
            }`}>
              ● {cls.status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {cls.room || "Room TBA"}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {schedules.length > 0
                ? `${[...new Set(schedules.map((s) => s.day.slice(0, 3)))].join(", ")} • ${schedules[0].startTime} - ${schedules[0].endTime}`
                : "Schedule TBA"}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
              {new Date(cls.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – {new Date(cls.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Primary Header Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowEvaluationPolicyModal(true)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" /> Evaluation Policy
          </button>
          {cls.status === "completed" ? (
            <button
              onClick={() => setShowArchiveModal(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4 text-slate-500" /> Historical Archive
            </button>
          ) : (
            <button
              onClick={() => setShowAttendanceModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              <ClipboardCheck className="w-4 h-4" /> Take Attendance
            </button>
          )}
        </div>
      </div>

      {/* ── CLASSROOM MODULES MENU OR ACTIVE MODULE HEADER ── */}
      {!activeTab ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-brand-dark" />
                Classroom Modules
              </h2>
              <p className="text-xs text-slate-500">
                Select a module below to conduct live classes, manage syllabus, record attendance, and evaluate students.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Live Class */}
            <div
              onClick={() => setActiveTab("live")}
              className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/50 p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <Presentation className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-white tracking-wider animate-pulse flex items-center gap-1 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span> LIVE
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Live Class & Lectures
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Present lecture slides (PPTX/PDF), view presenter notes, recall slide position, and log live session attendance.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600 group-hover:text-emerald-700">
                <span>Enter Live Classroom</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 2. Course Outline & Slides */}
            <div
              onClick={() => setActiveTab("outline")}
              className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-sky-500/50 p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold border border-sky-100 group-hover:bg-sky-600 group-hover:text-white transition-all">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700 border border-sky-200">
                    {courseSyllabus.length} Topics
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                  Course Outline & Slides
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Organize weekly syllabus topics, teaching plans, attach lecture slides, and track topic completion progress.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-sky-600 group-hover:text-sky-700">
                <span>{completedTopicsCount} / {courseSyllabus.length} Completed</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 3. Attendance & Sessions */}
            <div
              onClick={() => setActiveTab("attendance")}
              className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-500/50 p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                    {classroomSessions.length} Sessions
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                  Attendance & Sessions
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Log daily classroom attendance, review student presence rosters, RFID records, and historical logs.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
                <span>Avg Rate: {avgAttendanceRate}%</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 4. Assignments */}
            <div
              onClick={() => setActiveTab("assignments")}
              className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-amber-500/50 p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-100 group-hover:bg-amber-600 group-hover:text-white transition-all">
                    <ListTodo className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                    {assignments.length} Tasks
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                  Assignments & Homework
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Create term assignments, review student code & attachments, provide feedback, and grade submissions.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-600 group-hover:text-amber-700">
                <span>Manage Submissions</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 5. Class Tests (CT) */}
            <div
              onClick={() => setActiveTab("tests")}
              className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-purple-500/50 p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold border border-purple-100 group-hover:bg-purple-600 group-hover:text-white transition-all">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                    {tests.length} Tests
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                  Class Tests & Quizzes (CT)
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Schedule class tests, define syllabus coverage, input marks, and track student assessment performance.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-600 group-hover:text-purple-700">
                <span>Manage Continuous Marks</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 6. Notices & Announcements */}
            <div
              onClick={() => setShowAnnouncementModal(true)}
              className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-brand-dark/50 p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-900/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-brand-dark flex items-center justify-center font-bold border border-slate-200 group-hover:bg-brand-dark group-hover:text-white transition-all">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    Broadcast
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-dark transition-colors">
                  Class Notice & Broadcast
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Post instant notifications, upcoming exam deadlines, and important instructions to student portals.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-brand-dark group-hover:text-brand-dark">
                <span>Post Announcement</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Active Module Navigation Bar with Back Button ── */
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <button
            onClick={() => setActiveTab(null)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-brand-dark hover:bg-slate-100/90 transition-all border border-slate-200/70 w-fit"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>← Back to Modules</span>
          </button>

          {/* Quick-switch pill tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: "live", label: "Live Class", icon: Presentation, badge: "LIVE" },
              { id: "outline", label: "Outline & Slides", icon: BookOpen, count: courseSyllabus.length },
              { id: "attendance", label: "Attendance", icon: ClipboardCheck, count: classroomSessions.length },
              { id: "assignments", label: "Assignments", icon: ListTodo, count: assignments.length },
              { id: "tests", label: "Class Tests (CT)", icon: FileText, count: tests.length },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs font-extrabold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase bg-emerald-500 text-white tracking-wider animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                  {typeof tab.count === "number" && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[9px] ${
                        isActive ? "bg-white/20 text-white font-extrabold" : "bg-slate-200 text-slate-600 font-bold"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB CONTENT (5 Streamlined Tabs) ── */}

      {/* ── TAB 1: LIVE CLASS (Slide View + Memory + Live Attendance) ── */}
      {activeTab === "live" && (
        <div className="space-y-6">
          {/* Active Topic Switcher & Semester Roadmap Pill Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Presentation className="w-4 h-4 text-indigo-600" /> Live Class & Lecture Room
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Conduct interactive lectures with native PPTX/PDF slide view, slide position memory, and rapid attendance logging.
                </p>
              </div>

              {/* Active Topic Dropdown Selector */}
              <div className="flex items-center gap-2 shrink-0">
                <label className="text-xs font-bold text-slate-600">Active Topic:</label>
                <select
                  value={currentTopic?.id || ""}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setSelectedTopicId(selectedId);
                    updateSyllabusTopic(selectedId, { teacherStatus: "current" });
                  }}
                  className="px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-900"
                >
                  {courseSyllabus.map((top) => (
                    <option key={top.id} value={top.id}>
                      Week {top.week}: {top.topic} ({top.teacherStatus})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Topic Roadmap Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {courseSyllabus.map((top) => {
                const isSel = currentTopic?.id === top.id;
                const isDone = top.teacherStatus === "done";
                return (
                  <button
                    key={top.id}
                    onClick={() => {
                      setSelectedTopicId(top.id);
                      if (top.teacherStatus !== "done") {
                        updateSyllabusTopic(top.id, { teacherStatus: "current" });
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                      isSel
                        ? "bg-slate-900 text-white shadow-md ring-2 ring-indigo-400"
                        : isDone
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {isDone ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : isSel ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    ) : null}
                    <span>W{top.week}: {top.topic}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Running Topic Hero Banner */}
          {currentTopic && (
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-indigo-900/60 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      TEACHING NOW • WEEK {currentTopic.week}
                    </span>
                    <span className="text-xs font-bold text-indigo-300 bg-indigo-950 border border-indigo-800 px-2.5 py-0.5 rounded-md">
                      {topicSessions.length} {topicSessions.length === 1 ? "Session" : "Sessions"} Conducted
                    </span>
                  </div>
                  <h2 className="text-lg md:text-xl font-extrabold text-white tracking-tight pt-1">
                    {currentTopic.topic}
                  </h2>
                  {currentTopic.subTopics && currentTopic.subTopics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {currentTopic.subTopics.map((sub, i) => (
                        <span key={i} className="text-[11px] bg-white/10 text-slate-200 px-2.5 py-0.5 rounded-md font-medium">
                          {sub}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenSlidePresenter(currentTopic)}
                    className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
                  >
                    <Tv className="w-4 h-4 text-white" /> Open Fullscreen Presenter
                  </button>
                  {currentTopic.teacherStatus !== "done" ? (
                    <button
                      onClick={() => {
                        handleMarkTopicStatus(currentTopic.id, "done");
                        const nextPending = courseSyllabus.find((t) => t.id !== currentTopic.id && t.teacherStatus !== "done");
                        if (nextPending) {
                          setSelectedTopicId(nextPending.id);
                          updateSyllabusTopic(nextPending.id, { teacherStatus: "current" });
                        }
                        setSuccessModal({
                          isOpen: true,
                          title: "Topic Completed!",
                          message: `Topic "${currentTopic.topic}" is marked complete. Advanced to next topic.`,
                        });
                      }}
                      className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 border border-white/20"
                    >
                      <Check className="w-4 h-4 text-emerald-400" /> Finish Topic ✓
                    </button>
                  ) : (
                    <span className="px-3.5 py-2.5 bg-emerald-900/60 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-700/60 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── In-Page Native Slide Deck Presenter Viewer ── */}
          <div className="bg-slate-950 text-white rounded-2xl border border-indigo-950/80 shadow-xl overflow-hidden space-y-0">
            {/* Presenter Screen Topbar */}
            <div className="px-5 py-3.5 bg-slate-900/90 border-b border-indigo-950/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Presentation className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      {currentTopic?.materialFileName || "Presentation1.pptx"}
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full">
                      Native In-App Slide Runner
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Active Module: <span className="text-indigo-300 font-semibold">{currentTopic?.topic}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-800">
                  Slide {activeSlideNum} of {totalSlidesCount}
                </span>
                <button
                  onClick={() => handleOpenSlidePresenter(currentTopic)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                >
                  <Maximize2 className="w-3.5 h-3.5" /> Full Screen
                </button>
              </div>
            </div>

            {/* Slide Presentation Screen Viewport (16:9) */}
            <div className="relative aspect-video max-h-[460px] w-full bg-slate-900 flex items-center justify-center overflow-hidden group select-none">
              {isPresentation1 ? (
                <img
                  src={`/Presentation Deck/presentation1_slides/slide_${Math.max(1, Math.min(20, activeSlideNum))}.png`}
                  alt={`Slide ${activeSlideNum}`}
                  className="w-full h-full object-contain pointer-events-none"
                />
              ) : isInception ? (
                <iframe
                  src={`/Presentation Deck/inception_html/slide_${Math.max(1, Math.min(24, activeSlideNum))}.html`}
                  title={`Slide ${activeSlideNum}`}
                  className="w-full h-full border-0 bg-transparent"
                />
              ) : isPdfTopic ? (
                <iframe
                  src={`${resolveFileUrl(currentMatchedMaterial?.fileUrl || currentMatchedMaterial?.fileData) || "/UML Diagram - Library System.pdf"}#page=${activeSlideNum}&view=FitH`}
                  title="PDF Slide Document"
                  className="w-full h-full border-0 bg-slate-900"
                />
              ) : currentMatchedMaterial?.parsedSlides && currentMatchedMaterial.parsedSlides[activeSlideNum - 1] ? (
                currentMatchedMaterial.parsedSlides[activeSlideNum - 1].imageUrl ? (
                  <img
                    src={currentMatchedMaterial.parsedSlides[activeSlideNum - 1].imageUrl}
                    alt={currentMatchedMaterial.parsedSlides[activeSlideNum - 1].title || `Slide ${activeSlideNum}`}
                    className="w-full h-full object-contain pointer-events-none"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col justify-between p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-left">
                    <div className="border-b border-slate-800 pb-2">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase font-mono">Slide {activeSlideNum} of {totalSlidesCount}</span>
                      <h4 className="text-base font-bold text-white mt-1 line-clamp-2">
                        {currentMatchedMaterial.parsedSlides[activeSlideNum - 1].title}
                      </h4>
                    </div>
                    {currentMatchedMaterial.parsedSlides[activeSlideNum - 1].bullets && (
                      <ul className="space-y-1.5 my-auto text-xs text-slate-300">
                        {currentMatchedMaterial.parsedSlides[activeSlideNum - 1].bullets.slice(0, 4).map((b: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-indigo-400 font-bold">•</span>
                            <span className="line-clamp-1">{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="pt-2 text-[10px] font-mono text-slate-500 flex justify-between">
                      <span>{currentTopic?.topic}</span>
                      <span>Scholaris Live Class</span>
                    </div>
                  </div>
                )
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-center">
                  <Presentation className="w-16 h-16 text-indigo-400/40 mb-3" />
                  <h3 className="text-lg font-black text-white">{currentTopic?.topic}</h3>
                  <p className="text-xs text-indigo-300 mt-1">Slide {activeSlideNum} / {totalSlidesCount}</p>
                </div>
              )}

              {/* Prev / Next Click Overlays */}
              <button
                type="button"
                onClick={() => handleStepSlide(-1)}
                disabled={activeSlideNum <= 1}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-950 text-white disabled:opacity-20 border border-white/10 backdrop-blur-xs transition-all shadow-lg"
                title="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => handleStepSlide(1)}
                disabled={activeSlideNum >= totalSlidesCount}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-950 text-white disabled:opacity-20 border border-white/10 backdrop-blur-xs transition-all shadow-lg"
                title="Next Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* State Memory Indicator */}
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-slate-950/80 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 flex items-center gap-1.5 backdrop-blur-xs">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> PostgreSQL DB Synced • Resumes on any device
              </div>
            </div>

            {/* Bottom Slide Navigator & Quick Stepper */}
            <div className="px-5 py-3 bg-slate-900/90 border-t border-indigo-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {Array.from({ length: Math.min(20, totalSlidesCount) }, (_, i) => i + 1).map((sNum) => (
                  <button
                    key={sNum}
                    type="button"
                    onClick={() => handleJumpToSlide(sNum)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all shrink-0 ${
                      sNum === activeSlideNum
                        ? "bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-md scale-105"
                        : sNum < activeSlideNum
                        ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    {sNum}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleStepSlide(-1)}
                  disabled={activeSlideNum <= 1}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs font-bold text-slate-200 transition-colors"
                >
                  ← Prev
                </button>
                <button
                  type="button"
                  onClick={() => handleStepSlide(1)}
                  disabled={activeSlideNum >= totalSlidesCount}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-xs font-extrabold text-white transition-colors shadow-sm"
                >
                  Next (+1) →
                </button>
              </div>
            </div>
          </div>

          {/* ── Today's Live Attendance Quick Box ── */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    TODAY'S CLASS ATTENDANCE ({presentCount}/{students.length} PRESENT)
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Topic: {sessionTopic || currentTopic?.topic || "Current Lecture"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setAllAttendance("present")}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={() => setShowAttendanceModal(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" /> Save & Finalize Attendance
                </button>
              </div>
            </div>

            {/* Quick Student Attendance Roster Grid */}
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto">
              {students.map((student) => {
                const status = attendanceMap[student.id] || "present";
                return (
                  <div
                    key={student.id}
                    onClick={() => toggleStudentAttendance(student.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between select-none ${
                      status === "present"
                        ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                        : status === "late"
                        ? "bg-amber-50/60 border-amber-200 text-amber-950"
                        : "bg-red-50/60 border-red-200 text-red-950"
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className="text-xs font-bold truncate">{student.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{student.rollNo}</p>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        status === "present"
                          ? "bg-emerald-200 text-emerald-900"
                          : status === "late"
                          ? "bg-amber-200 text-amber-900"
                          : "bg-red-200 text-red-900"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Topic Lecture History */}
          {currentTopic && topicSessions.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-indigo-600" /> Past Sessions for "{currentTopic.topic}" ({topicSessions.length})
                </h4>
              </div>
              <div className="divide-y divide-slate-100">
                {topicSessions.map((sess, idx) => {
                  const sessAttendance = attendanceRecords.filter((r) => r.sessionId === sess.id);
                  const present = sessAttendance.filter((r) => r.status === "present").length;
                  return (
                    <div key={sess.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50">
                      <div>
                        <span className="font-bold text-slate-900">Session #{topicSessions.length - idx}: {sess.topicCovered}</span>
                        <p className="text-slate-500 text-[11px]">{new Date(sess.date).toLocaleDateString()} • {sess.duration || "1h 30m"}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg text-xs">
                        {present} Present
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: COURSE OUTLINE & SLIDES (Course Materials Merged Inside!) ── */}
      {activeTab === "outline" && (
        <div className="space-y-6">
          {/* Header & Filter bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900">Course Outline & Attached Slide Decks</h3>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md border border-indigo-200/60">
                  Materials Integrated
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Attach presentation slides to each topic. Present directly or resume from your last saved slide position.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50 text-xs">
                {(["all", "current", "done", "pending"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSyllabusFilter(mode)}
                    className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-all ${
                      syllabusFilter === mode
                        ? "bg-white text-slate-900 shadow-xs font-bold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <button
                onClick={openAddSyllabus}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Add Topic & Slide
              </button>
            </div>
          </div>

          {/* Topics List with Embedded Slides */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden divide-y divide-slate-100">
            {filteredSyllabus.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No syllabus topics found for this filter.
              </div>
            ) : (
              filteredSyllabus.map((top) => {
                const isDone = top.teacherStatus === "done";
                const isCurrent = top.teacherStatus === "current";
                const slideFile = top.materialFileName || (top.week === 1 ? "Presentation1.pptx" : top.week === 2 ? "Inception_v2 copy.pptx" : "Presentation1.pptx");
                const currentSlideNum = (top.completedSlides || 0) + 1;
                const totalSlides = top.totalSlides || 20;

                return (
                  <div
                    key={top.id}
                    className={`p-4 sm:p-5 transition-colors ${
                      isDone ? "bg-emerald-50/15" : isCurrent ? "bg-indigo-50/25" : "hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Week Avatar + Topic Title + Tags + Slide Pill */}
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                        {/* Week Badge */}
                        <div
                          className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border ${
                            isDone
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : isCurrent
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200 ring-2 ring-indigo-500/20"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">WK</span>
                          <span className="text-base font-extrabold leading-none">{top.week}</span>
                        </div>

                        {/* Details */}
                        <div className="min-w-0 space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`text-sm font-bold truncate ${isDone ? "text-slate-500 line-through" : "text-slate-900"}`}>
                              {top.topic}
                            </h4>
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                isDone
                                  ? "bg-emerald-100 text-emerald-800"
                                  : isCurrent
                                  ? "bg-indigo-100 text-indigo-800"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {top.teacherStatus}
                            </span>
                          </div>

                          {/* Subtopics chips */}
                          {top.subTopics && top.subTopics.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              {top.subTopics.map((sub, idx) => (
                                <span
                                  key={idx}
                                  className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                                >
                                  {sub}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Attached Slide Deck Info Row */}
                          <div className="flex flex-wrap items-center gap-2.5 pt-0.5 text-xs text-slate-500">
                            <div className="inline-flex items-center gap-1.5 text-slate-700 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80">
                              <Presentation className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span className="font-semibold text-slate-800 truncate max-w-[180px] sm:max-w-[260px]">{slideFile}</span>
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono">
                                {slideFile.toLowerCase().endsWith(".pdf") ? "PDF" : "PPTX"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-600">
                              <span>
                                Slide <strong className="text-indigo-600 font-bold">{currentSlideNum}</strong> of {totalSlides}
                              </span>
                              <div className="hidden sm:flex items-center gap-1.5">
                                <div className="w-14 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-indigo-600 rounded-full"
                                    style={{ width: `${Math.round(((top.completedSlides || 0) / totalSlides) * 100)}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-slate-500 font-bold">
                                  {Math.round(((top.completedSlides || 0) / totalSlides) * 100)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Consolidated Clean Action Bar */}
                      <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                        <button
                          type="button"
                          onClick={() => handleOpenSlidePresenter({ ...top, materialFileName: slideFile })}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-95"
                          title="Open Slide Presenter Modal"
                        >
                          <Tv className="w-3.5 h-3.5" /> Present Slide
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTopicId(top.id);
                            updateSyllabusTopic(top.id, { teacherStatus: "current" });
                            setActiveTab("live");
                          }}
                          className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                          title="Set as Current and Open Live Class"
                        >
                          <Presentation className="w-3.5 h-3.5 text-emerald-400" /> Start Live Class
                        </button>

                        {top.teacherStatus !== "done" ? (
                          <button
                            type="button"
                            onClick={() => handleMarkTopicStatus(top.id, "done")}
                            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
                          >
                            Mark Done
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMarkTopicStatus(top.id, "pending")}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                          >
                            Reset
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openEditSyllabus(top)}
                          className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors"
                          title="Edit Topic or Attach Slide Deck"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Course Materials & Slide Repository Section (Inside Outline) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-indigo-600" /> Course Materials & Presentation Decks Repository
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  Directly run or attach any course presentation deck. All slides run in-app with database memory.
                </p>
              </div>
              <button
                onClick={() => setShowMaterialModal(true)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" /> Upload Material
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {availableMaterials.map((mat) => (
                <div key={mat.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition-all space-y-3 group shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                      <Presentation className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded">
                      {mat.type}
                    </span>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 truncate" title={mat.title}>{mat.title}</h5>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{mat.fileName || "Presentation File"}</p>
                  </div>
                  <button
                    onClick={() => {
                      const isMatPdf =
                        mat.type === "PDF" ||
                        Boolean(mat.fileName && mat.fileName.toLowerCase().endsWith(".pdf")) ||
                        mat.title.toLowerCase().endsWith(".pdf");
                      const resolvedUrl = mat.fileUrl || mat.fileData;
                      setPresenterMaterial({
                        id: mat.id,
                        title: mat.title,
                        fileName: mat.fileName,
                        fileType: isMatPdf ? "PDF" : mat.type,
                        fileUrl: resolvedUrl,
                        fileData: mat.fileData,
                        parsedSlides: mat.parsedSlides,
                        pdfUrl: isMatPdf
                          ? (resolvedUrl ? resolveFileUrl(resolvedUrl) : (mat.fileName?.toLowerCase().includes("uml") ? "/UML Diagram - Library System.pdf" : `${backendBase}/uploads/${mat.fileName}`))
                          : undefined,
                      });
                      setIsPresenterOpen(true);
                    }}
                    className="w-full py-2 bg-slate-900 group-hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Tv className="w-3.5 h-3.5 text-indigo-300" /> Run {mat.type === "PDF" ? "PDF Document" : "Presentation"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: ATTENDANCE (Attendance Log & Student Roster) ── */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          {/* Header Stats */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-emerald-600" /> Attendance Management & Logs
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Conducted {classroomSessions.length} total lecture sessions with {avgAttendanceRate}% overall attendance rate.
              </p>
            </div>
            <button
              onClick={() => setShowAttendanceModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
            >
              <ClipboardCheck className="w-4 h-4" /> Record New Attendance
            </button>
          </div>

          {/* Past Conducted Sessions History */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-emerald-600" /> Conducted Class Sessions ({classroomSessions.length})
              </h4>
            </div>

            {classroomSessions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">No sessions recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                      <th className="px-6 py-4">Session #</th>
                      <th className="px-6 py-4">Date & Duration</th>
                      <th className="px-6 py-4">Topic Covered</th>
                      <th className="px-6 py-4">Attendance Summary</th>
                      <th className="px-6 py-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {classroomSessions.map((sess, index) => {
                      const sessAttendance = attendanceRecords.filter((r) => r.sessionId === sess.id);
                      const present = sessAttendance.filter((r) => r.status === "present").length;
                      const absent = sessAttendance.filter((r) => r.status === "absent").length;
                      const late = sessAttendance.filter((r) => r.status === "late").length;
                      return (
                        <tr key={sess.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">
                            #{classroomSessions.length - index}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-800">
                              {new Date(sess.date).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                            <span className="text-[11px] text-slate-500 font-medium">{sess.duration || "1h 30m"}</span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-900">
                            {sess.topicCovered}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg text-xs border border-emerald-200/60">
                                {present} Present
                              </span>
                              {absent > 0 && (
                                <span className="px-2.5 py-1 bg-red-50 text-red-700 font-bold rounded-lg text-xs border border-red-200/60">
                                  {absent} Absent
                                </span>
                              )}
                              {late > 0 && (
                                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-bold rounded-lg text-xs border border-amber-200/60">
                                  {late} Late
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 max-w-xs">
                            {sess.notes ? (
                              <span className="truncate block italic text-slate-600">"{sess.notes}"</span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Enrolled Students Attendance Roster */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" /> Student Attendance Roster ({students.length})
              </h4>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter student..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    <th className="px-6 py-3.5">Roll No</th>
                    <th className="px-6 py-3.5">Student Name</th>
                    <th className="px-6 py-3.5">Contact</th>
                    <th className="px-6 py-3.5">Attended Sessions</th>
                    <th className="px-6 py-3.5">Attendance Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((st) => {
                    const studentRecords = attendanceRecords.filter((r) => r.studentId === st.id && r.classroomId === cls.id);
                    const attended = studentRecords.filter((r) => r.status === "present" || r.status === "late").length;
                    const totalSess = classroomSessions.length || 1;
                    const rate = Math.min(100, Math.round((attended / totalSess) * 100));

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-3.5 font-mono text-slate-600 font-bold">{st.rollNo}</td>
                        <td className="px-6 py-3.5 font-bold text-slate-900">{st.name}</td>
                        <td className="px-6 py-3.5 text-slate-500">{st.email}</td>
                        <td className="px-6 py-3.5 font-semibold text-slate-700">
                          {attended} / {classroomSessions.length}
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-xs ${rate >= 75 ? "text-emerald-600" : "text-amber-600"}`}>
                              {rate}%
                            </span>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${rate >= 75 ? "bg-emerald-500" : "bg-amber-500"}`}
                                style={{ width: `${rate}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: ASSIGNMENTS (Dedicated Assignment Management) ── */}
      {activeTab === "assignments" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-indigo-600" /> Coursework Assignments ({assignments.length})
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Manage assignment prompts, deadlines, and grade student submissions in 1 click.
              </p>
            </div>
            <button
              onClick={() => setShowAssignmentModal(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Assignment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.length === 0 ? (
              <div className="col-span-2 py-16 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                No assignments created yet.
              </div>
            ) : (
              assignments.map((asg) => (
                <div key={asg.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-sm transition-all space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                        {asg.status}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1.5">{asg.title}</h4>
                      {asg.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{asg.description}</p>
                      )}
                    </div>
                    <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg shrink-0">
                      {asg.totalMarks} Marks
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Due: {new Date(asg.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <Link
                      href={`/dashboard/teacher/assignments/${classroomId}/evaluate/${asg.id}`}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs"
                    >
                      Evaluate Submissions <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── TAB 5: CLASS TESTS (CT) (Dedicated CT Section) ── */}
      {activeTab === "tests" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" /> Class Tests & Quizzes ({tests.length})
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Schedule class tests, define syllabus topics, and manage continuous evaluation CT marks.
              </p>
            </div>
            <button
              onClick={() => setShowTestModal(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Schedule Class Test
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tests.length === 0 ? (
              <div className="col-span-2 py-16 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                No class tests scheduled yet.
              </div>
            ) : (
              tests.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-sm transition-all space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase bg-purple-50 text-purple-700 border border-purple-200/60">
                        {t.status}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1.5">{t.title}</h4>
                      {t.duration && (
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Duration: {t.duration}</p>
                      )}
                    </div>
                    <span className="text-xs font-black text-purple-900 bg-purple-50 px-2.5 py-1 rounded-lg shrink-0 border border-purple-200/60">
                      {t.totalMarks} Marks
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date: {new Date(t.testDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <button
                      onClick={() => openEvaluationModal("test", t)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs"
                    >
                      Enter / Manage CT Marks <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: 1-CLICK QUICK ATTENDANCE & CONDUCT CLASS ── */}
      {showAttendanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Take Attendance & Conduct Class</h3>
                  <p className="text-xs text-slate-500">{course.code} • {batch.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAttendanceModal(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveAttendance} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              
              {/* Session Meta Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Topic Covered Today *
                  </label>
                  <input
                    type="text"
                    required
                    value={sessionTopic}
                    onChange={(e) => setSessionTopic(e.target.value)}
                    placeholder="e.g. Normalization & 3NF Forms"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Lecture Date
                  </label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-3">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Teacher Lesson Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="e.g. Completed ER modeling exercises, assigned lab code..."
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white"
                  />
                </div>
              </div>

              {/* Roster Controls */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Student Register ({students.length})
                    </h4>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {presentCount} Present
                    </span>
                    {absentCount > 0 && (
                      <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md">
                        {absentCount} Absent
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAllAttendance("present")}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold transition-colors"
                    >
                      All Present
                    </button>
                    <button
                      type="button"
                      onClick={() => setAllAttendance("absent")}
                      className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-800 rounded-lg text-[11px] font-bold transition-colors"
                    >
                      All Absent
                    </button>
                  </div>
                </div>

                {/* Students Toggle List */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {students.map((stud) => {
                    const status = attendanceMap[stud.id] || "present";
                    return (
                      <div
                        key={stud.id}
                        onClick={() => toggleStudentAttendance(stud.id)}
                        className={`p-3 flex items-center justify-between cursor-pointer select-none transition-colors ${
                          status === "present"
                            ? "hover:bg-emerald-50/30"
                            : status === "absent"
                            ? "bg-red-50/30 hover:bg-red-50/50"
                            : "bg-amber-50/30 hover:bg-amber-50/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-800">
                            {stud.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{stud.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{stud.rollNo}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAttendanceMap((p) => ({ ...p, [stud.id]: "present" }));
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                              status === "present"
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAttendanceMap((p) => ({ ...p, [stud.id]: "absent" }));
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                              status === "absent"
                                ? "bg-red-600 text-white shadow-xs"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAttendanceMap((p) => ({ ...p, [stud.id]: "late" }));
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                              status === "late"
                                ? "bg-amber-500 text-white shadow-xs"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                            }`}
                          >
                            Late
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAttendanceModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" /> Complete & Save Attendance
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CREATE ASSIGNMENT ── */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-blue-600" /> Create Course Assignment
              </h3>
              <button onClick={() => setShowAssignmentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAssignment} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Assignment Title *</label>
                <input
                  type="text"
                  required
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  placeholder="e.g. Assignment 1: Schema Normalization"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Instructions / Description</label>
                <textarea
                  rows={3}
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  placeholder="Details and submission guidelines..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Total Marks *</label>
                  <input
                    type="number"
                    required
                    value={newAssignment.totalMarks}
                    onChange={(e) => setNewAssignment({ ...newAssignment, totalMarks: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAssignmentModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
                >
                  Create Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: SCHEDULE CLASS TEST ── */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" /> Schedule Class Test / Exam
              </h3>
              <button onClick={() => setShowTestModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTest} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Test Title *</label>
                <input
                  type="text"
                  required
                  value={newTest.title}
                  onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                  placeholder="e.g. Mid-Term Examination 1"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Test Date *</label>
                  <input
                    type="date"
                    required
                    value={newTest.testDate}
                    onChange={(e) => setNewTest({ ...newTest, testDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Duration *</label>
                  <input
                    type="text"
                    required
                    value={newTest.duration}
                    onChange={(e) => setNewTest({ ...newTest, duration: e.target.value })}
                    placeholder="e.g. 1h 30m"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Total Marks *</label>
                <input
                  type="number"
                  required
                  value={newTest.totalMarks}
                  onChange={(e) => setNewTest({ ...newTest, totalMarks: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
                >
                  Schedule Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: POST ANNOUNCEMENT ── */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-slate-700" /> Post Class Announcement
              </h3>
              <button onClick={() => setShowAnnouncementModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePostAnnouncement} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Notice Title *</label>
                <input
                  type="text"
                  required
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  placeholder="e.g. Lab Class Rescheduled for Wednesday"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Announcement Content *</label>
                <textarea
                  rows={4}
                  required
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  placeholder="Write message to enrolled students..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Priority Level</label>
                <select
                  value={newAnnouncement.priority}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value as any })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white"
                >
                  <option value="Normal">Normal Notice</option>
                  <option value="High">Urgent Notice</option>
                </select>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
                >
                  Post Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: UPLOAD MATERIAL ── */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-indigo-600" /> Upload Course Material
              </h3>
              <button
                onClick={() => {
                  setShowMaterialModal(false);
                  setAttachedMaterialFile(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMaterial} className="p-6 space-y-4 text-xs">
              
              {/* File Attachment Dropzone / File Picker */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Attachment File (PPTX, PDF, Docs) *</span>
                  {newMaterial.fileName && (
                    <span className="text-[10px] font-bold text-emerald-600 font-mono">
                      ✓ File Attached
                    </span>
                  )}
                </label>
                
                <label className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                  newMaterial.fileName
                    ? "border-emerald-300 bg-emerald-50/30 hover:bg-emerald-50/60"
                    : "border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/60"
                }`}>
                  <input
                    type="file"
                    accept=".pdf,.pptx,.ppt,.docx,.doc,.zip"
                    onChange={handleMaterialFileSelected}
                    className="hidden"
                  />
                  {isUploadingMaterialFile ? (
                    <div className="flex flex-col items-center gap-2 text-indigo-600 py-2">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span className="font-bold text-xs">Analyzing file & counting slides...</span>
                    </div>
                  ) : newMaterial.fileName ? (
                    <div className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {newMaterial.fileType}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-[280px] sm:max-w-[340px] text-xs">
                            {newMaterial.fileName}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {newMaterial.size} • {newMaterial.totalSlides > 0 ? `${newMaterial.totalSlides} Slides/Pages • ` : ""}Click to change file
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Ready ✓
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 py-2 text-center">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-1">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        Click to browse or drag & drop file here
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Supports PPTX, PDF, DOCX, ZIP (Auto-detects slide count)
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {/* Material Title */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Material Title *</label>
                <input
                  type="text"
                  required
                  value={newMaterial.title}
                  onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                  placeholder="e.g. Chapter 3 Normalization Slides"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
              </div>

              {/* Category, File Type, and Detected Slides */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Category</label>
                  <select
                    value={newMaterial.category}
                    onChange={(e) => setNewMaterial({ ...newMaterial, category: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white"
                  >
                    <option value="Slides">Slides</option>
                    <option value="Lab & Code">Lab & Code</option>
                    <option value="Reading">Reading</option>
                    <option value="Syllabus">Syllabus</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">File Type</label>
                  <input
                    type="text"
                    value={newMaterial.fileType}
                    onChange={(e) => setNewMaterial({ ...newMaterial, fileType: e.target.value })}
                    placeholder="PDF, PPTX..."
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center justify-between">
                    <span>Total Slides</span>
                    {newMaterial.totalSlides > 0 && <span className="text-[10px] text-emerald-600 font-mono">Auto</span>}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newMaterial.totalSlides || ""}
                    onChange={(e) => setNewMaterial({ ...newMaterial, totalSlides: parseInt(e.target.value) || 0 })}
                    placeholder="e.g. 20"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowMaterialModal(false);
                    setAttachedMaterialFile(null);
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newMaterial.title || isUploadingMaterialFile}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Syllabus Topic Modal (Add / Edit) */}
      {showSyllabusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-sm">{editingSyllabus ? "Edit Course Outline Topic" : "Add Course Outline Topic"}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSyllabusModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveSyllabus();
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                <div className="sm:col-span-3 space-y-1.5">
                  <label className="font-bold text-slate-700">Topic Title *</label>
                  <input
                    type="text"
                    required
                    value={syllabusForm.topic}
                    onChange={(e) => setSyllabusForm({ ...syllabusForm, topic: e.target.value })}
                    placeholder="e.g. Relational Database Concepts"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Week # *</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    required
                    value={syllabusForm.week}
                    onChange={(e) => setSyllabusForm({ ...syllabusForm, week: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Teaching Status</label>
                <select
                  value={syllabusForm.teacherStatus}
                  onChange={(e) => setSyllabusForm({ ...syllabusForm, teacherStatus: e.target.value as any })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="current">In Progress (Current)</option>
                  <option value="done">Completed</option>
                </select>
              </div>

              <div className="space-y-2 bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Presentation className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Attach Presentation Slide (PPTX / PDF)</span>
                  </label>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-md">
                    Live Class Sync
                  </span>
                </div>

                {/* Dropdown for selecting existing materials */}
                <select
                  value={syllabusForm.materialFileName || ""}
                  onChange={(e) => {
                    const sel = e.target.value;
                    if (!sel) {
                      setSyllabusForm({
                        ...syllabusForm,
                        materialId: "",
                        materialTitle: "",
                        materialFileName: "",
                      });
                      setSlideUploadFeedback(null);
                      return;
                    }
                    const matchedMat = availableMaterials.find((m) => m.fileName === sel || m.title === sel);
                    const isPres1 = sel.toLowerCase().includes("presentation1");
                    const isIncep = sel.toLowerCase().includes("inception");
                    const isUml = sel.toLowerCase().includes("uml");
                    const autoSlides = matchedMat?.totalSlides || (isPres1 ? 20 : isIncep ? 24 : isUml ? 12 : 20);
                    setSyllabusForm({
                      ...syllabusForm,
                      materialFileName: sel,
                      materialTitle: sel.replace(/\.[^/.]+$/, ""),
                      materialId: matchedMat?.id || (isPres1 ? "mat_pres1" : isIncep ? "mat_incep2" : `mat_${Date.now()}`),
                      totalSlides: autoSlides,
                    });
                    setSlideUploadFeedback(null);
                  }}
                  className="w-full px-3 py-2 text-xs border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-slate-800 shadow-2xs"
                >
                  <option value="">-- Choose from existing materials (or upload new below) --</option>
                  <option value="Presentation1.pptx">Presentation1.pptx (20 Slides • Software Architecture & Modularity)</option>
                  <option value="Inception_v2 copy.pptx">Inception_v2 copy.pptx (24 Slides • Inception & System Design)</option>
                  <option value="UML Diagram - Library System.pdf">UML Diagram - Library System.pdf (System Modelling)</option>
                  {(availableMaterials || [])
                    .filter((m) => m.fileName && !["Presentation1.pptx", "Inception_v2 copy.pptx", "UML Diagram - Library System.pdf"].includes(m.fileName))
                    .map((m: any) => (
                      <option key={m.id} value={m.fileName || m.title}>
                        {m.title} ({m.fileName || "Deck"}) {m.totalSlides ? `• ${m.totalSlides} Slides` : ""}
                      </option>
                    ))}
                  {syllabusForm.materialFileName &&
                    !["Presentation1.pptx", "Inception_v2 copy.pptx", "UML Diagram - Library System.pdf", ...(availableMaterials || []).map(m => m.fileName)].includes(syllabusForm.materialFileName) && (
                      <option value={syllabusForm.materialFileName}>
                        {syllabusForm.materialFileName} (Attached Deck)
                      </option>
                    )}
                </select>

                {/* Currently Attached Deck Status Badge */}
                {syllabusForm.materialFileName && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-100/70 border border-indigo-200/80 text-indigo-950 text-xs shadow-2xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Presentation className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold truncate block">{syllabusForm.materialFileName}</span>
                        <span className="text-[10px] text-indigo-700 font-mono">
                          {syllabusForm.totalSlides || 20} Slides Attached • Synced to Live Class
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSyllabusForm({
                          ...syllabusForm,
                          materialId: "",
                          materialTitle: "",
                          materialFileName: "",
                        });
                        setSlideUploadFeedback(null);
                      }}
                      className="text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-md transition-colors shrink-0 ml-2"
                      title="Detach this presentation slide"
                    >
                      Detach
                    </button>
                  </div>
                )}

                {/* Direct Upload Option (Auto registers into Course Materials & auto-counts slides) */}
                <div className="pt-0.5">
                  <label className="flex items-center justify-center gap-2.5 w-full p-2.5 rounded-xl border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-white hover:bg-indigo-50/50 cursor-pointer transition-all text-xs font-bold text-indigo-700 shadow-2xs group">
                    {isParsingSlide ? (
                      <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                    )}
                    <span>
                      {isParsingSlide ? "Parsing & Counting Slides..." : "Upload New Deck / PDF (Auto-Counts Slides)"}
                    </span>
                    <input
                      type="file"
                      accept=".pptx,.ppt,.pdf"
                      disabled={isParsingSlide}
                      onChange={handleSyllabusSlideFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Real-time Upload & Auto-Detection Feedback */}
                {slideUploadFeedback && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800 animate-in fade-in duration-200 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-bold flex items-center gap-1.5">
                          <span>{slideUploadFeedback.fileName}</span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300/60">
                            {slideUploadFeedback.isPdf ? "PDF" : "PPTX"}
                          </span>
                        </p>
                        <p className="text-[10px] text-emerald-700">
                          Saved to Course Materials • Auto-detected{" "}
                          <strong className="text-emerald-950 font-bold">
                            {slideUploadFeedback.slides} {slideUploadFeedback.isPdf ? "Pages" : "Slides"}
                          </strong>{" "}
                          ({slideUploadFeedback.size})
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 border border-emerald-300">
                      Auto-Counted ✓
                    </span>
                  </div>
                )}

                <p className="text-[10px] text-indigo-700 font-medium">
                  Files uploaded here automatically sync to Course Materials repository and live class slide presenter.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200/60">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Presentation className="w-3.5 h-3.5 text-indigo-600" /> Total Slides
                    </span>
                    {slideUploadFeedback && (
                      <span className="text-[10px] font-bold text-emerald-600 font-mono">Auto-detected ✓</span>
                    )}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={syllabusForm.totalSlides}
                    onChange={(e) => setSyllabusForm({ ...syllabusForm, totalSlides: Math.max(0, parseInt(e.target.value) || 0) })}
                    placeholder="e.g. 24"
                    className={`w-full px-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white font-mono font-bold ${
                      slideUploadFeedback ? "border-emerald-400 bg-emerald-50/30 text-emerald-900 ring-2 ring-emerald-500/20" : "border-slate-200 text-slate-800"
                    }`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Covered / Current Slide</label>
                  <input
                    type="number"
                    min={0}
                    max={syllabusForm.totalSlides || 999}
                    value={syllabusForm.completedSlides}
                    onChange={(e) => setSyllabusForm({ ...syllabusForm, completedSlides: Math.max(0, parseInt(e.target.value) || 0) })}
                    placeholder="e.g. 0"
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Sub-topics / Key Concepts</label>
                  <button
                    type="button"
                    onClick={() => setSyllabusForm({ ...syllabusForm, subTopics: [...syllabusForm.subTopics, ""] })}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    + Add Subtopic
                  </button>
                </div>
                {syllabusForm.subTopics.map((sub, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={sub}
                      onChange={(e) => {
                        const updated = [...syllabusForm.subTopics];
                        updated[idx] = e.target.value;
                        setSyllabusForm({ ...syllabusForm, subTopics: updated });
                      }}
                      placeholder={`Subtopic ${idx + 1}`}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                    />
                    {syllabusForm.subTopics.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = syllabusForm.subTopics.filter((_, i) => i !== idx);
                          setSyllabusForm({ ...syllabusForm, subTopics: updated });
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSyllabusModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
                >
                  {editingSyllabus ? "Save Changes" : "Create Topic"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EVALUATION POLICY ── */}
      {showEvaluationPolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Academic Evaluation Policy</h3>
                  <p className="text-xs text-slate-500">{course.code} • {course.title}</p>
                </div>
              </div>
              <button onClick={() => setShowEvaluationPolicyModal(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">Grading Weightage Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 rounded-xl bg-white border border-slate-200/60">
                    <span className="font-bold text-slate-800">Class Tests & Quizzes</span>
                    <span className="font-black text-indigo-600">20 Marks (20%)</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-xl bg-white border border-slate-200/60">
                    <span className="font-bold text-slate-800">Assignments & Homework</span>
                    <span className="font-black text-indigo-600">20 Marks (20%)</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-xl bg-white border border-slate-200/60">
                    <span className="font-bold text-slate-800">Mid-Term Examination</span>
                    <span className="font-black text-indigo-600">30 Marks (30%)</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-xl bg-white border border-slate-200/60">
                    <span className="font-bold text-slate-800">Final Semester Exam</span>
                    <span className="font-black text-indigo-600">50 Marks (30%)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-200/60">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-[11px] font-medium">Minimum attendance threshold of 75% is required for semester final exam eligibility.</span>
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowEvaluationPolicyModal(false)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: STUDENT SUBMISSION PREVIEW & INLINE ANNOTATION REVIEWER (SPLIT SCREEN) ── */}
      {evaluatingTarget && (() => {
        const currentStudent = students[reviewingStudentIndex] || students[0];
        const studentId = currentStudent?.id || "";
        const targetKey = `${evaluatingTarget.id}_${studentId}`;
        const currentDraft = evaluatingDraft[studentId] || { marks: String(evaluatingTarget.totalMarks), remarks: "" };
        const studentNotes = annotations[targetKey] || [];
        const mockCode = getMockStudentSubmissionCode(currentStudent?.name || "Student", evaluatingTarget.title);
        const codeLines = mockCode.split("\n");

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-7xl w-full h-[92vh] flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
                    <FileCode className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-white tracking-tight">
                        Student Submission Reviewer & Annotation Canvas
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                        {evaluatingTarget.type === "assignment" ? "Assignment" : "Test"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Target: <span className="text-slate-200 font-semibold">{evaluatingTarget.title}</span> • Max Marks: {evaluatingTarget.totalMarks} • {batch.name}
                    </p>
                  </div>
                </div>

                {/* Center Mode Switcher */}
                <div className="flex items-center bg-slate-800 p-1 rounded-2xl border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setReviewerMode("split")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      reviewerMode === "split"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" /> ⚡ Split Canvas Reviewer
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewerMode("list")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      reviewerMode === "list"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <ListTodo className="w-3.5 h-3.5" /> 📋 Student List View
                  </button>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-3">
                  {singleSaveToast && (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold animate-in fade-in flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {singleSaveToast}
                    </span>
                  )}
                  {reviewerMode === "split" && students.length > 0 && (
                    <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-2xl border border-slate-700">
                      <button
                        type="button"
                        onClick={() => {
                          setReviewingStudentIndex((prev) => (prev > 0 ? prev - 1 : students.length - 1));
                          setSelectedLineForAnnotation(null);
                        }}
                        className="p-1 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
                        title="Previous Student"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-bold text-slate-300 px-2">
                        {reviewingStudentIndex + 1} / {students.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setReviewingStudentIndex((prev) => (prev + 1) % students.length);
                          setSelectedLineForAnnotation(null);
                        }}
                        className="p-1 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
                        title="Next Student"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setEvaluatingTarget(null)}
                    className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Main Content Area */}
              {reviewerMode === "split" ? (
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                  {/* Left Column: Submission File Previewer & Annotation Canvas */}
                  <div className="lg:w-[62%] flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
                    {/* File Tabs & Canvas Toolbar */}
                    <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                        <button
                          type="button"
                          onClick={() => setSubmissionViewTab("code")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                            submissionViewTab === "code"
                              ? "bg-slate-800 text-indigo-300 border border-indigo-500/30 shadow-sm"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                          }`}
                        >
                          <FileCode className="w-3.5 h-3.5 text-indigo-400" /> Solution.tsx
                          <span className="px-1.5 py-0.2 text-[9px] rounded bg-indigo-500/20 text-indigo-300">TSX</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSubmissionViewTab("pdf")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                            submissionViewTab === "pdf"
                              ? "bg-slate-800 text-emerald-300 border border-emerald-500/30 shadow-sm"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-400" /> Submission_Report.pdf
                          <span className="px-1.5 py-0.2 text-[9px] rounded bg-emerald-500/20 text-emerald-300">PDF</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSubmissionViewTab("text")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                            submissionViewTab === "text"
                              ? "bg-slate-800 text-amber-300 border border-amber-500/30 shadow-sm"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-400" /> Console_Logs.txt
                        </button>
                      </div>

                      {/* Toolbar actions */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-xl text-xs text-slate-300 border border-slate-700">
                          <button
                            type="button"
                            onClick={() => setZoomLevel((z) => Math.max(80, z - 10))}
                            className="p-0.5 hover:text-white"
                          >
                            <ZoomOut className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[10px] font-mono font-bold">{zoomLevel}%</span>
                          <button
                            type="button"
                            onClick={() => setZoomLevel((z) => Math.min(160, z + 10))}
                            className="p-0.5 hover:text-white"
                          >
                            <ZoomIn className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const blob = new Blob([mockCode], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${currentStudent?.name || 'student'}_submission.tsx`;
                            a.click();
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5 text-indigo-400" /> Download File
                        </button>
                      </div>
                    </div>

                    {/* Canvas Area based on Tab */}
                    <div className="flex-1 overflow-y-auto p-4 font-mono text-xs select-text bg-slate-950">
                      {submissionViewTab === "code" && (
                        <div
                          style={{ fontSize: `${(zoomLevel / 100) * 12}px` }}
                          className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-inner leading-relaxed space-y-1"
                        >
                          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5 text-indigo-400" /> Click on any line number to attach an inline annotation sticky note
                            </span>
                            <span className="bg-slate-800 px-2 py-0.5 rounded text-indigo-300 font-sans">
                              {studentNotes.length} Annotation(s) attached
                            </span>
                          </div>

                          {codeLines.map((lineText, idx) => {
                            const lineNo = idx + 1;
                            const isSelected = selectedLineForAnnotation === lineNo;
                            const lineNotes = studentNotes.filter((n) => n.lineNo === lineNo);

                            return (
                              <div key={lineNo} className="group relative">
                                <div
                                  className={`flex items-start gap-3 rounded px-2 py-0.5 transition-colors ${
                                    isSelected
                                      ? "bg-indigo-950/80 border-l-2 border-indigo-400"
                                      : lineNotes.length > 0
                                      ? "bg-slate-800/60 border-l-2 border-amber-400"
                                      : "hover:bg-slate-800/40"
                                  }`}
                                >
                                  {/* Line Number Button */}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedLineForAnnotation(isSelected ? null : lineNo)}
                                    className="w-8 text-right shrink-0 text-slate-500 font-mono text-[11px] group-hover:text-indigo-400 hover:underline flex items-center justify-end gap-1"
                                    title="Click to add inline note"
                                  >
                                    <PlusCircle className="w-3 h-3 opacity-0 group-hover:opacity-100 text-indigo-400 transition-opacity" />
                                    {lineNo}
                                  </button>

                                  {/* Line Content */}
                                  <pre className="flex-1 whitespace-pre-wrap break-words text-slate-200 font-mono text-[11px]">
                                    {lineText}
                                  </pre>

                                  {/* Line Note Count Badge */}
                                  {lineNotes.length > 0 && (
                                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-sans font-bold flex items-center gap-1 shrink-0">
                                      <StickyNote className="w-3 h-3 text-amber-400" /> {lineNotes.length}
                                    </span>
                                  )}
                                </div>

                                {/* Inline Annotation Composer if Line Selected */}
                                {isSelected && (
                                  <div className="my-2 ml-10 p-3 bg-slate-800 border border-indigo-500/50 rounded-2xl shadow-xl animate-in slide-in-from-top-2 duration-150 font-sans">
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                                      <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                                        <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Add Inline Note to Line {lineNo}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        {(["suggestion", "bug", "praise"] as const).map((tag) => (
                                          <button
                                            key={tag}
                                            type="button"
                                            onClick={() => setAnnotationTag(tag)}
                                            className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize transition-all ${
                                              annotationTag === tag
                                                ? tag === "bug"
                                                  ? "bg-red-500 text-white"
                                                  : tag === "praise"
                                                  ? "bg-emerald-500 text-white"
                                                  : "bg-amber-500 text-white"
                                                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                            }`}
                                          >
                                            {tag}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                      <input
                                        type="text"
                                        placeholder={`Type feedback for line ${lineNo}...`}
                                        value={inlineCommentInput}
                                        onChange={(e) => setInlineCommentInput(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleAddAnnotation(targetKey, lineNo);
                                          }
                                        }}
                                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                                        autoFocus
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleAddAnnotation(targetKey, lineNo)}
                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1"
                                      >
                                        Post Note
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Attached Annotations Rendered Inline */}
                                {lineNotes.map((note) => (
                                  <div
                                    key={note.id}
                                    className="my-1.5 ml-10 p-2.5 bg-slate-800/90 border border-amber-500/40 rounded-xl shadow-md font-sans text-xs flex items-start justify-between gap-2"
                                  >
                                    <div className="flex items-start gap-2">
                                      <span
                                        className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase shrink-0 ${
                                          note.tag === "bug"
                                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                            : note.tag === "praise"
                                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                        }`}
                                      >
                                        {note.tag || "note"}
                                      </span>
                                      <div>
                                        <p className="text-slate-200 font-medium text-[11px]">{note.comment}</p>
                                        <p className="text-[9px] text-slate-400 mt-0.5">
                                          By {note.author} at {note.createdAt}
                                        </p>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteAnnotation(targetKey, note.id)}
                                      className="text-slate-400 hover:text-red-400 p-1 transition-colors"
                                      title="Delete note"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {submissionViewTab === "pdf" && (
                        <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4 font-sans text-xs min-h-[500px]">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                            <div>
                              <h4 className="text-sm font-extrabold text-slate-900">
                                PDF Document Submission Report
                              </h4>
                              <p className="text-[10px] text-slate-500">
                                Student: {currentStudent?.name} • Roll: {currentStudent?.rollNo} • File: submission_doc.pdf
                              </p>
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                              Verified PDF Document
                            </span>
                          </div>

                          <div className="space-y-3 leading-relaxed text-slate-700">
                            <p className="font-bold text-slate-900">1. Executive Overview & Problem Formulation</p>
                            <p>
                              In this assignment implementation, we designed a client-side reactive state management system and integrated backend query APIs using custom React hooks.
                            </p>
                            
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 space-y-1">
                              <p className="text-indigo-700 font-bold">// Performance Benchmark Output</p>
                              <p>Execution Time: 14ms | Memory Consumption: 4.2 MB</p>
                              <p>Test Pass Rate: 100% (12/12 test suites executed successfully)</p>
                            </div>

                            <p className="font-bold text-slate-900 mt-2">2. Architectural Diagram & Logic Flow</p>
                            <p>
                              Data flowing from the REST API endpoint is cached locally inside component state and updated continuously through background polling intervals.
                            </p>
                          </div>

                          {/* PDF Floating Sticky Note Pin Composer */}
                          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              <StickyNote className="w-4 h-4 text-amber-500" />
                              <input
                                type="text"
                                placeholder="Attach PDF document sticky note..."
                                value={inlineCommentInput}
                                onChange={(e) => setInlineCommentInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddAnnotation(targetKey);
                                  }
                                }}
                                className="flex-1 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddAnnotation(targetKey)}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-sm transition-colors"
                              >
                                Pin Note
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {submissionViewTab === "text" && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 space-y-1 leading-relaxed">
                          <p className="text-slate-500">[00:00:01] Initializing student execution sandbox...</p>
                          <p className="text-emerald-400">[00:00:02] Test Suite #1: Basic Inputs - PASSED</p>
                          <p className="text-emerald-400">[00:00:02] Test Suite #2: Boundary Values - PASSED</p>
                          <p className="text-emerald-400">[00:00:03] Test Suite #3: Async Data Fetching - PASSED</p>
                          <p className="text-indigo-400">[00:00:04] Benchmark: Total execution completed in 4ms with 0 errors.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Grading, Rubrics & Feedback Panel */}
                  <div className="lg:w-[38%] flex flex-col bg-slate-50 overflow-y-auto p-5 space-y-5">
                    {/* Active Student Badge */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-extrabold text-sm shadow-md">
                          {currentStudent?.name.slice(0, 2).toUpperCase() || "ST"}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">{currentStudent?.name}</h4>
                          <p className="text-xs text-slate-500 font-medium">Roll: {currentStudent?.rollNo} • {currentStudent?.email || "Student"}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Submitted
                      </span>
                    </div>

                    {/* Interactive Rubric Evaluator */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-indigo-600" /> Rubric-Based Scoring Calculator
                        </h4>
                        <span className="text-[10px] text-slate-400 font-bold">Auto-Calculates Score</span>
                      </div>

                      {/* Correctness Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-700">Code Logic & Correctness (40%)</span>
                          <span className="text-indigo-600">{rubricScores.correctness}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="40"
                          value={rubricScores.correctness}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setRubricScores((prev) => {
                              const updated = { ...prev, correctness: val };
                              const totalPct = (updated.correctness + updated.quality + updated.documentation) / 90;
                              const calcMarks = Math.round(totalPct * evaluatingTarget.totalMarks);
                              setEvaluatingDraft((d) => ({
                                ...d,
                                [studentId]: { ...d[studentId], marks: String(Math.min(evaluatingTarget.totalMarks, calcMarks)) },
                              }));
                              return updated;
                            });
                          }}
                          className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
                        />
                      </div>

                      {/* Code Quality Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-700">Code Quality & Efficiency (30%)</span>
                          <span className="text-indigo-600">{rubricScores.quality}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="30"
                          value={rubricScores.quality}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setRubricScores((prev) => {
                              const updated = { ...prev, quality: val };
                              const totalPct = (updated.correctness + updated.quality + updated.documentation) / 90;
                              const calcMarks = Math.round(totalPct * evaluatingTarget.totalMarks);
                              setEvaluatingDraft((d) => ({
                                ...d,
                                [studentId]: { ...d[studentId], marks: String(Math.min(evaluatingTarget.totalMarks, calcMarks)) },
                              }));
                              return updated;
                            });
                          }}
                          className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
                        />
                      </div>

                      {/* Documentation Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-700">Documentation & Comments (20%)</span>
                          <span className="text-indigo-600">{rubricScores.documentation}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          value={rubricScores.documentation}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setRubricScores((prev) => {
                              const updated = { ...prev, documentation: val };
                              const totalPct = (updated.correctness + updated.quality + updated.documentation) / 90;
                              const calcMarks = Math.round(totalPct * evaluatingTarget.totalMarks);
                              setEvaluatingDraft((d) => ({
                                ...d,
                                [studentId]: { ...d[studentId], marks: String(Math.min(evaluatingTarget.totalMarks, calcMarks)) },
                              }));
                              return updated;
                            });
                          }}
                          className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Final Score & Grade Badge Input */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-extrabold text-slate-900">Obtained Score / Max Score</label>
                        {Number(currentDraft.marks) >= evaluatingTarget.totalMarks * 0.8 ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                            Grade A+ (Distinction)
                          </span>
                        ) : Number(currentDraft.marks) >= evaluatingTarget.totalMarks * 0.6 ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-extrabold">
                            Grade B (Good)
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                            Needs Revision
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            min={0}
                            max={evaluatingTarget.totalMarks}
                            value={currentDraft.marks}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEvaluatingDraft((prev) => ({
                                ...prev,
                                [studentId]: { ...prev[studentId], marks: val },
                              }));
                            }}
                            className="w-full pl-3 pr-10 py-2.5 border-2 border-indigo-200 rounded-xl text-base font-extrabold text-indigo-900 focus:ring-2 focus:ring-indigo-500 bg-white"
                          />
                          <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                            / {evaluatingTarget.totalMarks}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Feedback Presets */}
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Preset Feedback Chips
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          "🌟 Excellent logic and error handling!",
                          "⚠️ Clean code, but add missing comments.",
                          "💡 Consider optimizing loop performance.",
                          "❌ Test cases failed for edge inputs.",
                        ].map((preset, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => {
                              setEvaluatingDraft((prev) => {
                                const old = prev[studentId]?.remarks || "";
                                const updated = old ? `${old} ${preset}` : preset;
                                return { ...prev, [studentId]: { ...prev[studentId], remarks: updated } };
                              });
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-[11px] font-medium text-slate-700 transition-all shadow-2xs text-left"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Remarks Input */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                      <label className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-600" /> Teacher Remarks & Evaluation Notes
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Write constructive evaluation feedback..."
                        value={currentDraft.remarks}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEvaluatingDraft((prev) => ({
                            ...prev,
                            [studentId]: { ...prev[studentId], remarks: val },
                          }));
                        }}
                        className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                      />
                    </div>

                    {/* Attached Inline Annotations Summary List */}
                    {studentNotes.length > 0 && (
                      <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 space-y-2">
                        <div className="flex items-center justify-between text-xs font-extrabold text-amber-900">
                          <span className="flex items-center gap-1.5">
                            <StickyNote className="w-4 h-4 text-amber-600" /> {studentNotes.length} Inline Annotation Note(s)
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const notesSummary = studentNotes.map((a) => `• ${a.lineNo ? `L${a.lineNo}: ` : ""}${a.comment}`).join("; ");
                              setEvaluatingDraft((prev) => {
                                const old = prev[studentId]?.remarks || "";
                                return { ...prev, [studentId]: { ...prev[studentId], remarks: old ? `${old} [Notes: ${notesSummary}]` : `[Notes: ${notesSummary}]` } };
                              });
                            }}
                            className="text-[10px] font-bold text-indigo-700 hover:underline"
                          >
                            Append to Remarks
                          </button>
                        </div>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {studentNotes.map((note) => (
                            <div key={note.id} className="text-[11px] text-amber-800 flex items-start gap-1">
                              <span className="font-bold text-amber-900 shrink-0">{note.lineNo ? `Line ${note.lineNo}:` : "Doc Note:"}</span>
                              <span className="truncate">{note.comment}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveSingleStudentEvaluation(studentId, true)}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" /> Save Marks & Next Student →
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setReviewingStudentIndex((prev) => (prev > 0 ? prev - 1 : students.length - 1));
                          }}
                          className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors"
                        >
                          ← Prev Student
                        </button>
                        <button
                          type="button"
                          onClick={() => setEvaluatingTarget(null)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                        >
                          Close Reviewer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Mode 2: Compact List View for Rapid Batch Grade Input */
                <form onSubmit={handleSaveEvaluationMarks} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                  <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                    {students.map((stud) => {
                      const itemDraft = evaluatingDraft[stud.id] || { marks: "", remarks: "" };
                      return (
                        <div key={stud.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-extrabold text-slate-800 text-xs shrink-0">
                              {stud.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-900 text-xs">{stud.name}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{stud.rollNo}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <label className="text-[10px] font-bold text-slate-500">Score:</label>
                              <input
                                type="number"
                                min={0}
                                max={evaluatingTarget.totalMarks}
                                placeholder={`0-${evaluatingTarget.totalMarks}`}
                                value={itemDraft.marks}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEvaluatingDraft((prev) => ({
                                    ...prev,
                                    [stud.id]: { ...prev[stud.id], marks: val },
                                  }));
                                }}
                                className="w-20 px-2.5 py-1.5 text-xs font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                              />
                            </div>

                            <input
                              type="text"
                              placeholder="Remarks..."
                              value={itemDraft.remarks}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEvaluatingDraft((prev) => ({
                                  ...prev,
                                  [stud.id]: { ...prev[stud.id], remarks: val },
                                }));
                              }}
                              className="w-48 px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEvaluatingTarget(null)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" /> Save All Marks to Database
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        );
      })()}

      {/* ── MODAL: FULL CONTINUOUS EVALUATION GRADEBOOK ── */}
      {showGradebookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Full Gradebook & Continuous Evaluation Editor
                  </h3>
                  <p className="text-xs text-slate-500">{course.code} • {batch.name} • {students.length} Enrolled Students</p>
                </div>
              </div>
              <button onClick={() => setShowGradebookModal(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGradebook} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-96 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 tracking-wider sticky top-0 bg-slate-50">
                      <th className="px-4 py-3">Roll No</th>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">CT Mark (20)</th>
                      <th className="px-4 py-3">Assignment (20)</th>
                      <th className="px-4 py-3">Midterm (30)</th>
                      <th className="px-4 py-3">Final (50)</th>
                      <th className="px-4 py-3 text-right">Total Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((stud) => {
                      const entry = gradebookDraft[stud.id] || { ct: "18", assn: "17", midterm: "24", final: "42" };
                      const total = (Number(entry.ct) || 0) + (Number(entry.assn) || 0) + (Number(entry.midterm) || 0) + (Number(entry.final) || 0);
                      const letter = total >= 90 ? "A+" : total >= 80 ? "A" : total >= 70 ? "B" : "C";

                      return (
                        <tr key={stud.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-mono font-medium text-slate-600">{stud.rollNo}</td>
                          <td className="px-4 py-3 font-bold text-slate-900">{stud.name}</td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              min={0}
                              max={20}
                              value={entry.ct}
                              onChange={(e) => setGradebookDraft((p) => ({ ...p, [stud.id]: { ...entry, ct: e.target.value } }))}
                              className="w-16 px-2 py-1 border border-slate-200 rounded-lg text-xs font-bold text-center focus:ring-1 focus:ring-amber-500"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              min={0}
                              max={20}
                              value={entry.assn}
                              onChange={(e) => setGradebookDraft((p) => ({ ...p, [stud.id]: { ...entry, assn: e.target.value } }))}
                              className="w-16 px-2 py-1 border border-slate-200 rounded-lg text-xs font-bold text-center focus:ring-1 focus:ring-amber-500"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              min={0}
                              max={30}
                              value={entry.midterm}
                              onChange={(e) => setGradebookDraft((p) => ({ ...p, [stud.id]: { ...entry, midterm: e.target.value } }))}
                              className="w-16 px-2 py-1 border border-slate-200 rounded-lg text-xs font-bold text-center focus:ring-1 focus:ring-amber-500"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              min={0}
                              max={50}
                              value={entry.final}
                              onChange={(e) => setGradebookDraft((p) => ({ ...p, [stud.id]: { ...entry, final: e.target.value } }))}
                              className="w-16 px-2 py-1 border border-slate-200 rounded-lg text-xs font-bold text-center focus:ring-1 focus:ring-amber-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-extrabold text-slate-900">{total}</span>{" "}
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              {letter}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowGradebookModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Save All Student Grades
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: HISTORICAL ARCHIVE ── */}
      {showArchiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Historical Classroom Archive</h3>
                  <p className="text-xs text-slate-500">{course.code} • {batch.name}</p>
                </div>
              </div>
              <button onClick={() => setShowArchiveModal(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">Semester Performance Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <p className="text-base font-black text-slate-900">{classroomSessions.length}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Sessions Logged</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <p className="text-base font-black text-emerald-600">{avgAttendanceRate}%</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Avg Attendance</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <p className="text-base font-black text-indigo-600">{completedTopicsCount} / {courseSyllabus.length}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Topics Covered</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <p className="text-base font-black text-slate-900">{assignments.length + tests.length}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Assessments</p>
                  </div>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowArchiveModal(false)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs"
                >
                  Close Archive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ModalDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type || "confirm"}
        confirmLabel={confirmDialog.confirmLabel || "Confirm"}
        cancelLabel="Cancel"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Success Dialog */}
      <ModalDialog
        isOpen={successModal.isOpen}
        title={successModal.title}
        message={successModal.message}
        type="success"
        confirmLabel="Got it"
        onConfirm={() => setSuccessModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Slide Deck In-App Presenter Modal */}
      {isPresenterOpen && presenterMaterial && (
        <SlideDeckPresenterModal
          isOpen={isPresenterOpen}
          onClose={() => {
            setIsPresenterOpen(false);
            fetchSlideStates(true);
          }}
          material={presenterMaterial}
          classroomId={classroomId}
          initialSlide={slideStates[presenterMaterial.id]?.lastSlide || (presenterMaterial as any).lastSlide}
          courseTitle={view?.course.title}
          courseCode={view?.course.code}
          batchName={view?.batch.name}
          teacherName={view?.teacher.name}
        />
      )}

    </div>
  );
}

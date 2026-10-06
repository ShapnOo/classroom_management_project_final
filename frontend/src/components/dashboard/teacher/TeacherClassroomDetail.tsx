"use client";

import {
  Users, Clock, Play, FolderOpen, ClipboardCheck,
  Search, CalendarDays, BookOpen, LayoutGrid,
  Info, MapPin, ArrowLeft, CheckCircle2, Circle, TrendingUp,
  Plus, Edit2, Trash2, FileText, ListTodo, Bell, Download, ChevronRight,
  Sparkles, Award, AlertCircle, X, ExternalLink, Filter,
  Check, Calendar, Megaphone, Share2, Layers, CheckSquare,
  UserCheck, UserX, Clock3, RotateCcw, Sliders, Presentation,
  FileCode, Eye, MessageSquare, PlusCircle, ChevronLeft, CornerDownRight,
  ZoomIn, ZoomOut, Maximize2, Tag, ThumbsUp, FileCheck, StickyNote, Highlighter
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import type { SyllabusTopic, Assignment, Test, Announcement, AttendanceRecord } from "@/lib/types";
import ModalDialog from "@/components/ui/ModalDialog";
import { ClassroomDetailSkeleton } from "@/components/ui/Skeleton";

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
  }, [classroomId]);

  const view = getClassroomView(classroomId);

  const [activeTab, setActiveTab] = useState<
    "overview" | "live" | "syllabus" | "sessions" | "students" | "materials" | "assessments" | "announcements" | "grades"
  >("overview");

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
    totalSlides: 0,
    completedSlides: 0,
  });
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

  const [newMaterial, setNewMaterial] = useState({
    title: "",
    category: "Slides",
    fileType: "PDF",
    size: "2.5 MB",
  });

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

  const openAddSyllabus = () => {
    setEditingSyllabus(null);
    setSyllabusForm({
      topic: "",
      week: courseSyllabus.length ? Math.max(...courseSyllabus.map((s) => s.week)) + 1 : 1,
      subTopics: ["", ""],
      teacherStatus: "pending",
      totalSlides: 0,
      completedSlides: 0,
    });
    setShowSyllabusModal(true);
  };

  const openEditSyllabus = (top: SyllabusTopic) => {
    setEditingSyllabus(top);
    setSyllabusForm({
      topic: top.topic,
      week: top.week,
      subTopics: top.subTopics ? [...top.subTopics] : ["", ""],
      teacherStatus: top.teacherStatus,
      totalSlides: top.totalSlides || 0,
      completedSlides: top.completedSlides || 0,
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

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.title) return;
    setConfirmDialog({
      isOpen: true,
      title: "Are you sure?",
      message: `Are you sure you want to upload material "${newMaterial.title}"?`,
      type: "confirm",
      confirmLabel: "Yes, Upload",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        setMaterials((prev) => [
          {
            id: `mat-${Date.now()}`,
            title: newMaterial.title,
            category: newMaterial.category,
            fileType: newMaterial.fileType,
            size: newMaterial.size || "2.0 MB",
            date: "Just now",
            downloads: 0,
          },
          ...prev,
        ]);
        setNewMaterial({
          title: "",
          category: "Slides",
          fileType: "PDF",
          size: "2.5 MB",
        });
        setShowMaterialModal(false);
        setSuccessModal({
          isOpen: true,
          title: "Material Uploaded",
          message: `Material "${newMaterial.title}" has been uploaded successfully.`,
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

      {/* ── Header Breadcrumb Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

        {/* Primary Header Action */}
        <div className="flex items-center gap-2">
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
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              <ClipboardCheck className="w-4 h-4" /> Take Attendance
            </button>
          )}
        </div>
      </div>

      {/* ── Main Classroom Hero Banner ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden relative">
        <div className={`h-2.5 w-full ${colors.color}`} />
        <div className="p-6 md:p-7 space-y-6">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Title & Metadata */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider ${colors.light} ${colors.text}`}>
                  {course.code}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                  {batch.name}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600">
                  {session.name}
                </span>
                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold capitalize ${
                  cls.status === "ongoing"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                    : cls.status === "upcoming"
                    ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                    : "bg-slate-100 text-slate-600"
                }`}>
                  ● {cls.status}
                </span>
              </div>

              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                {course.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 pt-1">
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

            {/* Quick Actions Dropdown / Action Buttons */}
            <div className="flex items-center flex-wrap gap-2 shrink-0">
              <button
                onClick={() => setShowAssignmentModal(true)}
                className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-slate-500" /> Assignment
              </button>
              <button
                onClick={() => setShowTestModal(true)}
                className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-slate-500" /> Class Test
              </button>
              <button
                onClick={() => setShowAnnouncementModal(true)}
                className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Megaphone className="w-3.5 h-3.5 text-slate-500" /> Notice
              </button>
              <button
                onClick={() => setShowEvaluationPolicyModal(true)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-600" /> Evaluation Policy
              </button>
            </div>
          </div>

          {/* Key Metrics Strip (4 Sleek Cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveTab("overview")}
              className="bg-slate-50/70 hover:bg-white hover:border-brand-dark cursor-pointer transition-all hover:shadow-xs rounded-xl p-3.5 border border-slate-200/60 flex flex-col justify-between text-left group"
            >
              <span className="text-[10px] font-bold text-slate-500 group-hover:text-brand-dark uppercase tracking-wider transition-colors">
                Class Progress
              </span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-base font-extrabold text-slate-900">
                  {cls.classesCompleted} <span className="text-xs text-slate-400 font-normal">/ {cls.totalClasses}</span>
                </span>
                <span className={`text-xs font-bold ${colors.text}`}>{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mt-2">
                <div className={`h-full ${colors.color} rounded-full`} style={{ width: `${progress}%` }} />
              </div>
            </button>

            <button
              onClick={() => setActiveTab("students")}
              className="bg-slate-50/70 hover:bg-white hover:border-brand-dark cursor-pointer transition-all hover:shadow-xs rounded-xl p-3.5 border border-slate-200/60 flex flex-col justify-between text-left group"
            >
              <span className="text-[10px] font-bold text-slate-500 group-hover:text-brand-dark uppercase tracking-wider transition-colors">
                Enrolled Students
              </span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-base font-extrabold text-slate-900">{students.length}</span>
                <span className="text-[11px] text-slate-500 font-medium">{batch.code}</span>
              </div>
              <p className="text-[10px] text-slate-400 group-hover:text-slate-600 transition-colors mt-1">View Student Roster →</p>
            </button>

            <button
              onClick={() => setActiveTab("sessions")}
              className="bg-slate-50/70 hover:bg-white hover:border-brand-dark cursor-pointer transition-all hover:shadow-xs rounded-xl p-3.5 border border-slate-200/60 flex flex-col justify-between text-left group"
            >
              <span className="text-[10px] font-bold text-slate-500 group-hover:text-emerald-700 uppercase tracking-wider transition-colors">
                Avg Attendance Rate
              </span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-base font-extrabold text-emerald-600">{avgAttendanceRate}%</span>
                <span className="text-[11px] text-emerald-700 font-semibold">{classroomSessions.length} Sessions</span>
              </div>
              <p className="text-[10px] text-slate-400 group-hover:text-emerald-700 transition-colors mt-1">View Session History →</p>
            </button>

            <button
              onClick={() => setActiveTab("syllabus")}
              className="bg-slate-50/70 hover:bg-white hover:border-brand-dark cursor-pointer transition-all hover:shadow-xs rounded-xl p-3.5 border border-slate-200/60 flex flex-col justify-between text-left group"
            >
              <span className="text-[10px] font-bold text-slate-500 group-hover:text-brand-dark uppercase tracking-wider transition-colors">
                Syllabus Topics
              </span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-base font-extrabold text-slate-900">
                  {completedTopicsCount} <span className="text-xs text-slate-400 font-normal">/ {courseSyllabus.length}</span>
                </span>
                <span className="text-xs font-bold text-slate-700">
                  {courseSyllabus.length > 0 ? Math.round((completedTopicsCount / courseSyllabus.length) * 100) : 0}%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 group-hover:text-slate-600 transition-colors mt-1">View Course Outline →</p>
            </button>
          </div>

        </div>
      </div>

      {/* ── Standalone Navigation Pill Bar ── */}
      <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: "overview", label: "Overview", icon: LayoutGrid },
          { id: "live", label: "Live Class", icon: Presentation, badge: "ACTIVE" },
          { id: "syllabus", label: "Course Outline", icon: BookOpen, count: courseSyllabus.length },
          { id: "sessions", label: "Class Sessions", icon: CalendarDays, count: classroomSessions.length },
          { id: "students", label: "Enrolled Students", icon: Users, count: students.length },
          { id: "assessments", label: "Assignments & Tests", icon: ListTodo, count: assignments.length + tests.length },
          { id: "materials", label: "Course Materials", icon: FolderOpen, count: materials.length },
          { id: "announcements", label: "Notices & Announcements", icon: Bell, count: classAnnouncements.length },
          { id: "grades", label: "Grades & Evaluation", icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 font-extrabold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60 font-semibold"
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? "bg-indigo-50 text-indigo-600" : "bg-slate-200/60 text-slate-500"}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500 text-white tracking-wider animate-pulse">
                  {tab.badge}
                </span>
              )}
              {typeof tab.count === "number" && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] ${
                    isActive ? "bg-indigo-600 text-white font-extrabold" : "bg-slate-200 text-slate-600 font-bold"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB CONTENT ── */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns */}
          <div className="lg:col-span-2 space-y-6">

            {/* Quick Live Class Launcher Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5 border border-slate-800">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  Live Class Quick Access
                </span>
                <h3 className="text-base font-extrabold text-white mt-1.5">Conducting today's lecture?</h3>
                <p className="text-xs text-slate-300 max-w-md">
                  Jump to the dedicated Live Class tab for slide progression and rapid attendance logging.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("live")}
                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 shrink-0 hover:scale-105 active:scale-95"
              >
                <Presentation className="w-4 h-4 text-slate-950" /> Go to Live Class Tab →
              </button>
            </div>

            {/* Recent Conducted Sessions Log */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      RECENT CLASS SESSIONS ({classroomSessions.length})
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">Logged lecture history and student attendance summary</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("sessions")}
                  className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1"
                >
                  Full Session Log <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {classroomSessions.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-500 space-y-3">
                  <p>No class sessions recorded yet.</p>
                  <button
                    onClick={() => setShowAttendanceModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" /> Record First Class
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {classroomSessions.slice(0, 4).map((sess, idx) => {
                    const sessAttendance = attendanceRecords.filter((r) => r.sessionId === sess.id);
                    const present = sessAttendance.filter((r) => r.status === "present").length;
                    const absent = sessAttendance.filter((r) => r.status === "absent").length;
                    return (
                      <div key={sess.id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center shrink-0">
                              <span className="text-xs font-extrabold text-slate-800">#{classroomSessions.length - idx}</span>
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-slate-900">{sess.topicCovered}</h4>
                              <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  {new Date(sess.date).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {sess.duration || "1h 30m"}
                                </span>
                              </div>
                              {sess.notes && (
                                <p className="text-xs text-slate-600 italic bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                                  "{sess.notes}"
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                              {present > 0 ? `${present} Present` : "Attended"}
                            </span>
                            {absent > 0 && (
                              <span className="text-[11px] text-red-600 font-semibold">
                                {absent} absent
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Right Column (1 Col) */}
          <div className="space-y-6">

            {/* Weekly Routine & Schedule Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    CLASS ROUTINE & SCHEDULE
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">Assigned weekly timetable</p>
                </div>
              </div>

              {schedules.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">No weekly routine assigned by admin.</p>
              ) : (
                <div className="space-y-2">
                  {schedules.map((sch) => (
                    <div
                      key={sch.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                    >
                      <span className="font-bold text-slate-900">{sch.day}</span>
                      <span className="text-slate-600 font-medium">
                        {sch.startTime} - {sch.endTime}
                      </span>
                      <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-700 font-semibold text-[11px]">
                        {sch.room || cls.room}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Class Notices Board */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      CLASS NOTICE BOARD
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">Announcements & updates</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAnnouncementModal(true)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  + Post Notice
                </button>
              </div>
              <div className="p-4 space-y-3">
                {classAnnouncements.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No active notices for this class.</p>
                ) : (
                  classAnnouncements.slice(0, 3).map((anc) => (
                    <div
                      key={anc.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 line-clamp-1">
                          {anc.title}
                        </span>
                        {anc.priority === "High" && (
                          <span className="text-[10px] font-extrabold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md uppercase">
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">{anc.content}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>By {anc.authorName}</span>
                        <span>{new Date(anc.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Administrative Context Box */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-200/80 text-slate-700 border border-slate-300/60">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    INSTITUTIONAL METADATA
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">Batch & room allocation details</p>
                </div>
              </div>
              <div className="text-xs text-slate-600 space-y-2 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Batch:</span>
                  <span className="font-bold text-slate-800">{batch.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Program:</span>
                  <span className="font-bold text-slate-800">{program.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Academic Term:</span>
                  <span className="font-bold text-slate-800">{session.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Room Allocated:</span>
                  <span className="font-bold text-slate-800">{cls.room}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: LIVE CLASS HUB (DEDICATED LIVE CLASS TAB) */}
      {activeTab === "live" && (
        <div className="space-y-6">
          {/* Active Topic Switcher & Semester Roadmap Pill Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Presentation className="w-4 h-4 text-indigo-600" /> Live Lecture & Multi-Session Runner
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select any semester topic to teach. Multiple class sessions can be conducted over several days for the same topic.
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

          {/* Active Running Topic & Slide Tracker Hero Card */}
          {currentTopic ? (
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-indigo-900/60 relative overflow-hidden space-y-5">
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
                    onClick={() => {
                      setSessionTopic(currentTopic.topic);
                      setShowAttendanceModal(true);
                    }}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-sm transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
                  >
                    <ClipboardCheck className="w-4 h-4 text-slate-950" /> Conduct Lecture & Log Attendance
                  </button>
                  {currentTopic.teacherStatus !== "done" ? (
                    <button
                      onClick={() => {
                        handleMarkTopicStatus(currentTopic.id, "done");
                        // Automatically select next pending topic
                        const nextPending = courseSyllabus.find((t) => t.id !== currentTopic.id && t.teacherStatus !== "done");
                        if (nextPending) {
                          setSelectedTopicId(nextPending.id);
                          updateSyllabusTopic(nextPending.id, { teacherStatus: "current" });
                        }
                        setSuccessModal({
                          isOpen: true,
                          title: "Topic Completed!",
                          message: `Topic "${currentTopic.topic}" is marked complete. Advanced to next syllabus topic.`,
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

              {/* Live Slide Stepper / Highlight Track */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-indigo-900/40 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-200">
                    <Presentation className="w-4 h-4 text-indigo-400" />
                    <span>Active Slide: <strong className="text-indigo-300 font-black">Slide {Math.min((currentTopic.completedSlides || 0) + 1, currentTopic.totalSlides || 12)}</strong> of {currentTopic.totalSlides || 12}</span>
                  </div>
                  <div className="text-xs font-extrabold text-indigo-300 bg-indigo-950 border border-indigo-800 px-2.5 py-0.5 rounded-lg">
                    {Math.round((((currentTopic.completedSlides || 0)) / (currentTopic.totalSlides || 12)) * 100)}% Slide Progress
                  </div>
                </div>

                {/* Visual Slide Stepper Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
                  {Array.from({ length: currentTopic.totalSlides || 12 }, (_, i) => i + 1).map((slideNum) => {
                    const isCompleted = slideNum <= (currentTopic.completedSlides || 0);
                    const isActive = slideNum === (currentTopic.completedSlides || 0) + 1;
                    return (
                      <button
                        key={slideNum}
                        type="button"
                        onClick={() => {
                          updateSyllabusTopic(currentTopic.id, {
                            completedSlides: slideNum - 1,
                          });
                        }}
                        title={`Jump to Slide ${slideNum}`}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                          isActive
                            ? "bg-indigo-600 text-white font-extrabold shadow-md ring-2 ring-indigo-400 animate-pulse scale-105"
                            : isCompleted
                            ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-semibold"
                            : "bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/60"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <span>Slide {slideNum}</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Slide Navigation Controls */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    type="button"
                    disabled={(currentTopic.completedSlides || 0) <= 0}
                    onClick={() =>
                      updateSyllabusTopic(currentTopic.id, {
                        completedSlides: Math.max(0, (currentTopic.completedSlides || 0) - 1),
                      })
                    }
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 rounded-lg font-semibold transition-colors flex items-center gap-1"
                  >
                    ← Previous Slide
                  </button>
                  <div className="text-[11px] text-slate-400 hidden sm:block">
                    Click any slide pill above to jump directly
                  </div>
                  <button
                    type="button"
                    disabled={(currentTopic.completedSlides || 0) >= (currentTopic.totalSlides || 12)}
                    onClick={() =>
                      updateSyllabusTopic(currentTopic.id, {
                        completedSlides: Math.min(currentTopic.totalSlides || 12, (currentTopic.completedSlides || 0) + 1),
                      })
                    }
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white rounded-lg font-bold transition-colors flex items-center gap-1 shadow-sm"
                  >
                    Next Slide (+1) →
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center space-y-2">
              <p className="text-xs text-slate-500">No active syllabus topic set currently.</p>
              <button
                onClick={() => setActiveTab("syllabus")}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Go to Course Outline to set current topic →
              </button>
            </div>
          )}

          {/* Conducted Sessions specifically for this Active Topic */}
          {currentTopic && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      LECTURE HISTORY FOR "{currentTopic.topic}" ({topicSessions.length})
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">Lectures conducted for this specific syllabus module</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSessionTopic(currentTopic.topic);
                    setShowAttendanceModal(true);
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <ClipboardCheck className="w-3.5 h-3.5" /> + Conduct Next Lecture
                </button>
              </div>

              {topicSessions.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-500 space-y-3">
                  <p>No class sessions recorded for this topic yet.</p>
                  <button
                    onClick={() => {
                      setSessionTopic(currentTopic.topic);
                      setShowAttendanceModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" /> Conduct First Lecture for this Topic
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {topicSessions.map((sess, idx) => {
                    const sessAttendance = attendanceRecords.filter((r) => r.sessionId === sess.id);
                    const present = sessAttendance.filter((r) => r.status === "present").length;
                    const absent = sessAttendance.filter((r) => r.status === "absent").length;
                    return (
                      <div key={sess.id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center shrink-0">
                              <span className="text-xs font-extrabold text-indigo-700">L#{topicSessions.length - idx}</span>
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-slate-900">{sess.topicCovered}</h4>
                              <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1 font-semibold text-slate-700">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  {new Date(sess.date).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {sess.duration || "1h 30m"}
                                </span>
                              </div>
                              {sess.notes && (
                                <p className="text-xs text-slate-600 italic bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                                  "{sess.notes}"
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                              {present > 0 ? `${present} Present` : "Attended"}
                            </span>
                            {absent > 0 && (
                              <span className="text-[11px] text-red-600 font-semibold">
                                {absent} absent
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* All Classroom Sessions Summary */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    ALL SEMESTER CLASS SESSIONS ({classroomSessions.length})
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium font-mono">Complete log across all syllabus modules</p>
                </div>
              </div>
            </div>
            {classroomSessions.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500">No sessions recorded yet.</div>
            ) : (
              <div className="divide-y divide-slate-100 divide-y">
                {classroomSessions.map((sess, idx) => {
                  const sessAttendance = attendanceRecords.filter((r) => r.sessionId === sess.id);
                  const present = sessAttendance.filter((r) => r.status === "present").length;
                  return (
                    <div key={sess.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50">
                      <div>
                        <span className="font-bold text-slate-900">Session #{classroomSessions.length - idx}: {sess.topicCovered}</span>
                        <p className="text-slate-500 text-[11px]">{new Date(sess.date).toLocaleDateString()} • {sess.duration}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg text-xs">
                        {present} Present
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SYLLABUS OUTLINE */}
      {activeTab === "syllabus" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Course Outline & Syllabus</h3>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-md border border-blue-200/60">
                  Official Curriculum
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Update status as you progress through topics during the semester.
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
                        ? "bg-white text-slate-900 shadow-xs"
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
                <Plus className="w-3.5 h-3.5" /> Add Topic
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden divide-y divide-slate-100">
            {filteredSyllabus.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No syllabus topics found for this filter.
              </div>
            ) : (
              filteredSyllabus.map((top) => {
                const isDone = top.teacherStatus === "done";
                const isCurrent = top.teacherStatus === "current";
                return (
                  <div
                    key={top.id}
                    className={`p-5 transition-colors ${
                      isDone ? "bg-emerald-50/20" : isCurrent ? "bg-blue-50/30" : "hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-0.5">
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : isCurrent ? (
                            <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-blue-600" />
                            </div>
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                              Week {top.week}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                                isDone
                                  ? "bg-emerald-100 text-emerald-800"
                                  : isCurrent
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {top.teacherStatus}
                            </span>
                          </div>
                          <h4
                            className={`text-sm font-bold ${
                              isDone ? "text-slate-500 line-through" : "text-slate-900"
                            }`}
                          >
                            {top.topic}
                          </h4>
                          {top.subTopics && top.subTopics.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {top.subTopics.map((sub, idx) => (
                                <span
                                  key={idx}
                                  className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-lg font-medium"
                                >
                                  {sub}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Slide Progress Badge & Tracker */}
                          {top.totalSlides && top.totalSlides > 0 ? (
                            <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-3 text-xs">
                              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                                <Presentation className="w-4 h-4 text-indigo-600" />
                                <span>
                                  Slide <strong className="text-indigo-600 font-extrabold">{top.completedSlides || 0}</strong> / {top.totalSlides}
                                </span>
                                <span className="text-[11px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                                  {Math.round(((top.completedSlides || 0) / top.totalSlides) * 100)}%
                                </span>
                              </div>

                              {/* Mini Slide Progress Bar */}
                              <div className="flex-1 min-w-[100px] max-w-[180px] h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                                <div
                                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${Math.min(100, Math.round(((top.completedSlides || 0) / top.totalSlides) * 100))}%`,
                                  }}
                                />
                              </div>

                              {/* Quick Slide Update Controls */}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  title="Decrease Slide"
                                  disabled={(top.completedSlides || 0) <= 0}
                                  onClick={() =>
                                    updateSyllabusTopic(top.id, {
                                      completedSlides: Math.max(0, (top.completedSlides || 0) - 1),
                                    })
                                  }
                                  className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 font-bold flex items-center justify-center text-xs transition-colors"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min={0}
                                  max={top.totalSlides}
                                  value={top.completedSlides || 0}
                                  onChange={(e) => {
                                    const val = Math.min(top.totalSlides!, Math.max(0, parseInt(e.target.value) || 0));
                                    updateSyllabusTopic(top.id, { completedSlides: val });
                                  }}
                                  className="w-12 px-1 py-0.5 text-center text-xs font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                                />
                                <button
                                  type="button"
                                  title="Increase Slide"
                                  disabled={(top.completedSlides || 0) >= top.totalSlides}
                                  onClick={() =>
                                    updateSyllabusTopic(top.id, {
                                      completedSlides: Math.min(top.totalSlides!, (top.completedSlides || 0) + 1),
                                    })
                                  }
                                  className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 font-bold flex items-center justify-center text-xs transition-colors"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                              <Presentation className="w-3.5 h-3.5 text-slate-400" />
                              <span>No slide count set for this topic.</span>
                              <button
                                type="button"
                                onClick={() => openEditSyllabus(top)}
                                className="text-indigo-600 font-bold hover:underline"
                              >
                                Set slides
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 sm:self-center shrink-0">
                        {top.teacherStatus !== "done" && (
                          <button
                            onClick={() => handleMarkTopicStatus(top.id, "done")}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
                          >
                            Mark Done
                          </button>
                        )}
                        {top.teacherStatus !== "current" && top.teacherStatus !== "done" && (
                          <button
                            onClick={() => handleMarkTopicStatus(top.id, "current")}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-colors"
                          >
                            Set Current
                          </button>
                        )}
                        {top.teacherStatus === "done" && (
                          <button
                            onClick={() => handleMarkTopicStatus(top.id, "pending")}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                          >
                            Re-open
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSessionTopic(top.topic);
                            setShowAttendanceModal(true);
                          }}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                        >
                          <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" /> Conduct Class
                        </button>
                        <button
                          onClick={() => openEditSyllabus(top)}
                          className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                          title="Edit Topic"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setConfirmDialog({
                              isOpen: true,
                              title: "Are you sure?",
                              message: `Are you sure you want to delete topic "${top.topic}"? This action cannot be undone.`,
                              type: "danger",
                              confirmLabel: "Yes, Delete Topic",
                              onConfirm: async () => {
                                setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
                                await deleteSyllabusTopic(top.id);
                                setSuccessModal({
                                  isOpen: true,
                                  title: "Topic Deleted",
                                  message: `Topic "${top.topic}" has been removed from the course outline.`,
                                });
                              },
                            });
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Delete Topic"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CLASS SESSIONS LOG */}
      {activeTab === "sessions" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Conducted Class Sessions</h3>
              <p className="text-xs text-slate-500 mt-1">
                Complete log of lecture sessions and attendance summaries.
              </p>
            </div>
            <button
              onClick={() => setShowAttendanceModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
            >
              <ClipboardCheck className="w-4 h-4" /> Record New Session
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {classroomSessions.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-500 space-y-3">
                <CalendarDays className="w-10 h-10 mx-auto text-slate-300" />
                <p className="font-semibold text-slate-700">No class sessions conducted yet.</p>
                <button
                  onClick={() => setShowAttendanceModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-emerald-700 transition-colors"
                >
                  <ClipboardCheck className="w-4 h-4" /> Start First Class & Mark Attendance
                </button>
              </div>
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
        </div>
      )}

      {/* TAB 4: ENROLLED STUDENTS */}
      {activeTab === "students" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Enrolled Students ({students.length})
                </h3>
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-semibold">
                  Batch: {batch.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Enrolled roster for this course and batch.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student or roll no..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
              </div>
              <button
                onClick={() => setShowAttendanceModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-2 shadow-sm"
              >
                <ClipboardCheck className="w-4 h-4" /> Take Attendance
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    <th className="px-6 py-4">#</th>
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Roll No</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Attendance Rate</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400 text-xs">
                        No students found matching search.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((stud, idx) => {
                      const studentRecords = attendanceRecords.filter(
                        (r) => r.classroomId === cls.id && r.studentId === stud.id
                      );
                      const attended = studentRecords.filter((r) => r.status === "present" || r.status === "late").length;
                      const rate = studentRecords.length > 0 ? Math.round((attended / studentRecords.length) * 100) : 95;

                      return (
                        <tr key={stud.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 text-slate-400 font-semibold">{idx + 1}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-800">
                                {stud.name.slice(0, 2).toUpperCase()}
                              </div>
                              <span className="font-bold text-slate-900">{stud.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-700">{stud.rollNo}</td>
                          <td className="px-6 py-4 text-slate-500 font-medium">{stud.email}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3 w-36">
                              <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    rate >= 80 ? "bg-emerald-500" : rate >= 60 ? "bg-amber-500" : "bg-red-500"
                                  }`}
                                  style={{ width: `${rate}%` }}
                                />
                              </div>
                              <span className="font-bold text-slate-800 text-xs">{rate}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Active Enrolled
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ASSESSMENTS (ASSIGNMENTS & TESTS) */}
      {activeTab === "assessments" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Assignments & Class Tests</h3>
              <p className="text-xs text-slate-500 mt-1">
                Manage coursework deadlines, class quizzes, and evaluation records.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAssignmentModal(true)}
                className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Create Assignment
              </button>
              <button
                onClick={() => setShowTestModal(true)}
                className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Schedule Test
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assignments List */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-blue-600" /> Course Assignments ({assignments.length})
                </h4>
              </div>
              <div className="divide-y divide-slate-100">
                {assignments.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-400">No assignments created yet.</div>
                ) : (
                  assignments.map((asg) => (
                    <div key={asg.id} className="p-5 hover:bg-slate-50/60 transition-colors space-y-2.5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase bg-blue-50 text-blue-700 border border-blue-200/60">
                            {asg.status}
                          </span>
                          <h5 className="text-sm font-bold text-slate-900 mt-1.5">{asg.title}</h5>
                          {asg.description && (
                            <p className="text-xs text-slate-500 line-clamp-1">{asg.description}</p>
                          )}
                        </div>
                        <span className="text-xs font-extrabold text-slate-900 shrink-0">{asg.totalMarks} Marks</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" /> Due: {new Date(asg.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <button
                          onClick={() => openEvaluationModal("assignment", asg)}
                          className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          Evaluate <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Class Tests List */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" /> Class Tests & Quizzes ({tests.length})
                </h4>
              </div>
              <div className="divide-y divide-slate-100">
                {tests.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-400">No class tests scheduled yet.</div>
                ) : (
                  tests.map((t) => (
                    <div key={t.id} className="p-5 hover:bg-slate-50/60 transition-colors space-y-2.5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase bg-purple-50 text-purple-700 border border-purple-200/60">
                            {t.status}
                          </span>
                          <h5 className="text-sm font-bold text-slate-900 mt-1.5">{t.title}</h5>
                          {t.duration && (
                            <span className="text-xs text-slate-500 font-medium">Duration: {t.duration}</span>
                          )}
                        </div>
                        <span className="text-xs font-extrabold text-slate-900 shrink-0">{t.totalMarks} Marks</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" /> Test Date: {new Date(t.testDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <button
                          onClick={() => openEvaluationModal("test", t)}
                          className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          Manage Marks <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: MATERIALS */}
      {activeTab === "materials" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Lecture Slides & Learning Materials</h3>
              <p className="text-xs text-slate-500 mt-1">
                Share slides, lab worksheets, and reference readings with students.
              </p>
            </div>
            <button
              onClick={() => setShowMaterialModal(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Upload Material
            </button>
          </div>

          {(() => {
            const displayMaterials = storeMaterials.length > 0
              ? storeMaterials.map(m => ({
                  id: m.id,
                  title: m.title,
                  category: m.type || "Slides",
                  fileType: "PDF",
                  size: "2.5 MB",
                  date: m.created_at ? new Date(m.created_at).toLocaleDateString() : "Recent",
                  downloads: 24,
                }))
              : materials;

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-400 hover:shadow-md transition-all flex flex-col justify-between group space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 uppercase tracking-wider">
                          {mat.category}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">{mat.date}</span>
                      </div>
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-extrabold text-xs shrink-0">
                          {mat.fileType}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-slate-900 transition-colors line-clamp-2">
                            {mat.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-1 font-medium">{mat.size} • {mat.downloads} downloads</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Published to class
                      </span>
                      <button
                        onClick={() => {
                          const blob = new Blob([`Course Material: ${mat.title}\nCategory: ${mat.category}`], { type: "text/plain" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `${mat.title.replace(/\s+/g, '_')}.txt`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 7: ANNOUNCEMENTS */}
      {activeTab === "announcements" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Class Notices & Announcements</h3>
              <p className="text-xs text-slate-500 mt-1">
                Broadcast notices directly to students in {course.title} ({batch.name}).
              </p>
            </div>
            <button
              onClick={() => setShowAnnouncementModal(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Megaphone className="w-4 h-4" /> Post Announcement
            </button>
          </div>

          <div className="space-y-4">
            {classAnnouncements.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-xs text-slate-400">
                No announcements published for this class yet.
              </div>
            ) : (
              classAnnouncements.map((anc) => (
                <div
                  key={anc.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        {anc.priority === "High" && (
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-red-100 text-red-700 uppercase">
                            Urgent Notice
                          </span>
                        )}
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                          Audience: {anc.audienceType}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{anc.title}</h4>
                    </div>
                    <span className="text-xs text-slate-400 font-medium shrink-0">
                      {new Date(anc.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                    {anc.content}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Published by <strong>{anc.authorName}</strong> ({anc.authorRole})</span>
                    <span className="text-emerald-600 font-semibold">Enrolled Class Visibility</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── TAB 8: GRADES & CONTINUOUS EVALUATION ── */}
      {activeTab === "grades" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                    Continuous Evaluation Ledger
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">Student Final Grades & Score Summary</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Consolidated mark sheet calculating CT marks, Assignment marks, Midterm, and Final grades for {students.length} enrolled students in {course.code}.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={openGradebookModal}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>Full Gradebook Editor</span>
                </button>
              </div>
            </div>

            {/* Students Grades Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    <th className="px-4 py-3">Roll No</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">CT Mark (20)</th>
                    <th className="px-4 py-3">Assignment (20)</th>
                    <th className="px-4 py-3">Midterm (30)</th>
                    <th className="px-4 py-3">Final (50)</th>
                    <th className="px-4 py-3">Total (100)</th>
                    <th className="px-4 py-3 text-right">Grade Point</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {students.map((student, idx) => {
                    const ctScore = Math.min(20, Math.round(15 + (idx % 5)));
                    const assnScore = Math.min(20, Math.round(16 + ((idx * 2) % 4)));
                    const midtermScore = Math.min(30, Math.round(22 + ((idx * 3) % 7)));
                    const finalScore = Math.min(50, Math.round(38 + ((idx * 4) % 11)));
                    const totalScore = ctScore + assnScore + midtermScore + finalScore;
                    const letter = totalScore >= 90 ? "A+" : totalScore >= 80 ? "A" : totalScore >= 70 ? "B" : "C";
                    const gpa = totalScore >= 90 ? "4.00" : totalScore >= 80 ? "3.75" : totalScore >= 70 ? "3.25" : "2.75";

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-500 font-medium">{student.rollNo}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{student.name}</td>
                        <td className="px-4 py-3 font-semibold text-slate-700">{ctScore}</td>
                        <td className="px-4 py-3 font-semibold text-slate-700">{assnScore}</td>
                        <td className="px-4 py-3 font-semibold text-slate-700">{midtermScore}</td>
                        <td className="px-4 py-3 font-semibold text-slate-700">{finalScore}</td>
                        <td className="px-4 py-3 font-bold text-brand-dark">{totalScore} / 100</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold ${
                            letter === "A+" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                          }`}>
                            {letter} ({gpa})
                          </span>
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
                <FolderOpen className="w-5 h-5 text-amber-600" /> Upload Course Material
              </h3>
              <button onClick={() => setShowMaterialModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddMaterial} className="p-6 space-y-4 text-xs">
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
              <div className="grid grid-cols-2 gap-3">
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
                    placeholder="PDF, ZIP, DOCX..."
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowMaterialModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
                >
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Syllabus Topic Modal (Add / Edit) */}
      {showSyllabusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
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
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
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
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
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

              <div className="grid grid-cols-2 gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200/60">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <Presentation className="w-3.5 h-3.5 text-indigo-600" /> Total Slides
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={syllabusForm.totalSlides}
                    onChange={(e) => setSyllabusForm({ ...syllabusForm, totalSlides: Math.max(0, parseInt(e.target.value) || 0) })}
                    placeholder="e.g. 45"
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white"
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
                    placeholder="e.g. 18"
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white"
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

    </div>
  );
}

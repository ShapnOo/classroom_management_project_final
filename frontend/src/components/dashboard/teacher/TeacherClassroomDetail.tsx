"use client";

import {
  Users, Clock, Play, FolderOpen, ClipboardCheck,
  Search, CalendarDays, BookOpen, LayoutGrid,
  Info, MapPin, ArrowLeft, CheckCircle2, Circle, TrendingUp,
  Plus, Edit2, Trash2, FileText, ListTodo, Bell, Download, ChevronRight,
  Sparkles, Award, AlertCircle, X, ExternalLink, Filter,
  Check, Calendar, Megaphone, Share2, Layers, CheckSquare,
  UserCheck, UserX, Clock3, RotateCcw, Sliders, Presentation
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
    "overview" | "syllabus" | "sessions" | "students" | "materials" | "assessments" | "announcements"
  >("overview");

  // Filter & Search states
  const [studentSearch, setStudentSearch] = useState("");
  const [syllabusFilter, setSyllabusFilter] = useState<"all" | "done" | "current" | "pending">("all");

  // Modals state
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);
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

  // Current or up next topic from Admin's syllabus
  const currentTopic = courseSyllabus.find((t) => t.teacherStatus === "current") || courseSyllabus.find((t) => t.teacherStatus === "pending") || courseSyllabus[0];
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
            <Link
              href={`/dashboard/teacher/classrooms/${cls.id}/archive`}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4 text-slate-500" /> Historical Archive
            </Link>
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
              <Link
                href="/dashboard/teacher/evaluation"
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-600" /> Evaluation Policy
              </Link>
            </div>
          </div>

          {/* Key Metrics Strip (4 Sleek Cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4 border-t border-slate-100">
            <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/60 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
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
            </div>

            <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/60 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Enrolled Students
              </span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-base font-extrabold text-slate-900">{students.length}</span>
                <span className="text-[11px] text-slate-500 font-medium">{batch.code}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Official Batch Roster</p>
            </div>

            <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/60 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Avg Attendance Rate
              </span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-base font-extrabold text-emerald-600">{avgAttendanceRate}%</span>
                <span className="text-[11px] text-emerald-700 font-semibold">{classroomSessions.length} Sessions</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Student Attendance Logged</p>
            </div>

            <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/60 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
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
              <p className="text-[10px] text-slate-400 mt-1">Course Curriculum Covered</p>
            </div>
          </div>

        </div>

        {/* ── Navigation Tabs ── */}
        <div className="flex items-center gap-1 px-5 border-t border-slate-200 bg-slate-50/60 overflow-x-auto no-scrollbar">
          {[
            { id: "overview", label: "Overview & Live Class", icon: Sparkles },
            { id: "syllabus", label: "Course Outline", icon: BookOpen, count: courseSyllabus.length },
            { id: "sessions", label: "Class Sessions", icon: CalendarDays, count: classroomSessions.length },
            { id: "students", label: "Enrolled Students", icon: Users, count: students.length },
            { id: "assessments", label: "Assignments & Tests", icon: ListTodo, count: assignments.length + tests.length },
            { id: "materials", label: "Materials", icon: FolderOpen, count: materials.length },
            { id: "announcements", label: "Class Notices", icon: Bell, count: classAnnouncements.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-slate-900 text-slate-900 bg-white rounded-t-lg shadow-xs"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-slate-900" : "text-slate-400"}`} />
                {tab.label}
                {typeof tab.count === "number" && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] ${
                      isActive ? "bg-slate-900 text-white font-bold" : "bg-slate-200 text-slate-600 font-medium"
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

      {/* ── TAB CONTENT ── */}

      {/* TAB 1: OVERVIEW & CONTINUITY */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Live Class Take Attendance Action Card */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5 border border-slate-800">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  Live Class Session
                </span>
                <h3 className="text-base font-extrabold text-white mt-1.5">Conducting today's lecture?</h3>
                <p className="text-xs text-slate-300 max-w-md">
                  Take attendance in seconds and log the topic into official academic records.
                </p>
              </div>
              <button
                onClick={() => setShowAttendanceModal(true)}
                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 shrink-0 hover:scale-105 active:scale-95"
              >
                <ClipboardCheck className="w-4 h-4 text-slate-950" /> Take Attendance Now
              </button>
            </div>

            {/* Up Next / Current Syllabus Topic Card */}
            {currentTopic ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Current Topic • Week {currentTopic.week}
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab("syllabus")}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    View All Topics <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{currentTopic.topic}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Course Syllabus Week {currentTopic.week}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {currentTopic.teacherStatus !== "done" ? (
                        <button
                          onClick={() => handleMarkTopicStatus(currentTopic.id, "done")}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" /> Mark Topic Done
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </span>
                      )}
                    </div>
                  </div>

                  {currentTopic.subTopics && currentTopic.subTopics.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-slate-100">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Sub-topics & Key Concepts:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {currentTopic.subTopics.map((sub, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium"
                          >
                            <Circle className="w-3 h-3 text-blue-500 shrink-0" />
                            <span>{sub}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setSessionTopic(currentTopic.topic);
                        setShowAttendanceModal(true);
                      }}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100/80 px-4 py-2 rounded-xl transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Conduct session for this topic
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Recent Conducted Sessions */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-slate-500" /> Recent Class Sessions ({classroomSessions.length})
                </h3>
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
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" /> Class Routine & Schedule
              </h3>
              {schedules.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">No weekly routine assigned by admin.</p>
              ) : (
                <div className="space-y-2">
                  {schedules.map((sch) => (
                    <div
                      key={sch.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
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
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Bell className="w-4 h-4 text-slate-500" /> Class Notice Board
                </h3>
                <button
                  onClick={() => setShowAnnouncementModal(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
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
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5"
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
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" /> Institutional Info
              </h3>
              <div className="text-xs text-slate-600 space-y-2 bg-white p-3.5 rounded-xl border border-slate-200/60">
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
                        <Link
                          href={`/dashboard/teacher/assignments`}
                          className="font-bold text-slate-900 hover:underline flex items-center gap-1"
                        >
                          Evaluate <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
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
                        <Link
                          href={`/dashboard/teacher/tests`}
                          className="font-bold text-slate-900 hover:underline flex items-center gap-1"
                        >
                          Manage Marks <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
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

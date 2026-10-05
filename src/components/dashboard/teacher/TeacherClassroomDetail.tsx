"use client";

import {
  Users, Clock, Play, FolderOpen, ClipboardCheck,
  Search, CalendarDays, BookOpen, LayoutGrid,
  Info, MapPin, ArrowLeft, CheckCircle2, Circle, TrendingUp,
  Plus, FileText, ListTodo, Bell, Download, ChevronRight,
  Sparkles, Award, AlertCircle, X, ExternalLink, Filter,
  Check, Calendar, Megaphone, Share2, Layers, CheckSquare,
  UserCheck, UserX, Clock3, RotateCcw
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import type { SyllabusTopic, Assignment, Test, Announcement, AttendanceRecord } from "@/lib/types";

interface TeacherClassroomDetailProps {
  classroomId: string;
}

type AttendanceStatus = AttendanceRecord["status"];

export default function TeacherClassroomDetail({ classroomId }: TeacherClassroomDetailProps) {
  const {
    getClassroomView,
    classSessions,
    attendanceRecords,
    announcements,
    syllabusTopics,
    updateSyllabusTopic,
    addClassSession,
    upsertAttendance,
    addAssignment,
    addTest,
    addAnnouncement,
    updateClassroom,
  } = useStore();

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
  const [attendanceSuccessMessage, setAttendanceSuccessMessage] = useState(false);

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

  if (!view) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Classroom Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">
            The requested classroom does not exist or is not assigned to your profile.
          </p>
        </div>
        <Link
          href="/dashboard/teacher/classrooms"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-dark text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
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
    setAttendanceSuccessMessage(true);
    setTimeout(() => setAttendanceSuccessMessage(false), 4000);
  };

  // Syllabus Status toggle
  const handleMarkTopicStatus = (topicId: string, status: "pending" | "current" | "done") => {
    updateSyllabusTopic(topicId, { teacherStatus: status });
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignment.title) return;
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
  };

  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTest.title) return;
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
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) return;
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
  };

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.title) return;
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
    <div className="w-full mx-auto space-y-5 pb-16 animate-in fade-in duration-300">
      
      {/* ── Success Toast ── */}
      {attendanceSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between text-xs shadow-md animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">Attendance recorded successfully!</span>
            <span>Session logged with {presentCount} present students. Admin reports updated.</span>
          </div>
          <button onClick={() => setAttendanceSuccessMessage(false)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Top Breadcrumbs & Quick Back ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link
            href="/dashboard/teacher/classrooms"
            className="hover:text-brand-dark transition-colors flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> My Classrooms
          </Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">{batch.name}</span>
          <span>/</span>
          <span className="font-bold text-slate-900">{course.code}</span>
        </div>

        {/* Primary Header Action */}
        <div className="flex items-center gap-2">
          {cls.status === "completed" ? (
            <Link
              href={`/dashboard/teacher/classrooms/${cls.id}/archive`}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <FolderOpen className="w-3.5 h-3.5" /> View Historical Archive
            </Link>
          ) : (
            <button
              onClick={() => setShowAttendanceModal(true)}
              className="px-4 py-2 bg-brand-dark hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <ClipboardCheck className="w-4 h-4 text-emerald-400" /> Take Attendance
            </button>
          )}
        </div>
      </div>

      {/* ── Classroom Header Banner (Admin-Linked) ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
        <div className={`h-2.5 w-full ${colors.color}`} />
        <div className="p-5 md:p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${colors.light} ${colors.text}`}>
                  {course.code}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">
                  {batch.name}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                  {session.name}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                  cls.status === "ongoing"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : cls.status === "upcoming"
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}>
                  ● {cls.status}
                </span>
                <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded flex items-center gap-1">
                  <Info className="w-3 h-3" /> Configured by Admin
                </span>
              </div>
              <h1 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
                {course.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {cls.room || "Room TBA"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {schedules.length > 0
                    ? `${[...new Set(schedules.map((s) => s.day.slice(0, 3)))].join(", ")} • ${schedules[0].startTime} - ${schedules[0].endTime}`
                    : "Schedule not assigned by admin"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(cls.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – {new Date(cls.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            </div>

            {/* Quick Actions Dropdown/Buttons */}
            <div className="flex items-center flex-wrap gap-2 shrink-0">
              <button
                onClick={() => setShowAttendanceModal(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <ClipboardCheck className="w-3.5 h-3.5" /> Quick Attendance
              </button>
              <button
                onClick={() => setShowAnnouncementModal(true)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Megaphone className="w-3.5 h-3.5 text-slate-500" /> Announcement
              </button>
              <button
                onClick={() => setShowAssignmentModal(true)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 text-slate-500" /> Assignment
              </button>
              <button
                onClick={() => setShowTestModal(true)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 text-slate-500" /> Class Test
              </button>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
            <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-100">
              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                Class Progress
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-bold text-slate-900">
                  {cls.classesCompleted} / {cls.totalClasses}
                </span>
                <span className={`text-xs font-semibold ${colors.text}`}>{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mt-1.5">
                <div className={`h-full ${colors.color} rounded-full`} style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-100">
              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                Enrolled Students
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-bold text-slate-900">{students.length}</span>
                <span className="text-[10px] text-slate-500 font-medium">From {batch.code}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 truncate">Assigned by Admin</p>
            </div>

            <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-100">
              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                Avg Attendance
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-bold text-emerald-700">{avgAttendanceRate}%</span>
                <span className="text-[10px] text-emerald-600 font-medium">Rate</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 truncate">{classroomSessions.length} sessions logged</p>
            </div>

            <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-100">
              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                Syllabus Topics
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-bold text-slate-900">
                  {completedTopicsCount} / {courseSyllabus.length}
                </span>
                <span className="text-xs font-semibold text-brand-dark">
                  {courseSyllabus.length > 0 ? Math.round((completedTopicsCount / courseSyllabus.length) * 100) : 0}%
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 truncate">Outline by Admin</p>
            </div>
          </div>
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="flex items-center gap-1 px-4 border-t border-slate-200 bg-slate-50/50 overflow-x-auto no-scrollbar">
          {[
            { id: "overview", label: "Overview & Continuity", icon: Sparkles },
            { id: "syllabus", label: "Course Outline (Syllabus)", icon: BookOpen, count: courseSyllabus.length },
            { id: "sessions", label: "Class Sessions Log", icon: CalendarDays, count: classroomSessions.length },
            { id: "students", label: "Enrolled Students & Register", icon: Users, count: students.length },
            { id: "materials", label: "Course Materials", icon: FolderOpen, count: materials.length },
            { id: "assessments", label: "Assignments & Tests", icon: ListTodo, count: assignments.length + tests.length },
            { id: "announcements", label: "Notices", icon: Bell, count: classAnnouncements.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3.5 text-xs font-medium border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-brand-dark text-brand-dark font-bold bg-white rounded-t-md shadow-xs"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-brand-dark" : "text-slate-400"}`} />
                {tab.label}
                {typeof tab.count === "number" && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? "bg-brand-dark/10 text-brand-dark font-bold" : "bg-slate-200 text-slate-600"
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left 2 Columns */}
          <div className="lg:col-span-2 space-y-5">
            {/* Quick 1-Click Action Card */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded uppercase">
                  Classroom Live Session
                </span>
                <h3 className="text-sm font-bold text-white mt-1">Ready for today's lecture?</h3>
                <p className="text-xs text-slate-300">
                  Take attendance in 10 seconds and log the covered topic into the institutional record.
                </p>
              </div>
              <button
                onClick={() => setShowAttendanceModal(true)}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs shadow-lg transition-all flex items-center gap-2 shrink-0 hover:scale-105 active:scale-95"
              >
                <ClipboardCheck className="w-4 h-4 text-slate-950" /> Take Attendance Now
              </button>
            </div>

            {/* Up Next / Current Syllabus Topic (Admin defined) */}
            {currentTopic ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                    </span>
                    <h3 className="text-xs font-semibold text-blue-950 uppercase tracking-wide">
                      Next Topic in Course Outline • Week {currentTopic.week}
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab("syllabus")}
                    className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                  >
                    View All Syllabus <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{currentTopic.topic}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Configured by administration for Week {currentTopic.week}
                      </p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      {currentTopic.teacherStatus !== "done" ? (
                        <button
                          onClick={() => handleMarkTopicStatus(currentTopic.id, "done")}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" /> Mark Topic as Completed
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </span>
                      )}
                    </div>
                  </div>

                  {currentTopic.subTopics && currentTopic.subTopics.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                        Key Concepts to Cover:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {currentTopic.subTopics.map((sub, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700"
                          >
                            <Circle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="font-medium">{sub}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => {
                        setSessionTopic(currentTopic.topic);
                        setShowAttendanceModal(true);
                      }}
                      className="text-xs font-bold text-brand-dark hover:underline flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Conduct class on this topic & mark attendance
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Recent Conducted Sessions */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-slate-500" />
                  <h3 className="text-xs font-semibold text-slate-900">Recent Class Sessions ({classroomSessions.length})</h3>
                </div>
                <button
                  onClick={() => setActiveTab("sessions")}
                  className="text-[11px] font-semibold text-brand-dark hover:underline flex items-center gap-1"
                >
                  View Full History <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {classroomSessions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 space-y-2">
                  <p>No class sessions conducted yet for this semester.</p>
                  <button
                    onClick={() => setShowAttendanceModal(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-dark text-white rounded-lg text-xs font-medium shadow-sm"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" /> Take First Attendance
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {classroomSessions.slice(0, 4).map((sess, idx) => {
                    const sessAttendance = attendanceRecords.filter((r) => r.sessionId === sess.id);
                    const present = sessAttendance.filter((r) => r.status === "present").length;
                    const absent = sessAttendance.filter((r) => r.status === "absent").length;
                    const late = sessAttendance.filter((r) => r.status === "late").length;
                    return (
                      <div key={sess.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center shrink-0">
                              <span className="text-[10px] font-bold text-slate-700">#{classroomSessions.length - idx}</span>
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-slate-900">{sess.topicCovered}</h4>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  {new Date(sess.date).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" /> {sess.duration || "1h 30m"}
                                </span>
                              </div>
                              {sess.notes && (
                                <p className="text-[11px] text-slate-600 mt-1 italic line-clamp-1 bg-slate-50 px-2 py-0.5 rounded">
                                  "{sess.notes}"
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              {present > 0 ? `${present} Present` : "Attended"}
                            </span>
                            {absent > 0 && (
                              <span className="text-[9px] text-red-600 font-medium">
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
          <div className="space-y-5">
            {/* Admin Linkage Info Box */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-2.5">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-600" /> Institutional Class Setup
              </h3>
              <div className="text-[11px] text-slate-600 space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Batch:</span>
                  <span className="font-semibold text-slate-800">{batch.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Program:</span>
                  <span className="font-semibold text-slate-800">{program.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Session Term:</span>
                  <span className="font-semibold text-slate-800">{session.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Room Location:</span>
                  <span className="font-semibold text-slate-800">{cls.room}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Hub */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-brand-dark" /> Quick Actions
              </h3>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => setShowAttendanceModal(true)}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 flex items-center justify-between text-xs font-semibold text-slate-800 transition-all group text-left"
                >
                  <span className="flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                    Take Class Attendance
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700" />
                </button>

                <button
                  onClick={() => setShowAssignmentModal(true)}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-brand-dark/40 hover:bg-slate-50 flex items-center justify-between text-xs font-medium text-slate-800 transition-all group text-left"
                >
                  <span className="flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-blue-600" />
                    Create Assignment
                  </span>
                  <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                </button>

                <button
                  onClick={() => setShowTestModal(true)}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-brand-dark/40 hover:bg-slate-50 flex items-center justify-between text-xs font-medium text-slate-800 transition-all group text-left"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    Schedule Class Test
                  </span>
                  <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                </button>

                <button
                  onClick={() => setShowMaterialModal(true)}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-brand-dark/40 hover:bg-slate-50 flex items-center justify-between text-xs font-medium text-slate-800 transition-all group text-left"
                >
                  <span className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-amber-600" />
                    Upload Slide / Material
                  </span>
                  <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                </button>
              </div>
            </div>

            {/* Latest Announcements */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-slate-500" /> Class Notice Board
                </h3>
                <button
                  onClick={() => setShowAnnouncementModal(true)}
                  className="text-[10px] font-semibold text-brand-dark hover:underline"
                >
                  + Post
                </button>
              </div>
              <div className="p-3 space-y-2.5">
                {classAnnouncements.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No active notices for this class.</p>
                ) : (
                  classAnnouncements.slice(0, 3).map((anc) => (
                    <div
                      key={anc.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-900 line-clamp-1">
                          {anc.title}
                        </span>
                        {anc.priority === "High" && (
                          <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2">{anc.content}</p>
                      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1">
                        <span>By {anc.authorName}</span>
                        <span>{new Date(anc.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Room & Class Schedule Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-2">
              <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" /> Routine & Schedule
              </h3>
              {schedules.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">No weekly routine assigned by admin.</p>
              ) : (
                <div className="space-y-1.5 pt-1">
                  {schedules.map((sch) => (
                    <div
                      key={sch.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                    >
                      <span className="font-semibold text-slate-800">{sch.day}</span>
                      <span className="text-slate-600 font-medium">
                        {sch.startTime} - {sch.endTime}
                      </span>
                      <span className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-medium">
                        {sch.room || cls.room}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SYLLABUS OUTLINE (ADMIN-LINKED) */}
      {activeTab === "syllabus" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900">Course Outline & Syllabus</h3>
                <span className="text-[9px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded border border-blue-100">
                  Published by Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Click status buttons to update your real-time teaching progress.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 text-xs">
                {(["all", "current", "done", "pending"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSyllabusFilter(mode)}
                    className={`px-2.5 py-1 rounded capitalize transition-all ${
                      syllabusFilter === mode
                        ? "bg-white text-brand-dark font-bold shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {filteredSyllabus.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No syllabus topics match this filter.
              </div>
            ) : (
              filteredSyllabus.map((top) => {
                const isDone = top.teacherStatus === "done";
                const isCurrent = top.teacherStatus === "current";
                return (
                  <div
                    key={top.id}
                    className={`p-4 transition-colors ${
                      isDone ? "bg-emerald-50/20" : isCurrent ? "bg-blue-50/30" : "hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
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
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              Week {top.week}
                            </span>
                            <span
                              className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${
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
                            className={`text-xs font-semibold ${
                              isDone ? "text-slate-600 line-through" : "text-slate-900"
                            }`}
                          >
                            {top.topic}
                          </h4>
                          {top.subTopics && top.subTopics.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {top.subTopics.map((sub, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                                >
                                  {sub}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status Toggle buttons */}
                      <div className="flex items-center gap-1.5 sm:self-center shrink-0">
                        {top.teacherStatus !== "done" && (
                          <button
                            onClick={() => handleMarkTopicStatus(top.id, "done")}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-[11px] font-medium transition-colors"
                          >
                            Mark Done
                          </button>
                        )}
                        {top.teacherStatus !== "current" && top.teacherStatus !== "done" && (
                          <button
                            onClick={() => handleMarkTopicStatus(top.id, "current")}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md text-[11px] font-medium transition-colors"
                          >
                            Set Current
                          </button>
                        )}
                        {top.teacherStatus === "done" && (
                          <button
                            onClick={() => handleMarkTopicStatus(top.id, "pending")}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-[11px] font-medium transition-colors"
                          >
                            Reopen
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSessionTopic(top.topic);
                            setShowAttendanceModal(true);
                          }}
                          className="px-2.5 py-1 bg-brand-dark hover:bg-slate-800 text-white rounded-md text-[11px] font-medium flex items-center gap-1 shadow-xs"
                          title="Take attendance for this topic"
                        >
                          <ClipboardCheck className="w-3 h-3" /> Class
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
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-xs font-semibold text-slate-900">Conducted Class Sessions</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Complete timeline of lectures, attendance tallies, and lesson notes.
              </p>
            </div>
            <button
              onClick={() => setShowAttendanceModal(true)}
              className="px-3.5 py-2 bg-brand-dark hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" /> Conduct New Session
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {classroomSessions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 space-y-3">
                <CalendarDays className="w-8 h-8 mx-auto text-slate-300" />
                <p>No class sessions have been conducted yet.</p>
                <button
                  onClick={() => setShowAttendanceModal(true)}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-brand-dark text-white text-xs font-medium rounded-lg"
                >
                  <ClipboardCheck className="w-3.5 h-3.5" /> Start First Class & Mark Attendance
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                      <th className="px-5 py-3">Session #</th>
                      <th className="px-5 py-3">Date & Time</th>
                      <th className="px-5 py-3">Topic Covered</th>
                      <th className="px-5 py-3">Attendance</th>
                      <th className="px-5 py-3">Notes</th>
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
                          <td className="px-5 py-3.5 font-bold text-slate-900">
                            #{classroomSessions.length - index}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="font-semibold text-slate-800">
                              {new Date(sess.date).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                            <span className="text-[10px] text-slate-500">{sess.duration || "1h 30m"}</span>
                          </td>
                          <td className="px-5 py-3.5 font-medium text-slate-900">
                            {sess.topicCovered}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded text-[11px] border border-emerald-100">
                                {present} Present
                              </span>
                              {absent > 0 && (
                                <span className="px-2 py-0.5 bg-red-50 text-red-700 font-semibold rounded text-[11px] border border-red-100">
                                  {absent} Absent
                                </span>
                              )}
                              {late > 0 && (
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-semibold rounded text-[11px] border border-amber-100">
                                  {late} Late
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 max-w-xs">
                            {sess.notes ? (
                              <span className="truncate block italic">"{sess.notes}"</span>
                            ) : (
                              <span className="text-slate-400">—</span>
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

      {/* TAB 4: STUDENTS & ATTENDANCE REGISTER */}
      {activeTab === "students" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900">
                  Enrolled Students ({students.length})
                </h3>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                  Batch: {batch.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Students automatically synced from Admin's batch assignment.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, roll no..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-dark/20 focus:border-brand-dark"
                />
              </div>
              <button
                onClick={() => setShowAttendanceModal(true)}
                className="px-3.5 py-1.5 bg-brand-dark text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
              >
                <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" /> Take Attendance
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                    <th className="px-5 py-3">#</th>
                    <th className="px-5 py-3">Student Name</th>
                    <th className="px-5 py-3">Roll No</th>
                    <th className="px-5 py-3">Email Address</th>
                    <th className="px-5 py-3">Attendance Rate</th>
                    <th className="px-5 py-3 text-right">Roster Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                        No students found matching your search.
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
                          <td className="px-5 py-3 text-slate-400 font-medium">{idx + 1}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700">
                                {stud.name.slice(0, 2).toUpperCase()}
                              </div>
                              <span className="font-semibold text-slate-900">{stud.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 font-medium text-slate-700">{stud.rollNo}</td>
                          <td className="px-5 py-3 text-slate-500">{stud.email}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2 w-32">
                              <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    rate >= 80 ? "bg-emerald-500" : rate >= 60 ? "bg-amber-500" : "bg-red-500"
                                  }`}
                                  style={{ width: `${rate}%` }}
                                />
                              </div>
                              <span className="font-semibold text-slate-700 text-[11px]">{rate}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
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

      {/* TAB 5: COURSE MATERIALS */}
      {activeTab === "materials" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-xs font-semibold text-slate-900">Lecture Notes & Course Materials</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Share slides, lab sheets, and readings with students in {batch.name}.
              </p>
            </div>
            <button
              onClick={() => setShowMaterialModal(true)}
              className="px-3.5 py-2 bg-brand-dark hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Upload Material
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.map((mat) => (
              <div
                key={mat.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-brand-dark/40 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-dark/5 text-brand-dark uppercase tracking-wider">
                      {mat.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{mat.date}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                      {mat.fileType}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 group-hover:text-brand-dark transition-colors line-clamp-2">
                        {mat.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{mat.size} • {mat.downloads} student downloads</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Available to class
                  </span>
                  <button
                    onClick={() => alert(`Downloading "${mat.title}"...`)}
                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-brand-dark transition-colors"
                    title="Download file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: ASSIGNMENTS & TESTS */}
      {activeTab === "assessments" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-xs font-semibold text-slate-900">Assignments & Class Tests</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Manage coursework submissions, evaluation deadlines, and quiz marks.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAssignmentModal(true)}
                className="px-3 py-1.5 bg-brand-dark text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Create Assignment
              </button>
              <button
                onClick={() => setShowTestModal(true)}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Schedule Test
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Assignments List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <ListTodo className="w-4 h-4 text-blue-600" /> Course Assignments ({assignments.length})
                </h4>
              </div>
              <div className="divide-y divide-slate-100">
                {assignments.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">No assignments created yet.</div>
                ) : (
                  assignments.map((asg) => (
                    <div key={asg.id} className="p-4 hover:bg-slate-50 transition-colors space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase bg-blue-50 text-blue-700">
                            {asg.status}
                          </span>
                          <h5 className="text-xs font-semibold text-slate-900 mt-1">{asg.title}</h5>
                          {asg.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-1">{asg.description}</p>
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-700">{asg.totalMarks} Marks</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" /> Due: {new Date(asg.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <Link
                          href={`/dashboard/teacher/assignments`}
                          className="font-medium text-brand-dark hover:underline"
                        >
                          Evaluate ({asg.submissions || 0} submissions)
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Class Tests List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-600" /> Class Tests & Quizzes ({tests.length})
                </h4>
              </div>
              <div className="divide-y divide-slate-100">
                {tests.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">No class tests scheduled yet.</div>
                ) : (
                  tests.map((t) => (
                    <div key={t.id} className="p-4 hover:bg-slate-50 transition-colors space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase bg-purple-50 text-purple-700">
                            {t.status}
                          </span>
                          <h5 className="text-xs font-semibold text-slate-900 mt-1">{t.title}</h5>
                          {t.duration && (
                            <span className="text-[10px] text-slate-500">Duration: {t.duration}</span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-700">{t.totalMarks} Marks</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" /> Test Date: {new Date(t.testDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <Link
                          href={`/dashboard/teacher/tests`}
                          className="font-medium text-brand-dark hover:underline"
                        >
                          Manage Marks
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

      {/* TAB 7: ANNOUNCEMENTS */}
      {activeTab === "announcements" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-xs font-semibold text-slate-900">Class Notices & Announcements</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Broadcast updates directly to all students in {course.title} ({batch.name}).
              </p>
            </div>
            <button
              onClick={() => setShowAnnouncementModal(true)}
              className="px-3.5 py-2 bg-brand-dark hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Megaphone className="w-3.5 h-3.5" /> Post New Announcement
            </button>
          </div>

          <div className="space-y-3">
            {classAnnouncements.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-400">
                No announcements published for this class yet.
              </div>
            ) : (
              classAnnouncements.map((anc) => (
                <div
                  key={anc.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {anc.priority === "High" && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 uppercase">
                            Urgent Notice
                          </span>
                        )}
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          Audience: {anc.audienceType}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900">{anc.title}</h4>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium shrink-0">
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

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Published by {anc.authorName} ({anc.authorRole})</span>
                    <span className="text-emerald-600 font-medium">Visible to Enrolled Students</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: 1-CLICK QUICK ATTENDANCE & CONDUCT CLASS ── */}
      {showAttendanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Take Class Attendance & Record Session</h3>
                  <p className="text-[11px] text-slate-500">{course.code} • {batch.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAttendanceModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveAttendance} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* Session Meta Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700 flex items-center justify-between">
                    <span>Topic Covered (from Admin Course Outline) *</span>
                  </label>
                  <select
                    required
                    value={sessionTopic}
                    onChange={(e) => setSessionTopic(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-dark"
                  >
                    <option value="">Select topic taught today...</option>
                    {courseSyllabus.map((t) => (
                      <option key={t.id} value={t.topic}>
                        Week {t.week}: {t.topic} {t.teacherStatus === "done" ? "(Completed)" : ""}
                      </option>
                    ))}
                    <option value="Review & Problem Solving">Review & Problem Solving Session</option>
                    <option value="Lab Practical / Code Demo">Lab Practical / Code Demo</option>
                    <option value="Mid-Term Review & Q/A">Mid-Term Review & Q/A</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Lecture Duration</label>
                  <select
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs"
                  >
                    <option>45m</option>
                    <option>1h</option>
                    <option>1h 15m</option>
                    <option>1h 30m</option>
                    <option>2h</option>
                  </select>
                </div>
              </div>

              {/* Attendance Bulk Toggles */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-800">Student Register ({students.length})</span>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-full border border-emerald-200">
                      {presentCount} Present
                    </span>
                    <span className="px-2 py-0.5 bg-red-50 text-red-700 font-bold rounded-full border border-red-200">
                      {absentCount} Absent
                    </span>
                    {lateCount > 0 && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-bold rounded-full border border-amber-200">
                        {lateCount} Late
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick 1-Click Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAllAttendance("present")}
                    className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold rounded-md transition-colors"
                  >
                    All Present
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllAttendance("absent")}
                    className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-[11px] font-bold rounded-md transition-colors"
                  >
                    All Absent
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllAttendance("present")}
                    className="p-1 text-slate-400 hover:text-slate-600"
                    title="Reset to Present"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Student Attendance List */}
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {students.map((stud, idx) => {
                  const status = attendanceMap[stud.id] ?? "present";
                  return (
                    <div
                      key={stud.id}
                      className={`px-4 py-2.5 flex items-center justify-between gap-3 transition-colors ${
                        status === "absent"
                          ? "bg-red-50/40"
                          : status === "late"
                          ? "bg-amber-50/40"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-400 font-mono w-5 text-right">{idx + 1}</span>
                        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700">
                          {stud.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{stud.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">Roll: {stud.rollNo}</p>
                        </div>
                      </div>

                      {/* Clickable Status Button */}
                      <button
                        type="button"
                        onClick={() => toggleStudentAttendance(stud.id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 shadow-xs ${
                          status === "present"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200"
                            : status === "absent"
                            ? "bg-red-100 text-red-800 border-red-300 hover:bg-red-200"
                            : "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
                        }`}
                      >
                        {status === "present" ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : status === "absent" ? (
                          <X className="w-3.5 h-3.5" />
                        ) : (
                          <Clock3 className="w-3.5 h-3.5" />
                        )}
                        <span className="capitalize">{status}</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Private Notes (Optional) */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Teacher's Private Notes / Student Participation</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Students completed lab task 3; reviewed normalization exercises; need revision next class..."
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs resize-none focus:outline-none focus:ring-1 focus:ring-brand-dark"
                />
              </div>

              {/* Submit / Cancel Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Will update classroom progress to <strong>{(cls.classesCompleted || 0) + 1}</strong> classes.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAttendanceModal(false)}
                    className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!sessionTopic}
                    className="px-5 py-2 bg-brand-dark hover:bg-slate-800 text-white rounded-lg font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Save & Record Attendance
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CREATE ASSIGNMENT ── */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Create New Assignment</h3>
              <button
                onClick={() => setShowAssignmentModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateAssignment} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Assignment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Assignment 2: Relational Algebra & Queries"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-dark/20 focus:border-brand-dark"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-dark/20 focus:border-brand-dark"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Total Marks</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={newAssignment.totalMarks}
                    onChange={(e) => setNewAssignment({ ...newAssignment, totalMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-dark/20 focus:border-brand-dark"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Instructions / Description</label>
                <textarea
                  rows={3}
                  placeholder="Provide instructions, submission guidelines, or problem statement..."
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-dark/20 focus:border-brand-dark resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssignmentModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-dark hover:bg-slate-800 text-white rounded-lg font-semibold shadow-sm"
                >
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CREATE TEST ── */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Schedule Class Test / Quiz</h3>
              <button
                onClick={() => setShowTestModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTest} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Test Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class Test 1: ER Diagrams & SQL"
                  value={newTest.title}
                  onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-dark/20 focus:border-brand-dark"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Test Date *</label>
                  <input
                    type="date"
                    required
                    value={newTest.testDate}
                    onChange={(e) => setNewTest({ ...newTest, testDate: e.target.value })}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 45m"
                    value={newTest.duration}
                    onChange={(e) => setNewTest({ ...newTest, duration: e.target.value })}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Total Marks</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={newTest.totalMarks}
                    onChange={(e) => setNewTest({ ...newTest, totalMarks: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Topics / Syllabus Covered</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Topics 1-4, normalization exercises..."
                  value={newTest.description}
                  onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-dark hover:bg-slate-800 text-white rounded-lg font-semibold shadow-sm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Post Announcement to Classroom</h3>
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handlePostAnnouncement} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Announcement Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next Class in Lab 2 instead of Room 402"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-dark/20 focus:border-brand-dark"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Priority Level</label>
                <select
                  value={newAnnouncement.priority}
                  onChange={(e) =>
                    setNewAnnouncement({ ...newAnnouncement, priority: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Normal">Normal Notice</option>
                  <option value="High">Urgent / High Priority</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Notice Body *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write message to students..."
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-dark hover:bg-slate-800 text-white rounded-lg font-semibold shadow-sm"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD MATERIAL ── */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Upload Course Material</h3>
              <button
                onClick={() => setShowMaterialModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddMaterial} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Material / Slide Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 5: Transactions & Concurrency Slides"
                  value={newMaterial.title}
                  onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Category</label>
                  <select
                    value={newMaterial.category}
                    onChange={(e) => setNewMaterial({ ...newMaterial, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Slides">Lecture Slides</option>
                    <option value="Lab & Code">Lab Sheet / Code</option>
                    <option value="Reading">Reading / PDF Book</option>
                    <option value="Notes">Teacher Notes</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">File Type</label>
                  <select
                    value={newMaterial.fileType}
                    onChange={(e) => setNewMaterial({ ...newMaterial, fileType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="ZIP">ZIP Archive</option>
                    <option value="PPTX">PowerPoint (PPTX)</option>
                    <option value="DOCX">Word Document</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">File Upload Simulation</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center space-y-1 bg-slate-50/50">
                  <FolderOpen className="w-6 h-6 mx-auto text-slate-400" />
                  <p className="text-[11px] font-medium text-slate-700">Click or drag file here to attach</p>
                  <p className="text-[9px] text-slate-400">PDF, ZIP, PPTX up to 50MB</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMaterialModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-dark hover:bg-slate-800 text-white rounded-lg font-semibold shadow-sm"
                >
                  Upload & Share
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

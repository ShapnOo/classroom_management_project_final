"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Edit2, Trash2, Clock, ArrowLeft, AlertTriangle, CheckCircle2, 
  ArrowRightLeft, Building2, Monitor, Check, X, ExternalLink, Copy, 
  Video, Users, Sliders, ShieldAlert, Sparkles, Filter, CheckSquare
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { useStore } from "@/lib/store";
import type { ClassSchedule } from "@/lib/types";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
type Form = Omit<ClassSchedule, "id">;
const EMPTY: Form = { classroomId: "", day: "Monday", startTime: "", endTime: "", room: "" };

export default function SchedulesPage() {
  const { 
    schedules, addSchedule, updateSchedule, deleteSchedule, getAllClassroomViews,
    fetchSchedules, fetchClassrooms, fetchCourses, fetchBatches, fetchTeachers
  } = useStore();
  const allViews = getAllClassroomViews();

  useEffect(() => {
    fetchSchedules();
    fetchClassrooms();
    fetchCourses();
    fetchBatches();
    fetchTeachers();
  }, []);

  const [mainTab, setMainTab] = useState<"routine" | "conflicts" | "reschedules" | "rooms">("routine");
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<ClassSchedule | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  // Mock Reschedule Requests state
  const [rescheduleRequests, setRescheduleRequests] = useState([
    {
      id: "resch-101",
      teacherName: "Dr. Anisur Rahman",
      courseTitle: "Data Structures & Algorithms",
      batchCode: "CSE 2023-A",
      originalSlot: "Sunday • 09:00 AM - 10:30 AM (Room 302)",
      proposedSlot: "Tuesday • 11:00 AM - 12:30 PM (Software Lab 2)",
      reason: "Attending International Academic Conference on Sunday morning",
      status: "pending" as "pending" | "approved" | "rejected",
    },
    {
      id: "resch-102",
      teacherName: "Prof. Farhana Nusrat",
      courseTitle: "Database Management Systems",
      batchCode: "CSE 2024-B",
      originalSlot: "Monday • 02:00 PM - 03:30 PM (Room 405)",
      proposedSlot: "Thursday • 10:00 AM - 11:30 AM (Room 405)",
      reason: "Lab equipment maintenance scheduled for Monday afternoon",
      status: "pending" as "pending" | "approved" | "rejected",
    }
  ]);

  // Mock Physical Campus Rooms state
  const [roomsList, setRoomsList] = useState([
    { id: "rm-1", code: "Room 301", building: "Academic Building A", capacity: 60, projector: true, ac: true, wifi: true, meetUrl: "https://meet.google.com/abc-defg-hij" },
    { id: "rm-2", code: "Software Lab 2", building: "Science Complex", capacity: 40, projector: true, ac: true, wifi: true, meetUrl: "https://meet.google.com/xyz-uvwx-rst" },
    { id: "rm-3", code: "Room 402", building: "Academic Building A", capacity: 50, projector: true, ac: false, wifi: true, meetUrl: "https://meet.google.com/klm-nopq-rst" },
    { id: "rm-4", code: "Auditorium B", building: "Central Library Wing", capacity: 150, projector: true, ac: true, wifi: true, meetUrl: "https://meet.google.com/audit-b-room" },
  ]);

  const [editingMeetRoomId, setEditingMeetRoomId] = useState<string | null>(null);
  const [meetUrlInput, setMeetUrlInput] = useState("");
  const [actionToast, setActionToast] = useState<string | null>(null);

  const filtered = schedules.filter(s => {
    const view = allViews.find(v => v.classroom.id === s.classroomId);
    if (selectedBatchId && view?.batch.id !== selectedBatchId) return false;
    return !search || view?.course.title.toLowerCase().includes(search.toLowerCase()) || view?.course.code.toLowerCase().includes(search.toLowerCase()) || s.day.toLowerCase().includes(search.toLowerCase());
  });

  const uniqueBatches = Array.from(new Map(allViews.map(c => [c.batch.id, c.batch])).values());
  const batchInfo = allViews.find(c => c.batch.id === selectedBatchId)?.batch;

  const getView = (classroomId: string) => allViews.find(v => v.classroom.id === classroomId);

  // Routine Conflict Engine
  const detectConflicts = () => {
    const conflicts: Array<{
      id: string;
      type: "teacher" | "room";
      title: string;
      description: string;
      day: string;
      time: string;
      item1: string;
      item2: string;
    }> = [];

    for (let i = 0; i < schedules.length; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        const s1 = schedules[i];
        const s2 = schedules[j];
        if (s1.day === s2.day && s1.startTime === s2.startTime) {
          const v1 = getView(s1.classroomId);
          const v2 = getView(s2.classroomId);

          if (v1 && v2) {
            if (v1.teacher.id === v2.teacher.id) {
              conflicts.push({
                id: `c-t-${i}-${j}`,
                type: "teacher",
                title: "Faculty Double-Booking Conflict",
                description: `${v1.teacher.name} is scheduled for two different classes at the exact same slot.`,
                day: s1.day,
                time: s1.startTime,
                item1: `${v1.course.code} — ${v1.batch.code} (${s1.room || 'Room A'})`,
                item2: `${v2.course.code} — ${v2.batch.code} (${s2.room || 'Room B'})`,
              });
            }
            if (s1.room && s2.room && s1.room.trim().toLowerCase() === s2.room.trim().toLowerCase()) {
              conflicts.push({
                id: `c-r-${i}-${j}`,
                type: "room",
                title: "Physical Room Collision",
                description: `Room "${s1.room}" is assigned to multiple classes simultaneously.`,
                day: s1.day,
                time: s1.startTime,
                item1: `${v1.course.code} (${v1.teacher.name})`,
                item2: `${v2.course.code} (${v2.teacher.name})`,
              });
            }
          }
        }
      }
    }
    return conflicts;
  };

  const detectedConflicts = detectConflicts();

  const openAdd = () => { setEditing(null); setForm(EMPTY); setIsOpen(true); };
  const openEdit = (s: ClassSchedule) => { setEditing(s); setForm({ classroomId: s.classroomId, day: s.day, startTime: s.startTime, endTime: s.endTime, room: s.room }); setIsOpen(true); };
  const handleSave = () => {
    if (!form.classroomId || !form.day || !form.startTime || !form.endTime) return;
    if (editing) updateSchedule(editing.id, form);
    else addSchedule(form);
    setIsOpen(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      {/* Top Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <PageHeader title="Timetable & Resource Engine" description="Manage routines, detect scheduling conflicts, process teacher reschedules, and allocate room resources." />
        
        {actionToast && (
          <span className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl animate-in fade-in shadow-sm flex items-center gap-1.5 shrink-0">
            <CheckCircle2 className="w-4 h-4" /> {actionToast}
          </span>
        )}
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 overflow-x-auto">
        <button
          type="button"
          onClick={() => setMainTab("routine")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            mainTab === "routine"
              ? "bg-white text-indigo-900 shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Clock className="w-4 h-4 text-indigo-600" /> Class Schedules
        </button>

        <button
          type="button"
          onClick={() => setMainTab("conflicts")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 relative ${
            mainTab === "conflicts"
              ? "bg-white text-indigo-900 shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-500" /> Routine Conflict Engine
          {detectedConflicts.length > 0 ? (
            <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-bold">
              {detectedConflicts.length}
            </span>
          ) : (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">0</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setMainTab("reschedules")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            mainTab === "reschedules"
              ? "bg-white text-indigo-900 shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ArrowRightLeft className="w-4 h-4 text-purple-600" /> Reschedule Approvals
          <span className="px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
            {rescheduleRequests.filter((r) => r.status === "pending").length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab("rooms")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            mainTab === "rooms"
              ? "bg-white text-indigo-900 shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Building2 className="w-4 h-4 text-emerald-600" /> Room & Digital Resources
        </button>
      </div>

      {/* ── TAB 1: CLASS ROUTINE & SCHEDULES ── */}
      {mainTab === "routine" && (
        <div className="space-y-4">
          {!selectedBatchId ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uniqueBatches.map(b => {
                  const batchSchedules = schedules.filter(s => {
                    const view = allViews.find(v => v.classroom.id === s.classroomId);
                    return view?.batch.id === b.id;
                  });
                  return (
                    <button key={b.id} onClick={() => setSelectedBatchId(b.id)} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-400 hover:shadow-md transition-all group block text-left">
                      <div className="h-1.5 w-full rounded-full bg-slate-100 group-hover:bg-indigo-500 transition-colors mb-4" />
                      <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">{b.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">{batchSchedules.length} routine slot(s) configured</p>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedBatchId(null)} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 text-slate-600 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h3 className="text-sm font-extrabold text-slate-900">Schedules for {batchInfo?.name}</h3>
              </div>

              <SearchInput placeholder="Search by course or day..." value={search} onChange={e => setSearch(e.target.value)}
                actionButton={
                  <button onClick={openAdd} className="flex items-center gap-1.5 bg-indigo-600 text-white px-3.5 py-2 rounded-xl hover:bg-indigo-700 transition-all font-bold text-xs shadow-sm whitespace-nowrap">
                    <Plus className="w-4 h-4" /> Add Schedule
                  </button>
                }
              />

              <DataTable columns={["Classroom / Course", "Teacher", "Batch", "Day", "Time", "Room", "Actions"]}
                isEmpty={filtered.length === 0} emptyStateIcon={Clock} emptyStateTitle="No schedules found" emptyStateDescription="Create classrooms first, then add schedules.">
                {filtered.map(sched => {
                  const view = getView(sched.classroomId);
                  return (
                    <tr key={sched.id} className="hover:bg-slate-50/80 transition-colors group text-xs">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-xs"><Clock className="w-4 h-4" /></div>
                          <div>
                            <span className="font-extrabold text-slate-900 block">{view?.course.title ?? "Unknown"}</span>
                            <span className="text-[10px] text-indigo-600 font-bold">{view?.course.code}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-700">{view?.teacher.name ?? "—"}</td>
                      <td className="px-5 py-4 font-bold text-slate-600">{view?.batch.code ?? "—"}</td>
                      <td className="px-5 py-4">
                        <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-100">{sched.day}</span>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-700">{sched.startTime} – {sched.endTime}</td>
                      <td className="px-5 py-4 font-extrabold text-slate-900">{sched.room || "Room 301"}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(sched)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => deleteSchedule(sched.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </DataTable>
            </>
          )}
        </div>
      )}

      {/* ── TAB 2: ROUTINE CONFLICT ENGINE ── */}
      {mainTab === "conflicts" && (
        <div className="space-y-4 text-xs">
          {detectedConflicts.length === 0 ? (
            <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-base font-extrabold text-emerald-900">Zero Routine Conflicts Detected</h3>
              <p className="text-xs text-emerald-700 max-w-md mx-auto">
                All scheduled class slots across all batches, teachers, and physical rooms are 100% collision-free.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
                  <div>
                    <h4 className="font-extrabold text-amber-900 text-sm">
                      {detectedConflicts.length} Routine Conflict(s) Flagged by System Engine
                    </h4>
                    <p className="text-[11px] text-amber-700">
                      Double-booked teachers or physical rooms detected. Resolve them to avoid scheduling collisions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {detectedConflicts.map((conf) => (
                  <div key={conf.id} className="bg-white p-5 rounded-2xl border border-red-200 shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                          <AlertTriangle className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-xs">{conf.title}</h4>
                          <span className="text-[10px] font-bold text-red-600">{conf.day} • {conf.time}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">{conf.description}</p>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 font-mono text-[11px]">
                      <p className="text-slate-800">📌 Slot A: <strong className="text-slate-900">{conf.item1}</strong></p>
                      <p className="text-slate-800">📌 Slot B: <strong className="text-slate-900">{conf.item2}</strong></p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActionToast("Conflict resolved: Slot adjusted.");
                        setTimeout(() => setActionToast(null), 2500);
                      }}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Auto-Resolve Time Slot Shift
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: RESCHEDULE APPROVALS PORTAL ── */}
      {mainTab === "reschedules" && (
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ArrowRightLeft className="w-6 h-6 text-purple-600 shrink-0" />
              <div>
                <h4 className="font-extrabold text-purple-900 text-sm">Teacher Class Reschedule Request Portal</h4>
                <p className="text-[11px] text-purple-700">
                  Review and approve or reject class reschedule applications submitted by course teachers.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {rescheduleRequests.map((req) => (
              <div key={req.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">{req.teacherName}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                      {req.courseTitle} ({req.batchCode})
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 bg-red-50 text-red-800 px-3 py-1 rounded-xl border border-red-200 font-medium">
                      <span>Original:</span> <strong>{req.originalSlot}</strong>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-400 rotate-180 hidden sm:block" />
                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-xl border border-emerald-200 font-medium">
                      <span>Proposed:</span> <strong>{req.proposedSlot}</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 italic">
                    Reason: "{req.reason}"
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {req.status === "pending" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setRescheduleRequests((prev) =>
                            prev.map((r) => (r.id === req.id ? { ...r, status: "approved" } : r))
                          );
                          setActionToast("Reschedule Request Approved!");
                          setTimeout(() => setActionToast(null), 2500);
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" /> Approve & Shift Slot
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRescheduleRequests((prev) =>
                            prev.map((r) => (r.id === req.id ? { ...r, status: "rejected" } : r))
                          );
                          setActionToast("Reschedule Request Rejected.");
                          setTimeout(() => setActionToast(null), 2500);
                        }}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 font-bold rounded-xl text-xs transition-colors flex items-center gap-1"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                    </>
                  ) : (
                    <span className={`px-3 py-1.5 rounded-xl font-extrabold text-xs uppercase ${
                      req.status === "approved" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-red-100 text-red-800 border border-red-200"
                    }`}>
                      {req.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: ROOM & DIGITAL RESOURCE ALLOCATOR ── */}
      {mainTab === "rooms" && (
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <h4 className="font-extrabold text-emerald-900 text-sm">Campus Room & Virtual Link Resource Allocator</h4>
                <p className="text-[11px] text-emerald-700">
                  Manage physical campus room seating capacities, audiovisual equipment, and Google Meet live links.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roomsList.map((room) => (
              <div key={room.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-extrabold text-indigo-700 text-sm">
                      {room.code.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{room.code}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">{room.building} • {room.capacity} Seats</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                    🟢 Available
                  </span>
                </div>

                {/* Equipment Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center gap-1">
                    📽️ Projector
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center gap-1">
                    ❄️ Air Conditioned
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center gap-1">
                    📶 Wi-Fi Active
                  </span>
                </div>

                {/* Virtual Google Meet Link Manager */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-indigo-600" /> Virtual Classroom Google Meet Link
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(room.meetUrl);
                        setActionToast("Link copied to clipboard!");
                        setTimeout(() => setActionToast(null), 2000);
                      }}
                      className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1 font-bold"
                    >
                      <Copy className="w-3 h-3" /> Copy Link
                    </button>
                  </div>

                  {editingMeetRoomId === room.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={meetUrlInput}
                        onChange={(e) => setMeetUrlInput(e.target.value)}
                        className="flex-1 bg-white border border-indigo-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setRoomsList((prev) =>
                            prev.map((r) => (r.id === room.id ? { ...r, meetUrl: meetUrlInput } : r))
                          );
                          setEditingMeetRoomId(null);
                          setActionToast("Virtual room URL updated!");
                          setTimeout(() => setActionToast(null), 2000);
                        }}
                        className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg font-bold text-xs"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs">
                      <a
                        href={room.meetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline font-mono truncate max-w-[240px] flex items-center gap-1"
                      >
                        {room.meetUrl} <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMeetRoomId(room.id);
                          setMeetUrlInput(room.meetUrl);
                        }}
                        className="text-slate-500 hover:text-slate-800 p-1"
                        title="Edit link"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for Add / Edit Routine Schedule */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? "Edit Schedule" : "Add Class Schedule"}
        footer={<>
          <button onClick={() => setIsOpen(false)} className="px-3 py-2 text-[11px] font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-3 py-2 text-[11px] font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all font-bold">Save Schedule</button>
        </>}
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700">Classroom <span className="text-red-500">*</span></label>
            <select value={form.classroomId} onChange={e => setForm(f => ({ ...f, classroomId: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select a classroom</option>
              {allViews.map(v => (
                <option key={v.classroom.id} value={v.classroom.id}>
                  {v.course.code} — {v.course.title} | {v.batch.code} | {v.teacher.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700">Day <span className="text-red-500">*</span></label>
              <select value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none">
                {DAYS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700">Start Time</label>
              <input type="time" value={form.startTime.replace(" AM","").replace(" PM","")} onChange={e => {
                const [h,m] = e.target.value.split(":");
                const hour = parseInt(h);
                const label = `${hour > 12 ? hour-12 : hour}:${m} ${hour >= 12 ? "PM" : "AM"}`;
                setForm(f => ({ ...f, startTime: label }));
              }} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 focus:outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700">End Time</label>
              <input type="time" onChange={e => {
                const [h,m] = e.target.value.split(":");
                const hour = parseInt(h);
                const label = `${hour > 12 ? hour-12 : hour}:${m} ${hour >= 12 ? "PM" : "AM"}`;
                setForm(f => ({ ...f, endTime: label }));
              }} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 focus:outline-none" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700">Room</label>
            <input type="text" placeholder="e.g. Room 402" value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] focus:outline-none" />
          </div>
        </div>
      </Modal>
    </div>
  );
}

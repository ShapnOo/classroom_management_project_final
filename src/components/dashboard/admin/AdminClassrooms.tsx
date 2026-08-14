"use client";

import {
  Users, Clock, CalendarDays, MapPin, BookOpen, LayoutGrid,
  List as ListIcon, Search, TrendingUp, ArrowRight, User,
  Plus, Trash2, Edit2, X, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import type { Classroom } from "@/lib/types";
import { CLASSROOM_COLORS } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";

type Form = Omit<Classroom, "id">;
const EMPTY: Form = {
  courseId: "", batchId: "", teacherId: "", room: "",
  startDate: "", endDate: "", status: "upcoming",
  classesCompleted: 0, totalClasses: 24, colorIndex: 0,
};

export default function AdminClassrooms() {
  const {
    classrooms, courses, batches, sessions, teachers, students, programs,
    addClassroom, updateClassroom, deleteClassroom,
    addSchedule, updateSchedule, deleteSchedule,
    schedules: allSchedules
  } = useStore();
  const allViews = useStore().getAllClassroomViews();

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Classroom | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [modalProgramId, setModalProgramId] = useState<string>("");

  const [schedules, setSchedules] = useState<{ id?: string; day: string; startTime: string; endTime: string }[]>([]);

  const filtered = allViews.filter(v => {
    if (selectedBatchId && v.batch.id !== selectedBatchId) return false;
    const matchSearch =
      v.course.title.toLowerCase().includes(search.toLowerCase()) ||
      v.course.code.toLowerCase().includes(search.toLowerCase()) ||
      v.teacher.name.toLowerCase().includes(search.toLowerCase()) ||
      v.batch.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || v.classroom.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const uniqueBatches = Array.from(new Map(allViews.map(c => [c.batch.id, c.batch])).values());
  const batchInfo = allViews.find(c => c.batch.id === selectedBatchId)?.batch;

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY, colorIndex: classrooms.length % CLASSROOM_COLORS.length });
    setModalProgramId("");
    setSchedules([{ day: "Monday", startTime: "10:00 AM", endTime: "11:30 AM" }]);
    setIsOpen(true);
  };
  const openEdit = (cls: Classroom) => {
    setEditing(cls);
    setForm({ courseId: cls.courseId, batchId: cls.batchId, teacherId: cls.teacherId, room: cls.room, startDate: cls.startDate, endDate: cls.endDate, status: cls.status, classesCompleted: cls.classesCompleted, totalClasses: cls.totalClasses, colorIndex: cls.colorIndex });
    const batch = batches.find(b => b.id === cls.batchId);
    setModalProgramId(batch?.programId || "");
    const clsSchedules = allSchedules.filter(s => s.classroomId === cls.id);
    setSchedules(clsSchedules.map(s => ({ id: s.id, day: s.day, startTime: s.startTime, endTime: s.endTime })));
    setIsOpen(true);
  };
  const handleSave = () => {
    if (!form.courseId || !form.batchId || !form.teacherId || !form.room) return;
    let clsId = editing?.id;
    if (editing) {
      updateClassroom(editing.id, form);
      const oldSchedules = allSchedules.filter(s => s.classroomId === editing.id);
      oldSchedules.forEach(s => deleteSchedule(s.id));
    } else {
      clsId = addClassroom(form);
    }
    schedules.forEach(s => addSchedule({ classroomId: clsId!, day: s.day, startTime: s.startTime, endTime: s.endTime, room: form.room }));
    setIsOpen(false);
  };

  return (
    <div className="w-full mx-auto space-y-4 pb-8">
      {!selectedBatchId ? (
        <div className="space-y-4 animate-in fade-in duration-500 pb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h1 className="text-[13px] font-medium text-slate-900">Select Batch</h1>
              <p className="text-[11px] text-slate-500 mt-0.5">Admin creates classrooms by linking Course + Batch + Teacher.</p>
            </div>
            <button onClick={openAdd} className="flex items-center gap-1.5 bg-brand-dark text-white px-3 py-1.5 rounded-md hover:bg-slate-800 transition-all font-medium text-[11px] shadow-sm whitespace-nowrap shrink-0">
              <Plus className="w-3.5 h-3.5" /> New Classroom
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uniqueBatches.map(b => {
              const batchClasses = allViews.filter(c => c.batch.id === b.id);
              return (
                <button key={b.id} onClick={() => setSelectedBatchId(b.id)} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-brand-dark/40 hover:shadow-md transition-all group block text-left">
                  <div className="h-1 w-full rounded-full bg-slate-200 group-hover:bg-brand-dark/40 transition-colors mb-4" />
                  <h3 className="text-[13px] font-medium text-slate-900 group-hover:text-brand-dark transition-colors">{b.name}</h3>
                  <p className="text-[10px] text-slate-500 mt-1">{batchClasses.length} classrooms</p>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedBatchId(null)} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 text-slate-600 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-[13px] font-medium text-slate-900">Classrooms for {batchInfo?.name}</h1>
                <p className="text-[11px] text-slate-500 mt-0.5">Manage courses assigned to this batch.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input type="text" placeholder="Search classrooms..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400" />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-2 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-md text-[11px] font-medium outline-none focus:border-brand-dark w-full sm:w-auto cursor-pointer">
                  <option value="all">All Status</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
                <div className="flex items-center border border-slate-200 rounded-md bg-white p-0.5 shrink-0">
                  <button onClick={() => setViewMode("grid")} className={`p-1 rounded ${viewMode === "grid" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600"}`}><LayoutGrid className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setViewMode("list")} className={`p-1 rounded ${viewMode === "list" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600"}`}><ListIcon className="w-3.5 h-3.5" /></button>
                </div>
                <button onClick={openAdd} className="flex items-center gap-1.5 bg-brand-dark text-white px-3 py-1.5 rounded-md hover:bg-slate-800 transition-all font-medium text-[11px] shadow-sm whitespace-nowrap shrink-0">
                  <Plus className="w-3.5 h-3.5" /> New Classroom
                </button>
              </div>
            </div>
          </div>

          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map(({ classroom: cls, course, batch, teacher, session, schedules, students: batchStudents, colors, progress }) => (
                <div key={cls.id} className={`bg-white rounded-lg border shadow-sm overflow-hidden flex flex-col transition-all group ${cls.status === "completed" ? "border-slate-200/60 opacity-80" : "border-slate-200 hover:border-brand-dark/30 hover:shadow-md"}`}>
                  <div className={`h-1.5 w-full ${cls.status === "completed" ? "bg-slate-300" : colors.color}`} />
                  <div className="p-3.5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2.5">
                      <div>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-medium tracking-wider uppercase mb-1 ${cls.status === "completed" ? "bg-slate-100 text-slate-600" : `${colors.light} ${colors.text}`}`}>
                          {course.code} • {cls.status}
                        </span>
                        <h3 className="text-[13px] font-medium text-slate-900 leading-tight group-hover:text-brand-dark transition-colors line-clamp-1">{course.title}</h3>
                      </div>
                      <div className="flex gap-0.5">
                        <button onClick={() => openEdit(cls)} className="p-1 text-slate-300 hover:text-slate-600 rounded transition-colors"><Edit2 className="w-3 h-3" /></button>
                        <button onClick={() => deleteClassroom(cls.id)} className="p-1 text-slate-300 hover:text-red-500 rounded transition-colors"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-[10px] font-medium mb-1">
                        <span className="text-slate-500">Progress</span>
                        <span className={cls.status === "completed" ? "text-slate-600" : colors.text}>{progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${cls.status === "completed" ? "bg-slate-400" : colors.color} rounded-full`} style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    <div className="space-y-1.5 mb-3 flex-1">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-[11px] font-medium text-slate-700">{teacher.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-[11px] text-slate-600">{batch.name} • <strong>{batchStudents.length}</strong> students</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-[10px] text-slate-600">{schedules.length > 0 ? `${[...new Set(schedules.map(s => s.day.slice(0,3)))].join(", ")} • ${schedules[0].startTime}` : "No schedule set"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-[10px] text-slate-600">{cls.room}</span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-1.5">
                      <Link href={`/dashboard/admin/academic/classrooms/${cls.id}`} className={`col-span-2 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-medium rounded shadow-sm transition-colors ${cls.status === "completed" ? "bg-slate-200 text-slate-600 hover:bg-slate-300" : "bg-brand-dark text-white hover:bg-slate-800"}`}>
                        <ArrowRight className="w-3.5 h-3.5" /> View Details
                      </Link>
                      <div className="flex flex-col items-center py-1.5 rounded bg-slate-50 text-center">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[9px] text-slate-600 font-medium mt-0.5">{cls.classesCompleted}/{cls.totalClasses}</span>
                      </div>
                      <div className="flex flex-col items-center py-1.5 rounded bg-slate-50 text-center">
                        <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[9px] text-slate-600 font-medium mt-0.5">{session.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                      <th className="px-4 py-2.5">Course</th>
                      <th className="px-4 py-2.5">Teacher</th>
                      <th className="px-4 py-2.5">Batch / Session</th>
                      <th className="px-4 py-2.5">Students</th>
                      <th className="px-4 py-2.5">Progress</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {filtered.map(({ classroom: cls, course, batch, teacher, session, colors, progress, studentCount }) => (
                      <tr key={cls.id} className={`hover:bg-slate-50 transition-colors ${cls.status === "completed" ? "opacity-70" : ""}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-8 rounded-full ${cls.status === "completed" ? "bg-slate-300" : colors.color}`} />
                            <div>
                              <p className="font-medium text-slate-900">{course.title}</p>
                              <span className="text-[9px] font-medium text-slate-500">{course.code} • {cls.status}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3 h-3 text-slate-400" />
                            <span className="font-medium text-slate-700">{teacher.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-700">{batch.name}</p>
                          <p className="text-[10px] text-slate-500">{session.name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-slate-700">{studentCount}</span>
                        </td>
                        <td className="px-4 py-3 w-44">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full ${cls.status === "completed" ? "bg-slate-400" : colors.color} rounded-full`} style={{ width: `${progress}%` }} />
                            </div>
                            <span className="text-[10px] font-medium text-slate-600">{progress}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEdit(cls)} className="p-1.5 text-slate-400 hover:text-brand-dark rounded hover:bg-slate-100 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => deleteClassroom(cls.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                            <Link href={`/dashboard/admin/academic/classrooms/${cls.id}`} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-[10px] font-medium bg-brand-dark text-white hover:bg-slate-800 transition-colors ml-1">
                              View <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-50 rounded-lg border border-slate-200 border-dashed">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-2">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <h3 className="text-[11px] font-medium text-slate-900 mb-0.5">No classrooms found</h3>
              <p className="text-[10px] text-slate-500 mb-3">Create your first classroom to assign courses to batches.</p>
              <button onClick={openAdd} className="flex items-center gap-1.5 bg-brand-dark text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-all font-medium text-[11px] shadow-sm">
                <Plus className="w-3.5 h-3.5" /> Create Classroom
              </button>
            </div>
          )}
        </>
      )}

      {/* Create / Edit Classroom Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? "Edit Classroom" : "Create Classroom"} maxWidth="max-w-xl"
        footer={<>
          <button onClick={() => setIsOpen(false)} className="px-3 py-2 text-[11px] font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-3 py-2 text-[11px] font-medium text-white bg-brand-dark hover:bg-brand-dark/90 rounded-lg shadow-sm transition-all">{editing ? "Update" : "Create Classroom"}</button>
        </>}
      >
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-[10px] text-blue-700 font-medium">A Classroom links a Course to a Batch, assigns a Teacher, and sets a room and dates. Once created, the teacher will see it in their portal.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Program <span className="text-red-500">*</span></label>
              <select value={modalProgramId} onChange={e => {
                setModalProgramId(e.target.value);
                setForm(f => ({ ...f, batchId: "", courseId: "" })); // Reset downstream
              }} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
                <option value="">Select a program</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Batch <span className="text-red-500">*</span></label>
              <select 
                value={form.batchId} 
                onChange={e => setForm(f => ({ ...f, batchId: e.target.value, courseId: "" }))} 
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all disabled:bg-slate-50 disabled:text-slate-400"
                disabled={!modalProgramId}
              >
                <option value="">Select a batch</option>
                {batches.filter(b => b.programId === modalProgramId).map(b => {
                  const session = sessions.find(s => s.id === b.sessionId);
                  return <option key={b.id} value={b.id}>{b.name} ({session?.name ?? ""})</option>;
                })}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Course <span className="text-red-500">*</span></label>
              <select 
                value={form.courseId} 
                onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))} 
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all disabled:bg-slate-50 disabled:text-slate-400"
                disabled={!form.batchId}
              >
                <option value="">Select a course</option>
                {(() => {
                  if (!form.batchId || !modalProgramId) return null;
                  const selectedBatch = batches.find(b => b.id === form.batchId);
                  const hasCurriculum = selectedBatch?.batchCourses && selectedBatch.batchCourses.length > 0;
                  
                  const validCourseIds = selectedBatch?.batchCourses?.map(bc => bc.courseId) || [];
                  const batchCourses = hasCurriculum 
                    ? courses.filter(c => validCourseIds.includes(c.id))
                    : courses.filter(c => c.programId === modalProgramId);
                    
                  if (batchCourses.length === 0) {
                     return <option value="" disabled>No courses available</option>;
                  }
                  
                  return batchCourses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>);
                })()}
              </select>
              {form.batchId && (
                <p className="text-[9px] text-slate-500">
                  {batches.find(b => b.id === form.batchId)?.batchCourses?.length 
                    ? "Showing courses configured in the batch's curriculum." 
                    : "Showing all program courses (batch has no curriculum yet)."}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Assign Teacher <span className="text-red-500">*</span></label>
              <select value={form.teacherId} onChange={e => setForm(f => ({ ...f, teacherId: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
                <option value="">Select a teacher</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.designation})</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Room / Location <span className="text-red-500">*</span></label>
            <input type="text" placeholder="e.g. Room 402, Bldg C" value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">End Date</label>
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Classroom["status"] }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Total Classes</label>
              <input type="number" min={1} value={form.totalClasses} onChange={e => setForm(f => ({ ...f, totalClasses: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Card Color</label>
              <div className="flex gap-1.5 pt-1.5">
                {CLASSROOM_COLORS.map((c, i) => (
                  <button key={i} type="button" onClick={() => setForm(f => ({ ...f, colorIndex: i }))} className={`w-5 h-5 rounded-full ${c.color} transition-all ${form.colorIndex === i ? "ring-2 ring-offset-1 ring-slate-700 scale-110" : "opacity-60 hover:opacity-100"}`} />
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-2 pt-3 border-t border-slate-100 mt-2">
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-800 flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-brand-dark" /> Class Schedules</label>
                <p className="text-[10px] text-slate-500 mt-0.5">Define weekly meeting times. These will appear in the teacher's schedule.</p>
              </div>
              <button type="button" onClick={() => setSchedules(s => [...s, { day: "Monday", startTime: "10:00 AM", endTime: "11:30 AM" }])} className="text-[11px] font-medium bg-brand-dark/5 text-brand-dark px-2.5 py-1.5 rounded-md hover:bg-brand-dark/10 transition-colors flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Time
              </button>
            </div>
            
            <div className="space-y-2.5">
              {schedules.length === 0 ? (
                <div className="text-center py-4 bg-slate-50 border border-slate-200 border-dashed rounded-lg">
                  <p className="text-[11px] text-slate-500">No schedules added yet.</p>
                </div>
              ) : (
                schedules.map((sch, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-2 items-center bg-slate-50/50 p-2 rounded-lg border border-slate-200 shadow-sm group hover:border-brand-dark/30 transition-colors">
                    <div className="flex-1 w-full">
                      <select value={sch.day} onChange={e => setSchedules(s => s.map((x, i) => i === idx ? { ...x, day: e.target.value } : x))} className="w-full px-3 py-2 rounded-md border border-slate-200 text-[11px] font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                          <option key={day}>{day}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto bg-white border border-slate-200 rounded-md px-2 focus-within:ring-2 focus-within:ring-brand-dark/20 focus-within:border-brand-dark transition-all">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <input type="time" value={sch.startTime.replace(/ AM| PM/, "").replace(/(\d+):(\d+).*/, (match, h, m) => {
                        let hh = parseInt(h);
                        if (sch.startTime.includes("PM") && hh !== 12) hh += 12;
                        if (sch.startTime.includes("AM") && hh === 12) hh = 0;
                        return `${hh.toString().padStart(2, "0")}:${m}`;
                      }) || "10:00"} onChange={e => {
                        if(!e.target.value) return;
                        const [h, m] = e.target.value.split(":");
                        const hh = parseInt(h);
                        const ampm = hh >= 12 ? "PM" : "AM";
                        const h12 = hh % 12 || 12;
                        setSchedules(s => s.map((x, i) => i === idx ? { ...x, startTime: `${h12}:${m} ${ampm}` } : x));
                      }} className="w-[85px] py-2 text-[11px] font-medium text-slate-700 focus:outline-none bg-transparent" />
                    </div>
                    
                    <span className="text-[10px] font-medium text-slate-400 hidden sm:block">to</span>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto bg-white border border-slate-200 rounded-md px-2 focus-within:ring-2 focus-within:ring-brand-dark/20 focus-within:border-brand-dark transition-all">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <input type="time" value={sch.endTime.replace(/ AM| PM/, "").replace(/(\d+):(\d+).*/, (match, h, m) => {
                        let hh = parseInt(h);
                        if (sch.endTime.includes("PM") && hh !== 12) hh += 12;
                        if (sch.endTime.includes("AM") && hh === 12) hh = 0;
                        return `${hh.toString().padStart(2, "0")}:${m}`;
                      }) || "11:30"} onChange={e => {
                        if(!e.target.value) return;
                        const [h, m] = e.target.value.split(":");
                        const hh = parseInt(h);
                        const ampm = hh >= 12 ? "PM" : "AM";
                        const h12 = hh % 12 || 12;
                        setSchedules(s => s.map((x, i) => i === idx ? { ...x, endTime: `${h12}:${m} ${ampm}` } : x));
                      }} className="w-[85px] py-2 text-[11px] font-medium text-slate-700 focus:outline-none bg-transparent" />
                    </div>
                    
                    <button type="button" onClick={() => setSchedules(s => s.filter((_, i) => i !== idx))} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-100 sm:opacity-50 sm:group-hover:opacity-100 ml-auto sm:ml-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Clock } from "lucide-react";
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
  const { schedules, addSchedule, updateSchedule, deleteSchedule, getAllClassroomViews } = useStore();
  const allViews = getAllClassroomViews();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<ClassSchedule | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);

  const filtered = schedules.filter(s => {
    const view = allViews.find(v => v.classroom.id === s.classroomId);
    return !search || view?.course.title.toLowerCase().includes(search.toLowerCase()) || view?.course.code.toLowerCase().includes(search.toLowerCase()) || s.day.toLowerCase().includes(search.toLowerCase());
  });

  const openAdd = () => { setEditing(null); setForm(EMPTY); setIsOpen(true); };
  const openEdit = (s: ClassSchedule) => { setEditing(s); setForm({ classroomId: s.classroomId, day: s.day, startTime: s.startTime, endTime: s.endTime, room: s.room }); setIsOpen(true); };
  const handleSave = () => {
    if (!form.classroomId || !form.day || !form.startTime || !form.endTime) return;
    if (editing) updateSchedule(editing.id, form);
    else addSchedule(form);
    setIsOpen(false);
  };

  const getView = (classroomId: string) => allViews.find(v => v.classroom.id === classroomId);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <PageHeader title="Class Schedules" description="Set recurring class days and times per classroom. Teachers see these in their daily schedule and dashboard." />

      <SearchInput placeholder="Search by course or day..." value={search} onChange={e => setSearch(e.target.value)}
        actionButton={
          <button onClick={openAdd} className="flex items-center gap-1.5 bg-brand-dark text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-all font-medium text-[11px] shadow-sm whitespace-nowrap">
            <Plus className="w-3.5 h-3.5" /> Add Schedule
          </button>
        }
      />

      <DataTable columns={["Classroom / Course", "Teacher", "Batch", "Day", "Time", "Room", "Actions"]}
        isEmpty={filtered.length === 0} emptyStateIcon={Clock} emptyStateTitle="No schedules found" emptyStateDescription="Create classrooms first, then add schedules.">
        {filtered.map(sched => {
          const view = getView(sched.classroomId);
          return (
            <tr key={sched.id} className="hover:bg-slate-50/80 transition-colors group">
              <td className="px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm"><Clock className="w-3.5 h-3.5" /></div>
                  <div>
                    <span className="font-medium text-[11px] text-slate-900 block">{view?.course.title ?? "Unknown"}</span>
                    <span className="text-[9px] text-brand-dark font-medium">{view?.course.code}</span>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-[11px] font-medium text-slate-600">{view?.teacher.name ?? "—"}</td>
              <td className="px-5 py-4 text-[11px] font-medium text-slate-600">{view?.batch.code ?? "—"}</td>
              <td className="px-5 py-4">
                <span className="text-[11px] font-medium text-brand-dark bg-brand-dark/5 px-2 py-0.5 rounded-md">{sched.day}</span>
              </td>
              <td className="px-5 py-4 text-[11px] font-medium text-slate-600">{sched.startTime} – {sched.endTime}</td>
              <td className="px-5 py-4 text-[11px] font-medium text-slate-600">{sched.room}</td>
              <td className="px-5 py-4 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(sched)} className="p-1.5 text-slate-400 hover:text-brand-dark rounded-md hover:bg-slate-100 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteSchedule(sched.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </td>
            </tr>
          );
        })}
      </DataTable>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? "Edit Schedule" : "Add Class Schedule"}
        footer={<>
          <button onClick={() => setIsOpen(false)} className="px-3 py-2 text-[11px] font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-3 py-2 text-[11px] font-medium text-white bg-brand-dark hover:bg-brand-dark/90 rounded-lg shadow-sm transition-all">Save Schedule</button>
        </>}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Classroom <span className="text-red-500">*</span></label>
            <select value={form.classroomId} onChange={e => setForm(f => ({ ...f, classroomId: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
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
              <label className="text-[11px] font-medium text-slate-700">Day <span className="text-red-500">*</span></label>
              <select value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
                {DAYS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Start Time</label>
              <input type="time" value={form.startTime.replace(" AM","").replace(" PM","")} onChange={e => {
                const [h,m] = e.target.value.split(":");
                const hour = parseInt(h);
                const label = `${hour > 12 ? hour-12 : hour}:${m} ${hour >= 12 ? "PM" : "AM"}`;
                setForm(f => ({ ...f, startTime: label }));
              }} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">End Time</label>
              <input type="time" onChange={e => {
                const [h,m] = e.target.value.split(":");
                const hour = parseInt(h);
                const label = `${hour > 12 ? hour-12 : hour}:${m} ${hour >= 12 ? "PM" : "AM"}`;
                setForm(f => ({ ...f, endTime: label }));
              }} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Room</label>
            <input type="text" placeholder="e.g. Room 402" value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
          </div>
        </div>
      </Modal>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, CalendarClock, Clock, MapPin } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";

type Schedule = {
  id: string;
  course: string;
  teacher: string;
  batch: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  status: "Active" | "Upcoming" | "Completed";
};

const initialSchedules: Schedule[] = [
  { id: "1", course: "Database Management System", teacher: "Dr. Alan Turing", batch: "PGDIT Spring 2026", day: "Monday", startTime: "10:00 AM", endTime: "11:30 AM", room: "Room 402", status: "Active" },
  { id: "2", course: "Software Engineering", teacher: "Prof. Sarah Jenkins", batch: "PGDIT Spring 2026", day: "Monday", startTime: "02:00 PM", endTime: "03:30 PM", room: "Room 305", status: "Active" },
  { id: "3", course: "Physics I", teacher: "Dr. Richard Feynman", batch: "BSc CSE Fall 2025", day: "Wednesday", startTime: "09:00 AM", endTime: "11:00 AM", room: "Lab 2", status: "Upcoming" },
];

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredSchedules = schedules.filter(s => 
    s.course.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.batch.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.room.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <PageHeader 
        title="Class Schedules (Routine)" 
        description="Define when and where classes happen. This maps courses to teachers' daily schedules."
      />

      <SearchInput 
        placeholder="Search schedules..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        actionButton={
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 bg-brand-dark text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-all font-medium text-[11px] shadow-sm whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Schedule
          </button>
        }
      />

      <DataTable 
        columns={["Schedule Details", "Time & Location", "Status", "Actions"]}
        isEmpty={filteredSchedules.length === 0}
        emptyStateIcon={CalendarClock}
        emptyStateTitle="No schedules found"
        emptyStateDescription="We couldn't find any class schedules matching your search."
      >
        {filteredSchedules.map((schedule) => (
          <tr key={schedule.id} className="hover:bg-slate-50/80 transition-colors group">
            <td className="px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100 shadow-sm shrink-0 mt-0.5">
                  <CalendarClock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-medium text-[13px] text-slate-900 block mb-1">{schedule.course}</span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] text-slate-500 font-medium">{schedule.teacher}</span>
                    <span className="text-[10px] text-brand-dark/70 font-medium bg-brand-dark/5 px-1.5 py-0.5 rounded-md w-fit border border-brand-dark/10">{schedule.batch}</span>
                  </div>
                </div>
              </div>
            </td>
            <td className="px-5 py-4">
               <div className="space-y-1.5">
                 <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700">
                   <Clock className="w-3.5 h-3.5 text-slate-400" />
                   {schedule.day}, {schedule.startTime} - {schedule.endTime}
                 </div>
                 <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                   <MapPin className="w-3.5 h-3.5 text-slate-400" />
                   {schedule.room}
                 </div>
               </div>
            </td>
            <td className="px-5 py-4">
              <StatusBadge status={schedule.status} />
            </td>
            <td className="px-5 py-4 text-right">
              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 text-slate-400 hover:text-brand-dark rounded-md hover:bg-slate-100 transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Class Schedule"
        footer={
          <>
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="px-3 py-2 text-[11px] font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="px-3 py-2 text-[11px] font-medium text-white bg-brand-dark hover:bg-brand-dark/90 rounded-lg shadow-sm transition-all"
            >
              Save Schedule
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <label className="text-[11px] font-medium text-slate-700">Select Classroom (Course + Batch) <span className="text-red-500">*</span></label>
            <select required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
              <option value="" disabled selected>Select an assigned course</option>
              <option value="DBMS">Database Management System - PGDIT Spring 2026 (Dr. Alan Turing)</option>
              <option value="SE">Software Engineering - PGDIT Spring 2026 (Prof. Sarah Jenkins)</option>
            </select>
            <p className="text-[10px] text-slate-500">This links the schedule to a specific teacher and batch.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Day of Week <span className="text-red-500">*</span></label>
              <select required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Room Number <span className="text-red-500">*</span></label>
              <input required type="text" placeholder="e.g. Room 402" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Start Time <span className="text-red-500">*</span></label>
              <input required type="time" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">End Time <span className="text-red-500">*</span></label>
              <input required type="time" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Status</label>
            <select className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
              <option value="Active">Active</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}

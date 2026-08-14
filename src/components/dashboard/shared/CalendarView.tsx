"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { ChevronLeft, ChevronRight, Clock, BookOpen, AlertCircle, Calendar as CalendarIcon, X } from "lucide-react";
import { CLASSROOM_COLORS } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";

interface CalendarViewProps {
  role: "Admin" | "Teacher" | "Student";
  teacherId?: string;
  studentBatchId?: string; // If role === 'Student'
}

type CalendarEvent = {
  id: string;
  type: "class" | "assignment" | "test";
  title: string;
  time: string;
  dateObj: Date;
  courseName: string;
  batchName: string;
  classroomId: string;
  colorClass: string;
  details?: string;
};

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function CalendarView({ role, teacherId, studentBatchId }: CalendarViewProps) {
  const { classrooms, courses, batches, schedules, assignments, tests } = useStore();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Filter classrooms based on role
  const visibleClassrooms = useMemo(() => {
    return classrooms.filter(c => {
      if (role === "Admin") return true;
      if (role === "Teacher") return c.teacherId === teacherId;
      if (role === "Student") return c.batchId === studentBatchId;
      return false;
    });
  }, [classrooms, role, teacherId, studentBatchId]);

  const visibleClassroomIds = new Set(visibleClassrooms.map(c => c.id));

  // Build events
  const events = useMemo(() => {
    const allEvents: CalendarEvent[] = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    visibleClassrooms.forEach(classroom => {
      const course = courses.find(c => c.id === classroom.courseId);
      const batch = batches.find(b => b.id === classroom.batchId);
      const courseName = course?.code || "Unknown";
      const batchName = batch?.code || "Unknown";
      const color = CLASSROOM_COLORS[classroom.colorIndex % CLASSROOM_COLORS.length].color;

      // 1. Recurring Classes
      const classSchedules = schedules.filter(s => s.classroomId === classroom.id);
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayName = DAYS_OF_WEEK[date.getDay()];
        
        classSchedules.forEach(schedule => {
          if (schedule.day === dayName) {
            allEvents.push({
              id: `class-${schedule.id}-${day}`,
              type: "class",
              title: "Regular Class",
              time: `${schedule.startTime} - ${schedule.endTime}`,
              dateObj: date,
              courseName,
              batchName,
              classroomId: classroom.id,
              colorClass: color,
              details: `Room: ${schedule.room}`
            });
          }
        });
      }

      // 2. Assignments
      const classAssignments = assignments.filter(a => a.classroomId === classroom.id);
      classAssignments.forEach(a => {
        const date = new Date(a.dueDate);
        if (date.getFullYear() === year && date.getMonth() === month) {
          allEvents.push({
            id: `assignment-${a.id}`,
            type: "assignment",
            title: a.title,
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            dateObj: date,
            courseName,
            batchName,
            classroomId: classroom.id,
            colorClass: "bg-purple-500", // Fixed color for assignments
            details: `Marks: ${a.totalMarks}\nStatus: ${a.status}\n${a.description || ""}`
          });
        }
      });

      // 3. Tests
      const classTests = tests.filter(t => t.classroomId === classroom.id);
      classTests.forEach(t => {
        const date = new Date(t.testDate);
        if (date.getFullYear() === year && date.getMonth() === month) {
          allEvents.push({
            id: `test-${t.id}`,
            type: "test",
            title: t.title,
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            dateObj: date,
            courseName,
            batchName,
            classroomId: classroom.id,
            colorClass: "bg-red-500", // Fixed color for tests
            details: `Marks: ${t.totalMarks} | Duration: ${t.duration || "N/A"}\nStatus: ${t.status}\n${t.description || ""}`
          });
        }
      });
    });

    return allEvents;
  }, [currentDate, visibleClassrooms, courses, batches, schedules, assignments, tests]);

  // Calendar Grid Math
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();

  const prevMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => daysInPrevMonth - firstDayOfMonth + i + 1);
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  const remainingCells = 42 - (prevMonthDays.length + currentMonthDays.length);
  const nextMonthDays = Array.from({ length: remainingCells }, (_, i) => i + 1);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const today = () => setCurrentDate(new Date());

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
  };

  return (
    <div className="w-full mx-auto space-y-4 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-brand-dark" />
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Manage your classes, tests, and assignments.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={today} className="px-3 py-1.5 text-[11px] font-medium border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">
            Today
          </button>
          <div className="flex items-center border border-slate-200 rounded-md overflow-hidden">
            <button onClick={prevMonth} className="p-1.5 hover:bg-slate-50 transition-colors"><ChevronLeft className="w-4 h-4 text-slate-600" /></button>
            <div className="w-[1px] h-4 bg-slate-200" />
            <button onClick={nextMonth} className="p-1.5 hover:bg-slate-50 transition-colors"><ChevronRight className="w-4 h-4 text-slate-600" /></button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] font-medium text-slate-600">
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Classes</div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-purple-500" /> Assignments</div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-red-500" /> Tests</div>
      </div>

      {/* Calendar Grid */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/50">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="py-2 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-200 last:border-0">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-[120px]">
          {/* Previous Month */}
          {prevMonthDays.map(day => (
            <div key={`prev-${day}`} className="border-r border-b border-slate-200 bg-slate-50/50 p-1.5 opacity-50 pointer-events-none">
              <span className="text-[11px] font-medium text-slate-400">{day}</span>
            </div>
          ))}

          {/* Current Month */}
          {currentMonthDays.map(day => {
            const dayEvents = events.filter(e => e.dateObj.getDate() === day);
            // Sort events by time conceptually, though time is string
            dayEvents.sort((a, b) => a.time.localeCompare(b.time));

            return (
              <div key={`curr-${day}`} className="border-r border-b border-slate-200 p-1.5 relative overflow-hidden group hover:bg-slate-50 transition-colors">
                <span className={`inline-flex items-center justify-center w-5 h-5 text-[11px] font-semibold rounded-full mb-1 ${isToday(day) ? 'bg-brand-dark text-white' : 'text-slate-700'}`}>
                  {day}
                </span>
                
                <div className="space-y-1 overflow-y-auto max-h-[85px] custom-scrollbar pr-1">
                  {dayEvents.map(event => (
                    <button 
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`w-full text-left px-1.5 py-1 rounded-[4px] text-[9px] font-medium text-white truncate shadow-sm transition-transform hover:scale-[1.02] ${
                        event.type === 'class' ? event.colorClass : event.colorClass
                      }`}
                    >
                      {event.time} - {event.courseName}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Next Month */}
          {nextMonthDays.map(day => (
            <div key={`next-${day}`} className="border-r border-b border-slate-200 bg-slate-50/50 p-1.5 opacity-50 pointer-events-none">
              <span className="text-[11px] font-medium text-slate-400">{day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Event Details Modal */}
      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Event Details" maxWidth="max-w-md">
        {selectedEvent && (
          <div className="space-y-4">
            <div className={`p-3 rounded-xl border ${
              selectedEvent.type === 'test' ? 'bg-red-50 border-red-100' :
              selectedEvent.type === 'assignment' ? 'bg-purple-50 border-purple-100' :
              'bg-slate-50 border-slate-100'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {selectedEvent.type === 'test' ? <AlertCircle className="w-4 h-4 text-red-500" /> :
                 selectedEvent.type === 'assignment' ? <BookOpen className="w-4 h-4 text-purple-500" /> :
                 <Clock className="w-4 h-4 text-blue-500" />}
                <h3 className="text-[13px] font-bold text-slate-900">{selectedEvent.title}</h3>
                <span className="ml-auto text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{selectedEvent.type}</span>
              </div>
              
              <div className="space-y-2 text-[11px] text-slate-700">
                <div className="grid grid-cols-[80px_1fr] gap-2">
                  <span className="text-slate-500 font-medium">Time:</span>
                  <span className="font-semibold">{selectedEvent.time}</span>
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-2">
                  <span className="text-slate-500 font-medium">Course:</span>
                  <span className="font-semibold">{selectedEvent.courseName}</span>
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-2">
                  <span className="text-slate-500 font-medium">Batch:</span>
                  <span className="font-semibold">{selectedEvent.batchName}</span>
                </div>
                {selectedEvent.details && (
                  <div className="pt-2 mt-2 border-t border-slate-200/50 whitespace-pre-wrap leading-relaxed">
                    {selectedEvent.details}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setSelectedEvent(null)} className="px-4 py-2 bg-slate-900 text-white text-[11px] font-medium rounded-lg hover:bg-slate-800 transition-colors">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

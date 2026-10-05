"use client";

import { useState, useMemo, useEffect } from "react";
import { useStore } from "@/lib/store";
import { authStorage } from "@/lib/api";
import { ChevronLeft, ChevronRight, Clock, BookOpen, AlertCircle, Calendar as CalendarIcon, X, Filter } from "lucide-react";
import { CLASSROOM_COLORS } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { CalendarSkeleton } from "@/components/ui/Skeleton";

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
  const { 
    classrooms, courses, batches, schedules, assignments, tests, isLoading,
    fetchClassrooms, fetchCourses, fetchBatches, fetchSchedules, fetchAssignments, fetchTests
  } = useStore();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDayEventsModal, setSelectedDayEventsModal] = useState<{ day: number; dateObj: Date; events: CalendarEvent[] } | null>(null);
  const [eventTypeFilter, setEventTypeFilter] = useState<"all" | "class" | "assignment" | "test">("all");

  // Fetch dynamic API data on initial render and on month change
  useEffect(() => {
    fetchClassrooms(true);
    fetchCourses(true);
    fetchBatches(true);
    fetchSchedules(true);
    fetchAssignments(true);
    fetchTests(true);
  }, [currentDate]);

  // Filter classrooms dynamically based on role and authenticated user
  const visibleClassrooms = useMemo(() => {
    const user = typeof window !== "undefined" ? authStorage.getUser() : null;
    const activeTeacherId = teacherId || user?.id || "teacher-1";

    return classrooms.filter(c => {
      if (role === "Admin") return true;
      if (role === "Teacher") return c.teacherId === activeTeacherId || c.teacherId === "teacher-1" || !teacherId;
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

  const filteredEvents = useMemo(() => {
    if (eventTypeFilter === "all") return events;
    return events.filter((e) => e.type === eventTypeFilter);
  }, [events, eventTypeFilter]);

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
    const todayObj = new Date();
    return day === todayObj.getDate() && currentDate.getMonth() === todayObj.getMonth() && currentDate.getFullYear() === todayObj.getFullYear();
  };

  if (isLoading && classrooms.length === 0) {
    return <CalendarSkeleton />;
  }

  return (
    <div className="w-full mx-auto space-y-4 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
            <CalendarIcon className="w-4 h-4 text-indigo-600" />
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time academic timetable, assignment deadlines, and class tests.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={today} className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs bg-white text-slate-800">
            Today
          </button>
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
            <button onClick={prevMonth} className="p-1.5 hover:bg-slate-50 transition-colors" title="Previous Month"><ChevronLeft className="w-4 h-4 text-slate-600" /></button>
            <div className="w-[1px] h-4 bg-slate-200" />
            <button onClick={nextMonth} className="p-1.5 hover:bg-slate-50 transition-colors" title="Next Month"><ChevronRight className="w-4 h-4 text-slate-600" /></button>
          </div>
        </div>
      </div>

      {/* Legend & Event Type Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-1.5">
          {(["all", "class", "assignment", "test"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setEventTypeFilter(type)}
              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                eventTypeFilter === type
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {type === "all" ? "All Schedule Items" : type === "class" ? "Classes Only" : type === "assignment" ? "Assignments Only" : "Tests Only"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 text-[11px] font-bold text-slate-600">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Regular Classes</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-purple-500" /> Assignments</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-red-500" /> Class Tests</div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/50">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="py-2 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200 last:border-0">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-[125px]">
          {/* Previous Month */}
          {prevMonthDays.map(day => (
            <div key={`prev-${day}`} className="border-r border-b border-slate-200/80 bg-slate-50/50 p-1.5 opacity-40 pointer-events-none">
              <span className="text-[11px] font-medium text-slate-400">{day}</span>
            </div>
          ))}

          {/* Current Month */}
          {currentMonthDays.map(day => {
            const dayEvents = filteredEvents.filter(e => e.dateObj.getDate() === day);
            dayEvents.sort((a, b) => a.time.localeCompare(b.time));
            const hasOverflow = dayEvents.length > 2;
            const visibleEvents = hasOverflow ? dayEvents.slice(0, 2) : dayEvents;

            return (
              <div key={`curr-${day}`} className="border-r border-b border-slate-200/80 p-1.5 relative overflow-hidden group hover:bg-slate-50/80 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className={`inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold rounded-full ${isToday(day) ? 'bg-indigo-600 text-white' : 'text-slate-700'}`}>
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[9px] font-bold text-slate-400">
                      {dayEvents.length} {dayEvents.length === 1 ? "event" : "events"}
                    </span>
                  )}
                </div>
                
                <div className="space-y-1 overflow-y-auto max-h-[90px] custom-scrollbar pr-0.5">
                  {visibleEvents.map(event => (
                    <button 
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`w-full text-left px-1.5 py-1 rounded-[6px] text-[9px] font-bold text-white truncate shadow-2xs transition-transform hover:scale-[1.01] ${
                        event.type === 'class' ? event.colorClass : event.colorClass
                      }`}
                    >
                      {event.time} - {event.courseName}
                    </button>
                  ))}

                  {hasOverflow && (
                    <button
                      onClick={() => setSelectedDayEventsModal({
                        day,
                        dateObj: new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
                        events: dayEvents
                      })}
                      className="w-full text-center px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors border border-indigo-200/60 shadow-2xs"
                    >
                      +{dayEvents.length - 2} more events
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Next Month */}
          {nextMonthDays.map(day => (
            <div key={`next-${day}`} className="border-r border-b border-slate-200/80 bg-slate-50/50 p-1.5 opacity-40 pointer-events-none">
              <span className="text-[11px] font-medium text-slate-400">{day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Overflow Day Schedule Modal (when +N more is clicked) */}
      <Modal
        isOpen={!!selectedDayEventsModal}
        onClose={() => setSelectedDayEventsModal(null)}
        title={`Schedule & Events — ${selectedDayEventsModal ? selectedDayEventsModal.dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""}`}
        maxWidth="max-w-lg"
      >
        {selectedDayEventsModal && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <p className="text-xs text-slate-500 font-medium">
                {selectedDayEventsModal.events.length} classes & academic tasks scheduled on this day:
              </p>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {selectedDayEventsModal.events.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => {
                    setSelectedDayEventsModal(null);
                    setSelectedEvent(ev);
                  }}
                  className="p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-400 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-2xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md text-white ${ev.colorClass}`}>
                      {ev.type}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{ev.time}</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900">{ev.title}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-1 border-t border-slate-100">
                    <span>Course: {ev.courseName}</span>
                    <span>Batch: {ev.batchName}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDayEventsModal(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Close Day Schedule
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Single Event Details Modal */}
      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Event Details" maxWidth="max-w-md">
        {selectedEvent && (
          <div className="space-y-4">
            <div className={`p-3.5 rounded-xl border ${
              selectedEvent.type === 'test' ? 'bg-red-50 border-red-100' :
              selectedEvent.type === 'assignment' ? 'bg-purple-50 border-purple-100' :
              'bg-slate-50 border-slate-100'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {selectedEvent.type === 'test' ? <AlertCircle className="w-4 h-4 text-red-500" /> :
                 selectedEvent.type === 'assignment' ? <BookOpen className="w-4 h-4 text-purple-500" /> :
                 <Clock className="w-4 h-4 text-blue-500" />}
                <h3 className="text-xs font-bold text-slate-900">{selectedEvent.title}</h3>
                <span className="ml-auto text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">{selectedEvent.type}</span>
              </div>
              
              <div className="space-y-2 text-xs text-slate-700">
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
              <button onClick={() => setSelectedEvent(null)} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

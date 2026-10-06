"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Calendar, Clock, RefreshCw, ArrowLeftRight, User, CheckCircle2, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import type { ClassroomView } from "@/lib/types";

interface TeacherRescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialClassroom?: ClassroomView | null;
  initialScheduleId?: string;
}

export default function TeacherRescheduleModal({
  isOpen,
  onClose,
  initialClassroom,
  initialScheduleId,
}: TeacherRescheduleModalProps) {
  const { classrooms, schedules, courses, batches, teachers, createRescheduleRequest, fetchReschedules } = useStore();

  const [requestType, setRequestType] = useState<"Reschedule" | "Swap">("Reschedule");
  
  const initialId = initialClassroom
    ? ("id" in initialClassroom ? String(initialClassroom.id) : String(initialClassroom.classroom?.id || ""))
    : classrooms[0]?.id || "";

  const [selectedClassroomId, setSelectedClassroomId] = useState<string>(initialId);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(initialScheduleId || "");

  const [targetTeacherId, setTargetTeacherId] = useState<string>("");
  const [selectedTargetScheduleId, setSelectedTargetScheduleId] = useState<string>("");

  const [originalDate, setOriginalDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [originalTime, setOriginalTime] = useState<string>("");

  const [newDate, setNewDate] = useState<string>("");
  const [newStartTime, setNewStartTime] = useState<string>("03:00 PM");
  const [newEndTime, setNewEndTime] = useState<string>("04:30 PM");
  const [newRoom, setNewRoom] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Current classroom & schedule details
  const currentClassroom = classrooms.find((c) => c.id === selectedClassroomId);
  const currentCourse = courses.find((co) => co.id === currentClassroom?.courseId);
  const currentBatch = batches.find((ba) => ba.id === currentClassroom?.batchId);

  const myClassroomSchedules = useMemo(() => {
    return schedules.filter((s) => s.classroomId === selectedClassroomId);
  }, [schedules, selectedClassroomId]);

  const currentSchedule = useMemo(() => {
    return (
      myClassroomSchedules.find((s) => s.id === selectedScheduleId) ||
      myClassroomSchedules[0] ||
      null
    );
  }, [myClassroomSchedules, selectedScheduleId]);

  // Update pre-filled original schedule when selected classroom/schedule changes
  useEffect(() => {
    if (currentSchedule) {
      setOriginalTime(`${currentSchedule.startTime} - ${currentSchedule.endTime}`);
      if (!newRoom) {
        setNewRoom(currentSchedule.room || currentClassroom?.room || "");
      }
    } else if (currentClassroom) {
      setOriginalTime("10:00 AM - 11:30 AM");
    }
  }, [currentSchedule, currentClassroom]);

  const currentTeacherId = currentClassroom?.teacherId || "t1000000-0000-4000-a000-000000000001";

  // Target teacher classrooms & schedules for slot swap
  const eligibleSwapTeachers = teachers.filter((t) => t.id !== currentTeacherId);

  const targetTeacherClassrooms = useMemo(() => {
    if (!targetTeacherId) return [];
    return classrooms.filter((c) => c.teacherId === targetTeacherId);
  }, [classrooms, targetTeacherId]);

  const targetTeacherSchedules = useMemo(() => {
    const targetClassroomIds = targetTeacherClassrooms.map((c) => c.id);
    return schedules
      .filter((s) => targetClassroomIds.includes(s.classroomId))
      .map((s) => {
        const classroom = targetTeacherClassrooms.find((c) => c.id === s.classroomId);
        const course = courses.find((co) => co.id === classroom?.courseId);
        const batch = batches.find((ba) => ba.id === classroom?.batchId);
        return {
          ...s,
          classroom,
          course,
          batch,
          displayText: `${course?.code || "Course"} (${batch?.code || "Batch"}) • ${s.day} ${s.startTime} - ${s.endTime} (${s.room || "Room TBA"})`,
        };
      });
  }, [targetTeacherClassrooms, schedules, courses, batches]);

  const selectedTargetSlot = useMemo(() => {
    return targetTeacherSchedules.find((s) => s.id === selectedTargetScheduleId) || targetTeacherSchedules[0] || null;
  }, [targetTeacherSchedules, selectedTargetScheduleId]);

  // Auto-populate proposed slot when a target schedule is selected for swap
  useEffect(() => {
    if (requestType === "Swap" && selectedTargetSlot) {
      setNewStartTime(selectedTargetSlot.startTime);
      setNewEndTime(selectedTargetSlot.endTime);
      setNewRoom(selectedTargetSlot.room || "");
    }
  }, [requestType, selectedTargetSlot]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassroomId || !originalDate || !newDate || !newStartTime || !newEndTime || !reason) {
      alert("Please fill in all required fields.");
      return;
    }

    if (requestType === "Swap" && !targetTeacherId) {
      alert("Please select a target teacher for slot exchange.");
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      await createRescheduleRequest({
        classroomId: selectedClassroomId,
        scheduleId: currentSchedule?.id || initialScheduleId,
        requestType,
        requestedByTeacherId: currentTeacherId,
        targetTeacherId: requestType === "Swap" ? targetTeacherId : undefined,
        targetClassroomId: requestType === "Swap" ? selectedTargetSlot?.classroomId : undefined,
        originalDate,
        originalTime: originalTime || `${currentSchedule?.startTime || "10:00 AM"} - ${currentSchedule?.endTime || "11:30 AM"}`,
        newDate,
        newStartTime,
        newEndTime,
        newRoom: newRoom || currentSchedule?.room || currentClassroom?.room || "Room TBA",
        reason,
      });

      await fetchReschedules(true);
      setSuccessMessage(
        requestType === "Swap"
          ? "Slot exchange request sent successfully! Pending target teacher approval."
          : "Class rescheduled successfully!"
      );

      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessMessage(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      alert("Failed to submit reschedule request: " + err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 md:p-6 overflow-hidden">
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl bg-white shadow-2xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800 flex flex-col transition-all overflow-hidden">
        
        {/* Sticky Fixed Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Class Reschedule & Slot Exchange</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Shift your class timing or request slot swap with another faculty
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          
          {/* Success Alert */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-2.5 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Request Type Selector (Tabs) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setRequestType("Reschedule")}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-lg transition-all ${
                requestType === "Reschedule"
                  ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Simple Class Reschedule</span>
            </button>
            <button
              type="button"
              onClick={() => setRequestType("Swap")}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-lg transition-all ${
                requestType === "Swap"
                  ? "bg-white text-purple-600 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Teacher Slot Swap</span>
            </button>
          </div>

          {/* Two Column Grid for Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Left Column: My Class & Original Timing */}
            <div className="space-y-4 bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                1. My Class & Original Slot
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select My Class / Course <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedClassroomId}
                  onChange={(e) => setSelectedClassroomId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {classrooms.map((c) => {
                    const course = courses.find((co) => co.id === c.courseId);
                    const batch = batches.find((ba) => ba.id === c.batchId);
                    return (
                      <option key={c.id} value={c.id}>
                        {course?.code || "Course"} — {course?.title || "Classroom"} ({batch?.code || c.room})
                      </option>
                    );
                  })}
                </select>
              </div>

              {currentClassroom && (
                <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-900 dark:text-white font-bold">
                    <span>{currentCourse?.code}: {currentCourse?.title}</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{currentBatch?.code || currentBatch?.name}</span>
                  </div>
                  {currentSchedule ? (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-[11px] font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Scheduled: {currentSchedule.day} • {currentSchedule.startTime} - {currentSchedule.endTime}</span>
                      <span>•</span>
                      <span>Room: {currentSchedule.room || currentClassroom.room}</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500">Room: {currentClassroom.room}</div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Original Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={originalDate}
                    onChange={(e) => setOriginalDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Original Time Slot <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={originalTime}
                    onChange={(e) => setOriginalTime(e.target.value)}
                    placeholder="e.g. 10:00 AM - 11:30 AM"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Swap Target Teacher OR Simple Reschedule Info */}
            <div className="space-y-4">
              {requestType === "Swap" ? (
                <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300 flex items-center gap-2">
                    <ArrowLeftRight className="w-4 h-4 text-purple-600" />
                    2. Target Teacher & Slot Deal
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-purple-900 dark:text-purple-300 mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-purple-600" />
                      Select Target Faculty Member <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={targetTeacherId}
                      onChange={(e) => {
                        setTargetTeacherId(e.target.value);
                        setSelectedTargetScheduleId("");
                      }}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    >
                      <option value="">Choose a Faculty Member...</option>
                      {eligibleSwapTeachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.designation || "Faculty"})
                        </option>
                      ))}
                    </select>
                  </div>

                  {targetTeacherId && (
                    <div>
                      <label className="block text-xs font-semibold text-purple-900 dark:text-purple-300 mb-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-purple-600" />
                        Select Target Teacher&apos;s Class Slot to Swap <span className="text-rose-500">*</span>
                      </label>
                      {targetTeacherSchedules.length > 0 ? (
                        <select
                          value={selectedTargetScheduleId}
                          onChange={(e) => setSelectedTargetScheduleId(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        >
                          <option value="">Choose Target Class Slot...</option>
                          {targetTeacherSchedules.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.displayText}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="p-3 text-center text-xs text-amber-700 bg-amber-50 rounded-lg border border-amber-200">
                          No active schedules found for this teacher. You can specify proposed times below.
                        </div>
                      )}
                    </div>
                  )}

                  {targetTeacherId && selectedTargetSlot && (
                    <div className="p-3 bg-white/90 dark:bg-slate-800/90 rounded-xl border border-purple-200 dark:border-purple-800 text-[11px] text-purple-900 dark:text-purple-200 space-y-1 shadow-2xs">
                      <div className="font-bold flex items-center gap-1.5 text-purple-800 dark:text-purple-300">
                        <ArrowLeftRight className="w-3.5 h-3.5 text-purple-600" />
                        <span>Slot Swap Deal Summary:</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <span className="font-bold text-slate-900 dark:text-white">You</span>
                        <ArrowRight className="w-3 h-3 text-purple-500" />
                        <span>Will take <strong>{selectedTargetSlot.course?.code} ({selectedTargetSlot.batch?.code})</strong> slot ({selectedTargetSlot.day} {selectedTargetSlot.startTime})</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <span className="font-bold text-slate-900 dark:text-white">{teachers.find((t) => t.id === targetTeacherId)?.name}</span>
                        <ArrowRight className="w-3 h-3 text-purple-500" />
                        <span>Will take your <strong>{currentCourse?.code} ({currentBatch?.code})</strong> slot ({originalTime})</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    2. Simple Reschedule Directives
                  </h3>
                  <p className="text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed">
                    Use simple reschedule when you want to move your class session to a makeup date or different time slot without exchanging slots with another teacher.
                  </p>
                  <div className="p-3 bg-white/90 dark:bg-slate-800/90 rounded-xl border border-indigo-200 dark:border-indigo-800 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                    <div className="font-bold text-indigo-900 dark:text-indigo-200">Reschedule Workflow:</div>
                    <p>1. Select proposed new date and timing below.</p>
                    <p>2. State reason for students and department records.</p>
                    <p>3. Submit to notify enrolled students on their timetable.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Full Width Section: Proposed Timing & Reason */}
          <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              3. Proposed Reschedule Target Date, Time & Reason
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Proposed Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Start Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  placeholder="03:00 PM"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  End Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  placeholder="04:30 PM"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Room Location
                </label>
                <input
                  type="text"
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  placeholder="Room 402, Bldg C"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Reschedule / Swap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Departmental Conference or Slot Swap agreement"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

        </form>

        {/* Sticky Fixed Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e as any)}
            disabled={isSubmitting}
            className="px-6 py-2 text-xs font-bold rounded-xl bg-brand-dark hover:bg-slate-800 text-white shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>{requestType === "Swap" ? "Send Swap Request" : "Submit Reschedule"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

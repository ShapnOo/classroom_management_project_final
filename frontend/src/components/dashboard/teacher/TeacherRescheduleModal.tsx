"use client";

import React, { useState } from "react";
import { X, Calendar, Clock, RefreshCw, ArrowLeftRight, User, AlertCircle, CheckCircle2 } from "lucide-react";
import { useStore } from "@/lib/store";
import type { ClassReschedule, ClassroomView } from "@/lib/types";

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
  const { classrooms, courses, batches, teachers, createRescheduleRequest, fetchReschedules } = useStore();

  const [requestType, setRequestType] = useState<"Reschedule" | "Swap">("Reschedule");
  const initialId = initialClassroom ? ('id' in initialClassroom ? String(initialClassroom.id) : String(initialClassroom.classroom?.id || "")) : classrooms[0]?.id || "";
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>(initialId);
  const [targetTeacherId, setTargetTeacherId] = useState<string>("");
  const [originalDate, setOriginalDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [originalTime, setOriginalTime] = useState<string>("10:00 AM - 11:30 AM");
  const [newDate, setNewDate] = useState<string>("");
  const [newStartTime, setNewStartTime] = useState<string>("03:00 PM");
  const [newEndTime, setNewEndTime] = useState<string>("04:30 PM");
  const [newRoom, setNewRoom] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentClassroom = classrooms.find(c => c.id === selectedClassroomId);
  const currentRoom = currentClassroom?.room || (initialClassroom && 'classroom' in initialClassroom ? initialClassroom.classroom.room : "Room TBA");
  const currentTeacherId = currentClassroom?.teacherId || "t1000000-0000-4000-a000-000000000001";

  // Available target teachers for swap (excluding current teacher)
  const eligibleSwapTeachers = teachers.filter(t => t.id !== currentTeacherId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassroomId || !originalDate || !newDate || !newStartTime || !newEndTime || !reason) {
      alert("Please fill in all required fields.");
      return;
    }

    if (requestType === "Swap" && !targetTeacherId) {
      alert("Please select a target teacher to request slot exchange.");
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      await createRescheduleRequest({
        classroomId: selectedClassroomId,
        scheduleId: initialScheduleId,
        requestType,
        requestedByTeacherId: currentTeacherId,
        targetTeacherId: requestType === "Swap" ? targetTeacherId : undefined,
        originalDate,
        originalTime,
        newDate,
        newStartTime,
        newEndTime,
        newRoom: newRoom || currentRoom || "Room TBA",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800 p-6 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Class Reschedule & Slot Exchange</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Shift your class timing or request slot swap with another faculty</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-2.5 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Request Type Selector (Tabs) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setRequestType("Reschedule")}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                requestType === "Reschedule"
                  ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Simple Reschedule</span>
            </button>
            <button
              type="button"
              onClick={() => setRequestType("Swap")}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                requestType === "Swap"
                  ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Teacher Slot Swap</span>
            </button>
          </div>

          {/* Select Classroom */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Class / Course <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedClassroomId}
              onChange={e => setSelectedClassroomId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {classrooms.map(c => {
                const course = courses.find(co => co.id === c.courseId);
                const batch = batches.find(ba => ba.id === c.batchId);
                return (
                  <option key={c.id} value={c.id}>
                    {course?.code || "Course"} — {course?.title || "Classroom"} ({batch?.code || c.room})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Swap Target Teacher Selection */}
          {requestType === "Swap" && (
            <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
              <label className="block text-xs font-semibold text-indigo-900 dark:text-indigo-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                Select Target Faculty Member for Swap <span className="text-rose-500">*</span>
              </label>
              <select
                value={targetTeacherId}
                onChange={e => setTargetTeacherId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">Choose a Faculty Member...</option>
                {eligibleSwapTeachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.designation || "Faculty"})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-indigo-600 dark:text-indigo-400">
                An invitation will be sent to this teacher to swap their class slot with yours.
              </p>
            </div>
          )}

          {/* Original Schedule Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Original Class Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={originalDate}
                onChange={e => setOriginalDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Original Time Slot
              </label>
              <input
                type="text"
                value={originalTime}
                onChange={e => setOriginalTime(e.target.value)}
                placeholder="e.g. 10:00 AM - 11:30 AM"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* New Proposed Schedule Row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Proposed Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
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
                onChange={e => setNewStartTime(e.target.value)}
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
                onChange={e => setNewEndTime(e.target.value)}
                placeholder="04:30 PM"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Proposed Room */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Proposed Room Location (Optional)
            </label>
            <input
              type="text"
              value={newRoom}
              onChange={e => setNewRoom(e.target.value)}
              placeholder={`Default: ${currentRoom || 'Room 402, Bldg C'}`}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reason for Reschedule / Swap <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Department Academic Committee Meeting / Academic Conference Attendance"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

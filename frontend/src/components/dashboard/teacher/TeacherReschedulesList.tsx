"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { CURRENT_TEACHER_ID } from "@/lib/seedData";
import { ClassReschedule } from "@/lib/types";
import {
  Calendar,
  Clock,
  ArrowRightLeft,
  CalendarDays,
  Check,
  X,
  Plus,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  User,
  MapPin,
  RefreshCw
} from "lucide-react";
import TeacherRescheduleModal from "./TeacherRescheduleModal";

export default function TeacherReschedulesList() {
  const { reschedules, fetchReschedules, respondRescheduleRequest } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "my_requests" | "incoming_swaps">("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Filter reschedules
  const filteredReschedules = reschedules.filter((r) => {
    if (activeTab === "my_requests") {
      return r.teacher_id === CURRENT_TEACHER_ID;
    }
    if (activeTab === "incoming_swaps") {
      return r.target_teacher_id === CURRENT_TEACHER_ID;
    }
    return true;
  });

  const incomingSwapsCount = reschedules.filter(
    (r) => r.target_teacher_id === CURRENT_TEACHER_ID && r.status === "pending"
  ).length;

  const handleRespond = async (id: string, status: "approved" | "rejected" | "cancelled") => {
    setProcessingId(id);
    try {
      await respondRescheduleRequest(id, status);
    } catch (err) {
      console.error("Failed to update reschedule status:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: ClassReschedule["status"]) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
            <XCircle className="w-3 h-3 text-rose-600" />
            Rejected
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
            <HelpCircle className="w-3 h-3 text-slate-500" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            Pending Approval
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-brand-dark" />
            Class Reschedules & Slot Swaps
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Request date/time changes or exchange class timings with other faculty members
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchReschedules()}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refresh Reschedules"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-dark hover:bg-slate-800 text-white px-3 py-2 rounded-lg text-[11px] font-medium transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            New Reschedule / Swap
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2 text-xs">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            activeTab === "all"
              ? "bg-white text-brand-dark shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          All Requests ({reschedules.length})
        </button>
        <button
          onClick={() => setActiveTab("my_requests")}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            activeTab === "my_requests"
              ? "bg-white text-brand-dark shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          My Requests ({reschedules.filter((r) => r.teacher_id === CURRENT_TEACHER_ID).length})
        </button>
        <button
          onClick={() => setActiveTab("incoming_swaps")}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors relative ${
            activeTab === "incoming_swaps"
              ? "bg-white text-brand-dark shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Incoming Swaps
          {incomingSwapsCount > 0 && (
            <span className="ml-1.5 bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {incomingSwapsCount}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-4 divide-y divide-slate-100">
        {filteredReschedules.length === 0 ? (
          <div className="py-12 text-center">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-700">No reschedule or swap requests found</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Click &quot;New Reschedule / Swap&quot; to submit a class time change request.
            </p>
          </div>
        ) : (
          filteredReschedules.map((req) => {
            const isMyRequest = req.teacher_id === CURRENT_TEACHER_ID;
            const isTargetTeacher = req.target_teacher_id === CURRENT_TEACHER_ID;
            const isPending = req.status === "pending";

            return (
              <div key={req.id} className="py-4 first:pt-0 last:pb-0 hover:bg-slate-50/60 p-3 rounded-lg transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  
                  {/* Left Column: Info & Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          req.type === "teacher_swap"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {req.type === "teacher_swap" ? "Teacher Slot Swap" : "Class Reschedule"}
                      </span>
                      {getStatusBadge(req.status)}
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-900">
                        {req.course_code}: {req.course_title}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {req.batch_name} • Requested by: <span className="font-semibold text-slate-700">{req.teacher_name || "Faculty"}</span>
                      </p>
                    </div>

                    {/* Compare original vs proposed */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 text-[11px]">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">
                          Original Slot
                        </span>
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{req.original_date} ({req.original_day})</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{req.original_start_time} - {req.original_end_time}</span>
                          <span className="text-slate-400">•</span>
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{req.room}</span>
                        </div>
                      </div>

                      <div className="border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3">
                        <span className="text-[10px] font-semibold text-brand-dark uppercase tracking-wide block mb-0.5">
                          Proposed Reschedule Slot
                        </span>
                        <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-brand-dark" />
                          <span>{req.target_date} ({req.target_day})</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-brand-dark" />
                          <span>{req.target_start_time} - {req.target_end_time}</span>
                          {req.target_room && (
                            <>
                              <span className="text-slate-400">•</span>
                              <MapPin className="w-3 h-3 text-brand-dark" />
                              <span>{req.target_room}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Swap partner or reason */}
                    <div className="text-[11px] text-slate-600 space-y-1">
                      {req.target_teacher_name && (
                        <div className="flex items-center gap-1.5 font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-100 w-fit">
                          <ArrowRightLeft className="w-3 h-3 text-purple-600" />
                          <span>Swap Partner: {req.target_teacher_name}</span>
                        </div>
                      )}
                      {req.reason && (
                        <p className="text-slate-500 italic">
                          &quot;{req.reason}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-row md:flex-col items-end justify-center gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0">
                    {/* Incoming Swap Request Action Buttons */}
                    {isTargetTeacher && isPending && (
                      <div className="flex items-center gap-2">
                        <button
                          disabled={processingId === req.id}
                          onClick={() => handleRespond(req.id, "approved")}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md text-[11px] font-semibold transition-colors shadow-sm flex items-center gap-1 disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Accept Swap
                        </button>
                        <button
                          disabled={processingId === req.id}
                          onClick={() => handleRespond(req.id, "rejected")}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" />
                          Decline
                        </button>
                      </div>
                    )}

                    {/* Created by Me Action Button */}
                    {isMyRequest && isPending && (
                      <button
                        disabled={processingId === req.id}
                        onClick={() => handleRespond(req.id, "cancelled")}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors disabled:opacity-50"
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <TeacherRescheduleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}

"use client";

import { 
  ListTodo,
  Search,
  FileCheck,
  Clock,
  Send,
  X,
  CheckCircle2,
  BookOpen
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { CURRENT_STUDENT_BATCH_ID } from "@/lib/seedData";

export default function StudentAssignments() {
  const {
    classrooms, courses, assignments, fetchClassrooms, fetchCourses, fetchAssignments
  } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Submitted">("All");

  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedIds, setSubmittedIds] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchClassrooms();
    fetchCourses();
    fetchAssignments();
  }, []);

  const myClassroomIds = classrooms.filter((c) => c.batchId === CURRENT_STUDENT_BATCH_ID).map((c) => c.id);

  const studentAssignments = assignments.filter(
    (a) => !a.classroomId || myClassroomIds.includes(a.classroomId)
  );

  const formattedAssignments = useMemo(() => {
    return studentAssignments.map((a) => {
      const classroom = classrooms.find((c) => c.id === a.classroomId);
      const course = courses.find((co) => co.id === classroom?.courseId);
      const isSubmitted = submittedIds.includes(a.id) || a.status === "Completed";

      return {
        id: a.id,
        classroomId: a.classroomId,
        title: a.title,
        description: a.description || "Course Assignment Task",
        dueDate: new Date(a.dueDate).toLocaleDateString("en-GB"),
        totalMarks: a.totalMarks,
        submissions: a.submissions,
        status: isSubmitted ? "Submitted" : a.status,
        courseCode: course?.code || "Course",
        courseTitle: course?.title || "Classroom Assignment",
      };
    });
  }, [studentAssignments, classrooms, courses, submittedIds]);

  const filtered = useMemo(() => {
    return formattedAssignments.filter((a) => {
      if (statusFilter !== "All" && a.status !== statusFilter) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.courseCode.toLowerCase().includes(q) ||
        a.courseTitle.toLowerCase().includes(q)
      );
    });
  }, [formattedAssignments, statusFilter, searchQuery]);

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !submissionText.trim()) {
      alert("Please enter submission response text.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.submitStudentAssignment(selectedAssignment.id, selectedAssignment.classroomId, submissionText);
      setSubmittedIds((prev) => [...prev, selectedAssignment.id]);
      setSuccessMessage("Assignment submitted successfully!");

      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessMessage(null);
        setSelectedAssignment(null);
        setSubmissionText("");
      }, 1200);
    } catch (err: any) {
      alert("Failed to submit assignment: " + err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full mx-auto space-y-5 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-brand-dark" />
            Course Assignments & Submissions
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            View active assignment deadlines, submit your work online, and track grades
          </p>
        </div>

        {/* Search Input Box */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search assignments by title or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400 shadow-xs"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs bg-slate-50 p-2 rounded-xl border border-slate-200">
        {(["All", "Active", "Submitted"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === tab
                ? "bg-brand-dark text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {tab === "All" ? `All Assignments (${formattedAssignments.length})` : tab === "Active" ? `Active Due (${formattedAssignments.filter(a => a.status === "Active").length})` : `Submitted (${formattedAssignments.filter(a => a.status === "Submitted").length})`}
          </button>
        ))}
      </div>

      {/* Clean Table List View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Assignment Title</th>
                <th className="px-5 py-3.5">Course</th>
                <th className="px-5 py-3.5">Due Date</th>
                <th className="px-5 py-3.5">Total Marks</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <ListTodo className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No assignments found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">No assignment tasks match your filter.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0">
                          <FileCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-brand-dark transition-colors">{a.title}</p>
                          <p className="text-[10px] text-slate-400 font-normal">{a.description}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {a.courseCode}
                        </span>
                        <span className="text-slate-600 line-clamp-1">{a.courseTitle}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-700">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{a.dueDate}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-bold text-slate-900">
                      {a.totalMarks} Marks
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-700">
                      {a.status === "Submitted" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Submitted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3 text-purple-600 animate-pulse" /> Active Due
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {a.status === "Submitted" ? (
                        <span className="text-[11px] text-slate-400 font-medium italic">Submitted</span>
                      ) : (
                        <button
                          onClick={() => setSelectedAssignment(a)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-dark hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-all shadow-2xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Solution</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  {selectedAssignment.courseCode} Assignment
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{selectedAssignment.title}</h3>
              </div>
              <button onClick={() => setSelectedAssignment(null)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMessage && (
              <div className="mt-3 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitAssignment} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Submission Text / Online Response <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Type your submission response, GitHub repository link, or drive URL here..."
                  className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-brand-dark hover:bg-slate-800 text-white shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

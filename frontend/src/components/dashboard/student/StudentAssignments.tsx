"use client";

import { 
  ListTodo,
  Search,
  FileCheck,
  Clock,
  Send,
  X,
  CheckCircle2,
  UploadCloud,
  FileText,
  FileCode,
  Paperclip,
  Trash2,
  ExternalLink,
  Award,
  MessageSquare,
  AlertCircle,
  Download,
  Eye
} from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { CURRENT_STUDENT_BATCH_ID } from "@/lib/seedData";

interface AttachedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
}

export default function StudentAssignments() {
  const {
    classrooms, courses, assignments, fetchClassrooms, fetchCourses, fetchAssignments
  } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Submitted" | "Graded" | "Overdue">("All");

  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedDataMap, setSubmittedDataMap] = useState<Record<string, any>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchClassrooms();
    fetchCourses();
    fetchAssignments();
    loadStudentSubmissions();
  }, []);

  const loadStudentSubmissions = async () => {
    try {
      const remoteData = await api.getStudentAssignments();
      if (Array.isArray(remoteData)) {
        const map: Record<string, any> = {};
        remoteData.forEach((item: any) => {
          if (item.student_submission_status && item.student_submission_status !== "Active") {
            map[item.id] = item;
          }
        });
        setSubmittedDataMap(map);
      }
    } catch (err) {
      console.log("Using local state fallback for assignment submissions.");
    }
  };

  const myClassroomIds = classrooms.filter((c) => c.batchId === CURRENT_STUDENT_BATCH_ID).map((c) => c.id);

  const studentAssignments = assignments.filter(
    (a) => !a.classroomId || myClassroomIds.includes(a.classroomId)
  );

  const formattedAssignments = useMemo(() => {
    return studentAssignments.map((a) => {
      const classroom = classrooms.find((c) => c.id === a.classroomId);
      const course = courses.find((co) => co.id === classroom?.courseId);
      const subRecord = submittedDataMap[a.id];

      const dueDateObj = new Date(a.dueDate);
      const isPastDue = dueDateObj < new Date();

      let status: string = a.status;
      if (subRecord) {
        status = subRecord.student_submission_status || (subRecord.obtained_marks ? "Graded" : "Submitted");
      } else if (isPastDue) {
        status = "Overdue";
      } else {
        status = "Active";
      }

      return {
        id: a.id,
        classroomId: a.classroomId,
        title: a.title,
        description: a.description || "Complete the assigned tasks following instructions and submit document files.",
        dueDate: dueDateObj.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
        dueDateObj,
        totalMarks: a.totalMarks || 20,
        submissions: a.submissions || 0,
        status,
        courseCode: course?.code || "CSE-301",
        courseTitle: course?.title || "Database System & Web Development",
        submissionDetails: subRecord || null,
      };
    });
  }, [studentAssignments, classrooms, courses, submittedDataMap]);

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

  const handleOpenSubmissionModal = (assignment: any) => {
    setSelectedAssignment(assignment);
    const existing = assignment.submissionDetails;

    if (existing) {
      setSubmissionText(existing.submission_text || existing.feedback || "");
      setGithubUrl(existing.github_url || "");
      if (existing.attachment_urls && Array.isArray(existing.attachment_urls)) {
        setAttachedFiles(existing.attachment_urls);
      } else {
        setAttachedFiles([
          {
            id: "att-1",
            name: `${assignment.title.replace(/\s+/g, "_")}_Solution.pdf`,
            size: "2.4 MB",
            type: "application/pdf",
            url: "#"
          }
        ]);
      }
    } else {
      setSubmissionText("");
      setGithubUrl("");
      setAttachedFiles([]);
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles: AttachedFile[] = Array.from(files).map((file, i) => ({
      id: `file-${Date.now()}-${i}`,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      type: file.type || "application/octet-stream",
      url: URL.createObjectURL(file)
    }));

    setAttachedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    if (attachedFiles.length === 0 && !submissionText.trim() && !githubUrl.trim()) {
      alert("Please upload at least one document file or provide a written submission / link.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.submitStudentAssignment(
        selectedAssignment.id,
        selectedAssignment.classroomId,
        submissionText,
        attachedFiles,
        githubUrl
      );

      setSubmittedDataMap((prev) => ({
        ...prev,
        [selectedAssignment.id]: {
          student_submission_status: "Submitted",
          submission_text: submissionText,
          github_url: githubUrl,
          attachment_urls: attachedFiles,
          submitted_at: new Date().toISOString()
        }
      }));

      setSuccessMessage("Assignment submitted successfully with document attachments!");

      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessMessage(null);
        setSelectedAssignment(null);
      }, 1400);
    } catch (err: any) {
      alert("Failed to submit assignment: " + err.message);
      setIsSubmitting(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <FileText className="w-4 h-4 text-rose-500" />;
    if (["zip", "rar", "7z"].includes(ext || "")) return <Paperclip className="w-4 h-4 text-amber-500" />;
    if (["js", "ts", "py", "java", "cpp", "html", "css"].includes(ext || "")) return <FileCode className="w-4 h-4 text-indigo-500" />;
    return <FileText className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="w-full mx-auto space-y-5 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-brand-dark" />
            Course Assignments & Document Submissions
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            View course assignment requirements, attach PDF/ZIP documents, submit code repositories, and track teacher grades & feedback
          </p>
        </div>

        {/* Search Input Box */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400 shadow-xs"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 text-xs bg-slate-50 p-2 rounded-xl border border-slate-200">
        {(["All", "Active", "Submitted", "Graded", "Overdue"] as const).map((tab) => {
          const count = formattedAssignments.filter((a) => tab === "All" || a.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === tab
                  ? "bg-brand-dark text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {tab === "All" ? `All (${count})` : `${tab} (${count})`}
            </button>
          );
        })}
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
                    <p className="text-[11px] text-slate-400 mt-0.5">No assignment tasks match your selected filter.</p>
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
                          <p className="text-[10px] text-slate-400 font-normal line-clamp-1">{a.description}</p>
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
                      {a.status === "Graded" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                          <Award className="w-3 h-3 text-blue-600" /> Graded
                        </span>
                      ) : a.status === "Submitted" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Submitted
                        </span>
                      ) : a.status === "Overdue" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                          <AlertCircle className="w-3 h-3 text-rose-600" /> Overdue
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
                          <Clock className="w-3 h-3 text-purple-600 animate-pulse" /> Active Due
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {a.status === "Graded" ? (
                        <button
                          onClick={() => handleOpenSubmissionModal(a)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold text-xs rounded-lg transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Grade & Feedback</span>
                        </button>
                      ) : a.status === "Submitted" ? (
                        <button
                          onClick={() => handleOpenSubmissionModal(a)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold text-xs rounded-lg transition-all"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>View / Edit Submission</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenSubmissionModal(a)}
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

      {/* Submission & Document Upload Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden flex flex-col my-8 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                    {selectedAssignment.courseCode}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    Total: <strong className="text-slate-900">{selectedAssignment.totalMarks} Marks</strong>
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    Due: <strong className="text-slate-900">{selectedAssignment.dueDate}</strong>
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{selectedAssignment.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedAssignment(null)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">

              {/* Success Notification */}
              {successMessage && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2.5 animate-in fade-in duration-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Assignment Instructions / Description */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-brand-dark" />
                  Teacher Instructions & Details
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedAssignment.description}
                </p>
                
                {/* Reference File Download from Teacher */}
                <div className="pt-2 flex items-center gap-2">
                  <span className="text-[11px] font-medium text-slate-500">Reference Guide:</span>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); alert("Downloading reference attachment: " + selectedAssignment.title + "_Guide.pdf"); }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200/60"
                  >
                    <Download className="w-3 h-3" />
                    <span>{selectedAssignment.title}_Guide.pdf</span>
                  </a>
                </div>
              </div>

              {/* Graded Feedback Banner if already evaluated */}
              {selectedAssignment.status === "Graded" && selectedAssignment.submissionDetails && (
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-blue-600" />
                      Teacher Evaluation & Score
                    </span>
                    <span className="text-xs font-extrabold text-blue-800 bg-white px-3 py-1 rounded-lg border border-blue-200 shadow-2xs">
                      {selectedAssignment.submissionDetails.obtained_marks || selectedAssignment.totalMarks * 0.9} / {selectedAssignment.totalMarks} Marks
                    </span>
                  </div>
                  {selectedAssignment.submissionDetails.feedback && (
                    <div className="mt-2 text-xs text-blue-800 bg-white/70 p-3 rounded-lg border border-blue-100 italic flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <span>"{selectedAssignment.submissionDetails.feedback}"</span>
                    </div>
                  )}
                </div>
              )}

              {/* Submission Form */}
              <form onSubmit={handleSubmitAssignment} className="space-y-5">
                
                {/* Document Upload Zone */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <UploadCloud className="w-4 h-4 text-brand-dark" />
                      Attach Solution Documents (PDF, DOCX, ZIP, Code)
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Max size: 25 MB per file</span>
                  </label>

                  {/* Drag and Drop Box */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      handleFileUpload(e.dataTransfer.files);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                      isDragOver
                        ? "border-brand-dark bg-brand-dark/5"
                        : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      accept=".pdf,.docx,.doc,.zip,.rar,.txt,.js,.ts,.py,.java,.cpp,.png,.jpg"
                    />
                    <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
                    <p className="text-xs font-bold text-slate-700">
                      Click to browse or drag & drop files here
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Supports PDF documents, DOCX reports, source code ZIP files, and diagrams
                    </p>
                  </div>

                  {/* Attached File List */}
                  {attachedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-[11px] font-bold text-slate-700">Attached Documents ({attachedFiles.length}):</p>
                      <div className="space-y-1.5">
                        {attachedFiles.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs"
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              {getFileIcon(file.name)}
                              <span className="font-semibold text-slate-800 truncate">{file.name}</span>
                              <span className="text-[10px] text-slate-400 font-normal shrink-0">({file.size})</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => { if(file.url === "#") { e.preventDefault(); alert("Opening preview for " + file.name); } }}
                                className="p-1 text-slate-400 hover:text-brand-dark transition-colors"
                                title="Preview / Open"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </a>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(file.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                title="Remove File"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Online Solution Text / Submission Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Written Explanation / Answer Text / Submission Notes
                  </label>
                  <textarea
                    rows={3}
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Provide a summary of your solution, project steps, or answer description..."
                    className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark focus:outline-none placeholder:text-slate-400"
                  />
                </div>

                {/* External GitHub / Project Link */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      GitHub Repository / Google Drive / Live Demo URL (Optional)
                    </span>
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username/project-repo"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark focus:outline-none placeholder:text-slate-400"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedAssignment(null)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-brand-dark hover:bg-slate-800 text-white shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{selectedAssignment.status === "Submitted" ? "Update Submission" : "Submit Assignment"}</span>
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

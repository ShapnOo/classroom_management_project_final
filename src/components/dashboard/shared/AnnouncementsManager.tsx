"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import type { Announcement, AnnouncementAudienceType } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { Bell, Plus, Search, Calendar, Megaphone, Edit2, Trash2, Globe, Users, BookOpen, AlertCircle } from "lucide-react";

interface AnnouncementsManagerProps {
  role: "Admin" | "Teacher";
  authorId: string;
  authorName: string;
}

type Form = Omit<Announcement, "id" | "authorId" | "authorName" | "authorRole" | "date">;

const EMPTY_FORM: Form = {
  title: "",
  content: "",
  audienceType: "Global",
  status: "Published",
  priority: "Normal",
};

export default function AnnouncementsManager({ role, authorId, authorName }: AnnouncementsManagerProps) {
  const { announcements, programs, batches, courses, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useStore();
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState<Form>(EMPTY_FORM);

  // Filter announcements based on role & search
  const filtered = announcements.filter(a => {
    // Basic search
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status.toLowerCase() === statusFilter;
    
    // Auth filter: Admin sees all. Teacher sees their own, OR those directed at their courses/batches (mocking simple for now: teachers see all Global + their own authored + everything else since teachers need to be informed too, but they can only *edit/delete* their own).
    // Let's just show all for this mock if they are Published, or if it's authored by them.
    const isVisible = role === "Admin" || a.status === "Published" || a.authorId === authorId;
    
    return matchesSearch && matchesStatus && isVisible;
  });

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setIsOpen(true);
  };

  const openEdit = (a: Announcement) => {
    setEditing(a);
    setForm({
      title: a.title,
      content: a.content,
      audienceType: a.audienceType,
      programId: a.programId,
      batchId: a.batchId,
      courseId: a.courseId,
      status: a.status,
      priority: a.priority,
    });
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!form.title || !form.content) return;
    
    if (editing) {
      updateAnnouncement(editing.id, { ...form });
    } else {
      addAnnouncement({
        ...form,
        date: new Date().toISOString(),
        authorId,
        authorName,
        authorRole: role,
      });
    }
    setIsOpen(false);
  };

  const AudienceIcon = ({ type, className = "w-4 h-4" }: { type: AnnouncementAudienceType, className?: string }) => {
    switch (type) {
      case "Global": return <Globe className={className} />;
      case "Program": return <Megaphone className={className} />;
      case "Batch": return <Users className={className} />;
      case "Course": return <BookOpen className={className} />;
    }
  };

  return (
    <div className="w-full mx-auto space-y-4 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-[13px] font-medium text-slate-900">Announcements</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Manage and broadcast updates to students and staff.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" placeholder="Search announcements..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-2 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-md text-[11px] font-medium outline-none focus:border-brand-dark w-full sm:w-auto cursor-pointer">
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
          <button onClick={openAdd} className="flex items-center gap-1.5 bg-brand-dark text-white px-3 py-1.5 rounded-md hover:bg-slate-800 transition-all font-medium text-[11px] shadow-sm whitespace-nowrap shrink-0">
            <Plus className="w-3.5 h-3.5" /> New Announcement
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <h3 className="text-[13px] font-medium text-slate-900">No Announcements Found</h3>
            <p className="text-[11px] text-slate-500 mt-1">There are no announcements matching your filters.</p>
          </div>
        ) : (
          filtered.map(a => (
            <div key={a.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-brand-dark/30 hover:shadow-sm transition-all group flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-[13px] font-semibold text-slate-900">{a.title}</h3>
                  {a.priority === "High" && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-red-50 text-red-600 flex items-center gap-1 border border-red-100">
                      <AlertCircle className="w-2.5 h-2.5" /> High Priority
                    </span>
                  )}
                  {a.status === "Draft" && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">Draft</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap">{a.content}</p>
                <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(a.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-brand-dark/10 flex items-center justify-center text-brand-dark font-medium text-[8px]">
                      {a.authorName.charAt(0)}
                    </div>
                    {a.authorName} ({a.authorRole})
                  </div>
                  <div className="flex items-center gap-1">
                    <AudienceIcon type={a.audienceType} className="w-3 h-3 text-brand-dark/60" />
                    <span className="font-medium text-slate-600">
                      {a.audienceType}
                      {a.audienceType === "Program" && a.programId && ` — ${programs.find(p => p.id === a.programId)?.code}`}
                      {a.audienceType === "Batch" && a.batchId && ` — ${batches.find(b => b.id === a.batchId)?.code}`}
                      {a.audienceType === "Course" && a.courseId && ` — ${courses.find(c => c.id === a.courseId)?.code}`}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              {(role === "Admin" || a.authorId === authorId) && (
                <div className="flex sm:flex-col gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(a)} className="p-1.5 text-slate-400 hover:text-brand-dark hover:bg-brand-dark/5 rounded-md transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteAnnouncement(a.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? "Edit Announcement" : "New Announcement"} maxWidth="max-w-2xl"
        footer={<>
          <button onClick={() => setIsOpen(false)} className="px-3 py-2 text-[11px] font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-3 py-2 text-[11px] font-medium text-white bg-brand-dark hover:bg-brand-dark/90 rounded-lg shadow-sm transition-all">{editing ? "Update" : "Publish"}</button>
        </>}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Title <span className="text-red-500">*</span></label>
            <input type="text" placeholder="e.g. Welcome to Spring 2026" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Message Content <span className="text-red-500">*</span></label>
            <textarea rows={5} placeholder="Write your announcement here..." value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all custom-scrollbar resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Form["priority"] }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
                <option value="Normal">Normal</option>
                <option value="High">High Priority</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Form["status"] }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
                <option value="Published">Published</option>
                <option value="Draft">Draft (Hidden)</option>
              </select>
            </div>
          </div>
          
          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-[11px] font-semibold text-slate-800 mb-3">Target Audience</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-700">Audience Scope <span className="text-red-500">*</span></label>
                <select value={form.audienceType} onChange={e => setForm(f => ({ ...f, audienceType: e.target.value as Form["audienceType"], programId: undefined, batchId: undefined, courseId: undefined }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
                  <option value="Global">Global (Everyone)</option>
                  <option value="Program">Specific Program</option>
                  <option value="Batch">Specific Batch</option>
                  <option value="Course">Specific Course</option>
                </select>
              </div>

              {form.audienceType !== "Global" && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-700">Program <span className="text-red-500">*</span></label>
                  <select value={form.programId || ""} onChange={e => setForm(f => ({ ...f, programId: e.target.value, batchId: undefined, courseId: undefined }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
                    <option value="">Select a program</option>
                    {programs.map(p => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
                  </select>
                </div>
              )}
              
              {(form.audienceType === "Batch" || form.audienceType === "Course") && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-700">Batch <span className="text-red-500">*</span></label>
                  <select value={form.batchId || ""} onChange={e => setForm(f => ({ ...f, batchId: e.target.value, courseId: undefined }))} disabled={!form.programId} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all disabled:bg-slate-50 disabled:text-slate-400">
                    <option value="">Select a batch</option>
                    {batches.filter(b => b.programId === form.programId).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              )}
              
              {form.audienceType === "Course" && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-700">Course <span className="text-red-500">*</span></label>
                  <select value={form.courseId || ""} onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))} disabled={!form.batchId} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all disabled:bg-slate-50 disabled:text-slate-400">
                    <option value="">Select a course</option>
                    {(() => {
                      const selectedBatch = batches.find(b => b.id === form.batchId);
                      const validCourseIds = selectedBatch?.batchCourses?.map(bc => bc.courseId) || [];
                      const batchCourses = (selectedBatch?.batchCourses && selectedBatch.batchCourses.length > 0)
                        ? courses.filter(c => validCourseIds.includes(c.id))
                        : courses.filter(c => c.programId === form.programId);
                      return batchCourses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>);
                    })()}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

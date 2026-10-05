"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import type { Student, StudentDocument } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { Plus, Search, Edit2, Trash2, Mail, Users, Hash, Phone, Paperclip, FileText } from "lucide-react";

export default function AdminStudents() {
  const { students, batches, programs, addStudent, updateStudent, deleteStudent } = useStore();
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  
  const [form, setForm] = useState<{
    name: string;
    email: string;
    rollNo: string;
    programId: string;
    batchId: string;
    phone: string;
    documents: StudentDocument[];
  }>({
    name: "",
    email: "",
    rollNo: "",
    programId: "",
    batchId: "",
    phone: "",
    documents: [],
  });

  const filtered = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.email.toLowerCase().includes(search.toLowerCase()) ||
                          s.rollNo.toLowerCase().includes(search.toLowerCase());
    const batch = batches.find(b => b.id === s.batchId);
    const matchesProgram = programFilter === "all" || batch?.programId === programFilter;
    const matchesBatch = batchFilter === "all" || s.batchId === batchFilter;
    return matchesSearch && matchesProgram && matchesBatch;
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", email: "", rollNo: "", programId: "", batchId: "", phone: "", documents: [] });
    setIsOpen(true);
  };

  const openEdit = (s: Student) => {
    setEditing(s);
    const batch = batches.find(b => b.id === s.batchId);
    setForm({ 
      name: s.name, 
      email: s.email, 
      rollNo: s.rollNo, 
      programId: batch?.programId || "", 
      batchId: s.batchId, 
      phone: s.phone || "",
      documents: s.documents || []
    });
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email || !form.rollNo || !form.batchId) return;
    
    const payload = { ...form };
    delete (payload as any).programId;
    if (!payload.phone) delete (payload as any).phone;
    
    if (editing) {
      updateStudent(editing.id, { ...payload, id: editing.id } as Student);
    } else {
      addStudent(payload as Omit<Student, "id">);
    }
    setIsOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setForm(f => ({
        ...f,
        documents: [
          ...f.documents,
          {
            id: crypto.randomUUID(),
            title: "",
            fileName: file.name,
            fileData: base64,
          }
        ]
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="w-full mx-auto space-y-4 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-[13px] font-medium text-slate-900">Students</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Manage enrolled students across all batches.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400" />
          </div>
          <select value={programFilter} onChange={e => { setProgramFilter(e.target.value); setBatchFilter("all"); }} className="px-2 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-md text-[11px] font-medium outline-none focus:border-brand-dark w-full sm:w-auto cursor-pointer">
            <option value="all">All Programs</option>
            {programs.map(p => (
              <option key={p.id} value={p.id}>{p.code}</option>
            ))}
          </select>
          <select value={batchFilter} onChange={e => setBatchFilter(e.target.value)} disabled={programFilter === "all"} className="px-2 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-md text-[11px] font-medium outline-none focus:border-brand-dark w-full sm:w-auto cursor-pointer disabled:bg-slate-50 disabled:text-slate-400">
            <option value="all">All Batches</option>
            {batches.filter(b => b.programId === programFilter).map(b => (
              <option key={b.id} value={b.id}>{b.code}</option>
            ))}
          </select>
          <button onClick={openAdd} className="flex items-center gap-1.5 bg-brand-dark text-white px-3 py-1.5 rounded-md hover:bg-slate-800 transition-all font-medium text-[11px] shadow-sm whitespace-nowrap shrink-0">
            <Plus className="w-3.5 h-3.5" /> Add Student
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map(s => {
          const batch = batches.find(b => b.id === s.batchId);
          return (
            <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-brand-dark/30 hover:shadow-sm transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-dark/10 flex items-center justify-center text-brand-dark font-medium text-[12px]">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-[13px] font-semibold text-slate-900">{s.name}</h3>
                      <p className="text-[10px] text-slate-500 font-medium">Roll: {s.rollNo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(s)} className="p-1 text-slate-400 hover:text-brand-dark hover:bg-brand-dark/5 rounded transition-colors"><Edit2 className="w-3 h-3" /></button>
                    <button onClick={() => deleteStudent(s.id)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
                
                <div className="space-y-1.5 mt-4">
                  <div className="flex items-center gap-2 text-[11px] text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {s.email}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-600">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {batch?.code || "Unknown Batch"}
                  </div>
                  {s.phone && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {s.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
            <p className="text-[12px] text-slate-500">No students found matching your criteria.</p>
          </div>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? "Edit Student" : "Add Student"} maxWidth="max-w-md"
        footer={<>
          <button onClick={() => setIsOpen(false)} className="px-3 py-2 text-[11px] font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-3 py-2 text-[11px] font-medium text-white bg-brand-dark hover:bg-brand-dark/90 rounded-lg shadow-sm transition-all">{editing ? "Update" : "Add Student"}</button>
        </>}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Full Name <span className="text-red-500">*</span></label>
            <input type="text" placeholder="e.g. Alice Johnson" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:border-brand-dark transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Roll No <span className="text-red-500">*</span></label>
              <input type="text" placeholder="e.g. 26-001" value={form.rollNo} onChange={e => setForm(f => ({ ...f, rollNo: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:border-brand-dark transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Program <span className="text-red-500">*</span></label>
              <SearchableSelect
                value={form.programId}
                onChange={val => setForm(f => ({ ...f, programId: val, batchId: "" }))}
                options={programs.map(p => ({ value: p.id, label: p.code }))}
                placeholder="Select Program"
                allowClear
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Batch <span className="text-red-500">*</span></label>
              <SearchableSelect
                value={form.batchId}
                onChange={val => setForm(f => ({ ...f, batchId: val }))}
                disabled={!form.programId}
                options={batches.filter(b => b.programId === form.programId).map(b => ({ value: b.id, label: b.code }))}
                placeholder="Select Batch"
                allowClear
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Email Address <span className="text-red-500">*</span></label>
            <input type="email" placeholder="e.g. alice@edu" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:border-brand-dark transition-colors" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Phone (Optional)</label>
            <input type="text" placeholder="e.g. +1 555-0100" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:border-brand-dark transition-colors" />
          </div>

          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[11px] font-semibold text-slate-800">Documents</h3>
                <p className="text-[10px] text-slate-500">e.g. Payment Slip, NID</p>
              </div>
              <label className="flex items-center gap-1.5 bg-brand-dark/5 text-brand-dark px-2.5 py-1.5 rounded-md hover:bg-brand-dark/10 transition-colors cursor-pointer text-[11px] font-medium">
                <Plus className="w-3.5 h-3.5" /> Add Document
                <input type="file" accept=".pdf,image/*" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
            
            <div className="space-y-2">
              {form.documents.length === 0 ? (
                <div className="text-center py-4 bg-slate-50 border border-slate-200 border-dashed rounded-lg">
                  <p className="text-[11px] text-slate-500">No documents added yet.</p>
                </div>
              ) : (
                form.documents.map((doc, idx) => (
                  <div key={doc.id} className="flex flex-col sm:flex-row gap-2 items-center bg-slate-50/50 p-2 rounded-lg border border-slate-200 shadow-sm group">
                    <div className="flex-1 w-full flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Document Title (e.g. Payment Slip)" 
                        value={doc.title}
                        onChange={e => setForm(f => ({
                          ...f,
                          documents: f.documents.map((d, i) => i === idx ? { ...d, title: e.target.value } : d)
                        }))}
                        className="flex-1 px-2 py-1 text-[11px] bg-transparent border-b border-transparent focus:border-brand-dark focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-between sm:justify-end">
                      <span className="text-[10px] text-slate-500 truncate max-w-[100px]" title={doc.fileName}>{doc.fileName}</span>
                      <button 
                        type="button" 
                        onClick={() => setForm(f => ({ ...f, documents: f.documents.filter((_, i) => i !== idx) }))}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <p className="text-[9px] text-slate-500 mt-2">Max size 2MB per file. Supports PDF and Images.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import type { Student, StudentDocument } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import {
  Plus, Search, Edit2, Trash2, Mail, Users, Phone, FileText,
  Download, Upload, AlertTriangle, CheckCircle, FileSpreadsheet
} from "lucide-react";

export default function AdminStudents() {
  const { students, batches, programs, addStudent, updateStudent, deleteStudent, fetchStudents, fetchBatches, fetchPrograms } = useStore();
  
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [docFilter, setDocFilter] = useState<"all" | "with_doc" | "without_doc">("all");

  useEffect(() => {
    fetchStudents();
    fetchBatches();
    fetchPrograms();
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  
  const [fileError, setFileError] = useState("");
  const [bulkStatus, setBulkStatus] = useState<string>("");

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
    
    const hasDoc = s.documents && s.documents.length > 0;
    const matchesDoc = docFilter === "all" || 
                       (docFilter === "with_doc" && hasDoc) || 
                       (docFilter === "without_doc" && !hasDoc);

    return matchesSearch && matchesProgram && matchesBatch && matchesDoc;
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
    if (!form.name || !form.email || !form.rollNo || !form.batchId || !form.phone) return;
    
    const payload = { ...form };
    delete (payload as any).programId;
    
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
      setFileError("File size must be less than 2MB.");
      return;
    }
    setFileError("");

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

  // Download Sample Bulk Upload CSV Template
  const handleDownloadTemplate = () => {
    const headers = "Full Name,Roll No,Program Code,Batch Code,Email Address,Phone\n";
    const sampleRows = [
      "Abdur Rahman,FA26-001,B.Sc. CS,FA26-C,abdur.rahman@ju.edu.bd,+8801711000001",
      "Fatema Begum,FA26-002,B.Sc. CS,FA26-C,fatema.begum@ju.edu.bd,+8801711000002",
      "Tariqul Islam,FA26-003,B.Sc. CS,FA26-C,tariqul.islam@ju.edu.bd,+8801711000003",
    ].join("\n");

    const blob = new Blob([headers + sampleRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "student_bulk_import_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Process Bulk File Upload (Excel / CSV)
  const handleBulkFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length <= 1) {
        setBulkStatus("Error: File is empty or missing content.");
        return;
      }

      // Header parsing for dynamic column indexing
      const headerParts = lines[0].toLowerCase().split(",").map(h => h.trim().replace(/^["']|["']$/g, ''));
      let nameIdx = headerParts.findIndex(h => h.includes("name"));
      let rollIdx = headerParts.findIndex(h => h.includes("roll"));
      let progIdx = headerParts.findIndex(h => h.includes("program"));
      let batchIdx = headerParts.findIndex(h => h.includes("batch"));
      let emailIdx = headerParts.findIndex(h => h.includes("email"));
      let phoneIdx = headerParts.findIndex(h => h.includes("phone"));

      if (nameIdx === -1) nameIdx = 0;
      if (rollIdx === -1) rollIdx = 1;
      if (progIdx === -1) progIdx = 2;
      if (batchIdx === -1) batchIdx = 3;
      if (emailIdx === -1) emailIdx = 4;
      if (phoneIdx === -1) phoneIdx = 5;

      let importedCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(",").map(p => p.trim().replace(/^["']|["']$/g, ''));
        if (parts.length >= 3) {
          const name = parts[nameIdx] || "Student Name";
          const rollNo = parts[rollIdx] || `FA26-${String(i).padStart(3, '0')}`;
          const batchCode = parts[batchIdx] || "";
          const email = parts[emailIdx] || `student${i}@ju.edu.bd`;
          const phone = parts[phoneIdx] || `+88017000000${i}`;

          const foundBatch = batches.find(b => b.code.toLowerCase() === batchCode.toLowerCase() || b.name.toLowerCase() === batchCode.toLowerCase());
          const batchId = foundBatch ? foundBatch.id : (batches[0]?.id || "");

          if (rollNo && name && email && batchId) {
            addStudent({
              name,
              email,
              rollNo,
              batchId,
              phone,
              documents: [] // Documents missing initially -> will be highlighted in table row
            });
            importedCount++;
          }
        }
      }

      setBulkStatus(`Successfully imported ${importedCount} student records!`);
      setTimeout(() => {
        setIsBulkOpen(false);
        setBulkStatus("");
      }, 2000);
    };

    reader.readAsText(file);
    e.target.value = "";
  };
      }, 2000);
    };

    reader.readAsText(file);
    e.target.value = "";
  };

  const missingDocsCount = students.filter(s => !s.documents || s.documents.length === 0).length;

  return (
    <div className="w-full mx-auto space-y-4 pb-8 text-xs font-normal text-slate-800">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-sm font-semibold text-slate-900">Student Directory</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Manage enrolled students ({students.length} Total • <strong className="text-amber-700 font-semibold">{missingDocsCount} Missing Documents</strong>).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download Template Button */}
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg font-medium text-[11px] shadow-2xs transition-all"
            title="Download CSV Excel Template for Bulk Upload"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" /> Download Template
          </button>

          {/* Bulk Upload Button */}
          <button
            onClick={() => setIsBulkOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg font-medium text-[11px] shadow-2xs transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" /> Bulk Upload Excel/CSV
          </button>

          {/* Add Student Button */}
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg font-medium text-[11px] shadow-2xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Student
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, roll or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Program Filter */}
          <select
            value={programFilter}
            onChange={e => { setProgramFilter(e.target.value); setBatchFilter("all"); }}
            className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-medium outline-none focus:border-slate-400 cursor-pointer"
          >
            <option value="all">All Programs</option>
            {programs.map(p => (
              <option key={p.id} value={p.id}>{p.code}</option>
            ))}
          </select>

          {/* Batch Filter */}
          <select
            value={batchFilter}
            onChange={e => setBatchFilter(e.target.value)}
            disabled={programFilter === "all"}
            className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-medium outline-none focus:border-slate-400 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="all">All Batches</option>
            {batches.filter(b => b.programId === programFilter).map(b => (
              <option key={b.id} value={b.id}>{b.code}</option>
            ))}
          </select>

          {/* Document Status Filter */}
          <select
            value={docFilter}
            onChange={e => setDocFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-medium outline-none focus:border-slate-400 cursor-pointer"
          >
            <option value="all">All Documents</option>
            <option value="with_doc">With Document (Uploaded)</option>
            <option value="without_doc">Without Document (Missing)</option>
          </select>
        </div>
      </div>

      {/* Table View */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-300 text-[10px] uppercase tracking-wider font-semibold text-slate-700">
                <th className="py-2.5 px-3.5 text-center w-10 border-r border-slate-200">SL</th>
                <th className="py-2.5 px-3.5 border-r border-slate-200">Roll No.</th>
                <th className="py-2.5 px-3.5 border-r border-slate-200 min-w-[150px]">Student Name</th>
                <th className="py-2.5 px-3.5 border-r border-slate-200">Email Address</th>
                <th className="py-2.5 px-3.5 border-r border-slate-200 text-center">Batch</th>
                <th className="py-2.5 px-3.5 border-r border-slate-200">Phone</th>
                <th className="py-2.5 px-3.5 border-r border-slate-200 text-center">Document Status</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((s, idx) => {
                const batch = batches.find(b => b.id === s.batchId);
                const hasDocs = s.documents && s.documents.length > 0;

                return (
                  <tr
                    key={s.id}
                    className={`transition-colors ${
                      !hasDocs
                        ? "bg-amber-50/80 border-l-4 border-l-amber-400 hover:bg-amber-100/70"
                        : "bg-white hover:bg-slate-50/80"
                    }`}
                  >
                    <td className="py-2.5 px-3.5 text-center text-slate-500 font-mono text-[11px] border-r border-slate-200/60">{idx + 1}</td>
                    <td className="py-2.5 px-3.5 font-mono font-medium text-slate-900 border-r border-slate-200/60">{s.rollNo}</td>
                    <td className="py-2.5 px-3.5 border-r border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-semibold text-[11px]">
                          {s.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-900">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-700 border-r border-slate-200/60">{s.email}</td>
                    <td className="py-2.5 px-3.5 text-center border-r border-slate-200/60">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {batch?.code || "FA26-C"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-600 border-r border-slate-200/60">{s.phone || "—"}</td>
                    <td className="py-2.5 px-3.5 text-center border-r border-slate-200/60">
                      {hasDocs ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> {s.documents?.length || 0} File(s)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                          <AlertTriangle className="w-3 h-3 text-amber-600" /> Document Missing
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(s)}
                          title="Edit / Manage Documents"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteStudent(s.id)}
                          title="Delete Student"
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-400 bg-slate-50">
            No students found matching your search and filter criteria.
          </div>
        )}
      </div>

      {/* MODAL 1: BULK EXCEL / CSV UPLOAD */}
      <Modal
        isOpen={isBulkOpen}
        onClose={() => { setIsBulkOpen(false); setBulkStatus(""); }}
        title="Bulk Upload Students (Excel / CSV)"
        maxWidth="max-w-md"
        footer={
          <button
            onClick={() => { setIsBulkOpen(false); setBulkStatus(""); }}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        }
      >
        <div className="space-y-4 text-xs font-normal">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Excel / CSV Template Format
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Upload your spreadsheet containing columns: <strong>Roll No, Full Name, Email, Phone, Batch Code</strong>. Student documents can be uploaded later manually.
            </p>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="text-[11px] text-emerald-700 hover:underline font-medium inline-flex items-center gap-1"
            >
              <Download className="w-3 h-3" /> Download Sample CSV Template
            </button>
          </div>

          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <span className="block text-xs font-semibold text-slate-800">Choose Excel or CSV File</span>
            <span className="block text-[10px] text-slate-500 mt-0.5">Supports .csv, .xlsx, .xls</span>

            <label className="mt-3 inline-block bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 rounded-lg text-xs font-medium cursor-pointer shadow-2xs transition-all">
              Browse File
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                className="hidden"
                onChange={handleBulkFileSelected}
              />
            </label>
          </div>

          {bulkStatus && (
            <div className={`p-3 rounded-lg border text-xs font-medium text-center ${
              bulkStatus.startsWith("Successfully")
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}>
              {bulkStatus}
            </div>
          )}
        </div>
      </Modal>

      {/* MODAL 2: ADD / EDIT SINGLE STUDENT */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editing ? "Edit Student Record" : "Add New Student"}
        maxWidth="max-w-md"
        footer={
          <>
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-all"
            >
              {editing ? "Update Student" : "Add Student"}
            </button>
          </>
        }
      >
        <div className="space-y-3.5 text-xs font-normal">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-700">Full Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="e.g. Alice Johnson"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">Roll No <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="e.g. FA26-001"
                value={form.rollNo}
                onChange={e => setForm(f => ({ ...f, rollNo: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-500 transition-colors font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">Program <span className="text-red-500">*</span></label>
              <SearchableSelect
                value={form.programId}
                onChange={val => setForm(f => ({ ...f, programId: val, batchId: "" }))}
                options={programs.map(p => ({ value: p.id, label: p.code }))}
                placeholder="Select Program"
                allowClear
              />
            </div>
          </div>

          <div className="space-y-1">
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

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-700">Email Address <span className="text-red-500">*</span></label>
            <input
              type="email"
              placeholder="e.g. alice@ju.edu.bd"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-500 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-700">Phone (Optional)</label>
            <input
              type="text"
              placeholder="e.g. +8801700000000"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-500 transition-colors"
            />
          </div>

          {/* Documents Section */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-slate-900">Student Documents</h3>
                <p className="text-[10px] text-slate-500">Attach verification documents (NID, Certificate, Slip)</p>
              </div>
              <label className="flex items-center gap-1.5 bg-slate-100 text-slate-800 border border-slate-300 px-2.5 py-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer text-xs font-medium">
                <Plus className="w-3.5 h-3.5" /> Upload File
                <input type="file" accept=".pdf,image/*" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>

            {fileError && <p className="text-[11px] text-red-600 font-medium">{fileError}</p>}

            <div className="space-y-2 max-h-36 overflow-y-auto">
              {form.documents.length === 0 ? (
                <div className="text-center py-3 bg-amber-50/60 border border-amber-200 border-dashed rounded-lg">
                  <p className="text-[11px] text-amber-800 font-medium flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> No document attached yet (Row will be highlighted).
                  </p>
                </div>
              ) : (
                form.documents.map((doc, idx) => (
                  <div key={doc.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                      <input 
                        type="text" 
                        placeholder="Doc Title (e.g. NID)" 
                        value={doc.title}
                        onChange={e => setForm(f => ({
                          ...f,
                          documents: f.documents.map((d, i) => i === idx ? { ...d, title: e.target.value } : d)
                        }))}
                        className="px-2 py-0.5 text-xs bg-white border border-slate-200 rounded flex-1 focus:outline-none focus:border-slate-400"
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setForm(f => ({ ...f, documents: f.documents.filter((_, i) => i !== idx) }))}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";

type Batch = {
  id: string;
  batchCode: string;
  name: string;
  program: string;
  session: string;
  status: "Active" | "Upcoming" | "Completed";
};

const initialBatches: Batch[] = [
  { id: "1", batchCode: "B28", name: "Batch 28", program: "PGDIT", session: "Fall 2025", status: "Active" },
  { id: "2", batchCode: "B29", name: "Batch 29", program: "PGDIT", session: "Fall 2025", status: "Active" },
  { id: "3", batchCode: "B30", name: "Batch 30", program: "BSc CSE", session: "Spring 2026", status: "Upcoming" },
];

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>(initialBatches);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredBatches = batches.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.session.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <PageHeader 
        title="Batches" 
        description="Manage student batches within specific programs and sessions."
      />

      <SearchInput 
        placeholder="Search batches..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        actionButton={
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 bg-brand-dark text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-all font-medium text-[11px] shadow-sm whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Batch
          </button>
        }
      />

      <DataTable 
        columns={["Batch Code", "Batch Name", "Program", "Session", "Status", "Actions"]}
        isEmpty={filteredBatches.length === 0}
        emptyStateIcon={Users}
        emptyStateTitle="No batches found"
        emptyStateDescription="We couldn't find any batches matching your search."
      >
        {filteredBatches.map((batch) => (
          <tr key={batch.id} className="hover:bg-slate-50/80 transition-colors group">
            <td className="px-5 py-4">
              <span className="font-semibold text-brand-dark bg-brand-dark/5 px-2 py-0.5 rounded-md text-[11px] border border-brand-dark/10">
                {batch.batchCode}
              </span>
            </td>
            <td className="px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium text-[11px] text-slate-900">{batch.name}</span>
              </div>
            </td>
            <td className="px-5 py-4 text-[11px] font-medium text-slate-600">{batch.program}</td>
            <td className="px-5 py-4 text-[11px] font-medium text-slate-600">{batch.session}</td>
            <td className="px-5 py-4">
              <StatusBadge status={batch.status} />
            </td>
            <td className="px-5 py-4 text-right">
              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 text-slate-400 hover:text-brand-dark rounded-md hover:bg-slate-100 transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Batch"
        footer={
          <>
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="px-3 py-2 text-[11px] font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="px-3 py-2 text-[11px] font-medium text-white bg-brand-dark hover:bg-brand-dark/90 rounded-lg shadow-sm transition-all"
            >
              Save Batch
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Batch Code</label>
              <input type="text" placeholder="e.g. B28" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Batch Name</label>
              <input type="text" placeholder="e.g. Batch 28" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
          </div>
          
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Assign to Program <span className="text-red-500">*</span></label>
              <select required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
                <option value="" disabled selected>Select a program</option>
                <option value="PGDIT">PGDIT</option>
                <option value="BSc CSE">BSc in Computer Science</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Assign to Session <span className="text-red-500">*</span></label>
              <select required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
                <option value="" disabled selected>Select a session</option>
                <option value="Fall 2025">Fall 2025</option>
                <option value="Spring 2026">Spring 2026</option>
              </select>
            </div>
            <p className="text-[10px] text-slate-500">A batch must be linked to both a specific academic program and session.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Status</label>
            <select className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
              <option value="Upcoming">Upcoming</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}

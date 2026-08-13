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
  name: string;
  session: string;
  status: "Active" | "Upcoming" | "Completed";
  studentCount: number;
};

const initialBatches: Batch[] = [
  { id: "1", name: "Batch 28", session: "Fall 2025", status: "Active", studentCount: 45 },
  { id: "2", name: "Batch 29", session: "Fall 2025", status: "Upcoming", studentCount: 0 },
  { id: "3", name: "Batch 27", session: "Spring 2025", status: "Completed", studentCount: 42 },
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
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Academic Batches" 
        description="Manage student batches and assign them to sessions."
        actionButton={
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-brand-dark text-white px-4 py-2.5 rounded-lg hover:bg-brand-dark/90 transition-all font-medium text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Batch
          </button>
        }
      />

      <SearchInput 
        placeholder="Search batches by name or session..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        totalCount={batches.length}
        totalLabel="Total Batches"
      />

      <DataTable 
        columns={["Batch Name", "Session", "Students", "Status", "Actions"]}
        isEmpty={filteredBatches.length === 0}
        emptyStateIcon={Users}
        emptyStateTitle="No batches found"
        emptyStateDescription="We couldn't find any batches matching your search."
      >
        {filteredBatches.map((batch) => (
          <tr key={batch.id} className="hover:bg-slate-50/80 transition-colors group">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100 shadow-sm">
                  <Users className="w-4 h-4" />
                </div>
                <span className="font-medium text-slate-900">{batch.name}</span>
              </div>
            </td>
            <td className="px-6 py-4 text-sm text-slate-600">{batch.session}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{batch.studentCount} Students</td>
            <td className="px-6 py-4">
              <StatusBadge status={batch.status} />
            </td>
            <td className="px-6 py-4 text-right">
              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-slate-400 hover:text-brand-dark rounded-lg hover:bg-slate-100 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
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
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2.5 text-sm font-medium text-white bg-brand-dark hover:bg-brand-dark/90 rounded-lg shadow-sm transition-all"
            >
              Save Batch
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Batch Name</label>
            <input type="text" placeholder="e.g. Batch 28" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Assign Session</label>
            <select className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all bg-white text-slate-600">
              <option value="" disabled selected>Select a session</option>
              <option value="Fall 2025">Fall 2025</option>
              <option value="Spring 2025">Spring 2025</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Status</label>
            <select className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all bg-white text-slate-600">
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

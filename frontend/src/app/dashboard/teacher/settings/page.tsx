"use client";

import { useState } from "react";
import { Settings, Bell, Lock, Shield, Save, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import ModalDialog from "@/components/ui/ModalDialog";

export default function TeacherSettingsPage() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [classAlerts, setClassAlerts] = useState(true);
  const [gradeAlerts, setGradeAlerts] = useState(true);
  const [saved, setSaved] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-10">
      <PageHeader 
        title="Teacher Settings" 
        description="Manage your notification preferences and account security options."
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-2xl space-y-6">
        
        {/* Notification Settings */}
        <div>
          <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="w-4 h-4 text-brand-dark" />
            Notification Preferences
          </h3>
          <div className="mt-4 space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
              <div>
                <p className="text-[12px] font-medium text-slate-900">Email Notifications</p>
                <p className="text-[10px] text-slate-500">Receive email summaries for new class submissions and system announcements.</p>
              </div>
              <input 
                type="checkbox" 
                checked={emailNotifs} 
                onChange={e => setEmailNotifs(e.target.checked)} 
                className="w-4 h-4 rounded text-brand-dark focus:ring-brand-dark"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
              <div>
                <p className="text-[12px] font-medium text-slate-900">Class Routine Reminders</p>
                <p className="text-[10px] text-slate-500">Get alerted 15 minutes before your scheduled live classes.</p>
              </div>
              <input 
                type="checkbox" 
                checked={classAlerts} 
                onChange={e => setClassAlerts(e.target.checked)} 
                className="w-4 h-4 rounded text-brand-dark focus:ring-brand-dark"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
              <div>
                <p className="text-[12px] font-medium text-slate-900">Evaluation Alerts</p>
                <p className="text-[10px] text-slate-500">Notify when students submit pending assignments or class tests.</p>
              </div>
              <input 
                type="checkbox" 
                checked={gradeAlerts} 
                onChange={e => setGradeAlerts(e.target.checked)} 
                className="w-4 h-4 rounded text-brand-dark focus:ring-brand-dark"
              />
            </label>
          </div>
        </div>

        {/* Security Options */}
        <div>
          <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Lock className="w-4 h-4 text-brand-dark" />
            Security & Authentication
          </h3>
          <div className="mt-4 space-y-3">
            <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <p className="text-[12px] font-medium text-slate-900">Password</p>
                <p className="text-[10px] text-slate-500">Last updated 30 days ago</p>
              </div>
              <button 
                onClick={() => setModalOpen(true)} 
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded text-[11px] font-medium shadow-xs transition-colors"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-dark text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-all shadow-xs"
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Saved Successfully
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Preferences
              </>
            )}
          </button>
        </div>

      </div>

      <ModalDialog
        isOpen={modalOpen}
        title="Password Reset Email Sent"
        message="A secure password reset link has been dispatched to your registered university email address."
        type="success"
        onConfirm={() => setModalOpen(false)}
      />
    </div>
  );
}

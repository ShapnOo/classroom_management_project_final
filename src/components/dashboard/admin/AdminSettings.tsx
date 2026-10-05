"use client";

import React, { useState, useEffect } from "react";
import { Settings2, Building2, BookOpen, Bell, Shield, Save, Upload, GraduationCap, X } from "lucide-react";
import { useStore } from "@/lib/store";

export default function AdminSettings() {
  const { settings, updateSettings } = useStore();
  const [activeTab, setActiveTab] = useState("general");

  // Academic Policies State
  const [missingSubmissionRule, setMissingSubmissionRule] = useState("zero");
  const [attendanceThreshold, setAttendanceThreshold] = useState("60");
  const [passThreshold, setPassThreshold] = useState("40");
  const [roundingRule, setRoundingRule] = useState("standard");
  const [gradingScale, setGradingScale] = useState("standard");

  // General Settings State
  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [logoBase64, setLogoBase64] = useState(settings.logoBase64);

  // Sync state if settings change externally
  useEffect(() => {
    setSchoolName(settings.schoolName);
    setLogoBase64(settings.logoBase64);
  }, [settings]);

  const tabs = [
    { id: "general", label: "General Setup", icon: Building2 },
    { id: "academic", label: "Academic Policies", icon: BookOpen },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security & Roles", icon: Shield },
  ];

  const handleSave = () => {
    if (activeTab === "general") {
      updateSettings({ schoolName, logoBase64 });
    }
    alert("Settings saved successfully!");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) { // 1MB limit for logo
      alert("Logo size must be less than 1MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="w-full mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Global Settings</h1>
          <p className="text-xs text-slate-500 mt-1">Manage institutional configurations and academic rules.</p>
        </div>
        <button 
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-dark text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === tab.id 
                    ? "bg-brand-dark text-white" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-white/80" : "text-slate-400"}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === "academic" && (
            <div className="space-y-6">
              
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-100 px-5 py-4">
                  <h2 className="text-[13px] font-medium text-slate-900 flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-slate-500" />
                    Global Grading Policies
                  </h2>
                  <p className="text-[10px] text-slate-500 mt-1">These rules apply strictly across all classes and departments in the institution.</p>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Grading Scale */}
                  <div className="space-y-3 p-4 border border-slate-100 bg-slate-50/50 rounded-xl">
                    <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">Master Grading Scale</label>
                    <select 
                      value={gradingScale}
                      onChange={(e) => setGradingScale(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[11px] outline-none focus:border-brand-dark bg-white"
                    >
                      <option value="standard">Standard A+ to F (80-100 = A+)</option>
                      <option value="strict">Strict A to F (90-100 = A)</option>
                      <option value="custom">Custom Configuration...</option>
                    </select>
                    <p className="text-[9px] text-slate-400">Determines how final percentages convert into Letter Grades and GPA.</p>
                  </div>

                  {/* Missing Submissions */}
                  <div className="space-y-3 p-4 border border-slate-100 bg-slate-50/50 rounded-xl">
                    <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">Missing Submissions</label>
                    <select 
                      value={missingSubmissionRule}
                      onChange={(e) => setMissingSubmissionRule(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[11px] outline-none focus:border-brand-dark bg-white"
                    >
                      <option value="zero">Treat unexcused as Zero (0)</option>
                      <option value="ignore">Exclude from average calculation</option>
                    </select>
                    <p className="text-[9px] text-slate-400">Institutional policy for handling missing class tests and assignments.</p>
                  </div>

                  {/* Rounding Rule */}
                  <div className="space-y-3 p-4 border border-slate-100 bg-slate-50/50 rounded-xl">
                    <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">Final Mark Rounding</label>
                    <select 
                      value={roundingRule}
                      onChange={(e) => setRoundingRule(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[11px] outline-none focus:border-brand-dark bg-white"
                    >
                      <option value="standard">Standard (79.5 rounds to 80)</option>
                      <option value="floor">Floor (79.9 rounds to 79)</option>
                      <option value="ceiling">Ceiling (Always round up)</option>
                    </select>
                    <p className="text-[9px] text-slate-400">Global rounding logic before grading scale is applied.</p>
                  </div>

                  {/* Attendance Threshold */}
                  <div className="space-y-3 p-4 border border-slate-100 bg-slate-50/50 rounded-xl">
                    <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">Min. Attendance Threshold</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        min="0"
                        max="100"
                        value={attendanceThreshold}
                        onChange={(e) => setAttendanceThreshold(e.target.value)}
                        className="w-16 px-2 py-2 text-center border border-slate-200 rounded-lg text-[11px] outline-none focus:border-brand-dark bg-white font-semibold"
                      />
                      <span className="text-[11px] font-medium text-slate-700">% required</span>
                    </div>
                    <p className="text-[9px] text-slate-400">If student attendance is below this %, they auto-fail the course globally.</p>
                  </div>

                  {/* Final Exam Threshold */}
                  <div className="space-y-3 p-4 border border-slate-100 bg-slate-50/50 rounded-xl md:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">Final Exam Minimum Pass Mark</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        min="0"
                        max="100"
                        value={passThreshold}
                        onChange={(e) => setPassThreshold(e.target.value)}
                        className="w-16 px-2 py-2 text-center border border-slate-200 rounded-lg text-[11px] outline-none focus:border-brand-dark bg-white font-semibold"
                      />
                      <span className="text-[11px] font-medium text-slate-700">% required to pass</span>
                    </div>
                    <p className="text-[9px] text-slate-400">Student must score this minimum % in the Final Exam to pass the course, regardless of total marks.</p>
                  </div>

                </div>
              </div>

            </div>
          )}

          {activeTab === "general" && (
            <div className="flex-1 max-w-3xl space-y-6">
              
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-sm font-semibold text-slate-800">Institution Identity</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">Customize how your institution appears across the system.</p>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Institution Name */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-700">Institution Name</label>
                    <input 
                      type="text" 
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="e.g. Jahangirnagar University"
                      className="w-full max-w-md px-3 py-2 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:border-brand-dark transition-colors"
                    />
                  </div>

                  {/* Institution Logo */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-700">Institution Logo</label>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50">
                        {logoBase64 ? (
                          <img src={logoBase64} alt="Institution Logo" className="w-full h-full object-contain" />
                        ) : (
                          <GraduationCap className="w-6 h-6 text-slate-300" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-[11px] font-medium cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
                          <Upload className="w-3.5 h-3.5" /> Upload Image
                          <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                        </label>
                        {logoBase64 && (
                          <button 
                            onClick={() => setLogoBase64("")}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 ml-2 bg-red-50 text-red-600 rounded-lg text-[11px] font-medium hover:bg-red-100 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" /> Remove
                          </button>
                        )}
                        <p className="text-[10px] text-slate-500">Recommended: Square format (PNG/JPG), max 1MB.</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}
          
          {activeTab === "notifications" && (
            <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <Bell className="w-8 h-8 text-slate-300 mb-3" />
              <h3 className="text-sm font-medium text-slate-900">Notifications</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">Configure email templates and system alerts.</p>
            </div>
          )}
          
          {activeTab === "security" && (
            <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <Shield className="w-8 h-8 text-slate-300 mb-3" />
              <h3 className="text-sm font-medium text-slate-900">Security & Roles</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">Manage API keys, role permissions, and session timeouts.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

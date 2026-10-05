"use client";

import { useState } from "react";
import { GraduationCap, ChevronDown, ChevronRight, LogOut } from "lucide-react";
import { adminMenu, teacherMenu, studentMenu, MenuItem } from "@/lib/menus";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";

export default function Sidebar() {
  const { settings } = useStore();
  const pathname = usePathname();
  // Extract role from /dashboard/[role]
  const pathParts = pathname.split("/");
  const role = pathParts.length > 2 ? pathParts[2] : "admin";
  
  let menus = adminMenu;
  let panelName = "Admin Panel";
  
  if (role === "teacher") {
    menus = teacherMenu;
    panelName = "Teacher Panel";
  } else if (role === "student") {
    menus = studentMenu;
    panelName = "Student Panel";
  }

  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleExpand = (title: string) => {
    setExpanded(expanded === title ? null : title);
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col hidden md:flex">
      <div className="py-6 px-5 border-b border-slate-200 shrink-0 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-[14px] shadow-sm border border-slate-200/80 flex items-center justify-center overflow-hidden shrink-0 w-12 h-12">
            {settings.logoBase64 ? (
              <img src={settings.logoBase64} alt="Logo" className="w-full h-full object-contain p-1" />
            ) : (
              <GraduationCap className="w-6 h-6 text-brand-dark" />
            )}
          </div>
          <div className="overflow-hidden flex flex-col justify-center">
            <h2 
              className="font-bold text-[14px] text-slate-800 leading-snug line-clamp-2 tracking-tight" 
              title={settings.schoolName || "Classroom Management"}
            >
              {settings.schoolName || "Classroom Management"}
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_6px_rgba(16,185,129,0.4)]"></span>
              <p className="text-[11px] font-medium text-slate-500 tracking-wide">{panelName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Area */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-slate-200">
        <nav className="space-y-1 px-3">
          {menus.map((menu, idx) => (
            <div key={idx}>
              {menu.submenu ? (
                <div>
                  <button
                    onClick={() => toggleExpand(menu.title)}
                    className="w-full flex items-center justify-between px-3 py-2 text-[13px] font-medium text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {menu.icon && <menu.icon className="w-4 h-4 text-slate-400" />}
                      <span>{menu.title}</span>
                    </div>
                    {expanded === menu.title ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  {expanded === menu.title && (
                    <div className="mt-1 space-y-1 pl-10 pr-3 pb-2">
                      {menu.submenu.map((sub, sidx) => (
                        <Link
                          key={sidx}
                          href={sub.href}
                          className="block px-3 py-1.5 text-[11px] font-medium text-slate-500 rounded-md hover:text-brand-dark hover:bg-slate-50 transition-colors"
                        >
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={menu.href || "#"}
                  className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-brand-dark transition-colors"
                >
                  {menu.icon && <menu.icon className="w-4 h-4 text-slate-400" />}
                  <span>{menu.title}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>
      
      {/* Footer Area with Logout */}
      <div className="p-4 border-t border-slate-200 shrink-0">
        <Link 
          href="/auth/login" 
          className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </Link>
      </div>
    </aside>
  );
}

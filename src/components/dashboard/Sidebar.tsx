"use client";

import { useState } from "react";
import { GraduationCap, ChevronDown, ChevronRight, LogOut } from "lucide-react";
import { adminMenu, teacherMenu, studentMenu, MenuItem } from "@/lib/menus";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
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
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200 shrink-0">
        <div className="bg-brand-dark p-1.5 rounded-lg mr-3">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-sm text-brand-dark leading-tight">Classroom Management</h2>
          <p className="text-[10px] text-slate-500 font-medium">{panelName}</p>
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
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
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
                          className="block px-3 py-1.5 text-xs font-medium text-slate-500 rounded-md hover:text-brand-dark hover:bg-slate-50 transition-colors"
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
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-brand-dark transition-colors"
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
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </Link>
      </div>
    </aside>
  );
}

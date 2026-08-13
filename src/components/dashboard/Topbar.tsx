"use client";

import { Search, Bell, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { adminMenu, teacherMenu, studentMenu } from "@/lib/menus";

export default function Topbar() {
  const pathname = usePathname();
  
  let title = "Dashboard";
  
  // Flatten all menus
  const allMenus = [...adminMenu, ...teacherMenu, ...studentMenu];
  const flatMenus: { title: string; href?: string }[] = [];
  allMenus.forEach(menu => {
    if (menu.href) flatMenus.push(menu);
    if (menu.submenu) {
      menu.submenu.forEach(sub => flatMenus.push(sub));
    }
  });

  // Find exact match first
  const exactMatch = flatMenus.find(m => m.href === pathname);
  if (exactMatch) {
    title = exactMatch.title;
  } else {
    // Exclude root dashboard paths from partial matching so they don't incorrectly match everything
    const partialMatch = flatMenus.find(m => 
      m.href && 
      m.href !== "#" && 
      !m.href.endsWith("/admin") && 
      !m.href.endsWith("/teacher") && 
      !m.href.endsWith("/student") &&
      pathname.startsWith(m.href)
    );
    if (partialMatch) {
      title = partialMatch.title;
    }
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-[15px] font-semibold text-slate-800">{title}</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-1.5 w-64 bg-slate-50 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder:text-slate-400"
          />
        </div>
        
        <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>
        
        <div className="h-8 w-8 rounded-full bg-brand-dark text-white flex items-center justify-center text-[11px] font-medium shadow-sm cursor-pointer ml-2">
          AD
        </div>
      </div>
    </header>
  );
}

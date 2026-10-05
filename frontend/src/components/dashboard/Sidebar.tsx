"use client";

import { useState, useEffect, useMemo } from "react";
import { GraduationCap, ChevronDown, ChevronRight, LogOut } from "lucide-react";
import { adminMenu, teacherMenu, studentMenu, MenuItem } from "@/lib/menus";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";

export default function Sidebar() {
  const { settings } = useStore();
  const pathname = usePathname();

  // Extract role from pathname
  const pathParts = pathname.split("/").filter(Boolean);
  const role = pathParts.length > 1 ? pathParts[1] : "admin";

  let menus: MenuItem[] = adminMenu;
  let panelName = "Admin Portal";

  if (role === "teacher" || pathname.startsWith("/dashboard/teacher")) {
    menus = teacherMenu;
    panelName = "Teacher Portal";
  } else if (role === "student" || pathname.startsWith("/dashboard/student")) {
    menus = studentMenu;
    panelName = "Student Portal";
  }

  // Active state matching functions
  const isItemActive = (href?: string) => {
    if (!href || href === "#") return false;
    if (pathname === href) return true;
    
    // For dashboard roots (/dashboard/admin, /dashboard/teacher, /dashboard/student): exact match only
    if (
      href === "/dashboard/admin" ||
      href === "/dashboard/teacher" ||
      href === "/dashboard/student"
    ) {
      return pathname === href;
    }

    // For specific subpaths (e.g. /dashboard/admin/academic/classrooms): match exact or nested
    return pathname.startsWith(href + "/") || pathname === href;
  };

  const isSubmenuActive = (submenu?: { title: string; href: string }[]) => {
    if (!submenu) return false;
    return submenu.some((sub) => isItemActive(sub.href));
  };

  // Expanded state map for submenus
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Auto-expand any submenu that contains the active route whenever pathname changes
  useEffect(() => {
    const newExpanded: Record<string, boolean> = { ...expanded };
    menus.forEach((menu) => {
      if (menu.submenu && isSubmenuActive(menu.submenu)) {
        newExpanded[menu.title] = true;
      }
    });
    setExpanded(newExpanded);
  }, [pathname, menus]);

  const toggleExpand = (title: string) => {
    setExpanded((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen max-h-screen flex flex-col shrink-0 select-none">
      {/* ── Brand / Header ── */}
      <div className="py-5 px-5 border-b border-slate-200 shrink-0 bg-slate-50/70">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 w-11 h-11">
            {settings.logoBase64 ? (
              <img src={settings.logoBase64} alt="Logo" className="w-full h-full object-contain p-1" />
            ) : (
              <GraduationCap className="w-6 h-6 text-brand-dark" />
            )}
          </div>
          <div className="overflow-hidden flex flex-col justify-center">
            <h2
              className="font-bold text-[13px] text-slate-900 leading-snug line-clamp-1 tracking-tight"
              title={settings.schoolName || "Scholaris Management"}
            >
              {settings.schoolName || "Scholaris LMS"}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_6px_rgba(16,185,129,0.5)]"></span>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{panelName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Menu List Area (Proper Independent Scroll) ── */}
      <div className="flex-1 overflow-y-auto overscroll-contain py-3 px-3 custom-scrollbar">
        <nav className="space-y-1">
          {menus.map((menu, idx) => {
            const hasSub = !!menu.submenu;
            const isSubActive = hasSub && isSubmenuActive(menu.submenu);
            const isTopActive = !hasSub && isItemActive(menu.href);
            const isOpen = expanded[menu.title];

            return (
              <div key={idx} className="space-y-0.5">
                {hasSub ? (
                  <div>
                    {/* Submenu Parent Button */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(menu.title)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-[12px] font-medium rounded-lg transition-all ${
                        isSubActive
                          ? "bg-slate-100 text-slate-900 font-semibold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {menu.icon && (
                          <menu.icon
                            className={`w-4 h-4 transition-colors ${
                              isSubActive ? "text-brand-dark" : "text-slate-400"
                            }`}
                          />
                        )}
                        <span>{menu.title}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {isSubActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-dark mr-1" />
                        )}
                        {isOpen ? (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Submenu Accordion Items */}
                    {isOpen && (
                      <div className="mt-1 ml-3 pl-3.5 border-l-2 border-slate-100 space-y-1 py-0.5 animate-in fade-in duration-150">
                        {menu.submenu!.map((sub, sidx) => {
                          const isChildActive = isItemActive(sub.href);
                          return (
                            <Link
                              key={sidx}
                              href={sub.href}
                              className={`flex items-center justify-between px-2.5 py-1.5 text-[11px] rounded-md transition-all ${
                                isChildActive
                                  ? "bg-brand-dark text-white font-semibold shadow-xs"
                                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/60 font-medium"
                              }`}
                            >
                              <span>{sub.title}</span>
                              {isChildActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0 shadow-xs" />
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Top-Level Single Item */
                  <Link
                    href={menu.href || "#"}
                    className={`flex items-center justify-between px-3 py-2 text-[12px] rounded-lg transition-all ${
                      isTopActive
                        ? "bg-brand-dark text-white font-semibold shadow-xs"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {menu.icon && (
                        <menu.icon
                          className={`w-4 h-4 transition-colors ${
                            isTopActive ? "text-white" : "text-slate-400"
                          }`}
                        />
                      )}
                      <span>{menu.title}</span>
                    </div>
                    {isTopActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0 shadow-xs" />
                    )}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* ── Footer Area with Logout ── */}
      <div className="p-3 border-t border-slate-200 shrink-0 bg-white">
        <button
          type="button"
          onClick={async () => {
            await api.logout();
            window.location.href = "/auth/login";
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}

"use client";

import { Bell, ChevronRight, Moon, Search, Sun, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SignOutButton } from "@/components/layout/SignOutButton";

const breadcrumbLabels: Record<string, string> = {
  admin: "System Admin",
  dashboard: "Dashboard",
  companies: "บริษัท",
  "company-users": "ผู้ใช้บริษัท",
  plans: "แพ็กเกจ",
  "document-categories": "หมวดหมู่เอกสาร",
  "document-types": "ประเภทเอกสาร",
  templates: "Template กลาง",
  "audit-logs": "Audit Log",
};

export function AdminShellControls({ userName }: { userName?: string | null }) {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const breadcrumbs = useMemo(() => {
    return pathname
      .split("/")
      .filter(Boolean)
      .filter((segment) => segment !== "th" && segment !== "en")
      .map((segment) => breadcrumbLabels[segment] ?? segment);
  }, [pathname]);

  return (
    <header className="h-auto shrink-0 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 sm:px-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <nav className="flex flex-wrap items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            {breadcrumbs.map((item, index) => (
              <span key={`${item}-${index}`} className="inline-flex items-center gap-1">
                {index > 0 && <ChevronRight className="size-3" />}
                <span className={index === breadcrumbs.length - 1 ? "text-slate-900 dark:text-white" : ""}>
                  {item}
                </span>
              </span>
            ))}
          </nav>
          <div className="mt-2 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 sm:w-full sm:max-w-xl">
            <Search className="size-4" />
            <input
              className="w-full bg-transparent outline-none"
              placeholder="ค้นหาบริษัท ผู้ใช้ แพ็กเกจ ประเภทเอกสาร หรือ audit log"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            className="inline-grid size-9 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
            title="Notification"
          >
            <Bell className="size-4" />
          </button>
          <button
            onClick={() => setIsDark((value) => !value)}
            className="inline-grid size-9 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
            title="Toggle theme"
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <LanguageSwitcher />
          <div className="relative">
            <button
              onClick={() => setProfileOpen((value) => !value)}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              <UserRound className="size-4" />
              <span className="hidden sm:inline">{userName ?? "System Admin"}</span>
            </button>
            {profileOpen && (
              <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">{userName ?? "System Admin"}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">SUPER_ADMIN</p>
                <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <SignOutButton />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

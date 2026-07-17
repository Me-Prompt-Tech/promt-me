"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { usePathname } from "next/navigation";
import { AdminShellControls } from "@/components/admin-shell-controls";
import { 
  ChevronDown, 
  ChevronRight, 
  Menu, 
  PanelLeftClose, 
  PanelLeftOpen, 
  ShieldCheck, 
  X,
  Activity,
  Building2,
  FileText,
  Gauge,
  Package,
  Palette,
  Settings
} from "lucide-react";

export type NavItem = {
  href?: string;
  label: string;
  icon: any;
  children?: { href: string; label: string }[];
};

const navSections: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Gauge },
  {
    label: "บริษัท",
    icon: Building2,
    children: [
      { href: "/admin/companies", label: "รายการบริษัท" },
      { href: "/admin/company-users", label: "ผู้ใช้บริษัท" },
    ],
  },
  { href: "/admin/plans", label: "แพ็กเกจ", icon: Package },
  {
    label: "เอกสาร",
    icon: FileText,
    children: [
      { href: "/admin/document-categories", label: "หมวดหมู่เอกสาร" },
      { href: "/admin/document-types", label: "ประเภทเอกสาร" },
      { href: "/admin/templates", label: "Template กลาง" },
    ],
  },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: Activity },
  { href: "/admin/ui-kit", label: "UI Components", icon: Palette },
  { href: "/admin/settings", label: "ตั้งค่าระบบ", icon: Settings },
];

export function AdminClientShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName?: string | null;
}) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const toggleGroup = (label: string) => {
    if (isDesktopCollapsed) {
      setIsDesktopCollapsed(false); // Auto-expand sidebar if clicking a group while collapsed
    }
    setExpandedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const SidebarContent = () => (
    <>
      <div className={`flex h-[72px] shrink-0 items-center border-b border-white/10 ${isDesktopCollapsed ? 'justify-center' : 'justify-between px-5'}`}>
        {!isDesktopCollapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-teal-500 text-white">
              <ShieldCheck className="size-5" />
            </span>
            <div className="min-w-0 flex-1 whitespace-nowrap">
              <p className="truncate text-sm font-semibold">System Admin</p>
              <p className="truncate text-xs text-slate-400">Control Center</p>
            </div>
          </div>
        )}
        
        <div className="flex items-center shrink-0">
          {/* Desktop collapse toggle */}
          <button 
            onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
            className="hidden lg:flex p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title={isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isDesktopCollapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
          </button>
          
          {/* Mobile close button inside sidebar */}
          <button className="lg:hidden p-1 text-slate-400 hover:text-white" onClick={() => setIsMobileOpen(false)}>
            <X className="size-5" />
          </button>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-3 custom-scrollbar">
        {navSections.map((item) => {
          const isActiveGroup = item.children?.some(c => pathname.includes(c.href));
          const isExpanded = expandedGroups[item.label] || (isActiveGroup && expandedGroups[item.label] !== false);

          return (
            <div key={item.label}>
              {item.href ? (
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    pathname.includes(item.href)
                      ? "bg-teal-500/10 text-teal-400"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                  title={isDesktopCollapsed ? item.label : undefined}
                >
                  <item.icon className={`size-5 shrink-0 ${pathname.includes(item.href) ? "text-teal-400" : ""}`} />
                  {!isDesktopCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              ) : (
                <div className="mb-1">
                  <button
                    onClick={() => toggleGroup(item.label)}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/5 transition-colors group"
                    title={isDesktopCollapsed ? item.label : undefined}
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <item.icon className="size-5 shrink-0 text-slate-400 group-hover:text-slate-200" />
                      {!isDesktopCollapsed && <span className="truncate">{item.label}</span>}
                    </span>
                    {!isDesktopCollapsed && (
                      <ChevronDown className={`size-4 text-slate-500 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                    )}
                  </button>
                  {(!isDesktopCollapsed && isExpanded) && (
                    <div className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-4 py-1">
                      {item.children!.map((child) => {
                        const isChildActive = pathname.includes(child.href);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`block truncate rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                              isChildActive
                                ? "bg-white/10 text-white"
                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      
      {!isDesktopCollapsed && (
        <div className="border-t border-white/10 p-4 text-xs leading-5 text-slate-400">
          จัดการ tenant, role, package, document taxonomy, template และ audit จากศูนย์กลาง
        </div>
      )}
      
    </>
  );

  return (
    <div className="flex h-screen bg-[#f6f8fb] text-slate-950 dark:bg-slate-950 dark:text-slate-100 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar (Responsive) */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-950 text-white dark:border-slate-800 transition-all duration-300 ease-in-out lg:relative lg:border-r ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isDesktopCollapsed ? "lg:w-[72px]" : "w-72 lg:w-72"}`}
      >
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminShellControls 
          userName={userName} 
          onMenuClick={() => setIsMobileOpen(true)} 
        />
        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 relative">
          {children}
        </main>
      </div>
    </div>
  );
}

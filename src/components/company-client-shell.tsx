"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { usePathname } from "next/navigation";
import { CompanyShellControls } from "@/components/company-shell-controls";
import { 
  ChevronDown, 
  Menu, 
  PanelLeftClose, 
  PanelLeftOpen, 
  ShieldCheck, 
  X,
  Building2,
  ChartNoAxesCombined,
  FileText,
  Gauge,
  LayoutTemplate,
  Settings,
  Workflow
} from "lucide-react";

export type NavItem = {
  href?: string;
  label: string;
  icon: any;
  children?: { href: string; label: string }[];
};

const navSections: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  {
    label: "เอกสาร",
    icon: FileText,
    children: [
      { href: "/documents", label: "เอกสารทั้งหมด" },
      { href: "/documents/create", label: "สร้างเอกสาร" },
      { href: "/approvals", label: "รออนุมัติ" },
    ],
  },
  {
    label: "Template",
    icon: LayoutTemplate,
    children: [
      { href: "/templates", label: "Template ทั้งหมด" },
      { href: "/templates/create", label: "สร้าง Template" },
      { href: "/templates/template-1/designer", label: "Document Designer" },
    ],
  },
  {
    label: "ข้อมูลบริษัท",
    icon: Building2,
    children: [
      { href: "/business-partners", label: "ลูกค้า / คู่ค้า" },
      { href: "/employees", label: "พนักงาน" },
      { href: "/departments", label: "แผนก" },
    ],
  },
  {
    label: "ระบบอนุมัติ",
    icon: Workflow,
    children: [
      { href: "/approval-flows", label: "Flow การอนุมัติ" },
      { href: "/approvals", label: "งานที่รออนุมัติ" },
    ],
  },
  { href: "/reports", label: "รายงาน", icon: ChartNoAxesCombined },
  {
    label: "ตั้งค่า",
    icon: Settings,
    children: [
      { href: "/settings/company", label: "ตั้งค่าบริษัท" },
      { href: "/settings/users", label: "ผู้ใช้งาน" },
      { href: "/document-number-settings", label: "เลขเอกสาร" },
    ],
  },
];

export function CompanyClientShell({
  children,
  userName,
  companyName = "Siam Retail Co., Ltd.",
}: {
  children: React.ReactNode;
  userName?: string | null;
  companyName?: string;
}) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const toggleGroup = (label: string) => {
    if (isDesktopCollapsed) {
      setIsDesktopCollapsed(false);
    }
    setExpandedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const SidebarContent = () => (
    <>
      <div className={`flex h-[72px] shrink-0 items-center border-b border-slate-200 dark:border-slate-800 ${isDesktopCollapsed ? 'justify-center' : 'justify-between px-5'}`}>
        {!isDesktopCollapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-teal-600 text-white">
              <ShieldCheck className="size-5" />
            </span>
            <div className="min-w-0 flex-1 whitespace-nowrap">
              <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{companyName}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">Company Workspace</p>
            </div>
          </div>
        )}
        
        <div className="flex items-center shrink-0">
          <button 
            onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
            className="hidden lg:flex p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            title={isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isDesktopCollapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
          </button>
          
          <button className="lg:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white" onClick={() => setIsMobileOpen(false)}>
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
                      ? "bg-teal-50 text-teal-800 dark:bg-slate-800 dark:text-white"
                      : "text-slate-700 hover:bg-teal-50 hover:text-teal-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`}
                  title={isDesktopCollapsed ? item.label : undefined}
                >
                  <item.icon className={`size-5 shrink-0 ${pathname.includes(item.href) ? "text-teal-600 dark:text-teal-400" : ""}`} />
                  {!isDesktopCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              ) : (
                <div className="mb-1">
                  <button
                    onClick={() => toggleGroup(item.label)}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                    title={isDesktopCollapsed ? item.label : undefined}
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <item.icon className="size-5 shrink-0 text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200" />
                      {!isDesktopCollapsed && <span className="truncate">{item.label}</span>}
                    </span>
                    {!isDesktopCollapsed && (
                      <ChevronDown className={`size-4 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                    )}
                  </button>
                  {(!isDesktopCollapsed && isExpanded) && (
                    <div className="ml-5 mt-1 space-y-1 border-l border-slate-200 dark:border-slate-800 pl-4 py-1">
                      {item.children!.map((child) => {
                        const isChildActive = pathname.includes(child.href);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`block truncate rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                              isChildActive
                                ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
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
        <div className="border-t border-slate-200 dark:border-slate-800 p-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
          Company data is scoped by companyId. Users see only their own company workspace.
        </div>
      )}
    </>
  );

  return (
    <div className="flex h-screen bg-[#f6f8fb] text-slate-950 dark:bg-slate-950 dark:text-slate-100 overflow-hidden">
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out lg:relative ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isDesktopCollapsed ? "lg:w-[72px]" : "w-72 lg:w-72"}`}
      >
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <CompanyShellControls 
          userName={userName} 
          onMenuClick={() => setIsMobileOpen(true)} 
        />
        <main className="flex-1 overflow-auto relative">
          {children}
        </main>
      </div>
    </div>
  );
}

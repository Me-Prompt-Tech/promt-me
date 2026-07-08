import { auth } from "@/auth";
import { CompanyShellControls } from "@/components/company-shell-controls";
import { Link } from "@/i18n/routing";
import { redirect } from "next/navigation";
import {
  Building2,
  ChartNoAxesCombined,
  ChevronDown,
  FileText,
  Gauge,
  LayoutTemplate,
  Settings,
  ShieldCheck,
  Workflow,
} from "lucide-react";

export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (
    session.user.role === "SUPER_ADMIN" ||
    session.user.role === "SUPPORT" ||
    (session.user.role === "ADMIN" && !session.user.companyId)
  ) {
    redirect("/admin/dashboard");
  }

  const navSections = [
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

  return (
    <div className="flex h-screen bg-[#f6f8fb] text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <aside className="hidden w-72 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:flex lg:flex-col">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-teal-600 text-white">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Siam Retail Co., Ltd.</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Company Workspace</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navSections.map((item) => (
            <div key={item.label}>
              {"href" in item ? (
                <Link
                  href={item.href!}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              ) : (
                <div>
                  <div className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    <span className="flex items-center gap-3">
                      <item.icon className="size-4" />
                      {item.label}
                    </span>
                    <ChevronDown className="size-4 text-slate-400" />
                  </div>
                  <div className="ml-4 space-y-1 border-l border-slate-200 pl-3 dark:border-slate-800">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-teal-50 hover:text-teal-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-4 text-xs leading-5 text-slate-500 dark:border-slate-800 dark:text-slate-400">
          Company data is scoped by companyId. Users see only their own company workspace.
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <CompanyShellControls userName={session.user.name} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

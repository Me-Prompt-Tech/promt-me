import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/routing";
import { AdminShellControls } from "@/components/admin-shell-controls";
import {
  Activity,
  Building2,
  ChevronDown,
  FileText,
  Gauge,
  Package,
  Palette,
  Settings,
  ShieldCheck,
} from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  const isSystemAdmin =
    session?.user.role === "SUPER_ADMIN" ||
    session?.user.role === "SUPPORT" ||
    (session?.user.role === "ADMIN" && !session?.user.companyId);

  if (!session || !isSystemAdmin) {
    redirect("/login");
  }

  const navSections = [
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

  return (
    <div className="flex h-screen bg-[#f6f8fb] text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <aside className="hidden w-72 border-r border-slate-200 bg-slate-950 text-white dark:border-slate-800 lg:flex lg:flex-col">
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-teal-500 text-white">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">System Admin</p>
              <p className="text-xs text-slate-400">Promt-Me Control Center</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navSections.map((item) => (
            <div key={item.label}>
              {"href" in item ? (
                <Link
                  href={item.href!}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              ) : (
                <div>
                  <div className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-semibold text-slate-200">
                    <span className="flex items-center gap-3">
                      <item.icon className="size-4" />
                      {item.label}
                    </span>
                    <ChevronDown className="size-4 text-slate-500" />
                  </div>
                  <div className="ml-4 space-y-1 border-l border-white/10 pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block rounded-md px-3 py-2 text-sm font-medium text-slate-400 hover:bg-white/10 hover:text-white"
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
        <div className="border-t border-white/10 p-4 text-xs leading-5 text-slate-400">
          จัดการ tenant, role, package, document taxonomy, template และ audit จากศูนย์กลาง
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminShellControls userName={session.user.name} />

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { CategoryFormModal, type CategoryData } from "@/components/admin/category-form-modal";
import { TypeFormModal, type DocumentTypeData } from "@/components/admin/type-form-modal";
import { TemplateFormModal, type TemplateData } from "@/components/admin/template-form-modal";
import { ConfirmDialog } from "@/components/ui/app-components";

import {
  Activity,
  Building2,
  CheckCircle2,
  ClipboardList,
  Copy,
  Eye,
  FileCog,
  FileText,
  Filter,
  Layers3,
  LayoutTemplate,
  LockKeyhole,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  UsersRound,
} from "lucide-react";

export type AdminSection =
  | "dashboard"
  | "companies"
  | "company-users"
  | "plans"
  | "document-categories"
  | "document-types"
  | "templates"
  | "audit-logs";

const companies = [
  {
    name: "Siam Retail Co., Ltd.",
    legalName: "บริษัท สยาม รีเทล จำกัด",
    taxId: "0105566001234",
    branchCode: "00000",
    email: "admin@siamretail.co.th",
    phone: "02-123-4567",
    address: "99 อาคารสาทร สแควร์ กรุงเทพฯ",
    logo: "SR",
    status: "ACTIVE",
    plan: "Business",
    users: 28,
    documents: 1840,
  },
  {
    name: "Blue Ocean Studio",
    legalName: "บริษัท บลู โอเชียน สตูดิโอ จำกัด",
    taxId: "0105565005678",
    branchCode: "00000",
    email: "billing@blueocean.studio",
    phone: "089-222-4455",
    address: "12 ซอยอารีย์สัมพันธ์ กรุงเทพฯ",
    logo: "BO",
    status: "ACTIVE",
    plan: "Professional",
    users: 12,
    documents: 690,
  },
  {
    name: "North Star Logistics",
    legalName: "บริษัท นอร์ท สตาร์ โลจิสติกส์ จำกัด",
    taxId: "0105564004321",
    branchCode: "00003",
    email: "ops@northstar.co.th",
    phone: "02-778-9090",
    address: "88 ถนนบางนา-ตราด สมุทรปราการ",
    logo: "NS",
    status: "SUSPENDED",
    plan: "Starter",
    users: 7,
    documents: 312,
  },
  {
    name: "Mega Foods Group",
    legalName: "บริษัท เมกะฟู้ดส์ กรุ๊ป จำกัด",
    taxId: "0105567000987",
    branchCode: "00000",
    email: "account@megafoods.co.th",
    phone: "02-444-1133",
    address: "55 ถนนพระราม 9 กรุงเทพฯ",
    logo: "MF",
    status: "CANCELLED",
    plan: "Free",
    users: 5,
    documents: 88,
  },
];

const companyUsers = [
  { name: "คุณณัฐพล", email: "owner@example.com", company: "Siam Retail Co., Ltd.", role: "OWNER", status: "ACTIVE" },
  { name: "คุณวราภรณ์", email: "accountant@example.com", company: "Siam Retail Co., Ltd.", role: "ACCOUNTANT", status: "ACTIVE" },
  { name: "คุณอรทัย", email: "finance@example.com", company: "Blue Ocean Studio", role: "FINANCE", status: "ACTIVE" },
  { name: "คุณชลธิชา", email: "viewer@example.com", company: "North Star Logistics", role: "VIEWER", status: "SUSPENDED" },
  { name: "คุณกิตติ", email: "operation@example.com", company: "Mega Foods Group", role: "OPERATION", status: "INVITED" },
];

const plans = [
  { name: "Free", price: "฿0", users: "3", docs: "100", storage: "1 GB", features: "Basic documents, PDF export", status: "ACTIVE" },
  { name: "Starter", price: "฿590/mo", users: "8", docs: "1,000", storage: "10 GB", features: "Approval flow, email sending", status: "ACTIVE" },
  { name: "Professional", price: "฿1,490/mo", users: "25", docs: "10,000", storage: "100 GB", features: "Tax reports, template designer", status: "ACTIVE" },
  { name: "Business", price: "฿2,990/mo", users: "80", docs: "50,000", storage: "500 GB", features: "Multi-branch, audit export", status: "ACTIVE" },
  { name: "Enterprise", price: "Custom", users: "Unlimited", docs: "Unlimited", storage: "Custom", features: "SSO, custom SLA, dedicated support", status: "INACTIVE" },
];

const documentCategories = [
  {
    name: "เอกสารจดทะเบียน",
    slug: "registration-documents",
    icon: "Building2",
    order: 1,
    status: "ACTIVE",
    examples: ["หนังสือรับรองบริษัท", "ใบทะเบียนพาณิชย์", "ภ.พ.20", "หนังสือบริคณห์สนธิ", "บอจ.5"],
  },
  {
    name: "เอกสารด้านบัญชีและการเงิน",
    slug: "accounting-finance-documents",
    icon: "CircleDollarSign",
    order: 2,
    status: "ACTIVE",
    examples: ["ใบเสนอราคา", "ใบแจ้งหนี้", "ใบเสร็จรับเงิน", "ใบวางบิล", "ใบสำคัญจ่าย"],
  },
  {
    name: "เอกสารภาษี",
    slug: "tax-documents",
    icon: "FileText",
    order: 3,
    status: "ACTIVE",
    examples: ["ใบกำกับภาษี", "ใบกำกับภาษีอย่างย่อ", "ภ.ง.ด.1", "ภ.ง.ด.3", "ภ.พ.30"],
  },
  {
    name: "เอกสารบุคคล",
    slug: "hr-documents",
    icon: "UsersRound",
    order: 4,
    status: "ACTIVE",
    examples: ["สัญญาจ้างงาน", "ใบสมัครงาน", "ใบลา", "หนังสือรับรองเงินเดือน", "ประวัติพนักงาน"],
  },
  {
    name: "เอกสารการดำเนินงาน",
    slug: "operation-documents",
    icon: "ClipboardList",
    order: 5,
    status: "ACTIVE",
    examples: ["รายงานการประชุม", "ใบสั่งงาน", "ใบตรวจงาน", "Checklist งาน", "รายงานประจำวัน"],
  },
];



const templates = [
  { name: "ใบเสนอราคา Standard", category: "เอกสารด้านบัญชีและการเงิน", type: "ใบเสนอราคา", global: "Yes", mode: "Designer", status: "ACTIVE" },
  { name: "ใบกำกับภาษีเต็มรูป", category: "เอกสารภาษี", type: "ใบกำกับภาษี", global: "Yes", mode: "HTML", status: "ACTIVE" },
  { name: "สัญญาจ้างพนักงาน", category: "เอกสารบุคคล", type: "สัญญาจ้างงาน", global: "Yes", mode: "Form", status: "DRAFT" },
  { name: "รายงานการประชุม", category: "เอกสารการดำเนินงาน", type: "รายงานการประชุม", global: "No", mode: "Designer", status: "INACTIVE" },
];

const auditLogs = [
  { action: "เปิดใช้งานบริษัท", actor: "System Admin", company: "Blue Ocean Studio", target: "Company status", ip: "203.0.113.10", userAgent: "Chrome / Windows", time: "08 ก.ค. 2026 12:46" },
  { action: "แก้ไขแพ็กเกจ", actor: "Admin Ops", company: "Siam Retail Co., Ltd.", target: "Professional plan", ip: "203.0.113.11", userAgent: "Edge / Windows", time: "08 ก.ค. 2026 11:18" },
  { action: "Duplicate Template", actor: "System Admin", company: "Global", target: "ใบกำกับภาษีเต็มรูป", ip: "203.0.113.12", userAgent: "Safari / macOS", time: "07 ก.ค. 2026 17:02" },
  { action: "Reset Password", actor: "Admin Ops", company: "North Star Logistics", target: "viewer@example.com", ip: "203.0.113.13", userAgent: "Chrome / Android", time: "07 ก.ค. 2026 09:30" },
];

const monthlyDocuments = [
  { month: "ม.ค.", value: 8200 },
  { month: "ก.พ.", value: 9400 },
  { month: "มี.ค.", value: 11200 },
  { month: "เม.ย.", value: 10800 },
  { month: "พ.ค.", value: 13400 },
  { month: "มิ.ย.", value: 15100 },
  { month: "ก.ค.", value: 12800 },
];

const sectionTitles: Record<AdminSection, { title: string; description: string; icon: typeof ShieldCheck }> = {
  dashboard: { title: "Dashboard ระบบกลาง", description: "ภาพรวมบริษัท ผู้ใช้ เอกสาร Template กราฟรายเดือน และกิจกรรมล่าสุด", icon: ShieldCheck },
  companies: { title: "จัดการบริษัท", description: "ดูบริษัททั้งหมด ค้นหา กรองสถานะ จัดการข้อมูลบริษัท ผู้ใช้ เอกสาร และแพ็กเกจ", icon: Building2 },
  "company-users": { title: "จัดการผู้ใช้บริษัท", description: "ดูผู้ใช้จากทุกบริษัท กรอง role/status และจัดการบัญชีผู้ใช้", icon: UsersRound },
  plans: { title: "จัดการแพ็กเกจ", description: "กำหนดราคา quota เอกสาร พื้นที่จัดเก็บ และ feature ของแต่ละแพ็กเกจ", icon: Package },
  "document-categories": { title: "จัดการหมวดหมู่เอกสาร", description: "จัดการ 5 หมวดเริ่มต้น slug, icon, ลำดับ และสถานะการใช้งาน", icon: Layers3 },
  "document-types": { title: "จัดการประเภทเอกสาร", description: "ค้นหา กรองตามหมวดหมู่ เพิ่ม/แก้ไข/ลบ/เรียงลำดับประเภทเอกสาร", icon: FileCog },
  templates: { title: "จัดการ Template กลาง", description: "จัดการ Global Template, preview, duplicate และเข้า Document Designer", icon: LayoutTemplate },
  "audit-logs": { title: "Audit Log ระบบ", description: "ดูประวัติการใช้งาน ค้นหาผู้ใช้ กรองบริษัท action วันที่ IP และ User Agent", icon: Activity },
};

const actions = {
  base: ["เพิ่ม", "แก้ไข", "ลบ", "เปิด/ปิด"],
  companies: ["เพิ่มบริษัท", "แก้ไข", "ลบ", "เปิด/ปิด", "รายละเอียด", "ผู้ใช้", "เอกสาร", "แพ็กเกจ"],
  users: ["เพิ่มผู้ใช้", "แก้ไข", "Reset Password", "ระงับ", "ลบ"],
  templates: ["เพิ่ม Template", "แก้ไข", "ลบ", "เปิด/ปิด", "Duplicate", "Preview", "Global", "Designer"],
};

function StatusBadge({ value }: { value: string }) {
  const color =
    value === "ACTIVE" || value === "Yes"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
      : value === "SUSPENDED" || value === "CANCELLED" || value === "INACTIVE"
        ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${color}`}>{value}</span>;
}

function IconButton({ label, destructive = false, onClick }: { label: string; destructive?: boolean; onClick?: () => void }) {
  const Icon = label.includes("ลบ")
    ? Trash2
    : label.includes("แก้")
      ? Pencil
      : label.includes("Reset")
        ? RotateCcw
        : label.includes("Preview") || label.includes("รายละเอียด")
          ? Eye
          : label.includes("Duplicate")
            ? Copy
            : MoreHorizontal;

  return (
    <button
      onClick={onClick}
      className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-2 text-xs font-medium ${destructive
        ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
        }`}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}

function PageHeader({ section, onAdd }: { section: AdminSection; onAdd?: () => void }) {
  const meta = sectionTitles[section];

  return (
    <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-slate-950 text-white dark:bg-teal-600">
            <meta.icon className="size-6" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300">System Admin</p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-950 dark:text-white">{meta.title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">{meta.description}</p>
          </div>
        </div>
        {onAdd ? (
          <button
            onClick={onAdd}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
          >
            <Plus className="size-4" />
            เพิ่มข้อมูล
          </button>
        ) : (
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-teal-700">
            <Plus className="size-4" />
            เพิ่มข้อมูล
          </button>
        )}
      </div>
    </div>
  );
}

function SearchToolbar({
  placeholder,
  filters,
}: {
  placeholder: string;
  filters?: string[];
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none ring-teal-500/20 focus:border-teal-500 focus:ring-4 dark:border-slate-800 dark:bg-slate-950 sm:w-80"
            placeholder={placeholder}
          />
        </label>
        {filters?.map((filter) => (
          <select
            key={filter}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
          >
            <option>{filter}</option>
          </select>
        ))}
      </div>
      <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
        <Filter className="size-4" />
        ล้างตัวกรอง
      </button>
    </div>
  );
}

export type ActionItem = string | { label: string; onClick?: () => void; destructive?: boolean };

function ActionBar({ items }: { items: ActionItem[] }) {
  return (
    <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
      {items.map((item, i) => {
        if (typeof item === "string") {
          return <IconButton key={item} label={item} destructive={item.includes("ลบ")} />;
        }
        return <IconButton key={i} label={item.label} destructive={item.destructive} onClick={item.onClick} />;
      })}
    </div>
  );
}

function DataShell({
  children,
  placeholder,
  filters,
  actions: actionItems,
}: {
  children: React.ReactNode;
  placeholder: string;
  filters?: string[];
  actions: ActionItem[];
}) {
  return (
    <div className="space-y-4">
      <ActionBar items={actionItems} />
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <SearchToolbar placeholder={placeholder} filters={filters} />
        <div className="overflow-x-auto p-4">{children}</div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const stats = [
    { label: "บริษัททั้งหมด", value: "128", detail: "รวมทุกสถานะ", icon: Building2 },
    { label: "บริษัท Active", value: "112", detail: "87.5% ของทั้งหมด", icon: CheckCircle2 },
    { label: "บริษัท Suspended", value: "9", detail: "ต้องติดตาม", icon: ShieldCheck },
    { label: "ผู้ใช้ทั้งหมด", value: "2,418", detail: "เพิ่ม 36 สัปดาห์นี้", icon: UsersRound },
    { label: "เอกสารทั้งหมด", value: "184K", detail: "+22% เดือนนี้", icon: FileText },
    { label: "Template ทั้งหมด", value: "64", detail: "Global 38", icon: LayoutTemplate },
  ];

  const max = Math.max(...monthlyDocuments.map((item) => item.value));

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((item) => (
          <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{item.value}</p>
              </div>
              <span className="grid size-10 place-items-center rounded-md bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                <item.icon className="size-5" />
              </span>
            </div>
            <p className="mt-3 text-xs font-medium text-teal-700 dark:text-teal-300">{item.detail}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">กราฟจำนวนเอกสารรายเดือน</h2>
          <span className="text-xs font-semibold text-teal-700 dark:text-teal-300">ม.ค. - ก.ค. 2026</span>
        </div>
        <div className="mt-5 flex h-64 items-end gap-3">
          {monthlyDocuments.map((item) => (
            <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-48 w-full items-end rounded-md bg-slate-100 p-1 dark:bg-slate-900">
                <div
                  className="w-full rounded bg-teal-500"
                  style={{ height: `${Math.max(16, (item.value / max) * 100)}%` }}
                />
              </div>
              <p className="text-xs font-medium text-slate-500">{item.month}</p>
              <p className="text-xs text-slate-400">{item.value.toLocaleString("th-TH")}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_460px]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">ตารางบริษัทที่ใช้งานล่าสุด</h2>
          <div className="mt-4 overflow-x-auto">
            <CompanyTable compact />
          </div>
        </div>
        <AuditPanel compact />
      </div>
    </div>
  );
}

function CompanyTable({ compact = false }: { compact?: boolean }) {
  return (
    <table className="w-full min-w-[980px] text-left text-sm">
      <thead className="text-xs uppercase text-slate-500">
        <tr>
          <th className="py-3 pr-4 font-semibold">บริษัท</th>
          {!compact && <th className="py-3 pr-4 font-semibold">ข้อมูลติดต่อ</th>}
          {!compact && <th className="py-3 pr-4 font-semibold">ที่อยู่</th>}
          <th className="py-3 pr-4 font-semibold">แพ็กเกจ</th>
          <th className="py-3 pr-4 text-right font-semibold">ผู้ใช้</th>
          <th className="py-3 pr-4 text-right font-semibold">เอกสาร</th>
          <th className="py-3 pr-4 font-semibold">สถานะ</th>
          {!compact && <th className="py-3 font-semibold">จัดการ</th>}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {companies.map((company) => (
          <tr key={company.taxId}>
            <td className="py-4 pr-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-md bg-teal-100 text-xs font-bold text-teal-800">{company.logo}</span>
                <div>
                  <p className="font-semibold text-slate-950 dark:text-white">{company.name}</p>
                  <p className="text-xs text-slate-500">{company.legalName}</p>
                  <p className="text-xs text-slate-400">Tax ID {company.taxId} · Branch {company.branchCode}</p>
                </div>
              </div>
            </td>
            {!compact && <td className="py-4 pr-4 text-slate-600 dark:text-slate-300">{company.email}<br />{company.phone}</td>}
            {!compact && <td className="max-w-[220px] py-4 pr-4 text-slate-600 dark:text-slate-300">{company.address}</td>}
            <td className="py-4 pr-4 text-slate-600 dark:text-slate-300">{company.plan}</td>
            <td className="py-4 pr-4 text-right text-slate-700 dark:text-slate-200">{company.users}</td>
            <td className="py-4 pr-4 text-right text-slate-700 dark:text-slate-200">{company.documents.toLocaleString("th-TH")}</td>
            <td className="py-4 pr-4"><StatusBadge value={company.status} /></td>
            {!compact && (
              <td className="py-4">
                <div className="flex flex-wrap gap-1.5">
                  {["รายละเอียด", "ผู้ใช้", "เอกสาร", "แพ็กเกจ"].map((item) => <IconButton key={item} label={item} />)}
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CompanyUsersTable() {
  return (
    <table className="w-full min-w-[820px] text-left text-sm">
      <thead className="text-xs uppercase text-slate-500">
        <tr>
          <th className="py-3 pr-4 font-semibold">ผู้ใช้</th>
          <th className="py-3 pr-4 font-semibold">บริษัท</th>
          <th className="py-3 pr-4 font-semibold">Role</th>
          <th className="py-3 pr-4 font-semibold">สถานะ</th>
          <th className="py-3 font-semibold">จัดการ</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {companyUsers.map((user) => (
          <tr key={user.email}>
            <td className="py-4 pr-4">
              <p className="font-semibold text-slate-950 dark:text-white">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </td>
            <td className="py-4 pr-4 text-slate-600 dark:text-slate-300">{user.company}</td>
            <td className="py-4 pr-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">{user.role}</span></td>
            <td className="py-4 pr-4"><StatusBadge value={user.status} /></td>
            <td className="py-4"><div className="flex flex-wrap gap-1.5">{actions.users.slice(1).map((item) => <IconButton key={item} label={item} destructive={item === "ลบ"} />)}</div></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PlanCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {plans.map((plan) => (
        <div key={plan.name} className="rounded-lg border border-slate-200 p-5 dark:border-slate-800">
          <Package className="size-5 text-teal-700 dark:text-teal-300" />
          <div className="mt-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{plan.name}</h2>
            <StatusBadge value={plan.status} />
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{plan.price}</p>
          <dl className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex justify-between"><dt>Max users</dt><dd>{plan.users}</dd></div>
            <div className="flex justify-between"><dt>Max docs</dt><dd>{plan.docs}</dd></div>
            <div className="flex justify-between"><dt>Storage</dt><dd>{plan.storage}</dd></div>
          </dl>
          <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">{plan.features}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">{["แก้ไข", "ลบ", "เปิด/ปิด"].map((item) => <IconButton key={item} label={item} destructive={item === "ลบ"} />)}</div>
        </div>
      ))}
    </div>
  );
}

function CategoryCards({
  categories,
  onEdit,
  onDelete,
  onToggleStatus
}: {
  categories: any[];
  onEdit: (cat: any) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, current: boolean) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {categories.map((category) => (
        <div key={category.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">#{category.showOrder}</span>
                <h2 className="font-semibold text-slate-950 dark:text-white">{category.name}</h2>
              </div>
              <p className="mt-2 text-xs text-slate-500">slug: {category.slug} · icon: {category.icon || "none"}</p>
            </div>
            <StatusBadge value={category.isActive ? "ACTIVE" : "INACTIVE"} />
          </div>
          
          {category.types && category.types.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800/50">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">ประเภทเอกสาร</p>
              <div className="flex flex-wrap gap-1.5">
                {category.types.map((t: any) => (
                  <span key={t.id} className="inline-flex items-center rounded bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 border border-slate-200/60 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800">
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-1.5">
            <IconButton label="แก้ไข" onClick={() => onEdit(category)} />
            <IconButton label={category.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"} onClick={() => onToggleStatus(category.id, category.isActive)} />
            <IconButton label="ลบ" destructive onClick={() => onDelete(category.id)} />
          </div>
        </div>
      ))}
    </div>
  );
}

function DocumentTypesTable({
  types,
  onEdit,
  onDelete,
  onToggleStatus
}: {
  types: any[];
  onEdit: (type: any) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, current: boolean) => void;
}) {
  return (
    <table className="w-full min-w-[760px] text-left text-sm">
      <thead className="text-xs uppercase text-slate-500">
        <tr>
          <th className="py-3 pr-4 font-semibold">ลำดับ</th>
          <th className="py-3 pr-4 font-semibold">รหัส</th>
          <th className="py-3 pr-4 font-semibold">ประเภทเอกสาร</th>
          <th className="py-3 pr-4 font-semibold">หมวดหมู่</th>
          <th className="py-3 pr-4 font-semibold">สถานะ</th>
          <th className="py-3 font-semibold">จัดการ</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {types.map((type) => (
          <tr key={type.id}>
            <td className="py-4 pr-4 text-slate-600 dark:text-slate-300">{type.showOrder}</td>
            <td className="py-4 pr-4 font-semibold text-slate-950 dark:text-white">{type.slug}</td>
            <td className="py-4 pr-4 text-slate-700 dark:text-slate-200">{type.name}</td>
            <td className="py-4 pr-4 text-slate-600 dark:text-slate-300">{type.category?.name}</td>
            <td className="py-4 pr-4"><StatusBadge value={type.isActive ? "ACTIVE" : "INACTIVE"} /></td>
            <td className="py-4">
              <div className="flex flex-wrap gap-1.5">
                <IconButton label="แก้ไข" onClick={() => onEdit(type)} />
                <IconButton label={type.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"} onClick={() => onToggleStatus(type.id, type.isActive)} />
                <IconButton label="ลบ" destructive onClick={() => onDelete(type.id)} />
              </div>
            </td>
          </tr>
        ))}
        {types.length === 0 && (
          <tr>
            <td colSpan={6} className="py-8 text-center text-slate-500">ไม่มีข้อมูลประเภทเอกสาร</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function TemplateGrid({
  templates,
  onEdit,
  onDelete,
  onToggleStatus
}: {
  templates: any[];
  onEdit: (template: any) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, current: boolean) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {templates.map((template) => (
        <div key={template.id} className="rounded-lg border border-slate-200 p-5 dark:border-slate-800">
          <LayoutTemplate className="size-5 text-teal-700 dark:text-teal-300" />
          <h2 className="mt-4 font-semibold text-slate-950 dark:text-white">{template.name}</h2>
          <p className="mt-1 text-sm text-slate-500">{template.category?.name || "ไม่ระบุหมวดหมู่"}</p>
          <p className="text-sm text-slate-500">{template.documentType?.name || "ไม่ระบุประเภท"} · {template.templateMode}</p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <StatusBadge value={template.isActive ? "ACTIVE" : "INACTIVE"} />
            <StatusBadge value={template.isGlobal ? "Yes" : "No"} />
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            <IconButton label="แก้ไข" onClick={() => onEdit(template)} />
            <IconButton label={template.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"} onClick={() => onToggleStatus(template.id, template.isActive)} />
            <IconButton label="ลบ" destructive onClick={() => onDelete(template.id)} />
            <IconButton label="Designer" onClick={() => window.open(`/th/admin/templates/${template.id}/designer`, '_blank')} />
          </div>
        </div>
      ))}
      {templates.length === 0 && (
        <div className="col-span-full py-8 text-center text-slate-500">ไม่มีข้อมูล Template กลาง</div>
      )}
    </div>
  );
}

function AuditPanel({ compact = false }: { compact?: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Activity Log ล่าสุด</h2>
      <div className="mt-4 space-y-4">
        {auditLogs.map((log) => (
          <div key={`${log.action}-${log.time}`} className="flex gap-3">
            <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
              <Activity className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">{log.action}</p>
              <p className="text-xs leading-5 text-slate-500">{log.actor} · {log.company} · {log.time}</p>
              {!compact && <p className="mt-1 text-xs leading-5 text-slate-400">IP {log.ip} · {log.userAgent} · Target {log.target}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditTable() {
  return (
    <table className="w-full min-w-[960px] text-left text-sm">
      <thead className="text-xs uppercase text-slate-500">
        <tr>
          <th className="py-3 pr-4 font-semibold">เวลา</th>
          <th className="py-3 pr-4 font-semibold">ผู้ใช้</th>
          <th className="py-3 pr-4 font-semibold">บริษัท</th>
          <th className="py-3 pr-4 font-semibold">Action</th>
          <th className="py-3 pr-4 font-semibold">IP Address</th>
          <th className="py-3 pr-4 font-semibold">User Agent</th>
          <th className="py-3 font-semibold">รายละเอียด</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {auditLogs.map((log) => (
          <tr key={`${log.action}-${log.time}`}>
            <td className="py-4 pr-4 text-slate-600 dark:text-slate-300">{log.time}</td>
            <td className="py-4 pr-4 font-semibold text-slate-950 dark:text-white">{log.actor}</td>
            <td className="py-4 pr-4 text-slate-600 dark:text-slate-300">{log.company}</td>
            <td className="py-4 pr-4 text-slate-700 dark:text-slate-200">{log.action}</td>
            <td className="py-4 pr-4 font-mono text-xs text-slate-600 dark:text-slate-300">{log.ip}</td>
            <td className="py-4 pr-4 text-slate-600 dark:text-slate-300">{log.userAgent}</td>
            <td className="py-4"><IconButton label="รายละเอียด" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function SystemAdminWorkspace({ section, data }: { section: AdminSection; data?: any; }) {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<DocumentTypeData | null>(null);
  const [typeToDelete, setTypeToDelete] = useState<string | null>(null);

  // Template State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateData | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  // Template Handlers
  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setIsTemplateModalOpen(true);
  };

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setIsTemplateModalOpen(true);
  };

  const confirmDeleteTemplate = () => {
    if (!templateToDelete) return;
    startTransition(async () => {
      await fetch(`/api/admin/templates/${templateToDelete}`, { method: "DELETE" });
      setTemplateToDelete(null);
      window.location.reload();
    });
  };

  const handleToggleTemplateStatus = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      await fetch(`/api/admin/templates/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      window.location.reload();
    });
  };

  const [isPending, startTransition] = useTransition();

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (cat: any) => {
    setEditingCategory(cat);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = (id: string) => {
    setCategoryToDelete(id);
  };

  const confirmDeleteCategory = () => {
    if (!categoryToDelete) return;
    startTransition(async () => {
      await fetch(`/api/admin/document-categories/${categoryToDelete}`, { method: "DELETE" });
      setCategoryToDelete(null);
      window.location.reload();
    });
  };

  const handleToggleCategoryStatus = (id: string, current: boolean) => {
    startTransition(async () => {
      await fetch(`/api/admin/document-categories/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current })
      });
      window.location.reload();
    });
  };

  const handleAddType = () => {
    setEditingType(null);
    setIsTypeModalOpen(true);
  };

  const handleEditType = (type: any) => {
    setEditingType({ ...type, categoryId: type.category?.id || type.categoryId });
    setIsTypeModalOpen(true);
  };

  const handleDeleteType = (id: string) => {
    setTypeToDelete(id);
  };

  const confirmDeleteType = () => {
    if (!typeToDelete) return;
    startTransition(async () => {
      await fetch(`/api/admin/document-types/${typeToDelete}`, { method: "DELETE" });
      setTypeToDelete(null);
      window.location.reload();
    });
  };

  const handleToggleTypeStatus = (id: string, current: boolean) => {
    startTransition(async () => {
      await fetch(`/api/admin/document-types/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current })
      });
      window.location.reload();
    });
  };

  return (
    <div className="min-h-full bg-[#f6f8fb] text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <CategoryFormModal
        open={isCategoryModalOpen}
        initialData={editingCategory}
        onClose={() => setIsCategoryModalOpen(false)}
        onSuccess={() => setIsCategoryModalOpen(false)}
      />
      <TypeFormModal
        open={isTypeModalOpen}
        initialData={editingType}
        categories={data?.categories || []}
        onClose={() => setIsTypeModalOpen(false)}
        onSuccess={() => { setIsTypeModalOpen(false); window.location.reload(); }}
      />
      <TemplateFormModal
        open={isTemplateModalOpen}
        initialData={editingTemplate}
        categories={data?.categories || []}
        documentTypes={data?.documentTypes || []}
        onClose={() => setIsTemplateModalOpen(false)}
        onSuccess={() => { setIsTemplateModalOpen(false); window.location.reload(); }}
      />
      <ConfirmDialog
        open={!!categoryToDelete}
        title="ยืนยันการลบหมวดหมู่"
        description="คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่นี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
        onCancel={() => setCategoryToDelete(null)}
        onConfirm={confirmDeleteCategory}
        confirmText={isPending ? "กำลังลบ..." : "ยืนยันลบ"}
      />
      <ConfirmDialog
        open={!!typeToDelete}
        title="ยืนยันการลบประเภทเอกสาร"
        description="คุณแน่ใจหรือไม่ว่าต้องการลบประเภทเอกสารนี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
        onCancel={() => setTypeToDelete(null)}
        onConfirm={confirmDeleteType}
        confirmText={isPending ? "กำลังลบ..." : "ยืนยันลบ"}
      />
      <ConfirmDialog
        open={!!templateToDelete}
        title="ยืนยันการลบ Template"
        description="คุณแน่ใจหรือไม่ว่าต้องการลบ Template นี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
        onCancel={() => setTemplateToDelete(null)}
        onConfirm={confirmDeleteTemplate}
        confirmText={isPending ? "กำลังลบ..." : "ยืนยันลบ"}
      />
      <PageHeader
        section={section}
        onAdd={
          section === "document-categories" ? handleAddCategory :
            section === "document-types" ? handleAddType :
              section === "templates" ? handleAddTemplate :
                undefined
        }
      />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {section === "dashboard" && <AdminDashboard />}

        {section === "companies" && (
          <DataShell
            placeholder="ค้นหาชื่อบริษัท ชื่อนิติบุคคล เลขผู้เสียภาษี อีเมล หรือแพ็กเกจ"
            filters={["สถานะ: ทั้งหมด", "ACTIVE", "SUSPENDED", "CANCELLED"]}
            actions={actions.companies}
          >
            <CompanyTable />
          </DataShell>
        )}

        {section === "company-users" && (
          <DataShell
            placeholder="ค้นหาตามชื่อ อีเมล หรือบริษัท"
            filters={["Role: ทั้งหมด", "OWNER", "ADMIN", "ACCOUNTANT", "FINANCE", "HR", "OPERATION", "STAFF", "VIEWER", "สถานะ: ทั้งหมด"]}
            actions={actions.users}
          >
            <CompanyUsersTable />
          </DataShell>
        )}

        {section === "plans" && (
          <DataShell placeholder="ค้นหาแพ็กเกจ ราคา quota หรือ feature" filters={["สถานะ: ทั้งหมด"]} actions={actions.base}>
            <PlanCards />
          </DataShell>
        )}

        {section === "document-categories" && (
          <DataShell
            placeholder="ค้นหาหมวดหมู่ slug หรือ icon"
            filters={["สถานะ: ทั้งหมด", "เรียงตามลำดับ"]}
            actions={[
              { label: "เพิ่มหมวดหมู่", onClick: handleAddCategory },
              "เรียงลำดับ"
            ]}
          >
            {data?.categories?.length > 0 ? (
              <CategoryCards
                categories={data.categories}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
                onToggleStatus={handleToggleCategoryStatus}
              />
            ) : (
              <div className="p-8 text-center text-slate-500">ไม่มีข้อมูลหมวดหมู่เอกสาร</div>
            )}
          </DataShell>
        )}

        {section === "document-types" && (
          <DataShell
            placeholder="ค้นหาประเภทเอกสาร"
            filters={["หมวดหมู่: ทั้งหมด", "สถานะ: ทั้งหมด"]}
            actions={[
              { label: "เพิ่มประเภทเอกสาร", onClick: handleAddType },
              "เรียงลำดับ"
            ]}
          >
            <DocumentTypesTable
              types={data?.documentTypes || []}
              onEdit={handleEditType}
              onDelete={handleDeleteType}
              onToggleStatus={handleToggleTypeStatus}
            />
          </DataShell>
        )}

        {section === "templates" && (
          <DataShell placeholder="ค้นหา Template กลาง หมวดหมู่ หรือประเภทเอกสาร" filters={["Global: ทั้งหมด", "หมวดหมู่: ทั้งหมด", "ประเภทเอกสาร: ทั้งหมด", "สถานะ: ทั้งหมด"]} actions={actions.templates}>
            <TemplateGrid 
              templates={data?.templates || []}
              onEdit={handleEditTemplate}
              onDelete={setTemplateToDelete}
              onToggleStatus={handleToggleTemplateStatus}
            />
          </DataShell>
        )}

        {section === "audit-logs" && (
          <div className="space-y-5">
            <DataShell placeholder="ค้นหาจากชื่อผู้ใช้ บริษัท action หรือ target" filters={["บริษัท: ทั้งหมด", "Action: ทั้งหมด", "วันที่: วันนี้"]} actions={["Export", "รายละเอียด Action"]}>
              <AuditTable />
            </DataShell>
            <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
              <AuditPanel />
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <LockKeyhole className="size-6 text-teal-700 dark:text-teal-300" />
                <h2 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">สิทธิ์การตรวจสอบ</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  เฉพาะ SUPER_ADMIN และ ADMIN กลางเท่านั้นที่เห็น log ทุกบริษัท ส่วน Company User เห็นเฉพาะข้อมูลบริษัทตัวเอง
                </p>
                <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <p className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-600" /> บันทึก actor, action, target, IP</p>
                  <p className="flex items-center gap-2"><ClipboardList className="size-4 text-emerald-600" /> ดู User Agent และรายละเอียด Action</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

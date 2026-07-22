"use client";

import {
  Copy,
  Download,
  Eye,
  FileText,
  Filter,
  LineChart,
  Pencil,
  Plus,
  Save,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { ConfirmDialog } from "@/components/ui/app-components";
import { DocumentDesigner } from "@/components/document-designer";
import { TaxInvoiceTemplate } from "@/components/templates/tax-invoice";
import { QuotationTemplate } from "@/components/templates/quotation";
import { CompanyAffidavitTemplate } from "@/components/templates/company-affidavit";

export type CompanySection =
  | "dashboard"
  | "documents"
  | "document-create"
  | "document-detail"
  | "templates"
  | "designer"
  | "fields"
  | "business-partners"
  | "employees"
  | "departments"
  | "approval-flows"
  | "approvals"
  | "document-number-settings"
  | "reports"
  | "settings-company"
  | "settings-users";

const documents = [
  { id: "QT-2026-0718", name: "ใบเสนอราคาโครงการ POS", category: "บัญชีและการเงิน", type: "ใบเสนอราคา", status: "รออนุมัติ", creator: "คุณวราภรณ์", partner: "Blue Ocean Studio", created: "08 ก.ค. 2026", updated: "08 ก.ค. 2026" },
  { id: "INV-2026-0421", name: "ใบแจ้งหนี้ Subscription", category: "บัญชีและการเงิน", type: "ใบแจ้งหนี้", status: "อนุมัติแล้ว", creator: "คุณอรทัย", partner: "Siam Retail Co., Ltd.", created: "07 ก.ค. 2026", updated: "08 ก.ค. 2026" },
  { id: "TAX-2026-0114", name: "ใบกำกับภาษีเต็มรูป", category: "ภาษี", type: "ใบกำกับภาษี", status: "ชำระแล้ว", creator: "คุณวราภรณ์", partner: "North Star Logistics", created: "03 ก.ค. 2026", updated: "06 ก.ค. 2026" },
  { id: "MOM-2026-0009", name: "รายงานประชุม Q3", category: "การดำเนินงาน", type: "รายงานการประชุม", status: "ร่าง", creator: "คุณกิตติ", partner: "-", created: "01 ก.ค. 2026", updated: "01 ก.ค. 2026" },
];

const templates = [
  { name: "ใบเสนอราคา Standard", source: "Company", category: "บัญชีและการเงิน", type: "ใบเสนอราคา", status: "Active" },
  { name: "ใบกำกับภาษี Global", source: "Global", category: "ภาษี", type: "ใบกำกับภาษี", status: "Active" },
  { name: "สัญญาจ้างงาน", source: "Company", category: "บุคคล", type: "สัญญาจ้างงาน", status: "Inactive" },
];

const partners = [
  { name: "Blue Ocean Studio", type: "CUSTOMER", taxId: "0105565005678", branch: "00000", email: "billing@blueocean.studio", phone: "089-222-4455", address: "12 ซอยอารีย์สัมพันธ์ กรุงเทพฯ", contact: "คุณพิชชา", contactPhone: "089-222-4455", docs: 24 },
  { name: "North Star Logistics", type: "VENDOR", taxId: "0105564004321", branch: "00003", email: "ops@northstar.co.th", phone: "02-778-9090", address: "88 ถนนบางนา-ตราด", contact: "คุณอานนท์", contactPhone: "081-909-2233", docs: 12 },
];

const employees = [
  { code: "EMP-001", name: "คุณวราภรณ์", email: "accountant@example.com", phone: "081-111-2233", position: "Senior Accountant", department: "บัญชี", salary: "฿58,000", start: "01 ม.ค. 2024", resign: "-", status: "ACTIVE" },
  { code: "EMP-002", name: "คุณอรทัย", email: "finance@example.com", phone: "082-444-9988", position: "Finance Manager", department: "การเงิน", salary: "฿72,000", start: "15 มี.ค. 2023", resign: "-", status: "ACTIVE" },
  { code: "EMP-003", name: "คุณกิตติ", email: "operation@example.com", phone: "083-555-1122", position: "Operation Lead", department: "ปฏิบัติการ", salary: "฿49,000", start: "01 มิ.ย. 2025", resign: "-", status: "ACTIVE" },
];

const departments = [
  { name: "บัญชี", status: "ACTIVE", users: 6, employees: 12 },
  { name: "การเงิน", status: "ACTIVE", users: 4, employees: 8 },
  { name: "บุคคล", status: "ACTIVE", users: 3, employees: 5 },
  { name: "ปฏิบัติการ", status: "ACTIVE", users: 9, employees: 38 },
];

const flows = [
  { name: "อนุมัติใบแจ้งหนี้", documentType: "ใบแจ้งหนี้", status: "ACTIVE", steps: ["ACCOUNTANT", "FINANCE", "OWNER"] },
  { name: "อนุมัติใบลา", documentType: "ใบลา", status: "ACTIVE", steps: ["HR", "ADMIN"] },
];

const numberSettings = [
  { type: "ใบเสนอราคา", prefix: "QT", digits: "0001", running: 18, reset: "YEARLY", preview: "QT-2026-0018" },
  { type: "ใบแจ้งหนี้", prefix: "INV", digits: "0001", running: 421, reset: "MONTHLY", preview: "INV-202607-0421" },
  { type: "ใบกำกับภาษี", prefix: "TAX", digits: "0001", running: 114, reset: "YEARLY", preview: "TAX-2026-0114" },
];

const fieldTypes = ["TEXT", "NUMBER", "DATE", "DATETIME", "TEXTAREA", "RICH_TEXT", "IMAGE", "FILE", "TABLE", "SELECT", "CHECKBOX", "RADIO", "SIGNATURE", "BOOLEAN", "CURRENCY"];

const sectionMeta: Record<CompanySection, { title: string; description: string }> = {
  dashboard: { title: "Dashboard บริษัท", description: "ภาพรวมเอกสาร ลูกค้า พนักงาน งานรออนุมัติ และกราฟเอกสารของบริษัท" },
  documents: { title: "รายการเอกสาร", description: "ค้นหา กรอง จัดการ ส่งอนุมัติ export และ archive เอกสารของบริษัท" },
  "document-create": { title: "สร้างเอกสาร", description: "เลือกหมวดหมู่ ประเภท Template กรอก field preview แล้วบันทึกหรือส่งอนุมัติ" },
  "document-detail": { title: "รายละเอียดเอกสาร", description: "ข้อมูลเอกสาร PDF ไฟล์แนบ ประวัติอนุมัติ และประวัติแก้ไข" },
  templates: { title: "Template ของบริษัท", description: "Template บริษัทและ Template กลางที่นำมาใช้ได้ พร้อม Designer" },
  designer: { title: "Document Designer", description: "เครื่องมือออกแบบเอกสารหลายหน้าแบบ drag & drop พร้อม properties และ page manager" },
  fields: { title: "Fields ของ Template", description: "กำหนด field key, label, type, required, placeholder, default, validation และ options" },
  "business-partners": { title: "ลูกค้า / คู่ค้า", description: "จัดการ CUSTOMER/VENDOR และเอกสารที่เกี่ยวข้อง" },
  employees: { title: "พนักงาน", description: "จัดการข้อมูลพนักงาน แผนก สถานะ และเอกสารที่เกี่ยวข้อง" },
  departments: { title: "แผนก", description: "จัดการแผนก ผู้ใช้งาน และพนักงานในแผนก" },
  "approval-flows": { title: "ระบบอนุมัติเอกสาร", description: "กำหนด flow, document type, step, role และ specific approver" },
  approvals: { title: "งานที่รออนุมัติ", description: "ดู preview อนุมัติ ไม่อนุมัติ ใส่หมายเหตุ และดูประวัติ" },
  "document-number-settings": { title: "ตั้งค่าเลขเอกสาร", description: "กำหนด prefix, digits, running number, reset mode และ preview" },
  reports: { title: "รายงาน", description: "รายงานเอกสารตามหมวด สถานะ ผู้สร้าง ลูกค้า ช่วงวันที่ และ export" },
  "settings-company": { title: "ตั้งค่าบริษัท", description: "ข้อมูลบริษัท โลโก้ ที่อยู่ ภาษี ภาษา theme paper VAT และลายเซ็น" },
  "settings-users": { title: "จัดการผู้ใช้บริษัท", description: "เพิ่ม แก้ไข ลบ เปลี่ยน role reset password และระงับผู้ใช้" },
};

function Status({ value }: { value: string }) {
  const color = value === "ACTIVE" || value === "Active" || value === "อนุมัติแล้ว" || value === "ชำระแล้ว"
    ? "bg-emerald-100 text-emerald-800"
    : value === "รออนุมัติ"
      ? "bg-amber-100 text-amber-800"
      : "bg-slate-100 text-slate-700";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${color}`}>{value}</span>;
}

function PageHeader({ section }: { section: CompanySection }) {
  const meta = sectionMeta[section];
  return (
    <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Company Workspace</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-950 dark:text-white">{meta.title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">{meta.description}</p>
      </div>
    </div>
  );
}

type ActionDef = string | { label: string; onClick?: () => void; href?: string; destructive?: boolean };

function ActionButton({ action, label: propLabel, onClick: propOnClick }: { action?: ActionDef; label?: string; onClick?: () => void }) {
  const label = action ? (typeof action === "string" ? action : action.label) : propLabel || "";
  const onClick = action ? (typeof action === "string" ? undefined : action.onClick) : propOnClick;
  const href = action ? (typeof action === "string" ? undefined : action.href) : undefined;
  const destructive = action ? (typeof action === "string" ? false : action.destructive) : false;

  const Icon = label.includes("ลบ") ? Trash2 : label.includes("แก้") ? Pencil : label.includes("Duplicate") ? Copy : label.includes("Export") || label.includes("Download") ? Download : label.includes("Preview") || label.includes("รายละเอียด") ? Eye : label.includes("อนุมัติ") ? Send : Plus;

  const className = `inline-flex h-8 items-center gap-1.5 rounded-md border px-2 text-xs font-medium ${destructive
      ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
    }`;

  if (href) {
    return <Link href={href} className={className}><Icon className="size-3.5" />{label}</Link>;
  }

  return <button onClick={onClick} className={className}><Icon className="size-3.5" />{label}</button>;
}

function Toolbar({ placeholder, filters = [], actions = [] }: { placeholder: string; filters?: string[]; actions?: ActionDef[] }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">{actions.map((item, idx) => <ActionButton key={typeof item === "string" ? item : item.label + idx} action={item} />)}</div>
      <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none sm:w-80" placeholder={placeholder} />
        </label>
        {filters.map((filter) => <select key={filter} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"><option>{filter}</option></select>)}
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700"><Filter className="size-4" />Filter</button>
      </div>
    </div>
  );
}

function DocumentTable({ docs, onDelete }: { docs: any[]; onDelete: (id: string) => void }) {
  return (
    <table className="w-full min-w-[900px] text-left text-sm">
      <thead className="text-xs uppercase text-slate-500"><tr>{["เลขเอกสาร", "ชื่อเอกสาร", "หมวดหมู่", "ประเภท", "สถานะ", "ผู้สร้าง", "วันที่", "จัดการ"].map((h) => <th key={h} className="py-3 pr-4 font-semibold">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-slate-100">
        {docs.length === 0 && (
          <tr>
            <td colSpan={8} className="py-8 text-center text-slate-500">ไม่มีเอกสาร</td>
          </tr>
        )}
        {docs.map((doc) => (
          <tr key={doc.id}>
            <td className="py-4 pr-4 font-semibold text-slate-950">{doc.documentNo}</td>
            <td className="py-4 pr-4 text-slate-700">{doc.title}</td>
            <td className="py-4 pr-4 text-slate-600">{doc.category?.name || "-"}</td>
            <td className="py-4 pr-4 text-slate-600">{doc.documentType?.name || "-"}</td>
            <td className="py-4 pr-4"><Status value={doc.status} /></td>
            <td className="py-4 pr-4 text-slate-600">{doc.createdBy?.name || "-"}</td>
            <td className="py-4 pr-4 text-slate-600">{new Date(doc.createdAt).toLocaleDateString("th-TH")}</td>
            <td className="py-4"><div className="flex flex-wrap gap-1.5">
              <ActionButton action={{ label: "แก้ไข", href: `/th/documents/create?edit=${doc.id}` }} />
              <ActionButton action={{ label: "Preview", href: `/th/documents/${doc.id}` }} />
              <ActionButton action={{ label: "ลบ", destructive: true, onClick: () => onDelete(doc.id) }} />
            </div></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Dashboard({ docs = [] }: { docs?: any[] }) {
  const stats = [
    ["เอกสารทั้งหมด", "1,248"], ["ฉบับร่าง", "82"], ["รออนุมัติ", "36"], ["อนุมัติแล้ว", "904"], ["ลูกค้า", "186"], ["พนักงาน", "64"],
  ];
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">{stats.map(([label, value]) => <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p></div>)}</div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold">กราฟจำนวนเอกสารรายเดือน</h2><div className="mt-4 flex h-48 items-end gap-3">{[45, 62, 58, 74, 88, 96, 82].map((h, i) => <div key={i} className="flex-1 rounded-t bg-teal-500" style={{ height: `${h}%` }} />)}</div></div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold">กราฟแยกตามหมวดหมู่เอกสาร</h2><div className="mt-4 space-y-3">{["บัญชีและการเงิน", "ภาษี", "บุคคล", "การดำเนินงาน", "จดทะเบียน"].map((name, i) => <div key={name}><div className="flex justify-between text-sm"><span>{name}</span><span>{[42, 26, 14, 12, 6][i]}%</span></div><div className="mt-1 h-2 rounded bg-slate-100"><div className="h-2 rounded bg-teal-500" style={{ width: `${[42, 26, 14, 12, 6][i]}%` }} /></div></div>)}</div></div>
      </div>
      <div className="grid gap-5 lg:grid-cols-2"><div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold">เอกสารล่าสุด</h2><div className="mt-3 overflow-x-auto"><DocumentTable docs={docs.slice(0, 5)} onDelete={() => { }} /></div></div><Approvals compact /></div>
    </div>
  );
}

function CreateDocument({ categories = [], documentTypes = [], companyId }: { categories?: any[]; documentTypes?: any[]; companyId?: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [formData, setFormData] = useState({
    title: "",
    documentNo: "",
    categoryId: "",
    documentTypeId: "",
    dataJson: "{}",
  });

  useEffect(() => {
    if (editId && companyId) {
      fetch(`/api/company/${companyId}/documents/${editId}`)
        .then(res => res.json())
        .then(res => {
          if (res.ok && res.data) {
            setFormData({
              title: res.data.title || "",
              documentNo: res.data.documentNo || "",
              categoryId: res.data.categoryId || "",
              documentTypeId: res.data.documentTypeId || "",
              dataJson: JSON.stringify(res.data.dataJson) || "{}",
            });
          }
        });
    } else if (!editId) {
      setFormData(prev => ({ ...prev, documentNo: `DOC-${Date.now()}` }));
    }
  }, [editId, companyId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return alert("Company ID is required");
    startTransition(async () => {
      let finalDataJson;
      try {
        finalDataJson = typeof formData.dataJson === "string" ? JSON.parse(formData.dataJson || "{}") : formData.dataJson;
      } catch (e) {
        finalDataJson = formData.dataJson;
      }

      const payload = {
        title: formData.title,
        documentNo: formData.documentNo,
        categoryId: formData.categoryId || undefined,
        documentTypeId: formData.documentTypeId || undefined,
        dataJson: finalDataJson,
      };

      let res;
      try {
        if (editId) {
          res = await fetch(`/api/company/${companyId}/documents/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          }).then(r => r.json());
        } else {
          res = await fetch(`/api/company/${companyId}/documents`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payload, status: "DRAFT" })
          }).then(r => r.json());
        }
      } catch (err: any) {
        res = { ok: false, error: err.message };
      }

      if (res.ok) {
        window.location.href = "/th/documents";
      } else {
        alert("Error saving document: " + (res.error || res.message || "Failed"));
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 mx-auto w-full max-w-[210mm]">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-xl font-semibold mb-4">{editId ? "แก้ไขเอกสาร" : "สร้างเอกสารใหม่"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">ชื่อเอกสาร</span>
            <input
              required
              className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">หมวดหมู่</span>
            <select
              required
              className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              value={formData.categoryId}
              onChange={(e) => {
                const newCategoryId = e.target.value;
                setFormData({ ...formData, categoryId: newCategoryId, documentTypeId: "" });
              }}
            >
              <option value="">-- เลือกหมวดหมู่ --</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">ประเภทเอกสาร</span>
            <select
              required
              className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              value={formData.documentTypeId}
              onChange={(e) => setFormData({ ...formData, documentTypeId: e.target.value })}
              disabled={!formData.categoryId}
            >
              <option value="">-- เลือกประเภทเอกสาร --</option>
              {documentTypes
                .filter((t: any) => !formData.categoryId || t.categoryId === formData.categoryId)
                .map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </label>
        </form>
      </div>
      <div className="flex justify-center w-full">
        {/* Render Document templates if selected */}
        {documentTypes.find((t: any) => t.id === formData.documentTypeId)?.name?.includes("ใบกำกับภาษี") ? (
          <TaxInvoiceTemplate
            mode="edit"
            data={typeof formData.dataJson === 'string' ? JSON.parse(formData.dataJson || "{}") : formData.dataJson}
            onChange={(data) => setFormData({ ...formData, dataJson: data as any })}
          />
        ) : documentTypes.find((t: any) => t.id === formData.documentTypeId)?.name?.includes("ใบเสนอราคา") ? (
          <QuotationTemplate
            mode="edit"
            data={typeof formData.dataJson === 'string' ? JSON.parse(formData.dataJson || "{}") : formData.dataJson}
            onChange={(data) => setFormData({ ...formData, dataJson: data as any })}
          />
        ) : documentTypes.find((t: any) => t.id === formData.documentTypeId)?.name?.includes("หนังสือรับรอง") || documentTypes.find((t: any) => t.id === formData.documentTypeId)?.name?.includes("จดทะเบียน") ? (
          <CompanyAffidavitTemplate
            mode="edit"
            data={typeof formData.dataJson === 'string' ? JSON.parse(formData.dataJson || "{}") : formData.dataJson}
            onChange={(data) => setFormData({ ...formData, dataJson: data as any })}
          />
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm w-full dark:border-slate-800 dark:bg-slate-950">
            <h2 className="font-semibold mb-2">ข้อมูลเอกสารเพิ่มเติม (JSON)</h2>
            <textarea
              className="h-64 w-full rounded border border-slate-200 p-3 text-sm font-mono dark:border-slate-700 dark:bg-slate-900"
              value={typeof formData.dataJson === 'string' ? formData.dataJson : JSON.stringify(formData.dataJson, null, 2)}
              onChange={(e) => setFormData({ ...formData, dataJson: e.target.value })}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <button type="button" onClick={() => window.location.href = "/th/documents"} className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-md hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">ยกเลิก</button>
        <button type="button" onClick={handleSubmit} disabled={isPending} className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50">
          {isPending ? "กำลังบันทึก..." : "บันทึกเอกสาร"}
        </button>
      </div>
    </div>
  );
}

function DocumentPreview({ title, documentNo, dataJson, documentTypeName }: { title?: string; documentNo?: string; dataJson?: any; documentTypeName?: string }) {
  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-950 dark:text-white">Preview เอกสาร</h2>
        <button onClick={() => window.print()} className="text-sm text-teal-600 hover:underline">พิมพ์ (Print)</button>
      </div>

      <div className="rounded-md bg-slate-100 p-4 overflow-x-auto dark:bg-slate-900 flex justify-center">
        {documentTypeName?.includes("ใบกำกับภาษี") ? (
          <div className="scale-75 origin-top-center">
            <TaxInvoiceTemplate mode="view" data={typeof dataJson === 'string' ? JSON.parse(dataJson || "{}") : dataJson} />
          </div>
        ) : documentTypeName?.includes("ใบเสนอราคา") ? (
          <div className="scale-75 origin-top-center">
            <QuotationTemplate mode="view" data={typeof dataJson === 'string' ? JSON.parse(dataJson || "{}") : dataJson} />
          </div>
        ) : documentTypeName?.includes("หนังสือรับรอง") || documentTypeName?.includes("จดทะเบียน") ? (
          <div className="scale-75 origin-top-center">
            <CompanyAffidavitTemplate mode="view" data={typeof dataJson === 'string' ? JSON.parse(dataJson || "{}") : dataJson} />
          </div>
        ) : (
          <div className="min-h-[460px] w-full max-w-[400px] rounded bg-white p-6 shadow dark:bg-slate-950">
            <p className="text-xl font-bold">{title || "ชื่อเอกสาร"}</p>
            <p className="mt-2 text-sm text-slate-500">{documentNo || "DOC-XXXX"}</p>
            <div className="mt-8 h-20 rounded border border-dashed border-slate-300 dark:border-slate-700" />
            <div className="mt-4 h-32 rounded border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900" />
            <p className="mt-8 text-right text-lg font-semibold">฿0.00</p>
          </div>
        )}
      </div>
    </aside>
  );
}

function DocumentDetail() {
  const doc = documents[0];
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-2">{["แก้ไข", "ส่งอนุมัติ", "Export PDF", "Download", "ลบ"].map((a) => <ActionButton key={a} label={a} />)}</div>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">{Object.entries({ "เลขเอกสาร": doc.id, "ชื่อเอกสาร": doc.name, "หมวดหมู่": doc.category, "ประเภท": doc.type, "สถานะ": doc.status, "ผู้สร้าง": doc.creator, "วันที่สร้าง": doc.created, "แก้ไขล่าสุด": doc.updated, "ไฟล์ PDF": `${doc.id}.pdf`, "ไฟล์แนบ": "contract.pdf, receipt.png" }).map(([k, v]) => <div key={k}><dt className="text-xs text-slate-500">{k}</dt><dd className="mt-1 font-medium text-slate-950">{v}</dd></div>)}</dl>
        <div className="mt-6 grid gap-4 sm:grid-cols-2"><Timeline title="ประวัติการอนุมัติ" items={["ACCOUNTANT approved", "FINANCE pending"]} /><Timeline title="ประวัติการแก้ไข" items={["สร้างเอกสาร", "แก้ไขยอดรวม", "แนบไฟล์ PDF"]} /></div>
      </div>
      <DocumentPreview title={doc.name} documentNo={doc.id} documentTypeName={doc.type} />
    </div>
  );
}

function Timeline({ title, items }: { title: string; items: string[] }) {
  return <div className="rounded-md border border-slate-200 p-4"><h3 className="font-semibold">{title}</h3><div className="mt-3 space-y-2">{items.map((item) => <p key={item} className="text-sm text-slate-600">• {item}</p>)}</div></div>;
}

function Templates() {
  return <div className="grid gap-4 md:grid-cols-3">{templates.map((t) => <div key={t.name} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><LayoutIcon /><h2 className="mt-3 font-semibold">{t.name}</h2><p className="text-sm text-slate-500">{t.source} · {t.category} · {t.type}</p><div className="mt-3"><Status value={t.status} /></div><div className="mt-4 flex flex-wrap gap-1.5">{["แก้ไข", "ลบ", "Duplicate", "Preview", "Designer"].map((a) => <ActionButton key={a} label={a} />)}</div></div>)}</div>;
}

function LayoutIcon() { return <FileText className="size-5 text-teal-700" />; }

function Designer() { return <DocumentDesigner />; }

/*
  return (
    <div className="grid min-h-[760px] gap-4 lg:grid-cols-[240px_1fr_300px]">
      <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><h2 className="font-semibold">Elements</h2><div className="mt-3 grid gap-2">{elementTypes.map((el) => <button key={el.name} className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm"><el.icon className="size-4" />{el.name}</button>)}</div></aside>
      <section className="rounded-lg border border-slate-200 bg-slate-100 p-4 shadow-sm"><div className="mb-3 flex flex-wrap gap-2">{[Undo2, Redo2, ZoomIn, ZoomOut, Save, FileDown, Upload, FileJson].map((Icon, i) => <button key={i} className="grid size-9 place-items-center rounded-md border border-slate-200 bg-white"><Icon className="size-4" /></button>)}</div><div className="mx-auto min-h-[640px] max-w-[794px] border border-slate-300 bg-white p-10 shadow-lg" style={{ backgroundImage: "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)", backgroundSize: "24px 24px" }}><div className="rounded border border-dashed border-teal-400 p-4"><p className="text-2xl font-bold">ใบเสนอราคา</p><p className="mt-2 text-sm">Dynamic Field: {"{{document_number}}"}</p></div><div className="mt-8 h-32 rounded border border-slate-300 bg-slate-50" /></div><div className="mt-4 flex gap-2 overflow-x-auto">{["Page 1", "Page 2", "Page 3"].map((p) => <div key={p} className="w-28 shrink-0 rounded border border-slate-200 bg-white p-3 text-center text-xs">{p}<div className="mt-2 flex justify-center gap-1"><Copy className="size-3" /><Trash2 className="size-3" /></div></div>)}</div></section>
      <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><h2 className="font-semibold">Properties</h2><div className="mt-3 space-y-2">{["ข้อความ", "Font Size", "Font Weight", "Font Family", "สีตัวอักษร", "สีพื้นหลัง", "Border", "Padding", "Margin", "Align", "Width / Height", "X / Y Position", "Dynamic Field Key"].map((p) => <label key={p} className="block text-xs text-slate-500">{p}<input className="mt-1 h-9 w-full rounded-md border border-slate-200 px-2 text-sm" /></label>)}</div><div className="mt-4 flex gap-2"><ActionButton label="ลบ Element" /><ActionButton label="Duplicate Element" /></div></aside>
    </div>
  );
}

*/

function Fields() {
  const rows = fieldTypes.slice(0, 8).map((type, i) => ({ key: `field_${i + 1}`, label: `${type} Field`, type, required: i % 2 === 0 ? "Yes" : "No", placeholder: `กรอก ${type}`, defaultValue: "-", validation: "optional", options: type === "SELECT" ? "A,B,C" : "-" }));
  return <DataTable headers={["Field Key", "Label", "Type", "Required", "Placeholder", "Default", "Validation", "Options"]} rows={rows.map(Object.values)} actions={["เพิ่ม Field", "แก้ไข Field", "ลบ Field", "เรียงลำดับ Field"]} />;
}

function BusinessPartners() {
  const [data, setData] = useState(partners);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const initialForm = {
    name: "",
    type: "CUSTOMER",
    taxId: "",
    branch: "",
    email: "",
    phone: "",
    address: "",
    contact: "",
    contactPhone: ""
  };
  const [formData, setFormData] = useState(initialForm);

  const handleAdd = () => {
    setFormData(initialForm);
    setEditingItem(null);
    setIsEditing(true);
  };

  const handleEdit = (idx: number) => {
    setFormData(data[idx]);
    setEditingItem(idx);
    setIsEditing(true);
  };

  const handleDelete = (idx: number) => {
    setDeleteId(idx);
  };

  const confirmDelete = () => {
    if (deleteId !== null) {
      const newData = [...data];
      newData.splice(deleteId, 1);
      setData(newData);
      setDeleteId(null);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem !== null) {
      const newData = [...data];
      newData[editingItem] = { ...formData, docs: data[editingItem].docs || 0 };
      setData(newData);
    } else {
      setData([{ ...formData, docs: 0 }, ...data]);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-xl font-semibold mb-4">{editingItem !== null ? "แก้ไขข้อมูลลูกค้า / คู่ค้า" : "เพิ่มลูกค้า / คู่ค้าใหม่"}</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium">ชื่อบริษัท/ร้านค้า</span>
              <input required className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-sm font-medium">ประเภท</span>
              <select className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                <option value="CUSTOMER">CUSTOMER</option>
                <option value="VENDOR">VENDOR</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">เลขประจำตัวผู้เสียภาษี (Tax ID)</span>
              <input className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={formData.taxId} onChange={e => setFormData({ ...formData, taxId: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-sm font-medium">รหัสสาขา</span>
              <input className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={formData.branch} onChange={e => setFormData({ ...formData, branch: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-sm font-medium">อีเมล</span>
              <input type="email" className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-sm font-medium">เบอร์โทรศัพท์</span>
              <input className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm font-medium">ที่อยู่</span>
              <textarea className="mt-1 h-20 w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-sm font-medium">ผู้ติดต่อ</span>
              <input className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-sm font-medium">เบอร์โทรผู้ติดต่อ</span>
              <input className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={formData.contactPhone} onChange={e => setFormData({ ...formData, contactPhone: e.target.value })} />
            </label>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-md hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">ยกเลิก</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-md hover:bg-teal-700">บันทึกข้อมูล</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ConfirmDialog
        open={deleteId !== null}
        title="ยืนยันการลบข้อมูล"
        description="คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        confirmText="ยืนยันลบ"
      />
      <div className="flex flex-wrap gap-2">
        <ActionButton action={{ label: "เพิ่มลูกค้า / คู่ค้า", onClick: handleAdd }} />
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="text-xs uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 pr-4 font-semibold">ชื่อบริษัท/ร้านค้า</th>
              <th className="py-3 pr-4 font-semibold">ประเภท</th>
              <th className="py-3 pr-4 font-semibold">Tax ID / สาขา</th>
              <th className="py-3 pr-4 font-semibold">ติดต่อ</th>
              <th className="py-3 pr-4 font-semibold">ผู้ติดต่อ</th>
              <th className="py-3 pr-4 font-semibold">เอกสาร</th>
              <th className="py-3 font-semibold text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.length === 0 ? (
              <tr><td colSpan={7} className="py-8 text-center text-slate-500">ไม่มีข้อมูลลูกค้า / คู่ค้า</td></tr>
            ) : (
              data.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="py-4 pr-4">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{p.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{p.address}</div>
                  </td>
                  <td className="py-4 pr-4">
                    <Status value={p.type} />
                  </td>
                  <td className="py-4 pr-4">
                    <div className="text-slate-700 dark:text-slate-300">{p.taxId || "-"}</div>
                    <div className="text-xs text-slate-500 mt-0.5">สาขา: {p.branch || "-"}</div>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="text-slate-700 dark:text-slate-300">{p.email || "-"}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{p.phone || "-"}</div>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="text-slate-700 dark:text-slate-300">{p.contact || "-"}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{p.contactPhone || "-"}</div>
                  </td>
                  <td className="py-4 pr-4 text-slate-700 dark:text-slate-300">{p.docs || 0}</td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <ActionButton action={{ label: "แก้ไข", onClick: () => handleEdit(idx) }} />
                      <ActionButton action={{ label: "ลบ", destructive: true, onClick: () => handleDelete(idx) }} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Employees() {
  return <DataTable headers={["รหัส", "ชื่อ", "อีเมล", "เบอร์โทร", "ตำแหน่ง", "แผนก", "เงินเดือน", "เริ่มงาน", "ลาออก", "สถานะ"]} rows={employees.map(Object.values)} actions={["เพิ่มพนักงาน", "แก้ไขพนักงาน", "ลบพนักงาน", "ดูเอกสารที่เกี่ยวข้อง"]} />;
}

function Departments() {
  return <DataTable headers={["แผนก", "สถานะ", "ผู้ใช้งาน", "พนักงาน"]} rows={departments.map((d) => [d.name, d.status, d.users, d.employees])} actions={["เพิ่มแผนก", "แก้ไขแผนก", "ลบแผนก", "เปิด/ปิดแผนก", "ดูผู้ใช้งาน", "ดูพนักงาน"]} />;
}

function ApprovalFlows() {
  return <div className="grid gap-4 md:grid-cols-2">{flows.map((flow) => <div key={flow.name} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold">{flow.name}</h2><p className="mt-1 text-sm text-slate-500">Document Type: {flow.documentType}</p><div className="mt-3"><Status value={flow.status} /></div><div className="mt-4 flex items-center gap-2">{flow.steps.map((step, i) => <span key={step} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">Step {i + 1}: {step}</span>)}</div><div className="mt-4 flex flex-wrap gap-1.5">{["เพิ่ม Flow", "แก้ไข Flow", "ลบ Flow", "เพิ่ม Step", "ลบ Step", "เรียงลำดับ Step"].map((a) => <ActionButton key={a} label={a} />)}</div></div>)}</div>;
}

function Approvals({ compact = false }: { compact?: boolean }) {
  return <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold">งานที่รออนุมัติ</h2><div className="mt-3 space-y-3">{documents.filter((d) => d.status === "รออนุมัติ").map((doc) => <div key={doc.id} className="rounded-md border border-slate-200 p-3"><p className="font-semibold">{doc.id} · {doc.name}</p><p className="text-sm text-slate-500">{doc.creator} · {doc.created}</p>{!compact && <div className="mt-3 flex flex-wrap gap-1.5">{["รายละเอียด", "Preview", "อนุมัติ", "ไม่อนุมัติ", "ใส่หมายเหตุ", "ประวัติอนุมัติ"].map((a) => <ActionButton key={a} label={a} />)}</div>}</div>)}</div></div>;
}

function NumberSettings() {
  return <DataTable headers={["ประเภทเอกสาร", "Prefix", "จำนวนหลัก", "Running Number", "Reset Mode", "Preview"]} rows={numberSettings.map(Object.values)} actions={["แก้ไข", "Preview เลขเอกสาร"]} />;
}

function Reports() {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{["จำนวนเอกสาร", "ตามหมวดหมู่", "ตามสถานะ", "ตามผู้สร้าง", "ตามลูกค้า", "ตามช่วงวันที่"].map((r) => <div key={r} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><LineChart className="size-5 text-teal-700" /><h2 className="mt-3 font-semibold">รายงานเอกสาร{r}</h2><p className="mt-1 text-sm text-slate-500">Export Excel / PDF</p><div className="mt-4 flex gap-2"><ActionButton label="Export Excel" /><ActionButton label="Export PDF" /></div></div>)}</div>;
}

function SettingsCompany() {
  const fields = ["ชื่อบริษัท", "โลโก้", "ที่อยู่", "เลขประจำตัวผู้เสียภาษี", "ภาษา", "Theme", "Default Paper Size", "Default VAT", "ลายเซ็นบริษัท"];
  return <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="grid gap-4 md:grid-cols-2">{fields.map((f) => <label key={f} className="block text-sm font-medium text-slate-700">{f}<input className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm" placeholder={`แก้ไข${f}`} /></label>)}</div><button className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-teal-600 px-4 text-sm font-semibold text-white"><Save className="size-4" />บันทึก</button></div>;
}

function DataTable({ headers, rows, actions }: { headers: string[]; rows: (string | number)[][]; actions: string[] }) {
  return <div className="space-y-4"><div className="flex flex-wrap gap-2">{actions.map((a) => <ActionButton key={a} label={a} />)}</div><div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><table className="w-full min-w-[900px] text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr>{headers.map((h) => <th key={h} className="py-3 pr-4 font-semibold">{h}</th>)}<th className="py-3 font-semibold">จัดการ</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} className="py-4 pr-4 text-slate-700">{cell}</td>)}<td className="py-4"><div className="flex gap-1.5"><ActionButton label="แก้ไข" /><ActionButton label="ลบ" /></div></td></tr>)}</tbody></table></div></div>;
}

export function CompanyWorkspace({ section, data, companyId }: { section: CompanySection; data?: any; companyId?: string }) {
  const meta = sectionMeta[section];

  const [isPending, startTransition] = useTransition();
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  const confirmDeleteDoc = () => {
    if (!documentToDelete || !companyId) return;
    startTransition(async () => {
      await fetch(`/api/company/${companyId}/documents/${documentToDelete}`, { method: "DELETE" });
      setDocumentToDelete(null);
      window.location.reload();
    });
  };

  return (
    <div className="min-h-full bg-[#f6f8fb] text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <ConfirmDialog
        open={!!documentToDelete}
        title="ยืนยันการลบเอกสาร"
        description="คุณแน่ใจหรือไม่ว่าต้องการลบเอกสารนี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
        onCancel={() => setDocumentToDelete(null)}
        onConfirm={confirmDeleteDoc}
        confirmText={isPending ? "กำลังลบ..." : "ยืนยันลบ"}
      />
      <PageHeader section={section} />
      <main className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        {section === "dashboard" && <Dashboard docs={data?.documents || []} />}
        {section === "documents" && (
          <>
            <Toolbar
              placeholder="ค้นหาเลขเอกสารหรือชื่อเอกสาร"
              filters={["หมวดหมู่", "ประเภทเอกสาร", "สถานะ", "วันที่"]}
              actions={[
                { label: "เพิ่มเอกสาร", href: "/th/documents/create" },
              ]}
            />
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <DocumentTable docs={data?.documents || []} onDelete={setDocumentToDelete} />
            </div>
          </>
        )}
        {section === "document-create" && <CreateDocument categories={data?.categories} documentTypes={data?.documentTypes} companyId={companyId} />}
        {section === "document-detail" && <DocumentDetail />}
        {section === "templates" && <><Toolbar placeholder="ค้นหา Template" filters={["Company/Global", "สถานะ"]} actions={["เพิ่ม Template", "แก้ไข", "ลบ", "Duplicate", "Preview", "Active/Inactive", "Designer"]} /><Templates /></>}
        {section === "designer" && <Designer />}
        {section === "fields" && <Fields />}
        {section === "business-partners" && <><Toolbar placeholder="ค้นหาลูกค้า / คู่ค้า" filters={["CUSTOMER / VENDOR"]} actions={[]} /><BusinessPartners /></>}
        {section === "employees" && <><Toolbar placeholder="ค้นหาพนักงาน" filters={["แผนก", "สถานะ"]} actions={[]} /><Employees /></>}
        {section === "departments" && <Departments />}
        {section === "approval-flows" && <ApprovalFlows />}
        {section === "approvals" && <Approvals />}
        {section === "document-number-settings" && <NumberSettings />}
        {section === "reports" && <Reports />}
        {section === "settings-company" && <SettingsCompany />}
        {section === "settings-users" && <DataTable headers={["ชื่อ", "อีเมล", "Role", "สถานะ"]} rows={[["Company Owner", "owner@example.com", "OWNER", "ACTIVE"], ["Accountant", "accountant@example.com", "ACCOUNTANT", "ACTIVE"], ["Viewer", "viewer@example.com", "VIEWER", "SUSPENDED"]]} actions={["เพิ่มผู้ใช้", "แก้ไขผู้ใช้", "ลบผู้ใช้", "เปลี่ยน Role", "Reset Password", "ระงับผู้ใช้", "เปิดใช้งานผู้ใช้"]} />}
        <div className="sr-only">{meta.title}</div>
      </main>
    </div>
  );
}

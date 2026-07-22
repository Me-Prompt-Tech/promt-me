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

import { ConfirmDialog, FormModal } from "@/components/ui/app-components";
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
  return <DataTable headers={["ชื่อ", "ประเภท", "Tax ID", "สาขา", "อีเมล", "เบอร์โทร", "ที่อยู่", "ผู้ติดต่อ", "เอกสาร"]} rows={partners.map((p) => [p.name, p.type, p.taxId, p.branch, p.email, p.phone, p.address, `${p.contact} ${p.contactPhone}`, p.docs])} actions={["เพิ่มลูกค้า", "แก้ไขลูกค้า", "ลบลูกค้า", "ดูเอกสารที่เกี่ยวข้อง"]} />;
}

function EmployeesSection({
  companyId,
  initialEmployees = [],
  departments = [],
}: {
  companyId?: string;
  initialEmployees?: any[];
  departments?: any[];
}) {
  const [employeesList, setEmployeesList] = useState<any[]>(() => {
    if (initialEmployees && initialEmployees.length > 0) {
      return initialEmployees;
    }
    return [
      { id: "EMP-001", code: "EMP-001", name: "คุณวราภรณ์", email: "accountant@example.com", phone: "081-111-2233", position: "Senior Accountant", department: { name: "บัญชี" }, departmentId: "", salarySatang: 5800000, startDate: "2024-01-01", endDate: "-", status: "ACTIVE" },
      { id: "EMP-002", code: "EMP-002", name: "คุณอรทัย", email: "finance@example.com", phone: "082-444-9988", position: "Finance Manager", department: { name: "การเงิน" }, departmentId: "", salarySatang: 7200000, startDate: "2023-03-15", endDate: "-", status: "ACTIVE" },
      { id: "EMP-003", code: "EMP-003", name: "คุณกิตติ", email: "operation@example.com", phone: "083-555-1122", position: "Operation Lead", department: { name: "ปฏิบัติการ" }, departmentId: "", salarySatang: 4900000, startDate: "2025-06-01", endDate: "-", status: "ACTIVE" },
    ];
  });

  const [deptList, setDeptList] = useState<any[]>(() => {
    if (departments && departments.length > 0) return departments;
    return [
      { id: "dept-1", name: "บัญชี" },
      { id: "dept-2", name: "การเงิน" },
      { id: "dept-3", name: "บุคคล" },
      { id: "dept-4", name: "ปฏิบัติการ" },
    ];
  });

  useEffect(() => {
    if (initialEmployees && initialEmployees.length > 0) {
      setEmployeesList(initialEmployees);
    }
  }, [initialEmployees]);

  useEffect(() => {
    if (departments && departments.length > 0) {
      setDeptList(departments);
    }
  }, [departments]);

  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    email: "",
    phone: "",
    position: "",
    departmentId: "",
    salary: "",
    startDate: "",
    endDate: "",
    status: "ACTIVE",
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      code: `EMP-00${employeesList.length + 1}`,
      name: "",
      email: "",
      phone: "",
      position: "",
      departmentId: deptList[0]?.id || "",
      salary: "30000",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      status: "ACTIVE",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: any) => {
    setEditingItem(emp);
    const salaryVal = emp.salarySatang != null 
      ? (emp.salarySatang / 100).toString() 
      : (typeof emp.salary === "string" ? emp.salary.replace(/[^0-9.]/g, "") : "");

    let formattedStartDate = "";
    if (emp.startDate) {
      try {
        formattedStartDate = new Date(emp.startDate).toISOString().split("T")[0];
      } catch {
        formattedStartDate = emp.startDate;
      }
    }

    let formattedEndDate = "";
    if (emp.endDate && emp.endDate !== "-") {
      try {
        formattedEndDate = new Date(emp.endDate).toISOString().split("T")[0];
      } catch {
        formattedEndDate = emp.endDate;
      }
    }

    setFormData({
      code: emp.code || "",
      name: emp.name || "",
      email: emp.email || "",
      phone: emp.phone || "",
      position: emp.position || "",
      departmentId: emp.departmentId || emp.department?.id || "",
      salary: salaryVal,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      status: emp.status || "ACTIVE",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) {
      alert("กรุณากรอกชื่อพนักงาน");
      return;
    }

    setIsSubmitting(true);
    const salaryNum = parseFloat(formData.salary || "0");
    const salarySatang = isNaN(salaryNum) ? 0 : Math.round(salaryNum * 100);

    const validDeptId = formData.departmentId && /^[0-9a-fA-F]{24}$/.test(formData.departmentId)
      ? formData.departmentId
      : undefined;

    const payload = {
      code: formData.code || undefined,
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      position: formData.position || undefined,
      departmentId: validDeptId,
      salarySatang,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      status: formData.status,
    };

    if (companyId) {
      try {
        let res;
        if (editingItem) {
          res = await fetch(`/api/company/${companyId}/employees/${editingItem.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }).then((r) => r.json());
        } else {
          res = await fetch(`/api/company/${companyId}/employees`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }).then((r) => r.json());
        }

        if (res.ok && res.data) {
          const saved = res.data;
          if (editingItem) {
            setEmployeesList((prev) => prev.map((item) => (item.id === editingItem.id ? saved : item)));
          } else {
            setEmployeesList((prev) => [saved, ...prev]);
          }
          setIsModalOpen(false);
        } else {
          const detailMsg = res.details?.map((d: any) => `${d.field ? d.field + ": " : ""}${d.message}`).join(", ");
          alert((res.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล") + (detailMsg ? `\n- ${detailMsg}` : ""));
        }
      } catch (err: any) {
        alert("เกิดข้อผิดพลาด: " + err.message);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const deptObj = deptList.find((d) => d.id === formData.departmentId) || { name: deptList.find((d) => d.id === formData.departmentId)?.name || "-" };
      const formattedSalary = salaryNum > 0 ? `฿${salaryNum.toLocaleString()}` : "-";
      if (editingItem) {
        const updated = {
          ...editingItem,
          code: formData.code,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          position: formData.position,
          departmentId: formData.departmentId,
          department: deptObj,
          salary: formattedSalary,
          salarySatang,
          startDate: formData.startDate || "-",
          endDate: formData.endDate || "-",
          status: formData.status,
        };
        setEmployeesList((prev) => prev.map((item) => (item.id === editingItem.id ? updated : item)));
      } else {
        const newItem = {
          id: `EMP-${Date.now()}`,
          code: formData.code,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          position: formData.position,
          departmentId: formData.departmentId,
          department: deptObj,
          salary: formattedSalary,
          salarySatang,
          startDate: formData.startDate || "-",
          endDate: formData.endDate || "-",
          status: formData.status,
        };
        setEmployeesList((prev) => [newItem, ...prev]);
      }
      setIsSubmitting(false);
      setIsModalOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);

    if (companyId) {
      try {
        const res = await fetch(`/api/company/${companyId}/employees/${deletingId}`, {
          method: "DELETE",
        }).then((r) => r.json());

        if (res.ok) {
          setEmployeesList((prev) => prev.filter((item) => item.id !== deletingId));
          setDeletingId(null);
        } else {
          alert(res.message || "เกิดข้อผิดพลาดในการลบข้อมูล");
        }
      } catch (err: any) {
        alert("เกิดข้อผิดพลาด: " + err.message);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setEmployeesList((prev) => prev.filter((item) => item.id !== deletingId));
      setDeletingId(null);
      setIsSubmitting(false);
    }
  };

  const filteredEmployees = employeesList.filter((emp) => {
    const q = search.toLowerCase().trim();
    const deptName = emp.department?.name || (typeof emp.department === "string" ? emp.department : "");
    const matchesSearch =
      !q ||
      (emp.name && emp.name.toLowerCase().includes(q)) ||
      (emp.code && emp.code.toLowerCase().includes(q)) ||
      (emp.email && emp.email.toLowerCase().includes(q)) ||
      (emp.position && emp.position.toLowerCase().includes(q)) ||
      (deptName && deptName.toLowerCase().includes(q));

    const matchesDept =
      filterDept === "ALL" ||
      emp.departmentId === filterDept ||
      deptName === filterDept;

    const matchesStatus = filterStatus === "ALL" || emp.status === filterStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="inline-flex h-10 items-center gap-1.5 rounded-md bg-teal-600 px-3.5 text-xs font-semibold text-white hover:bg-teal-700 transition shadow-sm"
          >
            <Plus className="size-4" />
            เพิ่มพนักงาน
          </button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อ, รหัส, ตำแหน่ง"
              className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 sm:w-64"
            />
          </div>

          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="ALL">แผนกทั้งหมด</option>
            {deptList.map((d) => (
              <option key={d.id || d.name} value={d.id || d.name}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="ALL">สถานะทั้งหมด</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="DELETED">DELETED</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <table className="w-full min-w-[950px] text-left text-sm">
          <thead className="text-xs uppercase text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="py-3 pr-4 font-semibold">รหัส</th>
              <th className="py-3 pr-4 font-semibold">ชื่อ</th>
              <th className="py-3 pr-4 font-semibold">อีเมล</th>
              <th className="py-3 pr-4 font-semibold">เบอร์โทร</th>
              <th className="py-3 pr-4 font-semibold">ตำแหน่ง</th>
              <th className="py-3 pr-4 font-semibold">แผนก</th>
              <th className="py-3 pr-4 font-semibold">เงินเดือน</th>
              <th className="py-3 pr-4 font-semibold">เริ่มงาน</th>
              <th className="py-3 pr-4 font-semibold">ลาออก</th>
              <th className="py-3 pr-4 font-semibold">สถานะ</th>
              <th className="py-3 font-semibold text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-slate-500">
                  ไม่พบข้อมูลพนักงาน
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => {
                const deptName = emp.department?.name || (typeof emp.department === "string" ? emp.department : "-");
                let formattedSalary = emp.salary;
                if (!formattedSalary && emp.salarySatang != null) {
                  formattedSalary = `฿${(emp.salarySatang / 100).toLocaleString()}`;
                }

                let startDateStr = emp.startDate || "-";
                if (emp.startDate && emp.startDate !== "-") {
                  try {
                    const d = new Date(emp.startDate);
                    if (!isNaN(d.getTime())) {
                      startDateStr = d.toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" });
                    }
                  } catch {}
                }

                let endDateStr = emp.endDate || "-";
                if (emp.endDate && emp.endDate !== "-") {
                  try {
                    const d = new Date(emp.endDate);
                    if (!isNaN(d.getTime())) {
                      endDateStr = d.toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" });
                    }
                  } catch {}
                }

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <td className="py-4 pr-4 font-semibold text-slate-950 dark:text-slate-100">{emp.code || "-"}</td>
                    <td className="py-4 pr-4 font-medium text-slate-800 dark:text-slate-200">{emp.name}</td>
                    <td className="py-4 pr-4 text-slate-600 dark:text-slate-400">{emp.email || "-"}</td>
                    <td className="py-4 pr-4 text-slate-600 dark:text-slate-400">{emp.phone || "-"}</td>
                    <td className="py-4 pr-4 text-slate-700 dark:text-slate-300">{emp.position || "-"}</td>
                    <td className="py-4 pr-4 text-slate-700 dark:text-slate-300">{deptName}</td>
                    <td className="py-4 pr-4 text-slate-700 dark:text-slate-300 font-medium">{formattedSalary || "-"}</td>
                    <td className="py-4 pr-4 text-slate-600 dark:text-slate-400 text-xs">{startDateStr}</td>
                    <td className="py-4 pr-4 text-slate-600 dark:text-slate-400 text-xs">{endDateStr}</td>
                    <td className="py-4 pr-4">
                      <Status value={emp.status || "ACTIVE"} />
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
                        >
                          <Pencil className="size-3.5" />
                          แก้ไข
                        </button>
                        <button
                          onClick={() => setDeletingId(emp.id)}
                          className="inline-flex h-8 items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2.5 text-xs font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 transition"
                        >
                          <Trash2 className="size-3.5" />
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Form Modal */}
      <FormModal
        open={isModalOpen}
        title={editingItem ? "แก้ไขข้อมูลพนักงาน" : "เพิ่มพนักงานใหม่"}
        description={editingItem ? `แก้ไขข้อมูลของ ${editingItem.name}` : "กรอกข้อมูลพนักงานที่ต้องการเพิ่มเข้าสู่ระบบ"}
        onClose={() => setIsModalOpen(false)}
        onSubmit={() => handleSubmit()}
      >
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 text-left">
          <label className="block">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">รหัสพนักงาน</span>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="เช่น EMP-001"
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">ชื่อ-นามสกุล <span className="text-rose-500">*</span></span>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="กรอกชื่อ-นามสกุล"
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">อีเมล</span>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@company.com"
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">เบอร์โทรศัพท์</span>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="08X-XXX-XXXX"
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">ตำแหน่ง</span>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="เช่น Accountant, Developer"
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">แผนก</span>
            <select
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">-- เลือกแผนก --</option>
              {deptList.map((d) => (
                <option key={d.id || d.name} value={d.id || d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">เงินเดือน (บาท)</span>
            <input
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              placeholder="เช่น 35000"
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">สถานะ</span>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="DELETED">DELETED</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">วันที่เริ่มงาน</span>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">วันที่ลาออก (ถ้ามี)</span>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>
        </form>
      </FormModal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!deletingId}
        title="ยืนยันการลบพนักงาน"
        description="คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลพนักงานรายนี้? ข้อมูลจะถูกลบออกจากระบบและไม่สามารถย้อนกลับได้"
        confirmText={isSubmitting ? "กำลังลบ..." : "ยืนยันลบ"}
        cancelText="ยกเลิก"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}

function DepartmentsSection({
  companyId,
  initialDepartments = [],
  initialEmployees = [],
  initialUsers = [],
}: {
  companyId?: string;
  initialDepartments?: any[];
  initialEmployees?: any[];
  initialUsers?: any[];
}) {
  const [deptList, setDeptList] = useState<any[]>(() => {
    if (initialDepartments && initialDepartments.length > 0) {
      return initialDepartments;
    }
    return [
      { id: "dept-1", name: "บัญชี", description: "ฝ่ายบัญชีและการเงินหลัก", isActive: true, status: "ACTIVE", users: 1, employees: 1, _count: { users: 1, employees: 1 } },
      { id: "dept-2", name: "การเงิน", description: "ฝ่ายการเงิน วางแผนงบประมาณ", isActive: true, status: "ACTIVE", users: 1, employees: 1, _count: { users: 1, employees: 1 } },
      { id: "dept-3", name: "บุคคล", description: "ฝ่ายบริหารทรัพยากรบุคคล (HR)", isActive: true, status: "ACTIVE", users: 1, employees: 0, _count: { users: 1, employees: 0 } },
      { id: "dept-4", name: "ปฏิบัติการ", description: "ฝ่ายปฏิบัติการและคลังสินค้า", isActive: true, status: "ACTIVE", users: 1, employees: 1, _count: { users: 1, employees: 1 } },
    ];
  });

  useEffect(() => {
    if (initialDepartments && initialDepartments.length > 0) {
      setDeptList(initialDepartments);
    }
  }, [initialDepartments]);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      description: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: any) => {
    setEditingItem(dept);
    const activeState = dept.isActive ?? (dept.status === "ACTIVE");
    setFormData({
      name: dept.name || "",
      description: dept.description || "",
      isActive: activeState,
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (dept: any) => {
    const nextIsActive = !(dept.isActive ?? (dept.status === "ACTIVE"));
    const nextStatus = nextIsActive ? "ACTIVE" : "INACTIVE";

    if (companyId) {
      try {
        const res = await fetch(`/api/company/${companyId}/departments/${dept.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: dept.name,
            description: dept.description,
            isActive: nextIsActive,
          }),
        }).then((r) => r.json());

        if (res.ok && res.data) {
          setDeptList((prev) =>
            prev.map((item) => (item.id === dept.id ? { ...res.data, status: nextStatus } : item))
          );
        } else {
          alert(res.message || "เกิดข้อผิดพลาดในการเปลี่ยนสถานะ");
        }
      } catch (err: any) {
        alert("เกิดข้อผิดพลาด: " + err.message);
      }
    } else {
      setDeptList((prev) =>
        prev.map((item) =>
          item.id === dept.id
            ? { ...item, isActive: nextIsActive, status: nextStatus }
            : item
        )
      );
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) {
      alert("กรุณากรอกชื่อแผนก");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: formData.name.trim(),
      description: formData.description ? formData.description.trim() : undefined,
      isActive: formData.isActive,
    };

    if (companyId) {
      try {
        let res;
        if (editingItem) {
          res = await fetch(`/api/company/${companyId}/departments/${editingItem.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }).then((r) => r.json());
        } else {
          res = await fetch(`/api/company/${companyId}/departments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }).then((r) => r.json());
        }

        if (res.ok && res.data) {
          const saved = res.data;
          const formatted = {
            ...saved,
            status: saved.isActive ? "ACTIVE" : "INACTIVE",
            _count: saved._count || editingItem?._count || { users: 0, employees: 0 },
          };
          if (editingItem) {
            setDeptList((prev) => prev.map((item) => (item.id === editingItem.id ? formatted : item)));
          } else {
            setDeptList((prev) => [formatted, ...prev]);
          }
          setIsModalOpen(false);
        } else {
          alert(res.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        }
      } catch (err: any) {
        alert("เกิดข้อผิดพลาด: " + err.message);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const nextStatus = formData.isActive ? "ACTIVE" : "INACTIVE";
      if (editingItem) {
        const updated = {
          ...editingItem,
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive,
          status: nextStatus,
        };
        setDeptList((prev) => prev.map((item) => (item.id === editingItem.id ? updated : item)));
      } else {
        const newItem = {
          id: `dept-${Date.now()}`,
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive,
          status: nextStatus,
          users: 0,
          employees: 0,
          _count: { users: 0, employees: 0 },
        };
        setDeptList((prev) => [newItem, ...prev]);
      }
      setIsSubmitting(false);
      setIsModalOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);

    if (companyId) {
      try {
        const res = await fetch(`/api/company/${companyId}/departments/${deletingId}`, {
          method: "DELETE",
        }).then((r) => r.json());

        if (res.ok) {
          setDeptList((prev) => prev.filter((item) => item.id !== deletingId));
          setDeletingId(null);
        } else {
          alert(res.message || "เกิดข้อผิดพลาดในการลบข้อมูล");
        }
      } catch (err: any) {
        alert("เกิดข้อผิดพลาด: " + err.message);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setDeptList((prev) => prev.filter((item) => item.id !== deletingId));
      setDeletingId(null);
      setIsSubmitting(false);
    }
  };

  const filteredDepartments = deptList.filter((dept) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (dept.name && dept.name.toLowerCase().includes(q)) ||
      (dept.description && dept.description.toLowerCase().includes(q));

    const activeState = dept.isActive ?? (dept.status === "ACTIVE");
    const matchesStatus =
      filterStatus === "ALL" ||
      (filterStatus === "ACTIVE" && activeState) ||
      (filterStatus === "INACTIVE" && !activeState);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="inline-flex h-10 items-center gap-1.5 rounded-md bg-teal-600 px-3.5 text-xs font-semibold text-white hover:bg-teal-700 transition shadow-sm"
          >
            <Plus className="size-4" />
            เพิ่มแผนก
          </button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อแผนก หรือรายละเอียด"
              className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 sm:w-64"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="ALL">สถานะทั้งหมด</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="text-xs uppercase text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="py-3 pr-4 font-semibold">ชื่อแผนก</th>
              <th className="py-3 pr-4 font-semibold">รายละเอียด</th>
              <th className="py-3 pr-4 font-semibold">สถานะ</th>
              <th className="py-3 pr-4 font-semibold">ผู้ใช้งาน</th>
              <th className="py-3 pr-4 font-semibold">พนักงาน</th>
              <th className="py-3 font-semibold text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredDepartments.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  ไม่พบข้อมูลแผนก
                </td>
              </tr>
            ) : (
              filteredDepartments.map((dept) => {
                const activeState = dept.isActive ?? (dept.status === "ACTIVE");
                const statusStr = activeState ? "ACTIVE" : "INACTIVE";
                const userCount = (() => {
                  if (initialUsers && initialUsers.length > 0) {
                    return initialUsers.filter((u: any) => {
                      if (u.departmentId && dept.id && u.departmentId === dept.id) return true;
                      const deptName = u.department?.name || (typeof u.department === "string" ? u.department : "");
                      return deptName && deptName === dept.name;
                    }).length;
                  }
                  return dept._count?.users ?? dept.users ?? 0;
                })();
                const employeeCount = (() => {
                  if (initialEmployees && initialEmployees.length > 0) {
                    return initialEmployees.filter((emp: any) => {
                      if (emp.departmentId && dept.id && emp.departmentId === dept.id) return true;
                      const deptName = emp.department?.name || (typeof emp.department === "string" ? emp.department : "");
                      return deptName && deptName === dept.name;
                    }).length;
                  }
                  return dept._count?.employees ?? dept.employees ?? 0;
                })();

                return (
                  <tr key={dept.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <td className="py-4 pr-4 font-semibold text-slate-950 dark:text-slate-100">{dept.name}</td>
                    <td className="py-4 pr-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">{dept.description || "-"}</td>
                    <td className="py-4 pr-4">
                      <Status value={statusStr} />
                    </td>
                    <td className="py-4 pr-4 text-slate-700 dark:text-slate-300 font-medium">{userCount}</td>
                    <td className="py-4 pr-4 text-slate-700 dark:text-slate-300 font-medium">{employeeCount}</td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(dept)}
                          title="เปิด/ปิดสถานะแผนก"
                          className={`inline-flex h-8 items-center gap-1 rounded-md border px-2.5 text-xs font-medium transition ${
                            activeState
                              ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
                          }`}
                        >
                          {activeState ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                        </button>
                        <button
                          onClick={() => handleOpenEdit(dept)}
                          className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
                        >
                          <Pencil className="size-3.5" />
                          แก้ไข
                        </button>
                        <button
                          onClick={() => setDeletingId(dept.id)}
                          className="inline-flex h-8 items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2.5 text-xs font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 transition"
                        >
                          <Trash2 className="size-3.5" />
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Form Modal */}
      <FormModal
        open={isModalOpen}
        title={editingItem ? "แก้ไขข้อมูลแผนก" : "เพิ่มแผนกใหม่"}
        description={editingItem ? `แก้ไขรายละเอียดของแผนก ${editingItem.name}` : "กรอกชื่อแผนกและรายละเอียดที่ต้องการเพิ่ม"}
        onClose={() => setIsModalOpen(false)}
        onSubmit={() => handleSubmit()}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <label className="block">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">ชื่อแผนก <span className="text-rose-500">*</span></span>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="เช่น ฝ่ายบัญชีและการเงิน"
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">รายละเอียดแผนก</span>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="อธิบายหน้าที่หรือรายละเอียดของแผนกนี้"
              className="mt-1 w-full rounded-md border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-teal-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="size-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">เปิดใช้งานแผนกนี้ (Active)</span>
          </label>
        </form>
      </FormModal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!deletingId}
        title="ยืนยันการลบแผนก"
        description="คุณแน่ใจหรือไม่ว่าต้องการลบแผนกนี้? ข้อมูลจะถูกลบออกจากระบบและไม่สามารถย้อนกลับได้"
        confirmText={isSubmitting ? "กำลังลบ..." : "ยืนยันลบ"}
        cancelText="ยกเลิก"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
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
        {section === "employees" && <EmployeesSection companyId={companyId} initialEmployees={data?.employees} departments={data?.departments} />}
        {section === "departments" && <DepartmentsSection companyId={companyId} initialDepartments={data?.departments} initialEmployees={data?.employees} initialUsers={data?.users} />}
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

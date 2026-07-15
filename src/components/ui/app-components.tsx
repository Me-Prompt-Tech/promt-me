"use client";

import {
  AlertTriangle,
  Check,
  ChevronDown,
  Download,
  Eye,
  FileText,
  ImagePlus,
  Layers3,
  Loader2,
  Search,
  Settings2,
  SlidersHorizontal,
  UploadCloud,
  X,
} from "lucide-react";
import type { ReactNode } from "react";

type BadgeTone = "slate" | "blue" | "violet" | "emerald" | "amber" | "rose";

const toneClasses: Record<BadgeTone, string> = {
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  violet: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
  emerald: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  rose: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
};

function statusTone(status: string): BadgeTone {
  if (["ACTIVE", "APPROVED", "อนุมัติแล้ว", "ชำระแล้ว"].includes(status)) return "emerald";
  if (["PENDING", "รออนุมัติ", "INVITED", "DRAFT", "ร่าง"].includes(status)) return "amber";
  if (["REJECTED", "CANCELLED", "SUSPENDED", "DELETED", "เกินกำหนด"].includes(status)) return "rose";
  return "slate";
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="border-b border-slate-200 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          {eyebrow && <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">{eyebrow}</p>}
          <h1 className="mt-1 text-3xl font-semibold text-slate-950 dark:text-white">{title}</h1>
          {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "ค้นหา",
}: {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none ring-blue-500/20 transition focus:border-blue-500 focus:ring-4 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 sm:w-80"
        placeholder={placeholder}
      />
    </label>
  );
}

export function FilterDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="relative block">
      <select
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className="h-10 appearance-none rounded-md border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-4 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
      >
        <option>{label}</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
    </label>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[statusTone(status)]}`}>
      {status}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const tone: BadgeTone = role === "OWNER" || role === "SUPER_ADMIN" ? "violet" : role === "ADMIN" ? "blue" : "slate";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]}`}>{role}</span>;
}

export function DocumentStatusBadge({ status }: { status: string }) {
  return <StatusBadge status={status} />;
}

export function DataTable({
  title,
  columns,
  rows,
  search,
  filters,
  emptyText = "ยังไม่มีข้อมูล",
}: {
  title?: string;
  columns: string[];
  rows: ReactNode[][];
  search?: ReactNode;
  filters?: ReactNode;
  emptyText?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      {(title || search || filters) && (
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
          {title && <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h2>}
          <div className="flex flex-col gap-2 sm:flex-row">
            {search}
            {filters}
          </div>
        </div>
      )}
      {rows.length === 0 ? (
        <EmptyState title={emptyText} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <tr>{columns.map((column) => <th key={column} className="px-4 py-3 font-semibold">{column}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-blue-50/60 dark:hover:bg-slate-900">
                  {row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-4 text-slate-700 dark:text-slate-200">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-800">
        <span>แสดง {rows.length} รายการ</span>
        <div className="flex gap-2">
          <button className="rounded-md border border-slate-200 px-3 py-1.5 dark:border-slate-800">ก่อนหน้า</button>
          <button className="rounded-md border border-slate-200 px-3 py-1.5 dark:border-slate-800">ถัดไป</button>
        </div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title = "ยืนยันการทำรายการ",
  description,
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-950">
        <AlertTriangle className="size-6 text-amber-600" />
        <h2 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">{title}</h2>
        {description && <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="h-9 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-800">{cancelText}</button>
          <button onClick={onConfirm} className="h-9 rounded-md bg-rose-600 px-3 text-sm font-semibold text-white">{confirmText}</button>
        </div>
      </div>
    </div>
  );
}

export function FormModal({
  open,
  title,
  description,
  children,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose?: () => void;
  onSubmit?: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-start justify-between border-b border-slate-200 p-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h2>
            {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
          </div>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-900">
            <X className="size-4" />
          </button>
        </div>
        <div className="p-4">{children}</div>
        <div className="flex justify-end gap-2 border-t border-slate-200 p-4 dark:border-slate-800">
          <button onClick={onClose} className="h-9 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-800">ยกเลิก</button>
          <button onClick={onSubmit} className="h-9 rounded-md bg-blue-600 px-3 text-sm font-semibold text-white">บันทึก</button>
        </div>
      </div>
    </div>
  );
}

export function DetailDrawer({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose?: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40">
      <aside className="ml-auto h-full w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h2>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-900">
            <X className="size-4" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </aside>
    </div>
  );
}

export function Toast({
  tone = "emerald",
  title,
  description,
}: {
  tone?: BadgeTone;
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-950">
      <div className="flex gap-3">
        <span className={`grid size-8 place-items-center rounded-full ${toneClasses[tone]}`}>
          <Check className="size-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-950 dark:text-white">{title}</p>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
      </div>
    </div>
  );
}

export function LoadingSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-12 animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />
      ))}
    </div>
  );
}

export function EmptyState({
  title = "ยังไม่มีข้อมูล",
  description = "เมื่อมีข้อมูล รายการจะแสดงที่นี่",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="grid place-items-center px-4 py-14 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-900">
        <FileText className="size-6" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

export function FileUploader({ label = "อัปโหลดไฟล์" }: { label?: string }) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900">
      <UploadCloud className="size-8 text-blue-600" />
      <span className="mt-3 text-sm font-semibold text-slate-950 dark:text-white">{label}</span>
      <span className="mt-1 text-xs text-slate-500">PDF, DOCX, XLSX, PNG, JPG</span>
      <input type="file" className="sr-only" />
    </label>
  );
}

export function ImageUploader({ label = "อัปโหลดรูปภาพ" }: { label?: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 hover:bg-violet-50 dark:border-slate-800 dark:bg-slate-950">
      <span className="grid size-12 place-items-center rounded-md bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-200">
        <ImagePlus className="size-6" />
      </span>
      <span>
        <span className="block text-sm font-semibold text-slate-950 dark:text-white">{label}</span>
        <span className="text-xs text-slate-500">PNG หรือ JPG</span>
      </span>
      <input type="file" accept="image/*" className="sr-only" />
    </label>
  );
}

export function PdfPreview({ title = "PDF Preview" }: { title?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-950 dark:text-white">{title}</p>
        <button className="inline-flex h-8 items-center gap-1.5 rounded-md bg-slate-950 px-2 text-xs font-medium text-white">
          <Download className="size-3.5" />
          Download
        </button>
      </div>
      <div className="mx-auto mt-4 min-h-[520px] max-w-[420px] rounded bg-white p-8 shadow">
        <p className="text-2xl font-bold text-slate-950">เอกสารตัวอย่าง</p>
        <div className="mt-8 h-24 rounded border border-dashed border-slate-300" />
        <div className="mt-4 h-48 rounded bg-slate-50" />
      </div>
    </div>
  );
}

export function TemplateCard({
  name,
  category,
  status,
  onPreview,
}: {
  name: string;
  category: string;
  status: string;
  onPreview?: () => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <FileText className="size-5 text-blue-700 dark:text-blue-300" />
      <h3 className="mt-4 text-sm font-semibold text-slate-950 dark:text-white">{name}</h3>
      <p className="mt-1 text-xs text-slate-500">{category}</p>
      <div className="mt-4 flex items-center justify-between">
        <StatusBadge status={status} />
        <button onClick={onPreview} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 px-2 text-xs font-medium dark:border-slate-800">
          <Eye className="size-3.5" />
          Preview
        </button>
      </div>
    </div>
  );
}

export function DesignerToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
      {[Settings2, SlidersHorizontal, Loader2, Download].map((Icon, index) => (
        <button key={index} className="grid size-9 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300">
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  );
}

export function DesignerElementPanel({
  elements = ["Text", "Heading", "Image", "Table", "Line", "Box", "Signature", "Dynamic Field"],
}: {
  elements?: string[];
}) {
  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Elements</h3>
      <div className="mt-3 grid gap-2">
        {elements.map((element) => (
          <button key={element} className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-blue-50 dark:border-slate-800">
            <Layers3 className="size-4 text-blue-700" />
            {element}
          </button>
        ))}
      </div>
    </aside>
  );
}

export function DesignerCanvas() {
  return (
    <section className="rounded-lg border border-slate-200 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-900">
      <div
        className="mx-auto min-h-[640px] max-w-[794px] border border-slate-300 bg-white p-10 shadow-lg"
        style={{
          backgroundImage:
            "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <div className="rounded border border-dashed border-blue-400 p-4">
          <p className="text-2xl font-bold text-slate-950">ใบเสนอราคา</p>
          <p className="mt-2 text-sm text-slate-500">{"{{document_number}}"}</p>
        </div>
      </div>
    </section>
  );
}

export function DesignerPropertyPanel() {
  const properties = ["Text", "Font Size", "Font Weight", "Color", "Background", "Border", "Padding", "Width", "Height", "X", "Y"];
  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Properties</h3>
      <div className="mt-3 space-y-2">
        {properties.map((property) => (
          <label key={property} className="block text-xs font-medium text-slate-500">
            {property}
            <input className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm dark:border-slate-800 dark:bg-slate-950" />
          </label>
        ))}
      </div>
    </aside>
  );
}

export function DesignerPageManager({
  pages = ["Page 1", "Page 2", "Page 3"],
}: {
  pages?: string[];
}) {
  return (
    <div className="flex gap-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
      {pages.map((page) => (
        <button key={page} className="w-28 shrink-0 rounded-md border border-slate-200 p-3 text-center text-xs font-medium hover:bg-blue-50 dark:border-slate-800">
          {page}
        </button>
      ))}
    </div>
  );
}

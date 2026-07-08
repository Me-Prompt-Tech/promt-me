"use client";

import {
  ArrowUpRight,
  Banknote,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  FileCheck2,
  FilePlus2,
  FileSearch,
  FileText,
  Filter,
  HandCoins,
  Inbox,
  Landmark,
  Mail,
  MoreHorizontal,
  PencilLine,
  Plus,
  ReceiptText,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  UsersRound,
} from "lucide-react";
import { useMemo, useState } from "react";

type DocumentStatus = "ร่าง" | "รออนุมัติ" | "อนุมัติแล้ว" | "ชำระแล้ว" | "เกินกำหนด";

type DocumentItem = {
  id: string;
  type: string;
  customer: string;
  date: string;
  due: string;
  amount: number;
  status: DocumentStatus;
  owner: string;
  channel: string;
};

const documents: DocumentItem[] = [
  {
    id: "QT-2026-0718",
    type: "ใบเสนอราคา",
    customer: "บริษัท สยาม รีเทล จำกัด",
    date: "08 ก.ค. 2026",
    due: "15 ก.ค. 2026",
    amount: 128500,
    status: "รออนุมัติ",
    owner: "ฝ่ายขาย",
    channel: "อีเมล",
  },
  {
    id: "INV-2026-0421",
    type: "ใบแจ้งหนี้",
    customer: "Blue Ocean Studio",
    date: "07 ก.ค. 2026",
    due: "22 ก.ค. 2026",
    amount: 84200,
    status: "อนุมัติแล้ว",
    owner: "บัญชี",
    channel: "ลิงก์ชำระเงิน",
  },
  {
    id: "REC-2026-0198",
    type: "ใบเสร็จรับเงิน",
    customer: "บริษัท เมกะฟู้ดส์ จำกัด",
    date: "06 ก.ค. 2026",
    due: "06 ก.ค. 2026",
    amount: 45600,
    status: "ชำระแล้ว",
    owner: "การเงิน",
    channel: "โอนเงิน",
  },
  {
    id: "TAX-2026-0114",
    type: "ใบกำกับภาษี",
    customer: "North Star Logistics",
    date: "03 ก.ค. 2026",
    due: "10 ก.ค. 2026",
    amount: 236900,
    status: "เกินกำหนด",
    owner: "บัญชี",
    channel: "PDF",
  },
  {
    id: "WHT-2026-0038",
    type: "หนังสือรับรองหัก ณ ที่จ่าย",
    customer: "คุณณัฐวุฒิ คอนซัลท์",
    date: "01 ก.ค. 2026",
    due: "31 ก.ค. 2026",
    amount: 18000,
    status: "ร่าง",
    owner: "ภาษี",
    channel: "RD Prep",
  },
];

const quickActions = [
  { title: "สร้างใบเสนอราคา", icon: FilePlus2, text: "ออกเอกสารขายพร้อมเลขรันอัตโนมัติ" },
  { title: "สแกนบิลค่าใช้จ่าย", icon: UploadCloud, text: "อัปโหลดไฟล์และเตรียมบันทึกบัญชี" },
  { title: "ส่งลิงก์รับชำระ", icon: Send, text: "แนบใบแจ้งหนี้และติดตามสถานะ" },
  { title: "ดาวน์โหลด RD Prep", icon: Download, text: "ส่งออกไฟล์ภาษีหัก ณ ที่จ่าย" },
];

const stats = [
  { label: "เอกสารเดือนนี้", value: "1,248", delta: "+18%", icon: FileText },
  { label: "รออนุมัติ", value: "36", delta: "12 วันนี้", icon: Clock3 },
  { label: "รายรับค้างรับ", value: "฿2.84M", delta: "-8%", icon: Banknote },
  { label: "ภาษีขาย", value: "฿184K", delta: "พร้อมยื่น", icon: Landmark },
];

const workflow = [
  { label: "สร้างเอกสาร", detail: "เลือก template และคู่ค้า", icon: PencilLine },
  { label: "ตรวจสอบ", detail: "ฝ่ายบัญชีเช็กเลขที่ ภาษี และยอดรวม", icon: FileSearch },
  { label: "อนุมัติ", detail: "ผู้มีอำนาจลงอนุมัติผ่าน workflow", icon: ShieldCheck },
  { label: "ส่งและปิดงาน", detail: "ส่งอีเมล รับชำระ และบันทึกบัญชี", icon: CheckCircle2 },
];

const documentCategories = [
  { name: "เอกสารจดทะเบียน", count: 7, sample: "หนังสือรับรองบริษัท, ภ.พ.20, บอจ.5" },
  { name: "บัญชีและการเงิน", count: 9, sample: "ใบเสนอราคา, ใบแจ้งหนี้, ใบเสร็จรับเงิน" },
  { name: "ภาษี", count: 10, sample: "ใบกำกับภาษี, ภ.ง.ด.3, ภ.พ.30" },
  { name: "บุคคล", count: 8, sample: "สัญญาจ้างงาน, ใบลา, ประวัติพนักงาน" },
  { name: "การดำเนินงาน", count: 8, sample: "รายงานประชุม, ใบสั่งงาน, Checklist งาน" },
];

const statusStyles: Record<DocumentStatus, string> = {
  ร่าง: "bg-slate-100 text-slate-700",
  รออนุมัติ: "bg-amber-100 text-amber-800",
  อนุมัติแล้ว: "bg-sky-100 text-sky-800",
  ชำระแล้ว: "bg-emerald-100 text-emerald-800",
  เกินกำหนด: "bg-rose-100 text-rose-800",
};

function money(value: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value);
}

export function DocumentWorkspace() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<DocumentStatus | "ทั้งหมด">("ทั้งหมด");
  const [selectedId, setSelectedId] = useState(documents[0].id);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesStatus = status === "ทั้งหมด" || doc.status === status;
      const searchable = `${doc.id} ${doc.type} ${doc.customer} ${doc.owner}`.toLowerCase();
      return matchesStatus && searchable.includes(query.toLowerCase());
    });
  }, [query, status]);

  const selected = documents.find((doc) => doc.id === selectedId) ?? documents[0];
  const totals = documents.reduce((sum, doc) => sum + doc.amount, 0);

  return (
    <div className="min-h-full bg-[#f6f8fb] text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800">
                <Sparkles className="size-3.5" />
                Accounting document workspace
              </div>
              <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
                ระบบจัดการเอกสารบัญชีและภาษี
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                สร้างเอกสาร ตรวจสอบสถานะ อนุมัติ ส่งให้ลูกค้า เก็บไฟล์ และเตรียมข้อมูลภาษีในพื้นที่ทำงานเดียว
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                <Bell className="size-4" />
                แจ้งเตือน
              </button>
              <button className="inline-flex h-10 items-center gap-2 rounded-md bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-teal-700">
                <Plus className="size-4" />
                สร้างเอกสาร
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">{item.value}</p>
                  </div>
                  <span className="grid size-10 place-items-center rounded-md bg-slate-100 text-slate-700">
                    <item.icon className="size-5" />
                  </span>
                </div>
                <p className="mt-3 text-xs font-medium text-teal-700">{item.delta}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
        <div className="space-y-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => (
              <button
                key={action.title}
                className="group rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-teal-300 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="grid size-10 place-items-center rounded-md bg-teal-50 text-teal-700">
                    <action.icon className="size-5" />
                  </span>
                  <ArrowUpRight className="size-4 text-slate-400 transition group-hover:text-teal-600" />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-950">{action.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{action.text}</p>
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">หมวดหมู่เอกสารหลัก</h2>
                <p className="text-sm text-slate-500">หมวดเริ่มต้น 5 หมวดที่บริษัทใช้จัดเก็บและออกเอกสาร</p>
              </div>
              <span className="text-xs font-semibold text-teal-700">42 ประเภทเอกสารเริ่มต้น</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {documentCategories.map((category) => (
                <div key={category.name} className="rounded-md border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-950">{category.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{category.count} ประเภท</p>
                  <p className="mt-3 text-xs leading-5 text-slate-500">{category.sample}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">รายการเอกสารล่าสุด</h2>
                <p className="text-sm text-slate-500">รวมยอดเอกสาร {money(totals)} จากรายการตัวอย่าง</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none ring-teal-500/20 focus:border-teal-500 focus:ring-4 sm:w-72"
                    placeholder="ค้นหาเลขที่เอกสาร ลูกค้า หรือทีม"
                  />
                </label>
                <div className="relative">
                  <Filter className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value as DocumentStatus | "ทั้งหมด")}
                    className="h-10 w-full appearance-none rounded-md border border-slate-200 bg-white pl-9 pr-8 text-sm outline-none ring-teal-500/20 focus:border-teal-500 focus:ring-4 sm:w-40"
                  >
                    {["ทั้งหมด", "ร่าง", "รออนุมัติ", "อนุมัติแล้ว", "ชำระแล้ว", "เกินกำหนด"].map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">เอกสาร</th>
                    <th className="px-4 py-3 font-semibold">ลูกค้า/คู่ค้า</th>
                    <th className="px-4 py-3 font-semibold">กำหนด</th>
                    <th className="px-4 py-3 text-right font-semibold">ยอดรวม</th>
                    <th className="px-4 py-3 font-semibold">สถานะ</th>
                    <th className="px-4 py-3 font-semibold">ช่องทาง</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDocuments.map((doc) => (
                    <tr
                      key={doc.id}
                      onClick={() => setSelectedId(doc.id)}
                      className="cursor-pointer bg-white hover:bg-teal-50/60"
                    >
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-950">{doc.id}</p>
                        <p className="text-xs text-slate-500">{doc.type} · {doc.owner}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-700">{doc.customer}</td>
                      <td className="px-4 py-4">
                        <p className="text-slate-700">{doc.due}</p>
                        <p className="text-xs text-slate-500">สร้าง {doc.date}</p>
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-slate-950">{money(doc.amount)}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[doc.status]}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{doc.channel}</td>
                      <td className="px-4 py-4 text-right">
                        <button className="inline-grid size-8 place-items-center rounded-md text-slate-500 hover:bg-white hover:text-slate-900">
                          <MoreHorizontal className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-950">Workflow อนุมัติเอกสาร</h2>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  SLA 94%
                </span>
              </div>
              <div className="mt-5 space-y-4">
                {workflow.map((step, index) => (
                  <div key={step.label} className="flex gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-700">
                      <step.icon className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-950">{step.label}</p>
                        {index < workflow.length - 1 && <ChevronRight className="size-4 text-slate-300" />}
                      </div>
                      <p className="text-sm leading-6 text-slate-500">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">ภาษีและรายงานพร้อมใช้งาน</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  { name: "รายงานภาษีขาย", value: "พร้อมยื่น ภ.พ.30", icon: ReceiptText },
                  { name: "ภาษีหัก ณ ที่จ่าย", value: "ส่งออก ภ.ง.ด.3/53", icon: HandCoins },
                  { name: "สมุดรายวัน", value: "บันทึก 5 เล่มอัตโนมัติ", icon: FileCheck2 },
                  { name: "กระทบยอดธนาคาร", value: "จับคู่รายการโอน", icon: Landmark },
                ].map((item) => (
                  <div key={item.name} className="rounded-md border border-slate-200 p-4">
                    <item.icon className="size-5 text-teal-700" />
                    <p className="mt-3 text-sm font-semibold text-slate-950">{item.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-950">ตัวอย่างเอกสาร</h2>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[selected.status]}`}>
                {selected.status}
              </span>
            </div>
            <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="rounded-md bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-teal-700">{selected.type}</p>
                    <p className="mt-2 text-xl font-semibold text-slate-950">{selected.id}</p>
                  </div>
                  <Building2 className="size-8 text-slate-400" />
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">ลูกค้า</p>
                    <p className="font-medium text-slate-950">{selected.customer}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-500">วันที่ออก</p>
                      <p className="font-medium text-slate-950">{selected.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">ครบกำหนด</p>
                      <p className="font-medium text-slate-950">{selected.due}</p>
                    </div>
                  </div>
                  <div className="rounded-md bg-slate-50 p-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>สินค้า/บริการ</span>
                      <span>ยอดรวม</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                      <span className="font-medium text-slate-950">บริการจัดการเอกสารรายเดือน</span>
                      <span className="font-semibold text-slate-950">{money(selected.amount)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                    <p className="font-semibold text-slate-950">ยอดสุทธิ</p>
                    <p className="text-lg font-semibold text-teal-700">{money(selected.amount)}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Mail className="size-4" />
                ส่งอีเมล
              </button>
              <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white hover:bg-slate-800">
                <Download className="size-4" />
                PDF
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">ศูนย์งานวันนี้</h2>
            <div className="mt-4 space-y-3">
              {[
                { icon: Inbox, title: "บิลค่าใช้จ่ายรอตรวจ", value: "18 รายการ" },
                { icon: CalendarDays, title: "ภาษีครบกำหนด", value: "ภายใน 7 วัน" },
                { icon: UsersRound, title: "คู่ค้าใหม่", value: "6 ราย" },
              ].map((item) => (
                <div key={item.title} className="flex items-center gap-3 rounded-md border border-slate-200 p-3">
                  <span className="grid size-9 place-items-center rounded-md bg-slate-100 text-slate-700">
                    <item.icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-950">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

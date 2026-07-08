import {
  DataTable,
  DesignerCanvas,
  DesignerElementPanel,
  DesignerPageManager,
  DesignerPropertyPanel,
  DesignerToolbar,
  DocumentStatusBadge,
  EmptyState,
  FileUploader,
  ImageUploader,
  LoadingSkeleton,
  PageHeader,
  PdfPreview,
  RoleBadge,
  SearchInput,
  FilterDropdown,
  StatusBadge,
  TemplateCard,
  Toast,
} from "@/components/ui/app-components";

export default function AdminUiKitPage() {
  return (
    <div className="min-h-full bg-[#f6f8fb] pb-8 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <PageHeader
        eyebrow="Design System"
        title="UI Components"
        description="ชุด component กลางสำหรับระบบเอกสารองค์กร รองรับ card, table, modal/drawer patterns, uploader, PDF preview และ designer"
      />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-3">
          <TemplateCard name="ใบเสนอราคา Standard" category="บัญชีและการเงิน" status="ACTIVE" />
          <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
            <h2 className="font-semibold">Badges</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatusBadge status="ACTIVE" />
              <DocumentStatusBadge status="รออนุมัติ" />
              <RoleBadge role="OWNER" />
              <RoleBadge role="VIEWER" />
            </div>
          </div>
          <Toast title="บันทึกสำเร็จ" description="ระบบบันทึกข้อมูลเรียบร้อยแล้ว" />
        </div>

        <DataTable
          title="DataTable"
          columns={["เลขเอกสาร", "ชื่อ", "สถานะ", "Role"]}
          search={<SearchInput placeholder="ค้นหาเอกสาร" />}
          filters={<FilterDropdown label="สถานะทั้งหมด" options={["ACTIVE", "DRAFT", "PENDING"]} />}
          rows={[
            ["QT-2026-0001", "ใบเสนอราคา", <DocumentStatusBadge key="s1" status="ร่าง" />, <RoleBadge key="r1" role="ACCOUNTANT" />],
            ["INV-2026-0002", "ใบแจ้งหนี้", <DocumentStatusBadge key="s2" status="อนุมัติแล้ว" />, <RoleBadge key="r2" role="OWNER" />],
          ]}
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <FileUploader />
          <ImageUploader />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <PdfPreview />
          <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
            <h2 className="font-semibold">Loading / Empty State</h2>
            <div className="mt-4 space-y-4">
              <LoadingSkeleton rows={3} />
              <EmptyState title="ยังไม่มี Template" description="เพิ่ม Template แรกเพื่อเริ่มใช้งาน Document Designer" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[240px_1fr_280px]">
          <DesignerElementPanel />
          <div className="space-y-3">
            <DesignerToolbar />
            <DesignerCanvas />
            <DesignerPageManager />
          </div>
          <DesignerPropertyPanel />
        </div>
      </main>
    </div>
  );
}

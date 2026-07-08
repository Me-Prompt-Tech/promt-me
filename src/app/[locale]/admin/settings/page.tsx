import { Settings, ShieldCheck, SlidersHorizontal } from "lucide-react";

export default function AdminSystemSettingsPage() {
  return (
    <div className="min-h-full bg-[#f6f8fb] text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <div className="border-b border-slate-200 bg-white px-6 py-6 dark:border-slate-800 dark:bg-slate-950">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">System Admin</p>
        <h1 className="mt-1 text-3xl font-semibold">ตั้งค่าระบบ</h1>
        <p className="mt-2 text-sm text-slate-500">ตั้งค่าระบบกลางสำหรับ tenant, security, default document และ notification</p>
      </div>
      <main className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:px-6 md:grid-cols-3 lg:px-8">
        {["Security Policy", "Default Locale", "Default Theme", "Storage Limit", "Email Notification", "Audit Retention"].map((item) => (
          <div key={item} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <Settings className="size-5 text-teal-700" />
            <h2 className="mt-4 font-semibold">{item}</h2>
            <p className="mt-1 text-sm text-slate-500">กำหนดค่า {item} ของระบบกลาง</p>
            <button className="mt-4 inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium">
              <SlidersHorizontal className="size-4" />
              แก้ไข
            </button>
          </div>
        ))}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <ShieldCheck className="size-5 text-teal-700" />
          <h2 className="mt-4 font-semibold">System Health</h2>
          <p className="mt-1 text-sm text-slate-500">สถานะระบบและการตั้งค่าความปลอดภัยพร้อมใช้งาน</p>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Filter, Pencil, Trash2, X, UserCheck, UserX, Clock, Building, Mail, Phone, Briefcase, Calendar, DollarSign } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/app-components";

export type EmployeeData = {
  id?: string;
  code?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  position?: string | null;
  departmentId?: string | null;
  department?: { id: string; name: string } | null;
  departmentName?: string;
  salarySatang?: number | null;
  salary?: string | number;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  status: "ACTIVE" | "INVITED" | "SUSPENDED" | "DELETED" | string;
};

export type DepartmentData = {
  id: string;
  name: string;
};

const DEFAULT_SAMPLE_EMPLOYEES: EmployeeData[] = [
  { id: "sample-1", code: "EMP-001", name: "คุณวราภรณ์", email: "accountant@example.com", phone: "081-111-2233", position: "Senior Accountant", departmentName: "บัญชี", salarySatang: 5800000, startDate: "2024-01-01", status: "ACTIVE" },
  { id: "sample-2", code: "EMP-002", name: "คุณอรทัย", email: "finance@example.com", phone: "082-444-9988", position: "Finance Manager", departmentName: "การเงิน", salarySatang: 7200000, startDate: "2023-03-15", status: "ACTIVE" },
  { id: "sample-3", code: "EMP-003", name: "คุณกิตติ", email: "operation@example.com", phone: "083-555-1122", position: "Operation Lead", departmentName: "ปฏิบัติการ", salarySatang: 4900000, startDate: "2025-06-01", status: "ACTIVE" },
];

function formatSalary(employee: EmployeeData): string {
  if (employee.salarySatang !== undefined && employee.salarySatang !== null) {
    const baht = Math.round(employee.salarySatang / 100);
    return `฿${baht.toLocaleString("th-TH")}`;
  }
  if (employee.salary) {
    if (typeof employee.salary === "number") return `฿${employee.salary.toLocaleString("th-TH")}`;
    return String(employee.salary).startsWith("฿") ? String(employee.salary) : `฿${employee.salary}`;
  }
  return "-";
}

function formatDate(dateVal?: string | Date | null): string {
  if (!dateVal || dateVal === "-") return "-";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return String(dateVal);
  }
}

function toInputDate(dateVal?: string | Date | null): string {
  if (!dateVal || dateVal === "-") return "";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
}

function StatusBadge({ status }: { status: string }) {
  const isOk = status === "ACTIVE" || status === "Active";
  const isPending = status === "INVITED" || status === "รออนุมัติ";
  
  const color = isOk
    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
    : isPending
      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
      
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${color}`}>{status}</span>;
}

export function EmployeeManagement({
  initialEmployees = [],
  departments = [],
  companyId,
}: {
  initialEmployees?: EmployeeData[];
  departments?: DepartmentData[];
  companyId?: string;
}) {
  const [employees, setEmployees] = useState<EmployeeData[]>(
    initialEmployees.length > 0 ? initialEmployees : DEFAULT_SAMPLE_EMPLOYEES
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeData | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<EmployeeData | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    email: "",
    phone: "",
    position: "",
    departmentId: "",
    departmentName: "",
    salaryBaht: "",
    startDate: "",
    endDate: "",
    status: "ACTIVE",
  });

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    const nextNum = employees.length + 1;
    setFormData({
      code: `EMP-${String(nextNum).padStart(3, "0")}`,
      name: "",
      email: "",
      phone: "",
      position: "",
      departmentId: departments[0]?.id || "",
      departmentName: "",
      salaryBaht: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      status: "ACTIVE",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (employee: EmployeeData) => {
    setEditingEmployee(employee);
    
    let salaryNum = "";
    if (employee.salarySatang !== undefined && employee.salarySatang !== null) {
      salaryNum = String(Math.round(employee.salarySatang / 100));
    } else if (employee.salary) {
      salaryNum = String(employee.salary).replace(/[^0-9]/g, "");
    }

    setFormData({
      code: employee.code || "",
      name: employee.name || "",
      email: employee.email || "",
      phone: employee.phone || "",
      position: employee.position || "",
      departmentId: employee.departmentId || employee.department?.id || "",
      departmentName: employee.departmentName || employee.department?.name || "",
      salaryBaht: salaryNum,
      startDate: toInputDate(employee.startDate),
      endDate: toInputDate(employee.endDate),
      status: employee.status || "ACTIVE",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("กรุณากรอกชื่อพนักงาน");
      return;
    }

    const salarySatang = formData.salaryBaht ? Math.round(parseFloat(formData.salaryBaht) * 100) : null;
    const selectedDeptObj = departments.find(d => d.id === formData.departmentId);
    const deptName = selectedDeptObj ? selectedDeptObj.name : formData.departmentName || "-";

    const payload = {
      code: formData.code.trim() || null,
      name: formData.name.trim(),
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      position: formData.position.trim() || null,
      departmentId: formData.departmentId || undefined,
      salarySatang: salarySatang ?? undefined,
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
      status: formData.status,
    };

    startTransition(async () => {
      try {
        if (companyId) {
          let res;
          if (editingEmployee?.id && !editingEmployee.id.startsWith("sample-")) {
            res = await fetch(`/api/company/${companyId}/employees/${editingEmployee.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }).then(r => r.json());
          } else {
            res = await fetch(`/api/company/${companyId}/employees`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }).then(r => r.json());
          }

          if (res.ok && res.data) {
            const savedEmp: EmployeeData = res.data;
            if (editingEmployee) {
              setEmployees(prev => prev.map(emp => emp.id === editingEmployee.id ? savedEmp : emp));
            } else {
              setEmployees(prev => [savedEmp, ...prev]);
            }
            setIsModalOpen(false);
            return;
          }
        }
      } catch (err) {
        console.error("API error, updating local state fallback", err);
      }

      // Local state fallback update
      if (editingEmployee) {
        setEmployees(prev =>
          prev.map(emp =>
            emp.id === editingEmployee.id
              ? {
                  ...emp,
                  ...payload,
                  departmentName: deptName,
                  department: selectedDeptObj || (emp.department ? emp.department : null),
                }
              : emp
          )
        );
      } else {
        const newEmp: EmployeeData = {
          id: `emp-${Date.now()}`,
          ...payload,
          departmentName: deptName,
          department: selectedDeptObj || null,
        };
        setEmployees(prev => [newEmp, ...prev]);
      }
      setIsModalOpen(false);
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    startTransition(async () => {
      try {
        if (companyId && deleteTarget.id && !deleteTarget.id.startsWith("sample-")) {
          await fetch(`/api/company/${companyId}/employees/${deleteTarget.id}`, {
            method: "DELETE",
          });
        }
      } catch (err) {
        console.error("Delete API error", err);
      }

      setEmployees(prev => prev.filter(emp => emp.id !== deleteTarget.id));
      setDeleteTarget(null);
    });
  };

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const code = (emp.code || "").toLowerCase();
    const name = (emp.name || "").toLowerCase();
    const email = (emp.email || "").toLowerCase();
    const phone = (emp.phone || "").toLowerCase();
    const position = (emp.position || "").toLowerCase();
    const dept = (emp.department?.name || emp.departmentName || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      !searchTerm ||
      code.includes(search) ||
      name.includes(search) ||
      email.includes(search) ||
      phone.includes(search) ||
      position.includes(search) ||
      dept.includes(search);

    const matchesDept =
      selectedDepartment === "ALL" ||
      emp.departmentId === selectedDepartment ||
      emp.department?.name === selectedDepartment ||
      emp.departmentName === selectedDepartment;

    const matchesStatus =
      selectedStatus === "ALL" || emp.status.toUpperCase() === selectedStatus.toUpperCase();

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <ConfirmDialog
        open={!!deleteTarget}
        title="ยืนยันการลบพนักงาน"
        description={`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลพนักงาน "${deleteTarget?.name}" (รหัส: ${deleteTarget?.code || "-"})? การกระทำนี้ไม่สามารถย้อนกลับได้`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        confirmText={isPending ? "กำลังลบ..." : "ยืนยันลบ"}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenAddModal}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
          >
            <Plus className="size-4" />
            เพิ่มพนักงาน
          </button>
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-950 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white sm:w-64"
              placeholder="ค้นหาชื่อ, รหัส, ตำแหน่ง..."
            />
          </div>

          <select
            value={selectedDepartment}
            onChange={e => setSelectedDepartment(e.target.value)}
            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
          >
            <option value="ALL">ทุกแผนก</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
            {!departments.some(d => d.name === "บัญชี") && <option value="บัญชี">บัญชี</option>}
            {!departments.some(d => d.name === "การเงิน") && <option value="การเงิน">การเงิน</option>}
            {!departments.some(d => d.name === "ปฏิบัติการ") && <option value="ปฏิบัติการ">ปฏิบัติการ</option>}
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
          >
            <option value="ALL">ทุกสถานะ</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INVITED">INVITED</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="py-3.5 pl-4 pr-3 font-semibold">รหัส</th>
              <th className="py-3.5 px-3 font-semibold">ชื่อ-นามสกุล</th>
              <th className="py-3.5 px-3 font-semibold">อีเมล</th>
              <th className="py-3.5 px-3 font-semibold">เบอร์โทร</th>
              <th className="py-3.5 px-3 font-semibold">ตำแหน่ง</th>
              <th className="py-3.5 px-3 font-semibold">แผนก</th>
              <th className="py-3.5 px-3 font-semibold">เงินเดือน</th>
              <th className="py-3.5 px-3 font-semibold">เริ่มงาน</th>
              <th className="py-3.5 px-3 font-semibold">ลาออก</th>
              <th className="py-3.5 px-3 font-semibold">สถานะ</th>
              <th className="py-3.5 pl-3 pr-4 font-semibold text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-500 dark:text-slate-400">
                  <p className="text-base font-medium">ไม่พบข้อมูลพนักงาน</p>
                  <p className="mt-1 text-xs">ลองค้นหาด้วยคำอื่น หรือกดปุ่ม "เพิ่มพนักงาน" เพื่อสร้างข้อมูลใหม่</p>
                </td>
              </tr>
            ) : (
              filteredEmployees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors dark:hover:bg-slate-900/50">
                  <td className="py-3.5 pl-4 pr-3 font-medium text-slate-900 dark:text-slate-100">
                    {emp.code || "-"}
                  </td>
                  <td className="py-3.5 px-3 font-medium text-slate-950 dark:text-white">
                    {emp.name}
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">
                    {emp.email || "-"}
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">
                    {emp.phone || "-"}
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">
                    {emp.position || "-"}
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">
                    {emp.department?.name || emp.departmentName || "-"}
                  </td>
                  <td className="py-3.5 px-3 font-medium text-slate-900 dark:text-slate-200">
                    {formatSalary(emp)}
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">
                    {formatDate(emp.startDate)}
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">
                    {formatDate(emp.endDate)}
                  </td>
                  <td className="py-3.5 px-3">
                    <StatusBadge status={emp.status} />
                  </td>
                  <td className="py-3.5 pl-3 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(emp)}
                        className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Pencil className="size-3.5 text-teal-600" />
                        แก้ไข
                      </button>
                      <button
                        onClick={() => setDeleteTarget(emp)}
                        className="inline-flex h-8 items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2.5 text-xs font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60 transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                        ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
                {editingEmployee ? "แก้ไขข้อมูลพนักงาน" : "เพิ่มพนักงานใหม่"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="size-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 dark:bg-rose-950/50 dark:border-rose-900 dark:text-rose-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    รหัสพนักงาน
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    placeholder="เช่น EMP-004"
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="กรอกชื่อ-นามสกุล"
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    อีเมล
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="081-XXX-XXXX"
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    ตำแหน่ง
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={e => setFormData({ ...formData, position: e.target.value })}
                    placeholder="เช่น Senior Accountant"
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    แผนก
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={e => {
                      const dept = departments.find(d => d.id === e.target.value);
                      setFormData({
                        ...formData,
                        departmentId: e.target.value,
                        departmentName: dept ? dept.name : formData.departmentName,
                      });
                    }}
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="">-- เลือกแผนก --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                    {!departments.some(d => d.name === "บัญชี") && <option value="dept-acc">บัญชี</option>}
                    {!departments.some(d => d.name === "การเงิน") && <option value="dept-fin">การเงิน</option>}
                    {!departments.some(d => d.name === "ปฏิบัติการ") && <option value="dept-ops">ปฏิบัติการ</option>}
                    {!departments.some(d => d.name === "บุคคล") && <option value="dept-hr">บุคคล</option>}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    เงินเดือน (บาท)
                  </label>
                  <input
                    type="number"
                    value={formData.salaryBaht}
                    onChange={e => setFormData({ ...formData, salaryBaht: e.target.value })}
                    placeholder="เช่น 55000"
                    min="0"
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    สถานะ
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="ACTIVE">ACTIVE (ปกติ)</option>
                    <option value="INVITED">INVITED (รอยืนยัน)</option>
                    <option value="SUSPENDED">SUSPENDED (ระงับ)</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    วันที่เริ่มงาน
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    วันที่ลาออก (ถ้ามี)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium border border-slate-300 rounded-md hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 text-xs font-semibold bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isPending ? "กำลังบันทึก..." : editingEmployee ? "บันทึกการแก้ไข" : "เพิ่มพนักงาน"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

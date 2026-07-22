"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Pencil, Trash2, X, Building2, Users, UserCheck } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/app-components";

export type DepartmentData = {
  id?: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
  status?: string;
  users?: number | any[];
  employees?: number | any[];
  _count?: {
    users?: number;
    employees?: number;
  };
};

const DEFAULT_SAMPLE_DEPARTMENTS: DepartmentData[] = [
  { id: "dept-1", name: "บัญชี", description: "จัดการบัญชี ภาษี และงบการเงิน", isActive: true, status: "ACTIVE", users: 6, employees: 12 },
  { id: "dept-2", name: "การเงิน", description: "จัดการกระแสเงินสดและเบิกจ่าย", isActive: true, status: "ACTIVE", users: 4, employees: 8 },
  { id: "dept-3", name: "บุคคล", description: "สรรหาและดูแลพนักงาน", isActive: true, status: "ACTIVE", users: 3, employees: 5 },
  { id: "dept-4", name: "ปฏิบัติการ", description: "ควบคุมการดำเนินงานหลักของบริษัท", isActive: true, status: "ACTIVE", users: 9, employees: 38 },
];

function getCount(val: any, fallbackKey: string, dept: DepartmentData): number {
  if (dept._count && typeof (dept._count as any)[fallbackKey] === "number") {
    return (dept._count as any)[fallbackKey];
  }
  if (typeof val === "number") return val;
  if (Array.isArray(val)) return val.length;
  return 0;
}

function StatusBadge({ active }: { active: boolean }) {
  const color = active
    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${color}`}>
      {active ? "ACTIVE" : "INACTIVE"}
    </span>
  );
}

export function DepartmentManagement({
  initialDepartments = [],
  companyId,
}: {
  initialDepartments?: DepartmentData[];
  companyId?: string;
}) {
  const [departments, setDepartments] = useState<DepartmentData[]>(
    initialDepartments.length > 0 ? initialDepartments : DEFAULT_SAMPLE_DEPARTMENTS
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentData | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<DepartmentData | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  const handleOpenAddModal = () => {
    setEditingDept(null);
    setFormData({
      name: "",
      description: "",
      isActive: true,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dept: DepartmentData) => {
    setEditingDept(dept);
    const isAct = dept.isActive !== undefined ? dept.isActive : dept.status !== "INACTIVE";
    setFormData({
      name: dept.name || "",
      description: dept.description || "",
      isActive: isAct,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("กรุณากรอกชื่อแผนก");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      isActive: formData.isActive,
    };

    startTransition(async () => {
      try {
        if (companyId) {
          let res;
          if (editingDept?.id && !editingDept.id.startsWith("dept-")) {
            res = await fetch(`/api/company/${companyId}/departments/${editingDept.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }).then(r => r.json());
          } else {
            res = await fetch(`/api/company/${companyId}/departments`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }).then(r => r.json());
          }

          if (res.ok && res.data) {
            const savedDept: DepartmentData = res.data;
            if (editingDept) {
              setDepartments(prev => prev.map(d => (d.id === editingDept.id ? savedDept : d)));
            } else {
              setDepartments(prev => [savedDept, ...prev]);
            }
            setIsModalOpen(false);
            return;
          }
        }
      } catch (err) {
        console.error("API error, updating local state fallback", err);
      }

      // Local state fallback update
      if (editingDept) {
        setDepartments(prev =>
          prev.map(d =>
            d.id === editingDept.id
              ? {
                  ...d,
                  ...payload,
                  status: payload.isActive ? "ACTIVE" : "INACTIVE",
                }
              : d
          )
        );
      } else {
        const newDept: DepartmentData = {
          id: `dept-${Date.now()}`,
          ...payload,
          status: payload.isActive ? "ACTIVE" : "INACTIVE",
          users: 0,
          employees: 0,
          _count: { users: 0, employees: 0 },
        };
        setDepartments(prev => [newDept, ...prev]);
      }
      setIsModalOpen(false);
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    startTransition(async () => {
      try {
        if (companyId && deleteTarget.id && !deleteTarget.id.startsWith("dept-")) {
          await fetch(`/api/company/${companyId}/departments/${deleteTarget.id}`, {
            method: "DELETE",
          });
        }
      } catch (err) {
        console.error("Delete API error", err);
      }

      setDepartments(prev => prev.filter(d => d.id !== deleteTarget.id));
      setDeleteTarget(null);
    });
  };

  // Filter departments
  const filteredDepartments = departments.filter(d => {
    const name = (d.name || "").toLowerCase();
    const desc = (d.description || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    const isAct = d.isActive !== undefined ? d.isActive : d.status !== "INACTIVE";

    const matchesSearch = !searchTerm || name.includes(search) || desc.includes(search);
    const matchesStatus =
      selectedStatus === "ALL" ||
      (selectedStatus === "ACTIVE" && isAct) ||
      (selectedStatus === "INACTIVE" && !isAct);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <ConfirmDialog
        open={!!deleteTarget}
        title="ยืนยันการลบแผนก"
        description={`คุณแน่ใจหรือไม่ว่าต้องการลบแผนก "${deleteTarget?.name}"? หากลบแผนกแล้วผู้ใช้งานหรือพนักงานในแผนกจะไม่มีสังกัดแผนก`}
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
            เพิ่มแผนก
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
              placeholder="ค้นหาแผนก, รายละเอียด..."
            />
          </div>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
          >
            <option value="ALL">ทุกสถานะ</option>
            <option value="ACTIVE">ACTIVE (เปิดใช้งาน)</option>
            <option value="INACTIVE">INACTIVE (ปิดใช้งาน)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="py-3.5 pl-4 pr-3 font-semibold">แผนก</th>
              <th className="py-3.5 px-3 font-semibold">รายละเอียด</th>
              <th className="py-3.5 px-3 font-semibold">สถานะ</th>
              <th className="py-3.5 px-3 font-semibold text-center">ผู้ใช้งาน</th>
              <th className="py-3.5 px-3 font-semibold text-center">พนักงาน</th>
              <th className="py-3.5 pl-3 pr-4 font-semibold text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredDepartments.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                  <p className="text-base font-medium">ไม่พบข้อมูลแผนก</p>
                  <p className="mt-1 text-xs">กดปุ่ม "เพิ่มแผนก" เพื่อสร้างแผนกใหม่</p>
                </td>
              </tr>
            ) : (
              filteredDepartments.map(dept => {
                const isAct = dept.isActive !== undefined ? dept.isActive : dept.status !== "INACTIVE";
                const userCount = getCount(dept.users, "users", dept);
                const empCount = getCount(dept.employees, "employees", dept);

                return (
                  <tr key={dept.id} className="hover:bg-slate-50/80 transition-colors dark:hover:bg-slate-900/50">
                    <td className="py-3.5 pl-4 pr-3 font-semibold text-slate-950 dark:text-white">
                      {dept.name}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {dept.description || "-"}
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge active={isAct} />
                    </td>
                    <td className="py-3.5 px-3 text-center font-medium text-slate-800 dark:text-slate-200">
                      {userCount}
                    </td>
                    <td className="py-3.5 px-3 text-center font-medium text-slate-800 dark:text-slate-200">
                      {empCount}
                    </td>
                    <td className="py-3.5 pl-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(dept)}
                          className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Pencil className="size-3.5 text-teal-600" />
                          แก้ไข
                        </button>
                        <button
                          onClick={() => setDeleteTarget(dept)}
                          className="inline-flex h-8 items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2.5 text-xs font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60 transition-colors"
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

      {/* Add / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
                {editingDept ? "แก้ไขข้อมูลแผนก" : "เพิ่มแผนกใหม่"}
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
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  ชื่อแผนก <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="เช่น บัญชี, การเงิน, การตลาด"
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  รายละเอียดแผนก
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="อธิบายบทบาทและขอบเขตงานของแผนก..."
                  className="w-full rounded-md border border-slate-200 bg-white p-3 text-sm focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  สถานะการใช้งาน
                </label>
                <select
                  value={formData.isActive ? "ACTIVE" : "INACTIVE"}
                  onChange={e => setFormData({ ...formData, isActive: e.target.value === "ACTIVE" })}
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="ACTIVE">ACTIVE (เปิดใช้งาน)</option>
                  <option value="INACTIVE">INACTIVE (ปิดใช้งาน)</option>
                </select>
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
                  {isPending ? "กำลังบันทึก..." : editingDept ? "บันทึกการแก้ไข" : "เพิ่มแผนก"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

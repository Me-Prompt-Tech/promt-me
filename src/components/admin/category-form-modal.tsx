"use client";

import { useState, useTransition, useEffect } from "react";
import { FormModal } from "@/components/ui/app-components";

export type CategoryData = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  showOrder: number;
  isActive: boolean;
};

export function CategoryFormModal({
  open,
  initialData,
  onClose,
  onSuccess,
}: {
  open: boolean;
  initialData?: CategoryData | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<CategoryData>({
    name: "",
    slug: "",
    description: "",
    icon: "",
    showOrder: 0,
    isActive: true,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: "",
        slug: "",
        description: "",
        icon: "",
        showOrder: 0,
        isActive: true,
      });
    }
    setError("");
  }, [initialData, open]);

  const handleSubmit = () => {
    setError("");
    startTransition(async () => {
      let res;
      try {
        const url = initialData?.id
          ? `/api/admin/document-categories/${initialData.id}`
          : "/api/admin/document-categories";
        
        const response = await fetch(url, {
          method: initialData?.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, isGlobal: true }),
        });
        res = await response.json();
      } catch (err: any) {
        res = { ok: false, error: err.message || "Network error" };
      }

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || res.message || "Failed to save category");
      }
    });
  };

  return (
    <FormModal
      open={open}
      title={initialData?.id ? "แก้ไขหมวดหมู่เอกสาร" : "เพิ่มหมวดหมู่เอกสาร"}
      onClose={onClose}
      onSubmit={isPending ? undefined : handleSubmit}
    >
      <div className="space-y-4">
        {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">ชื่อหมวดหมู่</label>
          <input
            type="text"
            className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="เช่น เอกสารจดทะเบียน"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Slug (ภาษาอังกฤษพิมพ์เล็ก)</label>
          <input
            type="text"
            className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="เช่น registration-documents"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">คำอธิบาย</label>
          <textarea
            className="mt-1 h-20 w-full rounded-md border border-slate-300 p-3 text-sm dark:border-slate-800 dark:bg-slate-950"
            value={formData.description || ""}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Icon</label>
            <input
              type="text"
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
              value={formData.icon || ""}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="เช่น Building2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">ลำดับการแสดงผล</label>
            <input
              type="number"
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
              value={formData.showOrder}
              onChange={(e) => setFormData({ ...formData, showOrder: Number(e.target.value) })}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          />
          <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300">เปิดใช้งาน (Active)</label>
        </div>
      </div>
    </FormModal>
  );
}

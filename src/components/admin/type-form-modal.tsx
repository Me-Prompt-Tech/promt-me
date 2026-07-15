"use client";

import { useState, useTransition, useEffect } from "react";
import { FormModal } from "@/components/ui/app-components";
import { createDocumentType, updateDocumentType } from "@/app/actions/admin-type-actions";

export type DocumentTypeData = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  showOrder: number;
  isActive: boolean;
};

export function TypeFormModal({
  open,
  initialData,
  categories,
  onClose,
  onSuccess,
}: {
  open: boolean;
  initialData?: DocumentTypeData | null;
  categories: { id: string; name: string }[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<DocumentTypeData>({
    name: "",
    slug: "",
    description: "",
    categoryId: categories[0]?.id || "",
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
        categoryId: categories[0]?.id || "",
        showOrder: 0,
        isActive: true,
      });
    }
    setError("");
  }, [initialData, open, categories]);

  const handleSubmit = () => {
    setError("");
    startTransition(async () => {
      const res = initialData?.id
        ? await updateDocumentType(initialData.id, formData)
        : await createDocumentType(formData);

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || "Failed to save document type");
      }
    });
  };

  return (
    <FormModal
      open={open}
      title={initialData?.id ? "แก้ไขประเภทเอกสาร" : "เพิ่มประเภทเอกสาร"}
      onClose={onClose}
      onSubmit={isPending ? undefined : handleSubmit}
    >
      <div className="space-y-4">
        {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">รหัส / Slug (ภาษาอังกฤษพิมพ์เล็ก)</label>
          <input
            type="text"
            className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="เช่น qt, inv, rec"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">ชื่อประเภทเอกสาร</label>
          <input
            type="text"
            className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="เช่น ใบเสนอราคา"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">หมวดหมู่</label>
          <select
            className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">คำอธิบาย</label>
          <textarea
            className="mt-1 h-20 w-full rounded-md border border-slate-300 p-3 text-sm dark:border-slate-800 dark:bg-slate-950"
            value={formData.description || ""}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActiveType"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          />
          <label htmlFor="isActiveType" className="text-sm font-medium text-slate-700 dark:text-slate-300">เปิดใช้งาน (Active)</label>
        </div>
      </div>
    </FormModal>
  );
}

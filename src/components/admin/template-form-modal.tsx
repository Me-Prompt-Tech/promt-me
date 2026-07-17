"use client";

import { useState, useTransition, useEffect } from "react";
import { FormModal } from "@/components/ui/app-components";

export type TemplateData = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  documentTypeId: string;
};

export function TemplateFormModal({
  open,
  initialData,
  categories,
  documentTypes,
  onClose,
  onSuccess,
}: {
  open: boolean;
  initialData?: TemplateData | null;
  categories: any[];
  documentTypes: any[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<TemplateData>({
    name: "",
    slug: "",
    description: "",
    categoryId: "",
    documentTypeId: "",
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          id: initialData.id,
          name: initialData.name || "",
          slug: initialData.slug || "",
          description: initialData.description || "",
          categoryId: initialData.categoryId || "",
          documentTypeId: initialData.documentTypeId || "",
        });
      } else {
        setFormData({
          name: "",
          slug: "",
          description: "",
          categoryId: "",
          documentTypeId: "",
        });
      }
    }
  }, [open, initialData]);

  const handleSubmit = () => {
    startTransition(async () => {
      let res;
      try {
        const payload = {
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          categoryId: formData.categoryId,
          documentTypeId: formData.documentTypeId,
          isGlobal: true,
        };
        const url = formData.id
          ? `/api/admin/templates/${formData.id}`
          : "/api/admin/templates";
        
        const response = await fetch(url, {
          method: formData.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        res = await response.json();
      } catch (err: any) {
        res = { ok: false, error: err.message };
      }

      if (res.ok) {
        onSuccess();
      } else {
        alert(res.error || res.message || "Something went wrong");
      }
    });
  };

  return (
    <FormModal
      open={open}
      title={initialData ? "แก้ไข Template" : "เพิ่ม Template ใหม่"}
      description={initialData ? "แก้ไขข้อมูล Template กลาง" : "เพิ่ม Template กลาง สำหรับให้ทุกบริษัทใช้งาน"}
      onClose={onClose}
      onSubmit={isPending ? undefined : handleSubmit}
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            ชื่อ Template <span className="text-rose-500">*</span>
          </label>
          <input
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-900"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="เช่น ใบเสนอราคา Standard"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            หมวดหมู่เอกสาร <span className="text-rose-500">*</span>
          </label>
          <select
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-900"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          >
            <option value="">-- เลือกหมวดหมู่ --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            ประเภทเอกสาร <span className="text-rose-500">*</span>
          </label>
          <select
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-900"
            value={formData.documentTypeId}
            onChange={(e) => setFormData({ ...formData, documentTypeId: e.target.value })}
          >
            <option value="">-- เลือกประเภทเอกสาร --</option>
            {documentTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Slug (ภาษาอังกฤษพิมพ์เล็ก ห้ามเว้นวรรค)
          </label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-900"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="เช่น quotation-standard"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            รายละเอียด
          </label>
          <textarea
            rows={3}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-900"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="อธิบายรายละเอียดการใช้งาน Template นี้"
          />
        </div>
      </div>
    </FormModal>
  );
}

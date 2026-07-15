"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { documentCategorySchema } from "@/lib/validation";

export async function getDocumentCategories() {
  try {
    const categories = await prisma.documentCategory.findMany({
      where: { isGlobal: true }, // Admin manages global categories
      orderBy: { showOrder: "asc" },
    });
    return { ok: true, data: categories };
  } catch (error) {
    console.error("Error fetching document categories:", error);
    return { ok: false, error: "Failed to fetch document categories" };
  }
}

export async function createDocumentCategory(formData: unknown) {
  try {
    const validatedData = documentCategorySchema.parse(formData);

    const newCategory = await prisma.documentCategory.create({
      data: {
        ...validatedData,
        isGlobal: true,
      },
    });

    revalidatePath("/admin/document-categories");
    return { ok: true, data: newCategory };
  } catch (error: any) {
    console.error("Error creating document category:", error);
    return { ok: false, error: error.message || "Failed to create category" };
  }
}

export async function updateDocumentCategory(id: string, formData: unknown) {
  try {
    const validatedData = documentCategorySchema.parse(formData);

    const updated = await prisma.documentCategory.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath("/admin/document-categories");
    return { ok: true, data: updated };
  } catch (error: any) {
    console.error("Error updating document category:", error);
    return { ok: false, error: error.message || "Failed to update category" };
  }
}

export async function deleteDocumentCategory(id: string) {
  try {
    // First, check if there are any document types using this category
    const typesCount = await prisma.documentType.count({
      where: { categoryId: id }
    });

    if (typesCount > 0) {
      return { ok: false, error: "ไม่สามารถลบได้เนื่องจากมีประเภทเอกสารที่อ้างอิงหมวดหมู่นี้อยู่" };
    }

    await prisma.documentCategory.delete({
      where: { id },
    });

    revalidatePath("/admin/document-categories");
    return { ok: true };
  } catch (error: any) {
    console.error("Error deleting document category:", error);
    return { ok: false, error: "Failed to delete category (it might be in use)" };
  }
}

export async function toggleDocumentCategoryStatus(id: string, currentStatus: boolean) {
  try {
    await prisma.documentCategory.update({
      where: { id },
      data: { isActive: !currentStatus },
    });
    revalidatePath("/admin/document-categories");
    return { ok: true };
  } catch (error) {
    console.error("Error toggling status:", error);
    return { ok: false, error: "Failed to toggle status" };
  }
}

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { documentTypeSchema } from "@/lib/validation";

export async function getDocumentTypes() {
  try {
    const types = await prisma.documentType.findMany({
      where: { isGlobal: true },
      include: {
        category: true,
      },
      orderBy: { showOrder: "asc" },
    });
    return { ok: true, data: types };
  } catch (error) {
    console.error("Error fetching document types:", error);
    return { ok: false, error: "Failed to fetch document types" };
  }
}

export async function createDocumentType(formData: unknown) {
  try {
    const validatedData = documentTypeSchema.parse(formData);

    const newType = await prisma.documentType.create({
      data: {
        ...validatedData,
        isGlobal: true,
      },
    });

    revalidatePath("/th/admin/document-types");
    return { ok: true, data: newType };
  } catch (error: any) {
    console.error("Error creating document type:", error);
    return { ok: false, error: error.message || "Failed to create type" };
  }
}

export async function updateDocumentType(id: string, formData: unknown) {
  try {
    const validatedData = documentTypeSchema.parse(formData);

    const updated = await prisma.documentType.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath("/th/admin/document-types");
    return { ok: true, data: updated };
  } catch (error: any) {
    console.error("Error updating document type:", error);
    return { ok: false, error: error.message || "Failed to update type" };
  }
}

export async function deleteDocumentType(id: string) {
  try {
    const templatesCount = await prisma.documentTemplate.count({
      where: { documentTypeId: id }
    });

    const docsCount = await prisma.document.count({
      where: { documentTypeId: id }
    });

    if (templatesCount > 0 || docsCount > 0) {
      return { ok: false, error: "ไม่สามารถลบได้เนื่องจากมีการอ้างอิงประเภทเอกสารนี้อยู่" };
    }

    await prisma.documentType.delete({
      where: { id },
    });

    revalidatePath("/th/admin/document-types");
    return { ok: true };
  } catch (error: any) {
    console.error("Error deleting document type:", error);
    return { ok: false, error: "Failed to delete type" };
  }
}

export async function toggleDocumentTypeStatus(id: string, currentStatus: boolean) {
  try {
    await prisma.documentType.update({
      where: { id },
      data: { isActive: !currentStatus },
    });
    revalidatePath("/th/admin/document-types");
    return { ok: true };
  } catch (error) {
    console.error("Error toggling status:", error);
    return { ok: false, error: "Failed to toggle status" };
  }
}

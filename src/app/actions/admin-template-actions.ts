"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getGlobalTemplates() {
  try {
    const templates = await prisma.documentTemplate.findMany({
      where: { isGlobal: true },
      include: {
        category: true,
        documentType: true,
      },
      orderBy: { name: "asc" },
    });
    return { ok: true, data: templates };
  } catch (error) {
    console.error("Error fetching templates:", error);
    return { ok: false, error: "Failed to fetch templates" };
  }
}

export async function createGlobalTemplate(data: {
  name: string;
  slug?: string;
  description?: string;
  categoryId: string;
  documentTypeId: string;
}) {
  try {
    const newTemplate = await prisma.documentTemplate.create({
      data: {
        ...data,
        isGlobal: true,
        layoutJson: {},
      },
    });
    revalidatePath("/[locale]/admin/templates", "page");
    return { ok: true, data: newTemplate };
  } catch (error) {
    console.error("Error creating template:", error);
    return { ok: false, error: "Failed to create template" };
  }
}

export async function updateGlobalTemplate(id: string, data: {
  name?: string;
  slug?: string;
  description?: string;
  categoryId?: string;
  documentTypeId?: string;
}) {
  try {
    const updated = await prisma.documentTemplate.update({
      where: { id },
      data,
    });
    revalidatePath("/[locale]/admin/templates", "page");
    return { ok: true, data: updated };
  } catch (error) {
    console.error("Error updating template:", error);
    return { ok: false, error: "Failed to update template" };
  }
}

export async function deleteGlobalTemplate(id: string) {
  try {
    await prisma.documentTemplate.delete({
      where: { id },
    });
    revalidatePath("/[locale]/admin/templates", "page");
    return { ok: true };
  } catch (error) {
    console.error("Error deleting template:", error);
    return { ok: false, error: "Failed to delete template" };
  }
}

export async function toggleGlobalTemplateStatus(id: string, currentStatus: boolean) {
  try {
    const updated = await prisma.documentTemplate.update({
      where: { id },
      data: { isActive: !currentStatus },
    });
    revalidatePath("/[locale]/admin/templates", "page");
    return { ok: true, data: updated };
  } catch (error) {
    console.error("Error toggling template status:", error);
    return { ok: false, error: "Failed to toggle status" };
  }
}

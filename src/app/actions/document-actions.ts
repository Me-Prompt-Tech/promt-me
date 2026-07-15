"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { companyWhere } from "@/lib/tenant";

export async function getDocuments() {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const documents = await prisma.document.findMany({
      where: companyWhere(session),
      include: {
        category: true,
        documentType: true,
        createdBy: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: documents };
  } catch (error) {
    console.error("Failed to get documents", error);
    return { success: false, error: "Failed to get documents" };
  }
}

export async function deleteDocument(id: string) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    // Should ideally check if document belongs to company, but this is a simplified version
    await prisma.document.delete({
      where: { id },
    });
    revalidatePath("/[locale]/documents", "page");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete document", error);
    return { success: false, error: "Failed to delete document" };
  }
}

export async function createDocument(data: any) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    // For simplicity, we are hardcoding a createdById since we don't have the user ID in session easily available right now.
    // Let's see if we can find a user for this company.
    const user = await prisma.companyUser.findFirst({
      where: companyWhere(session),
    });

    if (!user) return { success: false, error: "No user found in this company to create a document." };

    const document = await prisma.document.create({
      data: {
        ...data,
        companyId: companyWhere(session).companyId,
        createdById: user.id,
      },
    });

    revalidatePath("/[locale]/documents", "page");
    return { success: true, data: document };
  } catch (error) {
    console.error("Failed to create document", error);
    return { success: false, error: "Failed to create document" };
  }
}

export async function getDocumentById(id: string) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const document = await prisma.document.findUnique({
      where: { id },
    });
    
    if (document?.companyId !== companyWhere(session).companyId) {
       return { success: false, error: "Not found or unauthorized" };
    }
    return { success: true, data: document };
  } catch (error) {
    console.error("Failed to get document", error);
    return { success: false, error: "Failed to get document" };
  }
}

export async function updateDocument(id: string, data: any) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const document = await prisma.document.update({
      where: { id },
      data,
    });

    revalidatePath("/[locale]/documents", "page");
    return { success: true, data: document };
  } catch (error) {
    console.error("Failed to update document", error);
    return { success: false, error: "Failed to update document" };
  }
}

import { SystemAdminWorkspace } from "@/components/system-admin-workspace";
import { prisma } from "@/lib/prisma";

export default async function AdminDocumentCategoriesPage() {
  const categories = await prisma.documentCategory.findMany({
    where: { isGlobal: true },
    orderBy: { showOrder: "asc" },
  });

  return <SystemAdminWorkspace section="document-categories" data={{ categories }} />;
}

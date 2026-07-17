import { SystemAdminWorkspace } from "@/components/system-admin-workspace";
import { dbList } from "@/lib/api-router";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminDocumentCategoriesPage() {
  const session = await auth();
  if (!session) {
    redirect("/th/login");
  }

  const [categoriesRes, typesRes] = await Promise.all([
    dbList("document-categories", { isGlobal: true }),
    dbList("document-types", { isGlobal: true })
  ]);
  const rawCategories = categoriesRes.ok ? categoriesRes.data : [];
  const documentTypes = typesRes.ok ? typesRes.data : [];

  const categories = rawCategories.map((cat: any) => ({
    ...cat,
    types: documentTypes.filter((t: any) => t.categoryId === cat.id).sort((a: any, b: any) => (a.showOrder || 0) - (b.showOrder || 0))
  })).sort((a: any, b: any) => (a.showOrder || 0) - (b.showOrder || 0));

  return <SystemAdminWorkspace section="document-categories" data={{ categories }} />;
}

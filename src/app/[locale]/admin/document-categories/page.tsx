import { SystemAdminWorkspace } from "@/components/system-admin-workspace";
import { dbList } from "@/lib/api-router";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminDocumentCategoriesPage() {
  const session = await auth();
  if (!session) {
    redirect("/th/login");
  }

  const categoriesRes = await dbList("document-categories", { isGlobal: true });
  const categories = categoriesRes.ok ? categoriesRes.data : [];

  return <SystemAdminWorkspace section="document-categories" data={{ categories }} />;
}

import { SystemAdminWorkspace } from "@/components/system-admin-workspace";
import { dbList } from "@/lib/api-router";

export default async function AdminDocumentTypesPage() {
  const [typesRes, categoriesRes] = await Promise.all([
    dbList("document-types", { isGlobal: true }),
    dbList("document-categories", { isGlobal: true })
  ]);

  const documentTypes = typesRes.ok ? typesRes.data : [];
  const categories = categoriesRes.ok ? categoriesRes.data : [];

  return <SystemAdminWorkspace section="document-types" data={{ documentTypes, categories }} />;
}

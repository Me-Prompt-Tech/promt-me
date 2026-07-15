import { SystemAdminWorkspace } from "@/components/system-admin-workspace";
import { getDocumentTypes } from "@/app/actions/admin-type-actions";
import { getDocumentCategories } from "@/app/actions/admin-category-actions";

export default async function AdminDocumentTypesPage() {
  const [typesRes, categoriesRes] = await Promise.all([
    getDocumentTypes(),
    getDocumentCategories()
  ]);

  const documentTypes = typesRes.ok ? typesRes.data : [];
  const categories = categoriesRes.ok ? categoriesRes.data : [];

  return <SystemAdminWorkspace section="document-types" data={{ documentTypes, categories }} />;
}

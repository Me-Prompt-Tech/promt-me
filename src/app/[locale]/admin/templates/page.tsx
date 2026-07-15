import { SystemAdminWorkspace } from "@/components/system-admin-workspace";
import { getGlobalTemplates } from "@/app/actions/admin-template-actions";
import { getDocumentCategories } from "@/app/actions/admin-category-actions";
import { getDocumentTypes } from "@/app/actions/admin-type-actions";

export default async function AdminTemplatesPage() {
  const [templatesRes, categoriesRes, typesRes] = await Promise.all([
    getGlobalTemplates(),
    getDocumentCategories(),
    getDocumentTypes(),
  ]);

  const data = {
    templates: templatesRes.ok ? templatesRes.data : [],
    categories: categoriesRes.ok ? categoriesRes.data : [],
    documentTypes: typesRes.ok ? typesRes.data : [],
  };

  return <SystemAdminWorkspace section="templates" data={data} />;
}

import { SystemAdminWorkspace } from "@/components/system-admin-workspace";
import { dbList } from "@/lib/api-router";

export default async function AdminTemplatesPage() {
  const [templatesRes, categoriesRes, typesRes] = await Promise.all([
    dbList("templates", { isGlobal: true }),
    dbList("document-categories", { isGlobal: true }),
    dbList("document-types", { isGlobal: true }),
  ]);

  const data = {
    templates: templatesRes.ok ? templatesRes.data : [],
    categories: categoriesRes.ok ? categoriesRes.data : [],
    documentTypes: typesRes.ok ? typesRes.data : [],
  };

  return <SystemAdminWorkspace section="templates" data={data} />;
}

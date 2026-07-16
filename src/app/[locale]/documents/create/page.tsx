import { CompanyWorkspace } from "@/components/company-workspace";
import { dbList } from "@/lib/api-router";
import { auth } from "@/auth";

export default async function CreateDocumentPage() {
  const session = await auth();
  const companyId = (session?.user as any)?.companyId;

  const [catRes, typeRes] = await Promise.all([
    dbList("document-categories", { isGlobal: true }),
    dbList("document-types", { isGlobal: true })
  ]);
  
  const categories = catRes.ok ? catRes.data : [];
  const documentTypes = typeRes.ok ? typeRes.data : [];

  return <CompanyWorkspace section="document-create" data={{ categories, documentTypes }} companyId={companyId} />;
}

import { CompanyWorkspace } from "@/components/company-workspace";
import { dbList } from "@/lib/api-router";
import { auth } from "@/auth";

export default async function DocumentsPage() {
  const session = await auth();
  const companyId = (session?.user as any)?.companyId;
  const result = await dbList("documents", companyId ? { companyId } : {});
  const documents = result.ok ? result.data : [];

  return <CompanyWorkspace section="documents" data={{ documents }} />;
}

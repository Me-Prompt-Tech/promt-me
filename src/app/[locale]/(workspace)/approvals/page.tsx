import { CompanyWorkspace } from "@/components/company-workspace";
import { dbList } from "@/lib/api-router";
import { auth } from "@/auth";

export default async function ApprovalsPage() {
  const session = await auth();
  const companyId = (session?.user as any)?.companyId;
  const result = await dbList("approvals", companyId ? { companyId } : {});
  const approvals = result.ok ? result.data : [];

  return (
    <CompanyWorkspace 
      section="approvals" 
      data={{ approvals }} 
      companyId={companyId} 
    />
  );
}

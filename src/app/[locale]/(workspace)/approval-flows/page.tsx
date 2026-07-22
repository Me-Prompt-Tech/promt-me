import { CompanyWorkspace } from "@/components/company-workspace";
import { dbList } from "@/lib/api-router";
import { auth } from "@/auth";

export default async function ApprovalFlowsPage() {
  const session = await auth();
  const companyId = (session?.user as any)?.companyId;
  
  const flowsResult = await dbList("approval-flows", companyId ? { companyId } : {});
  const documentTypesResult = await dbList("document-types", { isGlobal: true });
  
  const approvalFlows = flowsResult.ok ? flowsResult.data : [];
  const documentTypes = documentTypesResult.ok ? documentTypesResult.data : [];

  return (
    <CompanyWorkspace 
      section="approval-flows" 
      data={{ approvalFlows, documentTypes }} 
      companyId={companyId} 
    />
  );
}

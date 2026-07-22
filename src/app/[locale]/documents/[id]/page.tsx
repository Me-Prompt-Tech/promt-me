import { CompanyWorkspace } from "@/components/company-workspace";
import { dbDetail } from "@/lib/api-router";
import { auth } from "@/auth";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const companyId = (session?.user as any)?.companyId;
  const result = await dbDetail("documents", { id, companyId });
  const document = result.ok ? result.data : null;

  return (
    <CompanyWorkspace 
      section="document-detail" 
      data={{ document }} 
      companyId={companyId} 
    />
  );
}

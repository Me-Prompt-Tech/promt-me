import { CompanyWorkspace } from "@/components/company-workspace";
import { dbDetail } from "@/lib/api-router";
import { auth } from "@/auth";

export default async function CompanySettingsPage() {
  const session = await auth();
  const companyId = (session?.user as any)?.companyId;
  const result = companyId ? await dbDetail("companies", { id: companyId }) : { ok: false };
  const company = result.ok ? (result as any).data : null;

  return (
    <CompanyWorkspace 
      section="settings-company" 
      data={{ company }} 
      companyId={companyId} 
    />
  );
}

import { CompanyWorkspace } from "@/components/company-workspace";
import { dbList } from "@/lib/api-router";
import { auth } from "@/auth";

export default async function CompanyUsersSettingsPage() {
  const session = await auth();
  const companyId = (session?.user as any)?.companyId;
  const result = companyId ? await dbList("company-users", { companyId }) : { ok: false };
  const users = result.ok ? (result as any).data : [];

  return (
    <CompanyWorkspace 
      section="settings-users" 
      data={{ users }} 
      companyId={companyId} 
    />
  );
}

import { CompanyWorkspace } from "@/components/company-workspace";
import { dbList } from "@/lib/api-router";
import { auth } from "@/auth";

export default async function DocumentNumberSettingsPage() {
  const session = await auth();
  const companyId = (session?.user as any)?.companyId;
  
  const settingsResult = companyId ? await dbList("document-number-settings", { companyId }) : { ok: false };
  const typesResult = await dbList("document-types", { isGlobal: true });
  
  const settings = settingsResult.ok ? (settingsResult as any).data : [];
  const documentTypes = typesResult.ok ? (typesResult as any).data : [];

  return (
    <CompanyWorkspace 
      section="document-number-settings" 
      data={{ settings, documentTypes }} 
      companyId={companyId} 
    />
  );
}

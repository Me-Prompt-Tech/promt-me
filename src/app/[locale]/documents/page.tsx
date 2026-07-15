import { CompanyWorkspace } from "@/components/company-workspace";
import { getDocuments } from "@/app/actions/document-actions";

export default async function DocumentsPage() {
  const result = await getDocuments();
  const documents = result.success ? result.data : [];

  return <CompanyWorkspace section="documents" data={{ documents }} />;
}

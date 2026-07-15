import { CompanyWorkspace } from "@/components/company-workspace";
import { getDocumentCategories } from "@/app/actions/admin-category-actions";
import { getDocumentTypes } from "@/app/actions/admin-type-actions";

export default async function CreateDocumentPage() {
  const [catRes, typeRes] = await Promise.all([
    getDocumentCategories(),
    getDocumentTypes()
  ]);
  
  const categories = catRes.success ? catRes.data : [];
  const documentTypes = typeRes.success ? typeRes.data : [];

  return <CompanyWorkspace section="document-create" data={{ categories, documentTypes }} />;
}

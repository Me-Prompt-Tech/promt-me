import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CompanyClientShell } from "@/components/company-client-shell";

export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (
    session.user.role === "SUPER_ADMIN" ||
    session.user.role === "SUPPORT" ||
    (session.user.role === "ADMIN" && !session.user.companyId)
  ) {
    redirect("/admin/dashboard");
  }

  // TODO: Fetch real company name from database using session.user.companyId
  const companyName = "Siam Retail Co., Ltd.";

  return (
    <CompanyClientShell userName={session.user.name} companyName={companyName}>
      {children}
    </CompanyClientShell>
  );
}

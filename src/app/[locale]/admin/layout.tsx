import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminClientShell } from "@/components/admin-client-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  const isSystemAdmin =
    session?.user.role === "SUPER_ADMIN" ||
    session?.user.role === "SUPPORT" ||
    (session?.user.role === "ADMIN" && !session?.user.companyId);

  if (!session || !isSystemAdmin) {
    redirect("/login");
  }

  return (
    <AdminClientShell userName={session.user.name}>
      {children}
    </AdminClientShell>
  );
}

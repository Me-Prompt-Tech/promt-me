import { auth } from "@/auth";
import { CompanyWorkspace } from "@/components/company-workspace";
import { prisma } from "@/lib/prisma";

export default async function EmployeesPage() {
  const session = await auth();
  const companyId = session?.user?.companyId;

  let initialEmployees: any[] = [];
  let departments: any[] = [];

  if (companyId) {
    try {
      initialEmployees = await prisma.employee.findMany({
        where: { companyId },
        include: { department: true },
        orderBy: { createdAt: "desc" },
      });
      departments = await prisma.department.findMany({
        where: { companyId },
        orderBy: { name: "asc" },
      });
    } catch (e) {
      console.error("Failed to load employee data:", e);
    }
  }

  return (
    <CompanyWorkspace
      section="employees"
      companyId={companyId}
      data={{ employees: initialEmployees, departments }}
    />
  );
}

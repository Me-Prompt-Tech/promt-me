import { auth } from "@/auth";
import { CompanyWorkspace } from "@/components/company-workspace";
import { prisma } from "@/lib/prisma";

export default async function DepartmentsPage() {
  const session = await auth();
  const companyId = session?.user?.companyId;

  let initialDepartments: any[] = [];
  let initialEmployees: any[] = [];
  let initialUsers: any[] = [];

  if (companyId) {
    try {
      initialDepartments = await prisma.department.findMany({
        where: { companyId },
        include: {
          _count: {
            select: { users: true, employees: true },
          },
        },
        orderBy: { name: "asc" },
      });
      initialEmployees = await prisma.employee.findMany({
        where: { companyId },
        include: { department: true },
      });
      initialUsers = await prisma.companyUser.findMany({
        where: { companyId },
        include: { department: true },
      });
    } catch (e) {
      console.error("Failed to load department data:", e);
    }
  }

  return (
    <CompanyWorkspace
      section="departments"
      companyId={companyId}
      data={{
        departments: initialDepartments,
        employees: initialEmployees,
        users: initialUsers,
      }}
    />
  );
}

import { auth } from "@/auth";
import { CompanyWorkspace } from "@/components/company-workspace";
<<<<<<< Updated upstream
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
=======
import { dbList } from "@/lib/api-router";
import { auth } from "@/auth";

export default async function DepartmentsPage() {
  const session = await auth();
  const companyId = (session?.user as any)?.companyId;

  let departments: any[] = [];

  try {
    const res = await dbList("departments", companyId ? { companyId } : {});
    if (res.ok && Array.isArray(res.data)) {
      departments = res.data;
    }
  } catch (err) {
    console.error("Failed to load server data for departments page:", err);
>>>>>>> Stashed changes
  }

  return (
    <CompanyWorkspace
      section="departments"
      companyId={companyId}
<<<<<<< Updated upstream
      data={{
        departments: initialDepartments,
        employees: initialEmployees,
        users: initialUsers,
      }}
=======
      data={{ departments }}
>>>>>>> Stashed changes
    />
  );
}

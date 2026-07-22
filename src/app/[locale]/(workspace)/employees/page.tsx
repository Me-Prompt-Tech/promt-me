import { auth } from "@/auth";
import { CompanyWorkspace } from "@/components/company-workspace";
<<<<<<< Updated upstream
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
=======
import { dbList } from "@/lib/api-router";
import { auth } from "@/auth";

export default async function EmployeesPage() {
  const session = await auth();
  const companyId = (session?.user as any)?.companyId;

  let employees: any[] = [];
  let departments: any[] = [];

  try {
    const [empRes, deptRes] = await Promise.all([
      dbList("employees", companyId ? { companyId } : {}),
      dbList("departments", companyId ? { companyId } : {}),
    ]);
    if (empRes.ok && Array.isArray(empRes.data)) {
      employees = empRes.data;
    }
    if (deptRes.ok && Array.isArray(deptRes.data)) {
      departments = deptRes.data;
    }
  } catch (err) {
    console.error("Failed to load server data for employees page:", err);
>>>>>>> Stashed changes
  }

  return (
    <CompanyWorkspace
      section="employees"
      companyId={companyId}
<<<<<<< Updated upstream
      data={{ employees: initialEmployees, departments }}
=======
      data={{ employees, departments }}
>>>>>>> Stashed changes
    />
  );
}

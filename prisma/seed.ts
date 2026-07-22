import { PrismaClient, SystemAdminRole, PlanStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  log: ['error'],
});

async function main() {
  console.log('Start seeding...');

  // 14.1 & 14.2 Document Categories & Types
  const categories = [
    {
      name: 'เอกสารจดทะเบียน',
      slug: 'registration-docs',
      isGlobal: true,
      types: [
        { name: 'หนังสือรับรองบริษัท', slug: 'company-certificate' },
        { name: 'ใบทะเบียนพาณิชย์', slug: 'commercial-registration' },
        { name: 'ภ.พ.20', slug: 'pp20' },
        { name: 'บอจ.5', slug: 'boj5' },
      ],
    },
    {
      name: 'เอกสารด้านบัญชีและการเงิน',
      slug: 'accounting-finance',
      isGlobal: true,
      types: [
        { name: 'ใบเสนอราคา', slug: 'quotation' },
        { name: 'ใบแจ้งหนี้', slug: 'invoice' },
        { name: 'ใบเสร็จรับเงิน', slug: 'receipt' },
        { name: 'ใบวางบิล', slug: 'billing-note' },
        { name: 'รายงานรายรับรายจ่าย', slug: 'income-expense-report' },
      ],
    },
    {
      name: 'เอกสารภาษี',
      slug: 'tax-docs',
      isGlobal: true,
      types: [
        { name: 'ใบกำกับภาษี', slug: 'tax-invoice' },
        { name: 'ภ.ง.ด.1', slug: 'pnd1' },
        { name: 'ภ.ง.ด.3', slug: 'pnd3' },
        { name: 'ภ.ง.ด.53', slug: 'pnd53' },
        { name: 'ภ.พ.30', slug: 'pp30' },
      ],
    },
    {
      name: 'เอกสารบุคคล',
      slug: 'hr-docs',
      isGlobal: true,
      types: [
        { name: 'สัญญาจ้างงาน', slug: 'employment-contract' },
        { name: 'ใบลา', slug: 'leave-form' },
        { name: 'หนังสือรับรองเงินเดือน', slug: 'salary-certificate' },
        { name: 'ประวัติพนักงาน', slug: 'employee-profile' },
      ],
    },
    {
      name: 'เอกสารการดำเนินงาน',
      slug: 'operation-docs',
      isGlobal: true,
      types: [
        { name: 'รายงานการประชุม', slug: 'meeting-minutes' },
        { name: 'ใบสั่งงาน', slug: 'work-order' },
        { name: 'ใบตรวจงาน', slug: 'inspection-form' },
        { name: 'Checklist งาน', slug: 'task-checklist' },
      ],
    },
  ];

  for (const cat of categories) {
    let category = await prisma.documentCategory.findFirst({
      where: { slug: cat.slug, isGlobal: true }
    });

    if (!category) {
      category = await prisma.documentCategory.create({
        data: {
          name: cat.name,
          slug: cat.slug,
          isGlobal: cat.isGlobal,
        }
      });
    }

    for (const t of cat.types) {
      // Need a composite key or unique constraint to upsert properly for DocumentType,
      // but DocumentType doesn't have a unique constraint on slug globally (only [companyId, categoryId, slug]).
      // Since it's global (companyId = null), we can't easily upsert with Prisma if the unique constraint includes an optional field depending on DB.
      // Wait, in schema: @@unique([companyId, categoryId, slug]).
      // Actually Prisma doesn't perfectly support upsert with nulls in MongoDB unique constraints sometimes,
      // but let's try finding first.

      const existingType = await prisma.documentType.findFirst({
        where: {
          slug: t.slug,
          categoryId: category.id,
          isGlobal: true
        }
      });

      if (!existingType) {
        await prisma.documentType.create({
          data: {
            name: t.name,
            slug: t.slug,
            categoryId: category.id,
            isGlobal: true,
          }
        });
      }
    }
  }

  // 14.3 Default Plan
  const plans = [
    { name: 'Free', priceSatang: 0, status: PlanStatus.ACTIVE },
    { name: 'Starter', priceSatang: 29900, status: PlanStatus.ACTIVE },
    { name: 'Professional', priceSatang: 99900, status: PlanStatus.ACTIVE },
    { name: 'Business', priceSatang: 299900, status: PlanStatus.ACTIVE },
  ];

  for (const p of plans) {
    // Note: Plan doesn't have a unique slug/name in schema. Using findFirst by name.
    const existingPlan = await prisma.plan.findFirst({
      where: { name: p.name }
    });

    if (!existingPlan) {
      await prisma.plan.create({
        data: p
      });
    }
  }

  // 14.4 Default System Admin
  const adminEmail = 'admin@example.com';
  const adminUsername = 'admin';
  const existingAdmin = await prisma.systemAdmin.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('password', 10);
    await prisma.systemAdmin.create({
      data: {
        username: adminUsername,
        email: adminEmail,
        passwordHash,
        name: 'System Admin',
        role: SystemAdminRole.SUPER_ADMIN,
        isActive: true,
      }
    });
    console.log(`Created default System Admin: ${adminEmail}`);
  } else {
    console.log(`System Admin already exists: ${adminEmail}`);
  }

  // 14.5 Default Company, Departments, and Employees
  const companyId = '668f191e810c19729de860ea';
  let company = await prisma.company.findUnique({
    where: { id: companyId }
  });

  if (!company) {
    company = await prisma.company.create({
      data: {
        id: companyId,
        name: 'Siam Retail Co., Ltd.',
        legalName: 'บริษัท สยาม รีเทล จำกัด',
        taxId: '0105566000001',
        branchCode: '00000',
        email: 'info@siamretail.example.com',
        phone: '02-123-4567',
        address: '88/1 ถนนสุขุมวิท กรุงเทพมหานคร 10110',
        status: 'ACTIVE',
      }
    });
    console.log(`Created default Company: ${company.name}`);
  }

  // Create default departments
  const deptData = [
    { id: '668f191e810c19729de860d1', name: 'บัญชี', description: 'ฝ่ายบัญชีและการเงินหลัก' },
    { id: '668f191e810c19729de860d2', name: 'การเงิน', description: 'ฝ่ายการเงิน วางแผนงบประมาณ' },
    { id: '668f191e810c19729de860d3', name: 'บุคคล', description: 'ฝ่ายบริหารทรัพยากรบุคคล (HR)' },
    { id: '668f191e810c19729de860d4', name: 'ปฏิบัติการ', description: 'ฝ่ายปฏิบัติการและคลังสินค้า' },
  ];

  for (const d of deptData) {
    const existingDept = await prisma.department.findFirst({
      where: { companyId, name: d.name }
    });

    if (!existingDept) {
      await prisma.department.create({
        data: {
          id: d.id,
          companyId,
          name: d.name,
          description: d.description,
          isActive: true,
        }
      });
      console.log(`Created department: ${d.name}`);
    }
  }

  // Fetch departments to link employees correctly
  const acctDept = await prisma.department.findFirst({ where: { companyId, name: 'บัญชี' } });
  const finDept = await prisma.department.findFirst({ where: { companyId, name: 'การเงิน' } });
  const opsDept = await prisma.department.findFirst({ where: { companyId, name: 'ปฏิบัติการ' } });

  // Create default employees
  const employeesData = [
    {
      code: 'EMP-001',
      name: 'คุณวราภรณ์',
      email: 'accountant@example.com',
      phone: '081-111-2233',
      position: 'Senior Accountant',
      departmentId: acctDept?.id,
      salarySatang: 5800000,
      startDate: new Date('2024-01-01'),
      status: 'ACTIVE' as const,
    },
    {
      code: 'EMP-002',
      name: 'คุณอรทัย',
      email: 'finance@example.com',
      phone: '082-444-9988',
      position: 'Finance Manager',
      departmentId: finDept?.id,
      salarySatang: 7200000,
      startDate: new Date('2023-03-15'),
      status: 'ACTIVE' as const,
    },
    {
      code: 'EMP-003',
      name: 'คุณกิตติ',
      email: 'operation@example.com',
      phone: '083-555-1122',
      position: 'Operation Lead',
      departmentId: opsDept?.id,
      salarySatang: 4900000,
      startDate: new Date('2025-06-01'),
      status: 'ACTIVE' as const,
    },
  ];

  for (const emp of employeesData) {
    const existingEmp = await prisma.employee.findFirst({
      where: { companyId, code: emp.code }
    });

    if (!existingEmp) {
      await prisma.employee.create({
        data: {
          companyId,
          ...emp,
        }
      });
      console.log(`Created employee: ${emp.name} (${emp.code})`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

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

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.documentCategory.findMany({
    where: { companyId: null, isGlobal: false }
  });

  console.log(`Found ${categories.length} categories with companyId=null and isGlobal=false`);

  const res = await prisma.documentCategory.updateMany({
    where: { companyId: null, isGlobal: false },
    data: { isGlobal: true }
  });

  console.log(`Updated ${res.count} categories.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

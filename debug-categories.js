const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.documentCategory.findMany({
    where: { companyId: null }
  });

  console.log(`Found ${categories.length} categories with companyId=null`);
  console.log(JSON.stringify(categories, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

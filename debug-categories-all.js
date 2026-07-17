const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.documentCategory.findMany({});

  console.log(`Found ${categories.length} TOTAL categories`);
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

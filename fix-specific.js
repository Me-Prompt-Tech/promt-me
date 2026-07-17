const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const res = await prisma.documentCategory.update({
    where: { id: "6a59b4ec87225799f1e8b6da" },
    data: { isGlobal: true }
  });
  console.log("Updated category:", res);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

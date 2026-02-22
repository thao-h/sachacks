import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create sample drivers
  const driver1 = await prisma.driver.upsert({
    where: { id: "driver-1" },
    update: {},
    create: {
      id: "driver-1",
      name: "Alex Johnson",
      phone: "(916) 555-0301",
    },
  });

  const driver2 = await prisma.driver.upsert({
    where: { id: "driver-2" },
    update: {},
    create: {
      id: "driver-2",
      name: "Sam Rivera",
      phone: "(916) 555-0302",
    },
  });

  console.log(`Created drivers: ${driver1.name}, ${driver2.name}`);

  // Import restaurants from JSON files
  console.log("\nImporting restaurants from JSON files...");
  const { importRestaurants } = await import("./import-restaurants");
  await importRestaurants();

  console.log("\nSeed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

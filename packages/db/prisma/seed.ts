import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create sample restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: "marios-pizza" },
    update: {},
    create: {
      name: "Mario's Pizza",
      slug: "marios-pizza",
      address: "123 Main St, Sacramento, CA 95814",
      phone: "(916) 555-0100",
      menuItems: {
        create: [
          { name: "Margherita Pizza", description: "Classic tomato, mozzarella, basil", priceCents: 1499, category: "Pizza" },
          { name: "Pepperoni Pizza", description: "Pepperoni, mozzarella, tomato sauce", priceCents: 1699, category: "Pizza" },
          { name: "Caesar Salad", description: "Romaine, parmesan, croutons, caesar dressing", priceCents: 999, category: "Salads" },
          { name: "Garlic Bread", description: "Toasted bread with garlic butter", priceCents: 599, category: "Sides" },
          { name: "Tiramisu", description: "Classic Italian dessert", priceCents: 899, category: "Desserts" },
        ],
      },
    },
  });
  console.log(`Created restaurant: ${restaurant.name} (${restaurant.slug})`);

  // Create sample restaurant 2
  const restaurant2 = await prisma.restaurant.upsert({
    where: { slug: "sakura-sushi" },
    update: {},
    create: {
      name: "Sakura Sushi",
      slug: "sakura-sushi",
      address: "456 J St, Sacramento, CA 95814",
      phone: "(916) 555-0200",
      menuItems: {
        create: [
          { name: "California Roll", description: "Crab, avocado, cucumber", priceCents: 1299, category: "Rolls" },
          { name: "Salmon Nigiri", description: "Fresh salmon over rice (2 pcs)", priceCents: 899, category: "Nigiri" },
          { name: "Miso Soup", description: "Traditional miso with tofu and seaweed", priceCents: 499, category: "Soups" },
          { name: "Edamame", description: "Steamed soybeans with sea salt", priceCents: 599, category: "Appetizers" },
        ],
      },
    },
  });
  console.log(`Created restaurant: ${restaurant2.name} (${restaurant2.slug})`);

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
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

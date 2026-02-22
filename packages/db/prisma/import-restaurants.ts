import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Convert a price value (string or number) to integer cents.
 * Handles: "$12.99", "12.99", "12", 12.99, 12, etc.
 * Returns null if unparseable.
 */
function parsePriceCents(raw: unknown): number | null {
  if (raw == null) return null;
  const str = String(raw).replace(/[$,]/g, "").trim();
  if (str === "") return null;
  const num = parseFloat(str);
  if (isNaN(num) || num < 0) return null;
  return Math.round(num * 100);
}

/**
 * Extract a field value from an item object, trying multiple possible keys.
 */
function pick(item: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const val = item[key];
    if (val != null && String(val).trim() !== "") {
      return String(val).trim();
    }
  }
  return "";
}

// ---------------------------------------------------------------------------
// Normalization: extract dishes from a JSON file's parsed data
// ---------------------------------------------------------------------------

interface NormalizedDish {
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string | null;
  category: string;
}

function normalizeDishes(data: unknown): NormalizedDish[] {
  // If data is an array (the common case), each element is a dish
  if (Array.isArray(data)) {
    return data
      .map((item) => normalizeSingleDish(item as Record<string, unknown>))
      .filter((d): d is NormalizedDish => d !== null);
  }

  // If data is an object, look for common item arrays
  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    for (const key of ["items", "menu", "dishes", "products", "menuItems"]) {
      if (Array.isArray(obj[key])) {
        return (obj[key] as Record<string, unknown>[])
          .map((item) => normalizeSingleDish(item))
          .filter((d): d is NormalizedDish => d !== null);
      }
    }
  }

  return [];
}

function normalizeSingleDish(
  item: Record<string, unknown>,
): NormalizedDish | null {
  const name = pick(
    item,
    "Dish Name",
    "Product Name",
    "name",
    "dish_name",
    "item_name",
    "title",
  );
  if (!name) return null;

  const priceRaw =
    item["Price (USD)"] ?? item["price"] ?? item["Price"] ?? item["cost"];
  const priceCents = parsePriceCents(priceRaw);
  if (priceCents === null || priceCents === 0) return null;

  const description = pick(
    item,
    "Dish Description",
    "Product Description",
    "description",
    "desc",
  );

  const imageUrl =
    pick(item, "Product Image", "image", "imageUrl", "image_url", "img") ||
    null;

  const category = pick(
    item,
    "Category",
    "Product Type",
    "category",
    "type",
    "section",
  );

  return {
    name,
    description,
    priceCents,
    imageUrl,
    category: category || "General",
  };
}

// ---------------------------------------------------------------------------
// Extract restaurant-level info from items (some formats embed it)
// ---------------------------------------------------------------------------

function extractRestaurantInfo(data: unknown): {
  address?: string;
  phone?: string;
} {
  if (!Array.isArray(data) || data.length === 0) return {};

  const first = data[0] as Record<string, unknown>;
  const address = pick(first, "Restaurant Address", "address") || undefined;
  const phone = pick(first, "Phone Number", "phone") || undefined;
  return { address, phone };
}

// ---------------------------------------------------------------------------
// Main import function
// ---------------------------------------------------------------------------

export async function importRestaurants() {
  const repoRoot = path.resolve(__dirname, "..", "..", "..");
  const restaurantsDir = path.join(repoRoot, "restaurants");

  if (!fs.existsSync(restaurantsDir)) {
    console.log(`No restaurants/ directory found at ${restaurantsDir}`);
    return;
  }

  const files = fs
    .readdirSync(restaurantsDir)
    .filter((f) => f.endsWith(".json"));

  if (files.length === 0) {
    console.log("No .json files found in restaurants/");
    return;
  }

  let totalRestaurants = 0;
  let totalItems = 0;
  let totalSkipped = 0;

  for (const file of files) {
    const filePath = path.join(restaurantsDir, file);
    const restaurantName = path.basename(file, ".json");
    const slug = slugify(restaurantName);

    console.log(`\nProcessing: ${file}`);

    let rawData: unknown;
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      rawData = JSON.parse(content);
    } catch (err) {
      console.warn(`  ⚠ Failed to parse ${file}: ${err}`);
      totalSkipped++;
      continue;
    }

    const info = extractRestaurantInfo(rawData);
    const dishes = normalizeDishes(rawData);

    if (dishes.length === 0) {
      console.warn(`  ⚠ No valid dishes found in ${file}, skipping`);
      totalSkipped++;
      continue;
    }

    // Deduplicate dishes by name (keep first occurrence)
    const seen = new Set<string>();
    const uniqueDishes = dishes.filter((d) => {
      const key = d.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const skippedDupes = dishes.length - uniqueDishes.length;

    // Upsert restaurant
    await prisma.restaurant.upsert({
      where: { slug },
      update: {
        name: restaurantName,
        ...(info.address ? { address: info.address } : {}),
        ...(info.phone ? { phone: info.phone } : {}),
      },
      create: {
        name: restaurantName,
        slug,
        address: info.address || "",
        phone: info.phone || "",
      },
    });

    // Get restaurant ID
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
    });
    if (!restaurant) continue;

    // Delete existing menu items for this restaurant, then create new ones
    await prisma.menuItem.deleteMany({
      where: { restaurantId: restaurant.id },
    });

    await prisma.menuItem.createMany({
      data: uniqueDishes.map((dish) => ({
        restaurantId: restaurant.id,
        name: dish.name,
        description: dish.description,
        priceCents: dish.priceCents,
        imageUrl: dish.imageUrl,
        category: dish.category,
      })),
    });

    totalRestaurants++;
    totalItems += uniqueDishes.length;

    console.log(
      `  ✓ ${restaurantName}: ${uniqueDishes.length} items imported${skippedDupes > 0 ? ` (${skippedDupes} duplicates removed)` : ""}`,
    );
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`Import Summary:`);
  console.log(`  Files processed: ${files.length}`);
  console.log(`  Restaurants imported: ${totalRestaurants}`);
  console.log(`  Menu items imported: ${totalItems}`);
  console.log(`  Skipped files: ${totalSkipped}`);
  console.log(`${"=".repeat(50)}`);
}

// Run directly
importRestaurants()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

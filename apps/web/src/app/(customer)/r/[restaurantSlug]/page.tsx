import { prisma } from "@/server/db";
import { formatCents } from "@ddba/shared";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ restaurantSlug: string }>;
};

export default async function RestaurantMenuPage({ params }: Props) {
  const { restaurantSlug } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
    include: { menuItems: { where: { isAvailable: true }, orderBy: { category: "asc" } } },
  });

  if (!restaurant) return notFound();

  const grouped = restaurant.menuItems.reduce<Record<string, typeof restaurant.menuItems>>(
    (acc, item) => {
      const cat = item.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {},
  );

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
      <a href="/" style={{ color: "#666", fontSize: "0.9rem" }}>&larr; Back</a>
      <h1 style={{ marginTop: "1rem" }}>{restaurant.name}</h1>
      <p style={{ color: "#666" }}>{restaurant.address} &middot; {restaurant.phone}</p>

      {Object.entries(grouped).map(([category, items]) => (
        <section key={category} style={{ marginTop: "2rem" }}>
          <h2 style={{ borderBottom: "1px solid #eee", paddingBottom: "0.5rem" }}>{category}</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {items.map((item) => (
              <li key={item.id} style={{ padding: "1rem 0", borderBottom: "1px solid #f5f5f5", display: "flex", justifyContent: "space-between" }}>
                <div>
                  <strong>{item.name}</strong>
                  {item.description && <p style={{ color: "#666", fontSize: "0.9rem", margin: "0.25rem 0 0" }}>{item.description}</p>}
                </div>
                <span style={{ fontWeight: 600, whiteSpace: "nowrap", marginLeft: "1rem" }}>{formatCents(item.priceCents)}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {/* TODO: Add order form / cart functionality */}
      <p style={{ marginTop: "2rem", padding: "1rem", background: "#f9f9f9", borderRadius: 4 }}>
        Ordering coming soon. Restaurant ID: <code>{restaurant.id}</code>
      </p>
    </main>
  );
}

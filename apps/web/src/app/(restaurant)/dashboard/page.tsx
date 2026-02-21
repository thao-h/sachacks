import { prisma } from "@/server/db";

export default async function RestaurantDashboardPage() {
  // TODO: Get restaurant from session
  const orders = await prisma.order.findMany({
    include: { items: true, restaurant: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem" }}>
      <a href="/" style={{ color: "#666", fontSize: "0.9rem" }}>&larr; Back</a>
      <h1 style={{ marginTop: "1rem" }}>Restaurant Dashboard</h1>
      <p style={{ color: "#666" }}>Manage incoming orders</p>

      {orders.length === 0 ? (
        <p style={{ marginTop: "2rem", color: "#999" }}>No orders yet.</p>
      ) : (
        <table style={{ width: "100%", marginTop: "2rem", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #eee", textAlign: "left" }}>
              <th style={{ padding: "0.5rem" }}>Order ID</th>
              <th style={{ padding: "0.5rem" }}>Customer</th>
              <th style={{ padding: "0.5rem" }}>Items</th>
              <th style={{ padding: "0.5rem" }}>Status</th>
              <th style={{ padding: "0.5rem" }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                <td style={{ padding: "0.5rem", fontFamily: "monospace", fontSize: "0.85rem" }}>{order.id.slice(0, 8)}</td>
                <td style={{ padding: "0.5rem" }}>{order.customerName}</td>
                <td style={{ padding: "0.5rem" }}>{order.items.length} items</td>
                <td style={{ padding: "0.5rem" }}>
                  <span style={{ padding: "0.2rem 0.5rem", borderRadius: 4, background: "#f0f0f0", fontSize: "0.85rem" }}>
                    {order.status}
                  </span>
                </td>
                <td style={{ padding: "0.5rem", fontSize: "0.85rem", color: "#666" }}>
                  {order.createdAt.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

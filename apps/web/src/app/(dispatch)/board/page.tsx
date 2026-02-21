import { prisma } from "@/server/db";

export default async function DispatchBoardPage() {
  const readyOrders = await prisma.order.findMany({
    where: { status: "READY_FOR_PICKUP" },
    include: { restaurant: true, dispatch: { include: { driver: true } } },
    orderBy: { createdAt: "asc" },
  });

  const activeAssignments = await prisma.dispatchAssignment.findMany({
    where: { status: { in: ["ASSIGNED", "PICKED_UP"] } },
    include: { order: { include: { restaurant: true } }, driver: true },
    orderBy: { createdAt: "desc" },
  });

  const drivers = await prisma.driver.findMany({ where: { isActive: true } });

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem" }}>
      <a href="/" style={{ color: "#666", fontSize: "0.9rem" }}>&larr; Back</a>
      <h1 style={{ marginTop: "1rem" }}>Dispatch Board</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "2rem" }}>
        <section>
          <h2>Ready for Pickup ({readyOrders.length})</h2>
          {readyOrders.length === 0 ? (
            <p style={{ color: "#999", marginTop: "1rem" }}>No orders ready for pickup.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
              {readyOrders.map((order) => (
                <li key={order.id} style={{ padding: "1rem", border: "1px solid #eee", borderRadius: 4, marginBottom: "0.5rem" }}>
                  <strong>{order.restaurant.name}</strong>
                  <p style={{ fontSize: "0.85rem", color: "#666" }}>
                    Order {order.id.slice(0, 8)} &middot; {order.customerName}
                  </p>
                  {/* TODO: Add assign driver button */}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2>Active Deliveries ({activeAssignments.length})</h2>
          {activeAssignments.length === 0 ? (
            <p style={{ color: "#999", marginTop: "1rem" }}>No active deliveries.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
              {activeAssignments.map((a) => (
                <li key={a.id} style={{ padding: "1rem", border: "1px solid #eee", borderRadius: 4, marginBottom: "0.5rem" }}>
                  <strong>{a.driver.name}</strong> &rarr; {a.order.restaurant.name}
                  <p style={{ fontSize: "0.85rem", color: "#666" }}>
                    Status: {a.status} &middot; Order {a.order.id.slice(0, 8)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section style={{ marginTop: "2rem" }}>
        <h2>Available Drivers ({drivers.length})</h2>
        <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {drivers.map((driver) => (
            <li key={driver.id} style={{ padding: "0.5rem 1rem", border: "1px solid #eee", borderRadius: 4 }}>
              {driver.name}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

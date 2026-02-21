export default function HomePage() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
      <h1>DDBA Local Delivery OS</h1>
      <p>Local delivery operations platform for restaurants.</p>
      <nav style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
        <a href="/r/marios-pizza" style={{ padding: "0.5rem 1rem", border: "1px solid #ccc", borderRadius: 4 }}>
          Customer: Browse Menu
        </a>
        <a href="/dashboard" style={{ padding: "0.5rem 1rem", border: "1px solid #ccc", borderRadius: 4 }}>
          Restaurant Dashboard
        </a>
        <a href="/board" style={{ padding: "0.5rem 1rem", border: "1px solid #ccc", borderRadius: 4 }}>
          Dispatch Board
        </a>
      </nav>
    </main>
  );
}

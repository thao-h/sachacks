export default async function DemoOrdersPage() {
  let data: unknown = null;
  let error: string | null = null;

  try {
    const res = await fetch("http://localhost:4000/api/v1/orders", {
      cache: "no-store",
    });
    data = await res.json();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to fetch";
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>Demo: Orders API</h1>
      <p>
        Fetches from <code>http://localhost:4000/api/v1/orders</code>
      </p>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <p>
        <a href="/">&larr; Back to home</a>
      </p>
    </main>
  );
}

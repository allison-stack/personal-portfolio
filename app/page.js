import Link from "next/link";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <p>
        playground under construction — <Link className="ul" href="/about">about me</Link>
      </p>
    </main>
  );
}

import Link from "next/link";
import { FishCanvas } from "./components/FishCanvas";

export default function Home() {
  return (
    <>
      <FishCanvas />
      <div className="pg">
        <div className="grain" />
        <main className="pg-col">
          <section className="pg-card">
            <h1 className="title">
              hi, i&apos;m <span className="nm">allison</span>.
            </h1>
            <p className="p">
              i collect fun facts. the fish are scared of your mouse.
            </p>
            <p className="p pg-links">
              <Link className="ul" href="/about">about me</Link> ·{" "}
              <a className="ul" href="/Allison-Zhao-Resume.pdf">resume</a>
            </p>
          </section>

          {/* combiner section arrives in Task 7 */}

          <footer className="pg-card pg-foot">
            <p className="p">
              thanks for playing <span className="star">✦</span> ·{" "}
              <Link className="ul" href="/about">who made this? → about me</Link>
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}

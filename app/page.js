import Link from "next/link";
import { FishCanvas } from "./components/FishCanvas";
import { Combiner } from "./components/Combiner";

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

          <section className="pg-card">
            <h2 className="sh">the fact lab</h2>
            <p className="p">
              combine two elements. every discovery comes with a real fun fact
              — there&apos;s a lot to find.
            </p>
            <Combiner />
          </section>

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

import Link from "next/link";
import { PondTheme } from "./components/PondTheme";
import { Combiner } from "./components/Combiner";
import { scraps } from "./content/scraps";

function Scrap({ text, fact, side }) {
  return (
    <div className={`scrap scrap-${side}`}>
      <span className="scrap-tape" aria-hidden="true" />
      <p className="scrap-text">{text}</p>
      {fact && <p className="scrap-fact">{fact}</p>}
    </div>
  );
}

export default function Home() {
  return (
    <PondTheme>
      <div className="pg">
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

          <div className="pg-gap">
            <div className="glass-sign">🐟 do not tap the glass</div>
            {scraps.slice(0, 3).map((s) => (
              <Scrap key={s.id} {...s} />
            ))}
          </div>

          <section className="pg-card">
            <h2 className="sh">the fact lab</h2>
            <p className="p">
              combine two elements. every discovery comes with a real fun fact
              — there&apos;s a lot to find.
            </p>
            <Combiner />
          </section>

          <div className="pg-gap">
            {scraps.slice(3).map((s) => (
              <Scrap key={s.id} {...s} />
            ))}
          </div>

          <footer className="pg-card pg-foot">
            <p className="p">
              thanks for playing <span className="star">✦</span> ·{" "}
              <Link className="ul" href="/about">who made this? → about me</Link>
            </p>
          </footer>

          <p className="koi-note">
            one of the 120 fish is gold. finding it is good luck.
          </p>
        </main>
      </div>
    </PondTheme>
  );
}

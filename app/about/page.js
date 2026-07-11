import { Clock } from "../components/Clock";
import { NowPlaying } from "../components/NowPlaying";

export const metadata = {
  title: "about · allison zhao",
};

export default function About() {
  return (
    <div className="page" style={{ minHeight: "100vh", width: "100%", display: "flex", justifyContent: "center", padding: "88px 24px 64px", position: "relative" }}>
      <div className="grain" />
      <div style={{ width: "100%", maxWidth: 620, position: "relative", zIndex: 1 }}>

        {/* hero */}
        <div className="head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 34 }}>
          <div>
            <div className="pill">
              <span className="dot" />
              currently · incoming @ aws
            </div>
            <h1 className="title">
              hi, i&rsquo;m <span className="nm">allison</span>.
            </h1>
            <p className="lede">
              a software engineer based in Toronto. i spend most of my time thinking about databases and distributed systems, making sure things work and keep working. here&apos;s my{" "}
              <a className="ul" href="/Allison-Zhao-Resume.pdf">
                resume
              </a>
              .
            </p>
            <div className="now">
              <span className="now-dot" />
              <Clock /> in Toronto · <NowPlaying />
            </div>
            <p className="p" style={{ marginTop: 10 }}>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a className="ul" href="/">→ come play</a>
            </p>
          </div>

          <div className="photo-wrap">
            <div className="photo">
              <div className="tape" />
              <div className="photo-img">
                <img src="/profile-photo.jpg" alt="me!" />
              </div>
              <div className="photo-cap">that&apos;s me!</div>
            </div>
            <div className="stamp">
              <b>TORONTO</b>
              <i>✦ ca ✦</i>
            </div>
          </div>
        </div>

        {/* chips */}
        <div className="chips">
          {["databases", "distributed systems", "software architecture", "optimization", "CI/CD", "creative thinking"].map((c) => (
            <span key={c} className="chip">{c}</span>
          ))}
        </div>

        {/* about */}
        <div className="sec">
          <h2 className="sh">about</h2>
          <p className="p">
            i&apos;ve been getting into talking to people about what&apos;s annoying them and then building something to fix it. at huawei i did that: i kept noticing teammates doing the same tedious stuff over and over, so i talked to them about what was slowing them down and wrote custom claude skills that actually got adopted. turns out the best tools come from just listening.
          </p>
          <p className="p">
             a lot of my work lives behind the scenes: distributed systems, CI/CD pipelines, the kind of stuff you only notice when it breaks. i&apos;m into databases, reliability, and figuring out why things break before they do. things move fast in this space and i like keeping up.
          </p>
          <p className="p">
            hobbies: rock climbing, badminton, ping pong, eating, touching grass, learning how to make the most use of my claude code tokens
          </p>
        </div>

        {/* experience */}
        <div className="sec">
          <div className="sh-row">
            <h2 className="sh">experience</h2>
            <span className="aside">↳ the fun part</span>
          </div>
          <ExperienceRow
            letter="A"
            company="AWS"
            role="incoming sde intern · aurora open source engines team"
            time="fall 2026"
            href="https://aws.amazon.com"
          />
          <ExperienceRow
            letter="H"
            company="Huawei"
            role="devops intern · distributed scheduling and data engine team"
            time="May 2025 - Present"
            href="https://www.huawei.com/en"
          />
          <ExperienceRow
            letter="M"
            company="McMaster University"
            role="undergraduate research assistant · simulators and quantum algorithms"
            time="May 2024 - August 2024"
            href="https://www.eng.mcmaster.ca/cas"
          />
        </div>

        {/* extracurriculars */}
        <div className="sec">
          <div className="sh-row">
            <h2 className="sh">extracurriculars</h2>
            <span className="aside">↳ my favourite people</span>
          </div>
          <ExperienceRow
            letter="D"
            company="DeltaHacks"
            role="tech team exec · prev. vp logistics"
            time=""
            href="https://www.deltahacks.com"
          />
          <ExperienceRow
            letter="S"
            company="McMaster Start Coding"
            role="mentor · teaching kids from local schools to code"
            time=""
            href="https://www.instagram.com/macstartcoding"
          />
        </div>

        {/* projects */}
        <div className="sec">
          <h2 className="sh">projects</h2>
          <ProjectRow
            name="ForgeLab"
            href="https://github.com/allison-stack/ForgeLab"
            desc="— a local-first multi-agent software engineering team powered by LangGraph and Ollama"
          />
          <ProjectRow
            name="leet-buddy"
            href="https://github.com/allison-stack/leet-buddy"
            desc="— a little helper for your leetcode practice"
          />
          <ProjectRow
            name="custom opencode skills"
            href=""
            desc="— skills that automate certain tasks part of Huawei&apos;s distributed scheduling and data engine team"
          />
        </div>

        {/* say hi */}
        <div className="sec">
          <h2 className="sh">say hi</h2>
          <div className="cont">
            <p className="p">
              the easiest way to reach me is{" "}
              <a className="ul" href="mailto:allisonzhao.uni@gmail.com">
                allisonzhao.uni@gmail.com
              </a>
              . i&rsquo;m also around on{" "}
              <a className="ul" href="https://www.linkedin.com/in/allisonzzhao/">
                LinkedIn
              </a>
              {" "}
              and{" "}
              <a className="ul" href="https://github.com/allison-stack">
                GitHub
              </a>
              {" "}
              — always down to chat about infra, databases, or whatever
              you&rsquo;re building.
            </p>
            <div className="links-row">
              <a className="ico" href="mailto:allisonzhao.uni@gmail.com" aria-label="Email">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 19, height: 19 }}>
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </a>
              <a className="ico" href="https://github.com/allison-stack" aria-label="GitHub">
                <svg viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </a>
              <a className="ico" href="https://www.linkedin.com/in/allisonzzhao/" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                </svg>
              </a>
              <a className="ico" href="/Allison-Zhao-Resume.pdf" aria-label="Resume">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 19, height: 19 }}>
                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                  <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                  <path d="M10 13H8" />
                  <path d="M16 17H8" />
                  <path d="M16 13h-2" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* notes */}
        <div className="sec">
          <h2 className="sh">notes</h2>
          <p className="desk-sub">
            a few things i&rsquo;m writing &amp; figuring out — hover the folder
            to peek.
          </p>
          <div className="folder-stage">
            <div className="folder">
              <div className="folder-tab" />
              <div className="folder-back" />
              <a className="note n1" href="#">
                <div className="note-title">why i like databases</div>
                <div className="note-meta">draft</div>
                <div className="note-body" />
              </a>
              <a className="note n2" href="#">
                <div className="note-title">infra that actually holds up</div>
                <div className="note-meta">note</div>
                <div className="note-body" />
              </a>
              <a className="note n3" href="#">
                <div className="note-title">still figuring it out</div>
                <div className="note-meta">journal</div>
                <div className="note-body" />
              </a>
              <div className="folder-front">
                <span className="folder-label">notes</span>
                <span className="folder-hint">hover ✦</span>
              </div>
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="foot">
          <div>
            <div className="foot-txt">
              thanks for stopping by <span className="star">✦</span>
              <br />
              built in Toronto
            </div>
            <div className="foot-ps">p.s. glad you made it this far :)</div>
          </div>
          <div className="sig">Allison</div>
        </div>
      </div>
    </div>
  );
}

function ExperienceRow({ letter, company, role, time, href }) {
  return (
    <div className="xrow">
      <div className="mono-chip">{letter}</div>
      <div className="xmid">
        <div className="xco">
          {href ? (
            <a className="ul" href={href} target="_blank" rel="noopener noreferrer">{company}</a>
          ) : (
            company
          )}
        </div>
        <div className="xrole">{role}</div>
      </div>
      <div className="xright">{time}</div>
    </div>
  );
}

function ProjectRow({ name, href, desc }) {
  return (
    <div className="prow">
      <span className="p-name">
        {href ? (
          <a className="ul" href={href}>{name}</a>
        ) : (
          name
        )}
      </span>
      <span className="p-desc">{desc}</span>
    </div>
  );
}

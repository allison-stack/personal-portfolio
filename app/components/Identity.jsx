import { bio } from "../content/bio";

export function Identity() {
  return (
    <section className="px-1 pt-5 pb-4 sm:pt-7 sm:pb-5">
      <div className="kicker mb-2">identity · v2026</div>
      <h1 className="serif text-4xl sm:text-5xl strong leading-[1.02] tracking-tight">
        <span className="muted">~/</span> <span className="accent">{bio.name.toLowerCase()}</span>
      </h1>
      <p className="muted mt-2 italic">
        <span className="accent">//</span> {bio.role}
      </p>
    </section>
  );
}

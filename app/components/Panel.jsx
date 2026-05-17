export function Panel({ title, hint, status, children, className = "" }) {
  return (
    <section className={`border hairline ${className}`}>
      <div className="flex items-baseline justify-between border-b dashline px-3 py-1.5">
        <span className="kicker flex items-center gap-2">
          {status === "live" && <span className="ok">●</span>}
          {status === "cached" && <span className="muted">●</span>}
          {title}
        </span>
        {hint ? <span className="label">{hint}</span> : null}
      </div>
      <div className="p-3 text-[13px]">{children}</div>
    </section>
  );
}

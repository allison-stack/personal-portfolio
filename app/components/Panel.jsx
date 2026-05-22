export function Panel({ title, hint, status, children, className = "", index = 0 }) {
  const delay = `${index * 60}ms`;
  return (
    <section
      className={`border hairline fade-in ${className}`}
      style={{ "--delay": delay }}
    >
      <div className="flex items-baseline justify-between border-b dashline px-3 py-1.5">
        <span className="kicker flex items-center gap-2">
          {status === "live" && <span className="ok dot-live">●</span>}
          {status === "cached" && <span className="muted">●</span>}
          {title}
        </span>
        {hint ? <span className="label">{hint}</span> : null}
      </div>
      <div className="p-3 text-[13px]">{children}</div>
    </section>
  );
}

export function Panel({ title, hint, children, className = "" }) {
  return (
    <section className={`border hairline ${className}`}>
      <div className="flex items-baseline justify-between border-b hairline px-3 py-1.5 text-[12px]">
        <span className="muted">
          <span className="accent">▸</span> {title}
        </span>
        {hint ? <span className="muted">{hint}</span> : null}
      </div>
      <div className="p-3 text-[13px]">{children}</div>
    </section>
  );
}

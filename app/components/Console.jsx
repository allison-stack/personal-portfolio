export function Console({ children }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}

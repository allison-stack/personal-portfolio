export function Console({ children }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <div className="flex-1 flex flex-col pb-24 sm:pb-28">{children}</div>
    </div>
  );
}

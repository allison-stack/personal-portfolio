import { links } from "../content/links";
import { bio } from "../content/bio";
import { Clock } from "./Clock";

export function TopBar() {
  return (
    <header className="border-b hairline px-4 sm:px-6 py-3 flex items-center justify-between gap-4 text-[13px]">
      <div className="flex items-center gap-3 min-w-0">
        <span className="strong whitespace-nowrap">
          allison<span className="muted">@</span>portfolio
        </span>
        <span className="muted hidden sm:inline">·</span>
        <span className="muted truncate hidden sm:inline">{bio.role}</span>
      </div>
      <div className="flex items-center gap-3 whitespace-nowrap">
        <span className="muted hidden md:inline">{links.location}</span>
        <span className="muted hidden md:inline">·</span>
        <Clock />
      </div>
    </header>
  );
}

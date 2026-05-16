import { Panel } from "../Panel";
import { now } from "../../content/now";

export function NowPanel() {
  return (
    <Panel title="now" hint="manually curated">
      <dl className="space-y-1.5">
        <div className="flex gap-3">
          <dt className="muted w-16 shrink-0">track</dt>
          <dd className="strong truncate">{now.track}</dd>
        </div>
        <div className="flex gap-3">
          <dt className="muted w-16 shrink-0">reading</dt>
          <dd className="strong truncate">{now.reading}</dd>
        </div>
      </dl>
    </Panel>
  );
}

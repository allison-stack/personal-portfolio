import { Panel } from "../Panel";
import { leetcode } from "../../content/leetcode";

export function LeetcodePanel() {
  return (
    <Panel title="leetcode" hint={<a className="hover:accent" href={leetcode.profile} target="_blank" rel="noreferrer">profile ↗</a>}>
      <dl className="grid grid-cols-2 gap-y-1.5 gap-x-3">
        <dt className="muted">solved</dt>
        <dd className="strong tabular-nums">{leetcode.solved}</dd>
        <dt className="muted">this week</dt>
        <dd className="ok tabular-nums">+{leetcode.weekDelta}</dd>
        <dt className="muted">streak</dt>
        <dd className="strong tabular-nums">{leetcode.streak}d</dd>
        <dt className="muted">favorite</dt>
        <dd className="strong truncate">{leetcode.fav}</dd>
      </dl>
    </Panel>
  );
}

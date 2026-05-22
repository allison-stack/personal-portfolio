// Tab completion: command names on the first token; virtual-fs paths for
// commands that take a path argument.

import { COMMAND_NAMES } from "./shell";
import { lookup, resolve, list } from "../content/files";
import { SLASH_COMMANDS } from "./commands";

const PATH_COMMANDS = new Set(["cd", "cat", "read", "tree", "grep", "find", "tail", "open", "ls"]);

export function complete(input, cwd) {
  // Slash menu — already handled by the existing AskBar logic, but mirror
  // it here for consistency so callers can use one entry point.
  if (input.startsWith("/")) {
    const matches = SLASH_COMMANDS
      .filter((c) => c.cmd.startsWith(input))
      .map((c) => ({ value: c.cmd, label: c.cmd, desc: c.desc }));
    return { candidates: matches, kind: "command" };
  }

  const tokens = input.split(/\s+/);
  if (tokens.length === 1) {
    const partial = tokens[0].toLowerCase();
    const matches = COMMAND_NAMES
      .filter((c) => c.startsWith(partial))
      .map((c) => ({ value: c, label: c, desc: "" }));
    return { candidates: matches, kind: "command" };
  }

  const head = tokens[0].toLowerCase();
  if (!PATH_COMMANDS.has(head)) return { candidates: [], kind: "none" };

  const partial = tokens[tokens.length - 1];

  // Resolve directory to search and the leaf prefix to filter on.
  let dirPath, prefix;
  if (partial.includes("/")) {
    const lastSlash = partial.lastIndexOf("/");
    const dirPart = partial.slice(0, lastSlash) || "/";
    prefix = partial.slice(lastSlash + 1);
    dirPath = resolve(dirPart, cwd);
  } else {
    dirPath = cwd;
    prefix = partial;
  }

  const entries = list(dirPath);
  if (!entries) return { candidates: [], kind: "path" };

  const matches = entries
    .filter((e) => e.name.startsWith(prefix))
    .map((e) => {
      // Build the full replacement value: keep the dir part, append the
      // matched leaf (with trailing "/" for dirs).
      const base = partial.includes("/") ? partial.slice(0, partial.lastIndexOf("/") + 1) : "";
      const suffix = e.isDir ? "/" : "";
      return { value: base + e.name + suffix, label: e.name + suffix, desc: e.kind, isDir: e.isDir };
    });

  return { candidates: matches, kind: "path" };
}

// Apply a candidate to the current input by replacing the last token.
export function apply(input, candidate) {
  const tokens = input.split(/\s+/);
  if (input.startsWith("/") && tokens.length === 1) return candidate.value + " ";
  tokens[tokens.length - 1] = candidate.value;
  return tokens.join(" ") + (candidate.isDir ? "" : " ");
}

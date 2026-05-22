// REPL shell. parse() turns a raw line into {cmd, args, flags}; execute()
// runs it against the virtual fs and returns a structured result the chat
// component knows how to render.

import { fsRoot, resolve, lookup, list, read, walk, pretty } from "../content/files";
import { bio } from "../content/bio";
import { day } from "../content/day";
import { links } from "../content/links";

const COMMANDS = {
  ls:      "list a directory",
  cd:      "change directory",
  pwd:     "print working directory",
  cat:     "print a file",
  read:    "alias for cat",
  tree:    "recursive directory listing",
  grep:    "search file contents",
  find:    "find by filename",
  whoami:  "one-paragraph bio",
  top:     "process-style activity view",
  uptime:  "session uptime",
  date:    "current local time",
  tail:    "last lines of a file; -f to keep watching",
  open:    "open a url or external file",
  man:     "manpage for a command",
  history: "command history",
  clear:   "clear the transcript",
  help:    "list commands",
  echo:    "echo arguments",
  exit:    "exit the shell (not really)",
};

export const COMMAND_NAMES = Object.keys(COMMANDS);

const ALIASES = {
  "/help":     ["help"],
  "/whoami":   ["whoami"],
  "/now":      ["cat", "/now/playing"],
  "/projects": ["ls", "/projects"],
  "/links":    ["cat", "/links/email"],
  "/resume":   ["open", "/work/resume.pdf"],
  "/clear":    ["clear"],
};

export function parse(input) {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (ALIASES[trimmed]) {
    const [cmd, ...args] = ALIASES[trimmed];
    return { cmd, args, flags: [], raw: trimmed };
  }

  const tokens = trimmed.split(/\s+/);
  const cmd = tokens[0].toLowerCase();
  const rest = tokens.slice(1);
  const flags = rest.filter((t) => t.startsWith("-"));
  const args = rest.filter((t) => !t.startsWith("-"));
  return { cmd, args, flags, raw: trimmed };
}

function fmtList(entries, longForm) {
  if (!longForm) {
    return entries.map((e) => (e.isDir ? `${e.name}/` : e.name)).join("  ");
  }
  const w = Math.max(...entries.map((e) => e.name.length));
  return entries
    .map((e) => {
      const kind = e.kind.padEnd(4);
      const name = e.isDir ? `${e.name}/` : e.name;
      return `${kind}  ${name.padEnd(w + 1)}`;
    })
    .join("\n");
}

function treeStr(rootPath) {
  const node = lookup(rootPath);
  if (!node || node.kind !== "dir") return null;
  const lines = [pretty(rootPath)];
  const recur = (n, prefix) => {
    const entries = Object.entries(n.children);
    entries.forEach(([name, child], i) => {
      const last = i === entries.length - 1;
      const branch = last ? "└── " : "├── ";
      const cont = last ? "    " : "│   ";
      lines.push(`${prefix}${branch}${child.kind === "dir" ? `${name}/` : name}`);
      if (child.kind === "dir") recur(child, prefix + cont);
    });
  };
  recur(node, "");
  return lines.join("\n");
}

async function grepFiles(pattern, rootPath) {
  const re = new RegExp(pattern, "i");
  const hits = [];
  for (const node of walk(rootPath)) {
    if (node.isDir) continue;
    const content = await read(node.path);
    if (typeof content !== "string") continue;
    const lines = content.split("\n");
    lines.forEach((line, i) => {
      if (re.test(line)) hits.push(`${pretty(node.path)}:${i + 1}: ${line.trim()}`);
    });
  }
  return hits.length ? hits.join("\n") : "(no matches)";
}

function findFiles(name, rootPath) {
  const re = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const hits = walk(rootPath).filter((n) => re.test(n.name));
  return hits.length ? hits.map((n) => pretty(n.path)).join("\n") : "(no matches)";
}

function currentBlock() {
  const tzNow = new Date().toLocaleTimeString("en-CA", {
    timeZone: links.timezone,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
  let cur = day[0];
  for (const b of day) if (b.start <= tzNow) cur = b;
  return cur;
}

function topStr() {
  const cur = currentBlock();
  const head = "PID    USER     STAT  CPU%  COMMAND";
  const procs = [
    `2842   allison  R     12.4  ${cur.label.replace(/\s+/g, "-")}`,
    `2851   allison  S      3.2  leetcode-streak`,
    `2867   allison  S      1.8  github-watcher`,
    `2901   allison  S      0.4  spotify-listener`,
    `2942   allison  S      0.1  day-timeline-ticker`,
  ];
  return [head, ...procs].join("\n");
}

function manPage(cmd) {
  if (!cmd) return "usage: man <command>";
  if (!COMMANDS[cmd]) return `no manual entry for ${cmd}`;
  return `${cmd.toUpperCase()}(1)\n\nNAME\n  ${cmd} — ${COMMANDS[cmd]}\n\nSYNOPSIS\n  ${synopsis(cmd)}\n`;
}

function synopsis(cmd) {
  switch (cmd) {
    case "ls":    return "ls [-la] [path]";
    case "cd":    return "cd <path>   (or `cd -` to toggle last cwd)";
    case "cat":   return "cat <file>";
    case "read":  return "read <file>";
    case "tree":  return "tree [path]";
    case "grep":  return "grep <pattern> [path]";
    case "find":  return "find <name> [path]";
    case "tail":  return "tail [-f] <file>";
    case "open":  return "open <url|file>";
    case "echo":  return "echo <text>";
    case "man":   return "man <command>";
    default:      return cmd;
  }
}

function helpStr() {
  const groups = {
    "filesystem":   ["ls", "cd", "pwd", "cat", "read", "tree", "grep", "find"],
    "live data":    ["top", "uptime", "date", "tail"],
    "identity":     ["whoami"],
    "session":      ["history", "clear", "help", "man", "echo", "open", "exit"],
  };
  const lines = ["available commands:", ""];
  for (const [group, cmds] of Object.entries(groups)) {
    lines.push(`  ${group}`);
    for (const c of cmds) lines.push(`    ${c.padEnd(9)} ${COMMANDS[c]}`);
    lines.push("");
  }
  lines.push("or just ask a question — natural language is sent to retrieval ama.");
  return lines.join("\n");
}

function suggest(unknown) {
  const all = COMMAND_NAMES;
  let best = null;
  let bestScore = 0;
  for (const c of all) {
    let s = 0;
    const m = Math.min(c.length, unknown.length);
    for (let i = 0; i < m; i++) if (c[i] === unknown[i]) s++;
    if (s > bestScore) { bestScore = s; best = c; }
  }
  return bestScore >= 2 ? best : null;
}

// Returns one of:
//   { kind: "tool",   name, args, body, ok }
//   { kind: "cd",     newCwd, body? }
//   { kind: "clear" }
//   { kind: "open",   href }
//   { kind: "passthrough" }   // route to /api/ama
export async function execute({ cmd, args, flags, raw }, cwd) {
  switch (cmd) {
    case "help":
      return { kind: "tool", name: "help", args: [], body: helpStr(), ok: true };

    case "pwd":
      return { kind: "tool", name: "pwd", args: [], body: pretty(cwd), ok: true };

    case "ls": {
      const target = args[0] ? resolve(args[0], cwd) : cwd;
      const entries = list(target);
      if (!entries) return { kind: "tool", name: "ls", args, body: `ls: ${args[0] ?? cwd}: not a directory`, ok: false };
      const longForm = flags.includes("-la") || flags.includes("-l");
      return { kind: "tool", name: "ls", args: [pretty(target)], body: fmtList(entries, longForm), ok: true };
    }

    case "cd": {
      const target = args[0] ? resolve(args[0], cwd) : "/";
      if (args[0] === "-") {
        return { kind: "cd", newCwd: "__toggle__" };
      }
      const node = lookup(target);
      if (!node) return { kind: "tool", name: "cd", args, body: `cd: ${args[0]}: no such file or directory`, ok: false };
      if (node.kind !== "dir") return { kind: "tool", name: "cd", args, body: `cd: ${args[0]}: not a directory`, ok: false };
      return { kind: "cd", newCwd: target };
    }

    case "cat":
    case "read": {
      if (!args[0]) return { kind: "tool", name: cmd, args, body: `${cmd}: missing operand`, ok: false };
      const target = resolve(args[0], cwd);
      const node = lookup(target);
      if (!node) return { kind: "tool", name: "Read", args: [pretty(target)], body: `${cmd}: ${args[0]}: no such file`, ok: false };
      if (node.kind === "dir") return { kind: "tool", name: "Read", args: [pretty(target)], body: `${cmd}: ${args[0]}: is a directory`, ok: false };
      const content = await read(target);
      return { kind: "tool", name: "Read", args: [pretty(target)], body: content ?? "", ok: true };
    }

    case "tree": {
      const target = args[0] ? resolve(args[0], cwd) : cwd;
      const body = treeStr(target);
      if (!body) return { kind: "tool", name: "tree", args, body: `tree: ${args[0] ?? cwd}: not a directory`, ok: false };
      return { kind: "tool", name: "tree", args: [pretty(target)], body, ok: true };
    }

    case "grep": {
      if (!args[0]) return { kind: "tool", name: "grep", args, body: "grep: missing pattern", ok: false };
      const target = args[1] ? resolve(args[1], cwd) : "/";
      const body = await grepFiles(args[0], target);
      return { kind: "tool", name: "Grep", args: [args[0], pretty(target)], body, ok: true };
    }

    case "find": {
      if (!args[0]) return { kind: "tool", name: "find", args, body: "find: missing name", ok: false };
      const target = args[1] ? resolve(args[1], cwd) : "/";
      const body = findFiles(args[0], target);
      return { kind: "tool", name: "find", args: [args[0], pretty(target)], body, ok: true };
    }

    case "whoami":
      return { kind: "tool", name: "whoami", args: [], body: bio.whoami, ok: true };

    case "top":
      return { kind: "tool", name: "top", args: [], body: topStr(), ok: true };

    case "uptime": {
      const ms = Date.now() - (window.__sessionStart ?? Date.now());
      const s = Math.floor(ms / 1000);
      const m = Math.floor(s / 60);
      const h = Math.floor(m / 60);
      const body = `up ${h}h ${m % 60}m ${s % 60}s`;
      return { kind: "tool", name: "uptime", args: [], body, ok: true };
    }

    case "date": {
      const d = new Date();
      const local = d.toLocaleString();
      const allis = d.toLocaleString("en-CA", { timeZone: links.timezone });
      const body = `your local : ${local}\nallison @ ${links.timezone} : ${allis}`;
      return { kind: "tool", name: "date", args: [], body, ok: true };
    }

    case "tail": {
      const file = args[0] ?? "activity.log";
      const target = resolve(file, cwd);
      const node = lookup(target);
      if (!node) return { kind: "tool", name: "tail", args, body: `tail: ${file}: no such file`, ok: false };
      const content = await read(target);
      const lines = (content ?? "").split("\n").slice(-12).join("\n");
      const follow = flags.includes("-f");
      return {
        kind: "tool",
        name: follow ? "tail -f" : "tail",
        args: [pretty(target)],
        body: lines || "(empty)",
        ok: true,
        follow: follow ? target : null,
      };
    }

    case "open": {
      if (!args[0]) return { kind: "tool", name: "open", args, body: "open: missing target", ok: false };
      if (args[0].startsWith("http")) return { kind: "open", href: args[0] };
      const target = resolve(args[0], cwd);
      const node = lookup(target);
      if (!node) return { kind: "tool", name: "open", args, body: `open: ${args[0]}: no such file`, ok: false };
      if (node.kind === "url") return { kind: "open", href: node.href };
      if (node.kind === "file") return { kind: "open", href: target };
      return { kind: "tool", name: "open", args, body: `open: ${args[0]}: cannot open`, ok: false };
    }

    case "man":
      return { kind: "tool", name: "man", args, body: manPage(args[0]), ok: true };

    case "history":
      return { kind: "tool", name: "history", args: [], body: "__HISTORY__", ok: true };

    case "clear":
      return { kind: "clear" };

    case "echo":
      return { kind: "tool", name: "echo", args, body: args.join(" "), ok: true };

    case "exit":
      return { kind: "tool", name: "exit", args: [], body: "you can't exit a webpage by typing exit. but nice try.", ok: true };

    default: {
      if (raw.startsWith("/")) {
        return { kind: "tool", name: cmd, args, body: `unknown command: ${cmd}. try /help.`, ok: false };
      }
      const hint = suggest(cmd);
      if (hint) {
        return { kind: "tool", name: cmd, args, body: `command not found: ${cmd}. did you mean ${hint}?`, ok: false };
      }
      return { kind: "passthrough" };
    }
  }
}

// Slash-command descriptors used by the AskBar autocomplete menu and the
// completion engine. The actual execution path lives in lib/shell.js — these
// strings are matched verbatim by parse()'s ALIASES table.

export const SLASH_COMMANDS = [
  { cmd: "/help",     desc: "list available commands" },
  { cmd: "/whoami",   desc: "one-paragraph bio" },
  { cmd: "/now",      desc: "what i'm listening to" },
  { cmd: "/projects", desc: "list of projects" },
  { cmd: "/links",    desc: "email, github, linkedin" },
  { cmd: "/resume",   desc: "open the resume" },
  { cmd: "/clear",    desc: "clear the conversation" },
];

export function matchSlash(input) {
  const t = input.trim().toLowerCase();
  return SLASH_COMMANDS.filter((c) => c.cmd.startsWith(t));
}

import { bio, suggestedPrompts } from "../content/bio";
import { links } from "../content/links";
import { projects } from "../content/projects";
import { now } from "../content/now";

export const SLASH_COMMANDS = [
  { cmd: "/help",     desc: "list available commands" },
  { cmd: "/whoami",   desc: "one-paragraph bio" },
  { cmd: "/now",      desc: "what i'm listening to and reading" },
  { cmd: "/projects", desc: "list of projects" },
  { cmd: "/links",    desc: "email, github, linkedin" },
  { cmd: "/resume",   desc: "open the resume" },
  { cmd: "/clear",    desc: "clear the conversation" },
];

export function isSlash(input) {
  return input.trim().startsWith("/");
}

export function matchSlash(input) {
  const t = input.trim().toLowerCase();
  return SLASH_COMMANDS.filter((c) => c.cmd.startsWith(t));
}

export function runSlash(input) {
  const t = input.trim().toLowerCase();
  switch (t) {
    case "/help":
      return {
        kind: "block",
        text:
          "available commands:\n" +
          SLASH_COMMANDS.map((c) => `  ${c.cmd.padEnd(11)} ${c.desc}`).join("\n") +
          "\n\nor just ask a question — e.g. " +
          suggestedPrompts.map((p) => `"${p}"`).join(", "),
      };
    case "/whoami":
      return { kind: "block", text: bio.whoami };
    case "/now":
      return {
        kind: "block",
        text: `track   ${now.track}\nreading ${now.reading}`,
      };
    case "/projects":
      return {
        kind: "block",
        text: projects
          .map((p) => `${p.name.padEnd(22)} ${p.blurb}`)
          .join("\n"),
      };
    case "/links":
      return {
        kind: "block",
        text:
          `email    ${links.email}\n` +
          `github   https://github.com/${links.github}\n` +
          `linkedin ${links.linkedin}\n` +
          `resume   ${links.resume}`,
      };
    case "/resume":
      return { kind: "open", href: links.resume };
    case "/clear":
      return { kind: "clear" };
    default:
      return { kind: "block", text: `unknown command: ${t}. try /help.` };
  }
}

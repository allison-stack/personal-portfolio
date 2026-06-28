"use client";
import { useEffect, useRef, useState } from "react";
import { BootBanner } from "./BootBanner";
import { ToolBlock } from "./ToolBlock";
import { AskBar } from "./AskBar";
import { UserMessage, AssistantMessage, SystemMessage } from "./Message";
import { parse, execute } from "../../lib/shell";
import * as history from "../../lib/history";

let msgId = 0;
const nextId = () => `m${++msgId}`;

const SPARKLE_FRAMES = ["✻", "✦", "✧", "✦"];
function Spinner() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % SPARKLE_FRAMES.length), 140);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="fade-in flex items-baseline gap-2">
      <span className="accent" style={{ width: "1ch", display: "inline-block" }}>{SPARKLE_FRAMES[i]}</span>
      <span className="muted">Crafting… <span className="text-[11px]">(ctrl+c to interrupt)</span></span>
    </div>
  );
}

export function Chat() {
  const [messages, setMessages] = useState([]);
  const [pending, setPending] = useState(false);
  const [cwd, setCwd] = useState("/");
  const [prevCwd, setPrevCwd] = useState("/");
  const scrollRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  useEffect(() => {
    const onClear = () => setMessages([]);
    window.addEventListener("ama-clear", onClear);
    if (typeof window !== "undefined" && !window.__sessionStart) window.__sessionStart = Date.now();
    return () => window.removeEventListener("ama-clear", onClear);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("portfolio-cwd", { detail: cwd }));
    }
  }, [cwd]);

  async function ask(rawInput) {
    // Bang-expand history references first.
    let input = rawInput;
    const expanded = history.expandBang(input);
    if (expanded) input = expanded;

    const echoId = nextId();
    setMessages((m) => [...m, { id: echoId, role: "user", text: input, cwd }]);

    const parsed = parse(input);
    if (!parsed) return;

    const result = await execute(parsed, cwd);

    if (result.kind === "clear") {
      setMessages([]);
      return;
    }
    if (result.kind === "cd") {
      let next = result.newCwd;
      if (next === "__toggle__") next = prevCwd;
      setPrevCwd(cwd);
      setCwd(next);
      return;
    }
    if (result.kind === "open") {
      window.open(result.href, "_blank", "noopener,noreferrer");
      setMessages((m) => [...m, { id: nextId(), role: "system", text: `opened ${result.href}` }]);
      return;
    }
    if (result.kind === "tool") {
      let body = result.body;
      if (body === "__HISTORY__") body = history.format();
      setMessages((m) => [...m, { id: nextId(), role: "tool", name: result.name, args: result.args, body, ok: result.ok }]);
      return;
    }
    if (result.kind === "passthrough") {
      setPending(true);
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch("/api/ama", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ q: input }),
          signal: controller.signal,
        });
        if (res.status === 429) {
          setMessages((m) => [...m, { id: nextId(), role: "system", text: "rate limit hit — try again in a few minutes." }]);
          return;
        }
        const data = await res.json();
        if (data.answer) {
          setMessages((m) => [...m, { id: nextId(), role: "assistant", text: data.answer }]);
        } else {
          setMessages((m) => [
            ...m,
            { id: nextId(), role: "assistant", text: "i don't have a confident answer for that — try /help, or email allisonzhao.uni@gmail.com." },
          ]);
        }
      } catch (err) {
        if (err.name === "AbortError") {
          setMessages((m) => [...m, { id: nextId(), role: "system", text: "^C interrupted." }]);
        } else {
          setMessages((m) => [...m, { id: nextId(), role: "system", text: "network error — check connection and retry." }]);
        }
      } finally {
        setPending(false);
        abortRef.current = null;
      }
    }
  }

  function abort() {
    abortRef.current?.abort();
  }

  return (
    <section className="border hairline flex flex-col flex-1 min-h-[60dvh] lg:min-h-0">
      <div className="flex items-baseline justify-between border-b dashline px-3 py-1.5">
        <span className="kicker flex items-center gap-2">
          <span className="ok dot-live">●</span>
          ama · shell
        </span>
        <span className="label">retrieval · no llm</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        <BootBanner onPrompt={ask} />
        {messages.map((m) => (
          <div key={m.id} className="fade-in">
            {m.role === "user" ? (
              <UserMessage text={m.text} cwd={m.cwd} />
            ) : m.role === "system" ? (
              <SystemMessage text={m.text} />
            ) : m.role === "tool" ? (
              <ToolBlock name={m.name} args={m.args} body={m.body} ok={m.ok} />
            ) : (
              <AssistantMessage text={m.text} />
            )}
          </div>
        ))}
        {pending && <Spinner />}
      </div>
      <AskBar onSubmit={ask} onAbort={abort} disabled={false} pending={pending} cwd={cwd} />
    </section>
  );
}

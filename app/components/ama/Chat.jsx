"use client";
import { useEffect, useRef, useState } from "react";
import { Panel } from "../Panel";
import { Intro } from "./Intro";
import { AskBar } from "./AskBar";
import { UserMessage, AssistantMessage, SystemMessage } from "./Message";
import { isSlash, runSlash } from "../../lib/commands";

let msgId = 0;
const nextId = () => `m${++msgId}`;

export function Chat({ index = 0 }) {
  const [messages, setMessages] = useState([]);
  const [pending, setPending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  useEffect(() => {
    const onClear = () => setMessages([]);
    window.addEventListener("ama-clear", onClear);
    return () => window.removeEventListener("ama-clear", onClear);
  }, []);

  async function ask(text) {
    if (isSlash(text)) {
      const result = runSlash(text);
      if (result.kind === "clear") {
        setMessages([]);
        return;
      }
      if (result.kind === "open") {
        window.open(result.href, "_blank", "noopener,noreferrer");
        setMessages((m) => [
          ...m,
          { id: nextId(), role: "user", text },
          { id: nextId(), role: "system", text: `opened ${result.href}` },
        ]);
        return;
      }
      setMessages((m) => [
        ...m,
        { id: nextId(), role: "user", text },
        { id: nextId(), role: "assistant", text: result.text },
      ]);
      return;
    }

    const userMsg = { id: nextId(), role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setPending(true);
    try {
      const res = await fetch("/api/ama", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ q: text }),
      });
      if (res.status === 429) {
        setMessages((m) => [
          ...m,
          { id: nextId(), role: "system", text: "rate limit hit — try again in a few minutes." },
        ]);
        return;
      }
      const data = await res.json();
      if (data.answer) {
        setMessages((m) => [...m, { id: nextId(), role: "assistant", text: data.answer }]);
      } else {
        setMessages((m) => [
          ...m,
          {
            id: nextId(),
            role: "assistant",
            text:
              "i don't have a confident answer for that — try /help, or email allisonzhao.uni@gmail.com.",
          },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        { id: nextId(), role: "system", text: "network error — check connection and retry." },
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Panel title="ama" hint="retrieval · not an llm" className="flex-1 flex flex-col" index={index}>
        <div
          ref={scrollRef}
          className="space-y-4 max-h-[60dvh] sm:max-h-[55dvh] overflow-y-auto pr-1"
        >
          <Intro onPrompt={ask} />
          {messages.map((m) => (
            <div key={m.id} className="fade-in">
              {m.role === "user" ? (
                <UserMessage text={m.text} />
              ) : m.role === "system" ? (
                <SystemMessage text={m.text} />
              ) : (
                <AssistantMessage text={m.text} />
              )}
            </div>
          ))}
          {pending && <div className="muted caret fade-in">thinking</div>}
        </div>
      </Panel>
      <AskBar onSubmit={ask} disabled={pending} />
    </>
  );
}

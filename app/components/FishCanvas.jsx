"use client";

import { useEffect, useRef, useState } from "react";
import { createFish, stepSchool } from "../lib/boids";
import { fortuneForDate } from "../lib/fortune";

const COUNT = 120;
const GOLD_INDEX = 0; // the lucky one
const TAP_TTL_MS = 900;
const KOI_GLINT_MS = 2000;
const BUS_CROSS_MS = 8000;
const BUBBLE_EVERY_MS = [120000, 180000]; // 2–3 min
const NIGHT_PARAMS = { maxSpeed: 1.4, wander: 0.06 };

function torontoHour() {
  return Number(
    new Intl.DateTimeFormat("en-CA", {
      hour: "numeric",
      hour12: false,
      timeZone: "America/Toronto",
    }).format(new Date())
  );
}

function isNightHour(h) {
  return h >= 23 || h < 7;
}

export function FishCanvas() {
  const canvasRef = useRef(null);
  const [feeding, setFeeding] = useState(false);
  const [night, setNight] = useState(false);
  const modeRef = useRef("flee");

  useEffect(() => {
    modeRef.current = feeding ? "feed" : "flee";
  }, [feeding]);

  useEffect(() => {
    const check = () => setNight(isNightHour(torontoHour()));
    check();
    const id = setInterval(check, 60 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const nightRef = useRef(false);
  useEffect(() => {
    nightRef.current = night;
  }, [night]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -9999, y: -9999, active: false };
    const taps = []; // {x, y, until}
    const ripples = []; // {x, y, start}
    const bubbles = []; // {x, y, popped, popStart}
    const bus = { active: false, x: 0, y: 0, start: 0 };
    let koiGlintUntil = 0;
    let keyBuffer = "";
    let nextBubbleAt = Date.now() + BUBBLE_EVERY_MS[0] + Math.random() * (BUBBLE_EVERY_MS[1] - BUBBLE_EVERY_MS[0]);
    let W = 0;
    let H = 0;
    let raf = 0;

    const styles = getComputedStyle(document.documentElement);
    const inkColor = styles.getPropertyValue("--muted").trim() || "#928979";
    const koiColor = styles.getPropertyValue("--accent").trim() || "#a65f3c";
    const handFont = styles.getPropertyValue("--f-hand").trim() || "cursive";
    const goldColor = "#c9950c";

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const fish = createFish(COUNT, W, H);

    function currentPredators(now) {
      const list = [];
      if (mouse.active) list.push({ x: mouse.x, y: mouse.y, kind: modeRef.current });
      for (const t of taps) {
        if (t.until > now) list.push({ x: t.x, y: t.y, kind: "flee", strength: 1.5 });
      }
      return list;
    }

    function draw(now) {
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      const baseAlpha = nightRef.current ? 0.35 : 0.55;

      // koi glint halo (secret word: koi)
      if (now < koiGlintUntil) {
        const g = fish[GOLD_INDEX];
        ctx.globalAlpha = 0.5 * ((koiGlintUntil - now) / KOI_GLINT_MS);
        ctx.strokeStyle = goldColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(g.x, g.y, 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 2.2;
      }

      ctx.globalAlpha = baseAlpha;
      for (let i = 0; i < fish.length; i++) {
        const f = fish[i];
        const sp = Math.hypot(f.vx, f.vy) || 0.001;
        const ux = f.vx / sp;
        const uy = f.vy / sp;
        ctx.strokeStyle = i === GOLD_INDEX ? goldColor : i % 9 === 0 ? koiColor : inkColor;
        ctx.beginPath();
        ctx.moveTo(f.x + ux * 4, f.y + uy * 4);
        ctx.lineTo(f.x - ux * 4, f.y - uy * 4);
        ctx.stroke();
      }

      // ripples: two expanding rings fading over 700ms
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        const t = (now - r.start) / 700;
        if (t >= 1) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = inkColor;
        ctx.lineWidth = 1.2;
        for (const lag of [0, 0.25]) {
          const tt = t - lag;
          if (tt <= 0) continue;
          ctx.globalAlpha = 0.4 * (1 - tt);
          ctx.beginPath();
          ctx.arc(r.x, r.y, 8 + tt * 52, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.lineWidth = 2.2;
      }

      // fortune bubbles
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        if (!b.popped) {
          b.y -= 0.8;
          b.x += Math.sin(now / 300 + b.y / 20) * 0.3;
          ctx.globalAlpha = 0.5;
          ctx.strokeStyle = inkColor;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.lineWidth = 2.2;
          if (b.y < 70) {
            b.popped = true;
            b.popStart = now;
          }
        } else {
          const t = (now - b.popStart) / 4000;
          if (t >= 1) {
            bubbles.splice(i, 1);
            continue;
          }
          ctx.globalAlpha = t < 0.75 ? 0.8 : 0.8 * (1 - (t - 0.75) / 0.25);
          ctx.fillStyle = inkColor;
          ctx.font = `17px ${handFont}`;
          ctx.textAlign = "center";
          ctx.fillText(`today's luck: ${fortuneForDate(new Date().toISOString().slice(0, 10))}`, Math.min(Math.max(b.x, 110), W - 110), Math.max(b.y, 24));
        }
      }

      // the GO bus (secret word: bus)
      if (bus.active) {
        const t = (now - bus.start) / BUS_CROSS_MS;
        if (t >= 1) {
          bus.active = false;
        } else {
          bus.x = -50 + t * (W + 100);
          ctx.globalAlpha = 0.85;
          ctx.font = "22px system-ui";
          ctx.textAlign = "center";
          ctx.fillText("🚌", bus.x, bus.y);
        }
      }

      ctx.globalAlpha = 1;
    }

    function frame() {
      if (!document.hidden) {
        const now = Date.now();
        // prune expired taps so the array doesn't grow across a long visit
        for (let i = taps.length - 1; i >= 0; i--) {
          if (taps[i].until <= now) taps.splice(i, 1);
        }
        if (now >= nextBubbleAt && bubbles.length === 0) {
          const f = fish[Math.floor(Math.random() * fish.length)];
          bubbles.push({ x: f.x, y: f.y, popped: false, popStart: 0 });
          nextBubbleAt = now + BUBBLE_EVERY_MS[0] + Math.random() * (BUBBLE_EVERY_MS[1] - BUBBLE_EVERY_MS[0]);
        }
        stepSchool(fish, {
          w: W,
          h: H,
          predators: currentPredators(now),
          params: nightRef.current ? NIGHT_PARAMS : undefined,
        });
        draw(now);
      }
      raf = requestAnimationFrame(frame);
    }

    function onPointerMove(e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    }
    function onPointerGone() {
      mouse.active = false;
    }
    function onPointerDown(e) {
      onPointerMove(e);
      // taps on interactive things (chips, links, cards, the toggle) are not
      // water taps — only open water ripples
      if (e.target.closest("a, button, .pg-card, .scrap")) return;
      if (reduced) return;
      const now = Date.now();
      taps.push({ x: e.clientX, y: e.clientY, until: now + TAP_TTL_MS });
      ripples.push({ x: e.clientX, y: e.clientY, start: now });
    }
    function onKeyDown(e) {
      if (e.key.length !== 1) return;
      keyBuffer = (keyBuffer + e.key.toLowerCase()).slice(-8);
      if (keyBuffer.endsWith("koi")) koiGlintUntil = Date.now() + KOI_GLINT_MS;
      if (keyBuffer.endsWith("bus") && !bus.active) {
        bus.active = true;
        bus.start = Date.now();
        bus.y = 80 + Math.random() * (H - 160);
      }
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    document.documentElement.addEventListener("mouseleave", onPointerGone);
    function onResize() {
      resize();
      if (reduced) draw(Date.now());
    }
    window.addEventListener("resize", onResize);

    if (reduced) {
      // settle into a school, then hold a single static frame
      for (let i = 0; i < 240; i++) {
        stepSchool(fish, { w: W, h: H, predators: [] });
      }
      draw(Date.now());
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
      document.documentElement.removeEventListener("mouseleave", onPointerGone);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="fish-canvas" aria-hidden="true" />
      <button
        type="button"
        className="feed-toggle"
        aria-pressed={feeding}
        onClick={() => setFeeding((f) => !f)}
      >
        {feeding ? "🍞 feeding — they like you" : "🍞 feed the fish"}
      </button>
      {night && (
        <span className="night-note" aria-hidden="true">
          it&apos;s late in toronto — the fish are tired
        </span>
      )}
    </>
  );
}

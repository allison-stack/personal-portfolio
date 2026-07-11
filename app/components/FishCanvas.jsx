"use client";

import { useEffect, useRef, useState } from "react";
import { createFish, stepSchool } from "../lib/boids";

const COUNT = 120;

export function FishCanvas() {
  const canvasRef = useRef(null);
  const [feeding, setFeeding] = useState(false);
  const modeRef = useRef("flee");

  useEffect(() => {
    modeRef.current = feeding ? "feed" : "flee";
  }, [feeding]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const predator = { x: -9999, y: -9999, active: false };
    let W = 0;
    let H = 0;
    let raf = 0;

    const styles = getComputedStyle(document.documentElement);
    const inkColor = styles.getPropertyValue("--muted").trim() || "#928979";
    const koiColor = styles.getPropertyValue("--accent").trim() || "#a65f3c";

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const fish = createFish(COUNT, W, H);

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.globalAlpha = 0.55;
      for (let i = 0; i < fish.length; i++) {
        const f = fish[i];
        const sp = Math.hypot(f.vx, f.vy) || 0.001;
        const ux = f.vx / sp;
        const uy = f.vy / sp;
        ctx.strokeStyle = i % 9 === 0 ? koiColor : inkColor;
        ctx.beginPath();
        ctx.moveTo(f.x + ux * 4, f.y + uy * 4);
        ctx.lineTo(f.x - ux * 4, f.y - uy * 4);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    function frame() {
      if (!document.hidden) {
        stepSchool(fish, { w: W, h: H, predator, mode: modeRef.current });
        draw();
      }
      raf = requestAnimationFrame(frame);
    }

    function onPointerMove(e) {
      predator.x = e.clientX;
      predator.y = e.clientY;
      predator.active = true;
    }
    function onPointerGone() {
      predator.active = false;
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onPointerGone);
    function onResize() {
      resize();
      if (reduced) draw();
    }
    window.addEventListener("resize", onResize);

    if (reduced) {
      // settle into a school, then hold a single static frame
      for (let i = 0; i < 240; i++) {
        stepSchool(fish, { w: W, h: H, predator, mode: "flee" });
      }
      draw();
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerMove);
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
    </>
  );
}

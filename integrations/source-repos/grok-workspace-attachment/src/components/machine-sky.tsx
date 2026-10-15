import { useEffect, useRef } from "react";
import { ENGINE_LETTERS } from "@/lib/solvex/identity";

function hexAlpha(hex: string, a: number) {
  const h = hex.trim().replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  if (Number.isNaN(n)) return `rgba(243,240,232,${a})`;
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}

export function MachineSky() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const root = getComputedStyle(document.documentElement);
    const fg = root.getPropertyValue("--color-fg") || "#f3f0e8";
    const stamp = root.getPropertyValue("--color-stamp") || "#e24a3a";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let running = true;
    let last = 0;

    const shards = Array.from({ length: 16 }, (_, i) => ({
      a: (i / 16) * Math.PI * 2,
      r: 70 + (i % 5) * 42,
      s: 8 + (i % 4) * 5,
      spin: (i % 2 ? 1 : -1) * (0.00012 + (i % 7) * 0.00003),
      stamp: i % 6 === 0,
    }));

    const motes = Array.from({ length: 42 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: 0.25 + Math.random() * 0.75,
      v: 0.00006 + Math.random() * 0.00018,
    }));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      const cx = w * 0.5;
      const cy = h * 0.42;
      const scale = Math.min(w, h) / 900;

      ctx.lineWidth = 1;
      ctx.strokeStyle = hexAlpha(fg, 0.055);
      const n = 13;
      for (let i = 0; i <= n; i++) {
        ctx.beginPath();
        ctx.moveTo((i / n) * w, h);
        ctx.lineTo(cx, cy);
        ctx.stroke();
      }
      for (let i = 0; i <= n; i++) {
        ctx.beginPath();
        ctx.moveTo((i / n) * w, 0);
        ctx.lineTo(cx, cy);
        ctx.stroke();
      }
      for (let i = 1; i <= 7; i++) {
        const p = i / 7;
        const y = cy + (h * 0.78 - cy) * p * p;
        const span = w * 0.48 * p * p + 16;
        ctx.beginPath();
        ctx.moveTo(cx - span, y);
        ctx.lineTo(cx + span, y);
        ctx.stroke();
      }

      for (let i = 1; i <= 6; i++) {
        const wobble = reduce ? 0 : Math.sin(t / 1700 + i) * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, (26 + i * 22) * (0.85 + scale * 0.4) + wobble, 0, Math.PI * 2);
        ctx.strokeStyle = i === 2 ? hexAlpha(stamp, 0.22) : hexAlpha(fg, 0.1);
        ctx.stroke();
      }

      shards.forEach((s) => {
        const ang = s.a + (reduce ? 0 : t * s.spin);
        const rad = s.r * (0.7 + scale);
        const x = cx + Math.cos(ang) * rad;
        const y = cy + Math.sin(ang) * rad * 0.58;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ang);
        ctx.strokeStyle = s.stamp ? hexAlpha(stamp, 0.28) : hexAlpha(fg, 0.14);
        ctx.beginPath();
        ctx.moveTo(0, -s.s);
        ctx.lineTo(s.s * 0.72, s.s * 0.42);
        ctx.lineTo(-s.s * 0.58, s.s * 0.5);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      });

      ctx.font = "600 11px 'IBM Plex Mono', ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ENGINE_LETTERS.forEach((L, i) => {
        const ang = (i / ENGINE_LETTERS.length) * Math.PI * 2 + (reduce ? 0 : t * 0.00016);
        const rad = (108 + (reduce ? 0 : Math.sin(t / 2100 + i) * 3)) * (0.75 + scale * 0.5);
        const x = cx + Math.cos(ang) * rad;
        const y = cy + Math.sin(ang) * rad * 0.56;
        ctx.fillStyle = hexAlpha(fg, 0.38);
        ctx.fillText(L.letter, x, y);
      });

      motes.forEach((m) => {
        if (!reduce) {
          m.y -= m.v;
          if (m.y < 0) m.y = 1;
        }
        ctx.fillStyle = hexAlpha(fg, 0.06 + m.z * 0.16);
        const sz = m.z > 0.72 ? 1.5 : 1;
        ctx.fillRect(m.x * w, m.y * h, sz, sz);
      });

      const iris = 9 + (reduce ? 0 : Math.sin(t / 900) * 1.4);
      ctx.beginPath();
      ctx.arc(cx, cy, iris, 0, Math.PI * 2);
      ctx.fillStyle = hexAlpha(stamp, 0.32);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, iris + 6, 0, Math.PI * 2);
      ctx.strokeStyle = hexAlpha(fg, 0.2);
      ctx.stroke();
    };

    const loop = (t: number) => {
      if (!running) return;
      if (!document.hidden && t - last > 26) {
        draw(t);
        last = t;
      }
      raf = requestAnimationFrame(loop);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    if (reduce) draw(0);
    else raf = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 size-full" aria-hidden />;
}

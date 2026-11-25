/**
 * Interactive blueprint/paper backdrop:
 * 1) 24px architectural grid with CSS radial mask cursor highlight (--mx/--my)
 * 2) Canvas 2D node graph (<= 44 nodes, DPR <= 2, headline zone masked)
 *    where edges brighten near pointer and clicking a node sends a data packet pulse.
 * Automatically pauses when hidden, off-screen, or in lite/reduced-motion mode.
 */
'use client';

import React, { useEffect, useRef } from 'react';
import type { SurfaceMode } from '@/lib/engine/store';

interface NetworkBackdropProps {
  surfaceMode: SurfaceMode;
  liteMode: boolean;
  motionPaused: boolean;
  pointerPos: { x: number; y: number };
}

interface GraphNode {
  x: number;
  y: number;
  neighbors: number[];
}

interface Packet {
  from: number;
  to: number;
  t: number;
}

export function NetworkBackdrop({
  surfaceMode,
  liteMode,
  motionPaused,
  pointerPos,
}: NetworkBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef(pointerPos);
  const packetsRef = useRef<Packet[]>([]);

  useEffect(() => {
    pointerRef.current = pointerPos;
  }, [pointerPos]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || liteMode || motionPaused) return;
    const reduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reduced) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let nodes: GraphNode[] = [];
    let rafId = 0;

    const buildGraph = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = window.innerWidth;
      height = Math.max(640, window.innerHeight);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = width < 768 ? 5 : 8;
      const rows = 5;
      const list: GraphNode[] = [];
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const jitterX = ((r * 13 + c * 7) % 5) * 8 - 16;
          const jitterY = ((r * 5 + c * 11) % 5) * 7 - 14;
          const x = ((c + 0.5) / cols) * width + jitterX;
          const y = ((r + 0.5) / rows) * height + jitterY;
          list.push({ x, y, neighbors: [] });
        }
      }
      for (let i = 0; i < list.length; i += 1) {
        for (let j = i + 1; j < list.length; j += 1) {
          const dx = list[i].x - list[j].x;
          const dy = list[i].y - list[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < (width < 768 ? 160 : 210)) {
            list[i].neighbors.push(j);
            list[j].neighbors.push(i);
          }
        }
      }
      nodes = list.slice(0, 44);
    };

    const drawFrame = () => {
      rafId = 0;
      if (document.hidden) return;
      ctx.clearRect(0, 0, width, height);
      const isPaper = surfaceMode === 'paper';
      const baseRgb = isPaper ? '15, 76, 129' : '234, 242, 255';
      const accentRgb = isPaper ? '25, 183, 166' : '245, 168, 0';
      const px = pointerRef.current.x;
      const py = pointerRef.current.y;

      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        for (const j of a.neighbors) {
          if (j <= i || j >= nodes.length) continue;
          const b = nodes[j];
          const midX = (a.x + b.x) / 2;
          const midY = (a.y + b.y) / 2;
          const inHeadlineZone = width >= 768 && midX < width * 0.52 && midY > 90 && midY < 470;
          if (inHeadlineZone) continue;

          const dist = Math.hypot(midX - px, midY - py);
          const boost = Math.max(0, 1 - dist / 180);
          ctx.strokeStyle = `rgba(${baseRgb}, ${(0.07 + boost * 0.24).toFixed(3)})`;
          ctx.lineWidth = boost > 0.35 ? 1.5 : 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (let i = 0; i < nodes.length; i += 1) {
        const n = nodes[i];
        const inHeadlineZone = width >= 768 && n.x < width * 0.52 && n.y > 90 && n.y < 470;
        if (inHeadlineZone) continue;
        const dist = Math.hypot(n.x - px, n.y - py);
        const boost = Math.max(0, 1 - dist / 150);
        ctx.fillStyle = `rgba(${baseRgb}, ${(0.14 + boost * 0.42).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2.2 + boost * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      const nextPackets: Packet[] = [];
      for (const p of packetsRef.current) {
        const a = nodes[p.from];
        const b = nodes[p.to];
        if (!a || !b) continue;
        const nextT = p.t + 0.04;
        if (nextT < 1) {
          const x = a.x + (b.x - a.x) * nextT;
          const y = a.y + (b.y - a.y) * nextT;
          ctx.fillStyle = `rgba(${accentRgb}, 0.92)`;
          ctx.beginPath();
          ctx.arc(x, y, 4.2, 0, Math.PI * 2);
          ctx.fill();
          nextPackets.push({ from: p.from, to: p.to, t: nextT });
        }
      }
      packetsRef.current = nextPackets;
      if (nextPackets.length > 0) {
        rafId = requestAnimationFrame(drawFrame);
      }
    };

    const scheduleDraw = () => {
      if (!rafId) rafId = requestAnimationFrame(drawFrame);
    };

    const handleClick = (e: MouseEvent) => {
      if (!nodes.length) return;
      let bestIdx = -1;
      let bestDist = 75;
      for (let i = 0; i < nodes.length; i += 1) {
        const d = Math.hypot(nodes[i].x - e.clientX, nodes[i].y - e.clientY);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      }
      if (bestIdx !== -1) {
        for (const nb of nodes[bestIdx].neighbors.slice(0, 4)) {
          packetsRef.current.push({ from: bestIdx, to: nb, t: 0 });
        }
        scheduleDraw();
      }
    };

    const onPointer = () => scheduleDraw();

    buildGraph();
    scheduleDraw();
    window.addEventListener('resize', () => {
      buildGraph();
      scheduleDraw();
    });
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('click', handleClick);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('click', handleClick);
    };
  }, [surfaceMode, liteMode, motionPaused]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* 24px / 120px architectural grid highlighted around cursor via CSS mask */}
      <div
        className="absolute inset-0 opacity-65"
        style={{
          backgroundImage:
            surfaceMode === 'paper'
              ? 'linear-gradient(to right, rgba(15, 30, 58, 0.11) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 30, 58, 0.11) 1px, transparent 1px), linear-gradient(to right, rgba(15, 30, 58, 0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 30, 58, 0.045) 1px, transparent 1px)'
              : 'linear-gradient(to right, rgba(234, 242, 255, 0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(234, 242, 255, 0.14) 1px, transparent 1px), linear-gradient(to right, rgba(234, 242, 255, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(234, 242, 255, 0.06) 1px, transparent 1px)',
          backgroundSize: '120px 120px, 120px 120px, 24px 24px, 24px 24px',
        }}
      />
      {!liteMode && !motionPaused ? (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              surfaceMode === 'paper'
                ? 'radial-gradient(circle 2px at 0 0, rgba(15, 76, 129, 0.55) 100%, transparent 0)'
                : 'radial-gradient(circle 2px at 0 0, rgba(245, 168, 0, 0.72) 100%, transparent 0)',
            backgroundSize: '24px 24px',
            maskImage:
              'radial-gradient(140px circle at var(--mx) var(--my), #000 0%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(140px circle at var(--mx) var(--my), #000 0%, transparent 100%)',
          }}
        />
      ) : null}

      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}

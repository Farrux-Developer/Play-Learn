/**
 * A13 Live Graph Backdrop:
 * - 24px / 120px architectural grid with pointer radial spotlight (--mx / --my)
 * - Canvas 2D node graph (<= 48 nodes, DPR <= 2) driven by MotionCore's single ticker
 * - High tier: 0.05 Hz simplex-noise drift <= 1.5px; Mid tier: 30 FPS static graph;
 *   Lite tier / reduced-motion: static architectural grid only
 * - Masks headline & copy reading zone on ALL viewports (desktop + mobile)
 * - Click/tap on a node launches a glowing packet with trailing tail along shortest BFS path
 */
'use client';

import React, { useEffect, useRef } from 'react';
import { createNoise2D } from 'simplex-noise';
import type { SurfaceMode } from '@/lib/engine/store';
import { motionCore, type QualityTier } from '@/lib/motion/core';

interface NetworkBackdropProps {
  surfaceMode: SurfaceMode;
  tier: QualityTier;
  motionPaused: boolean;
}

interface GraphNode {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  neighbors: number[];
}

interface PathPacket {
  path: number[];
  segIdx: number;
  t: number;
  durationMs: number;
}

function findShortestPath(nodes: GraphNode[], start: number, target: number): number[] {
  if (start === target) return [start];
  const queue: number[][] = [[start]];
  const visited = new Set<number>([start]);
  while (queue.length > 0) {
    const path = queue.shift()!;
    const last = path[path.length - 1];
    if (last === undefined) continue;
    for (const nb of nodes[last]?.neighbors ?? []) {
      if (nb === target) return [...path, nb];
      if (!visited.has(nb) && path.length < 5) {
        visited.add(nb);
        queue.push([...path, nb]);
      }
    }
  }
  return [start, ...(nodes[start]?.neighbors.slice(0, 1) ?? [])];
}

const sharedNoise2D = createNoise2D();

export function NetworkBackdrop({
  surfaceMode,
  tier,
  motionPaused,
}: NetworkBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const packetsRef = useRef<PathPacket[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || tier === 'lite' || motionPaused) return;
    const reduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reduced) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const noise2D = sharedNoise2D;
    let width = 0;
    let height = 0;
    let nodes: GraphNode[] = [];
    let midAccumulator = 0;
    let needsStaticPaint = true;

    const isMaskedZone = (x: number, y: number) => {
      if (width < 768) {
        // Mask top mobile hero reading block completely
        return y > 70 && y < 440;
      }
      return x < width * 0.54 && y > 80 && y < 520;
    };

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
          const jx = ((r * 13 + c * 7) % 5) * 8 - 16;
          const jy = ((r * 5 + c * 11) % 5) * 7 - 14;
          const x = ((c + 0.5) / cols) * width + jx;
          const y = ((r + 0.5) / rows) * height + jy;
          list.push({ baseX: x, baseY: y, x, y, neighbors: [] });
        }
      }
      for (let i = 0; i < list.length; i += 1) {
        const nodeI = list[i];
        if (!nodeI) continue;
        for (let j = i + 1; j < list.length; j += 1) {
          const nodeJ = list[j];
          if (!nodeJ) continue;
          const dist = Math.hypot(nodeI.x - nodeJ.x, nodeI.y - nodeJ.y);
          if (dist < (width < 768 ? 160 : 210)) {
            nodeI.neighbors.push(j);
            nodeJ.neighbors.push(i);
          }
        }
      }
      nodes = list.slice(0, 48);
      needsStaticPaint = true;
    };

    const drawFrame = (timeSec: number, deltaMs: number) => {
      if (document.hidden) return;
      if (tier === 'mid') {
        midAccumulator += deltaMs;
        if (!needsStaticPaint && packetsRef.current.length === 0 && midAccumulator < 34) {
          return;
        }
        if (midAccumulator < 33 && packetsRef.current.length > 0) return;
        midAccumulator = 0;
      }
      needsStaticPaint = false;

      const ptr = motionCore.getPointer();
      const px = ptr.x;
      const py = ptr.y;
      const isPaper = surfaceMode === 'paper';
      const baseRgb = isPaper ? '15, 76, 129' : '234, 242, 255';
      const accentRgb = isPaper ? '25, 183, 166' : '245, 168, 0';

      // Organic 0.05 Hz simplex-noise drift <= 1.5px on high tier only
      if (tier === 'high') {
        const t = timeSec * 0.05;
        for (let i = 0; i < nodes.length; i += 1) {
          const n = nodes[i];
          if (!n) continue;
          n.x = n.baseX + noise2D(i * 0.37, t) * 1.5;
          n.y = n.baseY + noise2D(i * 0.37 + 19, t) * 1.5;
        }
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        if (!a) continue;
        for (const j of a.neighbors) {
          if (j <= i || j >= nodes.length) continue;
          const b = nodes[j];
          if (!b) continue;
          const midX = (a.x + b.x) / 2;
          const midY = (a.y + b.y) / 2;
          if (isMaskedZone(midX, midY)) continue;

          const dist = Math.hypot(midX - px, midY - py);
          const boost = ptr.isTouch ? 0 : Math.max(0, 1 - dist / 180);
          ctx.strokeStyle = `rgba(${baseRgb}, ${(0.065 + boost * 0.24).toFixed(3)})`;
          ctx.lineWidth = boost > 0.35 ? 1.5 : 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (let i = 0; i < nodes.length; i += 1) {
        const n = nodes[i];
        if (!n || isMaskedZone(n.x, n.y)) continue;
        const dist = Math.hypot(n.x - px, n.y - py);
        const boost = ptr.isTouch ? 0 : Math.max(0, 1 - dist / 150);
        ctx.fillStyle = `rgba(${baseRgb}, ${(0.14 + boost * 0.4).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2.2 + boost * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shortest-path packets with trailing comet tail
      const remaining: PathPacket[] = [];
      for (const pkt of packetsRef.current) {
        const fromIdx = pkt.path[pkt.segIdx];
        const toIdx = pkt.path[pkt.segIdx + 1];
        const fromNode = fromIdx !== undefined ? nodes[fromIdx] : undefined;
        const toNode = toIdx !== undefined ? nodes[toIdx] : undefined;
        if (!fromNode || !toNode) continue;

        const step = deltaMs / Math.max(180, pkt.durationMs);
        let nextT = pkt.t + step;
        let nextSeg = pkt.segIdx;
        if (nextT >= 1) {
          nextSeg += 1;
          nextT = 0;
        }
        if (nextSeg < pkt.path.length - 1) {
          const nextFromIdx = pkt.path[nextSeg];
          const nextToIdx = pkt.path[nextSeg + 1];
          const a = nextFromIdx !== undefined ? nodes[nextFromIdx] : undefined;
          const b = nextToIdx !== undefined ? nodes[nextToIdx] : undefined;
          if (!a || !b) continue;
          // ease-in-out
          const e = nextT < 0.5 ? 2 * nextT * nextT : 1 - Math.pow(-2 * nextT + 2, 2) / 2;
          const x = a.x + (b.x - a.x) * e;
          const y = a.y + (b.y - a.y) * e;
          const tailE = Math.max(0, e - 0.22);
          const tx = a.x + (b.x - a.x) * tailE;
          const ty = a.y + (b.y - a.y) * tailE;

          ctx.strokeStyle = `rgba(${accentRgb}, 0.42)`;
          ctx.lineWidth = 2.6;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(x, y);
          ctx.stroke();

          ctx.fillStyle = `rgba(${accentRgb}, 0.95)`;
          ctx.beginPath();
          ctx.arc(x, y, 4.2, 0, Math.PI * 2);
          ctx.fill();

          remaining.push({ ...pkt, segIdx: nextSeg, t: nextT });
        }
      }
      packetsRef.current = remaining;
    };

    const handleClick = (e: MouseEvent) => {
      if (!nodes.length) return;
      let startIdx = -1;
      let bestDist = 90;
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        if (!node || isMaskedZone(node.x, node.y)) continue;
        const d = Math.hypot(node.x - e.clientX, node.y - e.clientY);
        if (d < bestDist) {
          bestDist = d;
          startIdx = i;
        }
      }
      if (startIdx === -1) return;
      // Pick farthest neighbor reachable in 2-3 hops for visible shortest-path packet
      const targetIdx = Math.min(nodes.length - 1, (startIdx + 9) % nodes.length);
      const path = findShortestPath(nodes, startIdx, targetIdx);
      if (path.length >= 2) {
        packetsRef.current.push({
          path,
          segIdx: 0,
          t: 0,
          durationMs: 320,
        });
      }
    };

    const onResize = () => buildGraph();
    buildGraph();
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('click', handleClick);
    const offTick = motionCore.registerTicker(drawFrame);

    return () => {
      offTick();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('click', handleClick);
    };
  }, [surfaceMode, tier, motionPaused]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* 24px / 120px architectural grid */}
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
      {tier !== 'lite' && !motionPaused ? (
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

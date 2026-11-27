/**
 * A05 Interlocked 24 / 36 / 18 Gear Train behind Mirzo:
 * - tier === 'high': lazy-loaded Three.js WebGLRenderer (no shadows, DPR <= 1.5)
 *   with MeshPhysicalMaterial clearcoat + RoomEnvironment reflections,
 *   subscribed to MotionCore's single ticker, render-on-demand when visible.
 * - tier === 'mid': crisp SVG 24/36/18 gear train rotating on events.
 * - tier === 'lite' / reduced-motion: static SVG gear poster.
 */
'use client';

import React, { useEffect, useRef } from 'react';
import { motionCore, type QualityTier } from '@/lib/motion/core';

interface GearTrainProps {
  tier: QualityTier;
  motionPaused: boolean;
  lookOffset: { x: number; y: number };
  isHighPerfAllowed?: boolean;
}

function createSvgGearPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  teeth: number
): string {
  const step = (Math.PI * 2) / teeth;
  let d = '';
  for (let i = 0; i < teeth; i += 1) {
    const a0 = i * step;
    const a1 = a0 + step * 0.22;
    const a2 = a0 + step * 0.48;
    const a3 = a0 + step * 0.72;
    const p0: [number, number] = [cx + Math.cos(a0) * innerR, cy + Math.sin(a0) * innerR];
    const p1: [number, number] = [cx + Math.cos(a1) * outerR, cy + Math.sin(a1) * outerR];
    const p2: [number, number] = [cx + Math.cos(a2) * outerR, cy + Math.sin(a2) * outerR];
    const p3: [number, number] = [cx + Math.cos(a3) * innerR, cy + Math.sin(a3) * innerR];
    d += i === 0 ? `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)} ` : `L${p0[0].toFixed(1)} ${p0[1].toFixed(1)} `;
    d += `L${p1[0].toFixed(1)} ${p1[1].toFixed(1)} L${p2[0].toFixed(1)} ${p2[1].toFixed(1)} L${p3[0].toFixed(1)} ${p3[1].toFixed(1)} `;
  }
  return d + 'Z';
}

const SVG_GEAR_24 = createSvgGearPath(68, 92, 42, 35, 24);
const SVG_GEAR_36 = createSvgGearPath(145, 78, 56, 48, 36);
const SVG_GEAR_18 = createSvgGearPath(206, 122, 32, 26, 18);

export function GearTrain({
  tier,
  motionPaused,
  lookOffset,
}: GearTrainProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const svg24Ref = useRef<SVGGElement | null>(null);
  const svg36Ref = useRef<SVGGElement | null>(null);
  const svg18Ref = useRef<SVGGElement | null>(null);
  const lookRef = useRef(lookOffset);
  const boostRef = useRef(1);
  const snapRef = useRef(0);

  useEffect(() => {
    lookRef.current = lookOffset;
  }, [lookOffset]);

  // Listen to xp:gain (3x speed burst) and workshop:unlock (+15 deg snap)
  useEffect(() => {
    const offXp = motionCore.on('xp:gain', () => {
      boostRef.current = 3;
      window.setTimeout(() => {
        boostRef.current = 1;
      }, 600);
    });
    const offUnlock = motionCore.on('workshop:unlock', () => {
      snapRef.current += 15;
    });
    const offMachine = motionCore.on('machine:step', () => {
      snapRef.current += 18;
    });
    return () => {
      offXp();
      offUnlock();
      offMachine();
    };
  }, []);

  // SVG gear rotation for mid tier (events) & fallback poster
  useEffect(() => {
    if (tier === 'lite' || motionPaused) return;
    if (tier === 'high') return; // Three.js handles high tier once loaded

    let deg = 0;
    let lastSnap = snapRef.current;
    let currentVel = 0;

    const offTick = motionCore.registerTicker((_t, dt) => {
      if (boostRef.current > 1.05) {
        currentVel = 18 * (boostRef.current / 3);
      } else {
        currentVel *= 0.92;
      }
      if (snapRef.current !== lastSnap) {
        deg += snapRef.current - lastSnap;
        lastSnap = snapRef.current;
      }
      deg += currentVel * (dt / 1000);
      if (svg24Ref.current) svg24Ref.current.style.transform = `rotate(${deg.toFixed(2)}deg)`;
      if (svg36Ref.current) svg36Ref.current.style.transform = `rotate(${(-deg * (24 / 36)).toFixed(2)}deg)`;
      if (svg18Ref.current) svg18Ref.current.style.transform = `rotate(${(deg * (24 / 18)).toFixed(2)}deg)`;
    });

    return () => offTick();
  }, [tier, motionPaused]);

  // Gated Three.js WebGL glossy clearcoat gear train (tier: high + idle + visible)
  useEffect(() => {
    const container = hostRef.current;
    if (!container || tier !== 'high' || motionPaused) return;
    const reduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reduced) return;

    let cancelled = false;
    let cleanupThree: (() => void) | null = null;

    const startIdle = () => {
      const w = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number };
      const load = () => {
        void import('@/lib/motion/gearThree')
          .then(({ mountThreeGearTrain }) =>
            mountThreeGearTrain(container, {
              getLookOffset: () => lookRef.current,
              getBoost: () => boostRef.current,
              getSnapDeg: () => snapRef.current,
              isCancelled: () => cancelled,
            })
          )
          .then((cleanup) => {
            if (cancelled) cleanup?.();
            else cleanupThree = cleanup;
          })
          .catch(() => {
            // SVG poster remains visible
          });
      };
      if (typeof w.requestIdleCallback === 'function') {
        w.requestIdleCallback(load, { timeout: 1200 });
      } else {
        window.setTimeout(load, 250);
      }
    };

    startIdle();
    return () => {
      cancelled = true;
      cleanupThree?.();
    };
  }, [tier, motionPaused]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-2 top-2 h-44 overflow-hidden opacity-85"
    >
      {/* Static / Mid-tier crisp 24-36-18 SVG gear poster (replaced by Three canvas on high) */}
      <svg viewBox="0 0 260 180" className="h-full w-full" fill="none">
        <g
          ref={svg24Ref}
          style={{ transformOrigin: '68px 92px' }}
        >
          <path
            d={SVG_GEAR_24}
            fill="#0F4C81"
            fillOpacity="0.48"
            stroke="#EAF2FF"
            strokeOpacity="0.28"
            strokeWidth="1.5"
          />
          <circle cx="68" cy="92" r="12" fill="#07264B" stroke="#EAF2FF" strokeOpacity="0.25" strokeWidth="1.5" />
        </g>
        <g
          ref={svg36Ref}
          style={{ transformOrigin: '145px 78px' }}
        >
          <path
            d={SVG_GEAR_36}
            fill="#19B7A6"
            fillOpacity="0.24"
            stroke="#49E2D0"
            strokeOpacity="0.34"
            strokeWidth="1.5"
          />
          <circle cx="145" cy="78" r="17" fill="#07264B" stroke="#49E2D0" strokeOpacity="0.3" strokeWidth="1.5" />
        </g>
        <g
          ref={svg18Ref}
          style={{ transformOrigin: '206px 122px' }}
        >
          <path
            d={SVG_GEAR_18}
            fill="#F5A800"
            fillOpacity="0.26"
            stroke="#F5A800"
            strokeOpacity="0.45"
            strokeWidth="1.5"
          />
          <circle cx="206" cy="122" r="9" fill="#07264B" stroke="#F5A800" strokeOpacity="0.4" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

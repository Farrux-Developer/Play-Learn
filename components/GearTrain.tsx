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
    const pts = [
      [cx + Math.cos(a0) * innerR, cy + Math.sin(a0) * innerR],
      [cx + Math.cos(a1) * outerR, cy + Math.sin(a1) * outerR],
      [cx + Math.cos(a2) * outerR, cy + Math.sin(a2) * outerR],
      [cx + Math.cos(a3) * innerR, cy + Math.sin(a3) * innerR],
    ];
    d += i === 0 ? `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)} ` : `L${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)} `;
    d += `L${pts[1][0].toFixed(1)} ${pts[1][1].toFixed(1)} L${pts[2][0].toFixed(1)} ${pts[2][1].toFixed(1)} L${pts[3][0].toFixed(1)} ${pts[3][1].toFixed(1)} `;
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
      if (typeof w.requestIdleCallback === 'function') {
        w.requestIdleCallback(() => void initThree(), { timeout: 1200 });
      } else {
        window.setTimeout(() => void initThree(), 250);
      }
    };

    const initThree = async () => {
      if (cancelled || !container) return;
      try {
        const [THREE, { RoomEnvironment }] = await Promise.all([
          import('three'),
          import('three/examples/jsm/environments/RoomEnvironment.js'),
        ]);
        if (cancelled || !container) return;

        const width = Math.max(220, container.clientWidth || 280);
        const height = Math.max(160, container.clientHeight || 190);
        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        });
        renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
        renderer.setSize(width, height);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        renderer.domElement.className = 'h-full w-full pointer-events-none';
        renderer.domElement.setAttribute('aria-hidden', 'true');

        const scene = new THREE.Scene();
        const pmrem = new THREE.PMREMGenerator(renderer);
        const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environment = envTex;

        const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 30);
        camera.position.set(0, 0, 7.6);

        const keyLight = new THREE.DirectionalLight(0xfff4dc, 1.4);
        keyLight.position.set(3, 4, 5);
        const rimLight = new THREE.DirectionalLight(0x55decc, 0.8);
        rimLight.position.set(-4, -2, 3);
        scene.add(keyLight, rimLight);

        const makeGearGeometry = (outerR: number, innerR: number, holeR: number, teeth: number, depth: number) => {
          const shape = new THREE.Shape();
          const step = (Math.PI * 2) / teeth;
          for (let i = 0; i < teeth; i += 1) {
            const a0 = i * step;
            const a1 = a0 + step * 0.22;
            const a2 = a0 + step * 0.48;
            const a3 = a0 + step * 0.72;
            if (i === 0) shape.moveTo(Math.cos(a0) * innerR, Math.sin(a0) * innerR);
            else shape.lineTo(Math.cos(a0) * innerR, Math.sin(a0) * innerR);
            shape.lineTo(Math.cos(a1) * outerR, Math.sin(a1) * outerR);
            shape.lineTo(Math.cos(a2) * outerR, Math.sin(a2) * outerR);
            shape.lineTo(Math.cos(a3) * innerR, Math.sin(a3) * innerR);
          }
          shape.closePath();
          const hole = new THREE.Path();
          hole.absarc(0, 0, holeR, 0, Math.PI * 2, true);
          shape.holes.push(hole);
          return new THREE.ExtrudeGeometry(shape, {
            depth,
            bevelEnabled: true,
            bevelThickness: 0.04,
            bevelSize: 0.035,
            bevelSegments: 2,
          });
        };

        const matCobalt = new THREE.MeshPhysicalMaterial({
          color: 0x0f4c81,
          metalness: 0.2,
          roughness: 0.28,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
        });
        const matGlaze = new THREE.MeshPhysicalMaterial({
          color: 0x19b7a6,
          metalness: 0.18,
          roughness: 0.24,
          clearcoat: 1.0,
          clearcoatRoughness: 0.08,
        });
        const matSaffron = new THREE.MeshPhysicalMaterial({
          color: 0xf5a800,
          metalness: 0.45,
          roughness: 0.22,
          clearcoat: 1.0,
          clearcoatRoughness: 0.12,
        });

        const g24Geo = makeGearGeometry(0.95, 0.8, 0.28, 24, 0.18);
        const g36Geo = makeGearGeometry(1.32, 1.15, 0.42, 36, 0.22);
        const g18Geo = makeGearGeometry(0.72, 0.59, 0.22, 18, 0.16);

        const g24 = new THREE.Mesh(g24Geo, matCobalt);
        g24.position.set(-1.38, -0.1, -0.1);
        const g36 = new THREE.Mesh(g36Geo, matGlaze);
        g36.position.set(0.32, 0.22, -0.22);
        const g18 = new THREE.Mesh(g18Geo, matSaffron);
        g18.position.set(1.62, -0.58, -0.05);

        const rig = new THREE.Group();
        rig.add(g24, g36, g18);
        scene.add(rig);

        container.innerHTML = '';
        container.appendChild(renderer.domElement);

        let isVisible = true;
        let baseAngle = 0;
        let lastSnap = snapRef.current;

        const offVis = motionCore.observeVisibility(container, (vis) => {
          isVisible = vis;
        });

        const offTick = motionCore.registerTicker((_t, dt) => {
          if (!isVisible) return;
          const speedMult = boostRef.current;
          // 6 deg/s resting angular velocity
          const radPerSec = ((6 * Math.PI) / 180) * speedMult;
          if (snapRef.current !== lastSnap) {
            baseAngle += ((snapRef.current - lastSnap) * Math.PI) / 180;
            lastSnap = snapRef.current;
          }
          baseAngle += radPerSec * (dt / 1000);
          g24.rotation.z = baseAngle;
          g36.rotation.z = -baseAngle * (24 / 36);
          g18.rotation.z = baseAngle * (24 / 18);

          // Camera hover parallax <= 4 deg
          const targetRx = lookRef.current.y * ((3.5 * Math.PI) / 180);
          const targetRy = lookRef.current.x * ((4 * Math.PI) / 180);
          rig.rotation.x += (targetRx - rig.rotation.x) * 0.12;
          rig.rotation.y += (targetRy - rig.rotation.y) * 0.12;

          renderer.render(scene, camera);
        });

        const onLost = (e: Event) => e.preventDefault();
        renderer.domElement.addEventListener('webglcontextlost', onLost);

        cleanupThree = () => {
          offVis();
          offTick();
          renderer.domElement.removeEventListener('webglcontextlost', onLost);
          g24Geo.dispose();
          g36Geo.dispose();
          g18Geo.dispose();
          matCobalt.dispose();
          matGlaze.dispose();
          matSaffron.dispose();
          envTex.dispose();
          pmrem.dispose();
          renderer.dispose();
          if (renderer.domElement.parentNode === container) {
            container.removeChild(renderer.domElement);
          }
        };
      } catch {
        // Fallback SVG remains visible automatically
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

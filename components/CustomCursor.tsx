'use client';

import React, { useEffect, useRef, useSyncExternalStore } from 'react';

interface CustomCursorProps {
  enabled: boolean;
}

function subscribeFinePointer(cb: () => void) {
  const mql = window.matchMedia('(pointer: fine)');
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
}

function getFinePointerSnapshot() {
  return window.matchMedia('(pointer: fine)').matches;
}

/**
 * Desktop-only precision reticle cursor.
 * Automatically disabled on touch devices, narrow viewports, and reduced motion.
 */
export function CustomCursor({ enabled }: CustomCursorProps) {
  const ringRef = useRef<HTMLDivElement | null>(null);
  const isFinePointer = useSyncExternalStore(
    subscribeFinePointer,
    getFinePointerSnapshot,
    () => false
  );
  const active = enabled && isFinePointer;

  useEffect(() => {
    if (!active) return;

    let rafId = 0;
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let hoveringInteractive = false;

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      const el = e.target as HTMLElement | null;
      hoveringInteractive = Boolean(
        el?.closest('button, a, [role="button"], input, select')
      );
    };

    const tick = () => {
      currentX += (targetX - currentX) * 0.28;
      currentY += (targetY - currentY) * 0.28;
      if (ringRef.current) {
        const scale = hoveringInteractive ? 1.45 : 1;
        ringRef.current.style.transform = `translate3d(${currentX - 14}px, ${currentY - 14}px, 0) scale(${scale})`;
      }
      rafId = window.requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.cancelAnimationFrame(rafId);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={ringRef}
      aria-hidden="true"
      className="hidden md:block pointer-events-none fixed top-0 left-0 z-40 w-7 h-7 rounded-full border-2 border-[#0F4C81]/70 bg-[#F59E0B]/10 transition-opacity duration-150"
      style={{ willChange: 'transform' }}
    />
  );
}

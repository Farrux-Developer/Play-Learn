/**
 * Adaptive performance detector: measures 60 frames after mount.
 * If p75 frame time > 24 ms, Save-Data is active, or prefers-reduced-motion matches,
 * enables lite mode automatically.
 */

export function detectHardwareLiteDefaults(): {
  reducedMotion: boolean;
  saveData: boolean;
} {
  if (typeof window === 'undefined') {
    return { reducedMotion: false, saveData: false };
  }
  const reducedMotion =
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  const saveData = Boolean(nav.connection?.saveData);
  return { reducedMotion, saveData };
}

export function measureInitialFrames(onTooSlow: () => void): () => void {
  if (typeof window === 'undefined' || typeof requestAnimationFrame === 'undefined') {
    return () => {};
  }

  let cancelled = false;
  let rafId = 0;
  let last = performance.now();
  const deltas: number[] = [];

  const tick = (now: number) => {
    if (cancelled) return;
    if (!document.hidden) {
      deltas.push(now - last);
    }
    last = now;

    if (deltas.length >= 60) {
      const sorted = [...deltas].sort((a, b) => a - b);
      const p75 = sorted[Math.floor(sorted.length * 0.75)] ?? 16.6;
      if (p75 > 24) {
        onTooSlow();
      }
      return;
    }
    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);
  return () => {
    cancelled = true;
    cancelAnimationFrame(rafId);
  };
}

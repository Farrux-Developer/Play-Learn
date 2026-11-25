/**
 * Offline canvas-confetti reward burst using custom duppi chevron and 8-point girih shapes
 * in the workshop palette (saffron, glaze, cobalt). Never triggers under reduced motion.
 */

import type { Shape } from 'canvas-confetti';

const REWARD_COLORS = ['#F5A800', '#19B7A6', '#0F4C81'];

export async function fireWorkshopConfetti(opts: {
  liteMode: boolean;
  motionPaused: boolean;
}): Promise<void> {
  if (typeof window === 'undefined' || opts.motionPaused) return;
  const reduced =
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  if (reduced) return;

  const mod = await import('canvas-confetti');
  const confetti = mod.default;

  const shapes: Shape[] = [];
  if (typeof confetti.shapeFromPath === 'function') {
    // Duppi chevron motif & 8-point girih star motif
    shapes.push(
      confetti.shapeFromPath({ path: 'M 0 10 L 8 0 L 16 10 L 12 10 L 8 5 L 4 10 Z' }) as Shape,
      confetti.shapeFromPath({
        path: 'M 8 0 L 10 5 L 16 8 L 10 11 L 8 16 L 6 11 L 0 8 L 6 5 Z',
      }) as Shape
    );
  }

  await confetti({
    particleCount: opts.liteMode ? 10 : 28,
    spread: 62,
    startVelocity: opts.liteMode ? 24 : 34,
    origin: { y: 0.65 },
    colors: REWARD_COLORS,
    shapes: shapes.length ? shapes : undefined,
    disableForReducedMotion: true,
    scalar: 1.05,
  });
}

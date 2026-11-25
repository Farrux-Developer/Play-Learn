/**
 * Offline canvas-confetti reward burst using custom duppi chevron & 8-point girih shapes
 * on a dedicated worker-enabled canvas (saffron, glaze, cobalt).
 */

import type { Shape } from 'canvas-confetti';

const REWARD_COLORS_LEVEL = ['#F5A800', '#19B7A6'];
const REWARD_COLORS_ALL = ['#F5A800', '#19B7A6', '#0F4C81'];

let customCanvas: HTMLCanvasElement | null = null;
let confettiInstance: ReturnType<typeof import('canvas-confetti').create> | null = null;

export async function fireWorkshopConfetti(opts: {
  liteMode: boolean;
  motionPaused: boolean;
  variant?: 'correct' | 'levelUp' | 'quiz';
}): Promise<void> {
  if (typeof window === 'undefined' || opts.motionPaused) return;
  const reduced =
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  if (reduced) return;

  const mod = await import('canvas-confetti');
  const confettiMod = mod.default;

  if (!customCanvas) {
    customCanvas = document.createElement('canvas');
    customCanvas.setAttribute('aria-hidden', 'true');
    customCanvas.className = 'pointer-events-none fixed inset-0 z-[70] h-full w-full';
    document.body.appendChild(customCanvas);
  }

  if (!confettiInstance && typeof confettiMod.create === 'function') {
    confettiInstance = confettiMod.create(customCanvas, {
      resize: true,
      useWorker: true,
    });
  }

  const shapes: Shape[] = [];
  if (typeof confettiMod.shapeFromPath === 'function') {
    shapes.push(
      confettiMod.shapeFromPath({ path: 'M 0 10 L 8 0 L 16 10 L 12 10 L 8 5 L 4 10 Z' }) as Shape,
      confettiMod.shapeFromPath({
        path: 'M 8 0 L 10 5 L 16 8 L 10 11 L 8 16 L 6 11 L 0 8 L 6 5 Z',
      }) as Shape
    );
  }

  const variant = opts.variant ?? 'correct';
  const count = opts.liteMode
    ? Math.min(12, variant === 'levelUp' ? 12 : 8)
    : variant === 'levelUp'
      ? 60
      : variant === 'quiz'
        ? 40
        : 12;

  const fire = confettiInstance ?? confettiMod;
  await fire({
    particleCount: count,
    spread: variant === 'levelUp' ? 78 : 54,
    startVelocity: opts.liteMode ? 22 : variant === 'levelUp' ? 38 : 28,
    origin: { y: 0.64 },
    colors: variant === 'levelUp' ? REWARD_COLORS_LEVEL : REWARD_COLORS_ALL,
    shapes: shapes.length ? shapes : undefined,
    disableForReducedMotion: true,
    scalar: 1.05,
  });
}

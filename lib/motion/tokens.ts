/**
 * Central motion tokens, easing curves, choreography presets, and adaptive quality tiers.
 * Strictly animates compositor-only properties (transform, opacity).
 */

import type { QualityTier } from '../engine/mastery';

export const MOTION_TOKENS = {
  duration: {
    fast: 0.15,
    medium: 0.32,
    scene: 0.72,
  },
  ease: {
    snap: [0.22, 1, 0.36, 1] as const,
    elastic: [0.34, 1.45, 0.64, 1] as const,
    smooth: [0.4, 0, 0.2, 1] as const,
  },
  staggerStep: 0.06,
} as const;

export interface QualityConfig {
  particleCount: number;
  canvasGridDensity: number;
  enable3DTilt: boolean;
  enableCustomCursor: boolean;
  targetFps: number;
}

export const QUALITY_PRESETS: Record<QualityTier, QualityConfig> = {
  high: {
    particleCount: 28,
    canvasGridDensity: 1,
    enable3DTilt: true,
    enableCustomCursor: true,
    targetFps: 60,
  },
  medium: {
    particleCount: 14,
    canvasGridDensity: 0.6,
    enable3DTilt: true,
    enableCustomCursor: false,
    targetFps: 45,
  },
  low: {
    particleCount: 0,
    canvasGridDensity: 0,
    enable3DTilt: false,
    enableCustomCursor: false,
    targetFps: 30,
  },
};

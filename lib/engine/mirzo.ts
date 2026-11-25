/**
 * MirzoController contract allowing replaceable rig implementations (SVG+GSAP or Rive).
 */

export type MirzoMood = 'idle' | 'think' | 'happy' | 'oops' | 'cheer';

export interface MirzoController {
  setMood: (mood: MirzoMood) => void;
  lookAt: (normX: number, normY: number) => void;
  say: (text: string) => void;
  celebrate: (level: number) => void;
}

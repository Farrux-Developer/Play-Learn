/**
 * Procedural Web Audio synthesizer.
 * Sound is OFF by default and only plays when explicitly enabled by the user.
 */

type SoundEvent = 'click' | 'success' | 'combo' | 'nudge' | 'victory';

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(
  ctx: AudioContext,
  freq: number,
  startOffset: number,
  duration: number,
  type: OscillatorType,
  gainPeak: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const startTime = ctx.currentTime + startOffset;

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(gainPeak, startTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

export function playGameSound(event: SoundEvent, enabled: boolean): void {
  if (!enabled) return;
  const ctx = getContext();
  if (!ctx) return;

  try {
    switch (event) {
      case 'click':
        playTone(ctx, 520, 0, 0.07, 'sine', 0.06);
        break;
      case 'success':
        playTone(ctx, 523.25, 0, 0.12, 'triangle', 0.09);
        playTone(ctx, 659.25, 0.08, 0.16, 'triangle', 0.09);
        break;
      case 'combo':
        playTone(ctx, 587.33, 0, 0.1, 'triangle', 0.09);
        playTone(ctx, 783.99, 0.07, 0.12, 'triangle', 0.1);
        playTone(ctx, 1046.5, 0.14, 0.18, 'sine', 0.09);
        break;
      case 'nudge':
        // Soft, supportive wooden tap rather than harsh buzzer
        playTone(ctx, 260, 0, 0.12, 'sine', 0.07);
        playTone(ctx, 220, 0.08, 0.14, 'sine', 0.05);
        break;
      case 'victory':
        playTone(ctx, 523.25, 0, 0.14, 'triangle', 0.09);
        playTone(ctx, 659.25, 0.1, 0.14, 'triangle', 0.09);
        playTone(ctx, 783.99, 0.2, 0.14, 'triangle', 0.09);
        playTone(ctx, 1046.5, 0.3, 0.32, 'sine', 0.11);
        break;
    }
  } catch {
    // Ignore audio context autoplay restrictions silently
  }
}

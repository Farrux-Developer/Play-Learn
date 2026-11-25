/**
 * Native WebAudio tactile workshop feedback (4 synthesized cues, gain <= 0.18,
 * zero external audio files, disabled by default unless soundEnabled === true).
 */

export type SoundCue = 'tap' | 'success' | 'levelUp' | 'softError';

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }
  return audioCtx;
}

function playTone(
  ctx: AudioContext,
  freq: number,
  durationSec: number,
  delaySec: number,
  type: OscillatorType,
  peakGain: number
) {
  const start = ctx.currentTime + delaySec;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.min(0.18, peakGain), start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + durationSec);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + durationSec + 0.02);
}

export function playWorkshopCue(cue: SoundCue, enabled: boolean): void {
  if (!enabled) return;
  const ctx = getCtx();
  if (!ctx) return;

  if (cue === 'tap') {
    playTone(ctx, 520, 0.055, 0, 'triangle', 0.1);
  } else if (cue === 'success') {
    playTone(ctx, 523.25, 0.11, 0, 'triangle', 0.14);
    playTone(ctx, 659.25, 0.16, 0.075, 'triangle', 0.15);
  } else if (cue === 'levelUp') {
    playTone(ctx, 523.25, 0.11, 0, 'triangle', 0.14);
    playTone(ctx, 659.25, 0.11, 0.09, 'triangle', 0.14);
    playTone(ctx, 783.99, 0.22, 0.18, 'sine', 0.17);
  } else {
    playTone(ctx, 240, 0.13, 0, 'sine', 0.11);
    playTone(ctx, 200, 0.14, 0.08, 'sine', 0.09);
  }
}

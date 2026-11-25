/**
 * Unified Motion Kernel (/lib/motion/core.ts):
 * - Typed event bus (xp:gain, level:up, answer:correct|wrong, quiz:complete,
 *   workshop:unlock, streak:ignite|break, ui:mode, machine:step, pointer:idle)
 * - Tier governor (high | mid | lite) using CPU cores, deviceMemory, Save-Data,
 *   prefers-reduced-motion, and rolling p75 frame time at startup + every 10s
 * - Shared pointer state (x, y, nx, ny, speed, hasHover, 8s idle detector)
 * - Visibility registry (IntersectionObserver + document.hidden)
 * - Single GSAP ticker shared with Three.js & Canvas 2D + slow-mo (x0.25) + FPS meter
 * - Deterministic mount(el, ctx) -> unmount() lifecycle manager
 */

import type { SurfaceMode, WorkshopId } from '@/lib/engine/store';
import { playWorkshopCue, type SoundCue } from '@/lib/engine/sound';

export type QualityTier = 'high' | 'mid' | 'lite';
export type TierOverride = 'auto' | QualityTier;

export interface MotionEventMap {
  'xp:gain': { amount: number; from?: string; sourceEl?: HTMLElement | null };
  'level:up': { level: number };
  'answer:correct': { target?: HTMLElement | null; xpDelta?: number };
  'answer:wrong': { target?: HTMLElement | null };
  'quiz:complete': { score: number; total?: number; unlockedWorkshop?: WorkshopId };
  'workshop:unlock': { id: WorkshopId };
  'streak:ignite': { streak: number };
  'streak:break': { previousStreak?: number };
  'ui:mode': { mode: SurfaceMode; x?: number; y?: number };
  'machine:step': { tick: number };
  'pointer:idle': { idleMs: number };
}

export type MotionEventKey = keyof MotionEventMap;
type Listener<K extends MotionEventKey> = (payload: MotionEventMap[K]) => void;

export interface PointerSnapshot {
  x: number;
  y: number;
  nx: number;
  ny: number;
  speed: number;
  hasHover: boolean;
  isTouch: boolean;
}

export interface MotionTelemetry {
  tier: QualityTier;
  tierOverride: TierOverride;
  reducedMotion: boolean;
  motionPaused: boolean;
  slowMo: boolean;
  fps: number;
  p75FrameMs: number;
  activeAnimations: number;
  subscriberCount: number;
}

export interface MountContext {
  signal: AbortSignal;
  tier: QualityTier;
  reducedMotion: boolean;
  onCleanup: (fn: () => void) => void;
}

export type TickerSubscriber = (timeSec: number, deltaMs: number) => void;

export function resolveHardwareTier(env: {
  cores?: number;
  deviceMemory?: number;
  hasFinePointer?: boolean;
  saveData?: boolean;
  reducedMotion?: boolean;
}): QualityTier {
  if (
    env.reducedMotion ||
    env.saveData ||
    (typeof env.deviceMemory === 'number' && env.deviceMemory <= 2) ||
    (typeof env.cores === 'number' && env.cores <= 4)
  ) {
    return 'lite';
  }
  if (
    env.hasFinePointer &&
    ((typeof env.cores === 'number' && env.cores >= 8) ||
      (typeof env.deviceMemory === 'number' && env.deviceMemory >= 8))
  ) {
    return 'high';
  }
  return 'mid';
}

export function evaluateP75Tier(current: QualityTier, p75Ms: number): QualityTier {
  if (p75Ms > 24) return 'lite';
  if (current === 'high' && p75Ms >= 18) return 'mid';
  return current;
}

class MotionCore {
  private listeners = new Map<MotionEventKey, Set<Listener<MotionEventKey>>>();
  private tickerSubs = new Set<TickerSubscriber>();
  private visibilityCbs = new Set<(visible: boolean) => void>();
  private telemetryListeners = new Set<() => void>();
  private mountedCleanups = new Map<string, () => void>();

  private tier: QualityTier = 'mid';
  private tierOverride: TierOverride = 'auto';
  private reducedMotion = false;
  private motionPaused = false;
  private soundEnabled = false;
  private slowMo = false;
  private started = false;
  private docHidden = false;

  private pointer: PointerSnapshot = {
    x: 720,
    y: 400,
    nx: 0,
    ny: 0,
    speed: 0,
    hasHover: true,
    isTouch: false,
  };

  private lastPointerTs = 0;
  private idleTimerId = 0;
  private p75IntervalId = 0;
  private rafId = 0;
  private gsapTickerFn: ((time: number, deltaTime: number) => void) | null = null;
  private gsapRef: typeof import('gsap').default | null = null;

  private frameDeltas: number[] = [];
  private fps = 60;
  private p75FrameMs = 16.6;
  private lastTickTs = 0;
  private rootAbort: AbortController | null = null;

  on<K extends MotionEventKey>(event: K, cb: Listener<K>): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(cb as Listener<MotionEventKey>);
    return () => {
      set?.delete(cb as Listener<MotionEventKey>);
    };
  }

  emit<K extends MotionEventKey>(event: K, payload: MotionEventMap[K]): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const cb of set) {
      try {
        (cb as Listener<K>)(payload);
      } catch {
        // Isolate subscriber errors from gameplay state
      }
    }
  }

  playCue(cue: SoundCue): void {
    playWorkshopCue(cue, this.soundEnabled);
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  setMotionPaused(paused: boolean): void {
    this.motionPaused = paused;
    this.syncDocumentAttrs();
    this.syncPlaybackRate();
    this.notifyTelemetry();
  }

  setTierOverride(override: TierOverride): void {
    this.tierOverride = override;
    if (override === 'auto') {
      this.tier = this.detectInitialTier();
    } else {
      this.tier = override;
    }
    this.syncDocumentAttrs();
    this.notifyTelemetry();
  }

  setSlowMo(enabled: boolean): void {
    this.slowMo = enabled;
    this.syncPlaybackRate();
    this.notifyTelemetry();
  }

  getPointer(): PointerSnapshot {
    return this.pointer;
  }

  getTelemetry(): MotionTelemetry {
    const activeWebAnims =
      typeof document !== 'undefined' && typeof document.getAnimations === 'function'
        ? document.getAnimations().filter((a) => a.playState === 'running').length
        : 0;
    const gsapAnims = this.gsapRef
      ? this.gsapRef.globalTimeline.getChildren(true, true, false).filter((t) => t.isActive()).length
      : 0;
    return {
      tier: this.tier,
      tierOverride: this.tierOverride,
      reducedMotion: this.reducedMotion,
      motionPaused: this.motionPaused,
      slowMo: this.slowMo,
      fps: this.fps,
      p75FrameMs: Math.round(this.p75FrameMs * 10) / 10,
      activeAnimations: activeWebAnims + gsapAnims + this.tickerSubs.size,
      subscriberCount: this.tickerSubs.size,
    };
  }

  subscribeTelemetry(cb: () => void): () => void {
    this.telemetryListeners.add(cb);
    return () => {
      this.telemetryListeners.delete(cb);
    };
  }

  registerTicker(fn: TickerSubscriber): () => void {
    this.tickerSubs.add(fn);
    this.notifyTelemetry();
    return () => {
      this.tickerSubs.delete(fn);
      this.notifyTelemetry();
    };
  }

  observeVisibility(el: HTMLElement, onChange: (visible: boolean) => void): () => void {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      onChange(true);
      return () => {};
    }
    let inView = true;
    const notify = () => onChange(inView && !this.docHidden);

    const obs = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? true;
        notify();
      },
      { threshold: 0.05 }
    );
    obs.observe(el);

    const docCb = (visible: boolean) => {
      if (!visible) onChange(false);
      else notify();
    };
    this.visibilityCbs.add(docCb);

    return () => {
      obs.disconnect();
      this.visibilityCbs.delete(docCb);
    };
  }

  mountModule(
    id: string,
    mountFn: (ctx: MountContext) => void | (() => void)
  ): () => void {
    const prev = this.mountedCleanups.get(id);
    if (prev) prev();

    const controller = new AbortController();
    const cleanups: Array<() => void> = [];
    const ctx: MountContext = {
      signal: controller.signal,
      tier: this.tier,
      reducedMotion: this.reducedMotion,
      onCleanup: (fn) => cleanups.push(fn),
    };

    const returned = mountFn(ctx);
    if (typeof returned === 'function') {
      cleanups.push(returned);
    }

    const unmount = () => {
      controller.abort();
      while (cleanups.length > 0) {
        const fn = cleanups.pop();
        try {
          fn?.();
        } catch {
          // Safe teardown
        }
      }
      if (this.mountedCleanups.get(id) === unmount) {
        this.mountedCleanups.delete(id);
      }
    };

    this.mountedCleanups.set(id, unmount);
    return unmount;
  }

  getMountedCount(): number {
    return this.mountedCleanups.size;
  }

  getListenerCount(): number {
    let count = 0;
    for (const set of this.listeners.values()) count += set.size;
    return count;
  }

  start(): () => void {
    if (typeof window === 'undefined') return () => {};
    if (this.started) return () => this.stop();
    this.started = true;
    this.rootAbort = new AbortController();
    const { signal } = this.rootAbort;

    this.reducedMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    this.tier = this.detectInitialTier();
    this.syncDocumentAttrs();

    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const onMq = (e: MediaQueryListEvent) => {
      this.reducedMotion = e.matches;
      if (this.tierOverride === 'auto') {
        this.tier = e.matches ? 'lite' : this.detectInitialTier();
      }
      this.syncDocumentAttrs();
      this.notifyTelemetry();
    };
    mq?.addEventListener?.('change', onMq, { signal });

    const resetIdle = () => {
      if (this.idleTimerId) window.clearTimeout(this.idleTimerId);
      if (this.reducedMotion || this.motionPaused || this.tier === 'lite') return;
      this.idleTimerId = window.setTimeout(() => {
        if (!this.docHidden && !this.motionPaused && !this.reducedMotion) {
          this.emit('pointer:idle', { idleMs: 8000 });
        }
      }, 8000);
    };

    const onPointerMove = (e: PointerEvent) => {
      const isTouch = e.pointerType === 'touch';
      const now = performance.now();
      const dt = Math.max(8, now - (this.lastPointerTs || now));
      const dist = Math.hypot(e.clientX - this.pointer.x, e.clientY - this.pointer.y);
      const speed = Math.min(4, dist / dt);

      this.pointer = {
        x: e.clientX,
        y: e.clientY,
        nx: (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1,
        ny: (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1,
        speed,
        hasHover: !isTouch && (window.matchMedia?.('(hover: hover)').matches ?? true),
        isTouch,
      };
      this.lastPointerTs = now;

      if (!isTouch && this.tier !== 'lite' && !this.motionPaused) {
        document.documentElement.style.setProperty('--mx', `${e.clientX}px`);
        document.documentElement.style.setProperty('--my', `${e.clientY}px`);
      }
      resetIdle();
    };

    const onPointerDown = (e: PointerEvent) => {
      this.pointer.x = e.clientX;
      this.pointer.y = e.clientY;
      this.pointer.nx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      this.pointer.ny = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
      this.pointer.isTouch = e.pointerType === 'touch';
      resetIdle();
    };

    const onVisibility = () => {
      this.docHidden = document.hidden;
      for (const cb of this.visibilityCbs) cb(!this.docHidden);
      if (this.docHidden && this.idleTimerId) {
        window.clearTimeout(this.idleTimerId);
      } else {
        resetIdle();
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true, signal });
    window.addEventListener('pointerdown', onPointerDown, { passive: true, signal });
    window.addEventListener('keydown', resetIdle, { passive: true, signal });
    document.addEventListener('visibilitychange', onVisibility, { signal });
    resetIdle();

    void this.attachGsapTicker();

    // Re-evaluate frame p75 every 10s (instant downgrade, never silent upgrade)
    this.p75IntervalId = window.setInterval(() => {
      this.evaluateFrameBudget();
      this.notifyTelemetry();
    }, 10000);

    return () => this.stop();
  }

  stop(): void {
    if (!this.started) return;
    this.started = false;
    this.rootAbort?.abort();
    this.rootAbort = null;
    if (this.idleTimerId) window.clearTimeout(this.idleTimerId);
    if (this.p75IntervalId) window.clearInterval(this.p75IntervalId);
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.gsapRef && this.gsapTickerFn) {
      this.gsapRef.ticker.remove(this.gsapTickerFn);
    }
    this.gsapTickerFn = null;
  }

  private detectInitialTier(): QualityTier {
    if (typeof window === 'undefined') return 'mid';
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };
    return resolveHardwareTier({
      cores: navigator.hardwareConcurrency,
      deviceMemory: nav.deviceMemory,
      hasFinePointer: window.matchMedia?.('(pointer: fine)').matches ?? true,
      saveData: Boolean(nav.connection?.saveData),
      reducedMotion: this.reducedMotion,
    });
  }

  private async attachGsapTicker(): Promise<void> {
    this.lastTickTs = performance.now();
    // Fallback rAF while GSAP loads, handed off cleanly once GSAP resolves
    const localStep = (now: number) => {
      if (!this.started || this.gsapTickerFn) return;
      const dt = Math.min(64, Math.max(4, now - this.lastTickTs));
      this.lastTickTs = now;
      this.runTickerFrame(now / 1000, dt);
      this.rafId = requestAnimationFrame(localStep);
    };
    this.rafId = requestAnimationFrame(localStep);

    try {
      const mod = await import('gsap');
      if (!this.started) return;
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = 0;
      }
      this.gsapRef = mod.default;
      this.syncPlaybackRate();
      this.gsapTickerFn = (time: number, deltaTime: number) => {
        this.runTickerFrame(time, Math.min(64, deltaTime));
      };
      this.gsapRef.ticker.add(this.gsapTickerFn);
    } catch {
      // Keep local rAF ticker
    }
  }

  private runTickerFrame(timeSec: number, deltaMs: number): void {
    if (this.docHidden) return;
    if (deltaMs > 0 && deltaMs < 120) {
      this.frameDeltas.push(deltaMs);
      if (this.frameDeltas.length > 60) {
        this.frameDeltas.shift();
      }
      if (this.frameDeltas.length === 60) {
        const sorted = [...this.frameDeltas].sort((a, b) => a - b);
        this.p75FrameMs = sorted[45] ?? 16.6;
        this.fps = Math.min(120, Math.max(1, Math.round(1000 / Math.max(1, this.p75FrameMs))));
        this.evaluateFrameBudget();
      }
    }
    if (this.motionPaused) return;
    const scaledDelta = this.slowMo ? deltaMs * 0.25 : deltaMs;
    for (const fn of this.tickerSubs) {
      try {
        fn(timeSec, scaledDelta);
      } catch {
        // Isolate subscriber errors
      }
    }
  }

  private evaluateFrameBudget(): void {
    if (this.tierOverride !== 'auto' || this.frameDeltas.length < 30) return;
    const sorted = [...this.frameDeltas].sort((a, b) => a - b);
    const p75 = sorted[Math.floor(sorted.length * 0.75)] ?? 16.6;
    const next = evaluateP75Tier(this.tier, p75);
    // Downgrade immediately if slower than budget; never upgrade without reload
    const rank: Record<QualityTier, number> = { lite: 0, mid: 1, high: 2 };
    if (rank[next] < rank[this.tier]) {
      this.tier = next;
      this.syncDocumentAttrs();
      this.notifyTelemetry();
    }
  }

  private syncDocumentAttrs(): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-tier', this.tier);
    root.setAttribute('data-lite', String(this.tier === 'lite'));
    root.setAttribute('data-motion-paused', String(this.motionPaused));
  }

  private syncPlaybackRate(): void {
    const rate = this.motionPaused ? 0 : this.slowMo ? 0.25 : 1;
    if (this.gsapRef) {
      this.gsapRef.globalTimeline.timeScale(rate);
    }
    if (typeof document !== 'undefined' && typeof document.getAnimations === 'function') {
      for (const anim of document.getAnimations()) {
        try {
          if (this.motionPaused) anim.pause();
          else {
            anim.playbackRate = rate;
            if (anim.playState === 'paused') anim.play();
          }
        } catch {
          // Ignore immutable CSS animations
        }
      }
    }
  }

  private notifyTelemetry(): void {
    for (const cb of this.telemetryListeners) cb();
  }
}

export const motionCore = new MotionCore();

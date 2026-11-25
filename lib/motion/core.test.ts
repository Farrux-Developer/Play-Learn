import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateP75Tier,
  motionCore,
  resolveHardwareTier,
} from './core.ts';

test('resolveHardwareTier respects high, mid, and lite thresholds', () => {
  assert.equal(
    resolveHardwareTier({ cores: 8, deviceMemory: 8, hasFinePointer: true }),
    'high'
  );
  assert.equal(
    resolveHardwareTier({ cores: 6, deviceMemory: 4, hasFinePointer: true }),
    'mid'
  );
  assert.equal(
    resolveHardwareTier({ cores: 4, deviceMemory: 8, hasFinePointer: true }),
    'lite'
  );
  assert.equal(
    resolveHardwareTier({ cores: 8, deviceMemory: 8, saveData: true }),
    'lite'
  );
  assert.equal(
    resolveHardwareTier({ cores: 8, deviceMemory: 8, reducedMotion: true }),
    'lite'
  );
});

test('evaluateP75Tier downgrades immediately on slow frames', () => {
  assert.equal(evaluateP75Tier('high', 14), 'high');
  assert.equal(evaluateP75Tier('high', 20), 'mid');
  assert.equal(evaluateP75Tier('high', 26), 'lite');
  assert.equal(evaluateP75Tier('mid', 26), 'lite');
});

test('typed event bus delivers and unsubscribes cleanly', () => {
  const seen: number[] = [];
  const off = motionCore.on('xp:gain', ({ amount }) => seen.push(amount));
  motionCore.emit('xp:gain', { amount: 20, from: 'darslar' });
  motionCore.emit('xp:gain', { amount: 25, from: 'oyinlar' });
  off();
  motionCore.emit('xp:gain', { amount: 10, from: 'after-off' });
  assert.deepEqual(seen, [20, 25]);
});

test('20x mount/unmount leaves zero leaked listeners, ticker subs, or modules', () => {
  const baseListeners = motionCore.getListenerCount();
  const baseSubs = motionCore.getTelemetry().subscriberCount;
  const baseMounted = motionCore.getMountedCount();

  for (let i = 0; i < 20; i += 1) {
    let cleaned = false;
    const unmount = motionCore.mountModule('leak-test-module', (ctx) => {
      const offBus = motionCore.on('machine:step', () => {});
      const offTick = motionCore.registerTicker(() => {});
      ctx.onCleanup(() => {
        offBus();
        offTick();
        cleaned = true;
      });
    });
    assert.equal(motionCore.getMountedCount(), baseMounted + 1);
    unmount();
    assert.equal(cleaned, true);
  }

  assert.equal(motionCore.getMountedCount(), baseMounted);
  assert.equal(motionCore.getListenerCount(), baseListeners);
  assert.equal(motionCore.getTelemetry().subscriberCount, baseSubs);
});

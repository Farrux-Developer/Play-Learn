import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyXpReward,
  computeUnlockedWorkshops,
  evaluateDiagnostic,
} from './progression';
import { createDefaultState, getLevelInfo } from './store';

test('getLevelInfo computes rollover from 119 XP to 120 XP accurately', () => {
  const before = getLevelInfo(119);
  assert.equal(before.level, 1);
  assert.equal(before.inLevelXp, 119);

  const after = getLevelInfo(120);
  assert.equal(after.level, 2);
  assert.equal(after.inLevelXp, 0);
});

test('computeUnlockedWorkshops unlocks mantiq at 60 XP and sikllar at 120 XP', () => {
  assert.deepEqual(computeUnlockedWorkshops(0), ['algoritmlar']);
  assert.deepEqual(computeUnlockedWorkshops(59), ['algoritmlar']);
  assert.deepEqual(computeUnlockedWorkshops(60), ['algoritmlar', 'mantiq']);
  assert.deepEqual(computeUnlockedWorkshops(120), ['algoritmlar', 'mantiq', 'sikllar']);
});

test('applyXpReward deduplicates lessons/tasks and detects level-up and newly unlocked workshops', () => {
  const initial = createDefaultState();
  const first = applyXpReward(initial, 50, {
    markLessonId: 'L1',
    incrementStreak: true,
  });

  assert.equal(first.nextState.xp, 65);
  assert.equal(first.nextState.streak, 1);
  assert.equal(first.leveledUp, false);
  assert.deepEqual(first.newlyUnlockedWorkshops, ['mantiq']);
  assert.deepEqual(first.nextState.completedLessons, ['L1']);

  const second = applyXpReward(first.nextState, 60, {
    markLessonId: 'L1',
    markTaskId: 'alg-1',
  });

  assert.equal(second.nextState.xp, 125);
  assert.equal(second.leveledUp, true);
  assert.equal(second.previousLevel, 1);
  assert.equal(second.newLevel, 2);
  assert.deepEqual(second.newlyUnlockedWorkshops, ['sikllar']);
  assert.deepEqual(second.nextState.completedLessons, ['L1']);
  assert.deepEqual(second.nextState.solvedTasks, ['alg-1']);
});

test('evaluateDiagnostic scores answers and recommends appropriate workshop', () => {
  const low = evaluateDiagnostic([0, 2, 0]);
  assert.equal(low.correctCount, 0);
  assert.equal(low.xpEarned, 10);
  assert.equal(low.recommendedWorkshop, 'algoritmlar');

  const mid = evaluateDiagnostic([1, 0, 0]);
  assert.equal(mid.correctCount, 2);
  assert.equal(mid.xpEarned, 20);
  assert.equal(mid.recommendedWorkshop, 'mantiq');

  const high = evaluateDiagnostic([1, 0, 1]);
  assert.equal(high.correctCount, 3);
  assert.equal(high.xpEarned, 25);
  assert.equal(high.recommendedWorkshop, 'sikllar');
});

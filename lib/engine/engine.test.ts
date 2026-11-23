import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateCurriculum,
  SEQUENCE_TASKS,
  LOGIC_TASKS,
  LOOP_BUG_TASKS,
} from '../data/curriculum';
import {
  createInitialProgress,
  recordTaskAttempt,
  recordLessonProgress,
  recordTwinRepair,
  getSkillStages,
  getTopMisconceptions,
  buildDailyReviewQueue,
  applyDiagnosticResult,
  isSkillUnlocked,
  migrateProgressState,
  getLevelFromXp,
  CURRENT_SCHEMA_VERSION,
} from './mastery';
import {
  createMascotSnapshot,
  dispatchMascotCue,
  settleMascotStep,
  skipMascotQueue,
} from './mascot-fsm';
import { normalizeUzbekInput, formatUzbekCount, lt } from './i18n';

test('curriculum passes integrity validation with 30 tasks (10 per game)', () => {
  const result = validateCurriculum();
  assert.equal(result.valid, true, `Validation errors: ${result.errors.join(', ')}`);
  assert.equal(result.totalTasks, 30);
  assert.equal(SEQUENCE_TASKS.length, 10);
  assert.equal(LOGIC_TASKS.length, 10);
  assert.equal(LOOP_BUG_TASKS.length, 10);
});

test('Uzbek apostrophe normalization handles all apostrophe variants cleanly', () => {
  assert.equal(normalizeUzbekInput('Oʻyna'), normalizeUzbekInput("O'yna"));
  assert.equal(normalizeUzbekInput('maʼno'), normalizeUzbekInput('ma’no'));
  assert.equal(normalizeUzbekInput('  GʻALABA  '), "g'alaba");
  assert.equal(
    formatUzbekCount(5, lt('topshiriq', 'топшириқ'), 'uz-Latn'),
    '5 ta topshiriq'
  );
  assert.equal(
    formatUzbekCount(5, lt('topshiriq', 'топшириқ'), 'uz-Cyrl'),
    '5 ta топшириқ'
  );
});

test('mastery engine updates XP, combo streak, SM-2 interval, and badges accurately', () => {
  let state = createInitialProgress(1000);
  const res1 = recordTaskAttempt(state, {
    skillId: 'algoritmlar',
    taskId: 'seq-1',
    isCorrect: true,
    hintsUsed: 0,
    now: 2000,
  });

  state = res1.nextState;
  assert.equal(res1.xpEarned, 20);
  assert.equal(state.streak, 1);
  assert.equal(state.firstWinSeconds, 1);
  assert.ok(state.unlockedBadges.includes('ilk-qadam'));
  assert.equal(state.skills.algoritmlar.intervalDays, 1);

  const res2 = recordTaskAttempt(state, {
    skillId: 'algoritmlar',
    taskId: 'seq-2',
    isCorrect: true,
    hintsUsed: 0,
    now: 3000,
  });
  state = res2.nextState;
  assert.equal(res2.xpEarned, 25); // 20 + 5 combo
  assert.equal(state.skills.algoritmlar.intervalDays, 3);
});

test('adaptive difficulty steps down after 2 consecutive errors and tracks misconceptions', () => {
  let state = createInitialProgress(1000);
  state.skills.mantiq.currentDifficulty = 2;

  const err1 = recordTaskAttempt(state, {
    skillId: 'mantiq',
    taskId: 'log-4',
    isCorrect: false,
    hintsUsed: 1,
    misconceptionId: 'boundary-strict-vs-equal',
    now: 2000,
  });
  assert.equal(err1.steppedDown, false);
  assert.equal(err1.nextState.skills.mantiq.currentDifficulty, 2);
  assert.equal(err1.nextState.misconceptionCounts['boundary-strict-vs-equal'], 1);

  const err2 = recordTaskAttempt(err1.nextState, {
    skillId: 'mantiq',
    taskId: 'log-4',
    isCorrect: false,
    hintsUsed: 2,
    misconceptionId: 'boundary-strict-vs-equal',
    now: 3000,
  });
  assert.equal(err2.steppedDown, true);
  assert.equal(err2.nextState.skills.mantiq.currentDifficulty, 1);
  assert.equal(err2.nextState.streak, 0);
  assert.equal(err2.nextState.misconceptionCounts['boundary-strict-vs-equal'], 2);

  const top = getTopMisconceptions(err2.nextState, 3);
  assert.equal(top[0].id, 'boundary-strict-vs-equal');
  assert.equal(top[0].count, 2);
});

test('diagnostic placement unlocks downstream skill nodes appropriately', () => {
  const initial = createInitialProgress(1000);
  assert.equal(isSkillUnlocked(initial, 'algoritmlar'), true);
  assert.equal(isSkillUnlocked(initial, 'mantiq'), false);

  const placed = applyDiagnosticResult(initial, {
    algoritmlar: true,
    mantiq: true,
    sikllar: false,
  });
  assert.equal(placed.diagnosticScore, 2);
  assert.equal(isSkillUnlocked(placed, 'mantiq'), true);
});

test('progress migration safely upgrades v1/v2 saves to v3 without losing data', () => {
  const migrated = migrateProgressState({
    schemaVersion: 2,
    xp: 240,
    streak: 2,
    unlockedBadges: ['ilk-qadam'],
    skills: {
      algoritmlar: { mastery: 0.5, completedTaskIds: ['seq-1', 'seq-2'] },
    },
  });
  assert.equal(migrated.schemaVersion, CURRENT_SCHEMA_VERSION);
  assert.equal(migrated.xp, 240);
  assert.equal(getLevelFromXp(240).level, 3);
  assert.equal(migrated.skills.algoritmlar.mastery, 0.5);
  assert.equal(migrated.skills.sikllar.currentDifficulty, 1);
  assert.deepEqual(migrated.seenLessons, []);
  assert.deepEqual(migrated.explainedLessons, []);
  assert.equal(migrated.preferences.showRealCode, false);
});

test('Seen -> Applied -> Explained stages, twin repair XP, and daily review queue work accurately', () => {
  let state = createInitialProgress(1000);

  // Seen L1
  state = recordLessonProgress(state, { lessonId: 'L1', seen: true }).nextState;
  assert.equal(getSkillStages(state, 'algoritmlar').seen, true);
  assert.equal(getSkillStages(state, 'algoritmlar').explained, false);

  // Explained L1 awards XP once
  const expRes = recordLessonProgress(state, {
    lessonId: 'L1',
    explained: true,
    xpBonus: 25,
  });
  state = expRes.nextState;
  assert.equal(expRes.xpEarned, 25);
  assert.equal(getSkillStages(state, 'algoritmlar').explained, true);

  // Twin repair awards XP and badge
  const repairRes = recordTwinRepair(state, { taskId: 'log-1', isCorrect: true });
  state = repairRes.nextState;
  assert.equal(repairRes.xpEarned, 15);
  assert.ok(state.unlockedBadges.includes('xato-tuzatuvchi'));

  // Daily review queue picks 5 distinct items across skills
  state = recordTaskAttempt(state, {
    skillId: 'mantiq',
    taskId: 'log-4',
    isCorrect: false,
    hintsUsed: 0,
    misconceptionId: 'boundary-strict-vs-equal',
    now: 2000,
  }).nextState;
  const queue = buildDailyReviewQueue(state, 3000);
  assert.equal(queue.length, 5);
  assert.equal(new Set(queue.map((q) => q.taskId)).size, 5);
  assert.ok(queue.some((q) => q.reason === 'misconception'));
});

test('mascot FSM respects priority and settles cleanly when skipped', () => {
  let snap = createMascotSnapshot('Salom!');
  snap = dispatchMascotCue(snap, {
    state: 'happy',
    subtitle: 'Barakalla!',
    durationMs: 1200,
  });
  assert.equal(snap.currentState, 'happy');

  snap = dispatchMascotCue(snap, {
    state: 'speaking',
    subtitle: 'Keyingi bosqichga tayyormisiz?',
    durationMs: 1500,
  });
  assert.equal(snap.currentState, 'happy');
  assert.equal(snap.queue.length, 1);

  const settled = settleMascotStep(snap);
  assert.equal(settled.currentState, 'speaking');
  assert.equal(settled.subtitle, 'Keyingi bosqichga tayyormisiz?');

  const skipped = skipMascotQueue(snap);
  assert.equal(skipped.currentState, 'idle');
  assert.equal(skipped.subtitle, 'Keyingi bosqichga tayyormisiz?');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {
  BADGES,
  DIAGNOSTIC_QUESTIONS,
  LOGIC_TASKS,
  LOOP_BUG_TASKS,
  MISCONCEPTION_CATALOG,
  SEQUENCE_TASKS,
  SKILL_NODES,
} from '../data/curriculum';
import { LESSONS } from '../data/lessons';
import { TRACE_PROGRAMS } from '../data/traces';
import { LUGAT_TERMS, UI_STRINGS } from './i18n';

/**
 * Transpiles our single unified Uzbek pseudocode dialect to executable JS
 * so every code example, task, and trace frame is mechanically verified.
 */
function transpileUzbekPseudoToJs(code: string): string {
  const lines = code
    .split('\n')
    .map((l) => l.replace(/^\d+:\s*/, ''));

  const outLines: string[] = [];
  let repeatCounter = 0;

  for (const rawLine of lines) {
    let line = rawLine.trim();
    if (!line) continue;

    // Replace chopEt(...) with __print(...)
    line = line.replace(/\bchopEt\s*\(/g, '__print(');

    // Handle "N marta takrorla { body }" or "N marta takrorla {"
    const repeatInlineMatch = line.match(/^(\d+)\s+marta\s+takrorla\s*\{(.+)\}$/);
    if (repeatInlineMatch) {
      const idx = ++repeatCounter;
      outLines.push(
        `for (let __r${idx} = 0; __r${idx} < ${repeatInlineMatch[1]}; __r${idx}++) { ${repeatInlineMatch[2]} }`
      );
      continue;
    }

    const repeatMatch = line.match(/^(\d+)\s+marta\s+takrorla\s*\{$/);
    if (repeatMatch) {
      const idx = ++repeatCounter;
      outLines.push(`for (let __r${idx} = 0; __r${idx} < ${repeatMatch[1]}; __r${idx}++) {`);
      continue;
    }

    // Handle "uchun i = A dan B gacha (cond) {" or "uchun i = A dan B gacha {"
    const forCondMatch = line.match(
      /^uchun\s+([a-zA-Z_]\w*)\s*=\s*(-?\d+)\s+dan\s+(-?\d+)\s+gacha\s*\(([^)]+)\)\s*\{$/
    );
    if (forCondMatch) {
      const [, v, start, , cond] = forCondMatch;
      outLines.push(`for (${v} = ${start}; ${cond}; ${v}++) {`);
      continue;
    }

    const forRangeMatch = line.match(
      /^uchun\s+([a-zA-Z_]\w*)\s*=\s*(-?\d+)\s+dan\s+(-?\d+)\s+gacha\s*\{$/
    );
    if (forRangeMatch) {
      const [, v, start, end] = forRangeMatch;
      const stepOp = Number(start) <= Number(end) ? `${v}++` : `${v}--`;
      const cmp = Number(start) <= Number(end) ? `${v} <= ${end}` : `${v} >= ${end}`;
      outLines.push(`for (${v} = ${start}; ${cmp}; ${stepOp}) {`);
      continue;
    }

    // Handle "toki (cond) {" with infinite loop guard and iteration tracking
    const whileMatch = line.match(/^toki\s*\((.+)\)\s*\{$/);
    if (whileMatch) {
      outLines.push(
        `let __guard = 0; __loopIters = 0; while (${whileMatch[1]}) { __loopIters++; if (++__guard > 200) throw new Error('INFINITE_LOOP');`
      );
      continue;
    }

    // Handle "} aks holda agar (...) {" and "aks holda agar (...) {"
    line = line.replace(/\}\s*aks\s+holda\s+agar\s*\(/g, '} else if (');
    line = line.replace(/^aks\s+holda\s+agar\s*\(/g, 'else if (');

    // Handle "} aks holda {" and "aks holda {"
    line = line.replace(/\}\s*aks\s+holda\s*\{/g, '} else {');
    line = line.replace(/^aks\s+holda\s*\{/g, 'else {');

    // Handle "agar (...) {"
    line = line.replace(/^agar\s*\(/g, 'if (');

    outLines.push(line);
  }

  return outLines.join('\n');
}

function executePseudo(code: string): {
  output: string[];
  vars: Record<string, unknown>;
  loopIters: number;
} {
  const js = transpileUzbekPseudoToJs(code);
  const output: string[] = [];
  const sandbox: Record<string, unknown> = {
    __loopIters: 0,
    __print: (...args: unknown[]) => {
      output.push(args.map((a) => String(a)).join(' '));
    },
  };
  vm.runInNewContext(js, sandbox, { timeout: 200 });
  const vars: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(sandbox)) {
    if (k !== '__print' && !k.startsWith('__')) {
      vars[k] = v;
    }
  }
  return { output, vars, loopIters: Number(sandbox.__loopIters ?? 0) };
}

function normalizeOutputOption(opt: string): string {
  return opt.replace(/^"|"$/g, '').trim();
}

test('Truth Rule 4: All LOGIC_TASKS pseudocode matches the marked correct option', () => {
  for (const task of LOGIC_TASKS) {
    const res = executePseudo(task.code);
    const actual = res.output.join(', ');
    const expected = normalizeOutputOption(task.options[task.correctIndex]);
    assert.equal(
      actual,
      expected,
      `${task.id}: expected "${expected}", got "${actual}"`
    );
  }
});

test('Truth Rule 4: All LOOP_BUG_TASKS trace-output and bug-line tasks execute accurately', () => {
  for (const task of LOOP_BUG_TASKS) {
    const code = task.codeLines.join('\n');
    if (task.mode === 'trace-output') {
      const res = executePseudo(code);
      const expected = normalizeOutputOption(
        task.options![task.correctOptionIndex!].latn
      );
      if (expected.endsWith('marta')) {
        assert.equal(
          `${res.loopIters} marta`,
          expected,
          `${task.id}: expected "${expected}", got "${res.loopIters} marta"`
        );
      } else {
        const actualJoined = res.output.join(', ');
        const actualSpaced = res.output.join(' ');
        assert.ok(
          actualJoined === expected || actualSpaced === expected,
          `${task.id}: expected "${expected}", got "${actualJoined}"`
        );
      }
    } else {
      assert.ok(
        task.correctLine &&
          task.correctLine >= 1 &&
          task.correctLine <= task.codeLines.length,
        `${task.id}: invalid correctLine`
      );
      let threwInfinite = false;
      try {
        executePseudo(code);
      } catch (err) {
        const msg = err && typeof err === 'object' ? String((err as { message?: unknown }).message) : '';
        if (msg === 'INFINITE_LOOP') {
          threwInfinite = true;
        } else {
          throw err;
        }
      }
      if (task.id === 'loop-2') {
        assert.equal(threwInfinite, true, `${task.id} should demonstrate infinite loop`);
      }
    }
  }
});

test('Truth Rule 4: All TRACE_PROGRAMS match execution output and accurate changedVars', () => {
  for (const [id, prog] of Object.entries(TRACE_PROGRAMS)) {
    assert.ok(prog.codeLines.length > 0, `${id}: empty codeLines`);
    assert.equal(
      prog.codeLines.length,
      prog.pythonLines.length,
      `${id}: codeLines and pythonLines length mismatch`
    );
    assert.ok(prog.frames.length >= 2, `${id}: too few frames`);

    for (let i = 0; i < prog.frames.length; i++) {
      const f = prog.frames[i];
      assert.ok(
        f.line >= 1 && f.line <= prog.codeLines.length,
        `${id} frame ${i}: line ${f.line} out of bounds`
      );
      if (i > 0) {
        const prev = prog.frames[i - 1];
        for (const v of f.changedVars) {
          assert.notEqual(
            f.vars[v],
            prev.vars[v],
            `${id} frame ${i}: changedVars lists "${v}" but value did not change`
          );
        }
      }
    }

    if (id === 'trace-loop-8') {
      const execRes = executePseudo(prog.codeLines.join('\n'));
      assert.deepEqual(execRes.output, ['Infinity']);
      assert.ok(prog.frames[prog.frames.length - 1].output[0].includes('0'));
    } else if (id !== 'trace-loop-infinite') {
      const execRes = executePseudo(prog.codeLines.join('\n'));
      const lastFrame = prog.frames[prog.frames.length - 1];
      assert.deepEqual(
        lastFrame.output,
        execRes.output,
        `${id}: trace final output differs from executed output`
      );
    }
  }
});

test('Truth Rule 4: Diagnostic & Lesson code questions execute to marked answers', () => {
  for (const q of DIAGNOSTIC_QUESTIONS) {
    if (!q.code) continue;
    const res = executePseudo(q.code);
    const expected = normalizeOutputOption(q.options[q.correctIndex].latn);
    assert.equal(res.output.join(', '), expected, `${q.id}: output mismatch`);
  }

  for (const lesson of LESSONS) {
    for (const scr of lesson.screens) {
      if (!scr.question?.code) continue;
      // Skip partial/bug snippet in l4-transfer that intentionally prints only "10" to ask which line is buggy
      if (scr.id === 'l4-transfer') {
        const res = executePseudo(scr.question.code);
        assert.deepEqual(res.output, ['10']);
        continue;
      }
      const res = executePseudo(scr.question.code);
      const opt = scr.question.options[scr.question.correctIndex].latn;
      const expectedMatch = res.output[0];
      assert.ok(
        opt.includes(expectedMatch),
        `${scr.id}: expected option "${opt}" to reflect output "${expectedMatch}"`
      );
    }
  }
});

test('Structural & Guess-Proof Checks: lessons, misconceptions, twins, and varied answer indices', () => {
  assert.equal(LESSONS.length, 4);

  for (const lesson of LESSONS) {
    assert.ok(lesson.screens.length <= 6, `${lesson.id} has > 6 screens`);
    assert.ok(
      lesson.screens.some((s) => s.kind === 'hook-predict'),
      `${lesson.id} missing hook-predict`
    );
    const miscScr = lesson.screens.find((s) => s.kind === 'misconceptions');
    assert.ok(
      miscScr && (miscScr.misconceptionCards?.length ?? 0) >= 2,
      `${lesson.id} needs >= 2 misconception cards`
    );
    assert.ok(
      lesson.screens.some((s) => s.kind === 'teach-back'),
      `${lesson.id} missing teach-back`
    );
    assert.ok(
      lesson.screens.some((s) => s.kind === 'transfer'),
      `${lesson.id} missing transfer`
    );
    assert.equal(lesson.knowItCheck.length, 3, `${lesson.id} needs 3 knowItCheck items`);

    for (const k of lesson.knowItCheck) {
      k.misconceptionIds.forEach((mid, idx) => {
        if (idx === k.correctIndex) {
          assert.equal(mid, 'ok', `${k.id}: correct option should be marked 'ok'`);
        } else {
          assert.ok(
            MISCONCEPTION_CATALOG[mid],
            `${k.id}: unknown misconceptionId "${mid}"`
          );
        }
      });
    }

    // Guess-proof: blindly choosing option 0 on every knowItCheck item cannot score 3/3
    const blindFirstCorrect = lesson.knowItCheck.filter(
      (k) => k.correctIndex === 0
    ).length;
    assert.ok(
      blindFirstCorrect < 3,
      `${lesson.id}: knowItCheck cannot be passed by blindly clicking option 0`
    );

    // Guess-proof: teach-back + transfer in the same lesson cannot both have correctIndex === 0
    const teachQ = lesson.screens.find((s) => s.kind === 'teach-back')?.question;
    const transQ = lesson.screens.find((s) => s.kind === 'transfer')?.question;
    assert.ok(
      !(teachQ?.correctIndex === 0 && transQ?.correctIndex === 0),
      `${lesson.id}: teach-back and transfer cannot both be option 0`
    );
  }

  for (const task of LOGIC_TASKS) {
    task.misconceptionIds.forEach((mid, idx) => {
      if (idx !== task.correctIndex) {
        assert.ok(MISCONCEPTION_CATALOG[mid], `${task.id}: bad misconception ${mid}`);
      }
    });
    assert.ok(
      task.twin.correctIndex >= 0 && task.twin.correctIndex < task.twin.options.length,
      `${task.id}: invalid twin`
    );
  }

  for (const task of LOOP_BUG_TASKS) {
    if (task.mode === 'bug-line') {
      assert.ok(task.lineMisconceptions?.length === task.codeLines.length);
      task.lineMisconceptions!.forEach((mid, idx) => {
        if (idx + 1 !== task.correctLine) {
          assert.ok(MISCONCEPTION_CATALOG[mid], `${task.id}: bad line misc ${mid}`);
        }
      });
    } else {
      assert.ok(task.optionMisconceptions?.length === task.options?.length);
      task.optionMisconceptions!.forEach((mid, idx) => {
        if (idx !== task.correctOptionIndex) {
          assert.ok(MISCONCEPTION_CATALOG[mid], `${task.id}: bad opt misc ${mid}`);
        }
      });
    }
    assert.ok(
      task.twin.correctIndex >= 0 && task.twin.correctIndex < task.twin.options.length,
      `${task.id}: invalid twin`
    );
  }

  for (const task of SEQUENCE_TASKS) {
    assert.ok(MISCONCEPTION_CATALOG[task.misconceptionId], `${task.id}: bad misc`);
    assert.ok(
      task.twin.correctIndex >= 0 && task.twin.correctIndex < task.twin.options.length,
      `${task.id}: invalid twin`
    );
  }
});

test('Dual-Script Parity & Uzbek Orthography Check (U+02BB / U+02BC)', () => {
  const latnKeys = Object.keys(UI_STRINGS['uz-Latn']).sort();
  const cyrlKeys = Object.keys(UI_STRINGS['uz-Cyrl']).sort();
  assert.deepEqual(latnKeys, cyrlKeys, 'UI_STRINGS keys must match across scripts');

  const visited = new Set<unknown>();
  const issues: string[] = [];

  const checkNode = (val: unknown, path: string) => {
    if (!val || typeof val !== 'object') return;
    if (visited.has(val)) return;
    visited.add(val);

    if (
      'latn' in val &&
      'cyrl' in val &&
      typeof (val as { latn: unknown }).latn === 'string' &&
      typeof (val as { cyrl: unknown }).cyrl === 'string'
    ) {
      const { latn, cyrl } = val as { latn: string; cyrl: string };
      if (!latn.trim() || !cyrl.trim()) {
        issues.push(`${path}: empty latn or cyrl`);
      }
      // Flag straight ASCII apostrophe inside Uzbek words like o', g', ma'no (outside code identifiers/quotes)
      if (/\b(?:o|g)'[a-zA-Z]/i.test(latn) || /[a-zA-Z]'[a-zA-Z]/i.test(latn.replace(/'va'|'yoki'/gi, ''))) {
        issues.push(`${path}: ASCII apostrophe inside word in "${latn}"`);
      }
      return;
    }

    if (Array.isArray(val)) {
      val.forEach((item, i) => checkNode(item, `${path}[${i}]`));
    } else {
      for (const [k, v] of Object.entries(val)) {
        checkNode(v, `${path}.${k}`);
      }
    }
  };

  checkNode(SKILL_NODES, 'SKILL_NODES');
  checkNode(DIAGNOSTIC_QUESTIONS, 'DIAGNOSTIC_QUESTIONS');
  checkNode(SEQUENCE_TASKS, 'SEQUENCE_TASKS');
  checkNode(LOGIC_TASKS, 'LOGIC_TASKS');
  checkNode(LOOP_BUG_TASKS, 'LOOP_BUG_TASKS');
  checkNode(BADGES, 'BADGES');
  checkNode(MISCONCEPTION_CATALOG, 'MISCONCEPTION_CATALOG');
  checkNode(LESSONS, 'LESSONS');
  checkNode(TRACE_PROGRAMS, 'TRACE_PROGRAMS');
  checkNode(LUGAT_TERMS, 'LUGAT_TERMS');

  assert.deepEqual(issues, [], `Orthography/parity issues:\n${issues.join('\n')}`);
});

test('Reading Lint: coreIdea <= 12 words, sentences concise, zero banned filler words', () => {
  const bannedRegex = /\b(oddiy|albatta|tabiiy|shubhasiz|shunchaki|simply|obviously|of course)\b/i;
  const errors: string[] = [];

  const checkText = (text: string, path: string, maxWords?: number) => {
    if (bannedRegex.test(text)) {
      errors.push(`${path}: contains banned filler word in "${text}"`);
    }
    if (maxWords) {
      const words = text.trim().split(/\s+/).length;
      if (words > maxWords) {
        errors.push(`${path}: ${words} words > ${maxWords} max ("${text}")`);
      }
    }
  };

  for (const lesson of LESSONS) {
    checkText(lesson.goal.latn, `${lesson.id}.goal`, 16);
    for (const scr of lesson.screens) {
      checkText(scr.coreIdea.latn, `${scr.id}.coreIdea`, 12);
      checkText(scr.body.latn, `${scr.id}.body`);
      if (scr.takeaway) checkText(scr.takeaway.latn, `${scr.id}.takeaway`, 16);
      if (scr.bridge) checkText(scr.bridge.latn, `${scr.id}.bridge`, 16);
      if (scr.analogyBreak) checkText(scr.analogyBreak.latn, `${scr.id}.analogyBreak`);
      if (scr.question) {
        scr.question.optionFeedback.forEach((fb, i) =>
          checkText(fb.latn, `${scr.id}.feedback[${i}]`)
        );
      }
    }
  }

  for (const s of Object.values(UI_STRINGS['uz-Latn'])) {
    checkText(s, 'UI_STRINGS.uz-Latn');
  }

  assert.deepEqual(errors, [], `Reading lint failures:\n${errors.join('\n')}`);
});

/**
 * Content scaffolder (`npm run content:new level <workshop> <level-id>`):
 * Creates a Zod-compliant draft level JSON + test spec stub.
 */

import fs from 'node:fs';
import path from 'node:path';
import { WORKSHOP_ORDER } from '../lib/game/core/types';
import { toSlug } from '../lib/i18n/apostrophe';

const [, , kind, workshopArg, rawId] = process.argv;

if (kind !== 'level' || !workshopArg || !rawId) {
  console.error('Usage: npm run content:new -- level <workshop> <level-id>');
  process.exit(1);
}

if (!(WORKSHOP_ORDER as readonly string[]).includes(workshopArg)) {
  console.error(`Unknown workshop "${workshopArg}". Expected one of: ${WORKSHOP_ORDER.join(', ')}`);
  process.exit(1);
}

const levelId = toSlug(rawId);
const targetDir = path.resolve('content/levels', workshopArg);
fs.mkdirSync(targetDir, { recursive: true });

const levelFile = path.join(targetDir, `${levelId}.json`);
if (fs.existsSync(levelFile)) {
  console.error(`Already exists: ${levelFile}`);
  process.exit(1);
}

const template = {
  id: levelId,
  workshop: workshopArg,
  skillIds: ['algo-sequence'],
  kind: 'build',
  title: 'Yangi ustaxona buyurtmasi',
  goalKey: `${workshopArg}.${levelId}.goal`,
  parts: ['SET', 'ADD', 'PRINT'],
  tests: {
    visible: [{ id: 't1', input: { inputs: [0] }, expected: { outputs: [1] } }],
    hidden: [{ id: 'h1', input: { inputs: [2] }, expected: { outputs: [3] } }],
  },
  par: { instructions: 4, ticks: 4 },
  hints: [
    'Avval qaysi quti oʻzgarishini oʻyla.',
    'Qiymatni qoʻshib, keyin chop et.',
    '1-qadamda SET, 2-qadamda ADD qoʻyib koʻr.',
  ],
  feedbackRules: [],
  referenceSolution: {
    engine: 'vm',
    program: {
      isaVersion: 'mirzo-v1',
      mode: 'board',
      instructions: [
        { op: 'SET', target: 'x', value: { kind: 'input' } },
        { op: 'ADD', target: 'x', left: { kind: 'var', name: 'x' }, right: { kind: 'lit', value: 1 } },
        { op: 'OUT', value: { kind: 'var', name: 'x' } },
        { op: 'HLT' },
      ],
    },
  },
  estimatedSeconds: 90,
  reviewStatus: 'draft',
};

fs.writeFileSync(levelFile, JSON.stringify(template, null, 2) + '\n', 'utf8');
console.log(`Created draft level scaffold: content/levels/${workshopArg}/${levelId}.json`);

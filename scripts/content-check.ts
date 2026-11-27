/**
 * Content & i18n CI validator (`npm run content:check`):
 * - Validates Zod schemas for content/skills.json and content/glossary/*.json
 * - Checks skill graph DAG for missing prerequisites or cycles
 * - Checks locale key parity across uz, ru, en
 * - Audits Uzbek copy for forbidden straight/curly apostrophes (' ‘ ’ ´)
 * - Checks reading-level sentence length on Uzbek glossary definitions
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  GlossaryTermSchema,
  LevelSchema,
  SkillSchema,
} from '../lib/game/content/schemas';
import {
  verifyReferenceSolution,
  type RunnableLevelSpec,
} from '../lib/game/core';
import {
  findUzbekApostropheIssues,
  isValidAsciiSlug,
  measureSentenceStats,
} from '../lib/i18n/apostrophe';
import { EN_MESSAGES } from '../lib/i18n/messages/en';
import { RU_MESSAGES } from '../lib/i18n/messages/ru';
import { UZ_MESSAGES } from '../lib/i18n/messages/uz';

const errors: string[] = [];

function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...flattenKeys(v as Record<string, unknown>, full));
    } else {
      keys.push(full);
    }
  }
  return keys.sort();
}

function collectStrings(obj: unknown): string[] {
  if (typeof obj === 'string') return [obj];
  if (Array.isArray(obj)) return obj.flatMap(collectStrings);
  if (obj && typeof obj === 'object') {
    return Object.values(obj).flatMap(collectStrings);
  }
  return [];
}

// 1. Validate locale dictionary parity
const uzKeys = flattenKeys(UZ_MESSAGES as unknown as Record<string, unknown>);
const ruKeys = flattenKeys(RU_MESSAGES as unknown as Record<string, unknown>);
const enKeys = flattenKeys(EN_MESSAGES as unknown as Record<string, unknown>);

for (const key of uzKeys) {
  if (!ruKeys.includes(key)) errors.push(`Missing RU translation key: ${key}`);
  if (!enKeys.includes(key)) errors.push(`Missing EN translation key: ${key}`);
}

// 2. Audit Uzbek dictionary apostrophes
for (const text of collectStrings(UZ_MESSAGES)) {
  const issues = findUzbekApostropheIssues(text);
  for (const issue of issues) {
    errors.push(`Forbidden apostrophe in UZ dictionary: "${issue.snippet}"`);
  }
}

// 3. Validate content/glossary/uz.json
const glossaryPath = path.resolve('content/glossary/uz.json');
const glossaryRaw: unknown = JSON.parse(fs.readFileSync(glossaryPath, 'utf8'));
if (!Array.isArray(glossaryRaw)) {
  errors.push('content/glossary/uz.json must be an array.');
} else {
  const seenSlugs = new Set<string>();
  for (const item of glossaryRaw) {
    const parsed = GlossaryTermSchema.safeParse(item);
    if (!parsed.success) {
      errors.push(`Glossary validation error: ${parsed.error.message}`);
      continue;
    }
    const term = parsed.data;
    if (seenSlugs.has(term.slug)) {
      errors.push(`Duplicate glossary slug: ${term.slug}`);
    }
    seenSlugs.add(term.slug);

    if (!isValidAsciiSlug(term.slug)) {
      errors.push(`Invalid ASCII slug in glossary: ${term.slug}`);
    }

    for (const field of [term.term, term.shortDef, term.example]) {
      const issues = findUzbekApostropheIssues(field);
      for (const issue of issues) {
        errors.push(`Forbidden apostrophe in glossary (${term.slug}): "${issue.snippet}"`);
      }
    }

    const stats = measureSentenceStats(term.shortDef);
    if (stats.avgWordsPerSentence > 14) {
      errors.push(
        `Reading-level warning in glossary (${term.slug}): avg ${stats.avgWordsPerSentence} words/sentence (> 14)`
      );
    }
  }
}

// 4. Validate content/skills.json + prerequisite DAG acyclicity
const skillsPath = path.resolve('content/skills.json');
const skillsRaw: unknown = JSON.parse(fs.readFileSync(skillsPath, 'utf8'));
if (!Array.isArray(skillsRaw)) {
  errors.push('content/skills.json must be an array.');
} else {
  const skillMap = new Map<string, string[]>();
  for (const item of skillsRaw) {
    const parsed = SkillSchema.safeParse(item);
    if (!parsed.success) {
      errors.push(`Skill validation error: ${parsed.error.message}`);
      continue;
    }
    const skill = parsed.data;
    if (skillMap.has(skill.id)) {
      errors.push(`Duplicate skill id: ${skill.id}`);
    }
    skillMap.set(skill.id, skill.prerequisites);

    for (const text of [skill.title, ...skill.misconceptions]) {
      const issues = findUzbekApostropheIssues(text);
      for (const issue of issues) {
        errors.push(`Forbidden apostrophe in skill (${skill.id}): "${issue.snippet}"`);
      }
    }
  }

  // Check missing prereqs & DFS cycle detection
  const state = new Map<string, 'visiting' | 'visited'>();
  const visit = (id: string): void => {
    const cur = state.get(id);
    if (cur === 'visited') return;
    if (cur === 'visiting') {
      errors.push(`Cycle detected in skill prerequisites involving "${id}"`);
      return;
    }
    state.set(id, 'visiting');
    const prereqs = skillMap.get(id) ?? [];
    for (const p of prereqs) {
      if (!skillMap.has(p)) {
        errors.push(`Skill "${id}" references unknown prerequisite "${p}"`);
      } else {
        visit(p);
      }
    }
    state.set(id, 'visited');
  };

  for (const id of skillMap.keys()) {
    visit(id);
  }
}

// 5. Validate content/levels/**/*.json + run referenceSolution CI harness
function collectLevelFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectLevelFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.json')) out.push(full);
  }
  return out.sort();
}

const levelFiles = collectLevelFiles(path.resolve('content/levels'));
const seenLevelIds = new Set<string>();
for (const file of levelFiles) {
  const raw: unknown = JSON.parse(fs.readFileSync(file, 'utf8'));
  const parsed = LevelSchema.safeParse(raw);
  if (!parsed.success) {
    errors.push(`Level validation error (${path.relative('.', file)}): ${parsed.error.message}`);
    continue;
  }
  const level = parsed.data;
  if (seenLevelIds.has(level.id)) {
    errors.push(`Duplicate level id: ${level.id}`);
  }
  seenLevelIds.add(level.id);

  for (const text of [level.title, ...level.hints]) {
    const issues = findUzbekApostropheIssues(text);
    for (const issue of issues) {
      errors.push(`Forbidden apostrophe in level (${level.id}): "${issue.snippet}"`);
    }
  }

  const check = verifyReferenceSolution(level as unknown as RunnableLevelSpec);
  if (!check.ok) {
    errors.push(`Reference solution failed (${level.id}): ${check.reason ?? 'unknown error'}`);
  }
}

if (errors.length > 0) {
  console.error('CONTENT CHECK FAILED:');
  for (const err of errors) console.error(` - ${err}`);
  process.exit(1);
}

console.log(
  `content:check PASSED — ${uzKeys.length} i18n keys (uz/ru/en parity), ${Array.isArray(glossaryRaw) ? glossaryRaw.length : 0} glossary terms, ${Array.isArray(skillsRaw) ? skillsRaw.length : 0} skills, ${levelFiles.length} verified levels.`
);

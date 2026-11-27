/**
 * Typed static content loaders for skills, glossary terms, W5+ levels, and lessons.
 * Imports verified JSON files directly so both Server Components and Client Islands
 * share identical validated types without runtime filesystem assumptions.
 */

import glossaryUz from '@/content/glossary/uz.json';
import w5SeqOrder from '@/content/levels/algoritm/w5-01-seq-order.json';
import w5VarAdd from '@/content/levels/algoritm/w5-var-add.json';
import w5SwapTrace from '@/content/levels/algoritm/w5-03-swap-trace.json';
import w5DiscountModify from '@/content/levels/algoritm/w5-04-discount-modify.json';
import w5PassThreshold from '@/content/levels/algoritm/w5-05-pass-threshold.json';
import w5MaxTwo from '@/content/levels/algoritm/w5-06-max-two.json';
import w5LoopGuard from '@/content/levels/algoritm/w5-loop-guard.json';
import w5CountdownModify from '@/content/levels/algoritm/w5-08-countdown-modify.json';
import w5ListPushGet from '@/content/levels/algoritm/w5-09-list-push-get.json';
import w5FuncCall from '@/content/levels/algoritm/w5-10-func-call.json';
import w5BossOmbor from '@/content/levels/algoritm/w5-10-boss-ombor.json';
import w5Sandbox from '@/content/levels/algoritm/w5-12-sandbox.json';
import w4HalfAdder from '@/content/levels/mantiq/w4-half-adder.json';
import skillsJson from '@/content/skills.json';
import type { CoreWorkshopId } from '@/lib/game/core/types';
import { LESSONS_W5, type LessonDocument } from './lessons';
import type { GlossaryTerm, LevelDef, SkillDef } from './schemas';

const ALL_SKILLS = skillsJson as SkillDef[];
const ALL_GLOSSARY = glossaryUz as GlossaryTerm[];

const ALL_LEVELS: LevelDef[] = (
  [
    w5SeqOrder,
    w5VarAdd,
    w5SwapTrace,
    w5DiscountModify,
    w5PassThreshold,
    w5MaxTwo,
    w5LoopGuard,
    w5CountdownModify,
    w5ListPushGet,
    w5FuncCall,
    w5BossOmbor,
    w5Sandbox,
    w4HalfAdder,
  ] as unknown as LevelDef[]
).sort((a, b) => (a.orderNumber ?? 99) - (b.orderNumber ?? 99));

export function getAllSkills(): readonly SkillDef[] {
  return ALL_SKILLS;
}

export function getSkillById(id: string): SkillDef | undefined {
  return ALL_SKILLS.find((s) => s.id === id);
}

export function getAllGlossaryTerms(): readonly GlossaryTerm[] {
  return ALL_GLOSSARY;
}

export function getGlossaryTermBySlug(slug: string): GlossaryTerm | undefined {
  return ALL_GLOSSARY.find((t) => t.slug === slug);
}

export function getAllLevels(): readonly LevelDef[] {
  return ALL_LEVELS;
}

export function getLevelsByWorkshop(workshop: CoreWorkshopId): LevelDef[] {
  return ALL_LEVELS.filter((l) => l.workshop === workshop);
}

export function getLevelById(id: string): LevelDef | undefined {
  return ALL_LEVELS.find((l) => l.id === id);
}

export function getAllLessons(): readonly LessonDocument[] {
  return LESSONS_W5;
}

export function getLessonsByTrack(track: CoreWorkshopId): LessonDocument[] {
  return LESSONS_W5.filter((l) => l.track === track);
}

export function getLessonBySlug(slug: string): LessonDocument | undefined {
  return LESSONS_W5.find((l) => l.slug === slug);
}

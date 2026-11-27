/**
 * Zod schemas for validated curriculum skills, glossary terms, levels, and lessons.
 */

import { z } from 'zod';
import {
  LEVEL_KINDS,
  REVIEW_STATUSES,
  WORKSHOP_ORDER,
} from '@/lib/game/core/types';
import { isValidAsciiSlug } from '@/lib/i18n/apostrophe';

export const WorkshopIdSchema = z.enum(WORKSHOP_ORDER);
export const LevelKindSchema = z.enum(LEVEL_KINDS);
export const ReviewStatusSchema = z.enum(REVIEW_STATUSES);

export const AsciiSlugSchema = z
  .string()
  .min(2)
  .max(80)
  .refine(isValidAsciiSlug, {
    message: 'Slug must be lowercase ASCII alphanumeric with hyphens and no apostrophes.',
  });

export const SkillSchema = z.object({
  id: AsciiSlugSchema,
  workshop: WorkshopIdSchema,
  title: z.string().min(2).max(120),
  prerequisites: z.array(AsciiSlugSchema),
  misconceptions: z.array(z.string().min(4).max(200)).min(1),
  levelIds: z.array(AsciiSlugSchema),
  lessonSlug: AsciiSlugSchema,
  curriculumRef: z.string().min(1).nullable(),
});

export type SkillDef = z.infer<typeof SkillSchema>;

export const GlossaryTermSchema = z.object({
  slug: AsciiSlugSchema,
  term: z.string().min(2).max(60),
  shortDef: z.string().min(10).max(220),
  example: z.string().min(6).max(220),
  workshop: WorkshopIdSchema,
  reviewStatus: ReviewStatusSchema,
});

export type GlossaryTerm = z.infer<typeof GlossaryTermSchema>;

export const FeedbackRuleSchema = z.object({
  id: z.string().min(2),
  pattern: z.string().min(1),
  misconception: z.string().min(3),
  messageKey: z.string().min(2),
});

export const TestCaseSchema = z.object({
  id: z.string().min(1),
  input: z.record(z.string(), z.unknown()),
  expected: z.record(z.string(), z.unknown()),
});

export const SeededGeneratorSchema = z.object({
  kind: z.enum(['vm-add', 'vm-max2', 'vm-sum-n']),
  count: z.number().int().min(1).max(50),
  min: z.number().int().optional(),
  max: z.number().int().optional(),
});

export const LevelSolutionCandidateSchema = z.discriminatedUnion('engine', [
  z.object({
    engine: z.literal('vm'),
    program: z.object({
      isaVersion: z.literal('mirzo-v1'),
      mode: z.enum(['board', 'register']),
      instructions: z.array(z.record(z.string(), z.unknown())),
      initialVars: z.record(z.string(), z.number()).optional(),
      initialLists: z.record(z.string(), z.array(z.number())).optional(),
      memory: z.array(z.number()).optional(),
    }),
  }),
  z.object({
    engine: z.literal('circuit'),
    circuit: z.object({
      nodes: z.array(z.record(z.string(), z.unknown())),
      wires: z.array(z.record(z.string(), z.unknown())),
    }),
  }),
  z.object({
    engine: z.literal('network'),
    topology: z.object({
      nodes: z.array(z.record(z.string(), z.unknown())),
      links: z.array(z.record(z.string(), z.unknown())),
    }),
    packets: z.array(z.record(z.string(), z.unknown())).optional(),
  }),
]);

export const WorkedStepSchema = z.object({
  instructionText: z.string().min(2),
  note: z.string().min(4),
  vars: z.record(z.string(), z.number()).optional(),
  outputs: z.array(z.number()).optional(),
});

export const PromptQuizSchema = z.object({
  question: z.string().min(4),
  options: z.array(z.string().min(1)).min(2).max(4),
  correctIndex: z.number().int().min(0),
  explanation: z.string().min(4),
});

export const LevelSchema = z.object({
  id: AsciiSlugSchema,
  workshop: WorkshopIdSchema,
  orderNumber: z.number().int().positive().optional(),
  skillIds: z.array(AsciiSlugSchema).min(1),
  kind: LevelKindSchema,
  title: z.string().min(3).max(120),
  customerName: z.string().min(2).max(80).optional(),
  goalKey: z.string().min(3),
  goalText: z.string().min(6).max(240).optional(),
  parts: z.array(z.string().min(1)),
  tests: z.object({
    visible: z.array(TestCaseSchema).min(1),
    hidden: z.array(TestCaseSchema),
    generatorSeed: z.number().int().optional(),
    generator: SeededGeneratorSchema.optional(),
  }),
  par: z.object({
    instructions: z.number().int().positive().optional(),
    ticks: z.number().int().positive().optional(),
  }),
  hints: z.tuple([z.string().min(4), z.string().min(4), z.string().min(4)]),
  hintsDisabled: z.boolean().optional(),
  feedbackRules: z.array(FeedbackRuleSchema),
  feedbackMessages: z.record(z.string(), z.string().min(4)).optional(),
  starterProgram: LevelSolutionCandidateSchema.optional(),
  workedExample: z
    .object({
      title: z.string().min(3),
      steps: z.array(WorkedStepSchema).min(1),
    })
    .optional(),
  predictPrompt: PromptQuizSchema.optional(),
  reflectQuestion: PromptQuizSchema.optional(),
  referenceSolution: LevelSolutionCandidateSchema,
  estimatedSeconds: z.number().int().min(15).max(900),
  reviewStatus: ReviewStatusSchema,
  maxTicks: z.number().int().positive().optional(),
});

export type LevelDef = z.infer<typeof LevelSchema>;

export const LessonMetaSchema = z.object({
  slug: AsciiSlugSchema,
  track: WorkshopIdSchema,
  concept: AsciiSlugSchema,
  title: z.string().min(4).max(80),
  description: z.string().min(20).max(160),
  prerequisites: z.array(AsciiSlugSchema),
  glossaryTerms: z.array(AsciiSlugSchema),
  curriculumRef: z.string().min(1).nullable(),
  reviewStatus: ReviewStatusSchema,
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type LessonMeta = z.infer<typeof LessonMetaSchema>;

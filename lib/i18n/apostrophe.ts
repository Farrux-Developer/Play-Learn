/**
 * Uzbek orthography & slug utilities (Master Brief Section 12):
 * - ʻ (U+02BB) for oʻ and gʻ
 * - ʼ (U+02BC) for tutuq belgisi (e.g. taʼlim, maʼlumot, taʼmirlash)
 * - Normalizes all apostrophe variants on input & search
 * - Strips apostrophes when generating lowercase ASCII URL slugs
 */

export const UZBEK_OKINA = '\u02BB'; // ʻ
export const UZBEK_TUTUQ = '\u02BC'; // ʼ

const ALL_APOSTROPHES_RE = /[\u0027\u02BB\u02BC\u2018\u2019\u0060\u00B4]/g;
const FORBIDDEN_APOSTROPHES_RE = /[\u0027\u2018\u2019\u0060\u00B4]/g;

/**
 * Normalizes any apostrophe variant into straight ASCII apostrophe for resilient
 * learner input/search comparison.
 */
export function normalizeUzbekInput(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(ALL_APOSTROPHES_RE, "'")
    .replace(/\s+/g, ' ');
}

/**
 * Generates stable lowercase ASCII URL slugs with Uzbek apostrophes stripped
 * (e.g., "Oʻyinlar" -> "oyinlar", "Taʼmirlash kuni" -> "tamirlash-kuni").
 */
export function toSlug(raw: string): string {
  return raw
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(ALL_APOSTROPHES_RE, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isValidAsciiSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export interface ApostropheIssue {
  index: number;
  char: string;
  snippet: string;
}

/**
 * Audits Uzbek copy outside inline backtick code spans (`...`) for forbidden
 * straight/curly apostrophes (' ‘ ’ ´).
 */
export function findUzbekApostropheIssues(text: string): ApostropheIssue[] {
  const masked = text.replace(/`[^`]*`/g, (m) => ' '.repeat(m.length));
  const issues: ApostropheIssue[] = [];
  let match: RegExpExecArray | null;
  FORBIDDEN_APOSTROPHES_RE.lastIndex = 0;
  while ((match = FORBIDDEN_APOSTROPHES_RE.exec(masked)) !== null) {
    const start = Math.max(0, match.index - 12);
    const end = Math.min(text.length, match.index + 13);
    issues.push({
      index: match.index,
      char: match[0],
      snippet: text.slice(start, end),
    });
  }
  return issues;
}

/**
 * Checks reading-level simplicity (target average sentence length <= 14 words).
 */
export function measureSentenceStats(text: string): {
  sentenceCount: number;
  wordCount: number;
  avgWordsPerSentence: number;
} {
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length === 0) {
    return { sentenceCount: 0, wordCount: 0, avgWordsPerSentence: 0 };
  }
  const words = sentences
    .join(' ')
    .split(/\s+/)
    .filter(Boolean);
  return {
    sentenceCount: sentences.length,
    wordCount: words.length,
    avgWordsPerSentence: Number((words.length / sentences.length).toFixed(2)),
  };
}

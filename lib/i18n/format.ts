/**
 * Lightweight zero-dependency ICU message, plural, number, and date formatter
 * backed by native Intl APIs (< 2 KB gz, Server & Client safe).
 */

import { resolveIntlLocale, type Locale, type ScriptVariant } from './types';

export type MessageValues = Record<string, string | number>;

function selectPluralBranch(
  branchesRaw: string,
  count: number,
  locale: Locale
): string {
  const rule = new Intl.PluralRules(resolveIntlLocale(locale)).select(count);
  const branches: Record<string, string> = {};
  const tokenRe = /(zero|one|two|few|many|other|=\d+)\s*\{([^}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = tokenRe.exec(branchesRaw)) !== null) {
    const key = m[1];
    const body = m[2];
    if (key !== undefined && body !== undefined) {
      branches[key] = body;
    }
  }

  const exactKey = `=${count}`;
  const chosen = branches[exactKey] ?? branches[rule] ?? branches.other ?? '';
  return chosen.replace(/#/g, String(count));
}

/**
 * Formats ICU-style templates supporting:
 * - Simple placeholders: "Salom, {name}!"
 * - Plural blocks: "{count, plural, one {# ta savol} other {# ta savol}}"
 */
export function formatMessage(
  template: string,
  values: MessageValues = {},
  locale: Locale = 'uz'
): string {
  const withPlurals = template.replace(
    /\{(\w+),\s*plural,\s*((?:[^{}]|\{[^}]*\})*)\}/g,
    (_full, key: string, branches: string) => {
      const val = Number(values[key] ?? 0);
      return selectPluralBranch(branches, Number.isFinite(val) ? val : 0, locale);
    }
  );

  return withPlurals.replace(/\{(\w+)\}/g, (_full, key: string) => {
    const val = values[key];
    return val === undefined ? `{${key}}` : String(val);
  });
}

export function formatNumber(
  value: number,
  locale: Locale = 'uz',
  script: ScriptVariant = 'latn'
): string {
  return new Intl.NumberFormat(resolveIntlLocale(locale, script)).format(value);
}

export function formatDate(
  date: Date | number,
  locale: Locale = 'uz',
  script: ScriptVariant = 'latn'
): string {
  return new Intl.DateTimeFormat(resolveIntlLocale(locale, script), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

const PSEUDO_MAP: Record<string, string> = {
  a: 'à',
  e: 'ë',
  i: 'ï',
  o: 'ô',
  u: 'ü',
  A: 'À',
  E: 'Ë',
  I: 'Ï',
  O: 'Ô',
  U: 'Ü',
};

/**
 * Pseudo-localization helper (~35% length expansion) to detect layout overflow in CI
 * while keeping ICU placeholders intact.
 */
export function toPseudoLocale(input: string): string {
  let out = '';
  let depth = 0;
  for (const ch of input) {
    if (ch === '{') depth += 1;
    if (depth > 0) {
      out += ch;
    } else {
      out += PSEUDO_MAP[ch] ?? ch;
    }
    if (ch === '}' && depth > 0) depth -= 1;
  }
  return `[!! ${out} ~~~~ !!]`;
}

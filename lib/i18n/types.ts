/**
 * Internationalization types supporting Uzbek Latin (default), Russian, and English,
 * with explicit ScriptVariant slot so uz-Cyrl can be enabled without refactoring.
 */

export const SUPPORTED_LOCALES = ['uz', 'ru', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'uz';

export type ScriptVariant = 'latn' | 'cyrl';

export function isSupportedLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function resolveIntlLocale(locale: Locale, script: ScriptVariant = 'latn'): string {
  if (locale === 'uz') {
    return script === 'cyrl' ? 'uz-Cyrl-UZ' : 'uz-Latn-UZ';
  }
  if (locale === 'ru') return 'ru-RU';
  return 'en-US';
}

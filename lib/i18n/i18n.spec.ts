import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  findUzbekApostropheIssues,
  isValidAsciiSlug,
  measureSentenceStats,
  normalizeUzbekInput,
  toSlug,
} from './apostrophe';
import { formatMessage, toPseudoLocale } from './format';

describe('Uzbek orthography & slug normalization', () => {
  it('normalizes every apostrophe variant for input comparison', () => {
    expect(normalizeUzbekInput("  O'yna  va  o‘zing  oʻrgan  ")).toBe(
      "o'yna va o'zing o'rgan"
    );
    expect(normalizeUzbekInput("Ta'lim taʼlim ta`lim")).toBe(
      "ta'lim ta'lim ta'lim"
    );
  });

  it('strips apostrophes and generates lowercase ASCII slugs', () => {
    expect(toSlug('Oʻyinlar')).toBe('oyinlar');
    expect(toSlug('Taʼmirlash kuni')).toBe('tamirlash-kuni');
    expect(toSlug('Oʻzgaruvchi va Xotira!')).toBe('ozgaruvchi-va-xotira');
    expect(isValidAsciiSlug(toSlug('Gʻildirak 2'))).toBe(true);
  });

  it('flags forbidden straight/curly apostrophes outside code spans', () => {
    expect(findUzbekApostropheIssues('Oʻyna va oʻrgan — taʼlim')).toEqual([]);
    expect(findUzbekApostropheIssues("Kodni `x = 'a'` yoz")).toEqual([]);
    expect(findUzbekApostropheIssues("O'yna").length).toBe(1);
    expect(findUzbekApostropheIssues('o‘zing').length).toBe(1);
  });

  it('measures reading-level sentence averages', () => {
    const stats = measureSentenceStats('Bu oddiy gap. Ikkinchi qisqa gap ham bor.');
    expect(stats.sentenceCount).toBe(2);
    expect(stats.avgWordsPerSentence).toBeLessThanOrEqual(14);
  });

  it('satisfies fast-check idempotence and ASCII slug invariants', () => {
    fc.assert(
      fc.property(fc.string(), (raw) => {
        const once = normalizeUzbekInput(raw);
        const twice = normalizeUzbekInput(once);
        expect(twice).toBe(once);

        const slug = toSlug(raw);
        if (slug.length > 0) {
          expect(isValidAsciiSlug(slug)).toBe(true);
          expect(slug).not.toMatch(/[\u0027\u02BB\u02BC\u2018\u2019]/);
        }
      })
    );
  });
});

describe('ICU message & plural formatter', () => {
  it('selects Russian and English plural rules properly', () => {
    const ruTpl =
      '{count, plural, =0 {Нет} one {# навык} few {# навыка} many {# навыков} other {# навыка}}';
    expect(formatMessage(ruTpl, { count: 0 }, 'ru')).toBe('Нет');
    expect(formatMessage(ruTpl, { count: 1 }, 'ru')).toBe('1 навык');
    expect(formatMessage(ruTpl, { count: 3 }, 'ru')).toBe('3 навыка');
    expect(formatMessage(ruTpl, { count: 5 }, 'ru')).toBe('5 навыков');

    const enTpl = '{count, plural, one {# skill} other {# skills}}';
    expect(formatMessage(enTpl, { count: 1 }, 'en')).toBe('1 skill');
    expect(formatMessage(enTpl, { count: 4 }, 'en')).toBe('4 skills');
  });

  it('preserves placeholders during pseudo-localization', () => {
    const out = toPseudoLocale('Salom {name}, {count} ta yulduz');
    expect(out).toContain('{name}');
    expect(out).toContain('{count}');
    expect(out.length).toBeGreaterThan(30);
  });
});

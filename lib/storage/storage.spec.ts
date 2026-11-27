import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  decodeShortCode,
  encodeShortCode,
  exportBackupJson,
  importBackupJson,
} from './backup';
import { migrateFromV1 } from './migrations';
import { createDefaultProgressV2 } from './schema';

describe('Storage migrations and backup export/import', () => {
  it('migrates legacy v1 localStorage state cleanly to ProgressV2', () => {
    const v2 = migrateFromV1(
      {
        xp: 85,
        streak: 3,
        soundEnabled: true,
        subtitlesEnabled: false,
        surfaceMode: 'blueprint',
        completedLessons: ['L1', 'L2'],
        unlockedWorkshops: ['algoritmlar', 'mantiq'],
        solvedTasks: ['alg-1'],
      },
      5000
    );

    expect(v2.schemaVersion).toBe(2);
    expect(v2.xp).toBe(85);
    expect(v2.streak).toBe(3);
    expect(v2.settings.soundEnabled).toBe(true);
    expect(v2.settings.subtitlesEnabled).toBe(false);
    expect(v2.settings.surfaceMode).toBe('blueprint');
    expect(v2.unlockedWorkshops).toContain('mantiq');
    expect(v2.unlockedWorkshops).toContain('algoritm');
    expect(v2.solvedLegacyTasks).toEqual(['alg-1']);
  });

  it('rejects tampered backup short codes via CRC32 check', () => {
    const base = createDefaultProgressV2(1000);
    base.profile.nickname = 'Azizbek';
    base.xp = 140;
    const code = encodeShortCode(base);
    const decoded = decodeShortCode(code, 2000);
    expect(decoded.profile.nickname).toBe('Azizbek');
    expect(decoded.xp).toBe(140);

    const tampered = code.slice(0, -1) + (code.endsWith('0') ? '1' : '0');
    expect(() => decodeShortCode(tampered, 2000)).toThrow();
  });

  it('round-trips arbitrary valid ProgressV2 payloads through JSON and short codes', () => {
    fc.assert(
      fc.property(
        fc.record({
          nickname: fc.string({ maxLength: 20 }),
          xp: fc.integer({ min: 0, max: 5000 }),
          streak: fc.integer({ min: 0, max: 100 }),
          locale: fc.constantFrom('uz' as const, 'ru' as const, 'en' as const),
          dyslexia: fc.boolean(),
        }),
        (sample) => {
          const base = createDefaultProgressV2(1234);
          base.profile.nickname = sample.nickname;
          base.xp = sample.xp;
          base.streak = sample.streak;
          base.settings.locale = sample.locale;
          base.settings.dyslexiaFont = sample.dyslexia;

          const fromJson = importBackupJson(exportBackupJson(base), 1234);
          expect(fromJson).toEqual(base);

          const fromCode = decodeShortCode(encodeShortCode(base), 1234);
          expect(fromCode).toEqual(base);
        }
      )
    );
  });
});

/**
 * Pure deterministic evaluators for W1 (IPO), W2 (Bits/Bytes), W3 (Text/Pixels/RLE),
 * and W8 (Safety, Caesar Cipher, Data Table, AI Bias).
 * Zero React, DOM, or external dependencies.
 */

export type WorkshopPuzzleMode = 'ipo' | 'bits' | 'encoding' | 'cyber-ai';

export type WorkshopPuzzleCandidate =
  | {
      engine: 'workshop';
      mode: 'ipo';
      slots: Record<string, string>;
      powerOff?: boolean;
      folderPath?: string;
    }
  | {
      engine: 'workshop';
      mode: 'bits';
      bits: number[];
      targetUnit?: string;
    }
  | {
      engine: 'workshop';
      mode: 'encoding';
      submode: 'text' | 'pixels' | 'rle';
      codes?: number[];
      text?: string;
      pixels?: number[];
      rle?: string;
    }
  | {
      engine: 'workshop';
      mode: 'cyber-ai';
      submode: 'phish' | 'caesar' | 'table' | 'ai-bias';
      flaggedIds?: string[];
      shift?: number;
      ciphertext?: string;
      plaintext?: string;
      filterMin?: number;
      sortOrder?: 'asc' | 'desc';
      selectedSamples?: Record<string, number>;
    };

export interface WorkshopEvalResult {
  passed: boolean;
  actual: Record<string, unknown>;
  errorCode: string | null;
}

export function bitsToDecimal(bits: readonly number[]): number {
  let acc = 0;
  for (let i = 0; i < bits.length; i += 1) {
    if (bits[i]) {
      acc += 1 << (bits.length - 1 - i);
    }
  }
  return acc;
}

export function decimalToBits(value: number, width = 8): number[] {
  const safe = Math.max(0, Math.floor(value));
  const out: number[] = [];
  for (let i = width - 1; i >= 0; i -= 1) {
    out.push((safe >> i) & 1);
  }
  return out;
}

export function encodeCodepoints(text: string): number[] {
  const out: number[] = [];
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (cp !== undefined) out.push(cp);
  }
  return out;
}

export function decodeCodepoints(codes: readonly number[]): string {
  try {
    return String.fromCodePoint(...codes.filter((c) => c >= 0 && c <= 0x10ffff));
  } catch {
    return '';
  }
}

export function expandRle(rle: string): string {
  const clean = rle.trim().toUpperCase();
  let out = '';
  const re = /(\d+)([A-Z])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(clean)) !== null) {
    const count = Math.min(64, Number(m[1] ?? 0));
    const ch = m[2] ?? '';
    out += ch.repeat(count);
  }
  return out;
}

export function shiftCaesar(text: string, shift: number): string {
  const s = ((shift % 26) + 26) % 26;
  let out = '';
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      out += String.fromCharCode(((code - 65 + s) % 26) + 65);
    } else if (code >= 97 && code <= 122) {
      out += String.fromCharCode(((code - 97 + s) % 26) + 97);
    } else {
      out += ch;
    }
  }
  return out;
}

function sameArray(a: readonly unknown[], b: readonly unknown[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function evaluateWorkshopPuzzle(
  candidate: WorkshopPuzzleCandidate,
  input: Record<string, unknown>,
  expected: Record<string, unknown>
): WorkshopEvalResult {
  if (candidate.mode === 'ipo') {
    const expSlots = expected['slots'];
    let passed = true;
    if (expSlots && typeof expSlots === 'object' && !Array.isArray(expSlots)) {
      for (const [k, v] of Object.entries(expSlots as Record<string, unknown>)) {
        if (candidate.slots[k] !== v) {
          passed = false;
          break;
        }
      }
    }
    if (passed && typeof expected['powerOff'] === 'boolean') {
      passed = Boolean(candidate.powerOff) === expected['powerOff'];
    }
    if (passed && typeof expected['folderPath'] === 'string') {
      passed =
        (candidate.folderPath ?? '').trim().toLowerCase() ===
        expected['folderPath'].trim().toLowerCase();
    }
    return {
      passed,
      actual: {
        slots: candidate.slots,
        powerOff: Boolean(candidate.powerOff),
        folderPath: candidate.folderPath ?? '',
      },
      errorCode: passed ? null : 'ipo_mismatch',
    };
  }

  if (candidate.mode === 'bits') {
    const dec = bitsToDecimal(candidate.bits);
    let passed = true;
    if (typeof expected['decimal'] === 'number') {
      passed = dec === expected['decimal'];
    }
    if (passed && Array.isArray(expected['bits'])) {
      passed = sameArray(candidate.bits, expected['bits']);
    }
    if (passed && typeof expected['unit'] === 'string') {
      passed = candidate.targetUnit === expected['unit'];
    }
    return {
      passed,
      actual: {
        decimal: dec,
        bits: candidate.bits,
        unit: candidate.targetUnit ?? null,
      },
      errorCode: passed ? null : 'bit_mismatch',
    };
  }

  if (candidate.mode === 'encoding') {
    if (candidate.submode === 'text') {
      const decoded = candidate.codes
        ? decodeCodepoints(candidate.codes)
        : candidate.text ?? '';
      const encoded = candidate.text
        ? encodeCodepoints(candidate.text)
        : candidate.codes ?? [];
      let passed = true;
      if (typeof expected['text'] === 'string') {
        passed = decoded === expected['text'];
      }
      if (passed && Array.isArray(expected['codes'])) {
        passed = sameArray(encoded, expected['codes']);
      }
      return {
        passed,
        actual: { text: decoded, codes: encoded },
        errorCode: passed ? null : 'encoding_mismatch',
      };
    }

    if (candidate.submode === 'pixels') {
      const pixels = candidate.pixels ?? [];
      let passed = true;
      if (Array.isArray(expected['pixels'])) {
        passed = sameArray(pixels, expected['pixels']);
      }
      if (passed && typeof expected['onCount'] === 'number') {
        const count = pixels.filter((p) => p > 0).length;
        passed = count === expected['onCount'];
      }
      return {
        passed,
        actual: { pixels, onCount: pixels.filter((p) => p > 0).length },
        errorCode: passed ? null : 'pixel_mismatch',
      };
    }

    // RLE compression
    const expanded = expandRle(candidate.rle ?? '');
    let passed = true;
    if (typeof expected['expanded'] === 'string') {
      passed = expanded === expected['expanded'];
    }
    if (passed && typeof expected['rle'] === 'string') {
      passed =
        (candidate.rle ?? '').trim().toUpperCase() ===
        expected['rle'].trim().toUpperCase();
    }
    return {
      passed,
      actual: { rle: candidate.rle ?? '', expanded },
      errorCode: passed ? null : 'rle_mismatch',
    };
  }

  // cyber-ai
  if (candidate.submode === 'phish') {
    const got = [...(candidate.flaggedIds ?? [])].sort();
    const exp = Array.isArray(expected['flaggedIds'])
      ? [...(expected['flaggedIds'] as string[])].sort()
      : [];
    const passed = sameArray(got, exp);
    return {
      passed,
      actual: { flaggedIds: got },
      errorCode: passed ? null : 'phish_mismatch',
    };
  }

  if (candidate.submode === 'caesar') {
    const raw =
      typeof input['ciphertext'] === 'string'
        ? input['ciphertext']
        : candidate.ciphertext ?? candidate.plaintext ?? '';
    const out = shiftCaesar(raw, candidate.shift ?? 0);
    let passed = true;
    if (typeof expected['plaintext'] === 'string') {
      passed = out === expected['plaintext'];
    }
    if (passed && typeof expected['ciphertext'] === 'string') {
      passed = out === expected['ciphertext'];
    }
    return {
      passed,
      actual: { output: out, shift: candidate.shift ?? 0 },
      errorCode: passed ? null : 'cipher_mismatch',
    };
  }

  if (candidate.submode === 'table') {
    const rows = Array.isArray(input['rows'])
      ? (input['rows'] as { id: string; score: number }[])
      : [];
    const minVal = candidate.filterMin ?? 0;
    const filtered = rows.filter((r) => r.score >= minVal);
    filtered.sort((a, b) =>
      candidate.sortOrder === 'asc' ? a.score - b.score : b.score - a.score
    );
    const ids = filtered.map((r) => r.id);
    const expIds = Array.isArray(expected['ids']) ? expected['ids'] : [];
    const passed = sameArray(ids, expIds);
    return {
      passed,
      actual: { ids },
      errorCode: passed ? null : 'table_mismatch',
    };
  }

  // ai-bias
  const counts = Object.values(candidate.selectedSamples ?? {});
  const total = counts.reduce((a, b) => a + b, 0);
  const minCount = counts.length > 0 ? Math.min(...counts) : 0;
  const maxCount = counts.length > 0 ? Math.max(...counts) : 1;
  const ratio = maxCount > 0 ? minCount / maxCount : 0;
  const minTotal = typeof expected['minTotal'] === 'number' ? expected['minTotal'] : 6;
  const minRatio = typeof expected['minRatio'] === 'number' ? expected['minRatio'] : 0.7;
  const passed = total >= minTotal && ratio >= minRatio && counts.length >= 2;
  return {
    passed,
    actual: { total, balanceRatio: Number(ratio.toFixed(2)) },
    errorCode: passed ? null : 'ai_bias_imbalance',
  };
}
